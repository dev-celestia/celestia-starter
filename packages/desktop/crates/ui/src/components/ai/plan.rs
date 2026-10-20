//! Plan — multi-step agent plan card.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Status of a plan step.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum PlanStepStatus {
    #[default]
    Pending,
    Active,
    Done,
}

/// Collapsible plan card with title and step children.
#[derive(IntoElement)]
pub struct Plan {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    description: Option<SharedString>,
    streaming: bool,
    open: bool,
    children: Vec<AnyElement>,
}

impl Plan {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            description: None,
            streaming: false,
            open: true,
            children: Vec::new(),
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn streaming(mut self, streaming: bool) -> Self {
        self.streaming = streaming;
        self
    }

    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for Plan {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Plan {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Plan {
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
                .px(px(14.0))
                .py(px(12.0))
                .flex()
                .flex_row()
                .items_start()
                .gap(px(10.0))
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .flex()
                        .flex_col()
                        .gap(px(4.0))
                        .child(
                            div()
                                .text_sm()
                                .font_weight(FontWeight::SEMIBOLD)
                                .text_color(theme.foreground)
                                .child(if self.streaming {
                                    format!("{}…", self.title)
                                } else {
                                    self.title.to_string()
                                }),
                        )
                        .when_some(self.description, |d, desc| {
                            d.child(
                                div()
                                    .text_xs()
                                    .text_color(theme.muted_foreground)
                                    .child(desc),
                            )
                        }),
                )
                .child(
                    Phosphor::new(PhosphorIcon::CaretDown)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                ),
        )
        .when(self.open && !self.children.is_empty(), |this| {
            this.child(
                div()
                    .w_full()
                    .px(px(14.0))
                    .pb(px(14.0))
                    .flex()
                    .flex_col()
                    .gap(px(8.0))
                    .children(self.children),
            )
        })
    }
}

/// One step inside a [`Plan`].
#[derive(IntoElement)]
pub struct PlanStep {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    status: PlanStepStatus,
}

impl PlanStep {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            status: PlanStepStatus::default(),
        }
    }

    pub fn status(mut self, status: PlanStepStatus) -> Self {
        self.status = status;
        self
    }
}

impl Styled for PlanStep {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for PlanStep {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (icon, color) = match self.status {
            PlanStepStatus::Pending => (PhosphorIcon::Circle, theme.muted_foreground),
            PlanStepStatus::Active => (PhosphorIcon::Path, theme.accent),
            PlanStepStatus::Done => (PhosphorIcon::CheckCircle, theme.success),
        };
        let mut row = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .child(Phosphor::new(icon).size(px(14.0)).color(color))
            .child(
                div()
                    .text_sm()
                    .text_color(theme.foreground)
                    .child(self.label),
            );
        row.style().refine(&self.style);
        row
    }
}
