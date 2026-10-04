//! Markdown text editor — the desktop counterpart of the web composite
//! `text-editor.tsx` / `block-text-editor` family.
//!
//! GPUI inputs are plain text, so rich text is markdown: a formatting toolbar
//! (bold, italic, strike, code, link, heading, bullet, quote) mutates the
//! buffer around the selection, and the textarea gets live syntax shapes via
//! the shared editing engine. WYSIWYG block editing with drag pills is a
//! port-on-demand follow-up.
//!
//! The component is an entity (not a `RenderOnce` element) because the footer
//! counts must refresh while typing: it subscribes to the textarea's
//! `InputEvent::Change` and re-notifies, which re-renders the whole editor.

use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use gpui_component::input::{InputEvent, Textarea, TextareaState};
use gpui_component::{ActiveTheme, h_flex, v_flex};
use gpui::{
    App, AppContext as _, Context, DefiniteLength, Entity, IntoElement, ParentElement, Render,
    SharedString, Styled, Subscription, Window, div, px,
};

/// A markdown text editor: toolbar + auto-growing textarea + word/char count.
///
/// Owns its textarea; apps embed it as an entity (`cx.new(|cx|
/// TextEditor::new(window, cx))`) and drive formatting through the toggle
/// methods (`editor.update(cx, |e, cx| e.toggle_bold(window, cx))`).
pub struct TextEditor {
    textarea: Entity<TextareaState>,
    _subscription: Subscription,
    height: Option<DefiniteLength>,
}

impl TextEditor {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let textarea = cx.new(|cx| {
            TextareaState::new(window, cx)
                .auto_grow(4, 24)
                .soft_wrap(true)
                .placeholder("Write in markdown…")
        });
        let subscription = cx.subscribe(&textarea, |_, _, event: &InputEvent, cx| {
            if matches!(event, InputEvent::Change) {
                cx.notify();
            }
        });
        Self {
            textarea,
            _subscription: subscription,
            height: Some(px(280.).into()),
        }
    }

    pub fn height(mut self, height: impl Into<DefiniteLength>) -> Self {
        self.height = Some(height.into());
        self
    }

    pub fn set_height(&mut self, height: Option<DefiniteLength>, cx: &mut Context<Self>) {
        self.height = height;
        cx.notify();
    }

    pub fn text(&self, cx: &App) -> String {
        self.textarea.read(cx).text().to_string()
    }

    pub fn set_text(&self, text: impl Into<SharedString>, window: &mut Window, cx: &mut App) {
        self.textarea
            .update(cx, |t, cx| t.replace_all(text, window, cx));
    }

    pub fn word_count(&self, cx: &App) -> usize {
        self.text(cx).split_whitespace().count()
    }

    pub fn char_count(&self, cx: &App) -> usize {
        self.text(cx).chars().count()
    }

    /// Wrap the selection (or caret) with `marker`, or unwrap it if the
    /// selection is already wrapped — bold, italic, strikethrough, code.
    pub fn toggle_wrap(&self, marker: &'static str, window: &mut Window, cx: &mut App) {
        self.textarea.update(cx, |t, cx| {
            let range = t.selected_range();
            let (start, end) = (range.start, range.end);
            let inner = t.selected_text().to_string();
            let full = t.text().to_string();
            let m = marker.len();
            let already = start >= m
                && end + m <= full.len()
                && full.get(start - m..start) == Some(marker)
                && full.get(end..end + m) == Some(marker);

            if already {
                t.set_selected_range(start - m..end + m, cx);
                t.replace(inner, window, cx);
                t.set_selected_range(start - m..end - m, cx);
            } else {
                t.replace(format!("{marker}{inner}{marker}"), window, cx);
                t.set_selected_range(start + m..end + m, cx);
            }
        });
    }

    /// Toggle `prefix` on the line under the caret — heading, bullet, quote.
    /// Operates on that single line; a multi-line selection prefixes its first.
    pub fn toggle_line_prefix(&self, prefix: &'static str, window: &mut Window, cx: &mut App) {
        self.textarea.update(cx, |t, cx| {
            let start = t.selected_range().start;
            let full = t.text().to_string();
            let line_start = full[..start].rfind('\n').map_or(0, |i| i + 1);
            let line_end = full[start..].find('\n').map_or(full.len(), |i| start + i);
            let line = &full[line_start..line_end];

            let new_line = match line.strip_prefix(prefix) {
                Some(rest) => rest.to_string(),
                None => format!("{prefix}{line}"),
            };
            t.set_selected_range(line_start..line_end, cx);
            t.replace(new_line, window, cx);
        });
    }

    /// Turn the selection into a `[label](url)` link (or insert a fresh one)
    /// and pre-select the URL placeholder for typing over.
    pub fn insert_link(&self, window: &mut Window, cx: &mut App) {
        self.textarea.update(cx, |t, cx| {
            let start = t.selected_range().start;
            let selected = t.selected_text().to_string();
            let label = if selected.is_empty() {
                "link text".to_string()
            } else {
                selected
            };
            let md = format!("[{label}](https://)");
            t.replace(md, window, cx);
            let url_start = start + 1 + label.len() + 2;
            t.set_selected_range(url_start..url_start + 8, cx);
        });
    }

    fn toggle_bold(this: &Entity<Self>, window: &mut Window, cx: &mut App) {
        this.update(cx, |e, cx| e.toggle_wrap("**", window, cx));
    }

    fn render_toolbar(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let this = cx.entity();

        let action_button =
            |id: &'static str,
             label: &'static str,
             action: fn(&Entity<Self>, &mut Window, &mut App)| {
                let this = this.clone();
                Button::new(id)
                    .variant(ButtonVariant::Ghost)
                    .size(ButtonSize::XSmall)
                    .label(label)
                    .on_click(move |_, window, cx| action(&this, window, cx))
            };

        fn toggle_italic(this: &Entity<TextEditor>, window: &mut Window, cx: &mut App) {
            this.update(cx, |e, cx| e.toggle_wrap("*", window, cx));
        }
        fn toggle_strike(this: &Entity<TextEditor>, window: &mut Window, cx: &mut App) {
            this.update(cx, |e, cx| e.toggle_wrap("~~", window, cx));
        }
        fn toggle_code(this: &Entity<TextEditor>, window: &mut Window, cx: &mut App) {
            this.update(cx, |e, cx| e.toggle_wrap("`", window, cx));
        }
        fn heading(this: &Entity<TextEditor>, window: &mut Window, cx: &mut App) {
            this.update(cx, |e, cx| e.toggle_line_prefix("## ", window, cx));
        }
        fn bullet(this: &Entity<TextEditor>, window: &mut Window, cx: &mut App) {
            this.update(cx, |e, cx| e.toggle_line_prefix("- ", window, cx));
        }
        fn quote(this: &Entity<TextEditor>, window: &mut Window, cx: &mut App) {
            this.update(cx, |e, cx| e.toggle_line_prefix("> ", window, cx));
        }
        fn link(this: &Entity<TextEditor>, window: &mut Window, cx: &mut App) {
            this.update(cx, |e, cx| e.insert_link(window, cx));
        }

        h_flex()
            .w_full()
            .gap_1()
            .flex_wrap()
            .items_center()
            .p_1()
            .bg(cx.theme().muted.opacity(0.4))
            .border_b_1()
            .border_color(cx.theme().border)
            .rounded_t(cx.theme().radius)
            .child(action_button("fmt-bold", "B", Self::toggle_bold))
            .child(action_button("fmt-italic", "I", toggle_italic))
            .child(action_button("fmt-strike", "S", toggle_strike))
            .child(action_button("fmt-code", "Code", toggle_code))
            .child(action_button("fmt-link", "Link", link))
            .child(action_button("fmt-h2", "H2", heading))
            .child(action_button("fmt-list", "List", bullet))
            .child(action_button("fmt-quote", "Quote", quote))
    }
}

impl Render for TextEditor {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let words = self.word_count(cx);
        let chars = self.char_count(cx);
        let editor_h = self.height.unwrap_or_else(|| px(280.).into());

        v_flex()
            .w_full()
            .border_1()
            .border_color(cx.theme().border)
            .rounded(cx.theme().radius)
            .overflow_hidden()
            .bg(cx.theme().background)
            .child(self.render_toolbar(cx))
            .child(
                div()
                    .w_full()
                    .h(editor_h)
                    .p_2()
                    .overflow_hidden()
                    .child(Textarea::new(&self.textarea).bordered(false).h(editor_h)),
            )
            .child(
                h_flex()
                    .w_full()
                    .justify_between()
                    .items_center()
                    .px_3()
                    .py_1p5()
                    .bg(cx.theme().muted.opacity(0.3))
                    .border_t_1()
                    .border_color(cx.theme().border)
                    .rounded_b(cx.theme().radius)
                    .child(
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child(format!("{words} words · {chars} chars")),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child("Markdown"),
                    ),
            )
    }
}
