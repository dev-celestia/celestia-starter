// Windows 的 release 构建不要附带控制台窗口（debug 构建保留，方便看输出）
#![cfg_attr(all(windows, not(debug_assertions)), windows_subsystem = "windows")]

//! Celestia Desktop — component gallery for the `celestia-ui` library.
//!
//! The window is itself a demo of the [`SidebarLayout`] shell: a sidebar nav
//! picks the component section, the content pane renders it through the same
//! re-export layer an application would use. Bootstrap follows the GetCat
//! reference: `gpui_platform::application()` → `celestia_ui::init` (runtime +
//! theme) → keybindings → open window wrapping the root view in a
//! `gpui-component` `Root`.

mod actions;
mod assets;
mod section;
mod sections;
mod showcase;

use actions::ToggleTheme;
use celestia_ui::components::composite::title_bar::TitleBar;
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

            cx.bind_keys([KeyBinding::new(&primary("d"), ToggleTheme, None)]);

            let options = WindowOptions {
                window_bounds: Some(WindowBounds::centered(size(px(1280.), px(820.)), cx)),
                window_min_size: Some(size(px(800.), px(520.))),
                #[cfg(target_os = "linux")]
                window_background: WindowBackgroundAppearance::Transparent,
                #[cfg(target_os = "linux")]
                window_decorations: Some(WindowDecorations::Client),
                ..TitleBar::window_options()
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
