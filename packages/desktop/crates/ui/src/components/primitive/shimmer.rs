//! Celestia shimmer text — the desktop counterpart of the web
//! `packages/ui/src/components/ai/shimmer.tsx`.
//!
//! Text that breathes while work is in flight: the label sweeps between full
//! strength and [`ShimmerStyle::highlight_color`], on the shared clock so
//! sibling labels stay in phase.
//!
//! **Deviation from the web, on purpose.** The web paints a *travelling
//! gradient band* across the glyphs, which needs a custom `gpui::Element` that
//! re-lays-out text runs per frame and masks glyph paints. This desktop
//! version instead pulses the whole label's opacity — the same "work in
//! flight" read, with no per-frame text shaping and no private glyph
//! internals. If the travelling band is ever wanted, it belongs in a custom
//! `Element` here, not in a wrapper.
//!
//! Under reduced motion the label renders at rest and schedules no frames.

use std::time::Duration;

use gpui::{
    Animation, AnimationExt as _, App, ElementId, Hsla, IntoElement, ParentElement as _,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, bounce, div,
    ease_in_out,
};

/// Appearance and timing of a shimmering label.
#[derive(Clone, Copy, Debug)]
pub struct ShimmerStyle {
    duration: Duration,
    highlight_color: Option<Hsla>,
    once: bool,
}

impl ShimmerStyle {
    /// A two-second, looping sweep.
    pub fn new() -> Self {
        Self::default()
    }

    /// Set the duration of one sweep; zero is clamped to one millisecond.
    pub fn duration(mut self, duration: Duration) -> Self {
        self.duration = duration.max(Duration::from_millis(1));
        self
    }

    /// Tint the peak of the sweep. `None` keeps the inherited text color and
    /// varies only opacity.
    pub fn highlight_color(mut self, color: impl Into<Hsla>) -> Self {
        self.highlight_color = Some(color.into());
        self
    }

    /// Sweep once instead of looping.
    pub fn once(mut self, once: bool) -> Self {
        self.once = once;
        self
    }

    /// The clock this style implies — the one [`ShimmerText`] rides.
    ///
    /// Exposed so an element that cannot be a [`ShimmerText`] (arbitrary
    /// content rather than a label, as in a loading marker) still pulses on the
    /// *same* schedule instead of inventing a second, drifting one.
    pub(crate) fn animation(&self) -> Animation {
        if self.once {
            Animation::new(self.duration)
        } else {
            Animation::new(self.duration).repeat_synced()
        }
    }
}

impl Default for ShimmerStyle {
    fn default() -> Self {
        Self {
            duration: Duration::from_secs(2),
            highlight_color: None,
            once: false,
        }
    }
}

/// A label that shimmers while work is in flight.
#[derive(IntoElement)]
pub struct ShimmerText {
    text: SharedString,
    style: StyleRefinement,
    shimmer_style: ShimmerStyle,
    id: Option<ElementId>,
}

impl ShimmerText {
    /// Shimmering text with the default two-second loop.
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            text: text.into(),
            style: StyleRefinement::default(),
            shimmer_style: ShimmerStyle::default(),
            id: None,
        }
    }

    /// Set an explicit animation identity. Needed when two sibling labels carry
    /// identical text — the text itself is the default id, so identical strings
    /// would otherwise share one animation slot.
    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = Some(id.into());
        self
    }

    /// Apply a reusable appearance and timing configuration.
    pub fn with_shimmer_style(mut self, style: ShimmerStyle) -> Self {
        self.shimmer_style = style;
        self
    }

    /// Set the duration of one sweep.
    pub fn duration(mut self, duration: Duration) -> Self {
        self.shimmer_style = self.shimmer_style.duration(duration);
        self
    }

    /// Tint the peak of the sweep.
    pub fn highlight_color(mut self, color: impl Into<Hsla>) -> Self {
        self.shimmer_style = self.shimmer_style.highlight_color(color);
        self
    }

    /// Sweep once instead of looping.
    pub fn once(mut self, once: bool) -> Self {
        self.shimmer_style = self.shimmer_style.once(once);
        self
    }
}

impl Styled for ShimmerText {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ShimmerText {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let id = self.id.unwrap_or_else(|| self.text.clone().into());
        let text = self.text;
        let highlight = self.shimmer_style.highlight_color;

        // `repeat_synced` phase-locks every mounted shimmer to one clock, so a
        // row of labels breathes together instead of drifting.
        let animation = self.shimmer_style.animation();

        let mut label = div().min_w_0().child(text);
        label.style().refine(&self.style);

        label.with_animation(
            id,
            animation.with_easing(bounce(ease_in_out)),
            move |this, delta| {
                let this = this.opacity(0.55 + 0.45 * delta);
                match highlight {
                    Some(color) => this.text_color(color.opacity(0.4 + 0.6 * delta)),
                    None => this,
                }
            },
        )
    }
}
