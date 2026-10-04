use celestia_ui::components::Card;
use celestia_ui::components::checkbox::Checkbox;
use celestia_ui::components::input::Input;
use celestia_ui::components::input_otp::OtpInput;
use celestia_ui::components::label::Label;
use celestia_ui::components::radio::Radio;
use celestia_ui::components::rating::Rating;
use celestia_ui::components::select::Select;
use celestia_ui::components::slider::Slider;
use celestia_ui::components::switch::Switch;
use celestia_ui::components::textarea::Textarea;
use gpui_kit::component::{h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_inputs(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Inputs & Selection")
            .description("input, textarea, otp_input, select, slider, switch, checkbox, radio, rating, label.")
            .child(
                v_flex()
                    .gap_4()
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(Label::new("Single-line Text Input"))
                            .child(Input::new(&self.demo_input).cleanable(true)),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(Label::new("Multi-line Textarea"))
                            .child(
                                div()
                                    .h_24()
                                    .child(Textarea::new(&self.demo_textarea)),
                            ),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(Label::new("One-Time Password (OTP)"))
                            .child(OtpInput::new(&self.demo_otp)),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(Label::new("Slider Range Control"))
                            .child(
                                div()
                                    .w_64()
                                    .child(Slider::new(&self.demo_slider)),
                            ),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(Label::new("Dropdown Select"))
                            .child(
                                div()
                                    .w_48()
                                    .flex_none()
                                    .child(Select::new(&self.demo_select)),
                            ),
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
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(Label::new("Star Rating"))
                            .child(Rating::new("rating-1").value(4)),
                    ),
            )
    }
}

