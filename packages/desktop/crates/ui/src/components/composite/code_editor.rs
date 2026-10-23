//! Code editor — the desktop counterpart of the web composite
//! `text-editor.tsx` (the Monaco wrapper).
//!
//! Monaco doesn't exist in GPUI; the shared editing engine's code mode does
//! the same job: `EditorState` (code layout) + tree-sitter highlighting via
//! the `tree-sitter-*` features on ``gpui-component`` (this workspace enables
//! `rust` and `markdown`). The celestia chrome — bordered surface, language
//! tag, line count — lives here.
//!
//! The right-hand overview strip lives in [`minimap`].
//!
//! Like [`super::text_editor::TextEditor`], this is an entity so the footer
//! refreshes while typing.

mod minimap;

use std::rc::Rc;
use std::time::Duration;

use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::traits::Selectable as _;
use crate::theme::ActiveTheme as _;
use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, AppContext as _, Context, Entity, IntoElement, ParentElement, Pixels, Render,
    SharedString, Styled, Subscription, Window, div, px,
};
use gpui_component::input::{Editor, EditorState, InputEvent, RopeExt};
use gpui_component::{h_flex, v_flex};
use minimap::{MinimapInteraction, MinimapSnapshot, render_minimap};

/// Height of the editing surface, until the parent imposes its own.
const EDITOR_HEIGHT: f32 = 280.;

/// How the editing surface takes its height.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Height {
    /// The standalone preview height above.
    Fixed,
    /// Whatever the parent leaves over — for an editor that owns its pane.
    Fill,
}

/// How long the minimap waits for typing to pause before re-scanning the
/// buffer. The scan itself runs off the main thread, so this only trades a
/// barely visible lag for a snappy keystroke.
const MINIMAP_DEBOUNCE: Duration = Duration::from_millis(60);

/// A syntax-highlighted code editor for one language.
pub struct CodeEditor {
    editor: Entity<EditorState>,
    language: SharedString,
    /// When true, paint the overview strip on the right.
    show_minimap: bool,
    /// When true, show the footer chrome with the minimap toggle.
    /// Hosts that own their own floating controls turn this off.
    show_minimap_toggle: bool,
    /// When true, the card gets a border and rounded corners. Editors that own
    /// their pane turn this off so they sit flush in it.
    bordered: bool,
    /// Where the editing surface gets its height from.
    height: Height,
    /// Override the theme mono font size for this editor. `None` keeps the
    /// theme default (`mono_font_size`).
    font_size: Option<Pixels>,
    /// Override the theme mono font family. `None` keeps `mono_font_family`.
    font_family: Option<SharedString>,
    /// Scanned copy of the buffer the strip paints from.
    minimap: Rc<MinimapSnapshot>,
    /// Bumped per edit so only the newest queued rebuild lands.
    minimap_seq: u64,
    minimap_interaction: MinimapInteraction,
    _subscription: Subscription,
}

impl CodeEditor {
    pub fn new(
        language: impl Into<SharedString>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> Self {
        let language = language.into();
        let editor = cx.new(|cx| EditorState::new(window, cx).language(language.clone()));

        let minimap_interaction = MinimapInteraction::new();
        minimap_interaction.attach(cx.weak_entity());
        let minimap = Rc::new(MinimapSnapshot::build(editor.read(cx).text()));

        let subscription = cx.subscribe(&editor, |this, editor, event: &InputEvent, cx| {
            if matches!(event, InputEvent::Change) {
                this.schedule_minimap_rebuild(editor, cx);
            }
        });

        Self {
            editor,
            language,
            show_minimap: false,
            show_minimap_toggle: true,
            bordered: true,
            height: Height::Fixed,
            font_size: None,
            font_family: None,
            minimap,
            minimap_seq: 0,
            minimap_interaction,
            _subscription: subscription,
        }
    }

    pub fn text(&self, cx: &App) -> String {
        self.editor.read(cx).text().to_string()
    }

    /// Underlying editing engine — for hosts that install LSP providers or
    /// push diagnostics onto [`EditorState`].
    pub fn editor_state(&self) -> Entity<EditorState> {
        self.editor.clone()
    }

    pub fn set_text(&self, text: impl Into<SharedString>, window: &mut Window, cx: &mut App) {
        self.editor
            .update(cx, |e, cx| e.replace_all(text, window, cx));
    }

    pub fn language(&self) -> &str {
        &self.language
    }

    /// Switch the highlighter and the chrome's language tag.
    pub fn set_language(&mut self, language: impl Into<SharedString>, cx: &mut Context<Self>) {
        let language = language.into();
        self.language = language.clone();
        self.editor
            .update(cx, |e, cx| e.set_highlighter(language, cx));
        cx.notify();
    }

    pub fn line_count(&self, cx: &App) -> usize {
        self.editor.read(cx).text().lines_len()
    }

    /// Show or hide the overview strip (default: shown).
    pub fn set_minimap(&mut self, enabled: bool, cx: &mut Context<Self>) {
        if self.show_minimap == enabled {
            return;
        }
        self.show_minimap = enabled;
        if enabled {
            let editor = self.editor.clone();
            self.schedule_minimap_rebuild(editor, cx);
        } else {
            // The strip is unmounted, so nothing will clear a drag in flight.
            self.minimap_interaction.reset();
        }
        cx.notify();
    }

    pub fn minimap_enabled(&self) -> bool {
        self.show_minimap
    }

    /// Show or hide the footer minimap toggle (default: shown).
    pub fn set_show_minimap_toggle(&mut self, show: bool, cx: &mut Context<Self>) {
        if self.show_minimap_toggle == show {
            return;
        }
        self.show_minimap_toggle = show;
        cx.notify();
    }

    /// Override the editor's monospace font size (default: theme `mono_font_size`).
    pub fn set_font_size(&mut self, size: impl Into<Pixels>, cx: &mut Context<Self>) {
        let size = size.into();
        if self.font_size == Some(size) {
            return;
        }
        self.font_size = Some(size);
        cx.notify();
    }

    /// Clear a font-size override so the theme mono size is used again.
    pub fn clear_font_size(&mut self, cx: &mut Context<Self>) {
        if self.font_size.is_none() {
            return;
        }
        self.font_size = None;
        cx.notify();
    }

    pub fn font_size(&self) -> Option<Pixels> {
        self.font_size
    }

    /// Override the editor's monospace font family (default: theme `mono_font_family`).
    pub fn set_font_family(
        &mut self,
        family: impl Into<SharedString>,
        cx: &mut Context<Self>,
    ) {
        let family = family.into();
        if self.font_family.as_ref() == Some(&family) {
            return;
        }
        self.font_family = Some(family);
        cx.notify();
    }

    /// Clear a font-family override so the theme mono face is used again.
    pub fn clear_font_family(&mut self, cx: &mut Context<Self>) {
        if self.font_family.is_none() {
            return;
        }
        self.font_family = None;
        cx.notify();
    }

    pub fn font_family(&self) -> Option<&SharedString> {
        self.font_family.as_ref()
    }

    /// Draw the card's border and rounded corners (default: on).
    ///
    /// An editor that owns its pane turns the border off and keeps only the
    /// header tint, so the code meets the pane edges without a frame inside a
    /// frame.
    pub fn set_bordered(&mut self, bordered: bool, cx: &mut Context<Self>) {
        if self.bordered == bordered {
            return;
        }
        self.bordered = bordered;
        cx.notify();
    }

    pub fn bordered(&self) -> bool {
        self.bordered
    }

    /// Take the height from the parent instead of the fixed preview height
    /// (default: fixed).
    pub fn set_fill_height(&mut self, fill: bool, cx: &mut Context<Self>) {
        let height = if fill { Height::Fill } else { Height::Fixed };
        if self.height == height {
            return;
        }
        self.height = height;
        cx.notify();
    }

    pub fn fills_height(&self) -> bool {
        self.height == Height::Fill
    }

    /// Re-scan the buffer for the strip, off the main thread.
    ///
    /// Typing produces one edit per keystroke; each queues a rebuild that only
    /// lands if no newer edit arrived while it waited, so a fast typist pays
    /// for one scan rather than one per character.
    fn schedule_minimap_rebuild(&mut self, editor: Entity<EditorState>, cx: &mut Context<Self>) {
        if !self.show_minimap {
            return;
        }

        self.minimap_seq = self.minimap_seq.wrapping_add(1);
        let seq = self.minimap_seq;
        let text = editor.read(cx).text().clone();

        cx.spawn(async move |this, cx| {
            cx.background_executor().timer(MINIMAP_DEBOUNCE).await;
            let snapshot = cx
                .background_executor()
                .spawn(async move { MinimapSnapshot::build(&text) })
                .await;
            let _ = this.update(cx, |this, cx| {
                if this.minimap_seq == seq {
                    this.minimap = Rc::new(snapshot);
                    cx.notify();
                }
            });
        })
        .detach();
    }
}

impl Render for CodeEditor {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let show_minimap = self.show_minimap;
        let show_minimap_toggle = self.show_minimap_toggle;
        let bordered = self.bordered;
        let fill = self.height == Height::Fill;
        let font_size = self.font_size;
        let font_family = self.font_family.clone();

        v_flex()
            .w_full()
            .when(fill, |this| this.size_full().min_h_0())
            .when(bordered, |this| {
                this.border_1()
                    .border_color(cx.theme().border)
                    .rounded(cx.theme().radius)
            })
            .overflow_hidden()
            .bg(cx.theme().background)
            // The height must land on the Editor itself: the input renders its
            // own box with `h_auto`, so a sized wrapper div never propagates in
            // and the editor collapses to a single line.
            .child(
                h_flex()
                    .w_full()
                    .min_h_0()
                    // `h_flex` centers its children, so a filling editor needs
                    // the cross axis stretched before a percentage can resolve.
                    .when(fill, |this| this.flex_1().items_stretch())
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .when(fill, |this| this.h_full().min_h_0())
                            .child(
                                Editor::new(&self.editor)
                                    .bordered(bordered)
                                    .when(fill, |this| this.h_full())
                                    .when(!fill, |this| this.h(px(EDITOR_HEIGHT)))
                                    // Refine after Editor's theme mono face/size
                                    // so host overrides (Coder settings) win.
                                    .when_some(font_family, |this, family| {
                                        this.font_family(family)
                                    })
                                    .when_some(font_size, |this, size| this.text_size(size)),
                            ),
                    )
                    .when(show_minimap, |this| {
                        // A fixed-height row gives the strip an explicit height;
                        // a filling one hands it the row's.
                        let strip = if fill {
                            div().flex_none().h_full().min_h_0()
                        } else {
                            div().flex_none().h(px(EDITOR_HEIGHT))
                        };
                        this.child(strip.child(render_minimap(
                            self.editor.clone(),
                            self.minimap.clone(),
                            self.minimap_interaction.clone(),
                            cx,
                        )))
                    }),
            )
            .when(show_minimap_toggle, |this| {
                // Footer chrome when the host does not provide its own toggle.
                this.child(
                    h_flex()
                        .w_full()
                        .when(fill, |row| row.flex_none())
                        .items_center()
                        .justify_end()
                        .px_2()
                        .py_1()
                        .bg(cx.theme().muted.opacity(0.4))
                        .when(bordered, |row| {
                            row.border_t_1().border_color(cx.theme().border)
                        })
                        .child(
                            Button::icon(
                                ("code-editor-minimap-toggle", cx.entity().entity_id()),
                                Phosphor::new(PhosphorIcon::MapTrifold).size(px(14.0)),
                            )
                            .size(ButtonSize::IconSm)
                            .variant(ButtonVariant::Ghost)
                            .selected(show_minimap)
                            .accessibility_label("Toggle minimap")
                            .tooltip(if show_minimap {
                                "Hide minimap"
                            } else {
                                "Show minimap"
                            })
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.set_minimap(!this.show_minimap, cx);
                            })),
                        ),
                )
            })
    }
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;
    use std::rc::Rc;

    use super::*;
    use gpui::{Context, Pixels, Render, TestAppContext};
    use gpui_base::ElementExt as _;

    struct EditorHeights {
        fixed: Entity<EditorState>,
        bare: Entity<EditorState>,
        fixed_height: Rc<RefCell<Pixels>>,
        bare_height: Rc<RefCell<Pixels>>,
    }

    impl Render for EditorHeights {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            let fixed_height = self.fixed_height.clone();
            let bare_height = self.bare_height.clone();
            // The auto-sized wrapper hugs its editor child, so the canvas
            // bounds report exactly the height the editor laid out with.
            v_flex()
                .child(
                    div()
                        .on_prepaint(move |bounds, _, _| {
                            *fixed_height.borrow_mut() = bounds.size.height
                        })
                        .child(Editor::new(&self.fixed).h(px(280.))),
                )
                .child(
                    div()
                        .on_prepaint(move |bounds, _, _| {
                            *bare_height.borrow_mut() = bounds.size.height
                        })
                        .child(Editor::new(&self.bare)),
                )
        }
    }

    #[gpui::test]
    fn editor_height_reaches_the_input(cx: &mut TestAppContext) {
        cx.update(|cx| crate::init(cx));

        let fixed_height = Rc::new(RefCell::new(px(0.)));
        let bare_height = Rc::new(RefCell::new(px(0.)));

        let (_, cx) = cx.add_window_view(|window, cx| {
            let sample = "fn main() {\n    println!(\"hello\");\n}\n\n// five lines total\n";
            let fixed = cx.new(|cx| EditorState::new(window, cx).default_value(sample));
            let bare = cx.new(|cx| EditorState::new(window, cx).default_value(sample));
            EditorHeights {
                fixed,
                bare,
                fixed_height: fixed_height.clone(),
                bare_height: bare_height.clone(),
            }
        });

        cx.update(|window, cx| window.draw(cx).clear(cx));

        let fixed = *fixed_height.borrow();
        let bare = *bare_height.borrow();
        // An explicit height must survive to the input element itself...
        assert_eq!(fixed, px(280.), "editor with .h() must fill it exactly");
        // ...otherwise the input lays out at its one-line minimum — the
        // "1 cm tall editor" regression this guards against.
        assert!(
            bare < px(40.),
            "bare editor must not collapse, got {bare:?}"
        );
    }
}
