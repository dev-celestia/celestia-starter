use celestia_ui::components::Card;
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::link::Link;
use gpui_component::h_flex;
use gpui::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_buttons(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Buttons, Kbd & Links")
            .description("actions — button, kbd, link (menu surfaces under Menus & dialogs).")
            .child(
                h_flex()
                    .gap_2()
                    .flex_wrap()
                    .items_center()
                    .child(
                        Button::new("btn-primary")
                            .variant(ButtonVariant::Primary)
                            .label("Primary"),
                    )
                    .child(
                        Button::new("btn-outline")
                            .variant(ButtonVariant::Outline)
                            .label("Outline"),
                    )
                    .child(
                        Button::new("btn-ghost")
                            .variant(ButtonVariant::Ghost)
                            .label("Ghost"),
                    )
                    .child(
                        Button::new("btn-small")
                            .variant(ButtonVariant::Primary)
                            .size(ButtonSize::XSmall)
                            .label("Small primary"),
                    )
                    .child(Kbd::new(
                        Keystroke::parse("cmd-d").expect("valid keystroke"),
                    ))
                    .child(
                        Link::new("link-gpui")
                            .href("https://gpui.rs")
                            .child("gpui.rs"),
                    ),
            )
    }
}
