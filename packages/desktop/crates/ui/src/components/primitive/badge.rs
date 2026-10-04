//! Celestia badge — the desktop counterpart of
//! `packages/ui/src/components/primitive/badge.tsx`, plus a notification
//! badge. Written directly on `gpui`.
//!
//! [`Badge`] is a small chip with the web badge's metrics (`h-5`, `rounded`
//! (4px), `px-2`, `py-0.5`, `text-3xs`, `gap-1`, `font-medium`) and palette. It
//! is composed from a plain `div` rather than a tag component for two reasons:
//!
//! 1. The web badge's status variants are a **10% tint of the accent under
//!    accent-coloured text** (`bg-destructive/10 text-destructive`), not solid
//!    fills, and the web base is `border border-transparent` where a tag draws
//!    a same-coloured edge. Reproducing that through a tag's `custom` escape
//!    hatch means restating every variant anyway.
//! 2. A tag's render bakes in a `hover:opacity(0.9)` dim. The web badge only
//!    changes on hover when it is a link (`[a]:hover:bg-…`), and this chip is
//!    not interactive, so the dim is an effect the web does not have.
//!
//! [`GpuiBadge`] is the count / dot / icon notification badge — no web
//! counterpart. It keeps the upstream control's builder surface but takes any
//! `IntoElement` for its icon slot (upstream accepted only its own icon type),
//! and its size comes from the crate-local [`GpuiBadgeSize`] rather than a
//! shared sizing trait.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, FontWeight, Hsla, IntoElement, ParentElement, Pixels, Refineable as _,
    RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px, relative, white,
};

use crate::palette;
use crate::theme::ActiveTheme as _;

/// Badge color variant (web `variant` prop).
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum BadgeVariant {
    /// Filled brand red (web `default`).
    #[default]
    Default,
    /// Muted gray fill.
    Secondary,
    /// Danger tint (web `destructive`: `bg-destructive/10 text-destructive`).
    Destructive,
    /// Bordered, input-tinted fill (web `outline`).
    Outline,
    /// Success tint.
    Success,
    /// Warning tint.
    Warning,
    /// Info tint.
    Info,
    /// Transparent with a muted label (web `ghost`).
    Ghost,
    /// Primary-coloured label (web `link`).
    Link,
    /// Brand accent — the landing `--brand` red, not the theme primary. No web
    /// counterpart; the desktop keeps it for the landing palette.
    Brand,
}

/// The Celestia badge chip.
#[derive(IntoElement)]
pub struct Badge {
    label: SharedString,
    variant: BadgeVariant,
    icon: Option<AnyElement>,
    radius: Option<Pixels>,
}

impl Badge {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
            variant: BadgeVariant::default(),
            icon: None,
            radius: None,
        }
    }

    pub fn variant(mut self, variant: BadgeVariant) -> Self {
        self.variant = variant;
        self
    }

    /// Set corner radius of the badge (defaults to 4px).
    pub fn rounded(mut self, radius: impl Into<Pixels>) -> Self {
        self.radius = Some(radius.into());
        self
    }

    /// Make the badge fully pill-shaped.
    pub fn rounded_full(mut self) -> Self {
        self.radius = Some(px(9999.));
        self
    }

    /// Optional prefix icon or status indicator (ensures meaning is not
    /// conveyed by color alone).
    pub fn icon(mut self, icon: impl IntoElement) -> Self {
        self.icon = Some(icon.into_any_element());
        self
    }
}

/// The web's `bg-<accent>/10 text-<accent>` pair, at the dark step (`/20`).
fn tint(accent: Hsla, is_dark: bool) -> (Hsla, Hsla) {
    let alpha = if is_dark { 0.20 } else { 0.10 };
    (accent.opacity(alpha), accent)
}

impl RenderOnce for Badge {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let is_dark = theme.mode.is_dark();
        // The web base is `border border-transparent`; only `outline` restates
        // the edge.
        let clear = theme.transparent;

        let (bg, fg, border) = match self.variant {
            BadgeVariant::Default => (theme.primary, theme.primary_foreground, clear),
            BadgeVariant::Secondary => (theme.secondary, theme.secondary_foreground, clear),
            // Status variants are TINTS, not fills.
            BadgeVariant::Destructive => {
                let (bg, fg) = tint(theme.danger, is_dark);
                (bg, fg, clear)
            }
            BadgeVariant::Success => {
                let (bg, fg) = tint(theme.success, is_dark);
                (bg, fg, clear)
            }
            BadgeVariant::Warning => {
                let (bg, fg) = tint(theme.warning, is_dark);
                (bg, fg, clear)
            }
            BadgeVariant::Info => {
                let (bg, fg) = tint(theme.info, is_dark);
                (bg, fg, clear)
            }
            // `border-border bg-input/20 text-foreground dark:bg-input/30`.
            BadgeVariant::Outline => (
                theme.input.opacity(if is_dark { 0.30 } else { 0.20 }),
                theme.foreground,
                theme.border,
            ),
            // Web `ghost` at rest; its `hover:bg-muted` needs an interactive
            // badge, which this chip is not.
            BadgeVariant::Ghost => (clear, theme.muted_foreground, clear),
            // Web `link` at rest; its `hover:underline` likewise needs hover.
            BadgeVariant::Link => (clear, theme.primary, clear),
            BadgeVariant::Brand => (palette(cx).brand(), palette(cx).brand_foreground(), clear),
        };

        let has_icon = self.icon.is_some();
        let radius = self.radius.unwrap_or(px(4.0));
        let mut el = div()
            .flex()
            .items_center()
            .justify_center()
            .flex_shrink_0()
            .w_auto()
            .h(px(20.))
            .rounded(radius)
            .px(px(8.))
            .gap(px(4.))
            .text_size(px(10.))
            .line_height(px(14.))
            .font_weight(FontWeight::MEDIUM)
            .whitespace_nowrap()
            .overflow_hidden()
            .border_1()
            .border_color(border)
            .bg(bg)
            .text_color(fg);

        // `has-data-[icon=inline-start]:ps-1.5` — the leading pad tightens when
        // an icon carries part of the inset.
        if has_icon {
            el = el.pl(px(6.));
        }
        if let Some(icon) = self.icon {
            // `[&>svg]:size-2.5` — a 10px glyph in a 10px text step.
            el = el.child(div().flex_none().flex().items_center().child(icon));
        }
        el.child(self.label)
    }
}

/// Count / dot / icon badge size. Replaces the shared sizing trait the upstream
/// control used, keeping its three-step ladder.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum GpuiBadgeSize {
    /// A 10px dot with 8px text.
    Small,
    /// A 16px dot with 10px text.
    #[default]
    Medium,
    /// A 24px dot with 14px text.
    Large,
}

impl GpuiBadgeSize {
    /// The dot / icon box, in pixels.
    fn box_px(self) -> Pixels {
        match self {
            GpuiBadgeSize::Small => px(10.),
            GpuiBadgeSize::Medium => px(16.),
            GpuiBadgeSize::Large => px(24.),
        }
    }

    /// The count text step, in pixels.
    fn text_px(self) -> Pixels {
        match self {
            GpuiBadgeSize::Small => px(8.),
            GpuiBadgeSize::Medium => px(10.),
            GpuiBadgeSize::Large => px(14.),
        }
    }

    /// The `(top, right)` offset of the count bubble, scaled by its width in
    /// characters — the bubble hangs further out the wider it gets.
    fn count_offset(self, len: usize) -> (Pixels, Pixels) {
        match self {
            GpuiBadgeSize::Large => (px(2.), -px(len as f32)),
            GpuiBadgeSize::Medium => (-px(3.), -px(3.) * len as f32),
            GpuiBadgeSize::Small => (-px(4.), -px(4.) * len as f32),
        }
    }
}

/// What a [`GpuiBadge`] draws.
///
/// Not `Clone`: the icon arm owns an `AnyElement`, which is not cloneable.
#[derive(Default)]
enum GpuiBadgeVariant {
    /// A count bubble.
    #[default]
    Number,
    /// A bare dot.
    Dot,
    /// An icon.
    Icon(Box<AnyElement>),
}

/// A badge that overlays a count, a dot, or an icon on its children.
///
/// The children are the element the badge is anchored to; the badge itself is
/// absolutely positioned over their top-right corner. `Number` hides itself at
/// a count of zero.
#[derive(IntoElement)]
pub struct GpuiBadge {
    style: StyleRefinement,
    count: usize,
    max: usize,
    variant: GpuiBadgeVariant,
    children: Vec<AnyElement>,
    color: Option<Hsla>,
    size: GpuiBadgeSize,
}

impl GpuiBadge {
    /// Create a new, empty badge.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            count: 0,
            max: 99,
            variant: GpuiBadgeVariant::default(),
            children: Vec::new(),
            color: None,
            size: GpuiBadgeSize::default(),
        }
    }

    /// Show a bare dot.
    pub fn dot(mut self) -> Self {
        self.variant = GpuiBadgeVariant::Dot;
        self
    }

    /// Show a count. At zero the badge is hidden.
    pub fn count(mut self, count: usize) -> Self {
        self.count = count;
        self
    }

    /// Show an icon.
    pub fn icon(mut self, icon: impl IntoElement) -> Self {
        self.variant = GpuiBadgeVariant::Icon(Box::new(icon.into_any_element()));
        self
    }

    /// Cap the displayed count, rendering `max+` above it.
    pub fn max(mut self, max: usize) -> Self {
        self.max = max;
        self
    }

    /// Set the background (defaults to `theme.red`).
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = Some(color.into());
        self
    }

    /// Set the badge size.
    pub fn with_size(mut self, size: GpuiBadgeSize) -> Self {
        self.size = size;
        self
    }
}

impl Default for GpuiBadge {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for GpuiBadge {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for GpuiBadge {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for GpuiBadge {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let visible = match self.variant {
            GpuiBadgeVariant::Number => self.count > 0,
            GpuiBadgeVariant::Dot | GpuiBadgeVariant::Icon(_) => true,
        };

        let size = self.size;
        let box_px = size.box_px();
        let text_px = size.text_px();

        let mut root = div().relative();
        // The caller's `Styled` chain wins over the default above.
        root.style().refine(&self.style);

        root.children(self.children).when(visible, |this| {
            this.child(
                div()
                    .flex()
                    .flex_row()
                    .items_center()
                    .justify_center()
                    .absolute()
                    .rounded_full()
                    .bg(self.color.unwrap_or(cx.theme().red))
                    .text_color(white())
                    .text_size(text_px)
                    .map(|this| match self.variant {
                        GpuiBadgeVariant::Dot => this.top_0().right_0().size(px(6.)),
                        GpuiBadgeVariant::Number => {
                            let count = if self.count > self.max {
                                format!("{}+", self.max)
                            } else {
                                self.count.to_string()
                            };
                            let (top, right) = size.count_offset(count.len());

                            this.top(top)
                                .right(right)
                                .py(px(2.0))
                                .px(px(2.0))
                                .min_w(px(14.0))
                                .text_size(px(10.))
                                .line_height(relative(1.))
                                .child(count)
                        }
                        GpuiBadgeVariant::Icon(icon) => this
                            .right_0()
                            .bottom_0()
                            .size(box_px)
                            .border_1()
                            .border_color(cx.theme().background)
                            .child(*icon),
                    }),
            )
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::{Context, Render, TestAppContext};

    #[test]
    fn notification_size_ladder_matches_the_upstream_steps() {
        assert_eq!(GpuiBadgeSize::Small.box_px(), px(10.));
        assert_eq!(GpuiBadgeSize::Medium.box_px(), px(16.));
        assert_eq!(GpuiBadgeSize::Large.box_px(), px(24.));
        assert_eq!(GpuiBadgeSize::Small.text_px(), px(8.));
        assert_eq!(GpuiBadgeSize::Medium.text_px(), px(10.));
        assert_eq!(GpuiBadgeSize::Large.text_px(), px(14.));
        assert_eq!(GpuiBadgeSize::default(), GpuiBadgeSize::Medium);
    }

    /// The count bubble's right offset scales with the number of digits, so a
    /// 3-digit count does not sit half over its anchor.
    #[test]
    fn count_offset_scales_with_the_digit_count() {
        let one = GpuiBadgeSize::Medium.count_offset(1);
        let three = GpuiBadgeSize::Medium.count_offset(3);
        assert!(three.1 < one.1, "wider counts hang further left");
        assert_eq!(GpuiBadgeSize::Large.count_offset(1).1, -px(1.));
    }

    struct BadgeGallery;

    impl Render for BadgeGallery {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .child(Badge::new("Default").variant(BadgeVariant::Default))
                .child(Badge::new("Secondary").variant(BadgeVariant::Secondary))
                .child(Badge::new("Destructive").variant(BadgeVariant::Destructive))
                .child(Badge::new("Success").variant(BadgeVariant::Success))
                .child(Badge::new("Warning").variant(BadgeVariant::Warning))
                .child(Badge::new("Info").variant(BadgeVariant::Info))
                .child(Badge::new("Outline").variant(BadgeVariant::Outline))
                .child(Badge::new("Ghost").variant(BadgeVariant::Ghost))
                .child(Badge::new("Link").variant(BadgeVariant::Link))
                .child(Badge::new("Brand").variant(BadgeVariant::Brand))
                .child(Badge::new("Custom Radius").rounded(px(2.0)))
                .child(Badge::new("Pill").rounded_full())
                // Every notification variant, including the hidden count-of-zero
                // branch that a default render never reaches.
                .child(GpuiBadge::new().count(0).child(div().size(px(24.))))
                .child(GpuiBadge::new().count(8).child(div().size(px(24.))))
                .child(
                    GpuiBadge::new()
                        .count(1000)
                        .max(99)
                        .child(div().size(px(24.))),
                )
                .child(GpuiBadge::new().dot().child(div().size(px(24.))))
                .child(
                    GpuiBadge::new()
                        .icon(div().size(px(8.)))
                        .with_size(GpuiBadgeSize::Large)
                        .child(div().size(px(24.))),
                )
        }
    }

    #[gpui::test]
    fn badge_renders_all_variants_without_panic(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::init(cx);
        });

        let (_, cx) = cx.add_window_view(|_, _| BadgeGallery);
        cx.update(|window, cx| window.draw(cx).clear(cx));
    }
}
