//! RelativeTime — a muted relative timestamp label.

use gpui::{
    App, IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString, StyleRefinement,
    Styled, Window, div,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct RelativeTime {
    style: StyleRefinement,
    text: SharedString,
}

impl RelativeTime {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for RelativeTime {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for RelativeTime {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .text_xs()
            .text_color(theme.muted_foreground)
            .whitespace_nowrap()
            .child(self.text);
        root.style().refine(&self.style);
        root
    }
}
