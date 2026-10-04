//! Toasts — `toast.tsx` / `sonner.tsx` → gpui `notification`.
//!
//! Push with `window.push_notification(Notification::success("…"), cx)` and
//! mount `Root::render_notification_layer(window, cx)` in the window's root
//! view — the layer is not drawn automatically.

pub use gpui_component::WindowExt;
pub use gpui_component::notification::Notification;
