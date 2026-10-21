//! Truncate — single-line ellipsis text.

use gpui::{
    App, IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString, StyleRefinement,
    Styled, Window, div,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct Truncate {
    style: StyleRefinement,
    text: SharedString,
}

impl Truncate {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for Truncate {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Truncate {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .w_full()
            .min_w_0()
            .overflow_hidden()
            .text_ellipsis()
            .whitespace_nowrap()
            .text_sm()
            .text_color(theme.foreground)
            .child(self.text);
        root.style().refine(&self.style);
        root
    }
}
