use celestia_ui::components::swiftui::{
    GridItem, HStack, HorizontalAlignment, Spacer, VGrid, VStack, VerticalAlignment, ZAlignment,
    ZStack,
};
use celestia_ui::components::Card;
use gpui_kit::component::{ActiveTheme, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_swiftui(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let border_col = cx.theme().border;

        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("HStack & VStack with Spacers")
                    .description("SwiftUI-style flex layout primitives with alignment, spacing, and expanding Spacers.")
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
                    .title("ZStack Layering")
                    .description("Layered absolute z-index alignment without explicit absolute positioning.")
                    .child(
                        div()
                            .h(px(90.))
                            .w_full()
                            .rounded_md()
                            .border_1()
                            .border_color(border_col)
                            .child(
                                ZStack::new(ZAlignment::Center)
                                    .child(
                                        div()
                                            .size_full()
                                            .bg(gpui_kit::hsla(0., 0., 0.5, 0.05)),
                                    )
                                    .child(
                                        div()
                                            .p_3()
                                            .rounded_md()
                                            .bg(gpui_kit::hsla(0., 0., 0.5, 0.15))
                                            .text_sm()
                                            .child("Centered in ZStack"),
                                    ),
                            ),
                    ),
            )
            .child(
                Card::new()
                    .title("LazyVGrid with GridItems")
                    .description("Grid item chunking into multi-column responsive arrangements.")
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
            )
    }
}
