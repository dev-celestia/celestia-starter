//! Drag-and-drop building blocks — typed payloads, previews, and drop targets.
//!
//! GPUI drag sessions are type-keyed: a source calls `on_drag(T, …)` and a
//! destination listens with `on_drop::<T>` / `drag_over::<T>`. This module
//! ships a shared [`ItemDrag`] payload plus presentational wrappers so hosts
//! do not re-implement ghost chrome and drop highlighting for every list.

use std::any::{Any, TypeId};
use std::path::PathBuf;
use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, AppContext as _, Context, CursorStyle, DragMoveEvent, ElementId, Entity,
    ExternalPaths, FontWeight, Global, Hsla, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, Render, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::motion::{self, spec_transition, transition, RESIZE};

use crate::components::primitive::drag_handle::DragHandle;
use crate::theme::ActiveTheme as _;

type CanAccept = Rc<dyn Fn(&dyn Any, &mut Window, &mut App) -> bool + 'static>;
type OnItemDrop = Rc<dyn Fn(&ItemDrag, &mut Window, &mut App) + 'static>;
type OnFilesDrop = Rc<dyn Fn(&Vec<PathBuf>, &mut Window, &mut App) + 'static>;

/// Shared payload for list / board item transfers.
///
/// Use the same `list_id` on every item in a sortable group so drops from
/// other lists can be rejected via [`DropTarget::can_accept`] or
/// [`super::sortable_list::SortableItem`]'s list check.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ItemDrag {
    pub list_id: SharedString,
    pub item_id: SharedString,
    pub index: usize,
    pub label: SharedString,
}

impl ItemDrag {
    pub fn new(
        list_id: impl Into<SharedString>,
        item_id: impl Into<SharedString>,
        index: usize,
        label: impl Into<SharedString>,
    ) -> Self {
        Self {
            list_id: list_id.into(),
            item_id: item_id.into(),
            index,
            label: label.into(),
        }
    }
}

/// Cursor copy of a dragged row. Chrome matches [`Draggable`] / [`super::sortable_list::SortableItem`]
/// so the held piece looks like the source.
pub struct ItemDragPreview {
    label: SharedString,
    show_handle: bool,
}

impl ItemDragPreview {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
            show_handle: true,
        }
    }

    pub fn show_handle(mut self, show: bool) -> Self {
        self.show_handle = show;
        self
    }

    /// Construct a preview entity for use inside `on_drag`'s constructor.
    pub fn entity(label: impl Into<SharedString>, cx: &mut App) -> Entity<Self> {
        let label = label.into();
        cx.new(|_| Self::new(label))
    }
}

impl Render for ItemDragPreview {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .px(px(10.0))
            .py(px(8.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .shadow_md()
            .when(self.show_handle, |this| {
                this.child(DragHandle::new("drag-preview-handle"))
            })
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_sm()
                    .text_color(theme.foreground)
                    .child(self.label.clone()),
            )
    }
}

/// How far an insertion slot grows, in pixels. The height is part of layout,
/// so rows and cards actually move apart, and it eases over [`RESIZE`].
const DROP_GAP: f32 = 28.0;
const DROP_HINT: f32 = 22.0;

/// Which drag is in flight, and which slot should be open.
///
/// The source clears `slot` on capture-phase drag moves. The hovered target
/// claims it on bubble, so the next frame can animate the gap.
#[derive(Clone)]
struct DragSession {
    kind: TypeId,
    source: SharedString,
    slot: Option<ElementId>,
}

impl Global for DragSession {}

/// Record the payload type and source id when a drag starts.
pub fn arm_drag<T: 'static>(source: impl Into<SharedString>, cx: &mut App) {
    cx.set_global(DragSession {
        kind: TypeId::of::<T>(),
        source: source.into(),
        slot: None,
    });
}

/// Close every slot. Called from the source's capture-phase drag move, before
/// the hovered target claims one.
pub fn clear_drop_slot<T: 'static>(cx: &mut App) {
    let kind = TypeId::of::<T>();
    let source = cx.try_global::<DragSession>().and_then(|session| {
        (session.kind == kind).then(|| session.source.clone())
    });
    let Some(source) = source else {
        return;
    };
    cx.set_global(DragSession {
        kind,
        source,
        slot: None,
    });
}

/// Mark `slot` as the resize target for an in-flight drag of type `T`.
/// A slot whose id matches the dragged source stays closed.
pub fn claim_drop_slot<T: 'static>(slot: ElementId, source_key: &str, cx: &mut App) {
    let kind = TypeId::of::<T>();
    let source = cx.try_global::<DragSession>().and_then(|session| {
        (session.kind == kind && session.source.as_ref() != source_key).then(|| session.source.clone())
    });
    let Some(source) = source else {
        return;
    };
    cx.set_global(DragSession {
        kind,
        source,
        slot: Some(slot),
    });
}

fn drop_slot_open<T: 'static>(id: &ElementId, cx: &App) -> bool {
    cx.has_active_drag()
        && cx.try_global::<DragSession>().is_some_and(|session| {
            session.kind == TypeId::of::<T>() && session.slot.as_ref() == Some(id)
        })
}

/// 0→1 resize progress for `id`, easing over [`RESIZE`] and reversing if the
/// pointer leaves the slot.
pub fn drop_progress<T: 'static>(id: &ElementId, window: &mut Window, cx: &mut App) -> f32 {
    let open = drop_slot_open::<T>(id, cx);
    transition(
        (id.clone(), "drop-wash"),
        if open { 1.0 } else { 0.0 },
        spec_transition(RESIZE),
        window,
        cx,
    )
}

/// Accent wash painted on a destination while a valid drag is hovering it,
/// before the pointer is released.
pub fn paint_drop_over(style: StyleRefinement, cx: &App) -> StyleRefinement {
    let theme = cx.theme();
    style
        .bg(theme.accent.opacity(0.22))
        .border_color(theme.accent)
}

/// Blend a resting color toward the drop wash by `t` (0 = rest, 1 = hovered).
pub fn mix_drop_wash(rest: Hsla, accent: Hsla, t: f32) -> Hsla {
    motion::mix(rest, accent.opacity(0.22), t)
}

/// Insertion slot that animates its layout height while a drag of type `T`
/// claims `id`. The surrounding list resizes with it.
pub fn drag_insertion_line<T: 'static>(
    id: impl Into<ElementId>,
    accent: Hsla,
    window: &mut Window,
    cx: &mut App,
) -> impl IntoElement {
    let id = id.into();
    let open = drop_slot_open::<T>(&id, cx);
    let target = if open { px(DROP_GAP) } else { px(0.0) };
    let height = transition(
        (id.clone(), "drop-gap"),
        target,
        spec_transition(RESIZE),
        window,
        cx,
    );
    div()
        .id(id)
        .w_full()
        .h(height)
        .flex_none()
        .overflow_hidden()
        .flex()
        .items_center()
        .when(height > px(1.0), |this| {
            this.child(div().w_full().h(px(6.0)).rounded_full().bg(accent))
        })
}

/// Caption that animates open to [`DROP_HINT`] while a drag of type `T` claims `id`.
pub fn drop_release_hint<T: 'static>(
    id: impl Into<ElementId>,
    label: impl Into<SharedString>,
    color: Hsla,
    window: &mut Window,
    cx: &mut App,
) -> impl IntoElement {
    let id = id.into();
    let label = label.into();
    let open = drop_slot_open::<T>(&id, cx);
    let target = if open { px(DROP_HINT) } else { px(0.0) };
    let height = transition(
        (id.clone(), "drop-hint"),
        target,
        spec_transition(RESIZE),
        window,
        cx,
    );
    div()
        .id(id)
        .w_full()
        .h(height)
        .flex_none()
        .overflow_hidden()
        .flex()
        .items_center()
        .justify_center()
        .text_xs()
        .font_weight(FontWeight::SEMIBOLD)
        .text_color(color)
        .when(height > px(1.0), |this| this.child(label))
}

/// Where a drop lands relative to the target row.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum DropPlacement {
    #[default]
    Onto,
    Before,
    After,
}

/// A drag source wrapping arbitrary content, with an optional grip handle.
#[derive(IntoElement)]
pub struct Draggable {
    id: ElementId,
    style: StyleRefinement,
    payload: ItemDrag,
    disabled: bool,
    show_handle: bool,
    dragging: bool,
    children: Vec<AnyElement>,
}

impl Draggable {
    pub fn new(id: impl Into<ElementId>, payload: ItemDrag) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            payload,
            disabled: false,
            show_handle: true,
            dragging: false,
            children: Vec::new(),
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn show_handle(mut self, show: bool) -> Self {
        self.show_handle = show;
        self
    }

    /// Host-owned drag flag. The source keeps its chrome either way.
    pub fn dragging(mut self, dragging: bool) -> Self {
        self.dragging = dragging;
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for Draggable {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Draggable {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Draggable {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let payload = self.payload.clone();
        let disabled = self.disabled;
        let show_handle = self.show_handle;
        let _ = self.dragging;

        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .px(px(10.0))
            .py(px(8.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .when(!disabled, |this| {
                this.cursor(CursorStyle::OpenHand)
                    .hover(|s| s.bg(theme.muted.opacity(0.45)))
            });
        root.style().refine(&self.style);

        let root = root
            .when(show_handle, |this| {
                this.child(
                    DragHandle::new(ElementId::Name(
                        format!("drag-handle-{}", payload.item_id).into(),
                    ))
                    .disabled(disabled),
                )
            })
            .children(self.children);

        if disabled {
            root.into_any_element()
        } else {
            root.on_drag(payload, move |drag, _, _, cx| {
                arm_drag::<ItemDrag>(drag.item_id.clone(), cx);
                let label = drag.label.clone();
                cx.new(|_| ItemDragPreview::new(label).show_handle(show_handle))
            })
            .on_drag_move(|_: &DragMoveEvent<ItemDrag>, _, cx| clear_drop_slot::<ItemDrag>(cx))
            .into_any_element()
        }
    }
}

/// A typed drop surface for [`ItemDrag`] and/or platform file paths.
#[derive(IntoElement)]
pub struct DropTarget {
    id: ElementId,
    style: StyleRefinement,
    disabled: bool,
    /// When set, overrides automatic drag-over highlighting.
    highlighted: Option<bool>,
    accept_items: bool,
    accept_files: bool,
    can_accept: Option<CanAccept>,
    on_item_drop: Option<OnItemDrop>,
    on_files: Option<OnFilesDrop>,
    children: Vec<AnyElement>,
}

impl DropTarget {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            disabled: false,
            highlighted: None,
            accept_items: true,
            accept_files: false,
            can_accept: None,
            on_item_drop: None,
            on_files: None,
            children: Vec::new(),
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Force the highlight chrome on/off (gallery / host-driven state).
    pub fn highlighted(mut self, highlighted: bool) -> Self {
        self.highlighted = Some(highlighted);
        self
    }

    pub fn accept_items(mut self, accept: bool) -> Self {
        self.accept_items = accept;
        self
    }

    pub fn accept_files(mut self, accept: bool) -> Self {
        self.accept_files = accept;
        self
    }

    pub fn can_accept(
        mut self,
        f: impl Fn(&dyn Any, &mut Window, &mut App) -> bool + 'static,
    ) -> Self {
        self.can_accept = Some(Rc::new(f));
        self
    }

    pub fn on_item_drop(mut self, f: impl Fn(&ItemDrag, &mut Window, &mut App) + 'static) -> Self {
        self.on_item_drop = Some(Rc::new(f));
        self
    }

    pub fn on_files(mut self, f: impl Fn(&Vec<PathBuf>, &mut Window, &mut App) + 'static) -> Self {
        self.accept_files = true;
        self.on_files = Some(Rc::new(f));
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for DropTarget {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for DropTarget {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for DropTarget {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let radius_lg = cx.theme().radius_lg;
        let accent = cx.theme().accent;
        let border = cx.theme().border;
        let muted = cx.theme().muted;
        let forced = self.highlighted.unwrap_or(false);
        let accept_items = self.accept_items;
        let accept_files = self.accept_files;
        let can_accept = self.can_accept.clone();
        let group: SharedString = match &self.id {
            ElementId::Name(name) => format!("drop-target-{name}").into(),
            other => format!("drop-target-{other:?}").into(),
        };
        let item_hint = ElementId::Name(format!("drop-hint-item-{group}").into());
        let files_hint = ElementId::Name(format!("drop-hint-files-{group}").into());
        let wash = if forced {
            1.0
        } else {
            let item = if accept_items {
                drop_progress::<ItemDrag>(&item_hint, window, cx)
            } else {
                0.0
            };
            let files = if accept_files {
                drop_progress::<ExternalPaths>(&files_hint, window, cx)
            } else {
                0.0
            };
            item.max(files)
        };

        let mut root = div()
            .id(self.id.clone())
            .group(group.clone())
            .w_full()
            .rounded(radius_lg)
            .border_1()
            .border_dashed()
            .border_color(if forced {
                accent
            } else {
                motion::mix(border, accent, wash)
            })
            .bg(if forced {
                accent.opacity(0.12)
            } else {
                mix_drop_wash(muted.opacity(0.25), accent, wash)
            })
            .when(self.disabled, |this| this.opacity(0.5));
        root.style().refine(&self.style);

        let mut root = root.children(self.children);

        if self.disabled {
            return root.into_any_element();
        }

        if accept_items || accept_files {
            let can_accept_for_pred = can_accept.clone();
            root = root.can_drop(move |value: &dyn std::any::Any, window, cx| {
                if let Some(pred) = can_accept_for_pred.as_ref() {
                    return pred(value, window, cx);
                }
                if accept_items && value.downcast_ref::<ItemDrag>().is_some() {
                    return true;
                }
                if accept_files && value.downcast_ref::<ExternalPaths>().is_some() {
                    return true;
                }
                false
            });
        }

        let claim_item = item_hint.clone();
        let claim_files = files_hint.clone();
        root = root.on_mouse_move(move |_, _, cx| {
            if !cx.has_active_drag() {
                return;
            }
            if accept_items {
                claim_drop_slot::<ItemDrag>(claim_item.clone(), "", cx);
            }
            if accept_files {
                claim_drop_slot::<ExternalPaths>(claim_files.clone(), "", cx);
            }
        });

        if accept_items {
            root = root.child(drop_release_hint::<ItemDrag>(
                item_hint,
                "Release to drop",
                accent,
                window,
                cx,
            ));
        }
        if accept_files {
            root = root.child(drop_release_hint::<ExternalPaths>(
                files_hint,
                "Release to drop",
                accent,
                window,
                cx,
            ));
        }

        if let Some(on) = self.on_item_drop {
            root = root.on_drop(move |drag: &ItemDrag, window, cx| on(drag, window, cx));
        }

        if let Some(on) = self.on_files {
            root = root.on_drop(move |paths: &ExternalPaths, window, cx| {
                on(&paths.paths().to_vec(), window, cx)
            });
        }

        root.into_any_element()
    }
}

/// Apply an in-place reorder matching dnd-kit `arrayMove` semantics.
/// No-op when indices are equal or out of range.
pub fn reorder_vec<T>(items: &mut Vec<T>, from: usize, to: usize) {
    if from == to || from >= items.len() || to >= items.len() {
        return;
    }
    let item = items.remove(from);
    items.insert(to, item);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reorder_matches_array_move() {
        let mut items = vec!["a", "b", "c", "d"];
        reorder_vec(&mut items, 0, 2);
        assert_eq!(items, vec!["b", "c", "a", "d"]);
        reorder_vec(&mut items, 3, 0);
        assert_eq!(items, vec!["d", "b", "c", "a"]);
    }
}
