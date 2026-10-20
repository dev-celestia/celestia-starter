use celestia_ui::components::Card;
use celestia_ui::components::primitive::typography::{
    Heading, Typography, TypographyTone, TypographyVariant,
};
use gpui::*;
use gpui_component::v_flex;

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_typography_demo(&self, demo: Demo, _cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::Typography => Card::new()
                .title("Typography")
                .description("Standardized type scale — prefer these over ad-hoc text sizes.")
                .child(
                    v_flex()
                        .gap_3()
                        .child(Typography::display("Display"))
                        .child(Typography::h1("Heading 1"))
                        .child(Typography::h2("Heading 2"))
                        .child(Typography::h3("Heading 3"))
                        .child(Typography::h4("Heading 4"))
                        .child(Typography::lead(
                            "Lead — supporting intro under a title, a step larger than body.",
                        ))
                        .child(Typography::body(
                            "Body — default reading size for product copy and descriptions.",
                        ))
                        .child(Typography::body_sm(
                            "BodySm — denser UI, tables, and secondary paragraphs.",
                        ))
                        .child(Typography::muted("Muted — secondary helper line."))
                        .child(Typography::caption("Caption — footnote / meta"))
                        .child(Typography::overline("OVERLINE"))
                        .child(Typography::code("pnpm desktop"))
                        .child(
                            Typography::new("Accent body tone")
                                .variant(TypographyVariant::Body)
                                .tone(TypographyTone::Accent),
                        )
                        .child(
                            Typography::new(
                                "Truncated line that should ellipsis when the container is narrow enough to clip this sentence.",
                            )
                            .truncate(true)
                            .w(px(280.0)),
                        ),
                )
                .into_any_element(),
            Demo::Heading => Card::new()
                .title("Heading")
                .description("Semantic Display / H1–H4 wrappers over the same scale.")
                .child(
                    v_flex()
                        .gap_3()
                        .child(Heading::display("Display"))
                        .child(Heading::h1("Page title"))
                        .child(Heading::h2("Section title"))
                        .child(Heading::h3("Subsection"))
                        .child(Heading::h4("Group label"))
                        .child(
                            Heading::h2("Centered section")
                                .center()
                                .tone(TypographyTone::Muted),
                        ),
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not a typography demo."))
                .into_any_element(),
        }
    }
}
