//! CommentThread — nested comment / discussion thread.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct CommentItem {
    id: ElementId,
    author: SharedString,
    body: SharedString,
    time: Option<SharedString>,
    avatar: Option<AnyElement>,
    actions: Vec<AnyElement>,
}

impl CommentItem {
    pub fn new(
        id: impl Into<ElementId>,
        author: impl Into<SharedString>,
        body: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            author: author.into(),
            body: body.into(),
            time: None,
            avatar: None,
            actions: Vec::new(),
        }
    }

    pub fn time(mut self, time: impl Into<SharedString>) -> Self {
        self.time = Some(time.into());
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

impl RenderOnce for CommentItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .gap(px(10.0))
            .when_some(self.avatar, |d, a| d.child(a))
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .flex()
                    .flex_col()
                    .gap(px(4.0))
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .items_center()
                            .gap(px(8.0))
                            .child(
                                div()
                                    .text_sm()
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .text_color(theme.foreground)
                                    .child(self.author),
                            )
                            .when_some(self.time, |d, t| {
                                d.child(div().text_xs().text_color(theme.muted_foreground).child(t))
                            }),
                    )
                    .child(
                        div()
                            .text_sm()
                            .text_color(theme.foreground)
                            .child(self.body),
                    )
                    .when(!self.actions.is_empty(), |d| {
                        d.child(div().flex().flex_row().gap(px(4.0)).children(self.actions))
                    }),
            )
    }
}

#[derive(IntoElement)]
pub struct CommentThread {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<AnyElement>,
}

impl CommentThread {
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

impl Styled for CommentThread {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for CommentThread {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .gap(px(12.0))
            .p(px(12.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);
        root.children(self.items)
    }
}
