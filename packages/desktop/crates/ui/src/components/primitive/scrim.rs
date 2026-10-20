//! Scrim — a modal dimming overlay layer.

use gpui::{
    AnyElement, App, IntoElement, ParentElement, Refineable as _, RenderOnce, StyleRefinement,
    Styled, Window, div, relative,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct Scrim {
    style: StyleRefinement,
    opacity: f32,
    children: Vec<AnyElement>,
}

impl Scrim {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            opacity: 0.45,
            children: Vec::new(),
        }
    }

    pub fn opacity(mut self, opacity: f32) -> Self {
        self.opacity = opacity.clamp(0.0, 1.0);
        self
    }
}

impl Default for Scrim {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for Scrim {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Scrim {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Scrim {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .absolute()
            .inset_0()
            .size(relative(1.))
            .bg(theme.background.opacity(self.opacity))
            .flex()
            .items_center()
            .justify_center()
            .children(self.children);
        root.style().refine(&self.style);
        root
    }
}
