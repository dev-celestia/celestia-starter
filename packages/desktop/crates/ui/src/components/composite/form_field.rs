//! Form field — label + control + hint/error + optional trailing action.
//!
//! Assembles the common settings/form row so callers do not hand-wire
//! [`Label`](crate::components::primitive::label) spacing and error colouring.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

type OnAction = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Verticality of a [`FormField`] label relative to its control.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum FormFieldLayout {
    /// Label above the control (default for most forms).
    #[default]
    Vertical,
    /// Label beside the control, useful for compact settings rows.
    Horizontal,
}

/// A labelled control slot with optional description, error, and trailing action.
#[derive(IntoElement)]
pub struct FormField {
    id: ElementId,
    style: StyleRefinement,
    layout: FormFieldLayout,
    label: Option<SharedString>,
    description: Option<SharedString>,
    error: Option<SharedString>,
    required: bool,
    control: Option<AnyElement>,
    action_label: Option<SharedString>,
    on_action: Option<OnAction>,
}

impl FormField {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            layout: FormFieldLayout::default(),
            label: None,
            description: None,
            error: None,
            required: false,
            control: None,
            action_label: None,
            on_action: None,
        }
    }

    pub fn layout(mut self, layout: FormFieldLayout) -> Self {
        self.layout = layout;
        self
    }

    pub fn horizontal(mut self) -> Self {
        self.layout = FormFieldLayout::Horizontal;
        self
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn error(mut self, error: impl Into<SharedString>) -> Self {
        self.error = Some(error.into());
        self
    }

    pub fn required(mut self, required: bool) -> Self {
        self.required = required;
        self
    }

    pub fn control(mut self, control: impl IntoElement) -> Self {
        self.control = Some(control.into_any_element());
        self
    }

    pub fn action(
        mut self,
        label: impl Into<SharedString>,
        on_click: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.action_label = Some(label.into());
        self.on_action = Some(Rc::new(on_click));
        self
    }
}

impl Styled for FormField {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for FormField {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_error = self.error.is_some();
        let horizontal = matches!(self.layout, FormFieldLayout::Horizontal);

        let label_row = self.label.map(|label| {
            div()
                .flex()
                .flex_row()
                .items_center()
                .justify_between()
                .gap(px(8.0))
                .child(
                    div()
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(4.0))
                        .child(
                            div()
                                .text_sm()
                                .font_weight(FontWeight::MEDIUM)
                                .text_color(theme.foreground)
                                .child(label),
                        )
                        .when(self.required, |this| {
                            this.child(div().text_sm().text_color(theme.danger).child("*"))
                        }),
                )
                .when_some(
                    self.action_label.zip(self.on_action),
                    |this, (label, on)| {
                        this.child(
                            div()
                                .id(ElementId::Name(format!("{}-action", self.id).into()))
                                .text_xs()
                                .font_weight(FontWeight::MEDIUM)
                                .text_color(theme.accent)
                                .cursor_pointer()
                                .hover(|s| s.text_color(theme.accent.opacity(0.8)))
                                .on_click(move |e, window, cx| on(e, window, cx))
                                .child(label),
                        )
                    },
                )
        });

        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .when(horizontal, |this| {
                this.flex_row().items_start().gap(px(16.0))
            })
            .when(!horizontal, |this| this.flex_col().gap(px(6.0)));
        root.style().refine(&self.style);

        root.when_some(label_row, |this, row| {
            this.child(
                div()
                    .when(horizontal, |d| d.w(px(140.0)).flex_none().pt(px(4.0)))
                    .child(row),
            )
        })
        .child(
            div()
                .flex()
                .flex_col()
                .gap(px(4.0))
                .when(horizontal, |d| d.flex_1().min_w_0())
                .when_some(self.control, |this, control| this.child(control))
                .when_some(self.description.filter(|_| !has_error), |this, desc| {
                    this.child(
                        div()
                            .text_xs()
                            .text_color(theme.muted_foreground)
                            .child(desc),
                    )
                })
                .when_some(self.error, |this, error| {
                    this.child(div().text_xs().text_color(theme.danger).child(error))
                }),
        )
    }
}
