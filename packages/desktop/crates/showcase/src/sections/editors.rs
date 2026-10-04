use celestia_ui::components::Card;
use gpui_component::v_flex;
use gpui::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_editors(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("Text editor")
                    .description(
                        "Markdown toolbar over an auto-growing textarea — bold, italic, \
                     strike, code, link, heading, list, quote.",
                    )
                    .child(self.demo_editor.clone()),
            )
            .child(
                Card::new()
                    .title("Code editor")
                    .description(
                        "tree-sitter highlighted code mode (Monaco's desktop analog) — \
                     try rust / markdown via CodeEditor::new.",
                    )
                    .child(self.demo_code.clone()),
            )
    }
}
