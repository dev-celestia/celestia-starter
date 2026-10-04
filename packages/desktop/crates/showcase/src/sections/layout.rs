use celestia_ui::components::Card;
use celestia_ui::components::composite::group_box::GroupBox;
use celestia_ui::components::composite::status_bar::StatusBar;
use celestia_ui::components::composite::swiftui::{
    GridItem, HStack, HorizontalAlignment, Spacer, VGrid, VStack, VerticalAlignment, ZAlignment,
    ZStack,
};
use celestia_ui::components::primitive::accordion::Accordion;
use celestia_ui::components::primitive::collapsible::Collapsible;
use celestia_ui::components::primitive::separator::Separator;
use celestia_ui::components::primitive::tabs::{
    Tabs, TabsContent, TabsList, TabsTrigger, TabsVariant,
};
use gpui_component::{ActiveTheme, h_flex, v_flex};
use gpui::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_layout(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let border_col = cx.theme().border;

        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("HStack & VStack with Spacers")
                    .description("Flex layout primitives with alignment, spacing, and expanding Spacers.")
                    .child(
                        VStack::new(HorizontalAlignment::Leading)
                            .spacing(px(12.))
                            .child(
                                HStack::new(VerticalAlignment::Center)
                                    .spacing(px(8.))
                                    .child(
                                        div()
                                            .p_2()
                                            .rounded_md()
                                            .border_1()
                                            .border_color(border_col)
                                            .child("Leading Item"),
                                    )
                                    .child(Spacer::new())
                                    .child(
                                        div()
                                            .p_2()
                                            .rounded_md()
                                            .border_1()
                                            .border_color(border_col)
                                            .child("Trailing Item"),
                                    ),
                            )
                            .child(
                                HStack::new(VerticalAlignment::Center)
                                    .spacing(px(8.))
                                    .child(div().p_2().child("Aligned Row: [1]"))
                                    .child(div().p_2().child("[2]"))
                                    .child(div().p_2().child("[3]")),
                            ),
                    ),
            )
            .child(
                Card::new()
                    .title("ZStack Layering & VGrid")
                    .description("Layered depth alignment and multi-column responsive grid arrangements.")
                    .child(
                        v_flex()
                            .gap_4()
                            .child(
                                div()
                                    .h(px(80.))
                                    .w_full()
                                    .rounded_md()
                                    .border_1()
                                    .border_color(border_col)
                                    .child(
                                        ZStack::new(ZAlignment::Center)
                                            .child(
                                                div()
                                                    .size_full()
                                                    .bg(gpui::hsla(0., 0., 0.5, 0.05)),
                                            )
                                            .child(
                                                div()
                                                    .p_3()
                                                    .rounded_md()
                                                    .bg(gpui::hsla(0., 0., 0.5, 0.15))
                                                    .text_sm()
                                                    .child("Centered in ZStack"),
                                            ),
                                    ),
                            )
                            .child(
                                VGrid::new([GridItem::Flexible, GridItem::Flexible, GridItem::Flexible])
                                    .spacing(px(8.))
                                    .child(
                                        div()
                                            .p_3()
                                            .rounded_md()
                                            .border_1()
                                            .border_color(border_col)
                                            .child("Grid Col 1"),
                                    )
                                    .child(
                                        div()
                                            .p_3()
                                            .rounded_md()
                                            .border_1()
                                            .border_color(border_col)
                                            .child("Grid Col 2"),
                                    )
                                    .child(
                                        div()
                                            .p_3()
                                            .rounded_md()
                                            .border_1()
                                            .border_color(border_col)
                                            .child("Grid Col 3"),
                                    ),
                            ),
                    ),
            )
            .child(
                Card::new()
                    .title("Tabs & Separators")
                    .description("Shadcn-styled tab lists (segmented pill and line underline variants) with interactive selection and content panels.")
                    .child(
                        v_flex()
                            .gap_4()
                            .child(
                                v_flex()
                                    .gap_2()
                                    .child(
                                        div()
                                            .text_xs()
                                            .font_weight(FontWeight::MEDIUM)
                                            .text_color(muted)
                                            .child("Segmented Track (Default):"),
                                    )
                                    .child(
                                        Tabs::new("tabs-segmented")
                                            .child(
                                                TabsList::new("tabs-demo-default")
                                                    .child(
                                                        TabsTrigger::new("t-overview")
                                                            .label("Overview")
                                                            .selected(self.demo_tab_segmented == 0)
                                                            .on_click(cx.listener(|this, _, _, cx| {
                                                                this.demo_tab_segmented = 0;
                                                                cx.notify();
                                                            })),
                                                    )
                                                    .child(
                                                        TabsTrigger::new("t-config")
                                                            .label("Configuration")
                                                            .selected(self.demo_tab_segmented == 1)
                                                            .on_click(cx.listener(|this, _, _, cx| {
                                                                this.demo_tab_segmented = 1;
                                                                cx.notify();
                                                            })),
                                                    )
                                                    .child(
                                                        TabsTrigger::new("t-security")
                                                            .label("Security")
                                                            .selected(self.demo_tab_segmented == 2)
                                                            .on_click(cx.listener(|this, _, _, cx| {
                                                                this.demo_tab_segmented = 2;
                                                                cx.notify();
                                                            })),
                                                    ),
                                            )
                                            .child(match self.demo_tab_segmented {
                                                0 => TabsContent::new("tc-overview").child(
                                                    div()
                                                        .p_3()
                                                        .rounded_md()
                                                        .bg(cx.theme().tokens.tab_bar)
                                                        .border_1()
                                                        .border_color(border_col)
                                                        .child(
                                                            v_flex()
                                                                .gap_1()
                                                                .child(
                                                                    div()
                                                                        .text_sm()
                                                                        .font_weight(FontWeight::MEDIUM)
                                                                        .text_color(cx.theme().foreground)
                                                                        .child("Overview Dashboard"),
                                                                )
                                                                .child(
                                                                    div()
                                                                        .text_xs()
                                                                        .text_color(muted)
                                                                        .child("Central project metrics, recent deployments, and operational telemetry."),
                                                                ),
                                                        ),
                                                ),
                                                1 => TabsContent::new("tc-config").child(
                                                    div()
                                                        .p_3()
                                                        .rounded_md()
                                                        .bg(cx.theme().tokens.tab_bar)
                                                        .border_1()
                                                        .border_color(border_col)
                                                        .child(
                                                            v_flex()
                                                                .gap_1()
                                                                .child(
                                                                    div()
                                                                        .text_sm()
                                                                        .font_weight(FontWeight::MEDIUM)
                                                                        .text_color(cx.theme().foreground)
                                                                        .child("Configuration Settings"),
                                                                )
                                                                .child(
                                                                    div()
                                                                        .text_xs()
                                                                        .text_color(muted)
                                                                        .child("Configure build targets, environment parameters, and runtime optimization profiles."),
                                                                ),
                                                        ),
                                                ),
                                                _ => TabsContent::new("tc-security").child(
                                                    div()
                                                        .p_3()
                                                        .rounded_md()
                                                        .bg(cx.theme().tokens.tab_bar)
                                                        .border_1()
                                                        .border_color(border_col)
                                                        .child(
                                                            v_flex()
                                                                .gap_1()
                                                                .child(
                                                                    div()
                                                                        .text_sm()
                                                                        .font_weight(FontWeight::MEDIUM)
                                                                        .text_color(cx.theme().foreground)
                                                                        .child("Security & Access Control"),
                                                                )
                                                                .child(
                                                                    div()
                                                                        .text_xs()
                                                                        .text_color(muted)
                                                                        .child("Review cryptographic keys, audit logging events, and fine-grained permissions."),
                                                                ),
                                                        ),
                                                ),
                                            }),
                                    ),
                            )
                            .child(Separator::horizontal())
                            .child(
                                v_flex()
                                    .gap_2()
                                    .child(
                                        div()
                                            .text_xs()
                                            .font_weight(FontWeight::MEDIUM)
                                            .text_color(muted)
                                            .child("Line Underline Track:"),
                                    )
                                    .child(
                                        Tabs::new("tabs-line")
                                            .child(
                                                TabsList::new("tabs-demo-line")
                                                    .variant(TabsVariant::Line)
                                                    .child(
                                                        TabsTrigger::new("tl-overview")
                                                            .label("Overview")
                                                            .variant(TabsVariant::Line)
                                                            .selected(self.demo_tab_line == 0)
                                                            .on_click(cx.listener(|this, _, _, cx| {
                                                                this.demo_tab_line = 0;
                                                                cx.notify();
                                                            })),
                                                    )
                                                    .child(
                                                        TabsTrigger::new("tl-config")
                                                            .label("Configuration")
                                                            .variant(TabsVariant::Line)
                                                            .selected(self.demo_tab_line == 1)
                                                            .on_click(cx.listener(|this, _, _, cx| {
                                                                this.demo_tab_line = 1;
                                                                cx.notify();
                                                            })),
                                                    )
                                                    .child(
                                                        TabsTrigger::new("tl-security")
                                                            .label("Security")
                                                            .variant(TabsVariant::Line)
                                                            .selected(self.demo_tab_line == 2)
                                                            .on_click(cx.listener(|this, _, _, cx| {
                                                                this.demo_tab_line = 2;
                                                                cx.notify();
                                                            })),
                                                    ),
                                            )
                                            .child(match self.demo_tab_line {
                                                0 => TabsContent::new("tlc-overview").child(
                                                    div()
                                                        .py_2()
                                                        .text_xs()
                                                        .text_color(muted)
                                                        .child("Active Line Tab: Overview telemetry and performance gauges."),
                                                ),
                                                1 => TabsContent::new("tlc-config").child(
                                                    div()
                                                        .py_2()
                                                        .text_xs()
                                                        .text_color(muted)
                                                        .child("Active Line Tab: Service configuration and infrastructure parameters."),
                                                ),
                                                _ => TabsContent::new("tlc-security").child(
                                                    div()
                                                        .py_2()
                                                        .text_xs()
                                                        .text_color(muted)
                                                        .child("Active Line Tab: Encryption keys, access certificates, and auth rules."),
                                                ),
                                            }),
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
                                            .bg(gpui::hsla(0., 0., 0.5, 0.1))
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
