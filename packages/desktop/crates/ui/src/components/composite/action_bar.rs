//! ActionBar — sticky footer strip for primary / secondary actions.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// A bottom action strip with optional helper text and leading/trailing slots.
#[derive(IntoElement)]
pub struct ActionBar {
    id: ElementId,
    style: StyleRefinement,
    hint: Option<SharedString>,
    leading: Vec<AnyElement>,
    trailing: Vec<AnyElement>,
    bordered: bool,
}

impl ActionBar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            hint: None,
            leading: Vec::new(),
            trailing: Vec::new(),
            bordered: true,
        }
    }

    pub fn hint(mut self, hint: impl Into<SharedString>) -> Self {
        self.hint = Some(hint.into());
        self
    }

    pub fn leading(mut self, child: impl IntoElement) -> Self {
        self.leading.push(child.into_any_element());
        self
    }

    pub fn trailing(mut self, child: impl IntoElement) -> Self {
        self.trailing.push(child.into_any_element());
        self
    }

    pub fn bordered(mut self, bordered: bool) -> Self {
        self.bordered = bordered;
        self
    }
}

impl Styled for ActionBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ActionBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_hint = self.hint.is_some();
        let mut root = div()
            .id(self.id)
            .w_full()
            .px(px(14.0))
            .py(px(10.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(10.0))
            .bg(theme.background)
            .when(self.bordered, |this| {
                this.border_t_1().border_color(theme.border)
            });
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(6.0))
                .children(self.leading),
        )
        .when_some(self.hint, |this, hint| {
            this.child(
                div()
                    .flex_1()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child(hint),
            )
        })
        .when(!has_hint, |this| this.child(div().flex_1()))
        .child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(6.0))
                .children(self.trailing),
        )
    }
}
