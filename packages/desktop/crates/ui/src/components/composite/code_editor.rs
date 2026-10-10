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
            .child(div().h(px(280.)).w_full().child(Editor::new(&self.editor)))
    }
}
