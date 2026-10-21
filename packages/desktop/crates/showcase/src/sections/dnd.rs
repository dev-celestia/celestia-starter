//! Drag-and-drop gallery demos — primitives + composites.

use celestia_ui::components::Card;
use celestia_ui::components::composite::dnd::{Draggable, DropTarget, ItemDrag, reorder_vec};
use celestia_ui::components::composite::drop_zone::{DropZone, DropZoneState};
use celestia_ui::components::composite::sortable_list::{
    ReorderIndices, SortableItem, SortableList,
};
use celestia_ui::components::primitive::drag_handle::DragHandle;
use celestia_ui::components::primitive::drop_indicator::DropIndicator;
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_dnd_demo(&self, demo: Demo, cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::DragHandle => Card::new()
                .title("DragHandle")
                .description("Six-dot grip — pair with Draggable / SortableItem.")
                .child(
                    h_flex()
                        .gap_4()
                        .items_center()
                        .child(
                            v_flex()
                                .gap_1()
                                .items_center()
                                .child(DragHandle::new("handle-idle"))
                                .child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Default"),
                                ),
                        )
                        .child(
                            v_flex()
                                .gap_1()
                                .items_center()
                                .child(DragHandle::new("handle-disabled").disabled(true))
                                .child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Disabled"),
                                ),
                        )
                        .child(
                            h_flex()
                                .gap_2()
                                .items_center()
                                .px(px(10.0))
                                .py(px(8.0))
                                .rounded(cx.theme().radius)
                                .border_1()
                                .border_color(cx.theme().border)
                                .bg(cx.theme().popover)
                                .child(DragHandle::new("handle-in-row"))
                                .child(
                                    div()
                                        .text_sm()
                                        .text_color(cx.theme().foreground)
                                        .child("Row with grip"),
                                ),
                        ),
                )
                .into_any_element(),

            Demo::DropIndicator => Card::new()
                .title("DropIndicator")
                .description("The accent line that appears between rows before you release.")
                .child(
                    v_flex()
                        .gap_4()
                        .w(px(280.0))
                        .child(
                            v_flex()
                                .gap_1()
                                .child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Vertical list (horizontal rule)"),
                                )
                                .child(
                                    div()
                                        .w_full()
                                        .px(px(10.0))
                                        .py(px(8.0))
                                        .rounded(cx.theme().radius)
                                        .border_1()
                                        .border_color(cx.theme().border)
                                        .bg(cx.theme().popover)
                                        .child(div().text_sm().child("Inbox triage")),
                                )
                                .child(DropIndicator::new().visible(true))
                                .child(
                                    div()
                                        .w_full()
                                        .px(px(10.0))
                                        .py(px(8.0))
                                        .rounded(cx.theme().radius)
                                        .border_1()
                                        .border_color(cx.theme().border)
                                        .bg(cx.theme().popover)
                                        .child(div().text_sm().child("Write release notes")),
                                ),
                        )
                        .child(
                            v_flex()
                                .gap_1()
                                .child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Horizontal list (vertical rule)"),
                                )
                                .child(
                                    h_flex()
                                        .gap_1()
                                        .h(px(48.0))
                                        .child(
                                            div()
                                                .px(px(12.0))
                                                .h_full()
                                                .flex()
                                                .items_center()
                                                .rounded(cx.theme().radius)
                                                .border_1()
                                                .border_color(cx.theme().border)
                                                .bg(cx.theme().popover)
                                                .child(div().text_sm().child("A")),
                                        )
                                        .child(
                                            DropIndicator::new()
                                                .axis(Axis::Horizontal)
                                                .visible(true),
                                        )
                                        .child(
                                            div()
                                                .px(px(12.0))
                                                .h_full()
                                                .flex()
                                                .items_center()
                                                .rounded(cx.theme().radius)
                                                .border_1()
                                                .border_color(cx.theme().border)
                                                .bg(cx.theme().popover)
                                                .child(div().text_sm().child("B")),
                                        ),
                                ),
                        ),
                )
                .into_any_element(),

            Demo::Draggable => {
                let status = self.demo_drop_status.clone();
                Card::new()
                    .title("Draggable")
                    .description("Drag Alpha or Beta onto the target. It washes accent and shows “Release to drop” before you let go.")
                    .child(
                        v_flex()
                            .gap_3()
                            .child(
                                h_flex()
                                    .gap_3()
                                    .child(
                                        Draggable::new(
                                            "drag-a",
                                            ItemDrag::new("demo", "card-a", 0, "Alpha"),
                                        )
                                        .w(px(200.0))
                                        .child(
                                            div()
                                                .text_sm()
                                                .text_color(cx.theme().foreground)
                                                .child("Alpha"),
                                        ),
                                    )
                                    .child(
                                        Draggable::new(
                                            "drag-b",
                                            ItemDrag::new("demo", "card-b", 1, "Beta"),
                                        )
                                        .w(px(200.0))
                                        .show_handle(false)
                                        .child(
                                            div()
                                                .text_sm()
                                                .text_color(cx.theme().foreground)
                                                .child("Beta (no handle)"),
                                        ),
                                    )
                                    .child(
                                        DropTarget::new("drag-sink")
                                            .w(px(220.0))
                                            .min_h(px(64.0))
                                            .p(px(14.0))
                                            .on_item_drop(cx.listener(
                                                |this, drag: &ItemDrag, _, cx| {
                                                    this.demo_drop_status = format!(
                                                        "Dropped “{}”",
                                                        drag.label
                                                    )
                                                    .into();
                                                    cx.notify();
                                                },
                                            ))
                                            .child(
                                                div()
                                                    .text_sm()
                                                    .text_color(cx.theme().muted_foreground)
                                                    .child("Drop here"),
                                            ),
                                    ),
                            )
                            .child(
                                div()
                                    .text_xs()
                                    .text_color(cx.theme().muted_foreground)
                                    .child(status),
                            ),
                    )
                    .into_any_element()
            }

            Demo::DropTarget => {
                let status = self.demo_drop_status.clone();
                Card::new()
                    .title("DropTarget")
                    .description("Hover a valid drag — the surface washes accent and says “Release to drop” before release. The third card is that wash, forced on.")
                    .child(
                        v_flex()
                            .gap_3()
                            .child(
                                h_flex()
                                    .gap_3()
                                    .child(
                                        Draggable::new(
                                            "drag-src",
                                            ItemDrag::new(
                                                "transfer",
                                                "note-1",
                                                0,
                                                "Release notes",
                                            ),
                                        )
                                        .w(px(220.0))
                                        .child(
                                            div()
                                                .text_sm()
                                                .text_color(cx.theme().foreground)
                                                .child("Release notes"),
                                        ),
                                    )
                                    .child(
                                        DropTarget::new("drop-dst")
                                            .w(px(260.0))
                                            .min_h(px(72.0))
                                            .p(px(16.0))
                                            .on_item_drop(cx.listener(
                                                |this, drag: &ItemDrag, _, cx| {
                                                    this.demo_drop_status = format!(
                                                        "Accepted “{}” from {}",
                                                        drag.label, drag.list_id
                                                    )
                                                    .into();
                                                    cx.notify();
                                                },
                                            ))
                                            .child(
                                                div()
                                                    .text_sm()
                                                    .text_color(cx.theme().muted_foreground)
                                                    .child("Drop the note here"),
                                            ),
                                    )
                                    .child(
                                        DropTarget::new("drop-hl")
                                            .w(px(180.0))
                                            .min_h(px(72.0))
                                            .p(px(16.0))
                                            .highlighted(true)
                                            .accept_items(false)
                                            .child(
                                                div()
                                                    .text_sm()
                                                    .text_color(cx.theme().muted_foreground)
                                                    .child("Forced highlight"),
                                            ),
                                    ),
                            )
                            .child(
                                div()
                                    .text_xs()
                                    .text_color(cx.theme().muted_foreground)
                                    .child(status),
                            ),
                    )
                    .into_any_element()
            }

            Demo::DropZone => {
                let status = self.demo_drop_status.clone();
                Card::new()
                    .title("DropZone")
                    .description("Drag files onto the live zone. It highlights and says “Release to drop” before they land. The other cards are forced states.")
                    .child(
                        v_flex()
                            .gap_3()
                            .child(
                                h_flex()
                                    .gap_3()
                                    .child(
                                        DropZone::new("dz-live")
                                            .w(px(260.0))
                                            .title("Drop files here")
                                            .description("Accent wash before release")
                                            .on_files(cx.listener(
                                                |this, paths: &Vec<std::path::PathBuf>, _, cx| {
                                                    let names: Vec<_> = paths
                                                        .iter()
                                                        .filter_map(|p| {
                                                            p.file_name().map(|n| {
                                                                n.to_string_lossy().into_owned()
                                                            })
                                                        })
                                                        .collect();
                                                    this.demo_drop_status = if names.is_empty() {
                                                        "Received empty path list.".into()
                                                    } else {
                                                        format!("Files: {}", names.join(", "))
                                                            .into()
                                                    };
                                                    cx.notify();
                                                },
                                            )),
                                    )
                                    .child(
                                        DropZone::new("dz-active")
                                            .w(px(220.0))
                                            .state(DropZoneState::Active)
                                            .force_state(true)
                                            .title("Drop to upload")
                                            .description("Forced Active"),
                                    )
                                    .child(
                                        DropZone::new("dz-err")
                                            .w(px(220.0))
                                            .state(DropZoneState::Error)
                                            .force_state(true)
                                            .title("File too large")
                                            .description("Max 10 MB"),
                                    ),
                            )
                            .child(
                                div()
                                    .text_xs()
                                    .text_color(cx.theme().muted_foreground)
                                    .child(status),
                            ),
                    )
                    .into_any_element()
            }

            Demo::SortableList => {
                let items = self.demo_sortable_items.clone();
                let mut list = SortableList::new("sortable-demo");
                for (index, label) in items.iter().enumerate() {
                    let item_id: SharedString = format!("item-{index}").into();
                    list = list.child(
                        SortableItem::new(
                            ("sortable-row", index),
                            "showcase-tasks",
                            item_id,
                            index,
                            label.clone(),
                        )
                        .on_reorder(cx.listener(
                            |this, &(from, to): &ReorderIndices, _, cx| {
                                reorder_vec(&mut this.demo_sortable_items, from, to);
                                this.demo_drop_status = format!("Moved {from} → {to}").into();
                                cx.notify();
                            },
                        )),
                    );
                }
                Card::new()
                    .title("SortableList")
                    .description("Drag a handle. A line appears above the destination row, and that row washes accent, before you release.")
                    .child(
                        v_flex()
                            .gap_2()
                            .child(list)
                            .child(
                                div()
                                    .text_xs()
                                    .text_color(cx.theme().muted_foreground)
                                    .child(self.demo_drop_status.clone()),
                            ),
                    )
                    .into_any_element()
            }

            _ => v_flex()
                .child(div().text_sm().child("Not a drag-and-drop demo."))
                .into_any_element(),
        }
    }
}
