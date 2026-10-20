//! ButtonGroup — joined buttons that share a border (web `button-group.tsx`).

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Axis, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// A row (or column) of joined action buttons.
///
/// Children should be buttons (or similar controls). The group draws a shared
/// border; individual buttons keep their own fill. For mutual-exclusion pressed
/// states prefer [`ToggleGroup`](crate::components::primitive::toggle::ToggleGroup).
#[derive(IntoElement)]
pub struct ButtonGroup {
    id: ElementId,
    style: StyleRefinement,
    axis: Axis,
    children: Vec<AnyElement>,
}

impl ButtonGroup {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            axis: Axis::Horizontal,
            children: Vec::new(),
        }
    }

    pub fn vertical(mut self) -> Self {
        self.axis = Axis::Vertical;
        self
    }

    pub fn axis(mut self, axis: Axis) -> Self {
        self.axis = axis;
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for ButtonGroup {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ButtonGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ButtonGroup {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let horizontal = matches!(self.axis, Axis::Horizontal);

        let mut root = div()
            .id(self.id)
            .flex()
            .when(horizontal, |this| this.flex_row().items_stretch())
            .when(!horizontal, |this| this.flex_col().items_stretch())
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .overflow_hidden()
            .bg(theme.background);
        root.style().refine(&self.style);

        let len = self.children.len();
        root.children(self.children.into_iter().enumerate().map(|(ix, child)| {
            let is_last = ix + 1 == len;
            div()
                .flex()
                .items_center()
                .when(horizontal, |this| this.flex_row())
                .when(!horizontal, |this| this.flex_col())
                .when(horizontal && !is_last, |this| {
                    this.border_r_1().border_color(theme.border)
                })
                .when(!horizontal && !is_last, |this| {
                    this.border_b_1().border_color(theme.border)
                })
                .child(child)
        }))
    }
}

/// Muted label segment inside a [`ButtonGroup`] (web `ButtonGroupText`).
#[derive(IntoElement)]
pub struct ButtonGroupText {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ButtonGroupText {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ButtonGroupText {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ButtonGroupText {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ButtonGroupText {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ButtonGroupText {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0))
            .px(px(10.0))
            .bg(theme.muted)
            .text_xs()
            .text_color(theme.muted_foreground);
        root.style().refine(&self.style);
        root.children(self.children)
    }
}
