//! `VGrid` — SwiftUI's `LazyVGrid`: children chunked into rows sized by a
//! list of column rules (no web counterpart).

use gpui::{
    AnyElement, App, IntoElement, ParentElement, Pixels, RenderOnce, Styled as _, Window, div, px,
};

/// `GridItem` — one column rule for [`VGrid`].
#[derive(Clone, Copy, Debug)]
pub enum GridItem {
    /// Fixed width in pixels.
    Fixed(Pixels),
    /// Equal share of the remaining width (`flexible()`; min/max bounds are
    /// approximated by the flex layout).
    Flexible,
}

/// `LazyVGrid(columns:spacing:)` — children chunked into rows sized by the
/// column rules. Rows wrap onto the next line; the grid grows vertically, so
/// put it inside a [`ScrollView`](super::scroll_view::ScrollView) for long
/// content.
#[derive(IntoElement)]
pub struct VGrid {
    columns: Vec<GridItem>,
    spacing: Pixels,
    children: Vec<AnyElement>,
}

impl VGrid {
    pub fn new(columns: impl IntoIterator<Item = GridItem>) -> Self {
        Self {
            columns: columns.into_iter().collect(),
            spacing: px(8.),
            children: Vec::new(),
        }
    }

    /// Distance between rows and between columns. Defaults to 8px.
    pub fn spacing(mut self, spacing: Pixels) -> Self {
        self.spacing = spacing;
        self
    }
}

impl ParentElement for VGrid {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for VGrid {
    fn render(mut self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        let column_count = self.columns.len().max(1);
        let mut rows: Vec<AnyElement> = Vec::new();
        let mut children = std::mem::take(&mut self.children).into_iter();

        loop {
            let mut chunk = Vec::with_capacity(column_count);
            for _ in 0..column_count {
                if let Some(child) = children.next() {
                    chunk.push(child);
                } else {
                    break;
                }
            }
            if chunk.is_empty() {
                break;
            }

            let cells = chunk
                .into_iter()
                .enumerate()
                .map(|(ix, child)| {
                    let cell = match self.columns.get(ix % column_count) {
                        Some(GridItem::Fixed(width)) => div().w(*width).flex_none(),
                        _ => div().flex_1().min_w_0(),
                    };
                    cell.child(child)
                })
                .collect::<Vec<_>>();

            rows.push(
                div()
                    .flex()
                    .flex_row()
                    // `h_flex()` centers the row on the cross axis; kept because
                    // nothing here overrides it.
                    .items_center()
                    .gap(self.spacing)
                    .children(cells)
                    .into_any_element(),
            );
        }

        div().flex().flex_col().gap(self.spacing).children(rows)
    }
}
