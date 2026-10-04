//! Sheet (drawer) — `drawer.tsx` / `sheet.tsx` → gpui `sheet`.
//!
//! Open with `window.open_sheet(cx, |sheet, _, _| …)` and mount
//! `Root::render_sheet_layer(window, cx)` in the window's root view.

pub use gpui_kit::component::sheet::Sheet;
