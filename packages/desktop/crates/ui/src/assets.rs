//! Application asset sources — the embedded Phosphor catalog composed with
//! gpui-kit's default Lucide bundle.
//!
//! gpui-pre accepts a single `AssetSource` at startup (`with_assets`), so
//! applications register [`CelestiaAssets`], which serves the vendored
//! Phosphor SVGs first and delegates everything else to `gpui_kit::assets`.
//! Phosphor paths are `phosphor/<weight>/<name>.svg`; Lucide stays at the
//! gpui-kit `icons/…` prefix, so the two catalogs never collide.

use std::borrow::Cow;

use gpui_kit::{AssetSource, Result, SharedString};

/// The embedded Phosphor catalog (`assets/phosphor/**`, Phosphor Core
/// 2.1.1, MIT — see `assets/phosphor/LICENSE-PHOSPHOR`).
///
/// In debug builds rust-embed reads the SVGs from disk; release builds embed
/// them in the binary.
#[derive(rust_embed::RustEmbed)]
#[folder = "assets"]
#[include = "phosphor/**/*.svg"]
pub struct PhosphorAssets;

impl AssetSource for PhosphorAssets {
    fn load(&self, path: &str) -> Result<Option<Cow<'static, [u8]>>> {
        Ok(Self::get(path).map(|file| file.data))
    }

    fn list(&self, path: &str) -> Result<Vec<SharedString>> {
        Ok(Self::iter()
            .filter(|name| name.starts_with(path))
            .map(Into::into)
            .collect())
    }
}

/// The application asset source: Phosphor first, gpui-kit's default Lucide
/// bundle as the fallback.
///
/// Register before the app runs:
///
/// ```ignore
/// gpui_kit::platform::application()
///     .with_assets(CelestiaAssets)
///     .run(|cx| { … });
/// ```
pub struct CelestiaAssets;

impl AssetSource for CelestiaAssets {
    fn load(&self, path: &str) -> Result<Option<Cow<'static, [u8]>>> {
        if let Some(data) = PhosphorAssets.load(path)? {
            return Ok(Some(data));
        }
        // gpui-kit's `Assets` reports missing paths as an error; translate to
        // `Ok(None)` so callers (and the SVG renderer) treat this source as
        // uniformly miss-tolerant.
        Ok(gpui_kit::assets::Assets::new("assets")
            .load(path)
            .ok()
            .flatten())
    }

    fn list(&self, path: &str) -> Result<Vec<SharedString>> {
        let mut paths = PhosphorAssets.list(path)?;
        paths.extend(
            gpui_kit::assets::Assets::new("assets")
                .list(path)
                .unwrap_or_default(),
        );
        Ok(paths)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::components::icon::{PhosphorIcon, PhosphorWeight};

    #[test]
    fn phosphor_assets_serve_regular_weight() {
        let heart = PhosphorAssets
            .load("phosphor/regular/heart.svg")
            .expect("load must not error")
            .expect("heart.svg must be embedded");
        assert!(!heart.is_empty());
        assert!(std::str::from_utf8(&heart).unwrap().contains("<svg"));
    }

    #[test]
    fn every_glyph_resolves_at_every_weight() {
        for icon in PhosphorIcon::ALL {
            for weight in [PhosphorWeight::Regular, PhosphorWeight::Bold, PhosphorWeight::Fill] {
                let path = weight.path(*icon);
                assert!(
                    PhosphorAssets.load(&path).expect("load").is_some(),
                    "missing phosphor asset: {path}"
                );
            }
        }
    }

    #[test]
    fn celestia_assets_compose_phosphor_and_lucide() {
        // Phosphor resolves at its own prefix…
        assert!(CelestiaAssets
            .load("phosphor/regular/heart.svg")
            .expect("load")
            .is_some());
        // …the gpui-kit Lucide bundle still resolves at `icons/…`…
        let lucide = gpui_kit::assets::IconName::Search.path();
        assert!(CelestiaAssets.load(&lucide).expect("load").is_some());
        // …and unknown paths are a clean miss, not an error.
        assert!(CelestiaAssets.load("nope/missing.svg").expect("load").is_none());
    }

    #[test]
    fn list_prefixes_partition_the_catalog() {
        let regular = PhosphorAssets.list("phosphor/regular/").expect("list");
        assert!(regular.len() >= PhosphorIcon::COUNT);
        assert!(regular
            .iter()
            .all(|path| path.starts_with("phosphor/regular/")));
    }
}
