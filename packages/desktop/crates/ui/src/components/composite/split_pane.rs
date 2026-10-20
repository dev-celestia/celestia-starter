//! Split pane — two-pane layout with a visual divider.
//!
//! For interactive resizing, prefer [`ResizableSplit`](super::resizable_split::ResizableSplit)
//! or [`ResizablePanelGroup`](crate::components::primitive::resizable::ResizablePanelGroup).
//! This composite is the fixed-ratio shell used when a simple side-by-side or
//! stacked split is enough.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Axis, ElementId, InteractiveElement as _, IntoElement, ParentElement, Pixels,
    Refineable as _, RenderOnce, StyleRefinement, Styled, Window, div, px, relative,
};

use crate::theme::ActiveTheme as _;

/// A primary + secondary pane pair separated by a hairline.
#[derive(IntoElement)]
pub struct SplitPane {
    id: ElementId,
    style: StyleRefinement,
    axis: Axis,
    /// Size of the leading pane; trailing takes the remainder.
    leading_size: Pixels,
    leading: Option<AnyElement>,
    trailing: Option<AnyElement>,
}

impl SplitPane {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            axis: Axis::Horizontal,
            leading_size: px(240.0),
            leading: None,
            trailing: None,
        }
    }

    pub fn axis(mut self, axis: Axis) -> Self {
        self.axis = axis;
        self
    }

    pub fn horizontal(mut self) -> Self {
        self.axis = Axis::Horizontal;
        self
    }

    pub fn vertical(mut self) -> Self {
        self.axis = Axis::Vertical;
        self
    }

    pub fn leading_size(mut self, size: impl Into<Pixels>) -> Self {
        self.leading_size = size.into();
        self
    }

    pub fn leading(mut self, child: impl IntoElement) -> Self {
        self.leading = Some(child.into_any_element());
        self
    }

    pub fn trailing(mut self, child: impl IntoElement) -> Self {
        self.trailing = Some(child.into_any_element());
        self
    }
}

impl Styled for SplitPane {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SplitPane {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let horizontal = matches!(self.axis, Axis::Horizontal);

        let mut root = div()
            .id(self.id)
            .w_full()
            .h_full()
            .flex()
            .when(horizontal, |this| this.flex_row())
            .when(!horizontal, |this| this.flex_col())
            .overflow_hidden()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background);
        root.style().refine(&self.style);

        root.child(
            div()
                .when(horizontal, |this| {
                    this.w(self.leading_size).h_full().flex_none()
                })
                .when(!horizontal, |this| {
                    this.h(self.leading_size).w_full().flex_none()
                })
                .overflow_hidden()
                .when_some(self.leading, |this, child| this.child(child)),
        )
        .child(
            div()
                .flex_none()
                .bg(theme.border)
                .when(horizontal, |this| this.w(px(1.0)).h_full())
                .when(!horizontal, |this| this.h(px(1.0)).w_full()),
        )
        .child(
            div()
                .flex_1()
                .min_w_0()
                .min_h_0()
                .w(relative(1.0))
                .overflow_hidden()
                .when_some(self.trailing, |this, child| this.child(child)),
        )
    }
}
