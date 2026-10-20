//! Agent — agent card with name, model badge, and instructions.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::badge::{Badge, BadgeVariant};
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Agent summary card.
#[derive(IntoElement)]
pub struct Agent {
    id: ElementId,
    style: StyleRefinement,
    name: SharedString,
    model: Option<SharedString>,
    instructions: Option<SharedString>,
    children: Vec<AnyElement>,
}

impl Agent {
    pub fn new(id: impl Into<ElementId>, name: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            name: name.into(),
            model: None,
            instructions: None,
            children: Vec::new(),
        }
    }

    pub fn model(mut self, model: impl Into<SharedString>) -> Self {
        self.model = Some(model.into());
        self
    }

    pub fn instructions(mut self, text: impl Into<SharedString>) -> Self {
        self.instructions = Some(text.into());
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for Agent {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Agent {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Agent {
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

        root.child(
            div()
                .w_full()
                .px(px(12.0))
                .py(px(10.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .child(
                    Phosphor::new(PhosphorIcon::Robot)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                )
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .text_sm()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.foreground)
                        .child(self.name),
                )
                .when_some(self.model, |d, model| {
                    d.child(Badge::new(model).variant(BadgeVariant::Secondary))
                }),
        )
        .when_some(self.instructions, |this, text| {
            this.child(
                div()
                    .px(px(12.0))
                    .pb(px(12.0))
                    .flex()
                    .flex_col()
                    .gap(px(6.0))
                    .child(
                        div()
                            .text_xs()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.muted_foreground)
                            .child("Instructions"),
                    )
                    .child(
                        div()
                            .w_full()
                            .p(px(10.0))
                            .rounded(theme.radius)
                            .bg(theme.muted.opacity(0.4))
                            .text_sm()
                            .text_color(theme.muted_foreground)
                            .child(text),
                    ),
            )
        })
        .when(!self.children.is_empty(), |this| {
            this.child(
                div()
                    .px(px(12.0))
                    .pb(px(12.0))
                    .flex()
                    .flex_col()
                    .gap(px(8.0))
                    .children(self.children),
            )
        })
    }
}
