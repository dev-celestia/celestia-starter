//! Status bar — the desktop counterpart of
//! `packages/ui/src/components/primitive/status-bar.tsx`.
//!
//! Written directly on `gpui`. Three regions — `left`, `center`, `right` —
//! mirroring the status bars native toolkits ship (Windows `StatusStrip`, WPF
//! `StatusBar`, macOS `NSStatusBar`): a strip of items pinned to either end.
//!
//! `left` and `right` pin items to each end; `child`/`children` fill the center
//! region, whose alignment follows which ends are pinned — centred when both
//! are, end-aligned with only `left`, start-aligned otherwise (only `right`, or
//! neither, so a bar built purely from `child` reads as a plain container).

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Div, IntoElement, ParentElement, Refineable as _, RenderOnce, StyleRefinement,
    Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// A horizontal status strip split into left, center, and right regions.
#[derive(IntoElement)]
pub struct StatusBar {
    style: StyleRefinement,
    left: Vec<AnyElement>,
    right: Vec<AnyElement>,
    children: Vec<AnyElement>,
}

impl StatusBar {
    /// An empty status bar.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            left: Vec::new(),
            right: Vec::new(),
            children: Vec::new(),
        }
    }

    /// Append to the left region. Call repeatedly to add more.
    pub fn left(mut self, child: impl IntoElement) -> Self {
        self.left.push(child.into_any_element());
        self
    }

    /// Append to the right region. Call repeatedly to add more.
    pub fn right(mut self, child: impl IntoElement) -> Self {
        self.right.push(child.into_any_element());
        self
    }
}

impl Default for StatusBar {
    fn default() -> Self {
        Self::new()
    }
}

/// `child` / `children` feed the center region, so a `StatusBar` with neither
/// `left` nor `right` items behaves like a plain container.
impl ParentElement for StatusBar {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for StatusBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

/// One region of the bar: a non-wrapping row of items.
fn region() -> Div {
    div()
        .flex()
        .flex_row()
        .overflow_hidden()
        .items_center()
        .gap(px(8.0))
}

impl RenderOnce for StatusBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_left = !self.left.is_empty();
        let has_right = !self.right.is_empty();

        let mut root = div()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .py(px(4.0))
            .px(px(8.0))
            .border_t_1()
            .border_color(theme.status_bar_border)
            .bg(theme.tokens.status_bar)
            .text_size(px(12.0))
            .text_color(theme.muted_foreground);
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.when(has_left, |this| this.child(region().children(self.left)))
            .child(
                region()
                    .flex_1()
                    .when(has_left && has_right, |this| this.justify_center())
                    .when(has_left && !has_right, |this| this.justify_end())
                    .children(self.children),
            )
            .when(has_right, |this| this.child(region().children(self.right)))
    }
}
