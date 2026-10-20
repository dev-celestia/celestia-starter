//! CountLabel — a compact numeric count chip.

use gpui::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct CountLabel {
    id: ElementId,
    style: StyleRefinement,
    count: usize,
    max: usize,
    muted: bool,
}

impl CountLabel {
    pub fn new(id: impl Into<ElementId>, count: usize) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            count,
            max: 99,
            muted: false,
        }
    }

    pub fn max(mut self, max: usize) -> Self {
        self.max = max;
        self
    }

    pub fn muted(mut self, muted: bool) -> Self {
        self.muted = muted;
        self
    }
}

impl Styled for CountLabel {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for CountLabel {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let label = if self.count > self.max {
            format!("{}+", self.max)
        } else {
            self.count.to_string()
        };
        let mut root = div()
            .id(self.id)
            .h(px(18.0))
            .min_w(px(18.0))
            .px(px(5.0))
            .rounded_full()
            .flex()
            .items_center()
            .justify_center()
            .bg(if self.muted {
                theme.muted
            } else {
                theme.accent
            })
            .text_xs()
            .font_weight(FontWeight::SEMIBOLD)
            .text_color(if self.muted {
                theme.muted_foreground
            } else {
                theme.accent_foreground
            })
            .child(label);
        root.style().refine(&self.style);
        root
    }
}
