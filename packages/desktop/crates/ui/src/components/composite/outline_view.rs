//! OutlineView — document symbol / heading outline tree chrome.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct OutlineItem {
    id: ElementId,
    label: SharedString,
    kind: SharedString,
    depth: usize,
    active: bool,
}

impl OutlineItem {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            kind: "fn".into(),
            depth: 0,
            active: false,
        }
    }

    pub fn kind(mut self, kind: impl Into<SharedString>) -> Self {
        self.kind = kind.into();
        self
    }

    pub fn depth(mut self, depth: usize) -> Self {
        self.depth = depth;
        self
    }

    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }
}

impl RenderOnce for OutlineItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .id(self.id)
            .w_full()
            .h(px(26.0))
            .pl(px(8.0 + self.depth as f32 * 12.0))
            .pr(px(8.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0))
            .rounded(px(4.0))
            .when(self.active, |d| d.bg(theme.accent.opacity(0.12)))
            .child(
                Phosphor::new(PhosphorIcon::Code)
                    .size(px(12.0))
                    .color(theme.muted_foreground),
            )
            .child(
                div()
                    .text_xs()
                    .font_family(theme.mono_font_family.clone())
                    .text_color(theme.muted_foreground)
                    .child(self.kind),
            )
            .child(
                div()
                    .flex_1()
                    .text_sm()
                    .font_weight(if self.active {
                        FontWeight::SEMIBOLD
                    } else {
                        FontWeight::MEDIUM
                    })
                    .text_color(theme.foreground)
                    .child(self.label),
            )
    }
}

#[derive(IntoElement)]
pub struct OutlineView {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    items: Vec<AnyElement>,
}

impl OutlineView {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: "Outline".into(),
            items: Vec::new(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }
}

impl Styled for OutlineView {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for OutlineView {
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
                .px(px(10.0))
                .py(px(8.0))
                .border_b_1()
                .border_color(theme.border)
                .text_xs()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(theme.muted_foreground)
                .child(self.title),
        )
        .child(
            div()
                .p(px(4.0))
                .flex()
                .flex_col()
                .gap(px(1.0))
                .children(self.items),
        )
    }
}
