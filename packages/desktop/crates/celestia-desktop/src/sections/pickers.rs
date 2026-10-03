use celestia_ui::components::Card;
use celestia_ui::components::color_picker::ColorPicker;
use celestia_ui::components::date_picker::DatePicker;
use celestia_ui::components::input::NumberInput;
use gpui_kit::component::h_flex;
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_pickers(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Pickers")
            .description("date_picker, color_picker, number input.")
            .child(
                h_flex()
                    .gap_4()
                    .flex_wrap()
                    .items_center()
                    .child(DatePicker::new(&self.demo_date))
                    .child(ColorPicker::new(&self.demo_color))
                    .child(
                        div()
                            .w_32()
                            .flex_none()
                            .child(NumberInput::new(&self.demo_number)),
                    ),
            )
    }
}
