//! Tool — collapsible tool-call card with status badge.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::badge::{Badge, BadgeVariant};
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Lifecycle of a tool invocation.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ToolState {
    #[default]
    Pending,
    Running,
    Completed,
    Error,
    Denied,
    AwaitingApproval,
}

impl ToolState {
    fn label(self) -> &'static str {
        match self {
            Self::Pending => "Pending",
            Self::Running => "Running",
            Self::Completed => "Completed",
            Self::Error => "Error",
            Self::Denied => "Denied",
            Self::AwaitingApproval => "Awaiting Approval",
        }
    }

    fn badge_variant(self) -> BadgeVariant {
        match self {
            Self::Pending => BadgeVariant::Secondary,
            Self::Running => BadgeVariant::Info,
            Self::Completed => BadgeVariant::Success,
            Self::Error => BadgeVariant::Destructive,
            Self::Denied => BadgeVariant::Warning,
            Self::AwaitingApproval => BadgeVariant::Warning,
        }
    }
}

/// Collapsible tool-call surface.
#[derive(IntoElement)]
pub struct Tool {
    id: ElementId,
    style: StyleRefinement,
    name: SharedString,
    state: ToolState,
    open: bool,
    children: Vec<AnyElement>,
}

impl Tool {
    pub fn new(id: impl Into<ElementId>, name: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            name: name.into(),
            state: ToolState::default(),
            open: true,
            children: Vec::new(),
        }
    }

    pub fn state(mut self, state: ToolState) -> Self {
        self.state = state;
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

impl ParentElement for Tool {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Tool {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Tool {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id.clone())
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
                    Phosphor::new(PhosphorIcon::Wrench)
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
                .child(Badge::new(self.state.label()).variant(self.state.badge_variant()))
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
