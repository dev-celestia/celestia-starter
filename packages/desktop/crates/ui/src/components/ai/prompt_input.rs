//! PromptInput — chat composer with toolbar actions and submit / stop.

use std::rc::Rc;

use gpui::{
    AnyElement, App, ClickEvent, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::components::primitive::icon::PhosphorIcon;
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Lifecycle of a prompt submission.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum PromptStatus {
    #[default]
    Ready,
    Streaming,
}

/// Chat composer surface — placeholder text, trailing actions, submit / stop.
#[derive(IntoElement)]
pub struct PromptInput {
    id: ElementId,
    style: StyleRefinement,
    placeholder: SharedString,
    value: SharedString,
    status: PromptStatus,
    leading: Vec<AnyElement>,
    trailing: Vec<AnyElement>,
    on_submit: Option<OnClick>,
    on_stop: Option<OnClick>,
}

impl PromptInput {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            placeholder: "Ask anything…".into(),
            value: SharedString::default(),
            status: PromptStatus::default(),
            leading: Vec::new(),
            trailing: Vec::new(),
            on_submit: None,
            on_stop: None,
        }
    }

    pub fn placeholder(mut self, text: impl Into<SharedString>) -> Self {
        self.placeholder = text.into();
        self
    }

    pub fn value(mut self, text: impl Into<SharedString>) -> Self {
        self.value = text.into();
        self
    }

    pub fn status(mut self, status: PromptStatus) -> Self {
        self.status = status;
        self
    }

    pub fn leading(mut self, child: impl IntoElement) -> Self {
        self.leading.push(child.into_any_element());
        self
    }

    pub fn trailing(mut self, child: impl IntoElement) -> Self {
        self.trailing.push(child.into_any_element());
        self
    }

    pub fn on_submit(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_submit = Some(Rc::new(f));
        self
    }

    pub fn on_stop(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_stop = Some(Rc::new(f));
        self
    }
}

impl Styled for PromptInput {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for PromptInput {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let streaming = self.status == PromptStatus::Streaming;
        let display = if self.value.is_empty() {
            self.placeholder.clone()
        } else {
            self.value.clone()
        };
        let muted = self.value.is_empty();

        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .p(px(12.0))
            .rounded(theme.radius_xl())
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);

        root.child(
            div()
                .w_full()
                .min_h(px(48.0))
                .text_sm()
                .text_color(if muted {
                    theme.muted_foreground
                } else {
                    theme.foreground
                })
                .child(display),
        )
        .child(
            div()
                .w_full()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(6.0))
                .children(self.leading)
                .child(div().flex_1())
                .children(self.trailing)
                .child(if streaming {
                    let mut stop = Button::icon((self.id.clone(), "stop"), PhosphorIcon::Stop)
                        .variant(ButtonVariant::Destructive)
                        .size(ButtonSize::IconSm)
                        .accessibility_label("Stop generating")
                        .tooltip("Stop generating");
                    if let Some(on_stop) = self.on_stop {
                        stop = stop.on_click(move |e, w, cx| on_stop(e, w, cx));
                    }
                    stop.into_any_element()
                } else {
                    let mut send = Button::icon((self.id.clone(), "send"), PhosphorIcon::ArrowUp)
                        .variant(ButtonVariant::Primary)
                        .size(ButtonSize::IconSm)
                        .accessibility_label("Send message")
                        .tooltip("Send message");
                    if let Some(on_submit) = self.on_submit {
                        send = send.on_click(move |e, w, cx| on_submit(e, w, cx));
                    }
                    send.into_any_element()
                }),
        )
    }
}
