use celestia_ui::components::calendar::Calendar;
use celestia_ui::components::color_picker::ColorPicker;
use celestia_ui::components::date_picker::DatePicker;
use celestia_ui::components::input::NumberInput;
use celestia_ui::components::label::Label;
use celestia_ui::components::Card;
use gpui_kit::component::{h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_pickers(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("Calendar")
                    .description("Full month grid calendar view with date selection.")
                    .child(Calendar::new(&self.demo_calendar)),
            )
            .child(
                Card::new()
                    .title("Pickers & Inputs")
                    .description("Popover date_picker, color_picker, and numerical stepper.")
                    .child(
                        h_flex()
                            .gap_6()
                            .flex_wrap()
                            .items_start()
                            .child(
                                v_flex()
                                    .gap_1p5()
                                    .child(Label::new("Date Picker"))
                                    .child(DatePicker::new(&self.demo_date)),
                            )
                            .child(
                                v_flex()
                                    .gap_1p5()
                                    .child(Label::new("Color Picker"))
                                    .child(ColorPicker::new(&self.demo_color)),
                            )
                            .child(
                                v_flex()
                                    .gap_1p5()
                                    .child(Label::new("Number Stepper"))
                                    .child(
                                        div()
                                            .w_32()
                                            .flex_none()
                                            .child(NumberInput::new(&self.demo_number)),
                                    ),
                            ),
                    ),
            )
    }
}

