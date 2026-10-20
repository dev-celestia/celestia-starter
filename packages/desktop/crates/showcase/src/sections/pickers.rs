use celestia_ui::components::Card;
use celestia_ui::components::composite::color_picker::ColorPicker;
use celestia_ui::components::composite::date_picker::DatePicker;
use celestia_ui::components::primitive::calendar::Calendar;
use celestia_ui::components::primitive::input::NumberInput;
use celestia_ui::components::primitive::label::Label;
use gpui::*;
use gpui_component::v_flex;

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_picker_demo(&self, demo: Demo, _cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::Calendar => Card::new()
                .title("Calendar")
                .description("Month grid with day selection.")
                .child(Calendar::new(&self.demo_calendar))
                .into_any_element(),
            Demo::DatePicker => Card::new()
                .title("DatePicker")
                .description("Popover date field.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("Date Picker"))
                        .child(DatePicker::new(&self.demo_date)),
                )
                .into_any_element(),
            Demo::ColorPicker => Card::new()
                .title("ColorPicker")
                .description("HSV/RGB color popup.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("Color Picker"))
                        .child(ColorPicker::new(&self.demo_color)),
                )
                .into_any_element(),
            Demo::NumberInput => Card::new()
                .title("NumberInput")
                .description("Stepper numerical input.")
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
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not a pickers demo."))
                .into_any_element(),
        }
    }
}
