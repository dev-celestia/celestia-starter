//! Celestia skeleton — the desktop counterpart of
//! `packages/ui/src/components/primitive/skeleton.tsx`.
//!
//! Web: `animate-pulse rounded-md bg-muted`. The pulse is a ping-pong opacity
//! sweep (1 → 0.5 → 1), which is what `animate-pulse` is; `bounce(ease_in_out)`
//! makes gpui's repeating animation play back as a triangle wave rather than a
//! sawtooth, so there is no visible jump at the loop point.
//!
//! Size comes from [`Styled`] — `Skeleton::new().h_4().w(px(192.))` — and is
//! refined over the `w_full().h_4()` default.

use std::time::Duration;

use gpui::{
    Animation, AnimationExt as _, App, IntoElement, Refineable as _, RenderOnce, StyleRefinement,
    Styled, Window, bounce, div, ease_in_out, px,
};

use crate::theme::ActiveTheme as _;

/// A pulsing placeholder block.
#[derive(IntoElement)]
pub struct Skeleton {
    style: StyleRefinement,
    secondary: bool,
}

impl Skeleton {
    /// A full-width, 16px-tall block on the muted surface.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            secondary: false,
        }
    }

    /// Use a half-strength muted fill, for a block sitting on an already-muted
    /// surface.
    pub fn secondary(mut self) -> Self {
        self.secondary = true;
        self
    }
}

impl Default for Skeleton {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for Skeleton {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Skeleton {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let fill = if self.secondary {
            theme.muted.opacity(0.5)
        } else {
            theme.muted
        };

        let mut block = div().w_full().h_4().rounded(px(6.0)).bg(fill);
        // `Skeleton::new().h_4().w(px(192.))` refines over the defaults above.
        block.style().refine(&self.style);

        block.with_animation(
            "skeleton",
            Animation::new(Duration::from_secs(2))
                .repeat()
                .with_easing(bounce(ease_in_out)),
            |this, delta| this.opacity(1.0 - delta * 0.5),
        )
    }
}
