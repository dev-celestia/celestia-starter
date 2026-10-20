//! AiTerminal — presentational terminal output panel.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px, rgb,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Dark terminal chrome with title and streaming status.
#[derive(IntoElement)]
pub struct AiTerminal {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    output: SharedString,
    streaming: bool,
}

impl AiTerminal {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: "Terminal".into(),
            output: SharedString::default(),
            streaming: false,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn output(mut self, output: impl Into<SharedString>) -> Self {
        self.output = output.into();
        self
    }

    pub fn streaming(mut self, streaming: bool) -> Self {
        self.streaming = streaming;
        self
    }
}

impl Styled for AiTerminal {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for AiTerminal {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        // Terminal keeps a dark surface regardless of app light/dark — matches web.
        let bg = rgb(0x18181b);
        let border = rgb(0x27272a);
        let muted = rgb(0xa1a1aa);
        let fg = rgb(0xfafafa);

        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .rounded(theme.radius)
            .border_1()
            .border_color(border)
            .bg(bg)
            .overflow_hidden();
        root.style().refine(&self.style);

        root.child(
            div()
                .w_full()
                .px(px(12.0))
                .py(px(8.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .border_b_1()
                .border_color(border)
                .child(
                    Phosphor::new(PhosphorIcon::TerminalWindow)
                        .size(px(14.0))
                        .color(muted),
                )
                .child(
                    div()
                        .flex_1()
                        .text_sm()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(muted)
                        .child(self.title),
                )
                .when(self.streaming, |d| {
                    d.child(div().text_xs().text_color(muted).child("Streaming…"))
                }),
        )
        .child(
            div()
                .w_full()
                .p(px(12.0))
                .min_h(px(80.0))
                .font_family(theme.mono_font_family.clone())
                .text_sm()
                .text_color(fg)
                .child(if self.output.is_empty() {
                    SharedString::from("$ ")
                } else {
                    self.output
                }),
        )
    }
}
