//! `HStack` — SwiftUI's horizontal stack, mapped to a gpui flex row
//! (`spacing` becomes the gap; no web counterpart).
//!
//! ```ignore
//! HStack::new(VerticalAlignment::Center).spacing(px(8.))
//!     .child(label).child(Spacer::new()).child(button)
//! ```

use gpui::{
    AnyElement, App, IntoElement, ParentElement, Pixels, RenderOnce, Styled as _, Window, div, px,
};

use super::alignment::VerticalAlignment;

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
        // `h_flex()`'s implicit `items_center()` is overridden by every arm
        // below, so the row starts with no cross-axis alignment.
        let mut row = div().flex().flex_row().gap(self.spacing);
        row = match self.alignment {
            VerticalAlignment::Top => row.items_start(),
            VerticalAlignment::Center => row.items_center(),
            VerticalAlignment::Bottom => row.items_end(),
        };
        row.children(self.children)
    }
}
