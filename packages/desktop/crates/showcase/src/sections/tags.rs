use celestia_ui::components::Card;
use celestia_ui::components::primitive::badge::{Badge, BadgeVariant, GpuiBadge};
use gpui::*;
use gpui_component::h_flex;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_tags(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Tags & Badges")
            .description("badge.rs wrapper — variant chips, the brand chip, count and dot badges.")
            .child(
                h_flex()
                    .gap_2()
                    .flex_wrap()
                    .items_center()
                    .child(Badge::new("Primary"))
                    .child(Badge::new("Secondary").variant(BadgeVariant::Secondary))
                    .child(Badge::new("Success").variant(BadgeVariant::Success))
                    .child(Badge::new("Warning").variant(BadgeVariant::Warning))
                    .child(Badge::new("Info").variant(BadgeVariant::Info))
                    .child(Badge::new("Destructive").variant(BadgeVariant::Destructive))
                    .child(Badge::new("Outline").variant(BadgeVariant::Outline))
                    .child(Badge::new("Brand").variant(BadgeVariant::Brand))
                    .child(GpuiBadge::new().count(8))
                    .child(GpuiBadge::new().dot()),
            )
    }
}
