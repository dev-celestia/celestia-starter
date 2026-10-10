use celestia_ui::components::Card;
use celestia_ui::components::composite::menu::{ContextMenuExt as _, PopupMenuItem};
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use gpui::*;
use gpui_component::{ActiveTheme, h_flex, v_flex};

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_menus(&self, cx: &mut Context<Self>) -> impl IntoElement {
        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("Dropdown & Action Menus")
                    .description(
                        "Button-anchored popup menus with items, accelerators, and dividers.",
                    )
                    .child(
                        h_flex()
                            .gap_3()
                            .items_center()
                            .child(
                                Button::new("dd-file")
                                    .variant(ButtonVariant::Outline)
                                    .label("File Menu")
                                    .dropdown_caret(true)
                                    .dropdown_menu(|menu, _, _| {
                                        menu.item(
                                            PopupMenuItem::new("New File").on_click(|_, _, _| {}),
                                        )
                                        .item(PopupMenuItem::new("Open…").on_click(|_, _, _| {}))
                                        .separator()
                                        .item(PopupMenuItem::new("Save").on_click(|_, _, _| {}))
                                        .item(PopupMenuItem::new("Save As…").on_click(|_, _, _| {}))
                                    }),
                            )
                            .child(
                                Button::new("dd-edit")
                                    .variant(ButtonVariant::Outline)
                                    .label("Edit Menu")
                                    .dropdown_caret(true)
                                    .dropdown_menu(|menu, _, _| {
                                        menu.item(PopupMenuItem::new("Undo").on_click(|_, _, _| {}))
                                            .item(PopupMenuItem::new("Redo").on_click(|_, _, _| {}))
                                            .separator()
                                            .item(PopupMenuItem::new("Cut").on_click(|_, _, _| {}))
                                            .item(PopupMenuItem::new("Copy").on_click(|_, _, _| {}))
                                            .item(
                                                PopupMenuItem::new("Paste").on_click(|_, _, _| {}),
                                            )
                                    }),
                            ),
                    ),
            )
            .child(
                Card::new()
                    .title("Context Menu (Right Click)")
                    .description("Right-click mouse gesture trigger over custom surface zones.")
                    .child(
                        div()
                            .px_6()
                            .py_8()
                            .w_full()
                            .rounded(cx.theme().radius)
                            .border_1()
                            .border_dashed()
                            .border_color(cx.theme().border)
                            .text_sm()
                            .text_color(cx.theme().muted_foreground)
                            .flex()
                            .items_center()
                            .justify_center()
                            .child("Right-click anywhere in this zone to invoke context menu")
                            .context_menu(|menu, _, _| {
                                menu.item(
                                    PopupMenuItem::new("Inspect Element").on_click(|_, _, _| {}),
                                )
                                .item(PopupMenuItem::new("Copy Selector").on_click(|_, _, _| {}))
                                .separator()
                                .item(PopupMenuItem::new("Reload Frame").on_click(|_, _, _| {}))
                            }),
                    ),
            )
    }
}
