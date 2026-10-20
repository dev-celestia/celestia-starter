//! NotificationCenter — a popover-style notification inbox.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

pub use crate::components::composite::activity_feed::ActivityItem as NotificationItem;

#[derive(IntoElement)]
pub struct NotificationCenter {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    items: Vec<AnyElement>,
    footer: Option<AnyElement>,
}

impl NotificationCenter {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: "Notifications".into(),
            items: Vec::new(),
            footer: None,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }
}

impl Styled for NotificationCenter {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for NotificationCenter {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w(px(320.0))
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
                .border_b_1()
                .border_color(theme.border)
                .text_sm()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(theme.foreground)
                .child(self.title),
        )
        .when(self.items.is_empty(), |d| {
            d.child(
                div()
                    .p(px(20.0))
                    .text_sm()
                    .text_color(theme.muted_foreground)
                    .text_center()
                    .child("You're all caught up."),
            )
        })
        .children(self.items.into_iter().enumerate().map(|(i, item)| {
            div()
                .when(i > 0, |d| d.border_t_1().border_color(theme.border))
                .child(item)
        }))
        .when_some(self.footer, |d, f| {
            d.child(
                div()
                    .px(px(12.0))
                    .py(px(8.0))
                    .border_t_1()
                    .border_color(theme.border)
                    .child(f),
            )
        })
    }
}
