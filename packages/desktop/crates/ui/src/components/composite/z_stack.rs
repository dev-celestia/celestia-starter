//! `ZStack` — SwiftUI's depth stack: children layered back-to-front, each
//! positioned by one shared alignment (no web counterpart).
//!
//! ```ignore
//! ZStack::new(ZAlignment::Center)
//!     .child(hero_image)
//!     .child(overlay_label)
//! ```

use gpui::{AnyElement, App, IntoElement, ParentElement, RenderOnce, Styled as _, Window, div};

use super::alignment::ZAlignment;

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
