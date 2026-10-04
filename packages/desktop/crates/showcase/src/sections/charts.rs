use celestia_ui::components::Card;
use celestia_ui::components::charts::chart::BarChart;
use gpui_kit::component::v_flex;
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_charts(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        v_flex().gap_6().child(
            Card::new()
                .title("Bar Chart")
                .description(
                    "Categorical band bar chart plotting series data with semantic tokens.",
                )
                .child(
                    div().h(px(220.)).w_full().child(
                        BarChart::new(vec![
                            ("Mon", 42.0),
                            ("Tue", 68.0),
                            ("Wed", 85.0),
                            ("Thu", 55.0),
                            ("Fri", 92.0),
                            ("Sat", 40.0),
                            ("Sun", 30.0),
                        ])
                        .band(|(day, _)| *day)
                        .value(|(_, count)| *count),
                    ),
                ),
        )
    }
}
