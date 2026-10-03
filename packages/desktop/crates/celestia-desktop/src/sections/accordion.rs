use celestia_ui::components::Card;
use celestia_ui::components::accordion::Accordion;
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_accordion(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Accordion")
            .description("accordion with toggleable items.")
            .child(
                Accordion::new("acc-1")
                    .item(|item| {
                        item.title("Getting started").child(
                            div()
                                .text_sm()
                                .child("Install the feature with pnpm add-feature <name>."),
                        )
                    })
                    .item(|item| {
                        item.title("Shortcuts")
                            .open(true)
                            .child(div().text_sm().child("⌘D toggles the theme."))
                    })
                    .item(|item| {
                        item.title("Disabled")
                            .disabled(true)
                            .child(div().text_sm().child("Cannot be opened."))
                    }),
            )
    }
}
