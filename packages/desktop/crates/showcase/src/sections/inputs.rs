use celestia_ui::components::Card;
use celestia_ui::components::primitive::checkbox::Checkbox;
use celestia_ui::components::primitive::input::Input;
use celestia_ui::components::primitive::input_otp::OtpInput;
use celestia_ui::components::primitive::label::Label;
use celestia_ui::components::primitive::radio::Radio;
use celestia_ui::components::primitive::rating::Rating;
use celestia_ui::components::primitive::select::Select;
use celestia_ui::components::primitive::slider::Slider;
use celestia_ui::components::primitive::switch::Switch;
use celestia_ui::components::primitive::textarea::Textarea;
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_inputs(&self, cx: &mut Context<Self>) -> impl IntoElement {
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
                            .child(
                                Switch::new("sw-1")
                                    .checked(self.demo_switch)
                                    .label("Notifications")
                                    .on_click(cx.listener(|this, &checked, _, cx| {
                                        this.demo_switch = checked;
                                        cx.notify();
                                    })),
                            )
                            .child(
                                Checkbox::new("cb-1")
                                    .checked(self.demo_checkbox)
                                    .label("Include archived")
                                    .on_click(cx.listener(|this, &checked, _, cx| {
                                        this.demo_checkbox = checked;
                                        cx.notify();
                                    })),
                            )
                            .child(
                                Radio::new("rd-1")
                                    .checked(self.demo_radio == 0)
                                    .label("Weekly")
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.demo_radio = 0;
                                        cx.notify();
                                    })),
                            )
                            .child(
                                Radio::new("rd-2")
                                    .checked(self.demo_radio == 1)
                                    .label("Daily")
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.demo_radio = 1;
                                        cx.notify();
                                    })),
                            ),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(Label::new("Star Rating"))
                            .child(
                                Rating::new("rating-1")
                                    .value(self.demo_rating)
                                    .on_click(cx.listener(|this, &val, _, cx| {
                                        this.demo_rating = val;
                                        cx.notify();
                                    })),
                            ),
                    ),
            )
    }
}
