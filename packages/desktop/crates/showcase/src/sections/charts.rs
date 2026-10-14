use celestia_ui::components::Card;
use celestia_ui::components::composite::charts::chart::BarChart;
use celestia_ui::components::composite::charts::{ChartDonut, ChartLine, ChartPie};
use celestia_ui::palette;
use gpui::*;
use gpui_component::{ActiveTheme, h_flex, v_flex};

use crate::showcase::Showcase;

/// Weekly sessions, one `(day, value)` pair per x tick.
const WEEKLY: [(&str, f64); 7] = [
    ("Mon", 420.0),
    ("Tue", 510.0),
    ("Wed", 480.0),
    ("Thu", 620.0),
    ("Fri", 590.0),
    ("Sat", 740.0),
    ("Sun", 690.0),
];

/// Traffic sources, one entry per pie slice (visitors per channel).
const SOURCES: [(&str, f32); 4] = [
    ("Direct", 300.),
    ("Organic", 220.),
    ("Referral", 140.),
    ("Social", 90.),
];

/// Storage breakdown for the donut, in GB.
const STORAGE: [(&str, f32); 4] = [
    ("Media", 320.),
    ("Documents", 96.),
    ("Apps", 64.),
    ("Other", 32.),
];

impl Showcase {
    pub(crate) fn render_charts(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let palette = palette(cx);
        let muted = cx.theme().muted_foreground;

        v_flex()
            .gap_6()
            .child(
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
            .child(
                Card::new()
                    .title("Line Chart")
                    .description(
                        "Single-series trend with smoothed interpolation, a hover crosshair, and a data dot following the cursor.",
                    )
                    .child(ChartLine::new("chart-line-weekly", WEEKLY).name("Sessions").dots(true)),
            )
            .child(
                Card::new()
                    .title("Pie Chart")
                    .description(
                        "Share-of-total slices with leader-line labels and a hover tooltip showing each slice's share.",
                    )
                    .child(ChartPie::new("chart-pie-sources", SOURCES).name("Visitors")),
            )
            .child(
                Card::new()
                    .title("Donut Chart")
                    .description(
                        "Pie with a punched-out centre and padded slices; the hole hosts a summary, with a legend built from the same table.",
                    )
                    .child(
                        h_flex()
                            .items_center()
                            .gap_8()
                            .child(
                                ChartDonut::new("chart-donut-storage", STORAGE)
                                    .name("Storage")
                                    .child(
                                        div()
                                            .text_lg()
                                            .font_weight(FontWeight::BOLD)
                                            .child("512 GB"),
                                    )
                                    .child(div().text_sm().text_color(muted).child("of 1 TB used")),
                            )
                            .child(
                                v_flex()
                                    .gap_2()
                                    .children(STORAGE.iter().enumerate().map(
                                        |(ix, (label, value))| {
                                            h_flex()
                                                .gap_2()
                                                .items_center()
                                                .child(
                                                    div()
                                                        .w(px(8.))
                                                        .h(px(8.))
                                                        .rounded_full()
                                                        .bg(palette.chart(ix)),
                                                )
                                                .child(
                                                    div()
                                                        .text_sm()
                                                        .child(format!(
                                                            "{} · {} GB",
                                                            label, value
                                                        )),
                                                )
                                        },
                                    )),
                            ),
                    ),
            )
    }
}
