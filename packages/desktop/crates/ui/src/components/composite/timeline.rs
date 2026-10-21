//! Timeline — vertical event stream with avatar, time, body, and actions.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// One event on a [`Timeline`].
#[derive(IntoElement)]
pub struct TimelineItem {
    id: ElementId,
    title: SharedString,
    body: Option<SharedString>,
    time: Option<SharedString>,
    icon: Option<PhosphorIcon>,
    media: Option<AnyElement>,
    actions: Vec<AnyElement>,
}

impl TimelineItem {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            body: None,
            time: None,
            icon: Some(PhosphorIcon::Circle),
            media: None,
            actions: Vec::new(),
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

    pub fn media(mut self, media: impl IntoElement) -> Self {
        self.media = Some(media.into_any_element());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }
}

impl RenderOnce for TimelineItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_media = self.media.is_some();
        div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .gap(px(12.0))
            .child(
                div()
                    .flex()
                    .flex_col()
                    .items_center()
                    .gap(px(4.0))
                    .child(
                        div()
                            .size(px(28.0))
                            .rounded_full()
                            .bg(theme.muted)
                            .flex()
                            .items_center()
                            .justify_center()
                            .when_some(self.media, |this, media| this.child(media))
                            .when(!has_media, |this| {
                                this.when_some(self.icon, |d, icon| {
                                    d.child(
                                        Phosphor::new(icon)
                                            .size(px(12.0))
                                            .color(theme.muted_foreground),
                                    )
                                })
                            }),
                    )
                    .child(div().w(px(2.0)).flex_1().min_h(px(16.0)).bg(theme.border)),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .pb(px(16.0))
                    .flex()
                    .flex_col()
                    .gap(px(4.0))
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .items_baseline()
                            .justify_between()
                            .gap(px(8.0))
                            .child(
                                div()
                                    .text_sm()
                                    .font_weight(FontWeight::MEDIUM)
                                    .text_color(theme.foreground)
                                    .child(self.title),
                            )
                            .when_some(self.time, |this, time| {
                                this.child(
                                    div()
                                        .text_xs()
                                        .text_color(theme.muted_foreground)
                                        .child(time),
                                )
                            }),
                    )
                    .when_some(self.body, |this, body| {
                        this.child(
                            div()
                                .text_sm()
                                .text_color(theme.muted_foreground)
                                .child(body),
                        )
                    })
                    .when(!self.actions.is_empty(), |this| {
                        this.child(
                            div()
                                .mt(px(4.0))
                                .flex()
                                .flex_row()
                                .gap(px(6.0))
                                .children(self.actions),
                        )
                    }),
            )
    }
}

/// A vertical event stream.
#[derive(IntoElement)]
pub struct Timeline {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<AnyElement>,
}

impl Timeline {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            items: Vec::new(),
        }
    }

    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }
}

impl Styled for Timeline {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Timeline {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div().id(self.id).w_full().flex().flex_col();
        root.style().refine(&self.style);
        root.children(self.items)
    }
}
