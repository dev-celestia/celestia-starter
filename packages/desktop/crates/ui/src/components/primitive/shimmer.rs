//! Celestia shimmer text — the desktop counterpart of the web
//! `packages/ui/src/components/ai/shimmer.tsx`.
//!
//! Two modes:
//!
//! - [`ShimmerKind::Pulse`] — the whole label breathes (opacity / tint). Cheap
//!   and phase-locked across siblings via `repeat_synced`.
//! - [`ShimmerKind::Wave`] — a highlight band travels across glyphs (web-like
//!   “shimmering text”). Each character is its own animated span on the same
//!   synced clock.
//!
//! Under reduced motion the label renders at rest and schedules no frames.

use std::time::Duration;

use gpui::{
    Animation, AnimationExt as _, App, ElementId, Hsla, IntoElement, ParentElement as _,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, bounce, div,
    ease_in_out,
};

use crate::theme::ActiveTheme as _;

/// How the shimmer moves across the label.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ShimmerKind {
    /// Whole-label opacity / tint breathe.
    #[default]
    Pulse,
    /// Travelling highlight band across characters (web-style).
    Wave,
}

/// Appearance and timing of a shimmering label.
#[derive(Clone, Copy, Debug)]
pub struct ShimmerStyle {
    duration: Duration,
    highlight_color: Option<Hsla>,
    once: bool,
    kind: ShimmerKind,
    /// Wave width as a fraction of the string (0.15–0.6 typical).
    spread: f32,
}

impl ShimmerStyle {
    /// A two-second, looping pulse.
    pub fn new() -> Self {
        Self::default()
    }

    /// Travelling-band defaults (2.4s loop, mid spread).
    pub fn wave() -> Self {
        Self {
            duration: Duration::from_millis(2400),
            highlight_color: None,
            once: false,
            kind: ShimmerKind::Wave,
            spread: 0.35,
        }
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

    /// Pulse vs travelling wave.
    pub fn kind(mut self, kind: ShimmerKind) -> Self {
        self.kind = kind;
        self
    }

    /// Width of the travelling highlight (wave mode only), `0.0..=1.0`.
    pub fn spread(mut self, spread: f32) -> Self {
        self.spread = spread.clamp(0.1, 1.0);
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
            kind: ShimmerKind::Pulse,
            spread: 0.35,
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
    /// Shimmering text with the default two-second pulse loop.
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            text: text.into(),
            style: StyleRefinement::default(),
            shimmer_style: ShimmerStyle::default(),
            id: None,
        }
    }

    /// Travelling-wave shimmer (web-like band across glyphs).
    pub fn wave(text: impl Into<SharedString>) -> Self {
        Self {
            text: text.into(),
            style: StyleRefinement::default(),
            shimmer_style: ShimmerStyle::wave(),
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

    /// Pulse vs travelling wave.
    pub fn kind(mut self, kind: ShimmerKind) -> Self {
        self.shimmer_style = self.shimmer_style.kind(kind);
        self
    }

    /// Wave band width (`0.0..=1.0`).
    pub fn spread(mut self, spread: f32) -> Self {
        self.shimmer_style = self.shimmer_style.spread(spread);
        self
    }
}

impl Styled for ShimmerText {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ShimmerText {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        match self.shimmer_style.kind {
            ShimmerKind::Pulse => self.render_pulse().into_any_element(),
            ShimmerKind::Wave => self.render_wave(cx).into_any_element(),
        }
    }
}

impl ShimmerText {
    fn render_pulse(self) -> impl IntoElement {
        let id = self.id.unwrap_or_else(|| self.text.clone().into());
        let text = self.text;
        let highlight = self.shimmer_style.highlight_color;
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

    fn render_wave(self, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let base_id = self.id.unwrap_or_else(|| self.text.clone().into());
        let chars: Vec<char> = self.text.chars().collect();
        let n = chars.len().max(1) as f32;
        let spread = self.shimmer_style.spread;
        let highlight = self
            .shimmer_style
            .highlight_color
            .unwrap_or(theme.foreground);
        let base = theme.muted_foreground;
        let animation = self.shimmer_style.animation();

        let mut row = div().flex().flex_row().items_baseline().min_w_0();
        row.style().refine(&self.style);

        // Each glyph shares the synced clock but samples a different phase.
        row.children(chars.into_iter().enumerate().map(|(i, ch)| {
            let pos = (i as f32 + 0.5) / n;
            let glyph = if ch == ' ' {
                SharedString::from("\u{00a0}")
            } else {
                SharedString::from(ch.to_string())
            };
            let anim = animation.clone();
            div().child(glyph).with_animation(
                (base_id.clone(), SharedString::from(format!("{i}"))),
                anim,
                move |this, delta| {
                    let mut d = (pos - delta).abs();
                    if d > 0.5 {
                        d = 1.0 - d;
                    }
                    let intensity = (1.0 - d / (spread * 0.5)).clamp(0.0, 1.0);
                    let color = mix_hsla(base, highlight, intensity);
                    this.text_color(color).opacity(0.4 + 0.6 * intensity)
                },
            )
        }))
    }
}

fn mix_hsla(a: Hsla, b: Hsla, t: f32) -> Hsla {
    let t = t.clamp(0.0, 1.0);
    Hsla {
        h: a.h + (b.h - a.h) * t,
        s: a.s + (b.s - a.s) * t,
        l: a.l + (b.l - a.l) * t,
        a: a.a + (b.a - a.a) * t,
    }
}
