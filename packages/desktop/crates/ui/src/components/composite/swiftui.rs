//! SwiftUI-style layout primitives for celestia-ui.
//!
//! GPUI's fluent builders are powerful but unfamiliar to SwiftUI users; this
//! family ports SwiftUI's signature layout vocabulary 1:1 — stacks with
//! `alignment` + `spacing`, `Spacer`, an axis `ScrollView`, `VGrid` with
//! [`GridItem`] columns, and a `Frame` modifier wrapper. Composition is
//! identical: wrap Celestia or gpui-kit elements and drop them anywhere.
//!
//! ```ignore
//! VStack::new(HorizontalAlignment::Leading).spacing(px(12.))
//!     .child(HStack::new(VerticalAlignment::Center).spacing(px(8.))
//!         .child(label).child(Spacer::new()).child(button))
//! ```
//!
//! Stacks map to gpui flex rows/columns (`spacing` becomes the gap); ZStack
//! layers children absolutely; VGrid chunks children into rows sized by its
//! [`GridItem`] column rules.

use gpui_component::{h_flex, v_flex};
use gpui::{
    AnyElement, App, ElementId, InteractiveElement, IntoElement, ParentElement, Pixels, RenderOnce,
    StatefulInteractiveElement, Styled, Window, div, px,
};

// ---------------------------------------------------------------------------
// Alignments — SwiftUI's Horizontal/Vertical alignment enums.
// ---------------------------------------------------------------------------

/// `VerticalAlignment` — how an `HStack` aligns its children vertically.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum VerticalAlignment {
    Top,
    #[default]
    Center,
    Bottom,
}

/// `HorizontalAlignment` — how a `VStack` aligns its children horizontally.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum HorizontalAlignment {
    #[default]
    Leading,
    Center,
    Trailing,
}

/// Combined alignment for `ZStack` layers.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum ZAlignment {
    Top,
    #[default]
    Center,
    Bottom,
    Leading,
    Trailing,
    TopLeading,
    TopTrailing,
    BottomLeading,
    BottomTrailing,
}

// ---------------------------------------------------------------------------
// HStack / VStack
// ---------------------------------------------------------------------------

/// `HStack(alignment:spacing:)` — a horizontal flex row.
#[derive(IntoElement)]
pub struct HStack {
    alignment: VerticalAlignment,
    spacing: Pixels,
    children: Vec<AnyElement>,
}

impl HStack {
    pub fn new(alignment: VerticalAlignment) -> Self {
        Self {
            alignment,
            spacing: px(8.),
            children: Vec::new(),
        }
    }

    /// Distance between adjacent children (SwiftUI `spacing:`). Defaults
    /// to 8px; `zero()` gives the flush look of `spacing: 0`.
    pub fn spacing(mut self, spacing: Pixels) -> Self {
        self.spacing = spacing;
        self
    }
}

impl ParentElement for HStack {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for HStack {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mut row = h_flex().gap(self.spacing);
        row = match self.alignment {
            VerticalAlignment::Top => row.items_start(),
            VerticalAlignment::Center => row.items_center(),
            VerticalAlignment::Bottom => row.items_end(),
        };
        row.children(self.children)
    }
}

/// `VStack(alignment:spacing:)` — a vertical flex column.
#[derive(IntoElement)]
pub struct VStack {
    alignment: HorizontalAlignment,
    spacing: Pixels,
    children: Vec<AnyElement>,
}

impl VStack {
    pub fn new(alignment: HorizontalAlignment) -> Self {
        Self {
            alignment,
            spacing: px(8.),
            children: Vec::new(),
        }
    }

    pub fn spacing(mut self, spacing: Pixels) -> Self {
        self.spacing = spacing;
        self
    }
}

impl ParentElement for VStack {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for VStack {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mut column = v_flex().gap(self.spacing);
        column = match self.alignment {
            HorizontalAlignment::Leading => column.items_start(),
            HorizontalAlignment::Center => column.items_center(),
            HorizontalAlignment::Trailing => column.items_end(),
        };
        column.children(self.children)
    }
}

// ---------------------------------------------------------------------------
// ZStack
// ---------------------------------------------------------------------------

/// `ZStack(alignment:)` — children layered back-to-front, each positioned by
/// the shared alignment.
#[derive(IntoElement)]
pub struct ZStack {
    alignment: ZAlignment,
    children: Vec<AnyElement>,
}

impl ZStack {
    pub fn new(alignment: ZAlignment) -> Self {
        Self {
            alignment,
            children: Vec::new(),
        }
    }
}

impl ParentElement for ZStack {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for ZStack {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        // Each child becomes an absolutely-positioned full-bleed flex layer
        // so the alignment applies per layer, exactly like ZStack.
        let layers: Vec<AnyElement> = self
            .children
            .into_iter()
            .map(|child| {
                let mut layer = div().absolute().inset_0().flex().child(child);
                layer = match self.alignment {
                    ZAlignment::Center => layer.justify_center().items_center(),
                    ZAlignment::Top => layer.justify_center().items_start(),
                    ZAlignment::Bottom => layer.justify_center().items_end(),
                    ZAlignment::Leading => layer.justify_start().items_center(),
                    ZAlignment::Trailing => layer.justify_end().items_center(),
                    ZAlignment::TopLeading => layer.justify_start().items_start(),
                    ZAlignment::TopTrailing => layer.justify_end().items_start(),
                    ZAlignment::BottomLeading => layer.justify_start().items_end(),
                    ZAlignment::BottomTrailing => layer.justify_end().items_end(),
                };
                layer.into_any_element()
            })
            .collect();

        div().relative().size_full().children(layers)
    }
}

// ---------------------------------------------------------------------------
// Spacer
// ---------------------------------------------------------------------------

/// `Spacer(minLength:)` — expands along the parent stack's main axis.
#[derive(IntoElement)]
pub struct Spacer {
    min_length: Pixels,
}

impl Spacer {
    pub fn new() -> Self {
        Self { min_length: px(0.) }
    }

    pub fn min_length(mut self, min_length: Pixels) -> Self {
        self.min_length = min_length;
        self
    }
}

impl Default for Spacer {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for Spacer {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        div().flex_1().min_w(self.min_length).min_h(self.min_length)
    }
}

// ---------------------------------------------------------------------------
// ScrollView
// ---------------------------------------------------------------------------

/// The scroll axis (SwiftUI `.vertical` / `.horizontal`).
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum Axis {
    #[default]
    Vertical,
    Horizontal,
}

/// `ScrollView(axis:)` — a scroll container. GPUI requires a stateful element
/// id for scrolling, hence the id parameter.
#[derive(IntoElement)]
pub struct ScrollView {
    id: ElementId,
    axis: Axis,
    content: Option<AnyElement>,
}

impl ScrollView {
    pub fn new(id: impl Into<ElementId>, axis: Axis) -> Self {
        Self {
            id: id.into(),
            axis,
            content: None,
        }
    }

    pub fn content(mut self, content: impl IntoElement) -> Self {
        self.content = Some(content.into_any_element());
        self
    }
}

impl RenderOnce for ScrollView {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mut container = div().id(self.id).size_full();
        container = match self.axis {
            Axis::Vertical => container.overflow_y_scroll(),
            Axis::Horizontal => container.overflow_x_scroll(),
        };
        container.children(self.content)
    }
}

// ---------------------------------------------------------------------------
// Grid — LazyVGrid with GridItem columns
// ---------------------------------------------------------------------------

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
/// put it inside a [`ScrollView`] for long content.
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
                h_flex()
                    .gap(self.spacing)
                    .children(cells)
                    .into_any_element(),
            );
        }

        v_flex().gap(self.spacing).children(rows)
    }
}

// ---------------------------------------------------------------------------
// Frame — the .frame(width:height:padding:) modifier
// ---------------------------------------------------------------------------

/// `Frame` — SwiftUI's `.frame(width:height:)` / `.padding()` modifier pair,
/// as a wrapper element.
#[derive(IntoElement)]
pub struct Frame {
    content: Option<AnyElement>,
    width: Option<Pixels>,
    height: Option<Pixels>,
    padding: Pixels,
}

impl Frame {
    pub fn new(content: impl IntoElement) -> Self {
        Self {
            content: Some(content.into_any_element()),
            width: None,
            height: None,
            padding: px(0.),
        }
    }

    pub fn width(mut self, width: Pixels) -> Self {
        self.width = Some(width);
        self
    }

    pub fn height(mut self, height: Pixels) -> Self {
        self.height = Some(height);
        self
    }

    pub fn padding(mut self, padding: Pixels) -> Self {
        self.padding = padding;
        self
    }
}

impl RenderOnce for Frame {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mut frame = div().p(self.padding);
        if let Some(width) = self.width {
            frame = frame.w(width);
        }
        if let Some(height) = self.height {
            frame = frame.h(height);
        }
        frame.children(self.content)
    }
}
