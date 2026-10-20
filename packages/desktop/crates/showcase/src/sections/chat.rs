use celestia_ui::components::Card;
use celestia_ui::components::ai::agent::Agent;
use celestia_ui::components::ai::code_block::AiCodeBlock;
use celestia_ui::components::ai::conversation::{Conversation, ConversationEmpty};
use celestia_ui::components::ai::plan::{Plan, PlanStep, PlanStepStatus};
use celestia_ui::components::ai::prompt_input::{PromptInput, PromptStatus};
use celestia_ui::components::ai::reasoning::Reasoning;
use celestia_ui::components::ai::suggestion::{Suggestion, Suggestions};
use celestia_ui::components::ai::terminal::AiTerminal;
use celestia_ui::components::ai::thinking_text::{ThinkingShimmer, ThinkingText};
use celestia_ui::components::ai::tool::{Tool, ToolState};
use celestia_ui::components::composite::attachment::{
    Attachment, AttachmentContent, AttachmentDescription, AttachmentTitle,
};
use celestia_ui::components::composite::message::{
    Message, MessageAlignment, MessageContent, MessageGroup,
};
use celestia_ui::components::primitive::avatar::Avatar;
use celestia_ui::components::primitive::bubble::{Bubble, BubbleVariant};
use celestia_ui::components::primitive::shimmer::ShimmerText;
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::v_flex;

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_chat_demo(&self, demo: Demo, cx: &mut Context<Self>) -> AnyElement {
        let muted = cx.theme().muted_foreground;
        match demo {
            Demo::Message => Card::new()
                .title("Message")
                .description("Chat message group.")
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
                                            .child("Show me the chat primitives!"),
                                    ),
                                ),
                        ),
                )
                .into_any_element(),
            Demo::PromptInput => Card::new()
                .title("PromptInput")
                .description("AI prompt composer.")
                .child(
                    PromptInput::new("prompt")
                        .placeholder("Ask Celestia…")
                        .value("Add a confirmation card for tool approvals")
                        .status(PromptStatus::Ready),
                )
                .into_any_element(),
            Demo::Reasoning => Card::new()
                .title("Reasoning")
                .description("Thinking / reasoning block.")
                .child(
                    Reasoning::new("reason")
                        .open(true)
                        .streaming(true)
                        .body(
                            "Comparing MessageGroup spacing with the web ai/message.tsx metrics…",
                        ),
                )
                .into_any_element(),
            Demo::ThinkingText => Card::new()
                .title("ThinkingText")
                .description("Wave shimmer + cycling dots for in-flight AI status.")
                .child(
                    v_flex()
                        .gap_4()
                        .child(ThinkingText::new("think-1"))
                        .child(ThinkingText::new("think-2").label("Searching"))
                        .child(ThinkingText::new("think-3").label("Planning").show_icon(false))
                        .child(ThinkingShimmer::new("Generating a response…"))
                        .child(ShimmerText::wave("Travelling highlight across glyphs")),
                )
                .into_any_element(),
            Demo::Tool => Card::new()
                .title("Tool")
                .description("Tool-call card.")
                .child(
                    Tool::new("tool-read", "read_file")
                        .state(ToolState::Completed)
                        .child(
                            div()
                                .text_xs()
                                .text_color(muted)
                                .child(
                                    "packages/desktop/crates/ui/src/components/ai/mod.rs",
                                ),
                        ),
                )
                .into_any_element(),
            Demo::Suggestion => Card::new()
                .title("Suggestion")
                .description("Suggestion chips.")
                .child(
                    Suggestions::new("sugs")
                        .child(Suggestion::new("s1", "Explain this diff"))
                        .child(Suggestion::new("s2", "Write a unit test"))
                        .child(Suggestion::new("s3", "Summarize the PR")),
                )
                .into_any_element(),
            Demo::Plan => Card::new()
                .title("Plan")
                .description("Multi-step plan.")
                .child(
                    Plan::new("plan", "Ship AI gallery")
                        .description("Port twenty web AI surfaces to GPUI.")
                        .child(
                            PlanStep::new("p1", "Scaffold ai module")
                                .status(PlanStepStatus::Done),
                        )
                        .child(
                            PlanStep::new("p2", "Wire showcase demos")
                                .status(PlanStepStatus::Active),
                        )
                        .child(
                            PlanStep::new("p3", "Update docs").status(PlanStepStatus::Pending),
                        ),
                )
                .into_any_element(),
            Demo::Agent => Card::new()
                .title("Agent")
                .description("Agent card.")
                .child(
                    Agent::new("agent", "Celestia Desktop Agent")
                        .model("gpt-5.2")
                        .instructions(
                            "Prefer raw-gpui builders, theme tokens, and Phosphor icons.",
                        ),
                )
                .into_any_element(),
            Demo::AiCodeBlock => Card::new()
                .title("AiCodeBlock")
                .description("AI code block.")
                .child(
                    AiCodeBlock::new("code", "pub mod prompt_input;\npub mod reasoning;")
                        .language("rust"),
                )
                .into_any_element(),
            Demo::AiTerminal => Card::new()
                .title("AiTerminal")
                .description("AI terminal chrome.")
                .child(
                    AiTerminal::new("term")
                        .title("cargo check -p celestia-ui")
                        .output(
                            "Finished `dev` profile [unoptimized + debuginfo] target(s) in 12.4s",
                        ),
                )
                .into_any_element(),
            Demo::Conversation => Card::new()
                .title("Conversation")
                .description("Conversation shell.")
                .child(
                    Conversation::new("conv").child(
                        ConversationEmpty::new("empty")
                            .title("Start a new chat")
                            .description("Pick a suggestion above or type a prompt."),
                    ),
                )
                .into_any_element(),
            Demo::Attachment => Card::new()
                .title("Attachment")
                .description("File attachment chip.")
                .child(
                    Attachment::new().content(
                        AttachmentContent::new()
                            .title(AttachmentTitle::new("design-tokens-v2.json"))
                            .description(AttachmentDescription::new(
                                "JSON Configuration  •  14.2 KB",
                            )),
                    ),
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not a chat/AI demo."))
                .into_any_element(),
        }
    }
}
