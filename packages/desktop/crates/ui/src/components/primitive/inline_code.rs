//! InlineCode — a monospace chip for short code tokens.

use gpui::{
    App, IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString, StyleRefinement,
    Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct InlineCode {
    style: StyleRefinement,
    text: SharedString,
}

impl InlineCode {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for InlineCode {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for InlineCode {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .px(px(5.0))
            .py(px(1.0))
            .rounded(px(4.0))
            .bg(theme.muted)
            .text_xs()
            .font_family(theme.mono_font_family.clone())
            .text_color(theme.foreground)
            .child(self.text);
        root.style().refine(&self.style);
        root
    }
}
