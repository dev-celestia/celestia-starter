//! SignalBars — a cellular-style signal strength indicator.

use gpui::{
    App, ElementId, InteractiveElement as _, IntoElement, ParentElement, Refineable as _,
    RenderOnce, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct SignalBars {
    id: ElementId,
    style: StyleRefinement,
    /// 0..=4 filled bars.
    level: u8,
}

impl SignalBars {
    pub fn new(id: impl Into<ElementId>, level: u8) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            level: level.min(4),
        }
    }
}

impl Styled for SignalBars {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SignalBars {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let level = self.level;
        let mut root = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_end()
            .gap(px(2.0))
            .h(px(14.0));
        root.style().refine(&self.style);
        root.children((0..4u8).map(move |i| {
            let h = px(4.0 + (i as f32) * 3.0);
            let on = i < level;
            div().w(px(3.0)).h(h).rounded(px(1.0)).bg(if on {
                theme.foreground
            } else {
                theme.border
            })
        }))
    }
}
