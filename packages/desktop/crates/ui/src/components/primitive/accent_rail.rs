//! AccentRail — a vertical accent strip for list rows and callouts.

use gpui::{
    App, Hsla, IntoElement, Refineable as _, RenderOnce, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct AccentRail {
    style: StyleRefinement,
    color: Option<Hsla>,
    width: f32,
}

impl AccentRail {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            color: None,
            width: 3.0,
        }
    }

    pub fn color(mut self, color: Hsla) -> Self {
        self.color = Some(color);
        self
    }

    pub fn width(mut self, width: f32) -> Self {
        self.width = width;
        self
    }
}

impl Default for AccentRail {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for AccentRail {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for AccentRail {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .w(px(self.width))
            .h_full()
            .min_h(px(20.0))
            .rounded_full()
            .bg(self.color.unwrap_or(theme.accent));
        root.style().refine(&self.style);
        root
    }
}
