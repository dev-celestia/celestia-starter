//! PropertyList — dense key/value inspector rows.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct PropertyRow {
    key: SharedString,
    value: Option<AnyElement>,
    value_text: Option<SharedString>,
}

impl PropertyRow {
    pub fn new(key: impl Into<SharedString>) -> Self {
        Self {
            key: key.into(),
            value: None,
            value_text: None,
        }
    }

    pub fn text(mut self, text: impl Into<SharedString>) -> Self {
        self.value_text = Some(text.into());
        self
    }

    pub fn value(mut self, value: impl IntoElement) -> Self {
        self.value = Some(value.into_any_element());
        self
    }
}

impl RenderOnce for PropertyRow {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .justify_between()
            .gap(px(12.0))
            .py(px(6.0))
            .child(
                div()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.muted_foreground)
                    .child(self.key),
            )
            .child(
                div()
                    .min_w_0()
                    .text_sm()
                    .text_color(theme.foreground)
                    .when_some(self.value_text, |d, t| d.child(t))
                    .when_some(self.value, |d, v| d.child(v)),
            )
    }
}

#[derive(IntoElement)]
pub struct PropertyList {
    id: ElementId,
    style: StyleRefinement,
    rows: Vec<AnyElement>,
}

impl PropertyList {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            rows: Vec::new(),
        }
    }

    pub fn row(mut self, row: impl IntoElement) -> Self {
        self.rows.push(row.into_any_element());
        self
    }
}

impl Styled for PropertyList {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for PropertyList {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .px(px(10.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);
        root.children(self.rows.into_iter().enumerate().map(|(i, row)| {
            div()
                .when(i > 0, |d| d.border_t_1().border_color(theme.border))
                .child(row)
        }))
    }
}
