//! CommitRow — a single VCS commit summary row.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct CommitRow {
    id: ElementId,
    style: StyleRefinement,
    hash: SharedString,
    message: SharedString,
    author: Option<SharedString>,
    time: Option<SharedString>,
}

impl CommitRow {
    pub fn new(
        id: impl Into<ElementId>,
        hash: impl Into<SharedString>,
        message: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            hash: hash.into(),
            message: message.into(),
            author: None,
            time: None,
        }
    }

    pub fn author(mut self, author: impl Into<SharedString>) -> Self {
        self.author = Some(author.into());
        self
    }

    pub fn time(mut self, time: impl Into<SharedString>) -> Self {
        self.time = Some(time.into());
        self
    }
}

impl Styled for CommitRow {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for CommitRow {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(10.0))
            .px(px(10.0))
            .py(px(8.0))
            .rounded(theme.radius)
            .hover(|s| s.bg(theme.muted));
        root.style().refine(&self.style);
        root.child(
            div()
                .text_xs()
                .font_family(theme.mono_font_family.clone())
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(theme.accent)
                .child(self.hash),
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
                        .text_sm()
                        .text_color(theme.foreground)
                        .child(self.message),
                )
                .when_some(self.author, |d, a| {
                    d.child(div().text_xs().text_color(theme.muted_foreground).child(a))
                }),
        )
        .when_some(self.time, |d, t| {
            d.child(div().text_xs().text_color(theme.muted_foreground).child(t))
        })
    }
}
