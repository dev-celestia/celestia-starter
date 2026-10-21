//! ChainOfThought — step list for model deliberation.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Status of one chain-of-thought step.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ChainStepStatus {
    #[default]
    Pending,
    Active,
    Complete,
}

/// Container for a chain-of-thought disclosure.
#[derive(IntoElement)]
pub struct ChainOfThought {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    open: bool,
    children: Vec<AnyElement>,
}

impl ChainOfThought {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: "Chain of Thought".into(),
            open: true,
            children: Vec::new(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
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

impl ParentElement for ChainOfThought {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ChainOfThought {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ChainOfThought {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div().id(self.id).w_full().flex().flex_col().gap(px(12.0));
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .child(
                    Phosphor::new(PhosphorIcon::Brain)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                )
                .child(
                    div()
                        .flex_1()
                        .text_sm()
                        .text_color(theme.muted_foreground)
                        .child(self.title),
                )
                .child(
                    Phosphor::new(PhosphorIcon::CaretDown)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                ),
        )
        .when(self.open, |this| {
            this.child(
                div()
                    .flex()
                    .flex_col()
                    .gap(px(10.0))
                    .pl(px(4.0))
                    .children(self.children),
            )
        })
    }
}

/// One step in a [`ChainOfThought`].
#[derive(IntoElement)]
pub struct ChainStep {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    detail: Option<SharedString>,
    status: ChainStepStatus,
    icon: PhosphorIcon,
}

impl ChainStep {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            detail: None,
            status: ChainStepStatus::default(),
            icon: PhosphorIcon::Circle,
        }
    }

    pub fn detail(mut self, detail: impl Into<SharedString>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    pub fn status(mut self, status: ChainStepStatus) -> Self {
        self.status = status;
        self
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = icon;
        self
    }
}

impl Styled for ChainStep {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ChainStep {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let color = match self.status {
            ChainStepStatus::Pending => theme.muted_foreground,
            ChainStepStatus::Active => theme.accent,
            ChainStepStatus::Complete => theme.success,
        };
        let mut row = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_start()
            .gap(px(10.0))
            .child(Phosphor::new(self.icon).size(px(14.0)).color(color))
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
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.foreground)
                            .child(self.label),
                    )
                    .when_some(self.detail, |d, detail| {
                        d.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(detail),
                        )
                    }),
            );
        row.style().refine(&self.style);
        row
    }
}
