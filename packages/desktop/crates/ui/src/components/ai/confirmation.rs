//! AiConfirmation — approve / deny tool-call prompt.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::button::{Button, ButtonVariant};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Outcome of an AI confirmation.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ConfirmationState {
    #[default]
    Pending,
    Approved,
    Denied,
}

/// Inline approve / deny card for tool approvals.
#[derive(IntoElement)]
pub struct AiConfirmation {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    body: Option<SharedString>,
    state: ConfirmationState,
    approve_label: SharedString,
    deny_label: SharedString,
    on_approve: Option<OnClick>,
    on_deny: Option<OnClick>,
}

impl AiConfirmation {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            body: None,
            state: ConfirmationState::default(),
            approve_label: "Approve".into(),
            deny_label: "Deny".into(),
            on_approve: None,
            on_deny: None,
        }
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    pub fn state(mut self, state: ConfirmationState) -> Self {
        self.state = state;
        self
    }

    pub fn approve_label(mut self, label: impl Into<SharedString>) -> Self {
        self.approve_label = label.into();
        self
    }

    pub fn deny_label(mut self, label: impl Into<SharedString>) -> Self {
        self.deny_label = label.into();
        self
    }

    pub fn on_approve(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_approve = Some(Rc::new(f));
        self
    }

    pub fn on_deny(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_deny = Some(Rc::new(f));
        self
    }
}

impl Styled for AiConfirmation {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for AiConfirmation {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_col()
            .gap(px(10.0))
            .p(px(12.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);

        let status = match self.state {
            ConfirmationState::Pending => None,
            ConfirmationState::Approved => Some(("Approved", theme.success)),
            ConfirmationState::Denied => Some(("Denied", theme.danger)),
        };

        root.child(
            div()
                .text_sm()
                .font_weight(FontWeight::MEDIUM)
                .text_color(theme.foreground)
                .child(self.title),
        )
        .when_some(self.body, |this, body| {
            this.child(
                div()
                    .text_sm()
                    .text_color(theme.muted_foreground)
                    .child(body),
            )
        })
        .when_some(status, |this, (label, color)| {
            this.child(
                div()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(color)
                    .child(label),
            )
        })
        .when(self.state == ConfirmationState::Pending, |this| {
            let mut approve = Button::new((self.id.clone(), "approve"))
                .label(self.approve_label)
                .variant(ButtonVariant::Primary);
            if let Some(cb) = self.on_approve {
                approve = approve.on_click(move |e, w, cx| cb(e, w, cx));
            }
            let mut deny = Button::new((self.id.clone(), "deny"))
                .label(self.deny_label)
                .variant(ButtonVariant::Outline);
            if let Some(cb) = self.on_deny {
                deny = deny.on_click(move |e, w, cx| cb(e, w, cx));
            }
            this.child(
                div()
                    .flex()
                    .flex_row()
                    .items_center()
                    .gap(px(8.0))
                    .child(approve)
                    .child(deny),
            )
        })
    }
}
