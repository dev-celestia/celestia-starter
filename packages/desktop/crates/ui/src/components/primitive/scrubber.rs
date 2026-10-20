//! Scrubber — a thin seek / scrub track with a playhead.

use gpui::{
    App, ElementId, InteractiveElement as _, IntoElement, ParentElement, Refineable as _,
    RenderOnce, StyleRefinement, Styled, Window, div, px, relative,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct Scrubber {
    id: ElementId,
    style: StyleRefinement,
    /// 0.0..=1.0
    position: f32,
}

impl Scrubber {
    pub fn new(id: impl Into<ElementId>, position: f32) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            position: position.clamp(0.0, 1.0),
        }
    }
}

impl Styled for Scrubber {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Scrubber {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div().id(self.id).w_full().h(px(16.0)).flex().items_center();
        root.style().refine(&self.style);
        root.child(
            div()
                .w_full()
                .h(px(4.0))
                .rounded_full()
                .bg(theme.muted)
                .relative()
                .child(
                    div()
                        .absolute()
                        .top_0()
                        .left_0()
                        .h_full()
                        .w(relative(self.position))
                        .rounded_full()
                        .bg(theme.accent),
                )
                .child(
                    div()
                        .absolute()
                        .top(px(-4.0))
                        .left(relative(self.position))
                        .ml(px(-6.0))
                        .size(px(12.0))
                        .rounded_full()
                        .bg(theme.accent)
                        .border_2()
                        .border_color(theme.background),
                ),
        )
    }
}
