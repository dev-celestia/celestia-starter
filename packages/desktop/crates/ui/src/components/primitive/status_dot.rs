//! StatusDot — a small presence / health indicator.
//!
//! No web counterpart in `packages/ui`; pairs with [`Avatar`](super::avatar)
//! overlays and list rows that need an online / away / busy / offline cue.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ElementId, InteractiveElement, IntoElement, ParentElement, Refineable as _, RenderOnce,
    SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// Semantic tone for a [`StatusDot`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum StatusDotTone {
    #[default]
    Neutral,
    Online,
    Away,
    Busy,
    Offline,
}

/// Size of a [`StatusDot`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum StatusDotSize {
    #[default]
    Sm,
    Md,
    Lg,
}

/// A coloured presence / health pip, optionally labelled.
#[derive(IntoElement)]
pub struct StatusDot {
    id: ElementId,
    style: StyleRefinement,
    tone: StatusDotTone,
    size: StatusDotSize,
    label: Option<SharedString>,
    /// Draw a ring so the pip reads on dark media (avatar overlay).
    ring: bool,
    pulse: bool,
}

impl StatusDot {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            tone: StatusDotTone::default(),
            size: StatusDotSize::default(),
            label: None,
            ring: false,
            pulse: false,
        }
    }

    pub fn tone(mut self, tone: StatusDotTone) -> Self {
        self.tone = tone;
        self
    }

    pub fn online(mut self) -> Self {
        self.tone = StatusDotTone::Online;
        self
    }

    pub fn away(mut self) -> Self {
        self.tone = StatusDotTone::Away;
        self
    }

    pub fn busy(mut self) -> Self {
        self.tone = StatusDotTone::Busy;
        self
    }

    pub fn offline(mut self) -> Self {
        self.tone = StatusDotTone::Offline;
        self
    }

    pub fn size(mut self, size: StatusDotSize) -> Self {
        self.size = size;
        self
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Draw a contrasting ring — useful when overlaying an avatar.
    pub fn ring(mut self, ring: bool) -> Self {
        self.ring = ring;
        self
    }

    /// Soft outer glow suggesting a live/active state.
    pub fn pulse(mut self, pulse: bool) -> Self {
        self.pulse = pulse;
        self
    }
}

impl Styled for StatusDot {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for StatusDot {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let color = match self.tone {
            StatusDotTone::Neutral => theme.muted_foreground,
            StatusDotTone::Online => theme.success,
            StatusDotTone::Away => theme.warning,
            StatusDotTone::Busy => theme.danger,
            StatusDotTone::Offline => theme.border,
        };
        let diameter = match self.size {
            StatusDotSize::Sm => px(8.0),
            StatusDotSize::Md => px(10.0),
            StatusDotSize::Lg => px(12.0),
        };

        let mut root = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0));
        root.style().refine(&self.style);

        root.child(
            div()
                .size(diameter)
                .rounded_full()
                .bg(color)
                .when(self.ring, |this| {
                    this.border_2().border_color(theme.background)
                })
                .when(self.pulse, |this| {
                    this.border_2().border_color(color.opacity(0.35))
                }),
        )
        .when_some(self.label, |this, label| {
            this.child(
                div()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child(label),
            )
        })
    }
}
