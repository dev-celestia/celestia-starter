//! Message — the chat-row demo.
//!
//! The only survivor of the old "Chat & AI" section: a message row is a content
//! surface, not an AI widget, so it is filed under Composites and documented on
//! its own family (`Family::Message`).

use celestia_ui::components::Card;
use celestia_ui::components::composite::message::{
    Message, MessageAlignment, MessageContent, MessageGroup,
};
use celestia_ui::components::primitive::avatar::Avatar;
use celestia_ui::components::primitive::bubble::{Bubble, BubbleVariant};
use gpui::*;
use gpui_component::v_flex;

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_message_demo(&self, demo: Demo, _cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::Message => Card::new()
                .title("Message")
                .description("Chat message row — avatar, bubble, header and footer.")
                .child(
                    MessageGroup::new()
                        .child(
                            Message::new()
                                .alignment(MessageAlignment::Start)
                                .avatar(
                                    Avatar::new()
                                        .src("avatars/celestia-ai.png")
                                        .name("Celestia AI"),
                                )
                                .content(
                                    MessageContent::new().bubble(
                                        Bubble::new()
                                            .with_variant(BubbleVariant::Filled)
                                            .child(
                                                "Hello! How can I help you build with Celestia desktop today?",
                                            ),
                                    ),
                                ),
                        )
                        .child(
                            Message::new()
                                .alignment(MessageAlignment::End)
                                .avatar(
                                    Avatar::new()
                                        .src("avatars/demo-user.jpg")
                                        .name("Alex Rivera"),
                                )
                                .content(
                                    MessageContent::new().bubble(
                                        Bubble::new()
                                            .with_variant(BubbleVariant::Secondary)
                                            .child("Show me the message primitives!"),
                                    ),
                                ),
                        ),
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not a message demo."))
                .into_any_element(),
        }
    }
}
