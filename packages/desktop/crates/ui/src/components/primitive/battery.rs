//! Battery — a battery level indicator.

use gpui::{
    App, ElementId, InteractiveElement as _, IntoElement, ParentElement, Refineable as _,
    RenderOnce, StyleRefinement, Styled, Window, div, px, relative,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct Battery {
    id: ElementId,
    style: StyleRefinement,
    /// 0.0..=1.0
    level: f32,
    charging: bool,
}

impl Battery {
    pub fn new(id: impl Into<ElementId>, level: f32) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            level: level.clamp(0.0, 1.0),
            charging: false,
        }
    }

    pub fn charging(mut self, charging: bool) -> Self {
        self.charging = charging;
        self
    }
}

impl Styled for Battery {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Battery {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let fill = if self.level <= 0.15 {
            theme.danger
        } else if self.charging {
            theme.success
        } else {
            theme.foreground
        };
        let mut root = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(2.0));
        root.style().refine(&self.style);
        root.child(
            div()
                .w(px(22.0))
                .h(px(12.0))
                .rounded(px(2.0))
                .border_1()
                .border_color(theme.border)
                .p(px(1.0))
                .child(
                    div()
                        .h_full()
                        .w(relative(self.level))
                        .rounded(px(1.0))
                        .bg(fill),
                ),
        )
        .child(
            div()
                .w(px(2.0))
                .h(px(6.0))
                .rounded_r(px(1.0))
                .bg(theme.border),
        )
    }
}
