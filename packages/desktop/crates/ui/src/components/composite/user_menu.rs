//! UserMenu — identity trigger with name, email, and action slots.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct UserMenu {
    id: ElementId,
    style: StyleRefinement,
    name: SharedString,
    email: Option<SharedString>,
    avatar: Option<AnyElement>,
    actions: Vec<AnyElement>,
}

impl UserMenu {
    pub fn new(id: impl Into<ElementId>, name: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            name: name.into(),
            email: None,
            avatar: None,
            actions: Vec::new(),
        }
    }

    pub fn email(mut self, email: impl Into<SharedString>) -> Self {
        self.email = Some(email.into());
        self
    }

    pub fn avatar(mut self, avatar: impl IntoElement) -> Self {
        self.avatar = Some(avatar.into_any_element());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }
}

impl Styled for UserMenu {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for UserMenu {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w(px(240.0))
            .flex()
            .flex_col()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .overflow_hidden();
        root.style().refine(&self.style);
        root.child(
            div()
                .px(px(12.0))
                .py(px(10.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(10.0))
                .border_b_1()
                .border_color(theme.border)
                .when_some(self.avatar, |d, a| d.child(a))
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .flex()
                        .flex_col()
                        .gap(px(2.0))
                        .child(
                            div()
                                .text_sm()
                                .font_weight(FontWeight::SEMIBOLD)
                                .text_color(theme.foreground)
                                .child(self.name),
                        )
                        .when_some(self.email, |d, e| {
                            d.child(div().text_xs().text_color(theme.muted_foreground).child(e))
                        }),
                ),
        )
        .children(self.actions)
    }
}
