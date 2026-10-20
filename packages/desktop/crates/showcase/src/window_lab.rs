//! Lightweight window used to exercise Mac window chrome from the gallery.
//!
//! Opened by File → New Window and by the Window gallery demo.
//! Keep this small so a sub-window is obviously separate from the full showcase.

use celestia_ui::components::composite::window::{
    CloseWindow, MacWindow, MacWindowChrome, MinimizeWindow, NewWindow, ShowHelp,
    ToggleFullScreen, ZoomWindow,
};
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::toast::{Notification, WindowExt as _};
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::v_flex;

/// A small Mac window for trying new, minimize, zoom, fullscreen, and close.
pub struct WindowLab {
    focus_handle: FocusHandle,
}

impl WindowLab {
    pub fn new(_window: &mut Window, cx: &mut Context<Self>) -> Self {
        Self {
            focus_handle: cx.focus_handle(),
        }
    }
}

impl Render for WindowLab {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();

        div()
            .id("window-lab")
            .role(Role::Group)
            .aria_label("Mac window lab")
            .key_context("WindowLab")
            .track_focus(&self.focus_handle)
            .on_action(|_: &NewWindow, _, cx| {
                crate::showcase::Showcase::open_sub_window(cx);
            })
            .on_action(|_: &CloseWindow, window, _| window.remove_window())
            .on_action(|_: &MinimizeWindow, window, _| window.minimize_window())
            .on_action(|_: &ZoomWindow, window, _| window.zoom_window())
            .on_action(|_: &ToggleFullScreen, window, _| window.toggle_fullscreen())
            .on_action(|_: &ShowHelp, window, cx| {
                window.push_notification(
                    Notification::info("Help — try the buttons or the menu bar."),
                    cx,
                );
            })
            .size_full()
            .child(
                MacWindow::new("window-lab", "Window Lab")
                    .chrome(MacWindowChrome::Window)
                    .child(
                        div()
                            .flex_1()
                            .w_full()
                            .p(px(24.))
                            .flex()
                            .flex_col()
                            .items_center()
                            .justify_center()
                            .gap(px(20.))
                            .bg(theme.background)
                            .text_color(theme.foreground)
                            .child(
                                div()
                                    .text_lg()
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .child("composite/window"),
                            )
                            .child(
                                div()
                                    .max_w(px(420.))
                                    .text_sm()
                                    .text_color(theme.muted_foreground)
                                    .child(
                                        "Real OS sub-window via open_mac_window + MacWindowChrome::Window. \
                                         Use the native traffic lights, the buttons below, or File / Window / View. \
                                         In fullscreen, move the pointer to the top edge to reveal the installed MacAppMenu.",
                                    ),
                            )
                            .child(
                                v_flex()
                                    .gap_2()
                                    .w(px(280.))
                                    .child(
                                        Button::new("lab-new")
                                            .label("New Window")
                                            .on_click(|_, _, cx| {
                                                crate::showcase::Showcase::open_sub_window(cx);
                                            }),
                                    )
                                    .child(
                                        Button::new("lab-minimize")
                                            .variant(ButtonVariant::Outline)
                                            .label("Minimize")
                                            .on_click(|_, window, _| window.minimize_window()),
                                    )
                                    .child(
                                        Button::new("lab-zoom")
                                            .variant(ButtonVariant::Outline)
                                            .label("Zoom")
                                            .on_click(|_, window, _| window.zoom_window()),
                                    )
                                    .child(
                                        Button::new("lab-fullscreen")
                                            .variant(ButtonVariant::Outline)
                                            .label("Enter Full Screen")
                                            .on_click(|_, window, _| window.toggle_fullscreen()),
                                    )
                                    .child(
                                        Button::new("lab-close")
                                            .variant(ButtonVariant::Outline)
                                            .label("Close Window")
                                            .on_click(|_, window, _| window.remove_window()),
                                    ),
                            ),
                    ),
            )
    }
}
