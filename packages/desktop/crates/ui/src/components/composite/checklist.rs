//! Checklist — simple labeled check rows for onboarding / setup.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct ChecklistItem {
    label: SharedString,
    checked: bool,
}

impl ChecklistItem {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
            checked: false,
        }
    }

    pub fn checked(mut self, checked: bool) -> Self {
        self.checked = checked;
        self
    }
}

impl RenderOnce for ChecklistItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .py(px(4.0))
            .child(
                Phosphor::new(if self.checked {
                    PhosphorIcon::CheckSquare
                } else {
                    PhosphorIcon::Square
                })
                .size(px(14.0))
                .color(if self.checked {
                    theme.success
                } else {
                    theme.muted_foreground
                }),
            )
            .child(
                div()
                    .text_sm()
                    .text_color(if self.checked {
                        theme.muted_foreground
                    } else {
                        theme.foreground
                    })
                    .child(self.label),
            )
    }
}

#[derive(IntoElement)]
pub struct Checklist {
    id: ElementId,
    style: StyleRefinement,
    title: Option<SharedString>,
    items: Vec<AnyElement>,
}

impl Checklist {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: None,
            items: Vec::new(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }
}

impl Styled for Checklist {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Checklist {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .gap(px(2.0))
            .p(px(12.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);
        root.when_some(self.title, |d, t| {
            d.child(
                div()
                    .pb(px(6.0))
                    .text_sm()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(theme.foreground)
                    .child(t),
            )
        })
        .children(self.items)
    }
}
