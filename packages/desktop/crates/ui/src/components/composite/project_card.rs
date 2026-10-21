//! ProjectCard — project summary tile with meta and actions.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct ProjectCard {
    id: ElementId,
    style: StyleRefinement,
    name: SharedString,
    description: Option<SharedString>,
    meta: Option<SharedString>,
    actions: Vec<AnyElement>,
}

impl ProjectCard {
    pub fn new(id: impl Into<ElementId>, name: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            name: name.into(),
            description: None,
            meta: None,
            actions: Vec::new(),
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn meta(mut self, meta: impl Into<SharedString>) -> Self {
        self.meta = Some(meta.into());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }
}

impl Styled for ProjectCard {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ProjectCard {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .min_w(px(200.0))
            .flex()
            .flex_col()
            .gap(px(8.0))
            .p(px(14.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);
        root.child(
            div()
                .text_sm()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(theme.foreground)
                .child(self.name),
        )
        .when_some(self.description, |d, desc| {
            d.child(
                div()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child(desc),
            )
        })
        .when_some(self.meta, |d, m| {
            d.child(div().text_xs().text_color(theme.muted_foreground).child(m))
        })
        .when(!self.actions.is_empty(), |d| {
            d.child(
                div()
                    .pt(px(4.0))
                    .flex()
                    .flex_row()
                    .gap(px(6.0))
                    .children(self.actions),
            )
        })
    }
}
