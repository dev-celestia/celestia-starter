use celestia_ui::components::Card;
use celestia_ui::components::checkbox::Checkbox;
use celestia_ui::components::input::Input;
use celestia_ui::components::radio::Radio;
use celestia_ui::components::rating::Rating;
use celestia_ui::components::select::Select;
use celestia_ui::components::switch::Switch;
use gpui_kit::component::{h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_inputs(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Inputs & Selection")
            .description("input, select, switch, checkbox, radio, rating.")
            .child(
                v_flex()
                    .gap_3()
                    .child(
                        div()
                            .w_full()
                            .min_w_0()
                            .child(Input::new(&self.demo_input).cleanable(true)),
                    )
                    .child(
                        div()
                            .w_48()
                            .flex_none()
                            .child(Select::new(&self.demo_select)),
                    )
                    .child(
                        h_flex()
                            .gap_4()
                            .flex_wrap()
                            .child(Switch::new("sw-1").checked(true).label("Notifications"))
                            .child(
                                Checkbox::new("cb-1")
                                    .checked(true)
                                    .label("Include archived"),
                            )
                            .child(Radio::new("rd-1").checked(true).label("Weekly"))
                            .child(Radio::new("rd-2").checked(false).label("Daily")),
                    )
                    .child(Rating::new("rating-1").value(3)),
            )
    }
}
