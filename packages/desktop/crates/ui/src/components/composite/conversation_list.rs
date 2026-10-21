//! ConversationList — inbox-style conversation rows.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct ConversationItem {
    id: ElementId,
    title: SharedString,
    preview: Option<SharedString>,
    time: Option<SharedString>,
    unread: bool,
    media: Option<AnyElement>,
}

impl ConversationItem {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            preview: None,
            time: None,
            unread: false,
            media: None,
        }
    }

    pub fn preview(mut self, preview: impl Into<SharedString>) -> Self {
        self.preview = Some(preview.into());
        self
    }

    pub fn time(mut self, time: impl Into<SharedString>) -> Self {
        self.time = Some(time.into());
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

impl RenderOnce for ConversationItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .id(self.id)
            .w_full()
            .px(px(10.0))
            .py(px(8.0))
            .flex()
            .flex_row()
            .gap(px(10.0))
            .when(self.unread, |d| d.bg(theme.accent.opacity(0.06)))
            .when_some(self.media, |d, m| d.child(m))
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
                                    .text_sm()
                                    .font_weight(if self.unread {
                                        FontWeight::SEMIBOLD
                                    } else {
                                        FontWeight::MEDIUM
                                    })
                                    .text_color(theme.foreground)
                                    .child(self.title),
                            )
                            .when_some(self.time, |d, t| {
                                d.child(div().text_xs().text_color(theme.muted_foreground).child(t))
                            }),
                    )
                    .when_some(self.preview, |d, p| {
                        d.child(div().text_xs().text_color(theme.muted_foreground).child(p))
                    }),
            )
    }
}

#[derive(IntoElement)]
pub struct ConversationList {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<AnyElement>,
}

impl ConversationList {
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

impl Styled for ConversationList {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ConversationList {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
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
        root.children(self.items.into_iter().enumerate().map(|(i, item)| {
            div()
                .when(i > 0, |d| d.border_t_1().border_color(theme.border))
                .child(item)
        }))
    }
}
