//! celestia-ui — reusable GPUI components and theming for the Celestia desktop
//! app. The desktop counterpart of `@celestia-project/ui`.
//!
//! Apps initialize once with [`init`] (gpui-kit runtime + Celestia theme),
//! then build screens from [`components`] and gpui-kit primitives, taking all
//! colors from `cx.theme()` / [`palette`].

pub mod components;
pub mod motion;
pub mod palette;
pub mod theme;

// The accessor keeps the module's name: `use celestia_ui::palette;` brings
// both, and `palette(cx)` resolves to this function.
pub use palette::palette;

pub use gpui_kit;

/// Install the gpui-kit runtime and the Celestia theme. Call from the app's
/// `application().run(|cx| ...)` closure before opening any windows.
pub fn init(cx: &mut gpui_kit::App) {
    gpui_kit::init(cx);
    theme::install(cx);
}
