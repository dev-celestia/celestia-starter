//! Celestia spinner — the desktop counterpart of
//! `packages/ui/src/components/primitive/spinner.tsx`.
//!
//! Web: the Phosphor `Spinner` glyph at `size-4` with `animate-spin`. The glyph
//! is the vendored Phosphor `spinner-gap`, and the spin is a one-turn-per-cycle
//! rotation.
//!
//! GPUI gives no element transform, so the rotation rides on the SVG's own
//! `Transformation` — see [`crate::components::primitive::icon::Phosphor::rotation`]. Under
//! reduced motion `with_animation` renders the start state and schedules no
//! frames, so the spinner simply parks.

use std::time::Duration;

use gpui::{
    Animation, AnimationExt as _, App, Hsla, IntoElement, Pixels, RenderOnce, Window, percentage,
    px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};

/// A cycling loading spinner.
#[derive(IntoElement)]
pub struct Spinner {
    size: Pixels,
    speed: Duration,
    color: Option<Hsla>,
    icon: PhosphorIcon,
}

impl Spinner {
    /// A 16px (`size-4`) spinner on the inherited text color, one turn per
    /// 800ms.
    pub fn new() -> Self {
        Self {
            size: px(16.0),
            speed: Duration::from_millis(800),
            color: None,
            icon: PhosphorIcon::SpinnerGap,
        }
    }

    /// Set the glyph size.
    pub fn size(mut self, size: impl Into<Pixels>) -> Self {
        self.size = size.into();
        self
    }

    /// Set the glyph color; defaults to the surrounding text color.
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = Some(color.into());
        self
    }

    /// Replace the spinning glyph. It should read as a rotationally symmetric
    /// loading mark — [`PhosphorIcon::SpinnerGap`] is the default.
    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = icon;
        self
    }

    /// Set the duration of one full turn.
    pub fn speed(mut self, speed: Duration) -> Self {
        self.speed = speed;
        self
    }
}

impl Default for Spinner {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for Spinner {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut icon = Phosphor::new(self.icon).size(self.size);
        if let Some(color) = self.color {
            icon = icon.color(color);
        }

        icon.with_animation(
            "spinner",
            Animation::new(self.speed).repeat(),
            |icon, delta| icon.rotation(percentage(delta)),
        )
    }
}
