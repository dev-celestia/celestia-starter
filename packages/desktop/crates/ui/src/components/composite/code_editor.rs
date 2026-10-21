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
    App, AppContext as _, Context, Entity, IntoElement, ParentElement, Render, SharedString,
    Styled, Subscription, Window, div, px,
};
use gpui_component::input::{Editor, EditorState, InputEvent, RopeExt};
use gpui_component::{h_flex, v_flex};
use minimap::{MinimapInteraction, MinimapSnapshot, render_minimap};

/// Height of the editing surface, until the parent imposes its own.
const EDITOR_HEIGHT: f32 = 280.;

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
            show_minimap: true,
            minimap,
            minimap_seq: 0,
            minimap_interaction,
            _subscription: subscription,
        }
    }

    pub fn text(&self, cx: &App) -> String {
        self.editor.read(cx).text().to_string()
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
        let lines = self.line_count(cx);
        let show_minimap = self.show_minimap;

        // The strip is the editor's only chrome control, so it sits in the
        // header rather than floating over the text: a hover-revealed affordance
        // would be undiscoverable, and an always-on overlay would eat clicks
        // meant for the code underneath.
        let minimap_toggle = Button::icon(
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
        }));

        v_flex()
            .w_full()
            .border_1()
            .border_color(cx.theme().border)
            .rounded(cx.theme().radius)
            .overflow_hidden()
            .bg(cx.theme().background)
            .child(
                h_flex()
                    .w_full()
                    .items_center()
                    .justify_between()
                    .px_3()
                    .py_1p5()
                    .bg(cx.theme().muted.opacity(0.4))
                    .border_b_1()
                    .border_color(cx.theme().border)
                    .child(
                        div()
                            .text_xs()
                            .font_weight(gpui::FontWeight::MEDIUM)
                            .text_color(cx.theme().foreground)
                            .child(self.language.clone()),
                    )
                    .child(
                        h_flex()
                            .items_center()
                            .gap_1()
                            .child(
                                div()
                                    .text_xs()
                                    .font_family(cx.theme().mono_font_family.clone())
                                    .text_color(cx.theme().muted_foreground)
                                    .child(format!("{lines} lines")),
                            )
                            .child(minimap_toggle),
                    ),
            )
            // The height must land on the Editor itself: the input renders its
            // own box with `h_auto`, so a sized wrapper div never propagates in
            // and the editor collapses to a single line.
            .child(
                h_flex()
                    .w_full()
                    .min_h_0()
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .child(Editor::new(&self.editor).h(px(EDITOR_HEIGHT))),
                    )
                    .when(show_minimap, |this| {
                        // The row's height is auto, so the strip gets an explicit one
                        // instead of a percentage that would resolve against nothing.
                        this.child(div().flex_none().h(px(EDITOR_HEIGHT)).child(render_minimap(
                            self.editor.clone(),
                            self.minimap.clone(),
                            self.minimap_interaction.clone(),
                            cx,
                        )))
                    }),
            )
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
