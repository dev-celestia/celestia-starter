//! `VStack` — SwiftUI's vertical stack, mapped to a gpui flex column
//! (`spacing` becomes the gap; no web counterpart).
//!
//! ```ignore
//! VStack::new(HorizontalAlignment::Leading).spacing(px(12.))
//!     .child(title).child(body)
//! ```

use gpui::{
    AnyElement, App, IntoElement, ParentElement, Pixels, RenderOnce, Styled as _, Window, div, px,
};

use super::alignment::HorizontalAlignment;

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

    /// Distance between adjacent children (SwiftUI `spacing:`). Defaults
    /// to 8px; `zero()` gives the flush look of `spacing: 0`.
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
        let mut column = div().flex().flex_col().gap(self.spacing);
        column = match self.alignment {
            HorizontalAlignment::Leading => column.items_start(),
            HorizontalAlignment::Center => column.items_center(),
            HorizontalAlignment::Trailing => column.items_end(),
        };
        column.children(self.children)
    }
}
