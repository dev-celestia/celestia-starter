//! Reasoning — collapsible model thinking block.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::ai::thinking_text::ThinkingText;
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnToggle = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Collapsible thinking / reasoning disclosure.
#[derive(IntoElement)]
pub struct Reasoning {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    body: SharedString,
    open: bool,
    streaming: bool,
    duration_secs: Option<u32>,
    on_toggle: Option<OnToggle>,
}

impl Reasoning {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: "Thinking".into(),
            body: SharedString::default(),
            open: false,
            streaming: false,
            duration_secs: None,
            on_toggle: None,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = body.into();
        self
    }

    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    pub fn streaming(mut self, streaming: bool) -> Self {
        self.streaming = streaming;
        self
    }

    pub fn duration_secs(mut self, secs: u32) -> Self {
        self.duration_secs = Some(secs);
        self
    }

    pub fn on_toggle(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_toggle = Some(Rc::new(f));
        self
    }
}

impl Styled for Reasoning {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Reasoning {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let streaming = self.streaming;
        let subtitle = if streaming {
            SharedString::default()
        } else if let Some(secs) = self.duration_secs {
            format!("Thought for {secs}s").into()
        } else {
            self.title.clone()
        };

        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0));
        root.style().refine(&self.style);

        let mut trigger = div()
            .id((self.id.clone(), "toggle"))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .cursor_pointer()
            .when(!streaming, |d| {
                d.child(
                    Phosphor::new(PhosphorIcon::Brain)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                )
            })
            .child(if streaming {
                ThinkingText::new((self.id.clone(), "thinking"))
                    .label(self.title.clone())
                    .into_any_element()
            } else {
                div()
                    .flex_1()
                    .text_sm()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.muted_foreground)
                    .child(subtitle)
                    .into_any_element()
            })
            .child(
                Phosphor::new(PhosphorIcon::CaretDown)
                    .size(px(14.0))
                    .color(theme.muted_foreground),
            );
        if let Some(on_toggle) = self.on_toggle {
            trigger = trigger.on_click(move |e, w, cx| on_toggle(e, w, cx));
        }

        root.child(trigger)
            .when(self.open && !self.body.is_empty(), |this| {
                this.child(
                    div()
                        .w_full()
                        .pl(px(22.0))
                        .text_sm()
                        .text_color(theme.muted_foreground)
                        .child(self.body),
                )
            })
    }
}
