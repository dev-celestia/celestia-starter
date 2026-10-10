//! `ScrollView` — SwiftUI's scroll container on one axis (no web counterpart:
//! browsers scroll natively). Distinct from [`crate::components::primitive::scroll_area`],
//! which styles a themed scrollbar.
//!
//! ```ignore
//! ScrollView::new("feed", Axis::Vertical).content(long_list)
//! ```

use gpui::{
    AnyElement, App, ElementId, InteractiveElement as _, IntoElement, ParentElement as _,
    RenderOnce, StatefulInteractiveElement as _, Styled as _, Window, div,
};

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
