//! Sortable list — reorderable rows built on [`super::dnd::ItemDrag`].

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Axis, CursorStyle, DragMoveEvent, ElementId, InteractiveElement as _,
    IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, px,
};

use crate::components::composite::dnd::{
    ItemDrag, ItemDragPreview, arm_drag, claim_drop_slot, clear_drop_slot, drag_insertion_line,
    drop_progress, mix_drop_wash,
};
use crate::motion;
use crate::components::primitive::drag_handle::DragHandle;
use crate::theme::ActiveTheme as _;

/// `(from_index, to_index)` delivered when a row accepts a drop.
pub type ReorderIndices = (usize, usize);

type OnReorder = Rc<dyn Fn(&ReorderIndices, &mut Window, &mut App) + 'static>;

/// Vertical (or horizontal) list of [`SortableItem`]s with drop indicators.
///
/// Attach [`SortableItem::on_reorder`] on each row (or share one `Rc` callback).
/// Use [`super::dnd::reorder_vec`] inside the host to update the model.
#[derive(IntoElement)]
pub struct SortableList {
    id: ElementId,
    style: StyleRefinement,
    axis: Axis,
    disabled: bool,
    children: Vec<AnyElement>,
}

impl SortableList {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            axis: Axis::Vertical,
            disabled: false,
            children: Vec::new(),
        }
    }

    pub fn axis(mut self, axis: Axis) -> Self {
        self.axis = axis;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for SortableList {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for SortableList {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SortableList {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let _ = cx;
        let vertical = matches!(self.axis, Axis::Vertical);

        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .when(vertical, |this| this.flex_col())
            .when(!vertical, |this| this.flex_row())
            .gap(px(4.0))
            .when(self.disabled, |this| this.opacity(0.55));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// One reorderable row. Dropping another [`ItemDrag`] with the same `list_id`
/// onto this row fires `on_reorder(from, self.index)`.
#[derive(IntoElement)]
pub struct SortableItem {
    id: ElementId,
    style: StyleRefinement,
    list_id: SharedString,
    item_id: SharedString,
    index: usize,
    label: SharedString,
    disabled: bool,
    dragging: bool,
    show_indicator: bool,
    indicator_axis: Axis,
    on_reorder: Option<OnReorder>,
    children: Vec<AnyElement>,
}

impl SortableItem {
    pub fn new(
        id: impl Into<ElementId>,
        list_id: impl Into<SharedString>,
        item_id: impl Into<SharedString>,
        index: usize,
        label: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            list_id: list_id.into(),
            item_id: item_id.into(),
            index,
            label: label.into(),
            disabled: false,
            dragging: false,
            show_indicator: false,
            indicator_axis: Axis::Vertical,
            on_reorder: None,
            children: Vec::new(),
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn dragging(mut self, dragging: bool) -> Self {
        self.dragging = dragging;
        self
    }

    /// Show an insertion line above this row (host sets while a drag is over it).
    pub fn show_indicator(mut self, show: bool) -> Self {
        self.show_indicator = show;
        self
    }

    pub fn indicator_axis(mut self, axis: Axis) -> Self {
        self.indicator_axis = axis;
        self
    }

    pub fn on_reorder(
        mut self,
        f: impl Fn(&ReorderIndices, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_reorder = Some(Rc::new(f));
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for SortableItem {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for SortableItem {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SortableItem {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let radius = cx.theme().radius;
        let border = cx.theme().border;
        let popover = cx.theme().popover;
        let accent = cx.theme().accent;
        let foreground = cx.theme().foreground;
        let list_id = self.list_id.clone();
        let index = self.index;
        let payload = ItemDrag::new(
            self.list_id.clone(),
            self.item_id.clone(),
            self.index,
            self.label.clone(),
        );
        let disabled = self.disabled;
        let _ = self.dragging;
        let group: SharedString = format!("sortable-{}", self.item_id).into();
        
        let mut row = div()
            .id(self.id.clone())
            .group(group.clone())
            .w_full()
            .flex()
            .flex_col()
            .rounded(radius);
        row.style().refine(&self.style);

        let slot_id = ElementId::Name(format!("sortable-line-{}", self.item_id).into());
        let wash = if disabled {
            0.0
        } else {
            drop_progress::<ItemDrag>(&slot_id, window, cx)
        };
        let face = div()
            .id(ElementId::Name(
                format!("sortable-face-{}", self.item_id).into(),
            ))
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .px(px(10.0))
            .py(px(8.0))
            .rounded(radius)
            .border_1()
            .border_color(motion::mix(border, accent, wash))
            .bg(mix_drop_wash(popover, accent, wash))
            .when(!disabled, |this| this.cursor(CursorStyle::OpenHand))
            .child(
                DragHandle::new(ElementId::Name(
                    format!("sortable-handle-{}", self.item_id).into(),
                ))
                .disabled(disabled),
            )
            .when(self.children.is_empty(), |this| {
                this.child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .text_sm()
                        .text_color(foreground)
                        .child(self.label.clone()),
                )
            })
            .when(!self.children.is_empty(), |this| {
                this.child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(8.0))
                        .children(self.children),
                )
            });

        let row = if disabled {
            row.child(face).into_any_element()
        } else {
            let list_for_can = list_id.clone();
            let list_for_drop = list_id.clone();
            let on_reorder = self.on_reorder.clone();
            let claim_slot = slot_id.clone();
            let claim_item = self.item_id.clone();
            let row = row
                .child(drag_insertion_line::<ItemDrag>(
                    slot_id,
                    accent,
                    window,
                    cx,
                ))
                .child(face)
                .on_drag(payload, move |drag, _, _, cx| {
                    arm_drag::<ItemDrag>(drag.item_id.clone(), cx);
                    ItemDragPreview::entity(drag.label.clone(), cx)
                })
                .on_drag_move(|_: &DragMoveEvent<ItemDrag>, _, cx| {
                    clear_drop_slot::<ItemDrag>(cx);
                })
                .on_mouse_move(move |_, _, cx| {
                    if cx.has_active_drag() {
                        claim_drop_slot::<ItemDrag>(claim_slot.clone(), &claim_item, cx);
                    }
                })
                .can_drop(move |value: &dyn std::any::Any, _, _| {
                    value
                        .downcast_ref::<ItemDrag>()
                        .is_some_and(|drag| drag.list_id == list_for_can && drag.index != index)
                });

            if let Some(on) = on_reorder {
                row.on_drop(move |drag: &ItemDrag, window, cx| {
                    if drag.list_id == list_for_drop && drag.index != index {
                        on(&(drag.index, index), window, cx);
                    }
                })
                .into_any_element()
            } else {
                row.into_any_element()
            }
        };

        // Host-forced indicator still wins when a gallery pins it on.
        let forced = self.show_indicator;
        let axis = self.indicator_axis;
        div()
            .w_full()
            .flex()
            .flex_col()
            .when(forced, |this| {
                this.child(
                    crate::components::primitive::drop_indicator::DropIndicator::new().axis(axis),
                )
            })
            .child(row)
    }
}
