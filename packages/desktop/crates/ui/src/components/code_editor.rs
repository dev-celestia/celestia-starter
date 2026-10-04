//! Code editor — the desktop counterpart of the web composite
//! `text-editor.tsx` (the Monaco wrapper).
//!
//! Monaco doesn't exist in GPUI; the shared editing engine's code mode does
//! the same job: `EditorState` (code layout) + tree-sitter highlighting via
//! the `tree-sitter-*` features on `gpui-kit` (this workspace enables
//! `rust` and `markdown`). The celestia chrome — bordered surface, language
//! tag, line count — lives here.
//!
//! Like [`super::text_editor::TextEditor`], this is an entity so the footer
//! refreshes while typing.

use gpui_kit::component::input::{Editor, EditorState, InputEvent, RopeExt};
use gpui_kit::component::{ActiveTheme, h_flex, v_flex};
use gpui_kit::{
    App, AppContext as _, Context, Entity, IntoElement, ParentElement, Render, SharedString,
    Styled, Subscription, Window, div, px,
};

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
            .gap_2()
            .child(
                div()
                    .h(px(280.))
                    .w_full()
                    .bg(cx.theme().background)
                    .border_1()
                    .border_color(cx.theme().border)
                    .rounded(cx.theme().radius)
                    .overflow_hidden()
                    .child(Editor::new(&self.editor)),
            )
            .child(
                h_flex().justify_between().child(
                    div()
                        .text_xs()
                        .text_color(cx.theme().muted_foreground)
                        .child(format!("{} · {lines} lines", self.language)),
                ),
            )
    }
}
