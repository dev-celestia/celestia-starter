//! Panel — a titled content surface with optional header actions and footer.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// A bordered content panel with a header strip.
#[derive(IntoElement)]
pub struct Panel {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    description: Option<SharedString>,
    header_actions: Vec<AnyElement>,
    footer: Option<AnyElement>,
    children: Vec<AnyElement>,
    flush: bool,
}

impl Panel {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            description: None,
            header_actions: Vec::new(),
            footer: None,
            children: Vec::new(),
            flush: false,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn header_action(mut self, action: impl IntoElement) -> Self {
        self.header_actions.push(action.into_any_element());
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }

    /// Drop body padding — useful when the child brings its own chrome.
    pub fn flush(mut self, flush: bool) -> Self {
        self.flush = flush;
        self
    }
}

impl ParentElement for Panel {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Panel {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Panel {
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
                .py(px(10.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(10.0))
                .border_b_1()
                .border_color(theme.border)
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
                                .font_weight(FontWeight::SEMIBOLD)
                                .text_color(theme.foreground)
                                .child(self.title),
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
                .when(!self.header_actions.is_empty(), |d| {
                    d.child(
                        div()
                            .flex()
                            .flex_row()
                            .items_center()
                            .gap(px(4.0))
                            .children(self.header_actions),
                    )
                }),
        )
        .child(
            div()
                .w_full()
                .flex_1()
                .when(!self.flush, |d| d.p(px(14.0)))
                .children(self.children),
        )
        .when_some(self.footer, |this, footer| {
            this.child(
                div()
                    .w_full()
                    .px(px(14.0))
                    .py(px(10.0))
                    .border_t_1()
                    .border_color(theme.border)
                    .child(footer),
            )
        })
    }
}
