use celestia_ui::components::accordion::Accordion;
use celestia_ui::components::collapsible::Collapsible;
use celestia_ui::components::group_box::GroupBox;
use celestia_ui::components::separator::Separator;
use celestia_ui::components::status_bar::StatusBar;
use celestia_ui::components::tabs::{Tab, TabBar};
use celestia_ui::components::Card;
use gpui_kit::component::{h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_layout(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("Tabs & Separators")
                    .description("Tab bars with selection states and content separators.")
                    .child(
                        v_flex()
                            .gap_3()
                            .child(
                                TabBar::new("tabs-layout")
                                    .child(Tab::new().label("Overview"))
                                    .child(Tab::new().label("Configuration"))
                                    .child(Tab::new().label("Security"))
                                    .selected_index(0),
                            )
                            .child(Separator::horizontal()),
                    ),
            )
            .child(
                Card::new()
                    .title("Accordion & Collapsible")
                    .description("Expandable accordion sections and animated collapsible disclosure panels.")
                    .child(
                        v_flex()
                            .gap_4()
                            .child(
                                Accordion::new("acc-demo")
                                    .item(|item| {
                                        item.title("What is Celestia Desktop?")
                                            .open(true)
                                            .child(div().text_sm().child("It is a high-performance native desktop UI library built on GPUI."))
                                    })
                                    .item(|item| {
                                        item.title("Does it use Chromium or WebViews?")
                                            .child(div().text_sm().child("No! It is fully GPU-rendered without any webview overhead."))
                                    }),
                            )
                            .child(
                                Collapsible::new()
                                    .open(true)
                                    .content(
                                        div()
                                            .p_3()
                                            .rounded_md()
                                            .bg(gpui_kit::hsla(0., 0., 0.5, 0.1))
                                            .text_sm()
                                            .child("Collapsible panel revealed with smooth layout transitions."),
                                    ),
                            ),
                    ),
            )
            .child(
                Card::new()
                    .title("Group Box & Status Bar")
                    .description("Surrounding content groups and window footer status bars.")
                    .child(
                        v_flex()
                            .gap_4()
                            .child(
                                GroupBox::new()
                                    .child(
                                        h_flex()
                                            .p_3()
                                            .gap_4()
                                            .child(div().text_sm().child("Grouped content section inside a unified bordered box.")),
                                    ),
                            )
                            .child(
                                StatusBar::new()
                                    .left("Git: main* (clean)")
                                    .right("UTF-8  •  LF  •  Rust"),
                            ),
                    ),
            )
    }
}
