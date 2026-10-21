//! ChatComposer — message compose chrome with toolbar and send action.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnSend = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// A compose area: optional leading tools, the input slot, and a send button.
#[derive(IntoElement)]
pub struct ChatComposer {
    id: ElementId,
    style: StyleRefinement,
    input: Option<AnyElement>,
    tools: Vec<AnyElement>,
    send_label: Option<SharedString>,
    on_send: Option<OnSend>,
    send_disabled: bool,
    placeholder_hint: Option<SharedString>,
}

impl ChatComposer {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            input: None,
            tools: Vec::new(),
            send_label: None,
            on_send: None,
            send_disabled: false,
            placeholder_hint: None,
        }
    }

    pub fn input(mut self, input: impl IntoElement) -> Self {
        self.input = Some(input.into_any_element());
        self
    }

    pub fn tool(mut self, tool: impl IntoElement) -> Self {
        self.tools.push(tool.into_any_element());
        self
    }

    pub fn send_label(mut self, label: impl Into<SharedString>) -> Self {
        self.send_label = Some(label.into());
        self
    }

    pub fn on_send(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_send = Some(Rc::new(f));
        self
    }

    pub fn send_disabled(mut self, disabled: bool) -> Self {
        self.send_disabled = disabled;
        self
    }

    pub fn hint(mut self, hint: impl Into<SharedString>) -> Self {
        self.placeholder_hint = Some(hint.into());
        self
    }
}

impl Styled for ChatComposer {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ChatComposer {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_input = self.input.is_some();
        let send_disabled = self.send_disabled || self.on_send.is_none();

        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .p(px(10.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background);
        root.style().refine(&self.style);

        root.child(
            div()
                .w_full()
                .min_h(px(56.0))
                .when_some(self.input, |d, input| d.child(input))
                .when(!has_input, |d| {
                    d.child(
                        div().text_sm().text_color(theme.muted_foreground).child(
                            self.placeholder_hint
                                .unwrap_or_else(|| "Write a message…".into()),
                        ),
                    )
                }),
        )
        .child(
            div()
                .w_full()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(6.0))
                .child(
                    div()
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(2.0))
                        .children(self.tools),
                )
                .child(div().flex_1())
                .child({
                    let on = self.on_send.clone();
                    let label = self.send_label.clone();
                    div()
                        .id(ElementId::Name(format!("{}-send", self.id).into()))
                        .h(px(28.0))
                        .px(px(12.0))
                        .rounded(px(6.0))
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(6.0))
                        .bg(if send_disabled {
                            theme.muted
                        } else {
                            theme.accent
                        })
                        .text_xs()
                        .font_weight(gpui::FontWeight::MEDIUM)
                        .text_color(if send_disabled {
                            theme.muted_foreground
                        } else {
                            theme.accent_foreground
                        })
                        .when(!send_disabled, |d| {
                            d.cursor_pointer().hover(|s| s.opacity(0.9)).on_click(
                                move |e, window, cx| {
                                    if let Some(on) = &on {
                                        on(e, window, cx);
                                    }
                                },
                            )
                        })
                        .child(
                            Phosphor::new(PhosphorIcon::PaperPlaneTilt)
                                .size(px(12.0))
                                .color(if send_disabled {
                                    theme.muted_foreground
                                } else {
                                    theme.accent_foreground
                                }),
                        )
                        .when_some(label, |d, label| d.child(label))
                }),
        )
    }
}
