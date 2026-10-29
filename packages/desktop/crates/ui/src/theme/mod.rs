//! Celestia theming, written on raw gpui: a `Global` [`Theme`], a resolved
//! [`ThemeColor`] set per mode, and the [`ActiveTheme`] accessor every
//! component reads. This is the crate's own theme service — there is no
//! widget layer underneath it anymore.
//!
//! `theme.json` is the sRGB-hex port of `packages/ui/src/styles/globals.css`
//! (the single source of truth for the celestia design system). Conversions
//! used when porting — re-derive these when globals.css changes:
//!
//! - `oklch(L 0 0)` (pure grays) → `#rrggbb` via OKLab → linear sRGB = L³,
//!   gamma-encoded. The CSS file itself documents the anchor points:
//!   0.145 → #0a0a0a, 0.205 → #171717, 0.269 → #262626, 0.54 → #6f6f6f,
//!   0.708 → #a1a1a1, 0.922 → #e5e5e5, 0.97 → #f5f5f5, 0.985 → #fafafa.
//! - `oklch(L C H)` (chromatic) → full OKLab → sRGB, clamped at the gamut
//!   boundary. Verified against the file's own comments:
//!   `oklch(0.577 0.245 27.325)` → #e7000b, `oklch(0.704 0.191 22.216)` →
//!   #ff6467. Dark `--primary` `oklch(0.68 0.22 27)` is slightly out of gamut
//!   and clips to #ff4d46.
//! - Alpha-carrying tokens (`--border` dark = `oklch(1 0 0 / 10%)`) become
//!   8-digit hex (#ffffff1a), the same form the dark-mode borders use.
//! - Hover/active steps are not defined per-state in the CSS; light steps
//!   darken the base (GetCat's desktop idiom), dark steps lighten toward
//!   white. Status foregrounds follow the CSS: white in light, near-black
//!   (#171717) in dark.
//!
//! Theme is not patched after mode switches: the two configs replace the
//! light/dark pair wholesale, so [`Theme::change`] / [`Theme::toggle`] and
//! system appearance sync keep using them afterwards. Each mode change also
//! mirrors the Celestia light/dark pair onto `gpui-component`'s widget theme
//! so re-exported controls stay in step.

pub mod book;
pub mod config;

pub use crate::fonts::DEFAULT_FONT_FAMILY;
pub use book::{active, families, select};
pub use config::{AppFont, AppTheme, Scheme, hex};

use std::rc::Rc;

use gpui::{App, Global, Hsla, Pixels, Rgba, SharedString, px};

const THEME_JSON: &str = include_str!("../theme.json");
pub(crate) const LIGHT: &str = "Celestia Light";
pub(crate) const DARK: &str = "Celestia Dark";

/// The resolved radius that rounds a shape as far as its own size allows,
/// giving a circle or a pill. Any value past half the shorter side is clamped
/// by the renderer, so this is simply "as round as it goes".
const RADIUS_FULL: Pixels = px(9999.);

/// Light or dark — which side of a theme family is showing.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum ThemeMode {
    #[default]
    Light,
    Dark,
}

impl ThemeMode {
    /// Returns true if the theme is dark.
    #[inline(always)]
    pub fn is_dark(&self) -> bool {
        matches!(self, Self::Dark)
    }

    /// Returns true if the theme is light.
    #[inline(always)]
    pub fn is_light(&self) -> bool {
        !self.is_dark()
    }

    /// Lower-case theme name: `light` or `dark`.
    pub fn name(&self) -> &'static str {
        match self {
            Self::Light => "light",
            Self::Dark => "dark",
        }
    }
}

/// One named theme side: the resolved colors plus the radius knobs. A
/// [family](super::book) is a light + dark pair of these.
#[derive(Clone, Debug)]
pub struct ThemeConfig {
    /// Registry-style name: `<Family> Light` / `<Family> Dark`.
    pub name: SharedString,
    /// Which side this config is.
    pub mode: ThemeMode,
    /// Radius for the general elements.
    pub radius: Pixels,
    /// Radius for the large elements (dialogs, notifications): the shadcn
    /// `--radius-xl` step, `radius + 4px`.
    pub radius_lg: Pixels,
    /// The resolved color set.
    pub colors: ThemeColor,
}

/// The resolved color set for one mode — one field per `theme.json` token.
/// Components read these through `cx.theme()` (via [`Theme`]'s `Deref`).
#[derive(Clone, Debug)]
pub struct ThemeColor {
    /// Page background (`--background`).
    pub background: Hsla,
    /// Default text (`--foreground`).
    pub foreground: Hsla,
    /// Hairline borders (`--border`).
    pub border: Hsla,
    /// Input borders (`--input`).
    pub input: Hsla,
    /// Focus ring (`--ring`).
    pub ring: Hsla,
    /// Text caret.
    pub caret: Hsla,
    /// Text selection wash — the primary hue at 22% alpha.
    pub selection: Hsla,
    /// Muted surfaces — skeletons, slider tracks, segmented tab bars.
    pub muted: Hsla,
    /// De-emphasized text (`--muted-foreground`).
    pub muted_foreground: Hsla,
    /// Hover/accent washes — list and table hover rows, outlined-button hover.
    pub accent: Hsla,
    /// Text on [`ThemeColor::accent`].
    pub accent_foreground: Hsla,
    /// The accent (`--primary`): filled buttons, links, focus ring, caret,
    /// selection wash, slider/progress fills, active rows.
    pub primary: Hsla,
    /// Hover step of [`ThemeColor::primary`] (light darkens, dark lightens).
    pub primary_hover: Hsla,
    /// Active step of [`ThemeColor::primary`].
    pub primary_active: Hsla,
    /// Text/icons on [`ThemeColor::primary`].
    pub primary_foreground: Hsla,
    /// Muted filled controls (`--secondary`).
    pub secondary: Hsla,
    /// Hover step of [`ThemeColor::secondary`].
    pub secondary_hover: Hsla,
    /// Active step of [`ThemeColor::secondary`].
    pub secondary_active: Hsla,
    /// Text on [`ThemeColor::secondary`].
    pub secondary_foreground: Hsla,
    /// Second surface — title bar, status bar, tab bar, group boxes and the
    /// striped list/table rows.
    pub title_bar: Hsla,
    /// Border of the title bar.
    pub title_bar_border: Hsla,
    /// Status bar surface.
    pub status_bar: Hsla,
    /// Border of the status bar.
    pub status_bar_border: Hsla,
    /// Sidebar surface.
    pub sidebar: Hsla,
    /// Sidebar text.
    pub sidebar_foreground: Hsla,
    /// Sidebar borders.
    pub sidebar_border: Hsla,
    /// Sidebar hover wash.
    pub sidebar_accent: Hsla,
    /// Text on [`ThemeColor::sidebar_accent`].
    pub sidebar_accent_foreground: Hsla,
    /// Sidebar accent fill.
    pub sidebar_primary: Hsla,
    /// Text on [`ThemeColor::sidebar_primary`].
    pub sidebar_primary_foreground: Hsla,
    /// List container background.
    pub list: Hsla,
    /// Selected list row (the primary tint at 10% over the background).
    pub list_active: Hsla,
    /// Border of the selected list row.
    pub list_active_border: Hsla,
    /// Hovered list row.
    pub list_hover: Hsla,
    /// List header row.
    pub list_head: Hsla,
    /// Even (striped) list rows.
    pub list_even: Hsla,
    /// Table container background.
    pub table: Hsla,
    /// Selected table row.
    pub table_active: Hsla,
    /// Border of the selected table row.
    pub table_active_border: Hsla,
    /// Hovered table row.
    pub table_hover: Hsla,
    /// Table header row.
    pub table_head: Hsla,
    /// Text in the table header.
    pub table_head_foreground: Hsla,
    /// Table footer row.
    pub table_foot: Hsla,
    /// Text in the table footer.
    pub table_foot_foreground: Hsla,
    /// Even (striped) table rows.
    pub table_even: Hsla,
    /// Hairline between table rows.
    pub table_row_border: Hsla,
    /// Tab bar background.
    pub tab_bar: Hsla,
    /// Segmented tab bar track.
    pub tab_bar_segmented: Hsla,
    /// Inactive tab background.
    pub tab: Hsla,
    /// Inactive tab text.
    pub tab_foreground: Hsla,
    /// Active tab background.
    pub tab_active: Hsla,
    /// Active tab text.
    pub tab_active_foreground: Hsla,
    /// Popover surface (`--popover`).
    pub popover: Hsla,
    /// Text on [`ThemeColor::popover`].
    pub popover_foreground: Hsla,
    /// Accordion surface.
    pub accordion: Hsla,
    /// Group box surface.
    pub group_box: Hsla,
    /// Text in a group box title.
    pub group_box_foreground: Hsla,
    /// Link text.
    pub link: Hsla,
    /// Hovered link.
    pub link_hover: Hsla,
    /// Pressed link.
    pub link_active: Hsla,
    /// Scrollbar track.
    pub scrollbar: Hsla,
    /// Scrollbar thumb.
    pub scrollbar_thumb: Hsla,
    /// Hovered scrollbar thumb.
    pub scrollbar_thumb_hover: Hsla,
    /// Border drawn while dragging a resizable handle.
    pub drag_border: Hsla,
    /// Highlight painted on a valid drop target.
    pub drop_target: Hsla,
    /// Border of a floating window.
    pub window_border: Hsla,
    /// The modal overlay scrim.
    pub overlay: Hsla,
    /// Skeleton placeholder surface.
    pub skeleton: Hsla,
    /// Switch track (off state).
    pub switch: Hsla,
    /// Switch thumb.
    pub switch_thumb: Hsla,
    /// Slider track.
    pub slider_bar: Hsla,
    /// Slider thumb (the primary hue).
    pub slider_thumb: Hsla,
    /// Progress bar fill (the primary hue).
    pub progress_bar: Hsla,
    /// Destructive accent (`--destructive`).
    pub danger: Hsla,
    /// Hover step of [`ThemeColor::danger`].
    pub danger_hover: Hsla,
    /// Active step of [`ThemeColor::danger`].
    pub danger_active: Hsla,
    /// Text on [`ThemeColor::danger`].
    pub danger_foreground: Hsla,
    /// Success accent (`--success`).
    pub success: Hsla,
    /// Hover step of [`ThemeColor::success`].
    pub success_hover: Hsla,
    /// Active step of [`ThemeColor::success`].
    pub success_active: Hsla,
    /// Text on [`ThemeColor::success`].
    pub success_foreground: Hsla,
    /// Warning accent (`--warning`).
    pub warning: Hsla,
    /// Hover step of [`ThemeColor::warning`].
    pub warning_hover: Hsla,
    /// Active step of [`ThemeColor::warning`].
    pub warning_active: Hsla,
    /// Text on [`ThemeColor::warning`].
    pub warning_foreground: Hsla,
    /// Info accent (`--info`).
    pub info: Hsla,
    /// Hover step of [`ThemeColor::info`].
    pub info_hover: Hsla,
    /// Active step of [`ThemeColor::info`].
    pub info_active: Hsla,
    /// Text on [`ThemeColor::info`].
    pub info_foreground: Hsla,
    /// Filled button background (the generic, non-variant button).
    pub button: Hsla,
    /// Hover step of [`ThemeColor::button`].
    pub button_hover: Hsla,
    /// Active step of [`ThemeColor::button`].
    pub button_active: Hsla,
    /// Text on [`ThemeColor::button`].
    pub button_foreground: Hsla,
    /// Primary filled button background.
    pub button_primary: Hsla,
    /// Hover step of [`ThemeColor::button_primary`].
    pub button_primary_hover: Hsla,
    /// Active step of [`ThemeColor::button_primary`].
    pub button_primary_active: Hsla,
    /// Text on [`ThemeColor::button_primary`].
    pub button_primary_foreground: Hsla,
    /// Secondary filled button background.
    pub button_secondary: Hsla,
    /// Hover step of [`ThemeColor::button_secondary`].
    pub button_secondary_hover: Hsla,
    /// Active step of [`ThemeColor::button_secondary`].
    pub button_secondary_active: Hsla,
    /// Text on [`ThemeColor::button_secondary`].
    pub button_secondary_foreground: Hsla,
    /// Danger filled button background.
    pub button_danger: Hsla,
    /// Hover step of [`ThemeColor::button_danger`].
    pub button_danger_hover: Hsla,
    /// Active step of [`ThemeColor::button_danger`].
    pub button_danger_active: Hsla,
    /// Text on [`ThemeColor::button_danger`].
    pub button_danger_foreground: Hsla,
    /// Success filled button background.
    pub button_success: Hsla,
    /// Hover step of [`ThemeColor::button_success`].
    pub button_success_hover: Hsla,
    /// Active step of [`ThemeColor::button_success`].
    pub button_success_active: Hsla,
    /// Text on [`ThemeColor::button_success`].
    pub button_success_foreground: Hsla,
    /// Warning filled button background.
    pub button_warning: Hsla,
    /// Hover step of [`ThemeColor::button_warning`].
    pub button_warning_hover: Hsla,
    /// Active step of [`ThemeColor::button_warning`].
    pub button_warning_active: Hsla,
    /// Text on [`ThemeColor::button_warning`].
    pub button_warning_foreground: Hsla,
    /// Info filled button background.
    pub button_info: Hsla,
    /// Hover step of [`ThemeColor::button_info`].
    pub button_info_hover: Hsla,
    /// Active step of [`ThemeColor::button_info`].
    pub button_info_active: Hsla,
    /// Text on [`ThemeColor::button_info`].
    pub button_info_foreground: Hsla,
    /// Chart ramp — five categorical series colors.
    pub chart_1: Hsla,
    pub chart_2: Hsla,
    pub chart_3: Hsla,
    pub chart_4: Hsla,
    pub chart_5: Hsla,
    /// Candlestick up color.
    pub chart_bullish: Hsla,
    /// Candlestick down color.
    pub chart_bearish: Hsla,
    /// A mode-independent red for semantic dots and swatches.
    pub red: Hsla,
    pub red_light: Hsla,
    pub green: Hsla,
    pub green_light: Hsla,
    pub blue: Hsla,
    pub blue_light: Hsla,
    pub yellow: Hsla,
    pub yellow_light: Hsla,
    pub magenta: Hsla,
    pub magenta_light: Hsla,
    pub cyan: Hsla,
    pub cyan_light: Hsla,
}

impl Default for ThemeColor {
    /// The base every parsed `theme.json` config overwrites. The token colors
    /// are neutral placeholders — `theme.json` defines every one of them for
    /// both modes — while the chart ramp and the semantic catalog colors are
    /// mode-independent and survive into both configs.
    fn default() -> Self {
        Self {
            background: hex(0xffffff),
            foreground: hex(0x0a0a0a),
            border: hex(0xe5e5e5),
            input: hex(0xe5e5e5),
            ring: hex(0x0a0a0a),
            caret: hex(0x0a0a0a),
            selection: hex(0x0a0a0a).alpha(0.22),
            muted: hex(0xf5f5f5),
            muted_foreground: hex(0x6f6f6f),
            accent: hex(0xf5f5f5),
            accent_foreground: hex(0x171717),
            primary: hex(0x0a0a0a),
            primary_hover: hex(0x262626),
            primary_active: hex(0x404040),
            primary_foreground: hex(0xffffff),
            secondary: hex(0xf5f5f5),
            secondary_hover: hex(0xe5e5e5),
            secondary_active: hex(0xd4d4d4),
            secondary_foreground: hex(0x171717),
            title_bar: hex(0xffffff),
            title_bar_border: hex(0xe5e5e5),
            status_bar: hex(0xffffff),
            status_bar_border: hex(0xe5e5e5),
            sidebar: hex(0xfafafa),
            sidebar_foreground: hex(0x0a0a0a),
            sidebar_border: hex(0xe5e5e5),
            sidebar_accent: hex(0xf5f5f5),
            sidebar_accent_foreground: hex(0x171717),
            sidebar_primary: hex(0x0a0a0a),
            sidebar_primary_foreground: hex(0xffffff),
            list: hex(0xffffff),
            list_active: hex(0xf5f5f5),
            list_active_border: hex(0x0a0a0a),
            list_hover: hex(0xf5f5f5),
            list_head: hex(0xfafafa),
            list_even: hex(0xfafafa),
            table: hex(0xffffff),
            table_active: hex(0xf5f5f5),
            table_active_border: hex(0x0a0a0a),
            table_hover: hex(0xf5f5f5),
            table_head: hex(0xfafafa),
            table_head_foreground: hex(0x6f6f6f),
            table_foot: hex(0xfafafa),
            table_foot_foreground: hex(0x6f6f6f),
            table_even: hex(0xfafafa),
            table_row_border: hex(0xf2f2f2),
            tab_bar: hex(0xfafafa),
            tab_bar_segmented: hex(0xf5f5f5),
            tab: Hsla::transparent_black(),
            tab_foreground: hex(0x6f6f6f),
            tab_active: hex(0xffffff),
            tab_active_foreground: hex(0x0a0a0a),
            popover: hex(0xffffff),
            popover_foreground: hex(0x0a0a0a),
            accordion: hex(0xffffff),
            group_box: hex(0xfafafa),
            group_box_foreground: hex(0x0a0a0a),
            link: hex(0x0a0a0a),
            link_hover: hex(0x262626),
            link_active: hex(0x404040),
            scrollbar: Hsla::transparent_black(),
            scrollbar_thumb: hex(0xd4d4d4),
            scrollbar_thumb_hover: hex(0xa1a1a1),
            drag_border: hex(0x0a0a0a),
            drop_target: hex(0xf5f5f5),
            window_border: hex(0xe5e5e5),
            overlay: hex(0x000000).alpha(0.7),
            skeleton: hex(0xf5f5f5),
            switch: hex(0xd4d4d4),
            switch_thumb: hex(0xffffff),
            slider_bar: hex(0xf5f5f5),
            slider_thumb: hex(0x0a0a0a),
            progress_bar: hex(0x0a0a0a),
            danger: hex(0xe7000b),
            danger_hover: hex(0xd0000a),
            danger_active: hex(0xb90009),
            danger_foreground: hex(0xffffff),
            success: hex(0x007b2a),
            success_hover: hex(0x006f26),
            success_active: hex(0x006222),
            success_foreground: hex(0xffffff),
            warning: hex(0x994e00),
            warning_hover: hex(0x8a4600),
            warning_active: hex(0x7a3e00),
            warning_foreground: hex(0xffffff),
            info: hex(0x0062c9),
            info_hover: hex(0x0058b5),
            info_active: hex(0x004ea1),
            info_foreground: hex(0xffffff),
            button: hex(0xffffff),
            button_hover: hex(0xf5f5f5),
            button_active: hex(0xe5e5e5),
            button_foreground: hex(0x0a0a0a),
            button_primary: hex(0x0a0a0a),
            button_primary_hover: hex(0x262626),
            button_primary_active: hex(0x404040),
            button_primary_foreground: hex(0xffffff),
            button_secondary: hex(0xf5f5f5),
            button_secondary_hover: hex(0xe5e5e5),
            button_secondary_active: hex(0xd4d4d4),
            button_secondary_foreground: hex(0x171717),
            button_danger: hex(0xe7000b),
            button_danger_hover: hex(0xd0000a),
            button_danger_active: hex(0xb90009),
            button_danger_foreground: hex(0xffffff),
            button_success: hex(0x007b2a),
            button_success_hover: hex(0x006f26),
            button_success_active: hex(0x006222),
            button_success_foreground: hex(0xffffff),
            button_warning: hex(0x994e00),
            button_warning_hover: hex(0x8a4600),
            button_warning_active: hex(0x7a3e00),
            button_warning_foreground: hex(0xffffff),
            button_info: hex(0x0062c9),
            button_info_hover: hex(0x0058b5),
            button_info_active: hex(0x004ea1),
            button_info_foreground: hex(0xffffff),
            chart_1: hex(0x3b82f6),
            chart_2: hex(0xef4444),
            chart_3: hex(0xeab308),
            chart_4: hex(0x22c55e),
            chart_5: hex(0xa855f7),
            chart_bullish: hex(0x22c55e),
            chart_bearish: hex(0xef4444),
            red: hex(0xef4444),
            red_light: hex(0xf87171),
            green: hex(0x22c55e),
            green_light: hex(0x4ade80),
            blue: hex(0x3b82f6),
            blue_light: hex(0x60a5fa),
            yellow: hex(0xeab308),
            yellow_light: hex(0xfacc15),
            magenta: hex(0xd946ef),
            magenta_light: hex(0xe879f9),
            cyan: hex(0x06b6d4),
            cyan_light: hex(0x22d3ee),
        }
    }
}

impl ThemeColor {
    /// The background an input paints when it must read as a well rather than
    /// a flat field: the input border color at low strength in dark mode
    /// (over the page background), the plain background in light mode.
    ///
    /// A method on [`Theme`] — it needs the mode, which colors alone cannot
    /// carry; [`Theme::input_background`] forwards here via `Deref`.
    #[inline]
    pub fn input_background(&self, dark: bool) -> Hsla {
        if dark {
            self.input.alpha(0.3)
        } else {
            self.background
        }
    }
}

/// The global theme: the resolved colors of the active mode ([`Deref`] target,
/// so `cx.theme().primary` reads a color) plus the fonts, radii and the
/// light/dark pair the [active family](super::book) provides.
#[derive(Debug)]
pub struct Theme {
    /// The resolved colors of the active mode.
    pub colors: ThemeColor,
    /// The active family's light side.
    pub light_theme: Rc<ThemeConfig>,
    /// The active family's dark side.
    pub dark_theme: Rc<ThemeConfig>,
    /// The active mode.
    pub mode: ThemeMode,
    /// The font family for the application. Default is [`DEFAULT_FONT_FAMILY`]
    /// (Geist), embedded at startup.
    pub font_family: SharedString,
    /// The base font size for the application, default is 16px.
    pub font_size: Pixels,
    /// The monospace font family for the application.
    pub mono_font_family: SharedString,
    /// The monospace font size for the application, default is 13px.
    pub mono_font_size: Pixels,
    /// Radius for the general elements.
    pub radius: Pixels,
    /// Radius for the large elements, e.g. dialog, notification borders.
    pub radius_lg: Pixels,
    /// Whether focused controls draw a ring outside their border, default true.
    ///
    /// The ring is painted outside the element, so any ancestor that clips its
    /// content will cut it off. An application whose layout clips heavily can
    /// turn it off here: focused controls then show only their tinted border,
    /// which costs no space and cannot be clipped.
    pub focus_ring: bool,
    /// Whether controls paint shadows, default true.
    pub shadow: bool,
    /// Fully transparent — the "no color" value for optional borders.
    pub transparent: Hsla,
}

impl Global for Theme {}

impl std::ops::Deref for Theme {
    type Target = ThemeColor;

    fn deref(&self) -> &Self::Target {
        &self.colors
    }
}

impl std::ops::DerefMut for Theme {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.colors
    }
}

/// Read the theme from anything — the accessor every component uses:
/// `cx.theme().primary`.
pub trait ActiveTheme {
    /// Returns the global theme.
    fn theme(&self) -> &Theme;
}

impl ActiveTheme for App {
    #[inline(always)]
    fn theme(&self) -> &Theme {
        Theme::global(self)
    }
}

impl Theme {
    /// Returns the global theme reference.
    #[inline(always)]
    pub fn global(cx: &App) -> &Theme {
        cx.global::<Theme>()
    }

    /// Returns the global theme mutable reference.
    #[inline(always)]
    pub fn global_mut(cx: &mut App) -> &mut Theme {
        cx.global_mut::<Theme>()
    }

    /// Returns true if the theme is dark.
    #[inline(always)]
    pub fn is_dark(&self) -> bool {
        self.mode.is_dark()
    }

    /// Returns the current theme name (`"Celestia Light"` by default).
    pub fn theme_name(&self) -> &SharedString {
        if self.is_dark() {
            &self.dark_theme.name
        } else {
            &self.light_theme.name
        }
    }

    /// Switch to the given mode within the active family: re-resolves the
    /// colors and radii from that family's config and repaints every window.
    ///
    /// Also keeps the `gpui-component` widget theme on the same mode (and the
    /// Celestia light/dark pair), so re-exported controls stay in step with
    /// every Celestia component that reads `cx.theme()`.
    pub fn change(mode: ThemeMode, cx: &mut App) {
        let (colors, radius, radius_lg) = {
            let theme = cx.global_mut::<Theme>();
            theme.mode = mode;
            let config: ThemeConfig = if mode.is_dark() {
                (*theme.dark_theme).clone()
            } else {
                (*theme.light_theme).clone()
            };
            (config.colors, config.radius, config.radius_lg)
        };

        let theme = cx.global_mut::<Theme>();
        theme.colors = colors;
        theme.radius = radius;
        theme.radius_lg = radius_lg;
        sync_widget_theme(mode, cx);
        cx.refresh_windows();
    }

    /// Flip between light and dark within the active family.
    ///
    /// This is the one-liner apps should bind to a key (⌘D in the showcase)
    /// or a settings toggle — prefer it over reading `is_dark` and calling
    /// [`Self::change`] by hand.
    pub fn toggle(cx: &mut App) {
        let next = if Self::global(cx).is_dark() {
            ThemeMode::Light
        } else {
            ThemeMode::Dark
        };
        Self::change(next, cx);
    }

    /// Sync the theme with the system appearance, when a window is available.
    pub fn sync_system_appearance(window: Option<&mut gpui::Window>, cx: &mut App) {
        let Some(window) = window else {
            return;
        };
        let mode = match window.appearance() {
            gpui::WindowAppearance::Dark | gpui::WindowAppearance::VibrantDark => ThemeMode::Dark,
            gpui::WindowAppearance::Light | gpui::WindowAppearance::VibrantLight => {
                ThemeMode::Light
            }
        };
        Self::change(mode, cx);
    }

    /// The background an input paints when it must read as a well rather than
    /// a flat field: the input border color at low strength in dark mode
    /// (over the page background), the plain background in light mode.
    #[inline]
    pub fn input_background(&self) -> Hsla {
        self.colors.input_background(self.is_dark())
    }

    /// The radius that rounds a shape as far as its own size allows — a
    /// circle or a pill. Zero radius stays zero.
    pub fn radius_full(&self) -> Pixels {
        if self.radius == px(0.) {
            px(0.)
        } else {
            RADIUS_FULL
        }
    }

    /// The next surface radius above the `xl` tier, derived from the same
    /// application-controlled base radius.
    pub fn radius_2xl(&self) -> Pixels {
        self.radius * 2.5
    }

    /// The surface radius above [`Self::radius_2xl`].
    pub fn radius_3xl(&self) -> Pixels {
        self.radius * 3.
    }

    /// The surface radius above [`Self::radius_3xl`].
    pub fn radius_4xl(&self) -> Pixels {
        self.radius * 3.5
    }

    /// The small surface radius (half the base) — the `sm` step of the radius
    /// ladder.
    pub fn radius_xs(&self) -> Pixels {
        self.radius / 4.
    }

    pub fn radius_sm(&self) -> Pixels {
        self.radius / 2.
    }

    /// The `xl` step of the radius ladder: twice the base radius.
    pub fn radius_xl(&self) -> Pixels {
        self.radius * 2.
    }
}

/// Install the Celestia light/dark palettes as the active theme family.
///
/// Call from the app's `application().run(|cx| ...)` closure before opening
/// any windows. The JSON is compile-time embedded and its key values are
/// pinned by the tests below, so a failure here is a bug and panics rather
/// than silently falling back to a default gray.
pub fn install(cx: &mut App) {
    crate::fonts::install(cx);

    let (light, dark) =
        parse_theme_json(THEME_JSON).expect("celestia theme.json must parse and resolve");

    // Seed the global before anything reads it — `book::activate` and
    // `Theme::change` both `global_mut::<Theme>()`, which panics when the
    // global is absent. Defaults mirror the gpui-component theme's own
    // `From<&ThemeColor>` construction.
    cx.set_global(Theme {
        colors: light.colors.clone(),
        light_theme: Rc::new(light.clone()),
        dark_theme: Rc::new(dark.clone()),
        mode: ThemeMode::default(),
        font_family: DEFAULT_FONT_FAMILY.into(),
        font_size: px(16.),
        mono_font_family: default_mono_font_family(),
        mono_font_size: px(13.),
        radius: light.radius,
        radius_lg: light.radius_lg,
        focus_ring: true,
        shadow: true,
        transparent: Hsla::transparent_black(),
    });

    // Seed the theme book with the Celestia family (the multi-theme layer).
    book::install(cx, &light, &dark);
    book::activate(cx, light, dark);

    // The window root reads gpui-component's theme for the cascading family.
    // Theme files have no font keys, so this survives later mode switches.
    if cx.has_global::<gpui_component::Theme>() {
        gpui_component::Theme::update(cx, |theme| {
            theme.font_family = DEFAULT_FONT_FAMILY.into();
        });
    }
}

/// Keep `gpui-component`'s separate `Theme` global on the Celestia light/dark
/// pair and the same mode. Celestia owns theming; re-exported widgets still
/// read `gpui_component::ActiveTheme`, so mode (and base palette) must move
/// together or the shell splits — light sidebar, dark content — the way the
/// gallery did before this bridge.
///
/// Also swaps the syntax [`HighlightTheme`](gpui_component::highlighter::HighlightTheme):
/// `theme.json` carries colors only, so without this the `CodeEditor` kept the
/// previous mode's `editor.background` (white pane in dark mode).
fn sync_widget_theme(mode: ThemeMode, cx: &mut App) {
    use gpui_component::highlighter::HighlightTheme;
    use gpui_component::{Theme as WidgetTheme, ThemeMode as WidgetMode, ThemeRegistry};

    if !cx.has_global::<ThemeRegistry>() {
        return;
    }

    // Register Celestia Light/Dark once; subsequent calls are no-ops for
    // names that are already present.
    let _ = ThemeRegistry::global_mut(cx).load_themes_from_str(THEME_JSON);

    let (light, dark) = {
        let registry = ThemeRegistry::global(cx);
        (
            registry.themes().get(LIGHT).cloned(),
            registry.themes().get(DARK).cloned(),
        )
    };

    if let (Some(light), Some(dark)) = (light, dark) {
        WidgetTheme::update(cx, |theme| {
            theme.light_theme = light;
            theme.dark_theme = dark;
        });
    }

    let widget_mode = match mode {
        ThemeMode::Light => WidgetMode::Light,
        ThemeMode::Dark => WidgetMode::Dark,
    };
    WidgetTheme::change(widget_mode, None, cx);

    // Celestia configs have no `highlight` block, so `apply_config` leaves the
    // previous syntax theme in place — force the matching default.
    WidgetTheme::update(cx, |theme| {
        theme.highlight_theme = match mode {
            ThemeMode::Dark => HighlightTheme::default_dark(),
            ThemeMode::Light => HighlightTheme::default_light(),
        };
        // Outer outline ring off — Celestia Button/Input have no focus ring
        // (web: `outline-none`, no `focus-visible:ring-*` / `border-ring`).
        theme.focus_ring = false;
        // Slightly tighter than gpui-component's 382px default so toasts read
        // as compact notices rather than wide banners.
        theme.notification.width = px(300.);
    });
}

/// The framework's platform monospace default — `gpui-base` keeps the same
/// ladder private, so it is repeated here for the seed above.
pub(crate) fn default_mono_font_family() -> SharedString {
    if cfg!(target_os = "macos") {
        "Menlo".into()
    } else if cfg!(target_os = "windows") {
        "Consolas".into()
    } else {
        "DejaVu Sans Mono".into()
    }
}

/// Map one `theme.json` dotted key onto its [`ThemeColor`] field.
fn apply_token(colors: &mut ThemeColor, key: &str, color: Hsla) {
    match key {
        "background" => colors.background = color,
        "foreground" => colors.foreground = color,
        "border" => colors.border = color,
        "input.border" => colors.input = color,
        "ring" => colors.ring = color,
        "caret" => colors.caret = color,
        "selection.background" => colors.selection = color,
        "muted.background" => colors.muted = color,
        "muted.foreground" => colors.muted_foreground = color,
        "accent.background" => colors.accent = color,
        "accent.foreground" => colors.accent_foreground = color,
        "primary.background" => colors.primary = color,
        "primary.foreground" => colors.primary_foreground = color,
        "primary.hover.background" => colors.primary_hover = color,
        "primary.active.background" => colors.primary_active = color,
        "secondary.background" => colors.secondary = color,
        "secondary.foreground" => colors.secondary_foreground = color,
        "secondary.hover.background" => colors.secondary_hover = color,
        "secondary.active.background" => colors.secondary_active = color,
        "button.background" => colors.button = color,
        "button.foreground" => colors.button_foreground = color,
        "button.hover.background" => colors.button_hover = color,
        "button.active.background" => colors.button_active = color,
        "danger.background" => colors.danger = color,
        "danger.foreground" => colors.danger_foreground = color,
        "danger.hover.background" => colors.danger_hover = color,
        "danger.active.background" => colors.danger_active = color,
        "success.background" => colors.success = color,
        "success.foreground" => colors.success_foreground = color,
        "success.hover.background" => colors.success_hover = color,
        "success.active.background" => colors.success_active = color,
        "warning.background" => colors.warning = color,
        "warning.foreground" => colors.warning_foreground = color,
        "warning.hover.background" => colors.warning_hover = color,
        "warning.active.background" => colors.warning_active = color,
        "info.background" => colors.info = color,
        "info.foreground" => colors.info_foreground = color,
        "info.hover.background" => colors.info_hover = color,
        "info.active.background" => colors.info_active = color,
        "title_bar.background" => colors.title_bar = color,
        "title_bar.border" => colors.title_bar_border = color,
        "status_bar.background" => colors.status_bar = color,
        "status_bar.border" => colors.status_bar_border = color,
        "sidebar.background" => colors.sidebar = color,
        "sidebar.foreground" => colors.sidebar_foreground = color,
        "sidebar.border" => colors.sidebar_border = color,
        "sidebar.accent.background" => colors.sidebar_accent = color,
        "sidebar.accent.foreground" => colors.sidebar_accent_foreground = color,
        "sidebar.primary.background" => colors.sidebar_primary = color,
        "sidebar.primary.foreground" => colors.sidebar_primary_foreground = color,
        "list.background" => colors.list = color,
        "list.active.background" => colors.list_active = color,
        "list.active.border" => colors.list_active_border = color,
        "list.hover.background" => colors.list_hover = color,
        "list.head.background" => colors.list_head = color,
        "list.even.background" => colors.list_even = color,
        "table.background" => colors.table = color,
        "table.active.background" => colors.table_active = color,
        "table.active.border" => colors.table_active_border = color,
        "table.hover.background" => colors.table_hover = color,
        "table.head.background" => colors.table_head = color,
        "table.head.foreground" => colors.table_head_foreground = color,
        "table.even.background" => colors.table_even = color,
        "table.row.border" => colors.table_row_border = color,
        "tab_bar.background" => colors.tab_bar = color,
        "tab_bar.segmented.background" => colors.tab_bar_segmented = color,
        "tab.background" => colors.tab = color,
        "tab.foreground" => colors.tab_foreground = color,
        "tab.active.background" => colors.tab_active = color,
        "tab.active.foreground" => colors.tab_active_foreground = color,
        "popover.background" => colors.popover = color,
        "popover.foreground" => colors.popover_foreground = color,
        "accordion.background" => colors.accordion = color,
        "group_box.background" => colors.group_box = color,
        "group_box.foreground" => colors.group_box_foreground = color,
        "link" => colors.link = color,
        "link.hover" => colors.link_hover = color,
        "link.active" => colors.link_active = color,
        "scrollbar.thumb.background" => colors.scrollbar_thumb = color,
        "scrollbar.thumb.hover.background" => colors.scrollbar_thumb_hover = color,
        "drag.border" => colors.drag_border = color,
        "drop_target.background" => colors.drop_target = color,
        "window.border" => colors.window_border = color,
        "overlay" => colors.overlay = color,
        "skeleton.background" => colors.skeleton = color,
        "switch.background" => colors.switch = color,
        "switch.thumb.background" => colors.switch_thumb = color,
        "slider.background" => colors.slider_bar = color,
        "slider.thumb.background" => colors.slider_thumb = color,
        "progress.bar.background" => colors.progress_bar = color,
        other => panic!("unmapped theme.json color key `{other}` — add it to apply_token"),
    }
}

/// Parse the embedded `theme.json` into the light/dark config pair.
fn parse_theme_json(json: &str) -> Result<(ThemeConfig, ThemeConfig), String> {
    let value: serde_json::Value =
        serde_json::from_str(json).map_err(|e| format!("theme.json: {e}"))?;
    let themes = value
        .get("themes")
        .and_then(|t| t.as_array())
        .ok_or("theme.json: missing `themes` array")?;

    let mut light = None;
    let mut dark = None;
    for theme in themes {
        let name = theme
            .get("name")
            .and_then(|n| n.as_str())
            .ok_or("theme.json: theme missing `name`")?;
        let mode = match theme.get("mode").and_then(|m| m.as_str()) {
            Some("light") => ThemeMode::Light,
            Some("dark") => ThemeMode::Dark,
            other => return Err(format!("theme.json: theme `{name}` has mode {other:?}")),
        };
        let radius = theme
            .get("radius")
            .and_then(|r| r.as_f64())
            .map(|r| px(r as f32))
            .unwrap_or(px(8.));

        let mut colors = ThemeColor::default();
        let map = theme
            .get("colors")
            .and_then(|c| c.as_object())
            .ok_or_else(|| format!("theme.json: theme `{name}` missing `colors`"))?;
        for (key, value) in map {
            let hex_str = value
                .as_str()
                .ok_or_else(|| format!("theme.json: `{key}` must be a hex string"))?;
            let color = parse_hex(hex_str)
                .ok_or_else(|| format!("theme.json: `{key}` invalid hex `{hex_str}`"))?;
            apply_token(&mut colors, key, color);
        }

        let config = ThemeConfig {
            name: SharedString::from(name),
            mode,
            radius,
            // The large-element step: the shadcn `--radius-xl`, radius + 4px.
            radius_lg: radius + px(4.),
            colors,
        };
        match mode {
            ThemeMode::Light => light = Some(config),
            ThemeMode::Dark => dark = Some(config),
        }
    }

    match (light, dark) {
        (Some(light), Some(dark)) => Ok((light, dark)),
        _ => Err("theme.json: both a light and a dark theme are required".into()),
    }
}

/// `#rrggbb` / `#rrggbbaa` → [`Hsla`].
pub(crate) fn parse_hex(value: &str) -> Option<Hsla> {
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::theme::ActiveTheme as _;

    fn hex(color: gpui::Hsla) -> u32 {
        let rgba = Rgba::from(color);
        let to8 = |v: f32| (v * 255.0).round() as u32;
        (to8(rgba.r) << 16) | (to8(rgba.g) << 8) | to8(rgba.b)
    }

    #[gpui::test]
    fn install_replaces_the_default_palette(cx: &mut gpui::TestAppContext) {
        cx.update(|cx| {
            install(cx);

            Theme::change(ThemeMode::Light, cx);
            assert_eq!(hex(cx.theme().background), 0xffffff);
            assert_eq!(hex(cx.theme().foreground), 0x0a0a0a);
            assert_eq!(hex(cx.theme().primary), 0xd40c1a);
            assert_eq!(hex(cx.theme().border), 0xe5e5e5);
            assert_eq!(hex(cx.theme().sidebar), 0xfafafa);
            assert_eq!(hex(cx.theme().title_bar), 0xfafafa);
            assert_eq!(hex(cx.theme().muted_foreground), 0x6f6f6f);
            assert_eq!(hex(cx.theme().danger), 0xe7000b);
            assert_eq!(hex(cx.theme().success), 0x007b2a);
            assert_eq!(hex(cx.theme().warning), 0x994e00);

            Theme::change(ThemeMode::Dark, cx);
            assert_eq!(hex(cx.theme().background), 0x0a0a0a);
            assert_eq!(hex(cx.theme().foreground), 0xfafafa);
            assert_eq!(hex(cx.theme().primary), 0xff4d46);
            assert_eq!(hex(cx.theme().danger), 0xff6467);
            assert_eq!(hex(cx.theme().success), 0x42b966);
            assert_eq!(hex(cx.theme().warning), 0xda8b00);
            assert_eq!(hex(cx.theme().muted_foreground), 0xa1a1a1);
            assert_eq!(hex(cx.theme().sidebar), 0x171717);
        });
    }

    /// Dark borders ride on white alpha (oklch(1 0 0 / 10%)) — the rgb part is
    /// white and the alpha carries the value.
    #[gpui::test]
    fn dark_border_is_white_alpha(cx: &mut gpui::TestAppContext) {
        cx.update(|cx| {
            install(cx);

            Theme::change(ThemeMode::Dark, cx);
            let rgba = Rgba::from(cx.theme().border);
            assert_eq!((rgba.r * 255.0).round() as u32, 0xff);
            assert_eq!((rgba.g * 255.0).round() as u32, 0xff);
            assert_eq!((rgba.b * 255.0).round() as u32, 0xff);
            assert_eq!((rgba.a * 255.0).round() as u32, 0x1a);
        });
    }

    /// The selection tint rides on the primary hue at 22% alpha in both modes.
    #[gpui::test]
    fn selection_matches_primary_at_22_percent(cx: &mut gpui::TestAppContext) {
        cx.update(|cx| {
            install(cx);

            for mode in [ThemeMode::Light, ThemeMode::Dark] {
                Theme::change(mode, cx);
                let rgba = Rgba::from(cx.theme().selection);
                assert_eq!((rgba.a * 255.0).round() as u32, 0x38, "{mode:?}");
                assert_eq!(hex(cx.theme().selection), hex(cx.theme().primary));
            }
        });
    }

    /// Primary must not regress to the old blue (#3f87bd) the brand moved away
    /// from — the same staleness trap as the web token tables.
    #[gpui::test]
    fn primary_is_the_brand_red_not_legacy_blue(cx: &mut gpui::TestAppContext) {
        cx.update(|cx| {
            install(cx);

            Theme::change(ThemeMode::Light, cx);
            assert_eq!(hex(cx.theme().primary), 0xd40c1a);
        });
    }

    /// The radius knobs ride the config: 8px base, +4px large-element step.
    #[gpui::test]
    fn radius_comes_from_the_config(cx: &mut gpui::TestAppContext) {
        cx.update(|cx| {
            install(cx);

            Theme::change(ThemeMode::Light, cx);
            assert_eq!(f32::from(cx.theme().radius), 8.0);
            assert_eq!(f32::from(cx.theme().radius_lg), 12.0);
        });
    }

    /// Mode flips must move both Theme globals together — otherwise the
    /// gallery shell (Celestia) and re-exported widgets (gpui-component) drift
    /// apart (light sidebar on a dark content pane).
    #[gpui::test]
    fn toggle_keeps_widget_theme_in_sync(cx: &mut gpui::TestAppContext) {
        cx.update(|cx| {
            gpui_component::init(cx);
            install(cx);

            assert!(!Theme::global(cx).is_dark());
            assert!(!gpui_component::Theme::global(cx).is_dark());

            Theme::toggle(cx);
            assert!(Theme::global(cx).is_dark());
            assert!(gpui_component::Theme::global(cx).is_dark());
            assert_eq!(
                gpui_component::Theme::global(cx).theme_name().as_ref(),
                DARK
            );
            assert!(
                gpui_component::Theme::global(cx)
                    .highlight_theme
                    .appearance
                    .is_dark(),
                "CodeEditor highlight theme must follow dark mode"
            );

            Theme::toggle(cx);
            assert!(!Theme::global(cx).is_dark());
            assert!(!gpui_component::Theme::global(cx).is_dark());
            assert_eq!(
                gpui_component::Theme::global(cx).theme_name().as_ref(),
                LIGHT
            );
            assert!(
                !gpui_component::Theme::global(cx)
                    .highlight_theme
                    .appearance
                    .is_dark(),
                "CodeEditor highlight theme must follow light mode"
            );
        });
    }
}
