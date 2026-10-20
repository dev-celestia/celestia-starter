use std::rc::Rc;

use celestia_ui::components::Card;
use celestia_ui::components::composite::description_list::DescriptionList;
use celestia_ui::components::composite::empty::{
    Empty as EmptyState, EmptyDescription, EmptyHeader, EmptyTitle,
};
use celestia_ui::components::composite::pagination::Pagination;
use celestia_ui::components::composite::virtual_list::{VirtualListScrollHandle, v_virtual_list};
use celestia_ui::components::primitive::breadcrumb::{Breadcrumb, BreadcrumbItem};
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::table::{DataTable, TableColumn};
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_data_demo(&self, demo: Demo, _cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::DataTable => Card::new()
                .title("DataTable")
                .description("Declarative data table.")
                .child(
                    DataTable::new(
                        [
                            TableColumn::new("Invoice").width(220.),
                            TableColumn::new("Status").width(100.),
                            TableColumn::new("Amount"),
                        ],
                        vec![
                            vec![
                                "INV-001 — Acme Corp".into(),
                                "Paid".into(),
                                "$1,200.00".into(),
                            ],
                            vec![
                                "INV-002 — Globex Inc".into(),
                                "Pending".into(),
                                "$850.00".into(),
                            ],
                            vec![
                                "INV-003 — Soylent LLC".into(),
                                "Paid".into(),
                                "$340.00".into(),
                            ],
                            vec![
                                "INV-004 — Initech".into(),
                                "Overdue".into(),
                                "$920.00".into(),
                            ],
                        ],
                    )
                    .caption("A list of recent invoices."),
                )
                .into_any_element(),
            Demo::VirtualList => Card::new()
                .title("VirtualList")
                .description("Virtualized list.")
                .child(self.demo_virtual_list.clone())
                .into_any_element(),
            Demo::DescriptionList => Card::new()
                .title("DescriptionList")
                .description("Metadata description list.")
                .child(
                    DescriptionList::new()
                        .item("Framework", "Celestia Desktop", 1)
                        .item("Platform Engine", "GPUI (Metal / Vulkan)", 1)
                        .item("Architecture", "ARM64 / x86_64 Native", 1)
                        .item("Design System", "Celestia Semantic Tokens", 1),
                )
                .into_any_element(),
            Demo::Breadcrumb => Card::new()
                .title("Breadcrumb")
                .description("Hierarchical breadcrumbs.")
                .child(
                    Breadcrumb::new()
                        .child(BreadcrumbItem::new("Home"))
                        .child(BreadcrumbItem::new("Components"))
                        .child(BreadcrumbItem::new("Data Display")),
                )
                .into_any_element(),
            Demo::Pagination => Card::new()
                .title("Pagination")
                .description("Page controls.")
                .child(
                    h_flex()
                        .items_center()
                        .child(Pagination::new("pg-demo").total_pages(8).current_page(3)),
                )
                .into_any_element(),
            Demo::Empty => Card::new()
                .title("Empty")
                .description("Empty-state placeholder.")
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
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not a data display demo."))
                .into_any_element(),
        }
    }
}

const ROW_COUNT: usize = 2_000;

/// Severity of a demo log row — drives the colored dot.
#[derive(Clone, Copy)]
enum Level {
    Info,
    Ok,
    Warn,
}

/// One fake event-stream row. The `details` length (1–3) gives every row a
/// different height, which is what the virtual list positions items by.
struct LogEntry {
    level: Level,
    title: String,
    details: Vec<String>,
    source: &'static str,
    time: String,
    height: Pixels,
}

impl LogEntry {
    fn generate(ix: usize) -> Self {
        let level = match ix % 7 {
            0 | 4 => Level::Ok,
            2 | 5 => Level::Warn,
            _ => Level::Info,
        };
        let kind = [
            "Replication",
            "Snapshot",
            "Index rebuild",
            "Telemetry flush",
            "Compaction",
            "Checkpoint",
        ][ix % 6];
        let source = ["sync-engine", "store", "renderer", "scheduler"][ix % 4];

        let mut details = vec![format!("Task finished in {} ms.", 40 + (ix * 37) % 460)];
        if !(ix * 5 + 1).is_multiple_of(3) {
            details.push(format!(
                "Synced {} objects across 2 peers.",
                12 + (ix * 13) % 240
            ));
        }
        if (ix * 5 + 1) % 3 > 1 {
            details.push("Backfill continues overnight; no action required.".into());
        }

        let minutes = (ix * 7 / 60) % 60;
        let seconds = (ix * 7) % 60;
        let height = px(34. + 18. * details.len() as f32);
        Self {
            level,
            title: format!("{kind} — Event #{ix:04}"),
            details,
            source,
            time: format!("{minutes:02}:{seconds:02}"),
            height,
        }
    }
}

/// The virtual list renders through a `Render` entity, so the demo is its own
/// small view: fixed entry data plus a scroll handle for programmatic jumps.
pub(crate) struct VirtualListDemo {
    entries: Vec<LogEntry>,
    scroll_handle: VirtualListScrollHandle,
}

impl VirtualListDemo {
    pub(crate) fn new() -> Self {
        Self {
            entries: (0..ROW_COUNT).map(LogEntry::generate).collect(),
            scroll_handle: VirtualListScrollHandle::new(),
        }
    }

    fn render_row(&self, ix: usize, cx: &Context<Self>) -> AnyElement {
        let entry = &self.entries[ix];
        let dot = match entry.level {
            Level::Info => cx.theme().info,
            Level::Ok => cx.theme().success,
            Level::Warn => cx.theme().warning,
        };
        let zebra = if ix.is_multiple_of(2) {
            cx.theme().colors.list_even
        } else {
            cx.theme().colors.list
        };

        h_flex()
            .w_full()
            .h(entry.height)
            .px_3()
            .py_2()
            .gap_2()
            .items_start()
            .bg(zebra)
            .overflow_hidden()
            .child(
                div()
                    .mt_1()
                    .size(px(7.))
                    .flex_shrink_0()
                    .rounded_full()
                    .bg(dot),
            )
            .child(
                v_flex()
                    .min_w_0()
                    .gap_0p5()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(cx.theme().foreground)
                            .child(entry.title.clone()),
                    )
                    .children(entry.details.iter().map(|line| {
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child(line.clone())
                    })),
            )
            .child(div().flex_1())
            .child(
                div()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .child(entry.source),
            )
            .child(
                div()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .child(entry.time.clone()),
            )
            .into_any_element()
    }
}

impl Render for VirtualListDemo {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let item_sizes = Rc::new(
            self.entries
                .iter()
                .map(|entry| size(px(0.), entry.height))
                .collect::<Vec<_>>(),
        );

        v_flex()
            .gap_3()
            .child(
                div()
                    .h(px(380.))
                    .border_1()
                    .border_color(cx.theme().border)
                    .rounded(cx.theme().radius)
                    .overflow_hidden()
                    .child(
                        v_virtual_list(
                            cx.entity(),
                            "virtual-list-demo",
                            item_sizes,
                            |this, range, _window, cx| {
                                range.map(|ix| this.render_row(ix, cx)).collect::<Vec<_>>()
                            },
                        )
                        .track_scroll(&self.scroll_handle)
                        .h_full(),
                    ),
            )
            .child(
                h_flex()
                    .justify_between()
                    .items_center()
                    .child(
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child(format!(
                                "{ROW_COUNT} rows with uneven heights — only the visible range \
                                 renders"
                            )),
                    )
                    .child(
                        Button::new("vl-jump-latest")
                            .variant(ButtonVariant::Outline)
                            .size(ButtonSize::XSmall)
                            .label("Jump to latest")
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.scroll_handle.scroll_to_bottom();
                                cx.notify();
                            })),
                    ),
            )
    }
}
