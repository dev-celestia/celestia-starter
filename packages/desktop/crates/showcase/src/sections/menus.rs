use celestia_ui::components::Card;
use celestia_ui::components::composite::menu::{ContextMenuExt as _, PopupMenuItem};
use celestia_ui::components::composite::toolbar_menu::{
    ToolbarMenu, ToolbarMenuAppearance, ToolbarMenuItem,
};
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::icon::PhosphorIcon;
use celestia_ui::components::primitive::menubar::{Menubar, MenubarMenu};
use celestia_ui::components::primitive::navigation_menu::{NavigationMenu, NavigationMenuItem};
use celestia_ui::components::primitive::toast::{Notification, WindowExt as _};
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::catalog::Demo;
use crate::showcase::Showcase;

fn toast(label: &'static str) -> impl Fn(&ClickEvent, &mut Window, &mut App) + 'static {
    move |_, window, cx| {
        window.push_notification(Notification::success(label), cx);
    }
}

fn demo_caption(cx: &App, text: &'static str) -> Div {
    div()
        .text_xs()
        .text_color(cx.theme().muted_foreground)
        .child(text)
}

impl Showcase {
    pub(crate) fn render_menu_demo(&self, demo: Demo, cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::DropdownMenu => Card::new()
                .title("DropdownMenu")
                .description("Button dropdown PopupMenu.")
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
                                        .item(PopupMenuItem::new("Paste").on_click(|_, _, _| {}))
                                }),
                        ),
                )
                .into_any_element(),
            Demo::ToolbarMenu => Card::new()
                .title("ToolbarMenu")
                .description("Icon/text toolbar strip.")
                .child(
                    v_flex()
                        .gap_5()
                        .child(
                            v_flex()
                                .gap_1p5()
                                .child(demo_caption(cx, "Horizontal · with icon"))
                                .child(
                                    ToolbarMenu::new("tm-h-icon")
                                        .icon_only()
                                        .horizontal()
                                        .item(
                                            ToolbarMenuItem::new(
                                                "h-i-refresh",
                                                PhosphorIcon::ArrowClockwise,
                                            )
                                            .label("Refresh")
                                            .on_click(toast("Refresh")),
                                        )
                                        .item(
                                            ToolbarMenuItem::new(
                                                "h-i-filter",
                                                PhosphorIcon::Funnel,
                                            )
                                            .label("Filter")
                                            .on_click(toast("Filter")),
                                        )
                                        .separator()
                                        .item(
                                            ToolbarMenuItem::new(
                                                "h-i-export",
                                                PhosphorIcon::Export,
                                            )
                                            .label("Export")
                                            .on_click(toast("Export")),
                                        ),
                                ),
                        )
                        .child(
                            v_flex()
                                .gap_1p5()
                                .child(demo_caption(cx, "Horizontal · icon + label"))
                                .child(
                                    ToolbarMenu::new("tm-h-both")
                                        .appearance(ToolbarMenuAppearance::Labeled)
                                        .horizontal()
                                        .item(
                                            ToolbarMenuItem::new(
                                                "h-b-paste",
                                                PhosphorIcon::ClipboardText,
                                            )
                                            .label("Paste")
                                            .on_click(toast("Paste")),
                                        )
                                        .item(
                                            ToolbarMenuItem::new("h-b-cut", PhosphorIcon::Scissors)
                                                .label("Cut")
                                                .on_click(toast("Cut")),
                                        )
                                        .item(
                                            ToolbarMenuItem::new("h-b-copy", PhosphorIcon::Copy)
                                                .label("Copy")
                                                .on_click(toast("Copy")),
                                        ),
                                ),
                        )
                        .child(
                            v_flex()
                                .gap_1p5()
                                .child(demo_caption(cx, "Vertical · with icon"))
                                .child(
                                    ToolbarMenu::new("tm-v-icon")
                                        .icon_only()
                                        .vertical()
                                        .item(
                                            ToolbarMenuItem::new(
                                                "v-i-search",
                                                PhosphorIcon::MagnifyingGlass,
                                            )
                                            .label("Search")
                                            .on_click(toast("Search")),
                                        )
                                        .item(
                                            ToolbarMenuItem::new(
                                                "v-i-filter",
                                                PhosphorIcon::Funnel,
                                            )
                                            .label("Filter")
                                            .on_click(toast("Filter")),
                                        )
                                        .separator()
                                        .item(
                                            ToolbarMenuItem::new("v-i-gear", PhosphorIcon::Gear)
                                                .label("Settings")
                                                .on_click(toast("Settings")),
                                        ),
                                ),
                        ),
                )
                .into_any_element(),
            Demo::Menubar => Card::new()
                .title("Menubar")
                .description("Top-of-window menu strip.")
                .child(
                    Menubar::new("demo-menubar")
                        .menu(MenubarMenu::new("mb-file", "File", |menu, _, _| {
                            menu.item(PopupMenuItem::new("New").on_click(|_, _, _| {}))
                                .item(PopupMenuItem::new("Open…").on_click(|_, _, _| {}))
                                .separator()
                                .item(PopupMenuItem::new("Quit").on_click(|_, _, _| {}))
                        }))
                        .menu(MenubarMenu::new("mb-edit", "Edit", |menu, _, _| {
                            menu.item(PopupMenuItem::new("Undo").on_click(|_, _, _| {}))
                                .item(PopupMenuItem::new("Redo").on_click(|_, _, _| {}))
                        }))
                        .menu(MenubarMenu::new("mb-view", "View", |menu, _, _| {
                            menu.item(
                                PopupMenuItem::new("Toggle Sidebar").on_click(|_, _, _| {}),
                            )
                            .item(PopupMenuItem::new("Command Palette").on_click(|_, _, _| {}))
                        })),
                )
                .into_any_element(),
            Demo::NavigationMenu => Card::new()
                .title("NavigationMenu")
                .description("Horizontal nav with flyouts.")
                .child(
                    NavigationMenu::new("demo-nav")
                        .item(NavigationMenuItem::link("nav-home", "Home").active(true))
                        .item(NavigationMenuItem::flyout(
                            "nav-product",
                            "Product",
                            |menu, _, _| {
                                menu.item(PopupMenuItem::new("Features").on_click(|_, _, _| {}))
                                    .item(PopupMenuItem::new("Pricing").on_click(|_, _, _| {}))
                                    .item(PopupMenuItem::new("Changelog").on_click(|_, _, _| {}))
                            },
                        ))
                        .item(NavigationMenuItem::link("nav-docs", "Docs"))
                        .item(NavigationMenuItem::flyout(
                            "nav-company",
                            "Company",
                            |menu, _, _| {
                                menu.item(PopupMenuItem::new("About").on_click(|_, _, _| {}))
                                    .item(PopupMenuItem::new("Careers").on_click(|_, _, _| {}))
                            },
                        )),
                )
                .into_any_element(),
            Demo::ContextMenu => Card::new()
                .title("ContextMenu")
                .description("Right-click context menu.")
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
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not a menus demo."))
                .into_any_element(),
        }
    }
}
