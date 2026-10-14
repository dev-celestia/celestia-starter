//! Code editor — the desktop counterpart of the web composite
//! `text-editor.tsx` (the Monaco wrapper).
//!
//! Monaco doesn't exist in GPUI; the shared editing engine's code mode does
//! the same job: `EditorState` (code layout) + tree-sitter highlighting via
//! the `tree-sitter-*` features on ``gpui-component`` (this workspace enables
//! `rust` and `markdown`). The celestia chrome — bordered surface, language
//! tag, line count — lives here.
//!
//! Like [`super::text_editor::TextEditor`], this is an entity so the footer
//! refreshes while typing.

use gpui::{
    App, AppContext as _, Context, Entity, IntoElement, ParentElement, Render, SharedString,
    Styled, Subscription, Window, div, px,
};
use gpui_component::input::{Editor, EditorState, InputEvent, RopeExt};
use gpui_component::{ActiveTheme, h_flex, v_flex};

/// A syntax-highlighted code editor for one language.
pub struct CodeEditor {
    editor: Entity<EditorState>,
    language: SharedString,
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
        let subscription = cx.subscribe(&editor, |_, _, event: &InputEvent, cx| {
            if matches!(event, InputEvent::Change) {
                cx.notify();
            }
        });
        Self {
            editor,
            language,
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

    pub fn line_count(&self, cx: &App) -> usize {
        self.editor.read(cx).text().lines_len()
    }
}

impl Render for CodeEditor {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let lines = self.line_count(cx);

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
                        div()
                            .text_xs()
                            .font_family(cx.theme().mono_font_family.clone())
                            .text_color(cx.theme().muted_foreground)
                            .child(format!("{lines} lines")),
                    ),
            )
            // The height must land on the Editor itself: the input renders its
            // own box with `h_auto`, so a sized wrapper div never propagates in
            // and the editor collapses to a single line.
            .child(Editor::new(&self.editor).h(px(280.)))
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
                        .on_prepaint(move |bounds, _, _| *fixed_height.borrow_mut() = bounds.size.height)
                        .child(Editor::new(&self.fixed).h(px(280.))),
                )
                .child(
                    div()
                        .on_prepaint(move |bounds, _, _| *bare_height.borrow_mut() = bounds.size.height)
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
        assert!(bare < px(40.), "bare editor must not collapse, got {bare:?}");
    }
}
