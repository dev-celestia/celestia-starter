//! ContextUsage — token budget meter for the active model.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// Compact context-window usage indicator.
#[derive(IntoElement)]
pub struct ContextUsage {
    id: ElementId,
    style: StyleRefinement,
    used_tokens: u64,
    max_tokens: u64,
    model_id: Option<SharedString>,
    show_label: bool,
}

impl ContextUsage {
    pub fn new(id: impl Into<ElementId>, used_tokens: u64, max_tokens: u64) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            used_tokens,
            max_tokens: max_tokens.max(1),
            model_id: None,
            show_label: true,
        }
    }

    pub fn model_id(mut self, model_id: impl Into<SharedString>) -> Self {
        self.model_id = Some(model_id.into());
        self
    }

    pub fn show_label(mut self, show: bool) -> Self {
        self.show_label = show;
        self
    }
}

impl Styled for ContextUsage {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ContextUsage {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let pct = (self.used_tokens as f32 / self.max_tokens as f32).clamp(0.0, 1.0);
        let pct_label = format!("{}%", ((pct * 100.0).round() as u32).min(100));

        let mut root = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(10.0));
        root.style().refine(&self.style);

        root.child(
            div()
                .w(px(72.0))
                .h(px(6.0))
                .rounded_full()
                .bg(theme.muted)
                .overflow_hidden()
                .child(
                    div()
                        .h_full()
                        .w(px(72.0 * pct))
                        .rounded_full()
                        .bg(theme.accent),
                ),
        )
        .when(self.show_label, |this| {
            this.child(
                div()
                    .flex()
                    .flex_col()
                    .gap(px(1.0))
                    .child(
                        div()
                            .text_xs()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.foreground)
                            .child(pct_label),
                    )
                    .when_some(self.model_id.clone(), |d, model| {
                        d.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(model),
                        )
                    })
                    .when(self.model_id.is_none(), |d| {
                        d.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(format!(
                                    "{} / {} tokens",
                                    self.used_tokens, self.max_tokens
                                )),
                        )
                    }),
            )
        })
    }
}
