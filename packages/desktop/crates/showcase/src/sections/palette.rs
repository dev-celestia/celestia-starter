use celestia_ui::components::Card;
use celestia_ui::palette;
use gpui_kit::component::{ActiveTheme, h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_palette(&self, cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Semantic palette")
            .description("cx.theme() roles plus the mode-independent brand pair and chart ramp.")
            .child(swatches(cx))
    }
}

/// One swatch per semantic role, label underneath.
fn swatches(cx: &App) -> impl IntoElement {
    let swatch = |label: &'static str, color: Hsla, cx: &App| {
        v_flex()
            .gap_1()
            .w_20()
            .child(
                div()
                    .h_8()
                    .rounded(px(4.))
                    .bg(color)
                    .border_1()
                    .border_color(cx.theme().border),
            )
            .child(
                div()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .child(label),
            )
    };

    h_flex()
        .flex_wrap()
        .gap_3()
        .child(swatch("primary", cx.theme().primary, cx))
        .child(swatch("success", cx.theme().success, cx))
        .child(swatch("warning", cx.theme().warning, cx))
        .child(swatch("info", cx.theme().info, cx))
        .child(swatch("danger", cx.theme().danger, cx))
        .child(swatch("brand", palette(cx).brand(), cx))
        .child(swatch("brand-deep", palette(cx).brand_deep(), cx))
        .child(swatch("chart-1", palette(cx).chart(0), cx))
        .child(swatch("chart-5", palette(cx).chart(4), cx))
}
