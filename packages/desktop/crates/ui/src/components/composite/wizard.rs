//! Wizard — multi-step flow chrome with step rail and nav actions.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement as _, Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window,
    div, px,
};

use crate::components::composite::stepper::{Stepper, StepperItem};
use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct Wizard {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    step: usize,
    steps: Vec<SharedString>,
    body: Option<AnyElement>,
    footer: Option<AnyElement>,
}

impl Wizard {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            step: 0,
            steps: Vec::new(),
            body: None,
            footer: None,
        }
    }

    pub fn step(mut self, step: usize) -> Self {
        self.step = step;
        self
    }

    pub fn steps(mut self, steps: impl IntoIterator<Item = impl Into<SharedString>>) -> Self {
        self.steps = steps.into_iter().map(Into::into).collect();
        self
    }

    pub fn body(mut self, body: impl IntoElement) -> Self {
        self.body = Some(body.into_any_element());
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }
}

impl Styled for Wizard {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Wizard {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut stepper = Stepper::new(ElementId::Name(format!("{}-steps", self.id).into()))
            .selected_index(self.step);
        for label in self.steps {
            stepper = stepper.item(StepperItem::new().child(label));
        }
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .gap(px(16.0))
            .p(px(16.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);
        root.child(
            div()
                .text_sm()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(theme.foreground)
                .child(self.title),
        )
        .child(stepper)
        .when_some(self.body, |d, b| d.child(b))
        .when_some(self.footer, |d, f| {
            d.child(
                div()
                    .pt(px(8.0))
                    .border_t_1()
                    .border_color(theme.border)
                    .child(f),
            )
        })
    }
}
