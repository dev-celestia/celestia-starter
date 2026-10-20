//! Drop indicator — accent insertion line shown between sortable rows/columns.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, Axis, IntoElement, Refineable as _, RenderOnce, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// Thin accent rule that marks where a dragged item will land.
#[derive(IntoElement)]
pub struct DropIndicator {
    style: StyleRefinement,
    axis: Axis,
    visible: bool,
}

impl DropIndicator {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            axis: Axis::Vertical,
            visible: true,
        }
    }

    /// `Axis::Vertical` draws a horizontal insert line (for vertical lists).
    /// `Axis::Horizontal` draws a vertical insert line (for horizontal lists).
    pub fn axis(mut self, axis: Axis) -> Self {
        self.axis = axis;
        self
    }

    pub fn visible(mut self, visible: bool) -> Self {
        self.visible = visible;
        self
    }
}

impl Default for DropIndicator {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for DropIndicator {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for DropIndicator {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let vertical_list = matches!(self.axis, Axis::Vertical);

        let mut root = div().when(self.visible, |this| {
            this.when(vertical_list, |this| {
                this.w_full()
                    .h(px(6.0))
                    .my(px(4.0))
                    .rounded_full()
                    .bg(theme.accent)
            })
            .when(!vertical_list, |this| {
                this.h_full()
                    .w(px(6.0))
                    .mx(px(4.0))
                    .rounded_full()
                    .bg(theme.accent)
            })
        });
        root.style().refine(&self.style);
        root
    }
}
