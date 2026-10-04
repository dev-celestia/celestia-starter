//! The theme book — multi-theme support on top of gpui-kit's two-mode
//! `Theme` global.
//!
//! gpui-kit's `Theme` holds exactly one light and one dark [`ThemeConfig`]
//! and `Theme::change` flips between them. That covers "light and dark";
//! this module adds the third axis — **named custom themes** — without
//! replacing either mechanism:
//!
//! - A **family** is a named `(light, dark)` config pair. The `Celestia`
//!   family (the `theme.json` palettes) is seeded by [`install`] and is
//!   always the default.
//! - [`AppTheme::register`] builds a new family from semantic tokens (over
//!   the Celestia base) and activates it; [`select`] switches between
//!   registered families; [`active`] / [`families`] read the book.
//! - `AppTheme::apply` stays an *overlay on the active family*, so radius and
//!   token tweaks compose with whichever family is selected.
//!
//! Families live in a private [`ThemeBook`] global rather than the gpui-kit
//! `ThemeRegistry`: the registry has no public replace/remove, and its change
//! observer re-pulls configs by name — families it does not know are simply
//! left alone, so custom themes survive registry churn untouched. Selecting
//! or applying a family assigns the pair straight onto `Theme::global_mut`
//! and re-applies the current mode, exactly like `install` does — so
//! `Theme::change` and system-appearance sync keep working within the
//! selected family.
//!
//! ```ignore
//! use celestia_ui::theme::{active, families, select, AppTheme, hex, Scheme};
//!
//! // A custom theme, driven by the same semantic tokens as globals.css:
//! AppTheme {
//!     dark: Scheme {
//!         background: Some(hex(0x0b1120)),
//!         primary: Some(hex(0x38bdf8)),
//!         ..Default::default()
//!     },
//!     ..Default::default()
//! }
//! .register("Nocturne", cx); // registers + activates
//!
//! select("Celestia", cx); // back to the default family
//! families(cx);           // ["Celestia", "Nocturne"]
//! active(cx);             // "Celestia"
//! ```

use std::collections::HashMap;

use gpui_component::{Theme, ThemeConfig, ThemeRegistry};
use gpui::{App, Global, SharedString};

/// The default family name — seeded from `theme.json` by [`install`].
pub(crate) const CELESTIA: &str = "Celestia";

/// One named theme family: a light + dark config pair.
#[derive(Clone)]
struct Family {
    light: ThemeConfig,
    dark: ThemeConfig,
}

/// The registered theme families and the active one.
#[derive(Default)]
struct ThemeBook {
    families: HashMap<SharedString, Family>,
    active: Option<SharedString>,
}

impl Global for ThemeBook {}

/// Seed the book with the `Celestia` family from the registry and make it
/// active. Called by [`super::install`]; must run after it has loaded the
/// registry entries.
pub(crate) fn install(cx: &mut App) {
    let registry = ThemeRegistry::global(cx);
    let (Some(light), Some(dark)) = (
        registry.themes().get(super::LIGHT).cloned(),
        registry.themes().get(super::DARK).cloned(),
    ) else {
        panic!("Celestia Light/Dark themes missing from the registry");
    };

    let mut book = ThemeBook::default();
    book.families.insert(
        SharedString::from(CELESTIA),
        Family {
            light: light.as_ref().clone(),
            dark: dark.as_ref().clone(),
        },
    );
    book.active = Some(SharedString::from(CELESTIA));
    cx.set_global(book);
}

/// The registered family names, `Celestia` first, the rest alphabetical.
///
/// Empty before [`install`] — call it through [`crate::init`].
pub fn families(cx: &App) -> Vec<SharedString> {
    let Some(book) = cx.try_global::<ThemeBook>() else {
        return Vec::new();
    };
    let mut names: Vec<SharedString> = book.families.keys().cloned().collect();
    names.sort();
    names.sort_by_key(|name| name.as_ref() != CELESTIA);
    names
}

/// The active family name (the default `"Celestia"` before [`install`]).
pub fn active(cx: &App) -> SharedString {
    cx.try_global::<ThemeBook>()
        .and_then(|book| book.active.clone())
        .unwrap_or_else(|| SharedString::from(CELESTIA))
}

/// Make the named family the active theme.
///
/// Returns `false` (and changes nothing) when the name is not registered.
/// The current light/dark *mode* is preserved — the family provides both.
pub fn select(name: &str, cx: &mut App) -> bool {
    let Some(family) = book(cx).and_then(|book| book.families.get(name).cloned()) else {
        return false;
    };

    // Scoped block ends the `global_mut` borrow before `activate` re-borrows
    // `cx`.
    {
        let book = cx.global_mut::<ThemeBook>();
        book.active = Some(SharedString::from(name));
    }

    activate(cx, family.light, family.dark);
    true
}

/// The active family's config pair (owned clones).
pub(crate) fn active_pair(cx: &App) -> (ThemeConfig, ThemeConfig) {
    book(cx)
        .and_then(|book| {
            let active = book.active.as_ref()?;
            book.families.get(active).cloned()
        })
        .map(|family| (family.light, family.dark))
        .unwrap_or_else(|| panic!("no active theme family; call celestia_ui::init first"))
}

/// The `Celestia` family's config pair — the base every registered family
/// derives from.
pub(crate) fn celestia_pair(cx: &App) -> (ThemeConfig, ThemeConfig) {
    book(cx)
        .and_then(|book| book.families.get(CELESTIA).cloned())
        .map(|family| (family.light, family.dark))
        .unwrap_or_else(|| {
            panic!("Celestia family missing from the theme book; call celestia_ui::init first")
        })
}

/// Persist the active family's pair (after an [`AppTheme::apply`](super::AppTheme::apply)
/// overlay), so switching away and back preserves the tweak.
pub(crate) fn store_active_pair(cx: &mut App, light: ThemeConfig, dark: ThemeConfig) {
    if !cx.has_global::<ThemeBook>() {
        return;
    }
    let book = cx.global_mut::<ThemeBook>();
    let Some(active) = book.active.clone() else {
        return;
    };
    if let Some(family) = book.families.get_mut(&active) {
        family.light = light;
        family.dark = dark;
    }
}

/// Insert (or replace) a family and make it active.
pub(crate) fn insert_and_activate(
    cx: &mut App,
    name: SharedString,
    mut light: ThemeConfig,
    mut dark: ThemeConfig,
) {
    // Registry-style names, so Theme::theme_name() and the registry observer
    // (which looks the active names up and skips unknown ones) stay coherent.
    light.name = format!("{name} Light").into();
    dark.name = format!("{name} Dark").into();

    {
        let book = cx.global_mut::<ThemeBook>();
        book.families.insert(
            name.clone(),
            Family {
                light: light.clone(),
                dark: dark.clone(),
            },
        );
        book.active = Some(name);
    }
    activate(cx, light, dark);
}

/// Push a pair onto the `Theme` global and re-apply the current mode — the
/// same hand-off `install` performs, so mode switches keep using the pair.
pub(crate) fn activate(cx: &mut App, light: ThemeConfig, dark: ThemeConfig) {
    let mode = {
        let theme = Theme::global_mut(cx);
        theme.light_theme = std::rc::Rc::new(light);
        theme.dark_theme = std::rc::Rc::new(dark);
        theme.mode
    };
    Theme::change(mode, None, cx);
    cx.refresh_windows();
}

fn book(cx: &App) -> Option<&ThemeBook> {
    cx.try_global::<ThemeBook>()
}

#[cfg(test)]
mod tests {
    use gpui::Rgba;
    use gpui::TestAppContext;
    use gpui_component::{ActiveTheme, ThemeMode};

    use super::super::config::{AppTheme, Scheme, hex};
    use super::*;

    /// RGB part of a color as `0xrrggbb` (the theme.rs test idiom).
    fn code(color: gpui::Hsla) -> u32 {
        let rgba = Rgba::from(color);
        let to8 = |v: f32| (v * 255.0).round() as u32;
        (to8(rgba.r) << 16) | (to8(rgba.g) << 8) | to8(rgba.b)
    }

    #[gpui::test]
    fn register_activates_and_select_switches_back(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_component::init(cx);
            crate::theme::install(cx);
            assert_eq!(active(cx), CELESTIA);
            assert_eq!(families(cx), vec![SharedString::from(CELESTIA)]);

            AppTheme {
                dark: Scheme {
                    background: Some(hex(0x0b1120)),
                    ..Default::default()
                },
                ..Default::default()
            }
            .register("Nocturne", cx);

            assert_eq!(active(cx), "Nocturne");
            assert_eq!(
                families(cx),
                vec![SharedString::from(CELESTIA), SharedString::from("Nocturne"),]
            );

            // The custom family's dark background is live, and the configs
            // carry registry-style names.
            Theme::change(ThemeMode::Dark, None, cx);
            assert_eq!(code(cx.theme().background), 0x0b1120);
            assert_eq!(Theme::global(cx).dark_theme.name, "Nocturne Dark");

            // Switching back restores Celestia…
            assert!(select(CELESTIA, cx));
            assert_eq!(active(cx), CELESTIA);
            Theme::change(ThemeMode::Dark, None, cx);
            assert_eq!(code(cx.theme().background), 0x0a0a0a);

            // …and switching to the custom family preserves its tokens.
            assert!(select("Nocturne", cx));
            Theme::change(ThemeMode::Dark, None, cx);
            assert_eq!(code(cx.theme().background), 0x0b1120);

            // Unknown names are a no-op.
            assert!(!select("Missing", cx));
            assert_eq!(active(cx), "Nocturne");
        });
    }

    #[gpui::test]
    fn apply_overlays_whichever_family_is_active(cx: &mut TestAppContext) {
        cx.update(|cx| {
            gpui_component::init(cx);
            crate::theme::install(cx);

            AppTheme {
                dark: Scheme {
                    background: Some(hex(0x0b1120)),
                    ..Default::default()
                },
                ..Default::default()
            }
            .register("Nocturne", cx);

            // A plain apply while Nocturne is active adjusts Nocturne — its
            // custom dark background survives the overlay.
            AppTheme {
                light: Scheme {
                    primary: Some(hex(0x2563eb)),
                    ..Default::default()
                },
                ..Default::default()
            }
            .apply(cx);

            Theme::change(ThemeMode::Light, None, cx);
            assert_eq!(code(cx.theme().primary), 0x2563eb);
            Theme::change(ThemeMode::Dark, None, cx);
            assert_eq!(code(cx.theme().background), 0x0b1120);

            // The tweak is stored on the family, not just the live theme:
            // switch away and back, the blue light accent persists.
            assert!(select(CELESTIA, cx));
            assert!(select("Nocturne", cx));
            Theme::change(ThemeMode::Light, None, cx);
            assert_eq!(code(cx.theme().primary), 0x2563eb);
        });
    }
}
