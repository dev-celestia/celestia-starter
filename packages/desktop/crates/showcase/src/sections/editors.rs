use celestia_ui::components::Card;
use gpui::*;
use gpui_component::v_flex;

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_editor_demo(&self, demo: Demo, _cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::TextEditor => Card::new()
                .title("TextEditor")
                .description(
                    "Markdown toolbar over an auto-growing textarea — bold, italic, \
                     strike, code, link, heading, list, quote.",
                )
                .child(self.demo_editor.clone())
                .into_any_element(),
            Demo::CodeEditor => Card::new()
                .title("CodeEditor")
                .description(
                    "tree-sitter highlighted code mode (Monaco's desktop analog) — \
                     try rust / markdown via CodeEditor::new.",
                )
                .child(self.demo_code.clone())
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not an editors demo."))
                .into_any_element(),
        }
    }
}
