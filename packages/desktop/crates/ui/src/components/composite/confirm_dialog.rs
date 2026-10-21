//! Confirm dialog — prewired title / body / cancel / confirm surface.
//!
//! Presentational content for use inside `window.open_dialog` or as a standalone
//! panel. Destructive confirms swap the primary button to
//! [`ButtonVariant::Destructive`].

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::button::{Button, ButtonVariant};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Tone of the confirm action.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ConfirmTone {
    #[default]
    Default,
    Destructive,
}

/// A confirm / cancel panel with title, body, and two actions.
#[derive(IntoElement)]
pub struct ConfirmDialog {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    body: Option<SharedString>,
    confirm_label: SharedString,
    cancel_label: SharedString,
    tone: ConfirmTone,
    on_confirm: Option<OnClick>,
    on_cancel: Option<OnClick>,
}

impl ConfirmDialog {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            body: None,
            confirm_label: "Confirm".into(),
            cancel_label: "Cancel".into(),
            tone: ConfirmTone::default(),
            on_confirm: None,
            on_cancel: None,
        }
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    pub fn confirm_label(mut self, label: impl Into<SharedString>) -> Self {
        self.confirm_label = label.into();
        self
    }

    pub fn cancel_label(mut self, label: impl Into<SharedString>) -> Self {
        self.cancel_label = label.into();
        self
    }

    pub fn tone(mut self, tone: ConfirmTone) -> Self {
        self.tone = tone;
        self
    }

    pub fn destructive(mut self) -> Self {
        self.tone = ConfirmTone::Destructive;
        self
    }

    pub fn on_confirm(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_confirm = Some(Rc::new(f));
        self
    }

    pub fn on_cancel(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_cancel = Some(Rc::new(f));
        self
    }
}

impl Styled for ConfirmDialog {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ConfirmDialog {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let confirm_variant = match self.tone {
            ConfirmTone::Default => ButtonVariant::Primary,
            ConfirmTone::Destructive => ButtonVariant::Destructive,
        };

        let mut root = div()
            .id(self.id.clone())
            .w(px(360.0))
            .flex()
            .flex_col()
            .gap(px(16.0))
            .p(px(20.0))
            .rounded(theme.radius_xl())
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_col()
                .gap(px(6.0))
                .child(
                    div()
                        .text_size(px(16.0))
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(theme.foreground)
                        .child(self.title),
                )
                .when_some(self.body, |this, body| {
                    this.child(
                        div()
                            .text_sm()
                            .line_height(px(20.0))
                            .text_color(theme.muted_foreground)
                            .child(body),
                    )
                }),
        )
        .child(
            div()
                .flex()
                .flex_row()
                .justify_end()
                .gap(px(8.0))
                .child({
                    let mut btn =
                        Button::new(ElementId::Name(format!("{}-cancel", self.id).into()))
                            .variant(ButtonVariant::Outline)
                            .label(self.cancel_label);
                    if let Some(on) = self.on_cancel {
                        btn = btn.on_click(move |e, window, cx| on(e, window, cx));
                    }
                    btn
                })
                .child({
                    let mut btn =
                        Button::new(ElementId::Name(format!("{}-confirm", self.id).into()))
                            .variant(confirm_variant)
                            .label(self.confirm_label);
                    if let Some(on) = self.on_confirm {
                        btn = btn.on_click(move |e, window, cx| on(e, window, cx));
                    }
                    btn
                }),
        )
    }
}
