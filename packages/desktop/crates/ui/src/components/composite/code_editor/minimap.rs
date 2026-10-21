//! Code-editor minimap — a shrunken copy of the buffer with a draggable
//! viewport slider, in the spirit of Monaco / VS Code.
//!
//! The strip is not a bar chart of line lengths: every source line is scanned
//! into runs of *ink* (comments, strings, numbers, keywords, calls, types,
//! punctuation) and each run is painted as a small rectangle at its own
//! column, tinted with the same syntax colours the editor highlights with. The
//! result reads as a miniature of the file — indentation steps, dense string
//! literals and long comment blocks are all recognisable at a glance.
//!
//! Two drawing regimes keep it honest for both tiny and huge files:
//!
//! * the document fits the strip — one output row per source line, so every
//!   line keeps its own shape;
//! * it does not — each pixel row stands for a band of source lines and shows
//!   the densest line in that band, which is what a compressed overview looks
//!   like in a real editor.

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use gpui::ParentElement as _;
use gpui::StatefulInteractiveElement as _;
use gpui::{
    App, BorderStyle, Bounds, Corners, Edges, Entity, Hsla, InteractiveElement as _, IntoElement,
    MouseButton, MouseDownEvent, MouseMoveEvent, MouseUpEvent, Pixels, Point, Styled, WeakEntity,
    canvas, div, fill, point, px, quad, relative, size,
};
use gpui_component::input::{EditorState, RopeExt};

mod scan;

use scan::{INK_COUNT, Ink};

pub(super) use scan::MinimapSnapshot;

use crate::theme::ActiveTheme as _;

/// Default strip width (Monaco-ish).
pub(super) const MINIMAP_WIDTH: f32 = 68.;

/// Horizontal breathing room inside the strip.
const PAD_X: f32 = 5.;
/// Tallest a single source line may render at, in px. Past this the document
/// is compressed instead of stretched, so short files keep Monaco's density.
const MAX_ROW_H: f32 = 3.;
/// Widest source column the overview tracks; longer lines are clipped.
const MAX_COLS: u16 = 260;
/// Columns a tab expands to when measuring indentation.
const TAB_COLS: u16 = 4;
/// Shortest the viewport slider may get, so a huge file still leaves a handle.
const MIN_SLIDER_H: f32 = 10.;
/// Corner radius of the slider.
const SLIDER_RADIUS: f32 = 3.;

/// One colour per [`Ink`], resolved from the same highlight theme the editor
/// itself paints with, so the overview never disagrees with the code.
struct InkPalette {
    ink: [Hsla; INK_COUNT],
}

impl InkPalette {
    fn resolve(cx: &App) -> Self {
        let theme = cx.theme();
        let highlight = gpui_component::Theme::global(cx).highlight_theme.clone();
        let base = highlight
            .style
            .editor_foreground
            .unwrap_or(theme.foreground);
        let pick = |name: &str, fallback: Hsla| {
            highlight
                .style(name)
                .and_then(|style| style.color)
                .unwrap_or(fallback)
        };

        let mut ink = [base; INK_COUNT];
        ink[Ink::Text as usize] = base.opacity(0.55);
        ink[Ink::Comment as usize] = pick("comment", theme.muted_foreground).opacity(0.5);
        ink[Ink::Str as usize] = pick("string", theme.success).opacity(0.85);
        ink[Ink::Number as usize] = pick("number", theme.info).opacity(0.8);
        ink[Ink::Keyword as usize] = pick("keyword", theme.primary).opacity(0.85);
        ink[Ink::Function as usize] = pick("function", theme.link).opacity(0.85);
        ink[Ink::Type as usize] = pick("type", theme.warning).opacity(0.85);
        ink[Ink::Punct as usize] = pick("punctuation", theme.muted_foreground).opacity(0.45);

        Self { ink }
    }
}

/// Hit-testing / drag state shared between the canvas and mouse handlers.
#[derive(Clone)]
pub(super) struct MinimapInteraction {
    bounds: Rc<RefCell<Bounds<Pixels>>>,
    dragging: Rc<Cell<bool>>,
    /// Where the pointer grabbed the slider, in px from its top.
    grab: Rc<Cell<f32>>,
    hovered: Rc<Cell<bool>>,
    view: Rc<RefCell<Option<WeakEntity<super::CodeEditor>>>>,
}

impl MinimapInteraction {
    pub(super) fn new() -> Self {
        Self {
            bounds: Rc::new(RefCell::new(Bounds::from_corners(
                point(px(0.), px(0.)),
                point(px(0.), px(0.)),
            ))),
            dragging: Rc::new(Cell::new(false)),
            grab: Rc::new(Cell::new(0.)),
            hovered: Rc::new(Cell::new(false)),
            view: Rc::new(RefCell::new(None)),
        }
    }

    /// Let the strip ask for a repaint when its own hover state changes.
    pub(super) fn attach(&self, view: WeakEntity<super::CodeEditor>) {
        *self.view.borrow_mut() = Some(view);
    }

    fn repaint(&self, cx: &mut App) {
        if let Some(view) = self.view.borrow().as_ref() {
            let _ = view.update(cx, |_, cx| cx.notify());
        }
    }

    fn set_hovered(&self, hovered: bool, cx: &mut App) {
        if self.hovered.get() != hovered {
            self.hovered.set(hovered);
            self.repaint(cx);
        }
    }
}

/// Everything the strip needs to know about where things sit, resolved once
/// per layout and reused by the mouse handlers.
#[derive(Clone, Copy)]
struct MinimapLayout {
    /// Top-left corner of the painted document.
    origin: Point<Pixels>,
    /// Height of one output row, px.
    row_h: f32,
    /// Output rows to paint; one per source line when the document fits.
    rows: usize,
    /// Width of one source column, px.
    col_w: f32,
    /// Scroll position as a 0..=1 fraction of the scrollable range.
    ratio: f32,
    /// Height of the range the slider travels over, px.
    track: f32,
    /// Height of the viewport slider, px.
    slider_h: f32,
    /// Cursor position as (row, column).
    cursor: Option<(f32, f32)>,
}

impl MinimapLayout {
    fn compute(bounds: Bounds<Pixels>, snap: &MinimapSnapshot, state: &EditorState) -> Self {
        let strip_w = f32::from(bounds.size.width);
        let strip_h = f32::from(bounds.size.height);
        let line_count = snap.line_count();
        let line_count_f = line_count as f32;

        let content_h = strip_h.min(line_count_f * MAX_ROW_H);
        let row_h = (content_h / line_count_f).max(0.05);
        let rows = if row_h >= 1. {
            line_count
        } else {
            (content_h.floor() as usize).max(1)
        };
        let col_w = ((strip_w - PAD_X * 2.).max(1.)) / (snap.max_cols() as f32);

        let line_h = state.line_height().map(f32::from).unwrap_or(16.).max(1.);
        let viewport_h = f32::from(state.input_bounds().size.height).max(1.);
        let visible = (viewport_h / line_h).min(line_count_f);
        let max_top = (line_count_f - visible).max(0.);
        let top_row = (-f32::from(state.scroll_offset().y) / line_h).clamp(0., max_top);
        let ratio = if max_top > 0. { top_row / max_top } else { 0. };

        let slider_h =
            (content_h * (visible / line_count_f)).clamp(MIN_SLIDER_H.min(content_h), content_h);
        let track = (content_h - slider_h).max(0.);

        // `offset_to_position` speaks LSP: zero-based line/character.
        let position = state.text().offset_to_position(state.cursor());
        let line = position.line as usize;
        let cursor = (line < line_count).then_some((line as f32, position.character as f32));

        Self {
            origin: point(bounds.origin.x + px(PAD_X), bounds.origin.y),
            row_h,
            rows,
            col_w,
            ratio,
            track,
            slider_h,
            cursor,
        }
    }

    /// The slider's top edge, in window coordinates.
    fn slider_top(&self) -> f32 {
        f32::from(self.origin.y) + self.ratio * self.track
    }

    /// Map a pointer y to the scroll ratio that puts the slider's top there.
    fn ratio_at(&self, pointer_y: f32) -> Option<f32> {
        if self.track <= 0. {
            return None;
        }
        let top = pointer_y - f32::from(self.origin.y);
        Some((top / self.track).clamp(0., 1.))
    }
}

/// Scroll the editor to `ratio` (0..=1) of its scrollable range.
fn scroll_to_ratio(editor: &Entity<EditorState>, ratio: f32, cx: &mut App) {
    editor.update(cx, |state, cx| {
        let line_h = state.line_height().map(f32::from).unwrap_or(16.).max(1.);
        let doc_h = state.text().lines_len().max(1) as f32 * line_h;
        let viewport_h = f32::from(state.input_bounds().size.height).max(1.);
        let max_scroll = (doc_h - viewport_h).max(0.);
        let x = state.scroll_offset().x;
        state.set_scroll_offset(point(x, px(-ratio * max_scroll)), cx);
    });
}

/// Render the right-hand minimap strip for a [`super::CodeEditor`].
pub(super) fn render_minimap(
    editor: Entity<EditorState>,
    snapshot: Rc<MinimapSnapshot>,
    interaction: MinimapInteraction,
    cx: &App,
) -> impl IntoElement {
    let theme = cx.theme();
    let bg = theme.muted.opacity(0.22);
    let border = theme.border;

    let bounds_for_down = interaction.bounds.clone();
    let bounds_for_move = interaction.bounds.clone();
    let dragging = interaction.dragging.clone();
    let dragging_move = interaction.dragging.clone();
    let dragging_up = interaction.dragging.clone();
    let grab = interaction.grab.clone();
    let grab_move = interaction.grab.clone();
    let hover_for_hover = interaction.clone();

    let editor_down = editor.clone();
    let editor_move = editor.clone();
    let snap_down = snapshot.clone();
    let snap_move = snapshot.clone();

    div()
        .id("code-editor-minimap")
        .flex_none()
        .w(px(MINIMAP_WIDTH))
        .h_full()
        .min_h_0()
        .overflow_hidden()
        .border_l_1()
        .border_color(border)
        .bg(bg)
        .cursor_pointer()
        .on_hover(move |hovered, _, cx| hover_for_hover.set_hovered(*hovered, cx))
        .on_mouse_down(MouseButton::Left, {
            let dragging = dragging.clone();
            move |event: &MouseDownEvent, _, cx| {
                let bounds = *bounds_for_down.borrow();
                if bounds.size.height <= px(0.) {
                    return;
                }
                let layout = MinimapLayout::compute(bounds, &snap_down, editor_down.read(cx));
                let pointer_y = f32::from(event.position.y);
                let top = layout.slider_top();
                // Grabbing the slider drags it; grabbing elsewhere jumps it
                // under the pointer, the way a scrollbar thumb behaves.
                let offset = if pointer_y >= top && pointer_y <= top + layout.slider_h {
                    pointer_y - top
                } else {
                    layout.slider_h * 0.5
                };
                grab.set(offset);
                dragging.set(true);
                if let Some(ratio) = layout.ratio_at(pointer_y - offset) {
                    scroll_to_ratio(&editor_down, ratio, cx);
                }
                cx.stop_propagation();
            }
        })
        .on_mouse_move({
            let dragging = dragging_move.clone();
            move |event: &MouseMoveEvent, _, cx| {
                if !dragging.get() {
                    return;
                }
                let bounds = *bounds_for_move.borrow();
                if bounds.size.height <= px(0.) {
                    return;
                }
                let layout = MinimapLayout::compute(bounds, &snap_move, editor_move.read(cx));
                if let Some(ratio) = layout.ratio_at(f32::from(event.position.y) - grab_move.get())
                {
                    scroll_to_ratio(&editor_move, ratio, cx);
                }
                cx.stop_propagation();
            }
        })
        .on_mouse_up(MouseButton::Left, {
            let dragging = dragging.clone();
            move |_: &MouseUpEvent, _, cx| {
                dragging.set(false);
                cx.stop_propagation();
            }
        })
        .on_mouse_up_out(MouseButton::Left, {
            let dragging = dragging_up.clone();
            move |_: &MouseUpEvent, _, _| dragging.set(false)
        })
        .child(
            canvas(
                {
                    let bounds_cell = interaction.bounds.clone();
                    let editor = editor.clone();
                    let snapshot = snapshot.clone();
                    move |bounds, _, cx| {
                        *bounds_cell.borrow_mut() = bounds;
                        MinimapLayout::compute(bounds, &snapshot, editor.read(cx))
                    }
                },
                move |bounds, layout, window, cx| {
                    paint_overview(bounds, layout, &snapshot, &interaction, window, cx);
                },
            )
            .size(relative(1.)),
        )
}

/// Paint the whole strip: ink runs, the cursor, then the viewport slider.
fn paint_overview(
    bounds: Bounds<Pixels>,
    layout: MinimapLayout,
    snapshot: &MinimapSnapshot,
    interaction: &MinimapInteraction,
    window: &mut gpui::Window,
    cx: &mut App,
) {
    let theme = cx.theme();
    let palette = InkPalette::resolve(cx);
    let line_count = snapshot.line_count();
    let single_row_per_line = layout.rows == line_count;
    let strip_w = f32::from(bounds.size.width);

    for row in 0..layout.rows {
        let source = if single_row_per_line {
            row
        } else {
            let start = row * line_count / layout.rows;
            let end = ((row + 1) * line_count / layout.rows)
                .max(start + 1)
                .min(line_count);
            snapshot.densest(start, end)
        };
        let Some(line) = snapshot.line(source) else {
            continue;
        };
        if line.ink == 0 {
            continue;
        }

        let y = f32::from(layout.origin.y) + row as f32 * layout.row_h;
        let height = layout.row_h.max(1.);
        for run in snapshot.runs(line) {
            let x = f32::from(layout.origin.x) + run.start as f32 * layout.col_w;
            let width = (run.len as f32 * layout.col_w).max(1.);
            window.paint_quad(fill(
                Bounds {
                    origin: point(px(x), px(y)),
                    size: size(px(width), px(height)),
                },
                palette.ink[run.ink as usize],
            ));
        }
    }

    if let Some((row, column)) = layout.cursor {
        let y = f32::from(layout.origin.y) + row * layout.row_h;
        let x = f32::from(layout.origin.x) + column * layout.col_w;
        window.paint_quad(fill(
            Bounds {
                origin: point(px(x), px(y)),
                size: size(px(2.), px(layout.row_h.max(2.))),
            },
            theme.caret.opacity(0.85),
        ));
    }

    let active = interaction.hovered.get() || interaction.dragging.get();
    let (fill_color, border_color) = if active {
        (
            theme.scrollbar_thumb_hover.opacity(0.45),
            theme.scrollbar_thumb_hover.opacity(0.85),
        )
    } else {
        (
            theme.scrollbar_thumb.opacity(0.26),
            theme.scrollbar_thumb.opacity(0.55),
        )
    };

    let slider = Bounds {
        origin: point(
            bounds.origin.x + px(1.),
            px(f32::from(bounds.origin.y) + layout.ratio * layout.track),
        ),
        size: size(px(strip_w - 2.), px(layout.slider_h)),
    };
    window.paint_quad(quad(
        slider,
        Corners::all(px(SLIDER_RADIUS)),
        fill_color,
        Edges::all(px(1.)),
        border_color,
        BorderStyle::Solid,
    ));
}

