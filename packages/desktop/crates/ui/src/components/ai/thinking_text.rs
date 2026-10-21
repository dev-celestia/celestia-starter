//! ThinkingText — animated AI status label (“Thinking…”, “Searching…”).
//!
//! Combines a travelling-wave [`ShimmerText`](crate::components::primitive::shimmer::ShimmerText)
//! with cycling ellipsis dots so in-flight agent work reads as live.

use std::time::Duration;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    Animation, AnimationExt as _, App, ElementId, InteractiveElement as _, IntoElement,
    ParentElement as _, Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window,
    div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::primitive::shimmer::{ShimmerStyle, ShimmerText};
use crate::theme::ActiveTheme as _;

/// Animated status line used while the model is thinking / searching / streaming.
#[derive(IntoElement)]
pub struct ThinkingText {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    show_icon: bool,
    show_dots: bool,
    duration: Duration,
}

impl ThinkingText {
    /// Default “Thinking” status with wave shimmer and cycling dots.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: "Thinking".into(),
            show_icon: true,
            show_dots: true,
            duration: Duration::from_millis(2400),
        }
    }

    /// Custom status verb (`"Searching"`, `"Planning"`, …).
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = label.into();
        self
    }

    pub fn show_icon(mut self, show: bool) -> Self {
        self.show_icon = show;
        self
    }

    pub fn show_dots(mut self, show: bool) -> Self {
        self.show_dots = show;
        self
    }

    pub fn duration(mut self, duration: Duration) -> Self {
        self.duration = duration.max(Duration::from_millis(1));
        self
    }
}

impl Styled for ThinkingText {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ThinkingText {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let muted = theme.muted_foreground;

        let shimmer = ShimmerText::wave(self.label.clone())
            .id((self.id.clone(), "label"))
            .with_shimmer_style(
                ShimmerStyle::wave()
                    .duration(self.duration)
                    .highlight_color(theme.foreground)
                    .spread(0.4),
            );

        let mut root = div()
            .id(self.id.clone())
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .min_w_0()
            .text_sm();
        root.style().refine(&self.style);

        root.when(self.show_icon, |this| {
            this.child(
                Phosphor::new(PhosphorIcon::Brain)
                    .size(px(14.0))
                    .color(muted),
            )
        })
        .child(shimmer)
        .when(self.show_dots, |this| {
            this.child(AnimatedDots::new((self.id, "dots")).duration(self.duration))
        })
    }
}

/// Three cycling ellipsis dots, phase-locked via `repeat_synced`.
#[derive(IntoElement)]
struct AnimatedDots {
    id: ElementId,
    duration: Duration,
}

impl AnimatedDots {
    fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            duration: Duration::from_millis(2400),
        }
    }

    fn duration(mut self, duration: Duration) -> Self {
        self.duration = duration;
        self
    }
}

impl RenderOnce for AnimatedDots {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let anim = Animation::new(self.duration).repeat_synced();

        div()
            .id(self.id.clone())
            .flex()
            .flex_row()
            .items_center()
            .gap(px(3.0))
            .children((0..3).map(|i| {
                let phase = i as f32 / 3.0;
                let anim = anim.clone();
                div()
                    .id(ElementId::Name(format!("dot-{i}").into()))
                    .size(px(3.5))
                    .rounded_full()
                    .bg(muted)
                    .with_animation(
                        ElementId::Name(format!("thinking-dot-anim-{i}").into()),
                        anim,
                        move |this, delta| {
                            // Soft pulse; stagger so dots light left→right.
                            let mut d = (delta - phase).rem_euclid(1.0);
                            if d > 0.5 {
                                d = 1.0 - d;
                            }
                            let intensity = (1.0f32 - d * 3.0).clamp(0.2, 1.0);
                            this.opacity(intensity)
                        },
                    )
            }))
    }
}

/// Wave-shimmer label without icon or dots — drop-in for streaming titles.
#[derive(IntoElement)]
pub struct ThinkingShimmer {
    text: SharedString,
    id: Option<ElementId>,
    style: StyleRefinement,
}

impl ThinkingShimmer {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            text: text.into(),
            id: None,
            style: StyleRefinement::default(),
        }
    }

    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = Some(id.into());
        self
    }
}

impl Styled for ThinkingShimmer {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ThinkingShimmer {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut shimmer = ShimmerText::wave(self.text)
            .with_shimmer_style(ShimmerStyle::wave().highlight_color(theme.foreground));
        if let Some(id) = self.id {
            shimmer = shimmer.id(id);
        }
        shimmer.style().refine(&self.style);
        shimmer
    }
}
