//! Inspector panel — property sheet of label + control rows for a selection.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// One property row inside an [`InspectorPanel`].
#[derive(IntoElement)]
pub struct InspectorRow {
    label: SharedString,
    control: Option<AnyElement>,
}

impl InspectorRow {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
            control: None,
        }
    }

    pub fn control(mut self, control: impl IntoElement) -> Self {
        self.control = Some(control.into_any_element());
        self
    }
}

impl RenderOnce for InspectorRow {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(12.0))
            .px(px(12.0))
            .py(px(8.0))
            .child(
                div()
                    .w(px(110.0))
                    .flex_none()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.muted_foreground)
                    .child(self.label),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .when_some(self.control, |this, c| this.child(c)),
            )
    }
}

/// A titled property inspector with grouped rows.
#[derive(IntoElement)]
pub struct InspectorPanel {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    subtitle: Option<SharedString>,
    rows: Vec<AnyElement>,
    footer: Option<AnyElement>,
}

impl InspectorPanel {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            subtitle: None,
            rows: Vec::new(),
            footer: None,
        }
    }

    pub fn subtitle(mut self, subtitle: impl Into<SharedString>) -> Self {
        self.subtitle = Some(subtitle.into());
        self
    }

    pub fn row(mut self, row: impl IntoElement) -> Self {
        self.rows.push(row.into_any_element());
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }
}

impl Styled for InspectorPanel {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for InspectorPanel {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .h_full()
            .flex()
            .flex_col()
            .border_1()
            .border_color(theme.border)
            .rounded(theme.radius)
            .bg(theme.background);
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_col()
                .gap(px(2.0))
                .px(px(12.0))
                .py(px(10.0))
                .border_b_1()
                .border_color(theme.border)
                .child(
                    div()
                        .text_sm()
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(theme.foreground)
                        .child(self.title),
                )
                .when_some(self.subtitle, |this, sub| {
                    this.child(
                        div()
                            .text_xs()
                            .text_color(theme.muted_foreground)
                            .child(sub),
                    )
                }),
        )
        .child(
            div()
                .id("inspector-rows")
                .flex_1()
                .min_h_0()
                .overflow_y_scroll()
                .py(px(4.0))
                .children(self.rows),
        )
        .when_some(self.footer, |this, footer| {
            this.child(
                div()
                    .px(px(12.0))
                    .py(px(10.0))
                    .border_t_1()
                    .border_color(theme.border)
                    .child(footer),
            )
        })
    }
}
