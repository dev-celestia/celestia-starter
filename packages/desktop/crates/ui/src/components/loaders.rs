//! Cell loaders — the pulse wave, gradient matrix spinner, mini activity
//! glyph and radial progress ring, ported from `reference/zeron`
//! (`crates/ui/src/loaders.rs`).
//!
//! All motion routes through [`crate::motion`]: per-cell phase comes from pure
//! math there, and the shared ~30fps pulse clock keeps every mounted loader
//! phase-locked while parking entirely when the last one unmounts. Cells
//! animate inside fixed-size slots — opacity and inner size are paint-local
//! and never move surrounding layout. Reduced motion snaps every cell to its
//! rest state (gpui `reduce_motion`); activity grids retain a static rest
//! brightness instead of the chase.

use gpui_kit::{
    AnyElement, App, AppContext as _, Entity, EntityId, FontWeight, Hsla, IntoElement,
    ParentElement, PathBuilder, Render, RenderOnce, SharedString, StyleRefinement, Styled as _,
    Window, canvas, div, point, px,
};

use gpui_kit::component::ActiveTheme;

use crate::motion::{
    self, GSPIN_DIM, MATRIX_SIDE, PULSE, PULSE_CELLS, PULSE_STAGGER, gspin_cell_phase,
    pulse_opacity, pulse_scale, staggered_phase,
};
use crate::palette;

/// The pulse wave loader: a row of [`PULSE_CELLS`] round cells pulsing opacity
/// 0.08→1 / scale 0.9→1 over [`PULSE`]'s 2.4s period with a 0.15s stagger per
/// cell, tinted with the theme foreground. Animation state rides the `view`'s
/// lease on the shared pulse clock, so every mounted loader stays phase-locked.
pub fn pulse_loader(cell_px: f32, view: EntityId, cx: &mut App) -> impl IntoElement {
    pulse_loader_tinted(cell_px, cx.theme().foreground, view, cx)
}

/// [`pulse_loader`] with an explicit tint (zeron's loaders color off the theme
/// text; a tinted variant lets call sites keep the same motion off an accent).
pub fn pulse_loader_tinted(cell_px: f32, color: Hsla, view: EntityId, cx: &mut App) -> impl IntoElement {
    let slot = cell_px;
    let delta = motion::pulse_delta(&PULSE, view, cx);
    div()
        .flex()
        .flex_row()
        .items_center()
        .gap(px(slot / 2.0))
        .children((0..PULSE_CELLS).map(move |i| {
            // Fixed slot; the animated cell breathes inside it.
            div()
                .size(px(slot))
                .flex()
                .items_center()
                .justify_center()
                .child({
                    let phase = staggered_phase(delta, i, PULSE_STAGGER);
                    div()
                        .rounded(px(slot / 4.0))
                        .bg(color)
                        .opacity(pulse_opacity(phase))
                        .size(px(slot * pulse_scale(phase)))
                })
        }))
}

/// The gradient matrix spinner: a 3×3 grid of round cells tinted per row from
/// the brand ramp (`brand → brand_deep`). Each cell pulses opacity once per
/// [`GRADIENT_SPIN`] period (750ms); the per-cell phase follows
/// [`gspin_cell_phase`], so the pulse enters at the bottom edge and converges
/// toward the top-centre cell — the wave reads as travelling upward.
pub fn gradient_spinner(cell_px: f32, view: EntityId, cx: &mut App) -> impl IntoElement {
    let brand = palette(cx).brand();
    let brand_deep = palette(cx).brand_deep();
    let row_tints = [
        brand,
        motion::mix(brand, brand_deep, 0.5),
        brand_deep,
    ];
    let pulse = motion::activity_pulse_slow(view, cx);
    div()
        .flex()
        .flex_col()
        .gap(px(cell_px / 2.0))
        .children((0..MATRIX_SIDE).map(move |row| {
            let tint = row_tints[row];
            div()
                .flex()
                .flex_row()
                .gap(px(cell_px / 2.0))
                .children((0..MATRIX_SIDE).map(move |col| {
                    div()
                        .size(px(cell_px))
                        .rounded(px(cell_px / 2.0))
                        .bg(tint)
                        .opacity(pulse.opacity(gspin_cell_phase(row, col), GSPIN_DIM))
                }))
        }))
}

/// A 2×3 activity glyph sized for compact status slots. Brightness snakes
/// around the grid's perimeter as a tiny radial chase; `row_tints` supplies
/// one tint per row (three tints for a 3-row grid).
///
/// The cells animate inside a dedicated view so the pulse invalidation stays
/// separate from container state changes and cached sibling rows can be reused.
pub fn mini_spinner(
    key: impl Into<SharedString>,
    cell_px: f32,
    row_tints: [Hsla; 3],
) -> impl IntoElement {
    MiniSpinner {
        key: key.into(),
        cell_px,
        row_tints,
    }
}

/// Grayscale/mono variant for surfaces where an accent would pull focus (a
/// sidebar connection line): same grid, snake, and timing, one tint for all
/// rows.
pub fn mini_mono_spinner(
    key: impl Into<SharedString>,
    cell_px: f32,
    tint: Hsla,
) -> impl IntoElement {
    mini_spinner(key, cell_px, [tint; 3])
}

#[derive(IntoElement)]
struct MiniSpinner {
    key: SharedString,
    cell_px: f32,
    row_tints: [Hsla; 3],
}

impl RenderOnce for MiniSpinner {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        // The element state holds the animating view so it survives repaints;
        // the pulse clock invalidates the view (not this container), keeping
        // cached sibling rows reusable while these six cells animate.
        window.with_global_id(self.key.into(), |id, window| {
            window.with_element_state(id, |previous: Option<Entity<MiniSpinnerView>>, _| {
                let view = previous.unwrap_or_else(|| {
                    cx.new(|_| MiniSpinnerView {
                        cell_px: self.cell_px,
                        row_tints: self.row_tints,
                    })
                });
                view.update(cx, |view, cx| {
                    if view.cell_px != self.cell_px || view.row_tints != self.row_tints {
                        view.cell_px = self.cell_px;
                        view.row_tints = self.row_tints;
                        cx.notify();
                    }
                });
                (view.clone(), view)
            })
        })
        .cached(
            StyleRefinement::default()
                .w(px(self.cell_px * 2.5))
                .h(px(self.cell_px * 4.0)),
        )
    }
}

struct MiniSpinnerView {
    cell_px: f32,
    row_tints: [Hsla; 3],
}

impl Render for MiniSpinnerView {
    fn render(&mut self, _window: &mut Window, cx: &mut gpui_kit::Context<Self>) -> impl IntoElement {
        mini_spinner_cells(self.cell_px, self.row_tints, cx.entity_id(), cx)
    }
}

fn mini_spinner_cells(
    cell_px: f32,
    row_tints: [Hsla; 3],
    view: EntityId,
    cx: &mut App,
) -> impl IntoElement {
    const COLS: usize = 2;
    const ROWS: usize = 3;
    /// Clockwise ring position of each `(row, col)` cell, top-left first:
    /// (0,0) → (0,1) → (1,1) → (2,1) → (2,0) → (1,0).
    const RING: [[usize; COLS]; ROWS] = [[0, 1], [5, 2], [4, 3]];
    const RING_LEN: f32 = (COLS * ROWS) as f32;
    let pulse = motion::activity_pulse(view, cx);
    div()
        .flex()
        .flex_col()
        .gap(px(cell_px / 2.0))
        .children((0..ROWS).map(move |row| {
            let tint = row_tints[row];
            div()
                .flex()
                .flex_row()
                .gap(px(cell_px / 2.0))
                .children((0..COLS).map(move |col| {
                    let phase = RING[row][col] as f32 / RING_LEN;
                    div()
                        .size(px(cell_px))
                        .rounded(px(cell_px / 2.0))
                        .bg(tint)
                        .opacity(pulse.opacity(phase, GSPIN_DIM))
                }))
        }))
}

/// Stroke width of [`progress_ring`].
const RING_STROKE: f32 = 2.5;
/// Polyline segments for a full circle — plenty for a ≤40px ring.
const RING_SEGMENTS: f32 = 64.0;

/// Radial progress ring with the percent centered. A faint full track plus a
/// bright arc growing clockwise from 12 o'clock; gpui paths have no arc
/// primitive, so both are stroked polylines. Colors derive from `color` — pass
/// the theme foreground for chrome surfaces or white over dimmed imagery.
pub fn progress_ring(percent: u8, diameter: f32, color: Hsla) -> AnyElement {
    let frac = f32::from(percent.min(100)) / 100.0;
    let track = color.opacity(0.22);
    let fill = color.opacity(0.95);
    let ring = canvas(
        |_, _, _| (),
        move |bounds, _, window, _| {
            let center = bounds.center();
            let radius = diameter / 2.0 - RING_STROKE;
            let mut paint_arc = |sweep: f32, color: Hsla| {
                if sweep <= 0.0 {
                    return;
                }
                let steps = ((RING_SEGMENTS * sweep).ceil() as usize).max(2);
                let at = |i: usize| {
                    // Clockwise from 12 o'clock.
                    let theta = -std::f32::consts::FRAC_PI_2
                        + std::f32::consts::TAU * sweep * (i as f32 / steps as f32);
                    point(
                        center.x + px(radius * theta.cos()),
                        center.y + px(radius * theta.sin()),
                    )
                };
                let mut builder = PathBuilder::stroke(px(RING_STROKE));
                builder.move_to(at(0));
                for i in 1..=steps {
                    builder.line_to(at(i));
                }
                if let Ok(path) = builder.build() {
                    window.paint_path(path, color);
                }
            };
            paint_arc(1.0, track);
            paint_arc(frac, fill);
        },
    )
    .absolute()
    .inset_0();
    div()
        .relative()
        .size(px(diameter))
        .flex()
        .items_center()
        .justify_center()
        .child(ring)
        .child(
            div()
                .text_size(px(9.0))
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(fill)
                .child(SharedString::from(format!("{percent}%"))),
        )
        .into_any_element()
}
