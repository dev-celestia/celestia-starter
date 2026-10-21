//! Toolbar — a horizontal action strip with leading / trailing clusters.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// A chrome toolbar: optional title, leading actions, flexible gap, trailing actions.
#[derive(IntoElement)]
pub struct Toolbar {
    id: ElementId,
    style: StyleRefinement,
    title: Option<SharedString>,
    leading: Vec<AnyElement>,
    trailing: Vec<AnyElement>,
    bordered: bool,
}

impl Toolbar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: None,
            leading: Vec::new(),
            trailing: Vec::new(),
            bordered: true,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
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

impl Styled for Toolbar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Toolbar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .h(px(40.0))
            .px(px(10.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .bg(theme.background)
            .when(self.bordered, |this| {
                this.border_b_1().border_color(theme.border)
            });
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(4.0))
                .children(self.leading),
        )
        .when_some(self.title, |this, title| {
            this.child(
                div()
                    .text_sm()
                    .font_weight(gpui::FontWeight::MEDIUM)
                    .text_color(theme.foreground)
                    .child(title),
            )
        })
        .child(div().flex_1())
        .child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(4.0))
                .children(self.trailing),
        )
    }
}
