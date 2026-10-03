//! Celestia badge — the desktop counterpart of
//! `packages/ui/src/components/primitive/badge.tsx`.
//!
//! A small chip rendered with gpui-kit's `Tag`, whose `Custom` variant lets us
//! resolve every shadcn badge variant from Celestia theme colors. Count/dot
//! notification badges (no web counterpart) are available as [`GpuiBadge`].

use gpui_kit::component::ActiveTheme;
use gpui_kit::component::tag::Tag;
use gpui_kit::{App, IntoElement, ParentElement as _, RenderOnce, SharedString, Window};

use crate::palette;

/// Count/dot notification badges (no web counterpart).
pub use gpui_kit::component::badge::Badge as GpuiBadge;

/// Badge color variant (web `variant` prop).
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum BadgeVariant {
    /// Filled brand red (web `default`).
    #[default]
    Default,
    /// Muted gray fill.
    Secondary,
    /// Danger fill.
    Destructive,
    /// Bordered, transparent fill.
    Outline,
    /// Success tint.
    Success,
    /// Warning tint.
    Warning,
    /// Info tint.
    Info,
    /// Brand accent — the landing `--brand` red, not the theme primary.
    Brand,
}

/// The Celestia badge chip.
#[derive(IntoElement)]
pub struct Badge {
    label: SharedString,
    variant: BadgeVariant,
}

impl Badge {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
            variant: BadgeVariant::default(),
        }
    }

    pub fn variant(mut self, variant: BadgeVariant) -> Self {
        self.variant = variant;
        self
    }
}

impl RenderOnce for Badge {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let tag = match self.variant {
            BadgeVariant::Default => Tag::primary(),
            BadgeVariant::Secondary => Tag::secondary(),
            BadgeVariant::Destructive => Tag::danger(),
            BadgeVariant::Success => Tag::success(),
            BadgeVariant::Warning => Tag::warning(),
            BadgeVariant::Info => Tag::info(),
            BadgeVariant::Outline => Tag::secondary().outline(),
            BadgeVariant::Brand => Tag::custom(
                palette(cx).brand(),
                palette(cx).brand_foreground(),
                theme.border,
            ),
        };
        tag.child(self.label)
    }
}
