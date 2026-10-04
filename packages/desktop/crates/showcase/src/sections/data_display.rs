use celestia_ui::components::Card;
use celestia_ui::components::breadcrumb::{Breadcrumb, BreadcrumbItem};
use celestia_ui::components::button::{Button, ButtonVariant};
use celestia_ui::components::description_list::DescriptionList;
use celestia_ui::components::empty::{
    Empty as EmptyState, EmptyDescription, EmptyHeader, EmptyTitle,
};
use celestia_ui::components::pagination::Pagination;
use gpui_kit::component::{h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_data_display(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        v_flex()
            .gap_6()
            .child(
                Card::new()
                    .title("Data Table")
                    .description(
                        "Structured tabular data presentation with columns, borders, and rows.",
                    )
                    .child(self.demo_table.clone()),
            )
            .child(
                Card::new()
                    .title("Description List")
                    .description("Key-value metadata lists for system and resource details.")
                    .child(
                        DescriptionList::new()
                            .item("Framework", "Celestia Desktop", 1)
                            .item("Platform Engine", "GPUI (Metal / Vulkan)", 1)
                            .item("Architecture", "ARM64 / x86_64 Native", 1)
                            .item("Design System", "Celestia Semantic Tokens", 1),
                    ),
            )
            .child(
                Card::new()
                    .title("Navigation: Breadcrumbs & Pagination")
                    .description("Hierarchical path trails and page index controls.")
                    .child(
                        v_flex()
                            .gap_4()
                            .child(
                                Breadcrumb::new()
                                    .child(BreadcrumbItem::new("Home"))
                                    .child(BreadcrumbItem::new("Components"))
                                    .child(BreadcrumbItem::new("Data Display")),
                            )
                            .child(
                                h_flex().items_center().child(
                                    Pagination::new("pg-demo").total_pages(8).current_page(3),
                                ),
                            ),
                    ),
            )
            .child(
                Card::new()
                    .title("Empty State")
                    .description(
                        "Placeholder presentation when query results or datasets are empty.",
                    )
                    .child(
                        EmptyState::new()
                            .header(
                                EmptyHeader::new()
                                    .title(EmptyTitle::new().child("No records found"))
                                    .description(EmptyDescription::new().child(
                                        "There are no items matching the selected criteria.",
                                    )),
                            )
                            .child(
                                Button::new("empty-reset")
                                    .variant(ButtonVariant::Outline)
                                    .label("Reset Filters"),
                            ),
                    ),
            )
    }
}
