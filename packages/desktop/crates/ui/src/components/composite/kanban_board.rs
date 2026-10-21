//! Kanban board — columns of cards with selection and drag-and-drop.
//!
//! Cards emit [`KanbanCardDrag`] via GPUI `on_drag`. Columns and cards accept
//! drops of the same board and call [`KanbanDrop`] so the host can update its
//! model (see [`apply_kanban_drop`]).

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, AppContext as _, ClickEvent, Context, CursorStyle, DragMoveEvent, ElementId,
    FontWeight, InteractiveElement as _, IntoElement, ParentElement, Refineable as _, Render,
    RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement, Styled, Window,
    div, px,
};

use crate::components::composite::dnd::{
    arm_drag, claim_drop_slot, clear_drop_slot, drag_insertion_line, drop_progress,
    drop_release_hint, mix_drop_wash,
};
use crate::motion;
use crate::components::primitive::drag_handle::DragHandle;
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;
type OnKanbanDrop = Rc<dyn Fn(&KanbanDrop, &mut Window, &mut App) + 'static>;

/// Payload carried while a kanban card is dragged.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct KanbanCardDrag {
    pub board_id: SharedString,
    pub column_id: SharedString,
    pub card_id: SharedString,
    pub index: usize,
    pub label: SharedString,
}

impl KanbanCardDrag {
    pub fn new(
        board_id: impl Into<SharedString>,
        column_id: impl Into<SharedString>,
        card_id: impl Into<SharedString>,
        index: usize,
        label: impl Into<SharedString>,
    ) -> Self {
        Self {
            board_id: board_id.into(),
            column_id: column_id.into(),
            card_id: card_id.into(),
            index,
            label: label.into(),
        }
    }
}

/// Drop destination described to the host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct KanbanDrop {
    pub drag: KanbanCardDrag,
    pub target_column_id: SharedString,
    /// Insert before this index in the target column. `None` appends.
    pub target_index: Option<usize>,
}

/// Move a card between (or within) columns.
///
/// `columns` is `(column_id, cards)`. `id_of` returns each card's stable id.
pub fn apply_kanban_drop<C>(
    columns: &mut [(SharedString, Vec<C>)],
    drop: &KanbanDrop,
    mut id_of: impl FnMut(&C) -> SharedString,
) {
    let Some(from_col) = columns
        .iter()
        .position(|(id, _)| *id == drop.drag.column_id)
    else {
        return;
    };
    let Some(from_idx) = columns[from_col]
        .1
        .iter()
        .position(|c| id_of(c) == drop.drag.card_id)
    else {
        return;
    };
    let Some(to_col) = columns
        .iter()
        .position(|(id, _)| *id == drop.target_column_id)
    else {
        return;
    };

    // Same card, same slot — nothing to do.
    if from_col == to_col {
        if let Some(target) = drop.target_index {
            if target == from_idx || target == from_idx + 1 {
                return;
            }
        }
    }

    let card = columns[from_col].1.remove(from_idx);
    let mut insert_at = match drop.target_index {
        Some(i) => {
            if from_col == to_col && from_idx < i {
                i - 1
            } else {
                i
            }
        }
        None => columns[to_col].1.len(),
    };
    insert_at = insert_at.min(columns[to_col].1.len());
    columns[to_col].1.insert(insert_at, card);
}

/// A card inside a [`KanbanColumn`].
#[derive(IntoElement)]
pub struct KanbanCard {
    id: ElementId,
    title: SharedString,
    body: Option<SharedString>,
    meta: Option<SharedString>,
    selected: bool,
    dragging: bool,
    show_handle: bool,
    drag: Option<KanbanCardDrag>,
    on_click: Option<OnClick>,
    on_card_drop: Option<OnKanbanDrop>,
    trailing: Option<AnyElement>,
}

impl KanbanCard {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            body: None,
            meta: None,
            selected: false,
            dragging: false,
            show_handle: true,
            drag: None,
            on_click: None,
            on_card_drop: None,
            trailing: None,
        }
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    pub fn meta(mut self, meta: impl Into<SharedString>) -> Self {
        self.meta = Some(meta.into());
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    /// Host-owned drag flag. The card keeps its chrome either way.
    pub fn dragging(mut self, dragging: bool) -> Self {
        self.dragging = dragging;
        self
    }

    pub fn show_handle(mut self, show: bool) -> Self {
        self.show_handle = show;
        self
    }

    /// Enable dragging with a typed [`KanbanCardDrag`] payload.
    pub fn drag(mut self, drag: KanbanCardDrag) -> Self {
        self.drag = Some(drag);
        self
    }

    /// Convenience: build the drag payload from ids (label defaults to title).
    pub fn draggable(
        mut self,
        board_id: impl Into<SharedString>,
        column_id: impl Into<SharedString>,
        card_id: impl Into<SharedString>,
        index: usize,
    ) -> Self {
        let label = self.title.clone();
        self.drag = Some(KanbanCardDrag::new(
            board_id, column_id, card_id, index, label,
        ));
        self
    }

    pub fn trailing(mut self, trailing: impl IntoElement) -> Self {
        self.trailing = Some(trailing.into_any_element());
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }

    /// Accept another card dropped onto this row (insert before this card).
    pub fn on_card_drop(
        mut self,
        f: impl Fn(&KanbanDrop, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_card_drop = Some(Rc::new(f));
        self
    }
}

/// Cursor copy of a kanban card. Matches the source chrome.
struct KanbanCardPreview {
    title: SharedString,
    body: Option<SharedString>,
    meta: Option<SharedString>,
    selected: bool,
    show_handle: bool,
}

impl Render for KanbanCardPreview {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .w(px(240.0))
            .flex()
            .flex_col()
            .gap(px(6.0))
            .p(px(10.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(if self.selected {
                theme.accent.opacity(0.5)
            } else {
                theme.border
            })
            .bg(theme.popover)
            .shadow_md()
            .child(
                div()
                    .flex()
                    .flex_row()
                    .items_start()
                    .gap(px(8.0))
                    .when(self.show_handle, |this| {
                        this.child(DragHandle::new("kanban-preview-handle"))
                    })
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.foreground)
                            .child(self.title.clone()),
                    ),
            )
            .when_some(self.body.clone(), |this, body| {
                this.child(
                    div()
                        .text_xs()
                        .text_color(theme.muted_foreground)
                        .child(body),
                )
            })
            .when_some(self.meta.clone(), |this, meta| {
                this.child(
                    div()
                        .text_xs()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.muted_foreground)
                        .child(meta),
                )
            })
    }
}

impl RenderOnce for KanbanCard {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let accent = cx.theme().accent;
        let border = cx.theme().border;
        let popover = cx.theme().popover;
        let radius = cx.theme().radius;
        let foreground = cx.theme().foreground;
        let muted_foreground = cx.theme().muted_foreground;
        let muted = cx.theme().muted;
        let board_id = self.drag.as_ref().map(|d| d.board_id.clone());
        let target_column = self.drag.as_ref().map(|d| d.column_id.clone());
        let target_index = self.drag.as_ref().map(|d| d.index);
        let self_card_id = self.drag.as_ref().map(|d| d.card_id.clone());
        let _ = self.dragging;

        let group: SharedString = format!(
            "kcard-{}",
            self_card_id.clone().unwrap_or_else(|| "card".into())
        )
        .into();
        let card_key = self_card_id.clone().unwrap_or_else(|| "card".into());
        let slot_id = ElementId::Name(format!("kline-{card_key}").into());
        let wash = drop_progress::<KanbanCardDrag>(&slot_id, window, cx);
        let resting_border = if self.selected {
            accent.opacity(0.5)
        } else {
            border
        };

        let mut face = div()
            .id(ElementId::Name(format!("kface-{card_key}").into()))
            .w_full()
            .flex()
            .flex_col()
            .gap(px(6.0))
            .p(px(10.0))
            .rounded(radius)
            .border_1()
            .border_color(motion::mix(resting_border, accent, wash))
            .bg(mix_drop_wash(popover, accent, wash));

        if self.drag.is_some() {
            let face_board = board_id.clone();
            let face_card = self_card_id.clone();
            face = face
                .cursor(CursorStyle::OpenHand)
                .can_drop(move |value: &dyn std::any::Any, _, _| {
                    value.downcast_ref::<KanbanCardDrag>().is_some_and(|drag| {
                        face_board
                            .as_ref()
                            .is_some_and(|board| drag.board_id == *board)
                            && face_card.as_ref().is_some_and(|card| drag.card_id != *card)
                    })
                });
        } else {
            face = face
                .cursor_pointer()
                .hover(|s| s.bg(muted.opacity(0.5)));
        }

        let header = div()
            .flex()
            .flex_row()
            .items_start()
            .justify_between()
            .gap(px(8.0))
            .when(self.show_handle && self.drag.is_some(), |this| {
                this.child(DragHandle::new(ElementId::Name(
                    format!("kanban-handle-{}", self_card_id.clone().unwrap_or_default()).into(),
                )))
            })
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_sm()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(foreground)
                    .child(self.title.clone()),
            )
            .when_some(self.trailing, |this, t| this.child(t));

        face = face
            .child(header)
            .when_some(self.body.clone(), |this, body| {
                this.child(
                    div()
                        .text_xs()
                        .text_color(muted_foreground)
                        .child(body),
                )
            })
            .when_some(self.meta.clone(), |this, meta| {
                this.child(
                    div()
                        .text_xs()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(muted_foreground)
                        .child(meta),
                )
            })
            .when_some(self.on_click, |this, on| {
                this.on_click(move |e, window, cx| on(e, window, cx))
            });

        let mut root = div()
            .id(self.id.clone())
            .group(group.clone())
            .w_full()
            .flex()
            .flex_col();

        if self.drag.is_some() {
            root = root.child(drag_insertion_line::<KanbanCardDrag>(
                slot_id.clone(),
                accent,
                window,
                cx,
            ));
        }

        root = root.child(face);

        if let Some(payload) = self.drag.clone() {
            let board_for_can = payload.board_id.clone();
            let card_for_can = payload.card_id.clone();
            let preview_title = self.title.clone();
            let preview_body = self.body.clone();
            let preview_meta = self.meta.clone();
            let preview_selected = self.selected;
            let preview_handle = self.show_handle;
            let claim_slot = slot_id.clone();
            let claim_card = card_for_can.clone();
            root = root
                .on_drag(payload, move |drag, _, _, cx| {
                    arm_drag::<KanbanCardDrag>(drag.card_id.clone(), cx);
                    let title = preview_title.clone();
                    let body = preview_body.clone();
                    let meta = preview_meta.clone();
                    cx.new(move |_| KanbanCardPreview {
                        title,
                        body,
                        meta,
                        selected: preview_selected,
                        show_handle: preview_handle,
                    })
                })
                .on_drag_move(|_: &DragMoveEvent<KanbanCardDrag>, _, cx| {
                    clear_drop_slot::<KanbanCardDrag>(cx);
                })
                .on_mouse_move(move |_, _, cx| {
                    if cx.has_active_drag() {
                        claim_drop_slot::<KanbanCardDrag>(claim_slot.clone(), &claim_card, cx);
                    }
                })
                .can_drop({
                    let board = board_for_can.clone();
                    let card = card_for_can.clone();
                    move |value: &dyn std::any::Any, _, _| {
                        value
                            .downcast_ref::<KanbanCardDrag>()
                            .is_some_and(|d| d.board_id == board && d.card_id != card)
                    }
                });
        }

        if let Some(on) = self.on_card_drop {
            if let (Some(board_id), Some(column_id), Some(index)) =
                (board_id, target_column, target_index)
            {
                root = root.on_drop(move |drag: &KanbanCardDrag, window, cx| {
                    if drag.board_id != board_id {
                        return;
                    }
                    on(
                        &KanbanDrop {
                            drag: drag.clone(),
                            target_column_id: column_id.clone(),
                            target_index: Some(index),
                        },
                        window,
                        cx,
                    );
                    cx.stop_propagation();
                });
            }
        }

        root
    }
}

/// One column on a [`KanbanBoard`].
#[derive(IntoElement)]
pub struct KanbanColumn {
    id: ElementId,
    column_id: SharedString,
    board_id: Option<SharedString>,
    title: SharedString,
    count: Option<usize>,
    on_card_drop: Option<OnKanbanDrop>,
    cards: Vec<AnyElement>,
}

impl KanbanColumn {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        let id = id.into();
        let column_id: SharedString = match &id {
            ElementId::Name(name) => name.clone(),
            ElementId::NamedInteger(name, _) => name.clone(),
            other => format!("{other:?}").into(),
        };
        Self {
            id,
            column_id,
            board_id: None,
            title: title.into(),
            count: None,
            on_card_drop: None,
            cards: Vec::new(),
        }
    }

    /// Stable column id used in [`KanbanDrop`] (defaults to the element id name).
    pub fn column_id(mut self, column_id: impl Into<SharedString>) -> Self {
        self.column_id = column_id.into();
        self
    }

    /// Board id this column belongs to — required for drop acceptance.
    pub fn board_id(mut self, board_id: impl Into<SharedString>) -> Self {
        self.board_id = Some(board_id.into());
        self
    }

    pub fn count(mut self, count: usize) -> Self {
        self.count = Some(count);
        self
    }

    pub fn card(mut self, card: impl IntoElement) -> Self {
        self.cards.push(card.into_any_element());
        self
    }

    /// Drop onto the column body (empty area / append).
    pub fn on_card_drop(
        mut self,
        f: impl Fn(&KanbanDrop, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_card_drop = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for KanbanColumn {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let accent = cx.theme().accent;
        let border = cx.theme().border;
        let radius = cx.theme().radius;
        let popover = cx.theme().popover;
        let foreground = cx.theme().foreground;
        let muted_foreground = cx.theme().muted_foreground;
        let muted = cx.theme().muted;
        let transparent = cx.theme().transparent;
        let count = self.count.unwrap_or(self.cards.len());
        let board_id = self.board_id.clone();
        let column_id = self.column_id.clone();
        let accepts_drops = board_id.is_some() && self.on_card_drop.is_some();
        let col_group: SharedString = format!("kcol-{}", self.column_id).into();
        let hint_id = ElementId::Name(format!("{}-hint", self.column_id).into());
        let column_wash = if accepts_drops {
            drop_progress::<KanbanCardDrag>(&hint_id, window, cx)
        } else {
            0.0
        };

        let mut body = div()
            .id(ElementId::Name(format!("{}-body", self.column_id).into()))
            .group(col_group.clone())
            .flex()
            .flex_col()
            .gap(px(8.0))
            .min_h(px(88.0))
            .w_full()
            .p(px(4.0))
            .rounded(radius)
            .border_1()
            .border_dashed()
            .border_color(motion::mix(transparent, accent, column_wash))
            .bg(mix_drop_wash(transparent, accent, column_wash))
            .children(self.cards);

        if accepts_drops {
            let board = board_id.clone().unwrap();
            let col = column_id.clone();
            let claim_hint = hint_id.clone();
            body = body
                .can_drop({
                    let board = board.clone();
                    move |value: &dyn std::any::Any, _, _| {
                        value
                            .downcast_ref::<KanbanCardDrag>()
                            .is_some_and(|d| d.board_id == board)
                    }
                })
                .on_mouse_move(move |_, _, cx| {
                    if cx.has_active_drag() {
                        claim_drop_slot::<KanbanCardDrag>(claim_hint.clone(), "", cx);
                    }
                })
                .when_some(self.on_card_drop, |this, on| {
                    this.on_drop(move |drag: &KanbanCardDrag, window, cx| {
                        if drag.board_id != board {
                            return;
                        }
                        // Ignore drops that land on a card child — cards handle
                        // insert-before; column body appends.
                        on(
                            &KanbanDrop {
                                drag: drag.clone(),
                                target_column_id: col.clone(),
                                target_index: None,
                            },
                            window,
                            cx,
                        );
                    })
                })
                .child(drop_release_hint::<KanbanCardDrag>(
                    hint_id,
                    "Drop here",
                    accent,
                    window,
                    cx,
                ));
        }

        div()
            .id(self.id)
            .w(px(260.0))
            .flex_none()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .p(px(10.0))
            .rounded(radius)
            .bg(muted.opacity(0.35))
            .child(
                div()
                    .flex()
                    .flex_row()
                    .items_center()
                    .justify_between()
                    .child(
                        div()
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(foreground)
                            .child(self.title),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(muted_foreground)
                            .child(format!("{count}")),
                    ),
            )
            .child(body)
    }
}

/// A horizontal board of [`KanbanColumn`]s.
#[derive(IntoElement)]
pub struct KanbanBoard {
    id: ElementId,
    style: StyleRefinement,
    columns: Vec<AnyElement>,
}

impl KanbanBoard {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            columns: Vec::new(),
        }
    }

    pub fn column(mut self, column: impl IntoElement) -> Self {
        self.columns.push(column.into_any_element());
        self
    }
}

impl Styled for KanbanBoard {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for KanbanBoard {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_start()
            .gap(px(12.0))
            .overflow_x_scroll();
        // id above enables overflow_x_scroll via StatefulInteractiveElement.
        root.style().refine(&self.style);
        root.children(self.columns)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Clone, Debug, PartialEq, Eq)]
    struct Card {
        id: SharedString,
        title: &'static str,
    }

    fn cols() -> Vec<(SharedString, Vec<Card>)> {
        vec![
            (
                "todo".into(),
                vec![
                    Card {
                        id: "a".into(),
                        title: "A",
                    },
                    Card {
                        id: "b".into(),
                        title: "B",
                    },
                ],
            ),
            (
                "doing".into(),
                vec![Card {
                    id: "c".into(),
                    title: "C",
                }],
            ),
            ("done".into(), vec![]),
        ]
    }

    #[test]
    fn moves_across_columns() {
        let mut columns = cols();
        apply_kanban_drop(
            &mut columns,
            &KanbanDrop {
                drag: KanbanCardDrag::new("board", "todo", "a", 0, "A"),
                target_column_id: "doing".into(),
                target_index: Some(0),
            },
            |c| c.id.clone(),
        );
        assert_eq!(columns[0].1.len(), 1);
        assert_eq!(columns[1].1[0].id.as_ref(), "a");
        assert_eq!(columns[1].1[1].id.as_ref(), "c");
    }

    #[test]
    fn appends_to_empty_column() {
        let mut columns = cols();
        apply_kanban_drop(
            &mut columns,
            &KanbanDrop {
                drag: KanbanCardDrag::new("board", "doing", "c", 0, "C"),
                target_column_id: "done".into(),
                target_index: None,
            },
            |c| c.id.clone(),
        );
        assert!(columns[1].1.is_empty());
        assert_eq!(columns[2].1[0].id.as_ref(), "c");
    }

    #[test]
    fn reorders_within_column() {
        let mut columns = cols();
        apply_kanban_drop(
            &mut columns,
            &KanbanDrop {
                drag: KanbanCardDrag::new("board", "todo", "a", 0, "A"),
                target_column_id: "todo".into(),
                target_index: Some(2),
            },
            |c| c.id.clone(),
        );
        assert_eq!(
            columns[0]
                .1
                .iter()
                .map(|c| c.id.as_ref())
                .collect::<Vec<_>>(),
            vec!["b", "a"]
        );
    }
}
