//! celestia-ui — reusable GPUI components and theming for the Celestia desktop
//! app. The desktop counterpart of `@celestia-project/ui`.
//!
//! Apps initialize once with [`init`] (`gpui-component` runtime + Celestia theme),
//! then build screens from [`components`] and `gpui-component` primitives, taking all
//! colors from `cx.theme()` / [`palette`]. Shared application state lives in
//! [`state`] — zustand-style stores and React-context-style ambient values.

pub mod assets;
pub mod components;
pub mod focus_ring;
pub mod motion;
pub mod palette;
pub mod state;
pub mod theme;

// The accessor keeps the module's name: `use celestia_ui::palette;` brings
// both, and `palette(cx)` resolves to this function.
pub use palette::palette;

pub use gpui;

/// Install the `gpui-component` runtime and the Celestia theme. Call from the app's
/// `application().run(|cx| ...)` closure before opening any windows.
pub fn init(cx: &mut gpui::App) {
    gpui_component::init(cx);
    theme::install(cx);
}
