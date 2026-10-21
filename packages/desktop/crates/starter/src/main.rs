// Windows release builds: no console window (debug keeps it for logs).
#![cfg_attr(all(windows, not(debug_assertions)), windows_subsystem = "windows")]

//! Minimal Celestia Desktop boilerplate.
//!
//! Copy this crate when starting a new GPUI app. Bootstrap order (do not
//! reorder):
//!
//! 1. `gpui_platform::application().with_assets(CelestiaAssets)` — icons
//! 2. `celestia_ui::init(cx)` — component runtime + Celestia theme
//! 3. `AppMenu` + `bind_window_keys` — app menu and window shortcuts
//! 4. `open_window(…, |window, cx| Root::new(view, window, cx))`
//!
//! Window chrome, sub-windows, menu, and actions live in `composite/window`
//! (`WindowChrome::Native` for real roots, `Embedded` for previews).
//! macOS chrome for now; other OS layouts join that module later.
//!
//! Talk to `apps/api` via `celestia-bridge` (see the Backend sidebar page).
//!
//! Run from the monorepo root:
//!
//! ```bash
//! pnpm --filter @workspace/api dev   # terminal A
//! pnpm desktop:starter               # terminal B
//! # or
//! cargo run --manifest-path packages/desktop/Cargo.toml -p celestia-desktop-starter
//! ```

mod actions;
mod app;

use actions::ToggleTheme;
use app::StarterApp;
use celestia_ui::assets::CelestiaAssets;
use celestia_ui::components::composite::window::{
    AppMenu, MinimizeWindow, ZoomWindow, bind_window_keys, open_window,
};
use gpui::*;
use gpui_component::Root;

fn primary(key: &str) -> String {
    if cfg!(target_os = "macos") {
        format!("cmd-{key}")
    } else {
        format!("ctrl-{key}")
    }
}

fn main() {
    gpui_platform::application()
        .with_assets(CelestiaAssets)
        .run(|cx| {
            celestia_ui::init(cx);

            cx.bind_keys([KeyBinding::new(&primary("d"), ToggleTheme, None)]);
            bind_window_keys(cx);

            // App menu: File (New / Close), Edit, View (Full Screen),
            // Window (Minimize / Zoom), Help. Fullscreen hides it; top-edge
            // hover reveals it again on macOS.
            AppMenu::standard("Celestia Starter")
                .menu(Menu::new("Window").items([
                    MenuItem::action("Minimize", MinimizeWindow),
                    MenuItem::action("Zoom", ZoomWindow),
                ]))
                .install(cx);

            open_window("Celestia Starter", cx, |window, cx| {
                let view = cx.new(|cx| StarterApp::new(window, cx));
                cx.new(|cx| Root::new(view, window, cx))
            })
            .expect("failed to open the starter window");

            cx.activate(true);
        });
}
