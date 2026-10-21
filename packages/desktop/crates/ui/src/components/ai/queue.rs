//! Queue — pending messages / todos waiting to send.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Collapsible queue of pending work.
#[derive(IntoElement)]
pub struct Queue {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    open: bool,
    children: Vec<AnyElement>,
}

impl Queue {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            open: true,
            children: Vec::new(),
        }
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

impl ParentElement for Queue {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Queue {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Queue {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .gap(px(6.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .p(px(10.0));
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .child(
                    Phosphor::new(PhosphorIcon::Paperclip)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                )
                .child(
                    div()
                        .flex_1()
                        .text_sm()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.foreground)
                        .child(self.title),
                )
                .child(
                    Phosphor::new(PhosphorIcon::CaretDown)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                ),
        )
        .when(self.open, |this| {
            this.child(div().flex().flex_col().gap(px(2.0)).children(self.children))
        })
    }
}

/// One queued message / todo row.
#[derive(IntoElement)]
pub struct QueueItem {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    completed: bool,
}

impl QueueItem {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            completed: false,
        }
    }

    pub fn completed(mut self, completed: bool) -> Self {
        self.completed = completed;
        self
    }
}

impl Styled for QueueItem {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for QueueItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut row = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .px(px(8.0))
            .py(px(6.0))
            .rounded(theme.radius)
            .child(
                div()
                    .size(px(8.0))
                    .rounded_full()
                    .border_1()
                    .border_color(if self.completed {
                        theme.border
                    } else {
                        theme.muted_foreground
                    })
                    .when(self.completed, |d| d.bg(theme.muted)),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_sm()
                    .text_color(if self.completed {
                        theme.muted_foreground
                    } else {
                        theme.foreground
                    })
                    .child(self.label),
            );
        row.style().refine(&self.style);
        row
    }
}
