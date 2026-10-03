//! Celestia theming: loads `theme.json` into gpui-kit's `ThemeRegistry` and
//! replaces the default light/dark configs.
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
//!   8-digit hex (#ffffff1a), the same form gpui-kit's `overlay` uses.
//! - Hover/active steps are not defined per-state in the CSS; light steps
//!   darken the base (GetCat's desktop idiom), dark steps lighten toward
//!   white. Status foregrounds follow the CSS: white in light, near-black
//!   (#171717) in dark.
//!
//! Theme is not patched after mode switches: the two configs replace
//! `Theme::light_theme` / `Theme::dark_theme`, so `Theme::change` and system
//! appearance sync keep using them afterwards.

use gpui_kit::App;
use gpui_kit::component::{Theme, ThemeRegistry};

const THEME_JSON: &str = include_str!("theme.json");
const LIGHT: &str = "Celestia Light";
const DARK: &str = "Celestia Dark";

/// Install the Celestia light/dark palettes as the active theme configs.
///
/// Must run after `gpui_kit::init`. The JSON is compile-time embedded and its
/// key values are pinned by the tests below, so a failure here is a bug and
/// panics rather than silently falling back to gpui-kit's default gray.
pub fn install(cx: &mut App) {
    ThemeRegistry::global_mut(cx)
        .load_themes_from_str(THEME_JSON)
        .expect("celestia theme.json must parse");

    let registry = ThemeRegistry::global(cx);
    let (Some(light), Some(dark)) = (
        registry.themes().get(LIGHT).cloned(),
        registry.themes().get(DARK).cloned(),
    ) else {
        panic!("Celestia Light/Dark themes missing from the registry after load");
    };

    let theme = Theme::global_mut(cx);
    theme.light_theme = light;
    theme.dark_theme = dark;
    let mode = theme.mode;
    // Re-apply the current mode so the new configs take effect immediately.
    Theme::change(mode, None, cx);
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui_kit::Rgba;
    use gpui_kit::TestAppContext;
    use gpui_kit::component::{ActiveTheme, ThemeMode};

    fn hex(color: gpui_kit::Hsla) -> u32 {
        let rgba = Rgba::from(color);
        let to8 = |v: f32| (v * 255.0).round() as u32;
        (to8(rgba.r) << 16) | (to8(rgba.g) << 8) | to8(rgba.b)
    }

    #[gpui_kit::test]
    fn install_replaces_the_default_palette(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_kit::init(cx);
            install(cx);

            Theme::change(ThemeMode::Light, None, cx);
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

            Theme::change(ThemeMode::Dark, None, cx);
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
    #[gpui_kit::test]
    fn dark_border_is_white_alpha(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_kit::init(cx);
            install(cx);

            Theme::change(ThemeMode::Dark, None, cx);
            let rgba = Rgba::from(cx.theme().border);
            assert_eq!((rgba.r * 255.0).round() as u32, 0xff);
            assert_eq!((rgba.g * 255.0).round() as u32, 0xff);
            assert_eq!((rgba.b * 255.0).round() as u32, 0xff);
            assert_eq!((rgba.a * 255.0).round() as u32, 0x1a);
        });
    }

    /// The selection tint rides on the primary hue at 22% alpha in both modes.
    #[gpui_kit::test]
    fn selection_matches_primary_at_22_percent(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_kit::init(cx);
            install(cx);

            for mode in [ThemeMode::Light, ThemeMode::Dark] {
                Theme::change(mode, None, cx);
                let rgba = Rgba::from(cx.theme().selection);
                assert_eq!((rgba.a * 255.0).round() as u32, 0x38, "{mode:?}");
                assert_eq!(hex(cx.theme().selection), hex(cx.theme().primary));
            }
        });
    }

    /// Primary must not regress to the old blue (#3f87bd) the brand moved away
    /// from — the same staleness trap as the web token tables.
    #[gpui_kit::test]
    fn primary_is_the_brand_red_not_legacy_blue(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_kit::init(cx);
            install(cx);

            Theme::change(ThemeMode::Light, None, cx);
            assert_eq!(hex(cx.theme().primary), 0xd40c1a);
        });
    }
}
