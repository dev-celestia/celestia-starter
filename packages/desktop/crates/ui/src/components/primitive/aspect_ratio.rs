//! Aspect ratio — the desktop counterpart of
//! `packages/ui/src/components/primitive/aspect-ratio.tsx`.
//!
//! A container that keeps a fixed width÷height ratio via GPUI's
//! [`Styled::aspect_ratio`](gpui::Styled::aspect_ratio).

use gpui::{
    AnyElement, App, IntoElement, ParentElement, Refineable as _, RenderOnce, StyleRefinement,
    Styled, Window, div, relative,
};

/// A box that preserves `ratio` (width / height) as it flexes.
#[derive(IntoElement)]
pub struct AspectRatio {
    ratio: f32,
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl AspectRatio {
    /// `ratio` is width ÷ height (e.g. `16.0 / 9.0`).
    pub fn new(ratio: f32) -> Self {
        Self {
            ratio: ratio.max(0.001),
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }

    /// Convenience for 1∶1.
    pub fn square() -> Self {
        Self::new(1.0)
    }

    /// Convenience for 16∶9.
    pub fn widescreen() -> Self {
        Self::new(16.0 / 9.0)
    }
}

impl ParentElement for AspectRatio {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for AspectRatio {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for AspectRatio {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .relative()
            .w_full()
            .aspect_ratio(self.ratio)
            .overflow_hidden()
            .child(
                div()
                    .absolute()
                    .inset_0()
                    .w(relative(1.0))
                    .h(relative(1.0))
                    .children(self.children),
            );
        root.style().refine(&self.style);
        root
    }
}
