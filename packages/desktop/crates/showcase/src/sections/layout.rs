use celestia_ui::components::Card;
use celestia_ui::components::accordion::Accordion;
use celestia_ui::components::collapsible::Collapsible;
use celestia_ui::components::group_box::GroupBox;
use celestia_ui::components::separator::Separator;
use celestia_ui::components::status_bar::StatusBar;
use celestia_ui::components::tabs::{TabsList, TabsTrigger, TabsVariant};
use gpui_kit::component::{ActiveTheme, h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_layout(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        let muted = _cx.theme().muted_foreground;
        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("Tabs & Separators")
                    .description("Shadcn-styled tab lists (segmented pill and line underline variants) with separators.")
                    .child(
                        v_flex()
                            .gap_4()
                            .child(
                                v_flex()
                                    .gap_1p5()
                                    .child(
                                        div()
                                            .text_xs()
                                            .text_color(muted)
                                            .child("Segmented Track (Default):"),
                                    )
                                    .child(
                                        TabsList::new("tabs-demo-default")
                                            .child(TabsTrigger::new("t-overview").label("Overview").selected(true))
                                            .child(TabsTrigger::new("t-config").label("Configuration"))
                                            .child(TabsTrigger::new("t-security").label("Security")),
                                    ),
                            )
                            .child(Separator::horizontal())
                            .child(
                                v_flex()
                                    .gap_1p5()
                                    .child(
                                        div()
                                            .text_xs()
                                            .text_color(muted)
                                            .child("Line Underline Track:"),
                                    )
                                    .child(
                                        TabsList::new("tabs-demo-line")
                                            .variant(TabsVariant::Line)
                                            .child(TabsTrigger::new("tl-overview").label("Overview").selected(true).variant(TabsVariant::Line))
                                            .child(TabsTrigger::new("tl-config").label("Configuration").variant(TabsVariant::Line))
                                            .child(TabsTrigger::new("tl-security").label("Security").variant(TabsVariant::Line)),
                                    ),
                            ),
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
