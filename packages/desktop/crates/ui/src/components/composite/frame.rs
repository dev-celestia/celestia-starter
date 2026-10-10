//! `Frame` — SwiftUI's `.frame(width:height:)` / `.padding()` modifier pair,
//! as a wrapper element (no web counterpart).

use gpui::{
    AnyElement, App, IntoElement, ParentElement as _, Pixels, RenderOnce, Styled as _, Window, div,
    px,
};

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

    /// Fixed width; unset means "size to content".
    pub fn width(mut self, width: Pixels) -> Self {
        self.width = Some(width);
        self
    }

    /// Fixed height; unset means "size to content".
    pub fn height(mut self, height: Pixels) -> Self {
        self.height = Some(height);
        self
    }

    /// Uniform padding inside the frame. Defaults to 0.
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
