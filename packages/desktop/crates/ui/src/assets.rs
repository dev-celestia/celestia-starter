//! Application asset source — the embedded Phosphor catalog.
//!
//! gpui-pre accepts a single `AssetSource` at startup (`with_assets`), so
//! applications register [`CelestiaAssets`]. It serves the vendored Phosphor
//! SVGs at `phosphor/<weight>/<name>.svg` and reports every other path as a
//! clean miss.
//!
//! Phosphor is the only icon catalog: the crate used to delegate unknown paths
//! to gpui-kit's bundled Lucide set, which meant a second catalog with its own
//! `icons/…` prefix and a second crate to keep pinned. The three Lucide glyphs
//! still referenced (a tab's `BookOpen`, the showcase's `Eye` and `Code`) have
//! direct Phosphor equivalents, so the fallback is gone.

use std::borrow::Cow;

use gpui::{AssetSource, Result, SharedString};

/// The embedded Phosphor catalog (`assets/phosphor/**`, Phosphor Core 2.1.1,
/// MIT — see `assets/phosphor/LICENSE-PHOSPHOR`).
///
/// In debug builds rust-embed reads the SVGs from disk; release builds embed
/// them in the binary.
#[derive(rust_embed::RustEmbed)]
#[folder = "assets"]
#[include = "phosphor/**/*.svg"]
pub struct CelestiaAssets;

impl AssetSource for CelestiaAssets {
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::components::primitive::icon::{PhosphorIcon, PhosphorWeight};

    #[test]
    fn phosphor_assets_serve_regular_weight() {
        let heart = CelestiaAssets
            .load("phosphor/regular/heart.svg")
            .expect("load must not error")
            .expect("heart.svg must be embedded");
        assert!(!heart.is_empty());
        assert!(std::str::from_utf8(&heart).unwrap().contains("<svg"));
    }

    #[test]
    fn every_glyph_resolves_at_every_weight() {
        for icon in PhosphorIcon::ALL {
            for weight in [
                PhosphorWeight::Regular,
                PhosphorWeight::Bold,
                PhosphorWeight::Fill,
            ] {
                let path = weight.path(*icon);
                assert!(
                    CelestiaAssets.load(&path).expect("load").is_some(),
                    "missing phosphor asset: {path}"
                );
            }
        }
    }

    /// An unknown path is a clean miss, not an error — the SVG renderer treats
    /// a missing glyph as "draw nothing", and an `Err` here would surface as a
    /// render panic instead.
    #[test]
    fn unknown_paths_miss_cleanly() {
        assert!(
            CelestiaAssets
                .load("nope/missing.svg")
                .expect("load")
                .is_none()
        );
    }

    #[test]
    fn list_prefixes_partition_the_catalog() {
        let regular = CelestiaAssets.list("phosphor/regular/").expect("list");
        assert!(regular.len() >= PhosphorIcon::COUNT);
        assert!(
            regular
                .iter()
                .all(|path| path.starts_with("phosphor/regular/"))
        );
    }
}
