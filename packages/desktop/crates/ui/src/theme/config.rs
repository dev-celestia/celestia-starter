//! The global theme config — the desktop counterpart of the shadcn `:root` /
//! `.dark` blocks in `globals.css`.
//!
//! shadcn/ui themes an entire component library from one stylesheet: semantic
//! CSS variables (`--background`, `--primary`, `--border`, …) per mode plus a
//! single `--radius`, and every component reads `var(--…)`. [`AppTheme`] is
//! that single place for the desktop library: a set of semantic color tokens
//! per mode ([`Scheme`]) and one [`radius`](AppTheme::radius), with an
//! [`apply`](AppTheme::apply) that pushes the whole configuration onto
//! gpui-kit's `Theme` global — the same global every component already reads
//! through `cx.theme()`, so nothing in `components/` changes when the config
//! does.
//!
//! Overlay semantics: every [`Scheme`] field is optional and `None` (the
//! default) keeps the Celestia value from `theme.json`. A set token expands
//! into **every** gpui color key that token drives in `theme.json` — setting
//! `primary` re-colors `primary.background`, the button/danger-family hovers,
//! `ring`, `caret`, `link`, `slider`/`progress` fills, the list/table active
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

use gpui_component::{ThemeConfig, ThemeConfigColors, ThemeMode};
use gpui::{App, Hsla, Pixels, Rgba, SharedString, px, rgb};

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
        let (light, dark) = super::book::active_pair(cx);
        let (light, dark) = self.overlaid(light, dark);
        super::book::store_active_pair(cx, light.clone(), dark.clone());
        super::book::activate(cx, light, dark);
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
        let (light, dark) = super::book::celestia_pair(cx);
        let (light, dark) = self.overlaid(light, dark);
        super::book::insert_and_activate(cx, name, light, dark);
    }

    /// Expand the tokens onto a base config pair: overlay both schemes and
    /// apply the radius (with its +4px large-element step).
    fn overlaid(
        &self,
        mut light: ThemeConfig,
        mut dark: ThemeConfig,
    ) -> (ThemeConfig, ThemeConfig) {
        self.light.overlay(ThemeMode::Light, &mut light.colors);
        self.dark.overlay(ThemeMode::Dark, &mut dark.colors);

        let radius = f32::from(self.radius) as usize;
        let radius_lg = f32::from(self.radius + px(4.)) as usize;
        for config in [&mut light, &mut dark] {
            config.radius = Some(radius);
            config.radius_lg = Some(radius_lg);
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
    /// Expand the set tokens into gpui's flat color map, deriving the state
    /// steps `theme.json` derives (light hovers darken the base, dark hovers
    /// lighten toward white; selection rides the primary hue at 22% alpha;
    /// primary-tinted surfaces sit at 10% over the background).
    fn overlay(&self, mode: ThemeMode, colors: &mut ThemeConfigColors) {
        let dark = mode.is_dark();
        let set = |field: &mut Option<SharedString>, color: Hsla| {
            *field = Some(SharedString::from(hex_string(color)))
        };

        if let Some(color) = self.background {
            set(&mut colors.background, color);
        }
        if let Some(color) = self.foreground {
            set(&mut colors.foreground, color);
            set(&mut colors.tab_active_foreground, color);
        }
        if let Some(color) = self.surface {
            for field in [
                &mut colors.title_bar,
                &mut colors.status_bar,
                &mut colors.tab_bar,
                &mut colors.group_box,
                &mut colors.list_head,
                &mut colors.list_even,
                &mut colors.table_head,
                &mut colors.table_even,
            ] {
                set(field, color);
            }
        }
        if let Some(color) = self.popover {
            set(&mut colors.popover, color);
            set(&mut colors.accordion, color);
        }
        if let Some(color) = self.popover_foreground {
            set(&mut colors.popover_foreground, color);
        }

        if let Some(color) = self.primary {
            let hover = hover_step(color, dark);
            let active = active_step(color, dark);
            for field in [
                &mut colors.primary,
                &mut colors.button_primary,
                &mut colors.link,
                &mut colors.ring,
                &mut colors.caret,
                &mut colors.slider_thumb,
                &mut colors.progress_bar,
                &mut colors.drag_border,
                &mut colors.list_active_border,
                &mut colors.table_active_border,
                &mut colors.sidebar_primary,
            ] {
                set(field, color);
            }
            for field in [
                &mut colors.primary_hover,
                &mut colors.button_primary_hover,
                &mut colors.link_hover,
            ] {
                set(field, hover);
            }
            for field in [
                &mut colors.primary_active,
                &mut colors.button_primary_active,
                &mut colors.link_active,
            ] {
                set(field, active);
            }
            set(&mut colors.selection, with_alpha(color, 0x38));
            // Tinted surfaces: primary at 10% composited over the current
            // background (which the overlay above may just have replaced).
            if let Some(background) = colors.background.as_deref().and_then(parse_hex) {
                let wash = tint_over(color, background, 0.10);
                for field in [
                    &mut colors.list_active,
                    &mut colors.table_active,
                    &mut colors.tab_active,
                    &mut colors.drop_target,
                ] {
                    set(field, wash);
                }
            }
        }
        if let Some(color) = self.primary_foreground {
            set(&mut colors.primary_foreground, color);
            set(&mut colors.button_primary_foreground, color);
            set(&mut colors.sidebar_primary_foreground, color);
        }

        if let Some(color) = self.secondary {
            set(&mut colors.secondary, color);
            set(&mut colors.button_secondary, color);
            set(&mut colors.secondary_hover, hover_step(color, dark));
            set(&mut colors.secondary_active, active_step(color, dark));
            set(&mut colors.button_secondary_hover, hover_step(color, dark));
            set(
                &mut colors.button_secondary_active,
                active_step(color, dark),
            );
        }
        if let Some(color) = self.secondary_foreground {
            set(&mut colors.secondary_foreground, color);
            set(&mut colors.button_secondary_foreground, color);
        }
        if let Some(color) = self.muted {
            set(&mut colors.muted, color);
            set(&mut colors.skeleton, color);
            set(&mut colors.slider_bar, color);
            set(&mut colors.tab_bar_segmented, color);
        }
        if let Some(color) = self.muted_foreground {
            set(&mut colors.muted_foreground, color);
            set(&mut colors.tab_foreground, color);
            set(&mut colors.table_head_foreground, color);
        }
        if let Some(color) = self.accent {
            set(&mut colors.accent, color);
            set(&mut colors.list_hover, color);
            set(&mut colors.table_hover, color);
            set(&mut colors.sidebar_accent, color);
            set(&mut colors.button_hover, color);
        }
        if let Some(color) = self.accent_foreground {
            set(&mut colors.accent_foreground, color);
            set(&mut colors.sidebar_accent_foreground, color);
        }

        if let Some(color) = self.destructive {
            set_status(
                [
                    &mut colors.danger,
                    &mut colors.button_danger,
                    &mut colors.danger_hover,
                    &mut colors.button_danger_hover,
                    &mut colors.danger_active,
                    &mut colors.button_danger_active,
                ],
                color,
                dark,
            );
        }
        if let Some(color) = self.success {
            set_status(
                [
                    &mut colors.success,
                    &mut colors.button_success,
                    &mut colors.success_hover,
                    &mut colors.button_success_hover,
                    &mut colors.success_active,
                    &mut colors.button_success_active,
                ],
                color,
                dark,
            );
        }
        if let Some(color) = self.warning {
            set_status(
                [
                    &mut colors.warning,
                    &mut colors.button_warning,
                    &mut colors.warning_hover,
                    &mut colors.button_warning_hover,
                    &mut colors.warning_active,
                    &mut colors.button_warning_active,
                ],
                color,
                dark,
            );
        }
        if let Some(color) = self.info {
            set_status(
                [
                    &mut colors.info,
                    &mut colors.button_info,
                    &mut colors.info_hover,
                    &mut colors.button_info_hover,
                    &mut colors.info_active,
                    &mut colors.button_info_active,
                ],
                color,
                dark,
            );
        }
        if let Some(color) = self.destructive_foreground {
            set(&mut colors.danger_foreground, color);
            set(&mut colors.button_danger_foreground, color);
        }
        if let Some(color) = self.success_foreground {
            set(&mut colors.success_foreground, color);
            set(&mut colors.button_success_foreground, color);
        }
        if let Some(color) = self.warning_foreground {
            set(&mut colors.warning_foreground, color);
            set(&mut colors.button_warning_foreground, color);
        }
        if let Some(color) = self.info_foreground {
            set(&mut colors.info_foreground, color);
            set(&mut colors.button_info_foreground, color);
        }

        if let Some(color) = self.border {
            set(&mut colors.border, color);
            set(&mut colors.title_bar_border, color);
            set(&mut colors.status_bar_border, color);
            set(&mut colors.sidebar_border, color);
        }
        if let Some(color) = self.input {
            set(&mut colors.input, color);
        }
        // The ring defaults to the primary hue; an explicit ring wins.
        if let Some(color) = self.ring {
            set(&mut colors.ring, color);
            set(&mut colors.caret, color);
        }

        if let Some(color) = self.sidebar {
            set(&mut colors.sidebar, color);
        }
        if let Some(color) = self.sidebar_foreground {
            set(&mut colors.sidebar_foreground, color);
        }
        if let Some(color) = self.sidebar_border {
            set(&mut colors.sidebar_border, color);
        }
        if let Some(color) = self.sidebar_primary {
            set(&mut colors.sidebar_primary, color);
        }
        if let Some(color) = self.sidebar_primary_foreground {
            set(&mut colors.sidebar_primary_foreground, color);
        }
        if let Some(color) = self.sidebar_accent {
            set(&mut colors.sidebar_accent, color);
        }
        if let Some(color) = self.sidebar_accent_foreground {
            set(&mut colors.sidebar_accent_foreground, color);
        }
    }
}

/// One status family (danger / success / warning / info): `[base, button,
/// hover, button_hover, active, button_active]` all derive from the single
/// token.
fn set_status(fields: [&mut Option<SharedString>; 6], color: Hsla, dark: bool) {
    let hover = hover_step(color, dark);
    let active = active_step(color, dark);
    let values = [color, color, hover, hover, active, active];
    for (field, value) in fields.into_iter().zip(values) {
        *field = Some(SharedString::from(hex_string(value)));
    }
}

/// `Hsla` → `#rrggbb` (opaque) / `#rrggbbaa` (alpha-carrying) — the form
/// `theme.json` uses. The `#` is required: the background-token parser
/// rejects bare hex.
fn hex_string(color: Hsla) -> String {
    let rgba = Rgba::from(color);
    let channel = |v: f32| format!("{:02x}", (v * 255.0).round() as u32);
    let rgb = format!("#{}{}{}", channel(rgba.r), channel(rgba.g), channel(rgba.b));
    if rgba.a >= 0.999 {
        rgb
    } else {
        format!("{rgb}{}", channel(rgba.a))
    }
}

/// `#rrggbb` / `#rrggbbaa` → `Hsla`, the reverse of [`hex_string`].
fn parse_hex(value: &str) -> Option<Hsla> {
    let value = value.strip_prefix('#')?;
    let (rgb_part, alpha) = match value.len() {
        6 => (value, 1.0),
        8 => (
            value.get(..6)?,
            u8::from_str_radix(value.get(6..)?, 16).ok()? as f32 / 255.0,
        ),
        _ => return None,
    };
    let code = u32::from_str_radix(rgb_part, 16).ok()?;
    let [r, g, b] = [(code >> 16) & 0xff, (code >> 8) & 0xff, code & 0xff];
    Some(
        Rgba {
            r: r as f32 / 255.0,
            g: g as f32 / 255.0,
            b: b as f32 / 255.0,
            a: alpha,
        }
        .into(),
    )
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

fn with_alpha(color: Hsla, alpha: u32) -> Hsla {
    let mut hsla = color;
    hsla.a = alpha as f32 / 255.0;
    hsla
}

/// One hover step: light darkens the base, dark lightens toward white — the
/// derivation documented in `theme.rs`.
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

#[cfg(test)]
mod tests {
    use gpui::TestAppContext;
    use gpui_component::{ActiveTheme, Theme, ThemeMode};

    use super::*;

    /// RGB part of a color as `0xrrggbb` (the theme.rs test idiom).
    fn code(color: gpui::Hsla) -> u32 {
        let rgba = Rgba::from(color);
        let to8 = |v: f32| (v * 255.0).round() as u32;
        (to8(rgba.r) << 16) | (to8(rgba.g) << 8) | to8(rgba.b)
    }

    #[test]
    fn hex_string_and_parse_round_trip() {
        let opaque = hex(0xd40c1a);
        assert_eq!(hex_string(opaque), "#d40c1a");
        assert_eq!(code(parse_hex("#d40c1a").unwrap()), 0xd40c1a);

        let washed = with_alpha(opaque, 0x38);
        let parsed = parse_hex(&hex_string(washed)).unwrap();
        assert_eq!(code(parsed), 0xd40c1a);
        assert_eq!((Rgba::from(parsed).a * 255.0).round() as u32, 0x38);
        assert_eq!(parse_hex("#nope"), None);
    }

    #[gpui::test]
    fn default_apply_reasserts_the_celestia_defaults(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_component::init(cx);
            crate::theme::install(cx);
            AppTheme::default().apply(cx);

            Theme::change(ThemeMode::Light, None, cx);
            assert_eq!(code(cx.theme().background), 0xffffff);
            assert_eq!(code(cx.theme().primary), 0xd40c1a);
            assert_eq!(code(cx.theme().border), 0xe5e5e5);
            // The single radius knob, and its +4px large-element step.
            assert_eq!(f32::from(cx.theme().radius), 8.0);
            assert_eq!(f32::from(cx.theme().radius_lg), 12.0);

            Theme::change(ThemeMode::Dark, None, cx);
            assert_eq!(code(cx.theme().background), 0x0a0a0a);
            assert_eq!(code(cx.theme().primary), 0xff4d46);
            assert_eq!(f32::from(cx.theme().radius), 8.0);
        });
    }

    #[gpui::test]
    fn radius_applies_to_both_modes(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_component::init(cx);
            crate::theme::install(cx);
            AppTheme {
                radius: px(12.),
                ..Default::default()
            }
            .apply(cx);

            Theme::change(ThemeMode::Light, None, cx);
            assert_eq!(f32::from(cx.theme().radius), 12.0);
            assert_eq!(f32::from(cx.theme().radius_lg), 16.0);
            Theme::change(ThemeMode::Dark, None, cx);
            assert_eq!(f32::from(cx.theme().radius), 12.0);
        });
    }

    /// One token override must recolor everything that token drives — here
    /// the light accent — and nothing in the other mode.
    #[gpui::test]
    fn light_primary_override_fans_out_light_only(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_component::init(cx);
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

            Theme::change(ThemeMode::Light, None, cx);
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
            let theme = Theme::global(cx);
            assert_eq!(
                theme.light_theme.colors.list_active.as_deref(),
                Some("#e9effd")
            );

            Theme::change(ThemeMode::Dark, None, cx);
            assert_eq!(code(cx.theme().primary), 0xff4d46, "dark mode untouched");
            assert_eq!(code(cx.theme().ring), 0xff4d46);
        });
    }

    #[gpui::test]
    fn dark_destructive_override_leaves_light_alone(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_component::init(cx);
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

            Theme::change(ThemeMode::Dark, None, cx);
            assert_eq!(code(cx.theme().danger), 0x38bdf8);
            assert_eq!(code(cx.theme().danger_foreground), 0x0a0a0a);
            assert_eq!(
                code(cx.theme().danger_hover),
                code(hover_step(hex(0x38bdf8), true)),
                "hover derives lighter in dark mode"
            );

            Theme::change(ThemeMode::Light, None, cx);
            assert_eq!(code(cx.theme().danger), 0xe7000b);
            assert_eq!(code(cx.theme().danger_foreground), 0xffffff);
        });
    }
}
