use celestia_ui::components::Card;
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::popover::Popover;
use celestia_ui::components::primitive::toast::{Notification, WindowExt};
use gpui::*;
use gpui_component::h_flex;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_overlays(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Overlays")
            .description("popover, tooltip, toast (notification).")
            .child(
                h_flex()
                    .gap_2()
                    .flex_wrap()
                    .child(
                        Popover::new("pop-1")
                            .trigger(
                                Button::new("pop-trigger")
                                    .variant(ButtonVariant::Outline)
                                    .label("Popover"),
                            )
                            .content(|_, _, _| {
                                div()
                                    .p_3()
                                    .text_sm()
                                    .child("Renders above everything in the Root layer.")
                            }),
                    )
                    .child(
                        Button::new("tt-1")
                            .variant(ButtonVariant::Outline)
                            .label("Hover me")
                            .tooltip("A tooltip on a button"),
                    )
                    .child(
                        Button::new("toast-1")
                            .variant(ButtonVariant::Primary)
                            .label("Push a toast")
                            .on_click(|_, window, cx| {
                                window.push_notification(
                                    Notification::success("Saved to Celestia."),
                                    cx,
                                );
                            }),
                    ),
            )
    }
}
