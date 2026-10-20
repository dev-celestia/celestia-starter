//! Resizable split — interactive two-pane layout (the drag twin of [`SplitPane`](super::split_pane::SplitPane)).
//!
//! ```ignore
//! ResizableSplit::horizontal("editor")
//!     .leading_size(px(240.))
//!     .leading(sidebar)
//!     .trailing(editor)
//! ```

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Axis, ElementId, Entity, IntoElement, ParentElement as _, Pixels,
    Refineable as _, RenderOnce, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::resizable::{
    ResizablePanelGroup, ResizableState, resizable_panel,
};
use crate::theme::ActiveTheme as _;

/// A leading + trailing pane pair with a drag handle between them.
#[derive(IntoElement)]
pub struct ResizableSplit {
    id: ElementId,
    style: StyleRefinement,
    axis: Axis,
    leading_size: Pixels,
    leading_min: Pixels,
    leading_max: Pixels,
    leading: Option<AnyElement>,
    trailing: Option<AnyElement>,
    with_handle: bool,
    state: Option<Entity<ResizableState>>,
}

impl ResizableSplit {
    pub fn horizontal(id: impl Into<ElementId>) -> Self {
        Self::new(id, Axis::Horizontal)
    }

    pub fn vertical(id: impl Into<ElementId>) -> Self {
        Self::new(id, Axis::Vertical)
    }

    fn new(id: impl Into<ElementId>, axis: Axis) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            axis,
            leading_size: px(240.),
            leading_min: px(120.),
            leading_max: px(640.),
            leading: None,
            trailing: None,
            with_handle: true,
            state: None,
        }
    }

    pub fn leading_size(mut self, size: impl Into<Pixels>) -> Self {
        self.leading_size = size.into();
        self
    }

    pub fn leading_range(mut self, min: impl Into<Pixels>, max: impl Into<Pixels>) -> Self {
        self.leading_min = min.into();
        self.leading_max = max.into();
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

    pub fn with_handle(mut self, with_handle: bool) -> Self {
        self.with_handle = with_handle;
        self
    }

    pub fn with_state(mut self, state: &Entity<ResizableState>) -> Self {
        self.state = Some(state.clone());
        self
    }
}

impl Styled for ResizableSplit {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ResizableSplit {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut group = match self.axis {
            Axis::Horizontal => ResizablePanelGroup::horizontal(self.id),
            Axis::Vertical => ResizablePanelGroup::vertical(self.id),
        }
        .with_handle(self.with_handle)
        .child(
            resizable_panel()
                .size(self.leading_size)
                .size_range(self.leading_min..self.leading_max)
                .child(
                    div()
                        .size_full()
                        .overflow_hidden()
                        .when_some(self.leading, |this, child| this.child(child)),
                ),
        )
        .child(
            resizable_panel().child(
                div()
                    .size_full()
                    .min_w_0()
                    .min_h_0()
                    .overflow_hidden()
                    .when_some(self.trailing, |this, child| this.child(child)),
            ),
        );

        if let Some(state) = &self.state {
            group = group.with_state(state);
        }

        let mut root = div()
            .size_full()
            .overflow_hidden()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background);
        root.style().refine(&self.style);
        root.child(group)
    }
}
