// Windows 的 release 构建不要附带控制台窗口（debug 构建保留，方便看输出）
#![cfg_attr(all(windows, not(debug_assertions)), windows_subsystem = "windows")]

//! Celestia Desktop — component gallery for the `celestia-ui` library.
//!
//! The root view is wrapped in `composite/window::Window` with
//! `WindowChrome::Native`. A sidebar nav picks the component section; the
//! content pane renders it through the same re-export layer an application
//! would use. Bootstrap: `gpui_platform::application()` → `celestia_ui::init`
//! → `AppMenu` + keys → open window wrapping the root in `gpui-component::Root`.

mod actions;
mod assets;
mod catalog;
mod section;
mod sections;
mod showcase;

use actions::ToggleTheme;
use celestia_ui::components::composite::window::{
    self as app_window, AppMenu, CloseWindow, MinimizeWindow, ToggleFullScreen, ZoomWindow,
};
use celestia_ui::state::StoreContext;
use gpui::*;
use gpui_component::Root;
use sections::state::Session;
use showcase::Showcase;

fn primary(key: &str) -> String {
    if cfg!(target_os = "macos") {
        format!("cmd-{key}")
    } else {
        format!("ctrl-{key}")
    }
}

fn main() {
    gpui_platform::application()
        .with_assets(assets::ShowcaseAssets)
        .run(|cx| {
            celestia_ui::init(cx);

            // Ambient session context (React-context pattern): provided once at
            // the root, consumed anywhere via StoreContext::<Session>::require.
            StoreContext::<Session>::provide(Session::default(), cx);

            cx.bind_keys([
                KeyBinding::new(&primary("d"), ToggleTheme, None),
                #[cfg(target_os = "macos")]
                KeyBinding::new("cmd-w", CloseWindow, None),
                #[cfg(target_os = "macos")]
                KeyBinding::new("cmd-m", MinimizeWindow, None),
                #[cfg(target_os = "macos")]
                KeyBinding::new("cmd-ctrl-f", ToggleFullScreen, None),
                #[cfg(not(target_os = "macos"))]
                KeyBinding::new("ctrl-w", CloseWindow, None),
                #[cfg(not(target_os = "macos"))]
                KeyBinding::new("ctrl-m", MinimizeWindow, None),
                #[cfg(not(target_os = "macos"))]
                KeyBinding::new("f11", ToggleFullScreen, None),
            ]);
            // Live menu bar: File (Close), Edit, View (Full Screen),
            // Window (Minimize / Zoom), Help. No New Window — the gallery
            // is a single window. Fullscreen hides the bar; top-edge hover
            // reveals it again.
            AppMenu::standard("Celestia")
                .menu(Menu::new("File").items([MenuItem::action("Close", CloseWindow)]))
                .menu(Menu::new("Window").items([
                    MenuItem::action("Minimize", MinimizeWindow),
                    MenuItem::action("Zoom", ZoomWindow),
                ]))
                .install(cx);

            let options = WindowOptions {
                window_bounds: Some(WindowBounds::centered(size(px(1280.), px(820.)), cx)),
                window_min_size: Some(size(px(800.), px(520.))),
                #[cfg(target_os = "linux")]
                window_background: WindowBackgroundAppearance::Transparent,
                #[cfg(target_os = "linux")]
                window_decorations: Some(WindowDecorations::Client),
                ..app_window::Window::window_options()
            };

            cx.open_window(options, |window, cx| {
                window.set_window_title("Celestia Desktop");
                let view = cx.new(|cx| Showcase::new(window, cx));
                cx.new(|cx| Root::new(view, window, cx))
            })
            .expect("failed to open the Celestia window");

            cx.activate(true);
        });
}
