//! Celestia table components — desktop counterparts of the web package's
//! `primitive/table.tsx` (HTML-style composition) and `composite/data-table`
//! (data-driven), informed by GetCat's hand-built `kv_table.rs` /
//! `ops_table.rs` and the upstream `crates/story` data-table examples.
//!
//! Two APIs, matching the two web components:
//!
//! 1. **HTML-style primitives** — [`Table`], [`TableHeader`], [`TableBody`],
//!    [`TableRow`], [`TableHead`], [`TableCell`], [`TableCaption`]: thin,
//!    themed composition elements, exactly like the web `table.tsx` import
//!    surface. Build any table by hand.
//!
//! 2. **[`DataTable`]** — an entity wrapping gpui-component's virtualized
//!    delegate table, driven by declarative columns + rows (and
//!    [`DataTable::set_rows`] for updates), so simple data tables need no
//!    custom [`TableDelegate`]. For virtualized / editable / sortable grids,
//!    implement [`TableDelegate`] and drive the gpui element directly.

use std::cell::RefCell;
use std::rc::Rc;

// Re-exported for advanced use (custom delegates, sorting, virtualization).
pub use gpui_kit::component::table::{
    Column, ColumnSort, DataTable as GpuiDataTable, TableDelegate, TableState,
};
pub use gpui_kit::component::table;
use gpui_kit::component::ActiveTheme;
use gpui_kit::{
    App, AppContext as _, Context, ElementId, Entity, InteractiveElement, IntoElement, ParentElement, Render,
    RenderOnce, SharedString, Styled, Window, div, px,
};

// ---------------------------------------------------------------------------
// HTML-style primitives (web primitive/table.tsx parity)
// ---------------------------------------------------------------------------

/// `<table>` — the rounded, bordered container everything else sits in.
#[derive(IntoElement)]
pub struct Table {
    id: ElementId,
    children: Vec<gpui_kit::AnyElement>,
}

impl Table {
    pub fn new() -> Self {
        Self {
            id: gpui_kit::ElementId::Name("table".into()),
            children: Vec::new(),
        }
    }

    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = id.into();
        self
    }
}

impl Default for Table {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for Table {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui_kit::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for Table {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .id(self.id)
            .w_full()
            .text_sm()
            .border_1()
            .border_color(cx.theme().border)
            .rounded(cx.theme().radius)
            .overflow_hidden()
            .children(self.children)
    }
}

/// `<thead>` — header block with the muted fill.
#[derive(IntoElement)]
pub struct TableHeader {
    children: Vec<gpui_kit::AnyElement>,
}

impl TableHeader {
    pub fn new() -> Self {
        Self { children: Vec::new() }
    }
}

impl Default for TableHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableHeader {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui_kit::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .w_full()
            .bg(cx.theme().muted)
            .border_b_1()
            .border_color(cx.theme().border)
            .children(self.children)
    }
}

/// `<tbody>` — body block.
#[derive(IntoElement)]
pub struct TableBody {
    children: Vec<gpui_kit::AnyElement>,
}

impl TableBody {
    pub fn new() -> Self {
        Self { children: Vec::new() }
    }
}

impl Default for TableBody {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableBody {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui_kit::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableBody {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        div().w_full().children(self.children)
    }
}

/// `<tr>` — one row; tinted on hover like the web row hover state.
#[derive(IntoElement)]
pub struct TableRow {
    id: ElementId,
    children: Vec<gpui_kit::AnyElement>,
}

impl TableRow {
    pub fn new() -> Self {
        Self {
            id: gpui_kit::ElementId::Name("table-row".into()),
            children: Vec::new(),
        }
    }

    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = id.into();
        self
    }
}

impl Default for TableRow {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableRow {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui_kit::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableRow {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .id(self.id)
            .w_full()
            .flex()
            .border_b_1()
            .border_color(cx.theme().border)
            .hover(|style| style.bg(cx.theme().muted))
            .children(self.children)
    }
}

/// `<th>` — header cell: muted foreground, medium weight.
#[derive(IntoElement)]
pub struct TableHead {
    children: Vec<gpui_kit::AnyElement>,
}

impl TableHead {
    pub fn new() -> Self {
        Self { children: Vec::new() }
    }
}

impl Default for TableHead {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableHead {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui_kit::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableHead {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .flex_1()
            .min_w_0()
            .px_2()
            .py_2()
            .text_xs()
            .font_weight(gpui_kit::FontWeight::MEDIUM)
            .text_color(cx.theme().muted_foreground)
            .children(self.children)
    }
}

/// `<td>` — body cell.
#[derive(IntoElement)]
pub struct TableCell {
    children: Vec<gpui_kit::AnyElement>,
}

impl TableCell {
    pub fn new() -> Self {
        Self { children: Vec::new() }
    }
}

impl Default for TableCell {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableCell {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui_kit::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableCell {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        div()
            .flex_1()
            .min_w_0()
            .px_2()
            .py_2()
            .truncate()
            .children(self.children)
    }
}

/// `<caption>` — caption below the table.
#[derive(IntoElement)]
pub struct TableCaption {
    children: Vec<gpui_kit::AnyElement>,
}

impl TableCaption {
    pub fn new() -> Self {
        Self { children: Vec::new() }
    }
}

impl Default for TableCaption {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableCaption {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui_kit::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableCaption {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .mt_3()
            .text_xs()
            .text_color(cx.theme().muted_foreground)
            .children(self.children)
    }
}

// ---------------------------------------------------------------------------
// DataTable — declarative delegate table (web composite/data-table role)
// ---------------------------------------------------------------------------

/// One column definition: header name + optional fixed width.
#[derive(Clone, Debug)]
pub struct TableColumn {
    name: SharedString,
    width: Option<f32>,
}

impl TableColumn {
    pub fn new(name: impl Into<SharedString>) -> Self {
        Self {
            name: name.into(),
            width: None,
        }
    }

    /// Pin the column width; unpinned columns flex with the table.
    pub fn width(mut self, width: f32) -> Self {
        self.width = Some(width);
        self
    }
}

/// The delegate payload: columns + shared, mutable rows.
struct TableData {
    columns: Vec<TableColumn>,
    rows: Rc<RefCell<Vec<Vec<SharedString>>>>,
}

impl TableDelegate for TableData {
    fn columns_count(&self, _: &App) -> usize {
        self.columns.len()
    }

    fn rows_count(&self, _: &App) -> usize {
        self.rows.borrow().len()
    }

    fn column(&self, col_ix: usize, _: &App) -> Column {
        let column = self
            .columns
            .get(col_ix)
            .expect("table column index in range");
        let mut col = Column::new(format!("col-{col_ix}"), column.name.clone());
        if let Some(width) = column.width {
            col = col.width(px(width));
        }
        col
    }

    fn render_td(
        &mut self,
        row_ix: usize,
        col_ix: usize,
        _: &mut Window,
        _: &mut Context<TableState<Self>>,
    ) -> impl IntoElement {
        let text = self
            .rows
            .borrow()
            .get(row_ix)
            .and_then(|row| row.get(col_ix))
            .cloned()
            .unwrap_or_default();

        div().px_2().flex().items_center().child(text)
    }

    fn cell_text(&self, row_ix: usize, col_ix: usize, _: &App) -> String {
        self.rows
            .borrow()
            .get(row_ix)
            .and_then(|row| row.get(col_ix))
            .map(|cell| cell.to_string())
            .unwrap_or_default()
    }
}

/// A striped, bordered, virtualized data table driven by declarative columns
/// + rows (the web `data-table` composite role).
///
/// Entity usage: `let table = cx.new(|cx| DataTable::new(columns, rows, window, cx));`
/// then render `table.clone()` and push updates with
/// `table.update(cx, |t, cx| t.set_rows(rows, cx))`.
pub struct DataTable {
    state: Entity<TableState<TableData>>,
    rows: Rc<RefCell<Vec<Vec<SharedString>>>>,
}

impl DataTable {
    pub fn new(
        columns: impl IntoIterator<Item = TableColumn>,
        rows: Vec<Vec<SharedString>>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> Self {
        let rows = Rc::new(RefCell::new(rows));
        let state = cx.new(|cx| {
            TableState::new(
                TableData {
                    columns: columns.into_iter().collect(),
                    rows: rows.clone(),
                },
                window,
                cx,
            )
        });
        Self { state, rows }
    }

    /// Two-column convenience in the spirit of GetCat's `kv_table.rs`:
    /// Key / Value rows.
    pub fn from_key_value(
        pairs: impl IntoIterator<Item = (impl Into<SharedString>, impl Into<SharedString>)>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> Self {
        let rows: Vec<Vec<SharedString>> = pairs
            .into_iter()
            .map(|(key, value)| vec![key.into(), value.into()])
            .collect();
        Self::new(
            [TableColumn::new("Key").width(160.), TableColumn::new("Value")],
            rows,
            window,
            cx,
        )
    }

    /// Replace the row data and refresh the table layout.
    pub fn set_rows(&self, rows: Vec<Vec<SharedString>>, cx: &mut App) {
        self.rows.replace(rows);
        self.state.update(cx, |state, cx| state.refresh(cx));
    }
}

impl Render for DataTable {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        // Same sizing contract as the upstream story: the table fills a
        // flexing, min-h-0 wrapper (content-height when the parent is auto).
        div().flex_1().min_h_0().child(
            GpuiDataTable::new(&self.state).stripe(true).bordered(true),
        )
    }
}
