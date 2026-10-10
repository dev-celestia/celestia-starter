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

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use crate::theme::ActiveTheme as _;
use gpui_base::motion::transition;
// Re-exported for advanced use (custom delegates, sorting, virtualization).
use gpui::{
    App, AppContext as _, Context, ElementId, Entity, InteractiveElement, IntoElement,
    ParentElement, Render, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled,
    Window, div, px,
};
pub use gpui_component::table;
pub use gpui_component::table::{
    Column, ColumnSort, DataTable as GpuiDataTable, TableDelegate, TableState,
};

use crate::motion;

// ---------------------------------------------------------------------------
// HTML-style primitives (web primitive/table.tsx parity)
// ---------------------------------------------------------------------------

/// `<table>` — the rounded, bordered container everything else sits in.
#[derive(IntoElement)]
pub struct Table {
    id: ElementId,
    children: Vec<gpui::AnyElement>,
}

impl Table {
    pub fn new() -> Self {
        Self {
            id: gpui::ElementId::Name("table".into()),
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
    fn extend(&mut self, children: impl IntoIterator<Item = gpui::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for Table {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        // Web: `w-full caption-bottom text-xs` on the `<table>`, inside a
        // separate `relative w-full overflow-x-auto` wrapper. The desktop has
        // no `<table>` element to split the two across, so this carries the
        // wrapper's chrome (border + radius + clip) as well as the table's type
        // step. That outer chrome is the one deliberate addition here; every
        // type and spacing value below is the web's.
        div()
            .id(self.id)
            .w_full()
            .text_xs()
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
    children: Vec<gpui::AnyElement>,
}

impl TableHeader {
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }
}

impl Default for TableHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableHeader {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        // Web `<thead>` is `[&_tr]:border-b` and nothing else — the header row
        // is unfilled. The desktop used to paint `bg(muted)` here, which reads
        // as a banded header the web does not have.
        div()
            .w_full()
            .border_b_1()
            .border_color(cx.theme().border)
            .children(self.children)
    }
}

/// `<tbody>` — body block.
#[derive(IntoElement)]
pub struct TableBody {
    children: Vec<gpui::AnyElement>,
}

impl TableBody {
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }
}

impl Default for TableBody {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableBody {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableBody {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        div().w_full().children(self.children)
    }
}

/// `<tr>` — one row; tinted on hover like the web row hover state.
///
/// The web row is `border-b transition-colors hover:bg-muted/50
/// data-[state=selected]:bg-muted`, so both the hover tint *and* the selected
/// tint fade over 150ms on `--ease-out` rather than snapping.
///
/// The fade needs a per-row key, and [`TableRow::new`]'s default id is the same
/// for every row in a table — keying a transition on it would drive all of them
/// together. The fade is therefore enabled only when the caller supplies its
/// own [`TableRow::id`]; rows left on the default id keep the instant
/// `.hover(...)` tint, which is the old behaviour and is at least correct per
/// row.
#[derive(IntoElement)]
pub struct TableRow {
    id: ElementId,
    /// True once the caller supplies a unique id — see the type docs.
    keyed: bool,
    selected: bool,
    children: Vec<gpui::AnyElement>,
}

impl TableRow {
    pub fn new() -> Self {
        Self {
            id: gpui::ElementId::Name("table-row".into()),
            keyed: false,
            selected: false,
            children: Vec::new(),
        }
    }

    /// Give the row a unique id. This is also what opts the row into the
    /// animated hover fade.
    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = id.into();
        self.keyed = true;
        self
    }

    /// Web `data-[state=selected]` — a full `bg-muted` fill.
    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }
}

impl Default for TableRow {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableRow {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableRow {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let (muted, transparent, border) = {
            let theme = cx.theme();
            (theme.muted, theme.transparent, theme.border)
        };
        let hover_fill = muted.opacity(0.5);

        let mut el = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .items_center()
            .border_b_1()
            .border_color(border);

        if self.keyed {
            let state = window.use_keyed_state(self.id.clone(), cx, |_, _| Cell::new(false));
            let hovered = state.read(cx).get();
            // `data-[state=selected]:bg-muted` is written after
            // `hover:bg-muted/50` in the web class list, so selection wins over
            // hover; the hover blend is suppressed rather than layered.
            let select_t = transition(
                (self.id.clone(), "selected"),
                if self.selected { 1.0 } else { 0.0 },
                motion::hover_transition(),
                window,
                cx,
            );
            let hover_t = transition(
                (self.id.clone(), "hover"),
                if hovered && !self.selected { 1.0 } else { 0.0 },
                motion::hover_transition(),
                window,
                cx,
            );
            let fill = motion::mix(
                motion::mix(transparent, muted, select_t),
                hover_fill,
                hover_t,
            );
            let state_hover = state.clone();
            el = el.bg(fill).on_hover(move |hovered, _, cx| {
                if state_hover.read(cx).get() == *hovered {
                    return;
                }
                state_hover.update(cx, |flag, cx| {
                    flag.set(*hovered);
                    cx.notify();
                });
            });
        } else {
            let base = if self.selected { muted } else { transparent };
            el = el.bg(base).hover(move |style| style.bg(hover_fill));
        }

        el.children(self.children)
    }
}

/// `<th>` — header cell. Web: `h-10 px-2 font-medium whitespace-nowrap
/// text-foreground` (the type step comes from the table's `text-xs`).
#[derive(IntoElement)]
pub struct TableHead {
    children: Vec<gpui::AnyElement>,
}

impl TableHead {
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }
}

impl Default for TableHead {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableHead {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableHead {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .flex_1()
            .min_w_0()
            .h(px(40.))
            .px(px(8.))
            .flex()
            .items_center()
            .whitespace_nowrap()
            .text_xs()
            .font_weight(gpui::FontWeight::MEDIUM)
            .text_color(cx.theme().foreground)
            .children(self.children)
    }
}

/// Row density for [`TableCell`] (web `size` prop).
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum TableCellSize {
    /// 8px on both axes (web `p-2`).
    #[default]
    Default,
    /// 8px horizontal, 6px vertical (web `sm` → `py-1.5`). The web extracts only
    /// the vertical axis, so this is a height step and nothing else.
    Small,
}

/// `<td>` — body cell. Web base is `p-2 align-middle whitespace-nowrap`.
#[derive(IntoElement)]
pub struct TableCell {
    size: TableCellSize,
    mono: bool,
    children: Vec<gpui::AnyElement>,
}

impl TableCell {
    pub fn new() -> Self {
        Self {
            size: TableCellSize::default(),
            mono: false,
            children: Vec::new(),
        }
    }

    /// Set the row density (web `size="sm"`).
    pub fn size(mut self, size: TableCellSize) -> Self {
        self.size = size;
        self
    }

    /// Render in the monospace stack — ids, hashes, tokens, ports (web `mono`).
    pub fn mono(mut self, mono: bool) -> Self {
        self.mono = mono;
        self
    }
}

impl Default for TableCell {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableCell {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableCell {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let pad_y = match self.size {
            TableCellSize::Default => px(8.),
            TableCellSize::Small => px(6.),
        };
        let mut el = div()
            .flex_1()
            .min_w_0()
            .px(px(8.))
            .py(pad_y)
            .flex()
            .items_center()
            .whitespace_nowrap()
            .text_color(cx.theme().foreground);
        if self.mono {
            el = el.font_family(cx.theme().mono_font_family.clone());
        }
        // No `text_sm` here: the web lets the table's `text-xs` through to the
        // cell rather than restating a size, and the desktop used to override it
        // one step up.
        el.children(self.children)
    }
}

/// `<caption>` — caption below the table. Web: `mt-4 text-xs text-muted-foreground`.
#[derive(IntoElement)]
pub struct TableCaption {
    children: Vec<gpui::AnyElement>,
}

impl TableCaption {
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }
}

impl Default for TableCaption {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for TableCaption {
    fn extend(&mut self, children: impl IntoIterator<Item = gpui::AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TableCaption {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .mt(px(16.))
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

        div()
            .px_3()
            .min_h(px(32.0))
            .flex()
            .items_center()
            .text_sm()
            .child(text)
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
            [
                TableColumn::new("Key").width(160.),
                TableColumn::new("Value"),
            ],
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
        div()
            .flex_1()
            .min_h_0()
            .child(GpuiDataTable::new(&self.state).stripe(true).bordered(true))
    }
}
