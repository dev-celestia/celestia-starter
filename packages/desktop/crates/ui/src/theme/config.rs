//! The global theme config — the desktop counterpart of the shadcn `:root` /
//! `.dark` blocks in `globals.css`.
//!
//! shadcn/ui themes an entire component library from one stylesheet: semantic
//! CSS variables (`--background`, `--primary`, `--border`, …) per mode plus a
//! single `--radius`, and every component reads `var(--…)`. [`AppTheme`] is
//! that single place for the desktop library: a set of semantic color tokens
//! per mode ([`Scheme`]) and one [`radius`](AppTheme::radius), with an
//! [`apply`](AppTheme::apply) that pushes the whole configuration onto the
//! crate's [`Theme`](super::Theme) global — the same global every component
//! already reads through `cx.theme()`, so nothing in `components/` changes
//! when the config does.
//!
//! Overlay semantics: every [`Scheme`] field is optional and `None` (the
//! default) keeps the Celestia value from `theme.json`. A set token expands
//! into **every** color field that token drives in `theme.json` — setting
//! `primary` re-colors `primary`, the button/danger-family hovers, `ring`,
//! `caret`, `link`, `slider_thumb`/`progress_bar` fills, the list/table active
//! borders, the 22% `selection` wash and the primary-tinted surfaces — with
//! hover/active steps re-derived the way `theme.json` derives them (light
//! steps darken the base, dark steps lighten toward white).
//!
//! # Example
//!
//! ```ignore
//! use celestia_ui::theme::{hex, AppTheme, Scheme};
//! use gpui::px;
//!
//! let config = AppTheme {
//!     radius: px(10.),
//!     light: Scheme { primary: Some(hex(0x2563eb)), ..Default::default() },
//!     dark: Scheme { primary: Some(hex(0x6aa5ff)), ..Default::default() },
//! };
//! // Every component reading cx.theme() picks this up on the next frame.
//! config.apply(cx);
//! ```
//!
//! The mode-independent product colors (`brand`, `brand_deep`, the chart
//! ramp) are not part of the config — like the web `:root` they are defined
//! once and never re-themed; see [`crate::palette`].

use gpui::{App, Hsla, Pixels, Rgba, SharedString, px, rgb};

use super::book;
use super::{ThemeColor, ThemeMode};

/// A semantic color as `#rrggbb` — the config's unit, like a shadcn CSS
/// variable value.
///
/// ```
/// use celestia_ui::theme::hex;
/// use gpui::Rgba;
///
/// assert_eq!(Rgba::from(hex(0xd40c1a)).r * 255.0, 212.0);
/// ```
pub fn hex(code: u32) -> Hsla {
    rgb(code).into()
}

/// The global theme configuration: one radius plus a color scheme per mode.
///
/// [`AppTheme::default`] is the Celestia theme itself (all [`Scheme`] fields
/// unset, radius 8px) — applying it is a re-assert of `theme.json`, not a
/// change.
#[derive(Clone, Copy, Debug)]
pub struct AppTheme {
    /// The single corner radius (shadcn's `--radius`): `theme.radius` for
    /// every element. The large-element radius (`radius_lg` — dialogs,
    /// notifications) derives as `radius + 4px`, the shadcn `--radius-xl`
    /// step.
    pub radius: Pixels,
    /// Tokens applied in light mode (`:root`).
    pub light: Scheme,
    /// Tokens applied in dark mode (`.dark`).
    pub dark: Scheme,
}

impl Default for AppTheme {
    /// All [`Scheme`] fields unset; the `theme.json` radius.
    fn default() -> Self {
        Self {
            radius: px(8.),
            light: Scheme::default(),
            dark: Scheme::default(),
        }
    }
}

impl AppTheme {
    /// The Celestia defaults: no color overrides, the `theme.json` radius.
    pub fn celestia() -> Self {
        Self::default()
    }

    /// Push the configuration onto the global theme.
    ///
    /// Overlays the tokens onto the **active theme family** (see
    /// [`super::book`]) — `Celestia` by default, so un-overridden keys keep
    /// their `theme.json` values — and the result is stored back on the
    /// family, so switching away and back preserves the tweak. The current
    /// mode is re-applied, so the setting survives later `Theme::change` /
    /// system-appearance switches, and every window repaints with the new
    /// tokens.
    ///
    /// Runs after [`crate::init`].
    pub fn apply(&self, cx: &mut App) {
        let (light, dark) = book::active_pair(cx);
        let (light, dark) = self.overlaid(light, dark);
        book::store_active_pair(cx, light.clone(), dark.clone());
        book::activate(cx, light, dark);
    }

    /// Register this configuration as a named, selectable theme family —
    /// a light + dark pair built from the semantic tokens over the Celestia
    /// base — and make it the active theme.
    ///
    /// This is the multi-theme entry point: after registering, the family
    /// shows up in [`super::book::families`] and can be re-selected with
    /// [`super::book::select`] at any time. Re-registering a name replaces
    /// that family. Mode toggles (`Theme::change`, system appearance) keep
    /// operating within the active family.
    ///
    /// Runs after [`crate::init`].
    pub fn register(&self, name: impl Into<SharedString>, cx: &mut App) {
        let name = name.into();
        let (light, dark) = book::celestia_pair(cx);
        let (light, dark) = self.overlaid(light, dark);
        book::insert_and_activate(cx, name, light, dark);
    }

    /// Expand the tokens onto a base config pair: overlay both schemes and
    /// apply the radius (with its +4px large-element step).
    fn overlaid(
        &self,
        mut light: super::ThemeConfig,
        mut dark: super::ThemeConfig,
    ) -> (super::ThemeConfig, super::ThemeConfig) {
        self.light
            .overlay(ThemeMode::Light, &mut light.colors);
        self.dark.overlay(ThemeMode::Dark, &mut dark.colors);

        for config in [&mut light, &mut dark] {
            config.radius = self.radius;
            config.radius_lg = self.radius + px(4.);
        }
        (light, dark)
    }
}

/// The semantic color tokens for one mode — the shadcn variable set, carried
/// as options: `None` keeps the Celestia default, `Some(hex(…))` overrides
/// the token everywhere it is used.
#[derive(Clone, Copy, Debug, Default)]
pub struct Scheme {
    /// Page background (`--background`).
    pub background: Option<Hsla>,
    /// Default text (`--foreground`).
    pub foreground: Option<Hsla>,
    /// Second surface — title bar, status bar, tab bar, group boxes and the
    /// striped list/table rows (a Celestia extension; the web counterpart is
    /// the `#fafafa` family on `:root`).
    pub surface: Option<Hsla>,
    /// Popover and accordion surface (`--popover`).
    pub popover: Option<Hsla>,
    /// Text on [`Self::popover`] (`--popover-foreground`).
    pub popover_foreground: Option<Hsla>,
    /// The accent (`--primary`): filled buttons, links, focus ring, caret,
    /// selection wash, slider/progress fills, active rows.
    pub primary: Option<Hsla>,
    /// Text/icons on [`Self::primary`] (`--primary-foreground`).
    pub primary_foreground: Option<Hsla>,
    /// Muted filled controls (`--secondary`).
    pub secondary: Option<Hsla>,
    /// Text on [`Self::secondary`] (`--secondary-foreground`).
    pub secondary_foreground: Option<Hsla>,
    /// Muted surfaces — skeletons, slider tracks, segmented tab bars
    /// (`--muted`).
    pub muted: Option<Hsla>,
    /// De-emphasized text (`--muted-foreground`).
    pub muted_foreground: Option<Hsla>,
    /// Hover/accent washes — list and table hover rows, sidebar accent,
    /// outlined-button hover (`--accent`).
    pub accent: Option<Hsla>,
    /// Text on [`Self::accent`] (`--accent-foreground`).
    pub accent_foreground: Option<Hsla>,
    /// Destructive accent (`--destructive`).
    pub destructive: Option<Hsla>,
    /// Text on [`Self::destructive`] (`--destructive-foreground`).
    pub destructive_foreground: Option<Hsla>,
    /// Success accent (`--success`).
    pub success: Option<Hsla>,
    /// Text on [`Self::success`] (`--success-foreground`).
    pub success_foreground: Option<Hsla>,
    /// Warning accent (`--warning`).
    pub warning: Option<Hsla>,
    /// Text on [`Self::warning`] (`--warning-foreground`).
    pub warning_foreground: Option<Hsla>,
    /// Info accent (`--info`).
    pub info: Option<Hsla>,
    /// Text on [`Self::info`] (`--info-foreground`).
    pub info_foreground: Option<Hsla>,
    /// Hairline borders (`--border`): theme, title/status bar and sidebar
    /// borders.
    pub border: Option<Hsla>,
    /// Input borders (`--input`).
    pub input: Option<Hsla>,
    /// Focus ring and caret (`--ring`); wins over the [`Self::primary`]
    /// default.
    pub ring: Option<Hsla>,
    /// Sidebar surface (`--sidebar`).
    pub sidebar: Option<Hsla>,
    /// Sidebar text (`--sidebar-foreground`).
    pub sidebar_foreground: Option<Hsla>,
    /// Sidebar borders (`--sidebar-border`); wins over [`Self::border`].
    pub sidebar_border: Option<Hsla>,
    /// Sidebar accent fill (`--sidebar-primary`); wins over
    /// [`Self::primary`].
    pub sidebar_primary: Option<Hsla>,
    /// Text on [`Self::sidebar_primary`].
    pub sidebar_primary_foreground: Option<Hsla>,
    /// Sidebar hover wash (`--sidebar-accent`); wins over [`Self::accent`].
    pub sidebar_accent: Option<Hsla>,
    /// Text on [`Self::sidebar_accent`].
    pub sidebar_accent_foreground: Option<Hsla>,
}

impl Scheme {
    /// Expand the set tokens into the resolved color set, deriving the state
    /// steps `theme.json` derives (light hovers darken the base, dark hovers
    /// lighten toward white; selection rides the primary hue at 22% alpha;
    /// primary-tinted surfaces sit at 10% over the background).
    fn overlay(&self, mode: ThemeMode, colors: &mut ThemeColor) {
        let dark = mode.is_dark();

        if let Some(color) = self.background {
            colors.background = color;
        }
        if let Some(color) = self.foreground {
            colors.foreground = color;
            colors.tab_active_foreground = color;
        }
        if let Some(color) = self.surface {
            colors.title_bar = color;
            colors.status_bar = color;
            colors.tab_bar = color;
            colors.group_box = color;
            colors.list_head = color;
            colors.list_even = color;
            colors.table_head = color;
            colors.table_even = color;
        }
        if let Some(color) = self.popover {
            colors.popover = color;
            colors.accordion = color;
        }
        if let Some(color) = self.popover_foreground {
            colors.popover_foreground = color;
        }

        if let Some(color) = self.primary {
            let hover = hover_step(color, dark);
            let active = active_step(color, dark);
            colors.primary = color;
            colors.button_primary = color;
            colors.link = color;
            colors.ring = color;
            colors.caret = color;
            colors.slider_thumb = color;
            colors.progress_bar = color;
            colors.drag_border = color;
            colors.list_active_border = color;
            colors.table_active_border = color;
            colors.sidebar_primary = color;

            colors.primary_hover = hover;
            colors.button_primary_hover = hover;
            colors.link_hover = hover;

            colors.primary_active = active;
            colors.button_primary_active = active;
            colors.link_active = active;

            colors.selection = with_alpha(color, 0x38);
            // Tinted surfaces: primary at 10% composited over the current
            // background (which the overlay above may just have replaced).
            let wash = tint_over(color, colors.background, 0.10);
            colors.list_active = wash;
            colors.table_active = wash;
            colors.tab_active = wash;
            colors.drop_target = wash;
        }
        if let Some(color) = self.primary_foreground {
            colors.primary_foreground = color;
            colors.button_primary_foreground = color;
            colors.sidebar_primary_foreground = color;
        }

        if let Some(color) = self.secondary {
            colors.secondary = color;
            colors.button_secondary = color;
            colors.secondary_hover = hover_step(color, dark);
            colors.secondary_active = active_step(color, dark);
            colors.button_secondary_hover = hover_step(color, dark);
            colors.button_secondary_active = active_step(color, dark);
        }
        if let Some(color) = self.secondary_foreground {
            colors.secondary_foreground = color;
            colors.button_secondary_foreground = color;
        }
        if let Some(color) = self.muted {
            colors.muted = color;
            colors.skeleton = color;
            colors.slider_bar = color;
            colors.tab_bar_segmented = color;
        }
        if let Some(color) = self.muted_foreground {
            colors.muted_foreground = color;
            colors.tab_foreground = color;
            colors.table_head_foreground = color;
        }
        if let Some(color) = self.accent {
            colors.accent = color;
            colors.list_hover = color;
            colors.table_hover = color;
            colors.sidebar_accent = color;
            colors.button_hover = color;
        }
        if let Some(color) = self.accent_foreground {
            colors.accent_foreground = color;
            colors.sidebar_accent_foreground = color;
        }

        if let Some(color) = self.destructive {
            let (base, hover, active, foreground) = status_steps(color, dark);
            colors.danger = base;
            colors.button_danger = base;
            colors.danger_hover = hover;
            colors.button_danger_hover = hover;
            colors.danger_active = active;
            colors.button_danger_active = active;
            // The foreground follows the CSS: white in light, near-black in
            // dark — unless the config sets it explicitly below.
            if self.destructive_foreground.is_none() {
                colors.danger_foreground = foreground;
                colors.button_danger_foreground = foreground;
            }
        }
        if let Some(color) = self.success {
            let (base, hover, active, foreground) = status_steps(color, dark);
            colors.success = base;
            colors.button_success = base;
            colors.success_hover = hover;
            colors.button_success_hover = hover;
            colors.success_active = active;
            colors.button_success_active = active;
            if self.success_foreground.is_none() {
                colors.success_foreground = foreground;
                colors.button_success_foreground = foreground;
            }
        }
        if let Some(color) = self.warning {
            let (base, hover, active, foreground) = status_steps(color, dark);
            colors.warning = base;
            colors.button_warning = base;
            colors.warning_hover = hover;
            colors.button_warning_hover = hover;
            colors.warning_active = active;
            colors.button_warning_active = active;
            if self.warning_foreground.is_none() {
                colors.warning_foreground = foreground;
                colors.button_warning_foreground = foreground;
            }
        }
        if let Some(color) = self.info {
            let (base, hover, active, foreground) = status_steps(color, dark);
            colors.info = base;
            colors.button_info = base;
            colors.info_hover = hover;
            colors.button_info_hover = hover;
            colors.info_active = active;
            colors.button_info_active = active;
            if self.info_foreground.is_none() {
                colors.info_foreground = foreground;
                colors.button_info_foreground = foreground;
            }
        }
        if let Some(color) = self.destructive_foreground {
            colors.danger_foreground = color;
            colors.button_danger_foreground = color;
        }
        if let Some(color) = self.success_foreground {
            colors.success_foreground = color;
            colors.button_success_foreground = color;
        }
        if let Some(color) = self.warning_foreground {
            colors.warning_foreground = color;
            colors.button_warning_foreground = color;
        }
        if let Some(color) = self.info_foreground {
            colors.info_foreground = color;
            colors.button_info_foreground = color;
        }

        if let Some(color) = self.border {
            colors.border = color;
            colors.title_bar_border = color;
            colors.status_bar_border = color;
            colors.sidebar_border = color;
        }
        if let Some(color) = self.input {
            colors.input = color;
        }
        // The ring defaults to the primary hue; an explicit ring wins.
        if let Some(color) = self.ring {
            colors.ring = color;
            colors.caret = color;
        }

        if let Some(color) = self.sidebar {
            colors.sidebar = color;
        }
        if let Some(color) = self.sidebar_foreground {
            colors.sidebar_foreground = color;
        }
        if let Some(color) = self.sidebar_border {
            colors.sidebar_border = color;
        }
        if let Some(color) = self.sidebar_primary {
            colors.sidebar_primary = color;
        }
        if let Some(color) = self.sidebar_primary_foreground {
            colors.sidebar_primary_foreground = color;
        }
        if let Some(color) = self.sidebar_accent {
            colors.sidebar_accent = color;
        }
        if let Some(color) = self.sidebar_accent_foreground {
            colors.sidebar_accent_foreground = color;
        }
    }
}

/// One status family step set: `[base, hover, active, foreground]` derived
/// from the single token. The foreground follows the CSS: white in light
/// mode, near-black (#171717) in dark.
fn status_steps(color: Hsla, dark: bool) -> (Hsla, Hsla, Hsla, Hsla) {
    (
        color,
        hover_step(color, dark),
        active_step(color, dark),
        if dark {
            hex(0x171717)
        } else {
            hex(0xffffff)
        },
    )
}

fn with_alpha(color: Hsla, alpha: u32) -> Hsla {
    color.alpha(alpha as f32 / 255.0)
}

/// One hover step: light darkens the base, dark lightens toward white — the
/// derivation documented in the module docs.
fn hover_step(color: Hsla, dark: bool) -> Hsla {
    if dark {
        lighten(color, 0.20)
    } else {
        darken(color, 0.88)
    }
}

/// One active step (a hover step pushed further).
fn active_step(color: Hsla, dark: bool) -> Hsla {
    if dark {
        lighten(color, 0.365)
    } else {
        darken(color, 0.78)
    }
}

fn darken(color: Hsla, factor: f32) -> Hsla {
    let rgba = Rgba::from(color);
    Rgba {
        r: rgba.r * factor,
        g: rgba.g * factor,
        b: rgba.b * factor,
        a: rgba.a,
    }
    .into()
}

fn lighten(color: Hsla, amount: f32) -> Hsla {
    let rgba = Rgba::from(color);
    let lift = |v: f32| v + (1.0 - v) * amount;
    Rgba {
        r: lift(rgba.r),
        g: lift(rgba.g),
        b: lift(rgba.b),
        a: rgba.a,
    }
    .into()
}

/// Composite `over` at `alpha` on top of `base` (premultiplied-over sRGB).
fn tint_over(over: Hsla, base: Hsla, alpha: f32) -> Hsla {
    let over = Rgba::from(over);
    let base = Rgba::from(base);
    let mix = |o: f32, b: f32| o * alpha + b * (1.0 - alpha);
    Rgba {
        r: mix(over.r, base.r),
        g: mix(over.g, base.g),
        b: mix(over.b, base.b),
        a: 1.0,
    }
    .into()
}

#[cfg(test)]
mod tests {
    use gpui::{Rgba, TestAppContext, px};
    use gpui::AppContext as _;

    use super::super::ActiveTheme as _;
    use super::super::Theme;
    use super::super::ThemeMode;
    use super::*;

    /// RGB part of a color as `0xrrggbb` (the theme.rs test idiom).
    fn code(color: gpui::Hsla) -> u32 {
        let rgba = Rgba::from(color);
        let to8 = |v: f32| (v * 255.0).round() as u32;
        (to8(rgba.r) << 16) | (to8(rgba.g) << 8) | to8(rgba.b)
    }

    #[test]
    fn hex_converts_to_srgb_channels() {
        assert_eq!(Rgba::from(hex(0xd40c1a)).r * 255.0, 212.0);
    }

    #[gpui::test]
    fn default_apply_reasserts_the_celestia_defaults(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::theme::install(cx);
            AppTheme::default().apply(cx);

            Theme::change(ThemeMode::Light, cx);
            assert_eq!(code(cx.theme().background), 0xffffff);
            assert_eq!(code(cx.theme().primary), 0xd40c1a);
            assert_eq!(code(cx.theme().border), 0xe5e5e5);
            // The single radius knob, and its +4px large-element step.
            assert_eq!(f32::from(cx.theme().radius), 8.0);
            assert_eq!(f32::from(cx.theme().radius_lg), 12.0);

            Theme::change(ThemeMode::Dark, cx);
            assert_eq!(code(cx.theme().background), 0x0a0a0a);
            assert_eq!(code(cx.theme().primary), 0xff4d46);
            assert_eq!(f32::from(cx.theme().radius), 8.0);
        });
    }

    #[gpui::test]
    fn radius_applies_to_both_modes(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::theme::install(cx);
            AppTheme {
                radius: px(12.),
                ..Default::default()
            }
            .apply(cx);

            Theme::change(ThemeMode::Light, cx);
            assert_eq!(f32::from(cx.theme().radius), 12.0);
            assert_eq!(f32::from(cx.theme().radius_lg), 16.0);
            Theme::change(ThemeMode::Dark, cx);
            assert_eq!(f32::from(cx.theme().radius), 12.0);
        });
    }

    /// One token override must recolor everything that token drives — here
    /// the light accent — and nothing in the other mode.
    #[gpui::test]
    fn light_primary_override_fans_out_light_only(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::theme::install(cx);

            let blue = hex(0x2563eb);
            AppTheme {
                light: Scheme {
                    primary: Some(blue),
                    ..Default::default()
                },
                ..Default::default()
            }
            .apply(cx);

            Theme::change(ThemeMode::Light, cx);
            assert_eq!(code(cx.theme().primary), 0x2563eb);
            assert_eq!(code(cx.theme().ring), 0x2563eb);
            assert_eq!(code(cx.theme().link), 0x2563eb);
            assert_eq!(code(cx.theme().slider_thumb), 0x2563eb);
            assert_eq!(
                code(cx.theme().primary_hover),
                code(hover_step(blue, false)),
                "hover derives darker in light mode"
            );
            assert_ne!(code(cx.theme().primary_hover), 0x2563eb);

            let selection = Rgba::from(cx.theme().selection);
            assert_eq!(
                code(cx.theme().selection),
                0x2563eb,
                "selection keeps the hue"
            );
            assert_eq!((selection.a * 255.0).round() as u32, 0x38, "at 22% alpha");

            // Primary-tinted surface: 10% of #2563eb over the white background.
            assert_eq!(code(cx.theme().list_active), 0xe9effd);

            Theme::change(ThemeMode::Dark, cx);
            assert_eq!(code(cx.theme().primary), 0xff4d46, "dark mode untouched");
            assert_eq!(code(cx.theme().ring), 0xff4d46);
        });
    }

    #[gpui::test]
    fn dark_destructive_override_leaves_light_alone(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::theme::install(cx);

            AppTheme {
                dark: Scheme {
                    destructive: Some(hex(0x38bdf8)),
                    destructive_foreground: Some(hex(0x0a0a0a)),
                    ..Default::default()
                },
                ..Default::default()
            }
            .apply(cx);

            Theme::change(ThemeMode::Dark, cx);
            assert_eq!(code(cx.theme().danger), 0x38bdf8);
            assert_eq!(code(cx.theme().danger_foreground), 0x0a0a0a);
            assert_eq!(
                code(cx.theme().danger_hover),
                code(hover_step(hex(0x38bdf8), true)),
                "hover derives lighter in dark mode"
            );

            Theme::change(ThemeMode::Light, cx);
            assert_eq!(code(cx.theme().danger), 0xe7000b);
            assert_eq!(code(cx.theme().danger_foreground), 0xffffff);
        });
    }
}
