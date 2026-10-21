//! ActivityFeed — a compact notification / activity list.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::primitive::status_dot::{StatusDot, StatusDotTone};
use crate::theme::ActiveTheme as _;

/// One row in an [`ActivityFeed`].
#[derive(IntoElement)]
pub struct ActivityItem {
    id: ElementId,
    title: SharedString,
    body: Option<SharedString>,
    time: Option<SharedString>,
    icon: Option<PhosphorIcon>,
    unread: bool,
    media: Option<AnyElement>,
}

impl ActivityItem {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            body: None,
            time: None,
            icon: Some(PhosphorIcon::Bell),
            unread: false,
            media: None,
        }
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    pub fn time(mut self, time: impl Into<SharedString>) -> Self {
        self.time = Some(time.into());
        self
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn unread(mut self, unread: bool) -> Self {
        self.unread = unread;
        self
    }

    pub fn media(mut self, media: impl IntoElement) -> Self {
        self.media = Some(media.into_any_element());
        self
    }
}

impl RenderOnce for ActivityItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_media = self.media.is_some();
        let unread = self.unread;
        let id = self.id.clone();
        div()
            .id(self.id)
            .w_full()
            .px(px(12.0))
            .py(px(10.0))
            .flex()
            .flex_row()
            .items_start()
            .gap(px(10.0))
            .when(unread, |this| this.bg(theme.accent.opacity(0.06)))
            .child(
                div()
                    .size(px(32.0))
                    .rounded_full()
                    .bg(theme.muted)
                    .flex()
                    .items_center()
                    .justify_center()
                    .flex_none()
                    .when_some(self.media, |d, m| d.child(m))
                    .when(!has_media, |d| {
                        d.when_some(self.icon, |el, icon| {
                            el.child(
                                Phosphor::new(icon)
                                    .size(px(14.0))
                                    .color(theme.muted_foreground),
                            )
                        })
                    }),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .flex()
                    .flex_col()
                    .gap(px(2.0))
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .items_center()
                            .justify_between()
                            .gap(px(8.0))
                            .child(
                                div()
                                    .flex()
                                    .flex_row()
                                    .items_center()
                                    .gap(px(6.0))
                                    .min_w_0()
                                    .when(unread, |d| {
                                        d.child(
                                            StatusDot::new(ElementId::Name(
                                                format!("{}-dot", id).into(),
                                            ))
                                            .tone(StatusDotTone::Online)
                                            .size(
                                                crate::components::primitive::status_dot::StatusDotSize::Sm,
                                            ),
                                        )
                                    })
                                    .child(
                                        div()
                                            .text_sm()
                                            .font_weight(if unread {
                                                FontWeight::SEMIBOLD
                                            } else {
                                                FontWeight::MEDIUM
                                            })
                                            .text_color(theme.foreground)
                                            .child(self.title),
                                    ),
                            )
                            .when_some(self.time, |d, time| {
                                d.child(
                                    div()
                                        .text_xs()
                                        .text_color(theme.muted_foreground)
                                        .flex_none()
                                        .child(time),
                                )
                            }),
                    )
                    .when_some(self.body, |d, body| {
                        d.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(body),
                        )
                    }),
            )
    }
}

/// A list of [`ActivityItem`]s with an optional header.
#[derive(IntoElement)]
pub struct ActivityFeed {
    id: ElementId,
    style: StyleRefinement,
    title: Option<SharedString>,
    items: Vec<AnyElement>,
    empty: Option<SharedString>,
}

impl ActivityFeed {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: None,
            items: Vec::new(),
            empty: None,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }

    pub fn empty_message(mut self, message: impl Into<SharedString>) -> Self {
        self.empty = Some(message.into());
        self
    }
}

impl Styled for ActivityFeed {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ActivityFeed {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let empty = self.items.is_empty();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .overflow_hidden();
        root.style().refine(&self.style);

        root.when_some(self.title, |this, title| {
            this.child(
                div()
                    .px(px(12.0))
                    .py(px(10.0))
                    .border_b_1()
                    .border_color(theme.border)
                    .text_sm()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(theme.foreground)
                    .child(title),
            )
        })
        .when(empty, |this| {
            this.child(
                div()
                    .px(px(12.0))
                    .py(px(24.0))
                    .text_sm()
                    .text_color(theme.muted_foreground)
                    .text_center()
                    .child(self.empty.unwrap_or_else(|| "No activity yet.".into())),
            )
        })
        .when(!empty, |this| {
            this.children(self.items.into_iter().enumerate().map(|(ix, item)| {
                div()
                    .w_full()
                    .when(ix > 0, |d| d.border_t_1().border_color(theme.border))
                    .child(item)
            }))
        })
    }
}
