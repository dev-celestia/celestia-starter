//! PageHeader — page title, description, and trailing actions.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct PageHeader {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    description: Option<SharedString>,
    actions: Vec<AnyElement>,
    breadcrumbs: Option<AnyElement>,
}

impl PageHeader {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            description: None,
            actions: Vec::new(),
            breadcrumbs: None,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }

    pub fn breadcrumbs(mut self, crumbs: impl IntoElement) -> Self {
        self.breadcrumbs = Some(crumbs.into_any_element());
        self
    }
}

impl Styled for PageHeader {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for PageHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .pb(px(12.0))
            .border_b_1()
            .border_color(theme.border);
        root.style().refine(&self.style);
        root.when_some(self.breadcrumbs, |d, b| d.child(b)).child(
            div()
                .w_full()
                .flex()
                .flex_row()
                .items_start()
                .justify_between()
                .gap(px(12.0))
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .flex()
                        .flex_col()
                        .gap(px(4.0))
                        .child(
                            div()
                                .text_lg()
                                .line_height(gpui::relative(1.15))
                                .font_weight(FontWeight::SEMIBOLD)
                                .text_color(theme.foreground)
                                .child(self.title),
                        )
                        .when_some(self.description, |d, desc| {
                            d.child(
                                div()
                                    .text_sm()
                                    .line_height(gpui::relative(1.5))
                                    .text_color(theme.muted_foreground)
                                    .child(desc),
                            )
                        }),
                )
                .when(!self.actions.is_empty(), |d| {
                    d.child(
                        div()
                            .flex()
                            .flex_row()
                            .items_center()
                            // Bordered/filled peers: ≥12px between controls.
                            .gap(px(12.0))
                            .children(self.actions),
                    )
                }),
        )
    }
}
