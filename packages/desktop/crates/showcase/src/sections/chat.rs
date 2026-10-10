use celestia_ui::components::Card;
use celestia_ui::components::composite::attachment::{
    Attachment, AttachmentContent, AttachmentDescription, AttachmentTitle,
};
use celestia_ui::components::composite::message::{
    Message, MessageAlignment, MessageContent, MessageGroup,
};
use celestia_ui::components::primitive::avatar::Avatar;
use celestia_ui::components::primitive::bubble::{Bubble, BubbleVariant};
use gpui::*;
use gpui_component::v_flex;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_chat(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("Chat Messages & Threads")
                    .description("Threaded messages with sender avatars, aligned bubbles, and reaction support.")
                    .child(
                        MessageGroup::new()
                            .child(
                                Message::new()
                                    .alignment(MessageAlignment::Start)
                                    .avatar(Avatar::new().src("avatars/celestia-ai.png").name("Celestia AI"))
                                    .content(
                                        MessageContent::new().bubble(
                                            Bubble::new()
                                                .with_variant(BubbleVariant::Filled)
                                                .child("Hello! How can I help you build with Celestia desktop today?"),
                                        ),
                                    ),
                            )
                            .child(
                                Message::new()
                                    .alignment(MessageAlignment::End)
                                    .avatar(Avatar::new().src("avatars/demo-user.jpg").name("Alex Rivera"))
                                    .content(
                                        MessageContent::new().bubble(
                                            Bubble::new()
                                                .with_variant(BubbleVariant::Secondary)
                                                .child("Show me the chat and AI primitive components!"),
                                        ),
                                    ),
                            )
                            .child(
                                Message::new()
                                    .alignment(MessageAlignment::Start)
                                    .avatar(Avatar::new().src("avatars/celestia-ai.png").name("Celestia AI"))
                                    .content(
                                        MessageContent::new().bubble(
                                            Bubble::new()
                                                .with_variant(BubbleVariant::Filled)
                                                .child("Here they are: messages, bubbles, avatars, and file attachments below."),
                                        ),
                                    ),
                            ),
                    ),
            )
            .child(
                Card::new()
                    .title("File Attachments")
                    .description("Rich media cards representing files, code snippets, and assets in chat.")
                    .child(
                        Attachment::new().content(
                            AttachmentContent::new()
                                .title(AttachmentTitle::new("design-tokens-v2.json"))
                                .description(AttachmentDescription::new("JSON Configuration  •  14.2 KB")),
                        ),
                    ),
            )
    }
}
