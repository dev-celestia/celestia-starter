//! Toasts — `toast.tsx` / `sonner.tsx` → gpui `notification`.
//!
//! Push with `window.push_notification(Notification::success("…"), cx)` and
//! mount `Root::render_notification_layer(window, cx)` in the window's root
//! view — the layer is not drawn automatically.
//!
//! Upstream [`Notification`] already renders a single corner dismiss control.
//! Do not wrap with an extra [`Notification::action`] close button — that
//! stacks a second X on the toast.

use std::rc::Rc;

use gpui::{App, ElementId, Entity, Window};
use gpui_component::WindowExt as GpuiWindowExt;
use gpui_component::dialog::{AlertDialog, Dialog};
use gpui_component::input::AnyInputState;
use gpui_component::sheet::Sheet;
use gpui_component::Placement;

pub use gpui_component::notification::Notification;

/// Window overlays — same surface as gpui-component's `WindowExt`.
pub trait WindowExt {
    fn open_sheet<F>(&mut self, cx: &mut App, build: F)
    where
        F: Fn(Sheet, &mut Window, &mut App) -> Sheet + 'static;

    fn open_sheet_at<F>(&mut self, placement: Placement, cx: &mut App, build: F)
    where
        F: Fn(Sheet, &mut Window, &mut App) -> Sheet + 'static;

    fn has_active_sheet(&mut self, cx: &mut App) -> bool;

    fn close_sheet(&mut self, cx: &mut App);

    fn open_dialog<F>(&mut self, cx: &mut App, build: F)
    where
        F: Fn(Dialog, &mut Window, &mut App) -> Dialog + 'static;

    fn open_alert_dialog<F>(&mut self, cx: &mut App, build: F)
    where
        F: Fn(AlertDialog, &mut Window, &mut App) -> AlertDialog + 'static;

    fn has_active_dialog(&mut self, cx: &mut App) -> bool;

    fn close_dialog(&mut self, cx: &mut App);

    fn close_all_dialogs(&mut self, cx: &mut App);

    /// Push a toast (upstream supplies the corner dismiss control).
    fn push_notification(&mut self, note: impl Into<Notification>, cx: &mut App);

    fn remove_notification<T: Sized + 'static>(&mut self, cx: &mut App);

    fn remove_notification1<T: Sized + 'static>(&mut self, key: impl Into<ElementId>, cx: &mut App);

    fn clear_notifications(&mut self, cx: &mut App);

    fn notifications(&mut self, cx: &mut App) -> Rc<Vec<Entity<Notification>>>;

    fn focused_input(&mut self, cx: &mut App) -> Option<AnyInputState>;

    fn has_focused_input(&mut self, cx: &mut App) -> bool;
}

impl WindowExt for Window {
    #[inline]
    fn open_sheet<F>(&mut self, cx: &mut App, build: F)
    where
        F: Fn(Sheet, &mut Window, &mut App) -> Sheet + 'static,
    {
        GpuiWindowExt::open_sheet(self, cx, build)
    }

    #[inline]
    fn open_sheet_at<F>(&mut self, placement: Placement, cx: &mut App, build: F)
    where
        F: Fn(Sheet, &mut Window, &mut App) -> Sheet + 'static,
    {
        GpuiWindowExt::open_sheet_at(self, placement, cx, build)
    }

    #[inline]
    fn has_active_sheet(&mut self, cx: &mut App) -> bool {
        GpuiWindowExt::has_active_sheet(self, cx)
    }

    #[inline]
    fn close_sheet(&mut self, cx: &mut App) {
        GpuiWindowExt::close_sheet(self, cx)
    }

    #[inline]
    fn open_dialog<F>(&mut self, cx: &mut App, build: F)
    where
        F: Fn(Dialog, &mut Window, &mut App) -> Dialog + 'static,
    {
        GpuiWindowExt::open_dialog(self, cx, build)
    }

    #[inline]
    fn open_alert_dialog<F>(&mut self, cx: &mut App, build: F)
    where
        F: Fn(AlertDialog, &mut Window, &mut App) -> AlertDialog + 'static,
    {
        GpuiWindowExt::open_alert_dialog(self, cx, build)
    }

    #[inline]
    fn has_active_dialog(&mut self, cx: &mut App) -> bool {
        GpuiWindowExt::has_active_dialog(self, cx)
    }

    #[inline]
    fn close_dialog(&mut self, cx: &mut App) {
        GpuiWindowExt::close_dialog(self, cx)
    }

    #[inline]
    fn close_all_dialogs(&mut self, cx: &mut App) {
        GpuiWindowExt::close_all_dialogs(self, cx)
    }

    #[inline]
    fn push_notification(&mut self, note: impl Into<Notification>, cx: &mut App) {
        GpuiWindowExt::push_notification(self, note, cx)
    }

    #[inline]
    fn remove_notification<T: Sized + 'static>(&mut self, cx: &mut App) {
        GpuiWindowExt::remove_notification::<T>(self, cx)
    }

    #[inline]
    fn remove_notification1<T: Sized + 'static>(
        &mut self,
        key: impl Into<ElementId>,
        cx: &mut App,
    ) {
        GpuiWindowExt::remove_notification1::<T>(self, key, cx)
    }

    #[inline]
    fn clear_notifications(&mut self, cx: &mut App) {
        GpuiWindowExt::clear_notifications(self, cx)
    }

    #[inline]
    fn notifications(&mut self, cx: &mut App) -> Rc<Vec<Entity<Notification>>> {
        GpuiWindowExt::notifications(self, cx)
    }

    #[inline]
    fn focused_input(&mut self, cx: &mut App) -> Option<AnyInputState> {
        GpuiWindowExt::focused_input(self, cx)
    }

    #[inline]
    fn has_focused_input(&mut self, cx: &mut App) -> bool {
        GpuiWindowExt::has_focused_input(self, cx)
    }
}
