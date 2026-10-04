//! Dialog — `dialog.tsx` → gpui `dialog`.
//!
//! Open with `window.open_dialog(cx, |dialog, _, _| …)` (WindowExt, see
//! [`super::toast`]) and mount `Root::render_dialog_layer(window, cx)` in the
//! window's root view. `alert-dialog.tsx` maps to `AlertDialog`.

pub use gpui_kit::component::dialog::{AlertDialog, Dialog};
