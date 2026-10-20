//! Sheet — window-layer host for side panels.
//!
//! Open with `window.open_sheet(cx, |sheet, _, _| …)` and mount
//! `Root::render_sheet_layer(window, cx)` in the window's root view.
//!
//! For presentational sheet chrome (header / body / footer / side), prefer
//! [`crate::components::composite::sheet_panel::SheetPanel`] and the matching
//! [`SheetHeader`](crate::components::composite::sheet_panel::SheetHeader) /
//! [`SheetFooter`](crate::components::composite::sheet_panel::SheetFooter) /
//! [`SheetTitle`](crate::components::composite::sheet_panel::SheetTitle) /
//! [`SheetDescription`](crate::components::composite::sheet_panel::SheetDescription)
//! builders — the desktop counterparts of web `sheet.tsx`.
//!
//! For a bottom sheet with a swipe handle, see
//! [`crate::components::composite::drawer::Drawer`] (web `drawer.tsx`).

pub use gpui_component::sheet::Sheet;
