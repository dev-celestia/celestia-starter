//! Celestia avatar — the desktop counterpart of
//! `packages/ui/src/components/primitive/avatar.tsx`, written on raw `gpui`.
//!
//! The web's three-step size scale (`sm` 24px / `default` 32px / `lg` 40px)
//! with initials at 12px for the small box and 14px for the two larger ones.
//! [`Sizable`] accepts the full crate [`Size`] ladder (16 / 24 / 32 / 40px,
//! plus a pixel override) for the steps the web prop does not name.
//!
//! # Fallbacks and the identity ring
//!
//! An avatar renders three layers: a fallback surface (initials, or the
//! placeholder icon when no name is given), and — when [`Avatar::src`] is set —
//! the image painted over it. gpui's `img` paints nothing for a source that
//! fails to load, so the fallback shows through; no loading state machine is
//! needed.
//!
//! The initials draw their own colors from the name: a ring of 12 evenly
//! spaced OkLCH hues at fixed lightness and chroma, picked by hashing the
//! initials so the same person always gets the same ones. Unlike an HSL
//! rotation, which changes perceived brightness as it turns, that keeps every
//! avatar at one visual weight and its text legible on every hue — the tests
//! below pin the WCAG AA contrast of the whole ring.
//!
//! The tinted outline belongs to the initials. An image, or the anonymous
//! placeholder, keeps the neutral `border` edge — the web's
//! `after:border after:border-border` ring.
//!
//! Grouped avatars live in [`AvatarGroup`], which overlaps the boxes by 30% of
//! the size step, mirroring the web group.

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

use gpui::{
    AnyElement, App, Div, Hsla, ImageSource, InteractiveElement, Interactivity, IntoElement,
    ObjectFit, ParentElement as _, Pixels, Refineable as _, RenderOnce, Rgba, SharedString,
    StyleRefinement, Styled, StyledImage as _, Window, div, img, prelude::FluentBuilder as _, px,
};

use crate::components::primitive::icon::PhosphorIcon;
use crate::components::traits::{Sizable, Size};
use crate::theme::ActiveTheme as _;

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
}

/// The box size for a [`Sizable`] step — the web ladder extended down to
/// `XSmall` (16px) for the compact rows the web prop does not name.
fn box_size(size: Size) -> Pixels {
    match size {
        Size::XSmall => px(16.),
        Size::Small => px(24.),
        Size::Medium | Size::Large => px(32.),
        Size::Size(size) => size,
    }
}

/// The fallback type size for a box: 12px up to and including the 24px box
/// (web `text-xs`), 14px above it (web `text-sm`).
fn text_size(box_px: Pixels) -> Pixels {
    if box_px <= px(24.) { px(12.) } else { px(14.) }
}

/// The Celestia avatar.
#[derive(IntoElement)]
pub struct Avatar {
    base: Div,
    style: StyleRefinement,
    src: Option<ImageSource>,
    name: Option<SharedString>,
    short_name: SharedString,
    placeholder: AnyElement,
    /// The `Sizable` step, which wins over the web [`AvatarSize`] prop when
    /// set.
    size: Option<Size>,
    ladder: AvatarSize,
}

impl Default for Avatar {
    fn default() -> Self {
        Self::new()
    }
}

impl Avatar {
    pub fn new() -> Self {
        Self {
            base: div(),
            style: StyleRefinement::default(),
            src: None,
            name: None,
            short_name: SharedString::default(),
            placeholder: PhosphorIcon::User.into_any_element(),
            size: None,
            ladder: AvatarSize::default(),
        }
    }

    /// Set the web's `size` prop (`sm` / `default` / `lg`).
    pub fn size(mut self, size: AvatarSize) -> Self {
        self.ladder = size;
        self
    }

    /// Set the image source for the avatar.
    pub fn src(mut self, source: impl Into<ImageSource>) -> Self {
        self.src = Some(source.into());
        self
    }

    /// Set name of the avatar user; if `src` is none, the initials render as
    /// the fallback (and pick the identity colors for it).
    pub fn name(mut self, name: impl Into<SharedString>) -> Self {
        let name: SharedString = name.into();
        let short: SharedString = extract_text_initials(&name).into();

        self.name = Some(name);
        self.short_name = short;
        self
    }

    /// Set the fallback icon shown when no name is given
    /// (default: [`PhosphorIcon::User`]).
    pub fn placeholder(mut self, icon: impl IntoElement) -> Self {
        self.placeholder = icon.into_any_element();
        self
    }

    /// Resolved box size — the [`Sizable`] step when set, else the web ladder.
    fn box_px(&self) -> Pixels {
        self.size.map(box_size).unwrap_or_else(|| self.ladder.px())
    }
}

impl Sizable for Avatar {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = Some(size.into());
        self
    }
}

impl Styled for Avatar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl InteractiveElement for Avatar {
    fn interactivity(&mut self) -> &mut Interactivity {
        self.base.interactivity()
    }
}

impl RenderOnce for Avatar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let box_px = self.box_px();
        let text_px = text_size(box_px);

        let identity = self
            .name
            .is_some()
            .then(|| IdentityColor::new(&self.short_name, cx));

        // The tinted outline belongs to the initials; an image or the
        // anonymous placeholder keeps the neutral border.
        let border_color = match (&identity, &self.src) {
            (Some(identity), None) => identity.border,
            _ => cx.theme().border,
        };

        let fallback = div()
            .size_full()
            .flex()
            .items_center()
            .justify_center()
            .overflow_hidden()
            .map(|this| match identity {
                Some(identity) => this
                    .bg(identity.background)
                    .text_color(identity.foreground)
                    .text_size(text_px)
                    .font_weight(gpui::FontWeight::MEDIUM)
                    .child(self.short_name.clone()),
                None => this
                    .bg(cx.theme().secondary)
                    .text_color(cx.theme().background)
                    .text_size(box_px * 0.5)
                    .child(self.placeholder),
            });

        self.base
            .size(box_px)
            .flex_shrink_0()
            .rounded_full()
            .overflow_hidden()
            .border_1()
            .border_color(border_color)
            .map(|this| match &self.src {
                Some(source) => this.child(
                    img(source.clone())
                        .size_full()
                        .object_fit(ObjectFit::Cover)
                        .rounded_full(),
                ),
                None => this.child(fallback),
            })
            .map(|mut this| {
                this.style().refine(&self.style);
                this
            })
    }
}

/// The colors a name-based fallback draws itself in, picked from the initials
/// so the same person always gets the same ones.
///
/// The ring is 12 evenly spaced OkLCH hues at a fixed lightness and chroma.
/// Unlike an HSL rotation, which changes perceived brightness as it turns, that
/// keeps every avatar at one visual weight and its text legible on every hue.
#[derive(Debug, Clone, Copy, PartialEq)]
struct IdentityColor {
    background: Hsla,
    foreground: Hsla,
    border: Hsla,
}

impl IdentityColor {
    const HUES: u64 = 12;
    const HUE_STEP: f32 = 360. / Self::HUES as f32;

    fn new(short_name: &SharedString, cx: &App) -> Self {
        let mut hasher = DefaultHasher::new();
        short_name.hash(&mut hasher);
        let hue = (hasher.finish() % Self::HUES) as f32 * Self::HUE_STEP;
        Self::from_hue(hue, cx.theme().mode.is_dark())
    }

    fn from_hue(hue: f32, is_dark: bool) -> Self {
        // Background and foreground hold WCAG AA against each other, and the
        // border carries the most chroma sRGB has at its lightness for every
        // hue. Both are pinned by the tests below.
        let (background, foreground, border) = if is_dark {
            (
                oklch(0.30, 0.05, hue),
                oklch(0.82, 0.11, hue),
                oklch(0.36, 0.06, hue),
            )
        } else {
            (
                oklch(0.97, 0.032, hue),
                oklch(0.50, 0.145, hue),
                oklch(0.89, 0.05, hue),
            )
        };

        Self {
            background,
            foreground,
            border,
        }
    }
}

/// An OkLCH color as a gpui [`Hsla`] — the same conversion
/// `theme.rs` documents for the token port (`oklch(L C H)` → OKLab → linear
/// sRGB, clamped at the gamut edge), kept here because the identity ring needs
/// it at runtime rather than in `theme.json`.
fn oklch(l: f32, c: f32, hue_degrees: f32) -> Hsla {
    // OkLCH → OkLab.
    let hue = hue_degrees.to_radians();
    let (a, b) = (c * hue.cos(), c * hue.sin());

    // OkLab → LMS′ (non-linear), then cube into LMS.
    let l_ = l + 0.396_337_78 * a + 0.215_803_76 * b;
    let m_ = l - 0.105_561_35 * a - 0.063_854_17 * b;
    let s_ = l - 0.089_484_18 * a - 1.291_485_55 * b;
    let (l, m, s) = (l_ * l_ * l_, m_ * m_ * m_, s_ * s_ * s_);

    // LMS → linear sRGB.
    let lr = 4.076_741_66 * l - 3.307_711_59 * m + 0.230_969_93 * s;
    let lg = -1.268_438_00 * l + 2.609_757_40 * m - 0.341_319_40 * s;
    let lb = -0.004_196_09 * l - 0.703_418_61 * m + 1.707_614_70 * s;

    // Gamut clamp, then the sRGB transfer function.
    let to_srgb = |c: f32| {
        let c = c.clamp(0.0, 1.0);
        if c <= 0.003_130_8 {
            c * 12.92
        } else {
            1.055 * c.powf(1.0 / 2.4) - 0.055
        }
    };

    Hsla::from(Rgba {
        r: to_srgb(lr),
        g: to_srgb(lg),
        b: to_srgb(lb),
        a: 1.0,
    })
}

fn extract_text_initials(text: &str) -> String {
    let mut result = text
        .split(" ")
        .flat_map(|word| word.chars().next().map(|c| c.to_string()))
        .take(2)
        .collect::<Vec<String>>()
        .join("");

    if result.len() == 1 {
        result = text.chars().take(2).collect::<String>();
    }

    result.to_uppercase()
}

/// Stacked avatar row — the web's avatar-group: overlapping boxes in a
/// right-to-left row, capped at [`AvatarGroup::limit`] with an optional
/// ellipsis head.
#[derive(IntoElement)]
pub struct AvatarGroup {
    base: Div,
    style: StyleRefinement,
    avatars: Vec<Avatar>,
    size: Option<Size>,
    limit: usize,
    ellipsis: bool,
}

impl Default for AvatarGroup {
    fn default() -> Self {
        Self::new()
    }
}

impl AvatarGroup {
    /// Create a new AvatarGroup.
    pub fn new() -> Self {
        Self {
            base: div(),
            style: StyleRefinement::default(),
            avatars: Vec::new(),
            size: None,
            limit: 3,
            ellipsis: false,
        }
    }

    /// Add a child avatar to the group.
    pub fn child(mut self, avatar: Avatar) -> Self {
        self.avatars.push(avatar);
        self
    }

    /// Add multiple child avatars to the group.
    pub fn children(mut self, avatars: impl IntoIterator<Item = Avatar>) -> Self {
        self.avatars.extend(avatars);
        self
    }

    /// Set the maximum number of avatars to display before showing a "more" avatar.
    pub fn limit(mut self, limit: usize) -> Self {
        self.limit = limit;
        self
    }

    /// Set whether to show an ellipsis when the limit is reached, default: false
    pub fn ellipsis(mut self) -> Self {
        self.ellipsis = true;
        self
    }
}

impl Sizable for AvatarGroup {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = Some(size.into());
        self
    }
}

impl Styled for AvatarGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl InteractiveElement for AvatarGroup {
    fn interactivity(&mut self) -> &mut Interactivity {
        self.base.interactivity()
    }
}

impl RenderOnce for AvatarGroup {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        // The group sizes its members itself, so an explicit step re-sizes
        // every avatar handed in at a different step.
        let item_px = self.size.map(box_size).unwrap_or_else(|| px(32.));
        // 30% of the box overlaps the previous one — the web `-ms-3`-style pull.
        let item_ml = -item_px * 0.3;
        let avatars_len = self.avatars.len();

        self.base
            .flex()
            .flex_row_reverse()
            .items_center()
            .children(if self.ellipsis && avatars_len > self.limit {
                Some(Avatar::new().name("⋯").with_size(item_px).ml_1())
            } else {
                None
            })
            .children(
                self.avatars
                    .into_iter()
                    .take(self.limit)
                    .enumerate()
                    .rev()
                    .map(|(ix, item)| {
                        item.when(ix > 0, |this| this.ml(item_ml))
                            .map(|item| match self.size {
                                Some(size) => item.with_size(size),
                                None => item,
                            })
                    }),
            )
            .map(|mut this| {
                this.style().refine(&self.style);
                this
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::{Rgba, TestAppContext};

    /// WCAG 2.1 relative luminance.
    fn luminance(color: Hsla) -> f32 {
        let channel = |c: f32| {
            if c <= 0.03928 {
                c / 12.92
            } else {
                ((c + 0.055) / 1.055).powf(2.4)
            }
        };

        let rgb: Rgba = color.into();
        0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
    }

    fn contrast_ratio(a: Hsla, b: Hsla) -> f32 {
        let (a, b) = (luminance(a), luminance(b));
        let (lighter, darker) = if a > b { (a, b) } else { (b, a) };
        (lighter + 0.05) / (darker + 0.05)
    }

    fn ring(is_dark: bool) -> impl Iterator<Item = (f32, IdentityColor)> {
        (0..IdentityColor::HUES).map(move |step| {
            let hue = step as f32 * IdentityColor::HUE_STEP;
            (hue, IdentityColor::from_hue(hue, is_dark))
        })
    }

    #[test]
    fn identity_colors_stay_legible_on_every_hue() {
        for is_dark in [false, true] {
            for (hue, color) in ring(is_dark) {
                let ratio = contrast_ratio(color.foreground, color.background);

                assert!(
                    ratio >= 4.5,
                    "hue {hue} (dark: {is_dark}) has contrast {ratio:.2}, below WCAG AA"
                );
            }
        }
    }

    /// A color pushed past what sRGB holds at its lightness comes back clamped
    /// to the gamut edge, which HSL reports as full saturation. The border
    /// carries the most chroma that clears this on every hue; raising it would
    /// silently flatten a third of the ring.
    #[test]
    fn identity_borders_stay_inside_the_srgb_gamut() {
        for is_dark in [false, true] {
            for (hue, color) in ring(is_dark) {
                assert!(
                    color.border.s < 1.,
                    "border at hue {hue} (dark: {is_dark}) is clamped to the sRGB gamut edge"
                );
            }
        }
    }

    #[test]
    fn oklch_matches_the_known_token_conversions() {
        // The two conversions theme.rs pins for the token port: light
        // `--destructive` and dark `--destructive`.
        let light = oklch(0.577, 0.245, 27.325);
        let rgb = Rgba::from(light);
        assert!((rgb.r - 0.906).abs() < 0.01, "r {}", rgb.r);
        assert!((rgb.g - 0.0).abs() < 0.02, "g {}", rgb.g);
        assert!((rgb.b - 0.043).abs() < 0.02, "b {}", rgb.b);
    }

    #[test]
    fn test_avatar_text_initials() {
        assert_eq!(extract_text_initials(&"Jason Lee"), "JL".to_string());
        assert_eq!(extract_text_initials(&"Foo Bar Dar"), "FB".to_string());
        assert_eq!(extract_text_initials(&"huacnlee"), "HU".to_string());
    }

    #[test]
    fn sizes_match_the_web_ladder() {
        assert_eq!(AvatarSize::Small.px(), px(24.));
        assert_eq!(AvatarSize::Default.px(), px(32.));
        assert_eq!(AvatarSize::Large.px(), px(40.));
        assert_eq!(AvatarSize::default(), AvatarSize::Default);
    }

    #[test]
    fn text_steps_follow_the_web_not_a_ratio() {
        // The web types initials at text-xs (12px) for `sm` and text-sm (14px)
        // for both `default` and `lg` — 40px keeps 14px, it does not scale.
        assert_eq!(text_size(px(24.)), px(12.));
        assert_eq!(text_size(px(32.)), px(14.));
        assert_eq!(text_size(px(40.)), px(14.));
        assert_eq!(text_size(px(16.)), px(12.));
    }

    struct AvatarView;

    impl gpui::Render for AvatarView {
        fn render(
            &mut self,
            _: &mut gpui::Window,
            _: &mut gpui::Context<Self>,
        ) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .child(Avatar::new().name("Jason Lee"))
                .child(Avatar::new().size(AvatarSize::Large).name("Alex Rivera"))
                .child(Avatar::new().xsmall().name("Compact"))
                .child(Avatar::new().with_size(px(48.)).name("Override"))
                .child(Avatar::new().placeholder(PhosphorIcon::Gear))
        }
    }

    #[gpui::test]
    fn avatar_renders_every_fallback_kind(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| AvatarView);
    }

    struct GroupView;

    impl gpui::Render for GroupView {
        fn render(
            &mut self,
            _: &mut gpui::Window,
            _: &mut gpui::Context<Self>,
        ) -> impl IntoElement {
            div().child(
                AvatarGroup::new()
                    .child(Avatar::new().name("Alice"))
                    .child(Avatar::new().name("Bob"))
                    .child(Avatar::new().name("Charlie"))
                    .child(Avatar::new().name("David"))
                    .large()
                    .limit(3)
                    .ellipsis(),
            )
        }
    }

    #[gpui::test]
    fn avatar_group_renders_with_limit_and_ellipsis(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| GroupView);
    }
}
