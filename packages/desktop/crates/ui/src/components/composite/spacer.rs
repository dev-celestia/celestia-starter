//! `Spacer` — SwiftUI's flexible gap, expanding along the parent stack's main
//! axis (no web counterpart).

use gpui::{App, IntoElement, Pixels, RenderOnce, Styled as _, Window, div, px};

/// `Spacer(minLength:)` — expands along the parent stack's main axis.
#[derive(IntoElement)]
pub struct Spacer {
    min_length: Pixels,
}

impl Spacer {
    pub fn new() -> Self {
        Self { min_length: px(0.) }
    }

    /// Floor for the expanded size (SwiftUI `minLength:`). Defaults to 0.
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
