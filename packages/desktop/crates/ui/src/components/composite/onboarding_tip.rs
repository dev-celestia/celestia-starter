//! Onboarding tip — anchored coachmark with step progress.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::button::{Button, ButtonVariant};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// A coachmark card with optional step indicator and next / skip actions.
#[derive(IntoElement)]
pub struct OnboardingTip {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    body: Option<SharedString>,
    step: Option<(usize, usize)>,
    next_label: SharedString,
    skip_label: SharedString,
    on_next: Option<OnClick>,
    on_skip: Option<OnClick>,
}

impl OnboardingTip {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            body: None,
            step: None,
            next_label: "Next".into(),
            skip_label: "Skip".into(),
            on_next: None,
            on_skip: None,
        }
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    /// Current step (1-based) and total steps.
    pub fn step(mut self, current: usize, total: usize) -> Self {
        self.step = Some((current.max(1), total.max(1)));
        self
    }

    pub fn next_label(mut self, label: impl Into<SharedString>) -> Self {
        self.next_label = label.into();
        self
    }

    pub fn skip_label(mut self, label: impl Into<SharedString>) -> Self {
        self.skip_label = label.into();
        self
    }

    pub fn on_next(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_next = Some(Rc::new(f));
        self
    }

    pub fn on_skip(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_skip = Some(Rc::new(f));
        self
    }
}

impl Styled for OnboardingTip {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for OnboardingTip {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id.clone())
            .w(px(300.0))
            .flex()
            .flex_col()
            .gap(px(12.0))
            .p(px(14.0))
            .rounded(theme.radius_xl())
            .border_1()
            .border_color(theme.accent.opacity(0.35))
            .bg(theme.popover)
            .shadow_md();
        root.style().refine(&self.style);

        root.when_some(self.step, |this, (current, total)| {
            this.child(
                div()
                    .flex()
                    .flex_row()
                    .items_center()
                    .gap(px(6.0))
                    .children((0..total).map(|i| {
                        let active = i + 1 == current;
                        div()
                            .id(ElementId::Integer(i as u64))
                            .h(px(4.0))
                            .flex_1()
                            .rounded_full()
                            .bg(if active { theme.accent } else { theme.border })
                    })),
            )
        })
        .child(
            div()
                .flex()
                .flex_col()
                .gap(px(4.0))
                .child(
                    div()
                        .text_sm()
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(theme.foreground)
                        .child(self.title),
                )
                .when_some(self.body, |this, body| {
                    this.child(
                        div()
                            .text_xs()
                            .line_height(px(18.0))
                            .text_color(theme.muted_foreground)
                            .child(body),
                    )
                }),
        )
        .child(
            div()
                .flex()
                .flex_row()
                .justify_between()
                .items_center()
                .child({
                    let mut btn = Button::new(ElementId::Name(format!("{}-skip", self.id).into()))
                        .variant(ButtonVariant::Ghost)
                        .label(self.skip_label);
                    if let Some(on) = self.on_skip {
                        btn = btn.on_click(move |e, window, cx| on(e, window, cx));
                    }
                    btn
                })
                .child({
                    let mut btn = Button::new(ElementId::Name(format!("{}-next", self.id).into()))
                        .variant(ButtonVariant::Primary)
                        .label(self.next_label);
                    if let Some(on) = self.on_next {
                        btn = btn.on_click(move |e, window, cx| on(e, window, cx));
                    }
                    btn
                }),
        )
    }
}
