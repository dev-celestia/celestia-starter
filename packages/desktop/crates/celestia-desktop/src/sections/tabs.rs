use celestia_ui::components::Card;
use celestia_ui::components::separator::Separator;
use celestia_ui::components::tabs::{Tab, TabBar};
use gpui_kit::component::v_flex;
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_tabs(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Tabs")
            .description("tab bar + tabs, separator.")
            .child(
                v_flex()
                    .gap_3()
                    .child(
                        TabBar::new("tabs-1")
                            .child(Tab::new().label("Overview"))
                            .child(Tab::new().label("Specs"))
                            .child(Tab::new().label("Reviews"))
                            .selected_index(0),
                    )
                    .child(Separator::horizontal()),
            )
    }
}
