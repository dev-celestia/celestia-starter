//! Task — collapsible task group with statused items.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Status of a task item.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum TaskStatus {
    #[default]
    Pending,
    InProgress,
    Completed,
    Error,
}

/// Collapsible task list header + items.
#[derive(IntoElement)]
pub struct Task {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    completed: usize,
    total: usize,
    open: bool,
    children: Vec<AnyElement>,
}

impl Task {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            completed: 0,
            total: 0,
            open: true,
            children: Vec::new(),
        }
    }

    pub fn progress(mut self, completed: usize, total: usize) -> Self {
        self.completed = completed;
        self.total = total;
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

impl ParentElement for Task {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Task {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Task {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div().id(self.id).w_full().flex().flex_col().gap(px(8.0));
        root.style().refine(&self.style);

        let progress = if self.total > 0 {
            Some(format!("{}/{}", self.completed, self.total))
        } else {
            None
        };

        root.child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .child(
                    Phosphor::new(PhosphorIcon::ListChecks)
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
                .when_some(progress, |d, p| {
                    d.child(div().text_xs().text_color(theme.muted_foreground).child(p))
                })
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
                    .gap(px(6.0))
                    .pl(px(4.0))
                    .children(self.children),
            )
        })
    }
}

/// One row inside a [`Task`].
#[derive(IntoElement)]
pub struct TaskItem {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    status: TaskStatus,
}

impl TaskItem {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            status: TaskStatus::default(),
        }
    }

    pub fn status(mut self, status: TaskStatus) -> Self {
        self.status = status;
        self
    }
}

impl Styled for TaskItem {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for TaskItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (icon, color) = match self.status {
            TaskStatus::Pending => (PhosphorIcon::Circle, theme.muted_foreground),
            TaskStatus::InProgress => (PhosphorIcon::Path, theme.accent),
            TaskStatus::Completed => (PhosphorIcon::CheckCircle, theme.success),
            TaskStatus::Error => (PhosphorIcon::XCircle, theme.danger),
        };
        let mut row = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_start()
            .gap(px(8.0))
            .child(Phosphor::new(icon).size(px(14.0)).color(color))
            .child(
                div()
                    .flex_1()
                    .text_sm()
                    .text_color(match self.status {
                        TaskStatus::Completed => theme.foreground,
                        _ => theme.muted_foreground,
                    })
                    .child(self.label),
            );
        row.style().refine(&self.style);
        row
    }
}
