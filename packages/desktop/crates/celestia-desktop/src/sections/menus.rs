use celestia_ui::components::Card;
use celestia_ui::components::button::{Button, ButtonVariant};
use celestia_ui::components::menu::{ContextMenuExt as _, PopupMenuItem};
use celestia_ui::components::toast::WindowExt;
use gpui_kit::component::{ActiveTheme, h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_menus(&self, cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Menus, dialogs & sheets")
            .description(
                "dropdown_menu / context_menu / PopupMenuItem, Dialog and Sheet via \
                 WindowExt (layers mount in the Showcase root).",
            )
            .child(
                h_flex()
                    .gap_2()
                    .flex_wrap()
                    .items_center()
                    .child(
                        Button::new("dd-1")
                            .variant(ButtonVariant::Outline)
                            .label("Dropdown")
                            .dropdown_caret(true)
                            .dropdown_menu(|menu, _, _| {
                                menu.item(PopupMenuItem::new("Duplicate").on_click(|_, _, _| {}))
                                    .item(PopupMenuItem::new("Rename").on_click(|_, _, _| {}))
                                    .separator()
                                    .item(PopupMenuItem::new("Delete").on_click(|_, _, _| {}))
                            }),
                    )
                    .child(
                        Button::new("dlg-1")
                            .variant(ButtonVariant::Outline)
                            .label("Open dialog")
                            .on_click(|_, window, cx| {
                                window.open_dialog(cx, |dialog, _, _| {
                                    dialog.title("Confirm export").overlay_closable(true).child(
                                        v_flex()
                                            .gap_3()
                                            .p_4()
                                            .child(
                                                div()
                                                    .text_sm()
                                                    .child("Export the gallery as JSON?"),
                                            )
                                            .child(
                                                Button::new("dlg-confirm")
                                                    .variant(ButtonVariant::Primary)
                                                    .label("Export")
                                                    .on_click(|_, window, cx| {
                                                        window.close_dialog(cx)
                                                    }),
                                            ),
                                    )
                                });
                            }),
                    )
                    .child(
                        Button::new("sh-1")
                            .variant(ButtonVariant::Outline)
                            .label("Open sheet")
                            .on_click(|_, window, cx| {
                                window.open_sheet(cx, |sheet, _, _| {
                                    sheet
                                        .title("Drawer")
                                        .size(px(320.))
                                        .overlay_closable(true)
                                        .child(v_flex().gap_2().p_4().child(
                                            div().text_sm().child("A Sheet is the desktop drawer."),
                                        ))
                                });
                            }),
                    )
                    .child(
                        div()
                            .px_4()
                            .py_3()
                            .rounded(cx.theme().radius)
                            .border_1()
                            .border_dashed()
                            .border_color(cx.theme().border)
                            .text_sm()
                            .text_color(cx.theme().muted_foreground)
                            .child("Right-click for a context menu")
                            .context_menu(|menu, _, _| {
                                menu.item(PopupMenuItem::new("Cut").on_click(|_, _, _| {}))
                                    .item(PopupMenuItem::new("Copy").on_click(|_, _, _| {}))
                                    .separator()
                                    .item(PopupMenuItem::new("Paste").on_click(|_, _, _| {}))
                            }),
                    ),
            )
    }
}
