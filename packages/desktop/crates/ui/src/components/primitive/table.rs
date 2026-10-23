//! Celestia table — pure GPUI composition table (web `primitive/table.tsx`
//! parity), plus a declarative [`DataTable`] helper (web `composite/data-table`
//! role).
//!
//! Written directly on `gpui`. No `gpui-component` / `gpui-base` table widgets:
//! layout, roles, and paint live here. Columns share width via
//! `flex_basis(relative(col_span))` so cells line up across rows — the previous
//! `flex_1` hand-roll sized each row independently and looked broken.
//!
//! # Example
//!
//! ```rust,ignore
//! Table::new()
//!     .child(
//!         TableHeader::new().child(
//!             TableRow::new()
//!                 .child(TableHead::new().child("Invoice"))
//!                 .child(TableHead::new().child("Amount")),
//!         ),
//!     )
//!     .child(
//!         TableBody::new().child(
//!             TableRow::new()
//!                 .child(TableCell::new().child("INV-001"))
//!                 .child(TableCell::new().child("$1,200.00")),
//!         ),
//!     )
//!     .child(TableCaption::new().child("A list of recent invoices."));
//! ```

use std::cell::Cell;
use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, Context, DefiniteLength, ElementId, FontWeight,
    InteractiveElement, IntoElement, ParentElement, Pixels, Refineable as _, RenderOnce, Role,
    SharedString, StatefulInteractiveElement as _, StyleRefinement, Styled, TextAlign, Window, div,
    px, relative,
};
use gpui_component::menu::{ContextMenuExt as _, PopupMenu};

use crate::components::traits::{Sizable, Size};
use crate::motion::{self, transition};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;
type ContextMenuFn =
    Rc<dyn Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static>;

/// Floor width for a single column so narrow cells stay readable.
const MIN_CELL_WIDTH: Pixels = px(80.);

// ---------------------------------------------------------------------------
// Index + size propagation (typed children — ParentElement would erase this)
// ---------------------------------------------------------------------------

/// Internal stamp applied by parents before a part becomes an [`AnyElement`].
/// Public so typed `.child()` builders can name it in their signatures.
pub trait TablePart: Sized {
    /// Row / section index within the parent (0-based).
    fn with_ix(self, ix: usize) -> Self;
    /// Density inherited from the root [`Table`].
    fn with_size(self, size: Size) -> Self;
}

/// Type-erased table section / row / cell so parents can stamp `ix` + `size`
/// before the child becomes an [`AnyElement`].
struct AnyTablePart(Box<dyn FnOnce(usize, Size) -> AnyElement>);

impl AnyTablePart {
    fn new<T: TablePart + IntoElement + 'static>(part: T) -> Self {
        Self(Box::new(move |ix, size| {
            part.with_ix(ix).with_size(size).into_any_element()
        }))
    }

    fn into_any(self, ix: usize, size: Size) -> AnyElement {
        (self.0)(ix, size)
    }
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

/// `<table>` — bordered, rounded container. Web: `w-full caption-bottom text-xs`
/// inside an overflow wrapper; desktop carries both chrome layers on one node.
#[derive(IntoElement)]
pub struct Table {
    id: ElementId,
    style: StyleRefinement,
    children: Vec<AnyTablePart>,
    size: Size,
    accessibility_label: Option<SharedString>,
}

impl Table {
    pub fn new() -> Self {
        Self {
            id: ElementId::Name("table".into()),
            style: StyleRefinement::default(),
            children: Vec::new(),
            size: Size::default(),
            accessibility_label: None,
        }
    }

    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = id.into();
        self
    }

    /// Screen-reader name for the table (a caption is visual only).
    pub fn accessibility_label(mut self, label: impl Into<SharedString>) -> Self {
        self.accessibility_label = Some(label.into());
        self
    }

    pub fn child(mut self, child: impl TablePart + IntoElement + 'static) -> Self {
        self.children.push(AnyTablePart::new(child));
        self
    }

    pub fn children<E: TablePart + IntoElement + 'static>(
        mut self,
        children: impl IntoIterator<Item = E>,
    ) -> Self {
        self.children
            .extend(children.into_iter().map(AnyTablePart::new));
        self
    }
}

impl Default for Table {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for Table {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for Table {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for Table {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let size = self.size;
        let mut el = div()
            .id(self.id)
            .role(Role::Table)
            .when_some(self.accessibility_label, |this, label| {
                this.aria_label(label)
            })
            .w_full()
            .text_xs()
            .overflow_hidden()
            .border_1()
            .border_color(cx.theme().border)
            .rounded(cx.theme().radius)
            .bg(cx.theme().table)
            .children(
                self.children
                    .into_iter()
                    .enumerate()
                    .map(|(ix, c)| c.into_any(ix, size)),
            );
        el.style().refine(&self.style);
        el
    }
}

// ---------------------------------------------------------------------------
// TableHeader / TableBody / TableFooter
// ---------------------------------------------------------------------------

/// `<thead>` — web is `[&_tr]:border-b` only (no muted band).
#[derive(IntoElement)]
pub struct TableHeader {
    ix: usize,
    style: StyleRefinement,
    children: Vec<AnyTablePart>,
    size: Size,
}

impl TableHeader {
    pub fn new() -> Self {
        Self {
            ix: 0,
            style: StyleRefinement::default(),
            children: Vec::new(),
            size: Size::default(),
        }
    }

    pub fn child(mut self, child: impl TablePart + IntoElement + 'static) -> Self {
        self.children.push(AnyTablePart::new(child));
        self
    }

    pub fn children<E: TablePart + IntoElement + 'static>(
        mut self,
        children: impl IntoIterator<Item = E>,
    ) -> Self {
        self.children
            .extend(children.into_iter().map(AnyTablePart::new));
        self
    }
}

impl Default for TableHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl TablePart for TableHeader {
    fn with_ix(mut self, ix: usize) -> Self {
        self.ix = ix;
        self
    }
    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }
}

impl Styled for TableHeader {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for TableHeader {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for TableHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let size = self.size;
        let mut el = div()
            .id(("table-header", self.ix))
            .role(Role::RowGroup)
            .w_full()
            .border_b_1()
            .border_color(cx.theme().table_row_border)
            .children(
                self.children
                    .into_iter()
                    .enumerate()
                    .map(|(ix, c)| c.into_any(ix, size)),
            );
        el.style().refine(&self.style);
        el
    }
}

/// `<tbody>`.
#[derive(IntoElement)]
pub struct TableBody {
    ix: usize,
    style: StyleRefinement,
    children: Vec<AnyTablePart>,
    size: Size,
}

impl TableBody {
    pub fn new() -> Self {
        Self {
            ix: 0,
            style: StyleRefinement::default(),
            children: Vec::new(),
            size: Size::default(),
        }
    }

    pub fn child(mut self, child: impl TablePart + IntoElement + 'static) -> Self {
        self.children.push(AnyTablePart::new(child));
        self
    }

    pub fn children<E: TablePart + IntoElement + 'static>(
        mut self,
        children: impl IntoIterator<Item = E>,
    ) -> Self {
        self.children
            .extend(children.into_iter().map(AnyTablePart::new));
        self
    }
}

impl Default for TableBody {
    fn default() -> Self {
        Self::new()
    }
}

impl TablePart for TableBody {
    fn with_ix(mut self, ix: usize) -> Self {
        self.ix = ix;
        self
    }
    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }
}

impl Styled for TableBody {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for TableBody {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for TableBody {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let size = self.size;
        let mut el = div()
            .id(("table-body", self.ix))
            .role(Role::RowGroup)
            .w_full()
            .children(
                self.children
                    .into_iter()
                    .enumerate()
                    .map(|(ix, c)| c.into_any(ix, size)),
            );
        el.style().refine(&self.style);
        el
    }
}

/// `<tfoot>` — web: `border-t bg-muted/50 font-medium`.
#[derive(IntoElement)]
pub struct TableFooter {
    ix: usize,
    style: StyleRefinement,
    children: Vec<AnyTablePart>,
    size: Size,
}

impl TableFooter {
    pub fn new() -> Self {
        Self {
            ix: 0,
            style: StyleRefinement::default(),
            children: Vec::new(),
            size: Size::default(),
        }
    }

    pub fn child(mut self, child: impl TablePart + IntoElement + 'static) -> Self {
        self.children.push(AnyTablePart::new(child));
        self
    }

    pub fn children<E: TablePart + IntoElement + 'static>(
        mut self,
        children: impl IntoIterator<Item = E>,
    ) -> Self {
        self.children
            .extend(children.into_iter().map(AnyTablePart::new));
        self
    }
}

impl Default for TableFooter {
    fn default() -> Self {
        Self::new()
    }
}

impl TablePart for TableFooter {
    fn with_ix(mut self, ix: usize) -> Self {
        self.ix = ix;
        self
    }
    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }
}

impl Styled for TableFooter {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for TableFooter {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for TableFooter {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let size = self.size;
        let mut el = div()
            .id(("table-footer", self.ix))
            .role(Role::RowGroup)
            .w_full()
            .border_t_1()
            .border_color(cx.theme().table_row_border)
            .bg(cx.theme().table_foot)
            .text_color(cx.theme().table_foot_foreground)
            .font_weight(FontWeight::MEDIUM)
            .children(
                self.children
                    .into_iter()
                    .enumerate()
                    .map(|(ix, c)| c.into_any(ix, size)),
            );
        el.style().refine(&self.style);
        el
    }
}

// ---------------------------------------------------------------------------
// TableRow
// ---------------------------------------------------------------------------

/// `<tr>` — flex row; hover / selected fades match web `transition-colors`.
#[derive(IntoElement)]
pub struct TableRow {
    ix: usize,
    id: Option<ElementId>,
    style: StyleRefinement,
    children: Vec<AnyTablePart>,
    size: Size,
    selected: bool,
    /// Even-row stripe fill (declarative [`DataTable`] sets this).
    striped: bool,
    on_click: Option<OnClick>,
    context_menu: Option<ContextMenuFn>,
}

impl TableRow {
    pub fn new() -> Self {
        Self {
            ix: 0,
            id: None,
            style: StyleRefinement::default(),
            children: Vec::new(),
            size: Size::default(),
            selected: false,
            striped: false,
            on_click: None,
            context_menu: None,
        }
    }

    /// Stable element id (needed for context-menu open state across re-renders).
    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = Some(id.into());
        self
    }

    /// Web `data-[state=selected]` — full muted / table-active fill.
    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    /// Paint the even-row stripe (`table_even`).
    pub fn striped(mut self, striped: bool) -> Self {
        self.striped = striped;
        self
    }

    pub fn on_click(
        mut self,
        f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }

    /// Right-click menu for this row (same builder as [`ContextMenuExt::context_menu`]).
    pub fn context_menu(
        mut self,
        f: impl Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static,
    ) -> Self {
        self.context_menu = Some(Rc::new(f));
        self
    }

    pub fn child(mut self, child: impl TablePart + IntoElement + 'static) -> Self {
        self.children.push(AnyTablePart::new(child));
        self
    }

    pub fn children<E: TablePart + IntoElement + 'static>(
        mut self,
        children: impl IntoIterator<Item = E>,
    ) -> Self {
        self.children
            .extend(children.into_iter().map(AnyTablePart::new));
        self
    }
}

impl Default for TableRow {
    fn default() -> Self {
        Self::new()
    }
}

impl TablePart for TableRow {
    fn with_ix(mut self, ix: usize) -> Self {
        self.ix = ix;
        self
    }
    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }
}

impl Styled for TableRow {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for TableRow {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for TableRow {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let size = self.size;
        let id = self
            .id
            .unwrap_or_else(|| ElementId::from(("table-row", self.ix)));
        let (table_hover, table_active, table_even, transparent, border) = {
            let theme = cx.theme();
            (
                theme.table_hover,
                theme.table_active,
                theme.table_even,
                theme.transparent,
                theme.table_row_border,
            )
        };
        let base = if self.selected {
            table_active
        } else if self.striped {
            table_even
        } else {
            transparent
        };
        let hover_fill = table_hover;
        let interactive = self.on_click.is_some() || self.context_menu.is_some();

        let state = window.use_keyed_state(id.clone(), cx, |_, _| Cell::new(false));
        let hovered = state.read(cx).get();
        let select_t = transition(
            (id.clone(), "selected"),
            if self.selected { 1.0 } else { 0.0 },
            motion::hover_transition(),
            window,
            cx,
        );
        let hover_t = transition(
            (id.clone(), "hover"),
            if hovered && !self.selected { 1.0 } else { 0.0 },
            motion::hover_transition(),
            window,
            cx,
        );
        let fill = motion::mix(
            motion::mix(base, table_active, select_t),
            hover_fill,
            hover_t,
        );
        let state_hover = state.clone();

        let mut el = div()
            .id(id)
            .role(Role::Row)
            .aria_row_index(self.ix + 1)
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .bg(fill)
            .when(interactive, |this| this.cursor_pointer())
            .when(self.ix > 0, |this| this.border_t_1().border_color(border))
            .on_hover(move |hovered, _, cx| {
                if state_hover.read(cx).get() == *hovered {
                    return;
                }
                state_hover.update(cx, |flag, cx| {
                    flag.set(*hovered);
                    cx.notify();
                });
            })
            .children(
                self.children
                    .into_iter()
                    .enumerate()
                    .map(|(ix, c)| c.into_any(ix, size)),
            );
        el.style().refine(&self.style);

        let el = el.when_some(self.on_click, |this, on| {
            this.on_click(move |e, window, cx| on(e, window, cx))
        });

        match self.context_menu {
            Some(builder) => el
                .context_menu(move |menu, window, cx| builder(menu, window, cx))
                .into_any_element(),
            None => el.into_any_element(),
        }
    }
}

// ---------------------------------------------------------------------------
// TableHead / TableCell
// ---------------------------------------------------------------------------

/// Row density for a cell (web `size` prop). Prefer table-level [`Sizable`]
/// when every cell shares a step; use this to override one cell.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum TableCellSize {
    /// Match the table's [`Size`] padding.
    #[default]
    Default,
    /// Web `sm` → tighter vertical padding only (`py-1.5` on an 8px base).
    Small,
}

fn cell_padding(size: Size, cell: TableCellSize) -> (Pixels, Pixels) {
    let edges = size.table_cell_padding();
    match cell {
        TableCellSize::Default => (edges.left, edges.top),
        // Web extracts only the vertical axis for `sm`.
        TableCellSize::Small => (edges.left, px(6.)),
    }
}

fn cell_flex_basis(
    col_span: usize,
    width: Option<DefiniteLength>,
) -> Option<(DefiniteLength, bool)> {
    // Fixed width wins; otherwise equal fractional basis so columns align.
    match width {
        Some(w) => Some((w, false)),
        None => Some((relative(col_span as f32).into(), true)),
    }
}

/// `<th>` — web: `h-10 px-2 font-medium whitespace-nowrap text-foreground`.
#[derive(IntoElement)]
pub struct TableHead {
    ix: usize,
    style: StyleRefinement,
    children: Vec<AnyElement>,
    size: Size,
    cell_size: TableCellSize,
    col_span: usize,
    align: TextAlign,
    width: Option<DefiniteLength>,
}

impl TableHead {
    pub fn new() -> Self {
        Self {
            ix: 0,
            style: StyleRefinement::default(),
            children: Vec::new(),
            size: Size::default(),
            cell_size: TableCellSize::Default,
            col_span: 1,
            align: TextAlign::Left,
            width: None,
        }
    }

    pub fn col_span(mut self, span: usize) -> Self {
        self.col_span = span.max(1);
        self
    }

    pub fn size(mut self, size: TableCellSize) -> Self {
        self.cell_size = size;
        self
    }

    /// Pin an absolute column width; unpinned columns share remaining space.
    pub fn width(mut self, width: impl Into<DefiniteLength>) -> Self {
        self.width = Some(width.into());
        self
    }

    pub fn text_center(mut self) -> Self {
        self.align = TextAlign::Center;
        self
    }

    pub fn text_right(mut self) -> Self {
        self.align = TextAlign::Right;
        self
    }
}

impl Default for TableHead {
    fn default() -> Self {
        Self::new()
    }
}

impl TablePart for TableHead {
    fn with_ix(mut self, ix: usize) -> Self {
        self.ix = ix;
        self
    }
    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }
}

impl ParentElement for TableHead {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for TableHead {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for TableHead {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for TableHead {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let (pad_x, pad_y) = cell_padding(self.size, self.cell_size);
        let caller_width = self.style.size.width;
        let mut el = div()
            .id(("table-head", self.ix))
            .role(Role::ColumnHeader)
            .aria_column_index(self.ix + 1)
            .flex()
            .items_center()
            .h(self.size.table_row_height().max(px(40.)))
            .px(pad_x)
            .py(pad_y)
            .whitespace_nowrap()
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(cx.theme().foreground)
            .when(self.align == TextAlign::Center, |this| {
                this.justify_center()
            })
            .when(self.align == TextAlign::Right, |this| this.justify_end())
            .children(self.children);

        if caller_width.is_none() {
            if let Some((basis, shrink)) = cell_flex_basis(self.col_span, self.width) {
                el = el
                    .flex_basis(basis)
                    .min_w(MIN_CELL_WIDTH * self.col_span as f32);
                if shrink {
                    el = el.flex_shrink_1();
                } else {
                    el = el.flex_shrink_0();
                }
            }
        }

        el.style().refine(&self.style);
        el
    }
}

/// `<td>` — web base `p-2 align-middle whitespace-nowrap`.
#[derive(IntoElement)]
pub struct TableCell {
    ix: usize,
    style: StyleRefinement,
    children: Vec<AnyElement>,
    size: Size,
    cell_size: TableCellSize,
    col_span: usize,
    align: TextAlign,
    width: Option<DefiniteLength>,
    mono: bool,
}

impl TableCell {
    pub fn new() -> Self {
        Self {
            ix: 0,
            style: StyleRefinement::default(),
            children: Vec::new(),
            size: Size::default(),
            cell_size: TableCellSize::Default,
            col_span: 1,
            align: TextAlign::Left,
            width: None,
            mono: false,
        }
    }

    pub fn col_span(mut self, span: usize) -> Self {
        self.col_span = span.max(1);
        self
    }

    pub fn size(mut self, size: TableCellSize) -> Self {
        self.cell_size = size;
        self
    }

    pub fn width(mut self, width: impl Into<DefiniteLength>) -> Self {
        self.width = Some(width.into());
        self
    }

    /// Monospace stack — ids, hashes, tokens, ports (web `mono`).
    pub fn mono(mut self, mono: bool) -> Self {
        self.mono = mono;
        self
    }

    pub fn text_center(mut self) -> Self {
        self.align = TextAlign::Center;
        self
    }

    pub fn text_right(mut self) -> Self {
        self.align = TextAlign::Right;
        self
    }
}

impl Default for TableCell {
    fn default() -> Self {
        Self::new()
    }
}

impl TablePart for TableCell {
    fn with_ix(mut self, ix: usize) -> Self {
        self.ix = ix;
        self
    }
    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }
}

impl ParentElement for TableCell {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for TableCell {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for TableCell {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for TableCell {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let (pad_x, pad_y) = cell_padding(self.size, self.cell_size);
        let caller_width = self.style.size.width;
        let mut el = div()
            .id(("table-cell", self.ix))
            .role(Role::Cell)
            .aria_column_index(self.ix + 1)
            .flex()
            .items_center()
            .px(pad_x)
            .py(pad_y)
            .whitespace_nowrap()
            .text_color(cx.theme().foreground)
            .when(self.mono, |this| {
                this.font_family(cx.theme().mono_font_family.clone())
            })
            .when(self.align == TextAlign::Center, |this| {
                this.justify_center()
            })
            .when(self.align == TextAlign::Right, |this| this.justify_end())
            .children(self.children);

        if caller_width.is_none() {
            if let Some((basis, shrink)) = cell_flex_basis(self.col_span, self.width) {
                el = el
                    .flex_basis(basis)
                    .min_w(MIN_CELL_WIDTH * self.col_span as f32);
                if shrink {
                    el = el.flex_shrink_1();
                } else {
                    el = el.flex_shrink_0();
                }
            }
        }

        el.style().refine(&self.style);
        el
    }
}

// ---------------------------------------------------------------------------
// TableCaption
// ---------------------------------------------------------------------------

/// `<caption>` — web: `mt-4 text-xs text-muted-foreground`.
#[derive(IntoElement)]
pub struct TableCaption {
    ix: usize,
    style: StyleRefinement,
    children: Vec<AnyElement>,
    size: Size,
}

impl TableCaption {
    pub fn new() -> Self {
        Self {
            ix: 0,
            style: StyleRefinement::default(),
            children: Vec::new(),
            size: Size::default(),
        }
    }
}

impl Default for TableCaption {
    fn default() -> Self {
        Self::new()
    }
}

impl TablePart for TableCaption {
    fn with_ix(mut self, ix: usize) -> Self {
        self.ix = ix;
        self
    }
    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }
}

impl ParentElement for TableCaption {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for TableCaption {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for TableCaption {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for TableCaption {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let mut el = div()
            .id(("table-caption", self.ix))
            .w_full()
            .mt(px(16.))
            .text_xs()
            .text_color(cx.theme().muted_foreground)
            .children(self.children);
        el.style().refine(&self.style);
        el
    }
}

// ---------------------------------------------------------------------------
// DataTable — declarative helper over the composition table
// ---------------------------------------------------------------------------

/// One column definition: header name + optional fixed width in pixels.
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

    /// Pin the column width; unpinned columns flex equally.
    pub fn width(mut self, width: f32) -> Self {
        self.width = Some(width);
        self
    }
}

/// Declarative columns + rows rendered through the pure composition [`Table`].
///
/// Prefer this for simple string grids. For custom cell content, compose
/// [`Table`] / [`TableRow`] / [`TableCell`] directly.
#[derive(IntoElement)]
pub struct DataTable {
    columns: Vec<TableColumn>,
    rows: Vec<Vec<SharedString>>,
    striped: bool,
    size: Size,
    caption: Option<SharedString>,
}

impl DataTable {
    pub fn new(
        columns: impl IntoIterator<Item = TableColumn>,
        rows: Vec<Vec<SharedString>>,
    ) -> Self {
        Self {
            columns: columns.into_iter().collect(),
            rows,
            striped: true,
            size: Size::default(),
            caption: None,
        }
    }

    /// Two-column Key / Value convenience (GetCat `kv_table` spirit).
    pub fn from_key_value(
        pairs: impl IntoIterator<Item = (impl Into<SharedString>, impl Into<SharedString>)>,
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
        )
    }

    pub fn striped(mut self, striped: bool) -> Self {
        self.striped = striped;
        self
    }

    pub fn caption(mut self, caption: impl Into<SharedString>) -> Self {
        self.caption = Some(caption.into());
        self
    }
}

impl Sizable for DataTable {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl RenderOnce for DataTable {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let columns = self.columns;
        let striped = self.striped;

        let header = TableHeader::new().child({
            let mut row = TableRow::new();
            for col in &columns {
                let mut head = TableHead::new().child(col.name.clone());
                if let Some(w) = col.width {
                    head = head.width(px(w));
                }
                row = row.child(head);
            }
            row
        });

        let mut body = TableBody::new();
        for (row_ix, cells) in self.rows.into_iter().enumerate() {
            let mut row = TableRow::new().striped(striped && row_ix.is_multiple_of(2));
            let mut filled = 0usize;
            for (col_ix, cell) in cells.into_iter().enumerate() {
                let mut td = TableCell::new().child(cell);
                if let Some(w) = columns.get(col_ix).and_then(|c| c.width) {
                    td = td.width(px(w));
                }
                row = row.child(td);
                filled = col_ix + 1;
            }
            // Pad short rows so column count stays stable.
            for col_ix in filled..columns.len() {
                let mut td = TableCell::new().child("");
                if let Some(w) = columns.get(col_ix).and_then(|c| c.width) {
                    td = td.width(px(w));
                }
                row = row.child(td);
            }
            body = body.child(row);
        }

        let mut table = Table::new().with_size(self.size).child(header).child(body);
        if let Some(caption) = self.caption {
            table = table.child(TableCaption::new().child(caption));
        }
        table
    }
}
