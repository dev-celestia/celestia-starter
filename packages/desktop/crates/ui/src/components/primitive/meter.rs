//! Meter — a labelled capacity / level bar.
//!
//! Distinct from [`Progress`](super::progress::Progress): meters show a
//! discrete level (disk, memory, quota) with an optional threshold tone, not a
//! task completion percentage. No web counterpart.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px, relative,
};

use crate::theme::ActiveTheme as _;

/// Semantic tone for a [`Meter`] fill.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum MeterTone {
    #[default]
    Default,
    Success,
    Warning,
    Danger,
}

/// A labelled horizontal level bar. `value` is clamped to `0.0..=1.0`.
#[derive(IntoElement)]
pub struct Meter {
    id: ElementId,
    style: StyleRefinement,
    label: Option<SharedString>,
    value_label: Option<SharedString>,
    value: f32,
    tone: MeterTone,
    /// Auto-pick Warning ≥ 0.7 and Danger ≥ 0.9 when tone is Default.
    auto_tone: bool,
}

impl Meter {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: None,
            value_label: None,
            value: 0.0,
            tone: MeterTone::default(),
            auto_tone: true,
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Trailing caption (e.g. `"12 GB / 64 GB"`).
    pub fn value_label(mut self, label: impl Into<SharedString>) -> Self {
        self.value_label = Some(label.into());
        self
    }

    pub fn value(mut self, value: f32) -> Self {
        self.value = value.clamp(0.0, 1.0);
        self
    }

    pub fn tone(mut self, tone: MeterTone) -> Self {
        self.tone = tone;
        self.auto_tone = false;
        self
    }

    pub fn auto_tone(mut self, enabled: bool) -> Self {
        self.auto_tone = enabled;
        self
    }
}

impl Styled for Meter {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Meter {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let tone = if self.auto_tone && matches!(self.tone, MeterTone::Default) {
            if self.value >= 0.9 {
                MeterTone::Danger
            } else if self.value >= 0.7 {
                MeterTone::Warning
            } else {
                MeterTone::Default
            }
        } else {
            self.tone
        };
        let fill = match tone {
            MeterTone::Default => theme.accent,
            MeterTone::Success => theme.success,
            MeterTone::Warning => theme.warning,
            MeterTone::Danger => theme.danger,
        };
        let pct = relative(self.value);

        let mut root = div().id(self.id).w_full().flex().flex_col().gap(px(6.0));
        root.style().refine(&self.style);

        root.when(self.label.is_some() || self.value_label.is_some(), |this| {
            this.child(
                div()
                    .w_full()
                    .flex()
                    .flex_row()
                    .items_center()
                    .justify_between()
                    .gap(px(8.0))
                    .when_some(self.label, |d, label| {
                        d.child(
                            div()
                                .text_xs()
                                .font_weight(FontWeight::MEDIUM)
                                .text_color(theme.muted_foreground)
                                .child(label),
                        )
                    })
                    .when_some(self.value_label, |d, label| {
                        d.child(
                            div()
                                .text_xs()
                                .font_weight(FontWeight::MEDIUM)
                                .text_color(theme.foreground)
                                .child(label),
                        )
                    }),
            )
        })
        .child(
            div()
                .w_full()
                .h(px(8.0))
                .rounded_full()
                .bg(theme.muted)
                .overflow_hidden()
                .child(div().h_full().w(pct).rounded_full().bg(fill)),
        )
    }
}
