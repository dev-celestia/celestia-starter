use celestia_ui::components::Card;
use celestia_ui::components::composite::confirm_dialog::ConfirmDialog;
use celestia_ui::components::composite::drawer::{Drawer, DrawerSide};
use celestia_ui::components::composite::sheet_panel::{SheetPanel, SheetSide};
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::popover::Popover;
use celestia_ui::components::primitive::toast::{Notification, WindowExt};
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_overlay_demo(
        &self,
        demo: Demo,
        _window: &mut Window,
        _cx: &mut Context<Self>,
    ) -> AnyElement {
        match demo {
            Demo::Popover => Card::new()
                .title("Popover")
                .description("Anchored popover.")
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
                .into_any_element(),
            Demo::Tooltip => Card::new()
                .title("Tooltip")
                .description("Hover tooltip.")
                .child(
                    Button::new("tt-1")
                        .variant(ButtonVariant::Outline)
                        .label("Hover me")
                        .tooltip("A tooltip on a button"),
                )
                .into_any_element(),
            Demo::Toast => Card::new()
                .title("Toast")
                .description("Floating notification toast.")
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
                )
                .into_any_element(),
            Demo::Dialog => Card::new()
                .title("Dialog")
                .description("Modal dialog host — open via WindowExt::open_dialog.")
                .child(
                    Button::new("dlg-open")
                        .variant(ButtonVariant::Primary)
                        .label("Open dialog")
                        .on_click(|_, window, cx| {
                            window.open_dialog(cx, |dialog, _, _| {
                                dialog
                                    .title("Confirm action")
                                    .child(div().text_sm().child(
                                        "This uses the Root dialog layer via WindowExt.",
                                    ))
                            });
                        }),
                )
                .into_any_element(),
            Demo::Sheet => Card::new()
                .title("Sheet")
                .description("Sheet host layer — open via WindowExt::open_sheet.")
                .child(
                    Button::new("sheet-open")
                        .variant(ButtonVariant::Outline)
                        .label("Open sheet")
                        .on_click(|_, window, cx| {
                            window.open_sheet(cx, |sheet, _, _| {
                                sheet
                                    .size(px(360.))
                                    .title("Inspector")
                                    .child(div().p_3().text_sm().child("Live sheet overlay host."))
                            });
                        }),
                )
                .into_any_element(),
            Demo::SheetPanel => Card::new()
                .title("SheetPanel")
                .description("Presentational sheet chrome.")
                .child(
                    SheetPanel::new("sheet-right")
                        .side(SheetSide::Right)
                        .title("Inspector")
                        .description("Edit the selected element.")
                        .size(280.0)
                        .w(px(360.0))
                        .child(div().text_sm().child("Sheet body content goes here."))
                        .footer(
                            h_flex()
                                .gap_2()
                                .justify_end()
                                .child(
                                    Button::new("sheet-cancel")
                                        .variant(ButtonVariant::Ghost)
                                        .label("Cancel"),
                                )
                                .child(
                                    Button::new("sheet-save")
                                        .variant(ButtonVariant::Primary)
                                        .label("Save"),
                                ),
                        ),
                )
                .into_any_element(),
            Demo::Drawer => Card::new()
                .title("Drawer")
                .description("Bottom/side drawer chrome.")
                .child(
                    h_flex()
                        .gap_4()
                        .items_start()
                        .child(
                            Drawer::new("drawer-bottom")
                                .title("Share")
                                .description("Send this board to a teammate.")
                                .size(220.0)
                                .w(px(360.0))
                                .child(div().text_sm().child("Drawer body — actions, forms, lists."))
                                .footer(
                                    Button::new("drawer-send")
                                        .variant(ButtonVariant::Primary)
                                        .label("Send link"),
                                ),
                        )
                        .child(
                            Drawer::new("drawer-top")
                                .side(DrawerSide::Top)
                                .title("Notifications")
                                .show_handle(true)
                                .size(180.0)
                                .w(px(320.0))
                                .child(div().text_sm().child("Top-edge drawer variant.")),
                        ),
                )
                .into_any_element(),
            Demo::ConfirmDialog => Card::new()
                .title("ConfirmDialog")
                .description("Confirm / cancel dialog.")
                .child(
                    h_flex()
                        .gap_4()
                        .items_start()
                        .child(
                            ConfirmDialog::new("cd-default", "Discard draft?")
                                .body("Unsaved changes will be lost.")
                                .confirm_label("Discard")
                                .destructive(),
                        )
                        .child(
                            ConfirmDialog::new("cd-ok", "Publish release?")
                                .body("This tags main and opens a GitHub release.")
                                .confirm_label("Publish"),
                        ),
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not an overlays demo."))
                .into_any_element(),
        }
    }
}
