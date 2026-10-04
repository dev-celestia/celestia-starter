//! Showcase demo media, layered over the library asset catalog.
//!
//! The demo images live with the app that shows them (mirroring how the web
//! showcase owns its demo image URLs), while [`CelestiaAssets`] keeps serving
//! the Phosphor + Lucide icon catalogs. Register [`ShowcaseAssets`] instead of
//! the library source so both resolve from one `with_assets` call.

use std::borrow::Cow;

use gpui::{AssetSource, Result, SharedString};

use celestia_ui::assets::CelestiaAssets;

/// Demo media embedded with the binary (`assets/avatars/**`).
#[derive(rust_embed::RustEmbed)]
#[folder = "assets"]
struct DemoAssets;

/// The application asset source: demo media first, then the library catalog.
pub struct ShowcaseAssets;

impl AssetSource for ShowcaseAssets {
    fn load(&self, path: &str) -> Result<Option<Cow<'static, [u8]>>> {
        if let Some(file) = DemoAssets::get(path) {
            return Ok(Some(file.data));
        }
        CelestiaAssets.load(path)
    }

    fn list(&self, path: &str) -> Result<Vec<SharedString>> {
        let mut paths: Vec<SharedString> = DemoAssets::iter()
            .filter(|name| name.starts_with(path))
            .map(Into::into)
            .collect();
        paths.extend(CelestiaAssets.list(path)?);
        Ok(paths)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn demo_avatars_embed_and_resolve() {
        for path in ["avatars/celestia-ai.png", "avatars/demo-user.jpg"] {
            assert!(
                DemoAssets::get(path).is_some(),
                "missing demo asset: {path}"
            );
            assert!(
                ShowcaseAssets.load(path).expect("load").is_some(),
                "ShowcaseAssets must serve: {path}"
            );
        }
    }

    #[test]
    fn library_catalog_still_resolves_through_the_wrapper() {
        // Phosphor via CelestiaAssets…
        assert!(
            ShowcaseAssets
                .load("phosphor/regular/heart.svg")
                .expect("load")
                .is_some()
        );
        // …and unknown paths are a clean miss, not an error.
        assert!(
            ShowcaseAssets
                .load("nope/missing.svg")
                .expect("load")
                .is_none()
        );
    }
}
