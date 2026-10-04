//! Celestia avatar — the desktop counterpart of
//! `packages/ui/src/components/primitive/avatar.tsx`.
//!
//! Wraps gpui-kit's `Avatar` with the web's three-step size scale
//! (`sm` 24px / `default` 32px / `lg` 40px) instead of gpui-kit's own
//! 16/24/48/80px ladder. [`Sizable`] still accepts explicit overrides.
//! [`AvatarGroup`] is re-exported unchanged; it takes the raw gpui-kit avatar,
//! so hand it [`Avatar::into_inner`] results.
//!
//! # Why the box and the text step are set separately
//!
//! gpui-kit derives both the box (`avatar_size`) and the fallback's type size
//! (`avatar_text_size`) from one `Size`, and its ladder does not line up with
//! the web's: the web's `lg` is a 40px box with `text-sm` initials, but
//! gpui-kit's nearest preset for 40px is a `Size::Size(px(40.))` override,
//! which computes the text as `size * 0.5` = 20px. The two are therefore set
//! from two sources — [`Sizable::with_size`] picks the text step, and a plain
//! `Styled::size` pins the box — because gpui-kit applies its own `style`
//! refinement last, so the explicit box wins while the text step is left alone.
//! The result is 24/12px, 32/14px and 40/14px, which is what the web renders.
//!
//! The web's `after:border after:border-border` ring needs no work here:
//! gpui-kit's avatar already draws a 1px `theme.border` edge.

use gpui_component::Icon;
use gpui_component::avatar::Avatar as GpuiAvatar;
use gpui_component::{Sizable, Size};
use gpui::{
    App, ImageSource, InteractiveElement, Interactivity, IntoElement, Pixels, RenderOnce,
    SharedString, StyleRefinement, Styled, Window, px,
};

/// Stacked avatar row, re-exported unchanged from gpui-kit (takes raw
/// gpui-kit avatars — hand it [`Avatar::into_inner`] results).
pub use gpui_component::avatar::AvatarGroup;

/// Box size and fallback type step (web `size` prop).
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum AvatarSize {
    /// 24px box with 12px initials (web `sm` / `size-6` + `text-xs`).
    Small,
    /// 32px box with 14px initials (web `default` / `size-8` + `text-sm`).
    #[default]
    Default,
    /// 40px box with 14px initials (web `lg` / `size-10`; only `sm` steps the
    /// type down).
    Large,
}

impl AvatarSize {
    /// The box, in pixels.
    pub fn px(self) -> Pixels {
        match self {
            AvatarSize::Small => px(24.),
            AvatarSize::Default => px(32.),
            AvatarSize::Large => px(40.),
        }
    }

    /// The gpui-kit step whose *text* size matches this box. `Default` and
    /// `Large` both want `text-sm`, which is `Medium`.
    fn text_step(self) -> Size {
        match self {
            AvatarSize::Small => Size::Small,
            AvatarSize::Default | AvatarSize::Large => Size::Medium,
        }
    }
}

/// The Celestia avatar.
#[derive(IntoElement)]
pub struct Avatar(GpuiAvatar);

impl Default for Avatar {
    fn default() -> Self {
        Self::new()
    }
}

impl Avatar {
    pub fn new() -> Self {
        Self::sized(AvatarSize::default())
    }

    fn sized(size: AvatarSize) -> Self {
        Self(
            GpuiAvatar::new()
                .with_size(size.text_step())
                .size(size.px()),
        )
    }

    /// Set the web's `size` prop (`sm` / `default` / `lg`).
    pub fn size(self, size: AvatarSize) -> Self {
        Self::sized(size)
    }

    /// Set to use image source for the avatar.
    pub fn src(mut self, source: impl Into<ImageSource>) -> Self {
        self.0 = self.0.src(source);
        self
    }

    /// Set name of the avatar user, if `src` is none, will use this name as placeholder.
    pub fn name(mut self, name: impl Into<SharedString>) -> Self {
        self.0 = self.0.name(name);
        self
    }

    /// Set placeholder icon, default: `IconName::User`.
    pub fn placeholder(mut self, icon: impl Into<Icon>) -> Self {
        self.0 = self.0.placeholder(icon);
        self
    }

    /// Unwrap the underlying gpui-kit avatar (e.g. to feed `AvatarGroup`).
    pub fn into_inner(self) -> GpuiAvatar {
        self.0
    }
}

impl Sizable for Avatar {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.0 = self.0.with_size(size);
        self
    }
}

impl Styled for Avatar {
    fn style(&mut self) -> &mut StyleRefinement {
        self.0.style()
    }
}

impl InteractiveElement for Avatar {
    fn interactivity(&mut self) -> &mut Interactivity {
        self.0.interactivity()
    }
}

impl RenderOnce for Avatar {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        self.0.render(window, cx)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sizes_match_the_web_ladder() {
        assert_eq!(AvatarSize::Small.px(), px(24.));
        assert_eq!(AvatarSize::Default.px(), px(32.));
        assert_eq!(AvatarSize::Large.px(), px(40.));
        assert_eq!(AvatarSize::default(), AvatarSize::Default);
    }

    /// The text step is what makes `lg` 40px with 14px initials rather than
    /// gpui-kit's 20px — pin it so a later "simplification" cannot quietly
    /// route `lg` back through `Size::Size(px(40.))`.
    #[test]
    fn text_steps_follow_the_web_not_the_gpui_ladder() {
        assert_eq!(AvatarSize::Small.text_step(), Size::Small);
        assert_eq!(AvatarSize::Default.text_step(), Size::Medium);
        assert_eq!(AvatarSize::Large.text_step(), Size::Medium);
        assert_ne!(AvatarSize::Large.text_step(), Size::Large);
    }
}
