//! Drag handle — six-dot grip used to initiate reorder / transfer drags.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, CursorStyle, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, StatefulInteractiveElement as _, StyleRefinement, Styled, Window,
    div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Visual affordance for starting a drag. Pair with
/// [`crate::components::composite::dnd::Draggable`] or attach your own
/// `on_drag` on a parent that owns the payload.
#[derive(IntoElement)]
pub struct DragHandle {
    id: ElementId,
    style: StyleRefinement,
    disabled: bool,
}

impl DragHandle {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            disabled: false,
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Styled for DragHandle {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for DragHandle {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .size(px(20.0))
            .flex()
            .flex_shrink_0()
            .items_center()
            .justify_center()
            .rounded(theme.radius_sm())
            .when(!self.disabled, |this| {
                this.cursor(CursorStyle::OpenHand)
                    .hover(|s| s.bg(theme.muted.opacity(0.7)))
                    .active(|s| s.cursor(CursorStyle::ClosedHand).bg(theme.muted))
            })
            .when(self.disabled, |this| this.opacity(0.4));
        root.style().refine(&self.style);

        root.child(
            Phosphor::new(PhosphorIcon::DotsSixVertical)
                .size(px(14.0))
                .color(if self.disabled {
                    theme.muted_foreground.opacity(0.5)
                } else {
                    theme.muted_foreground
                }),
        )
    }
}
