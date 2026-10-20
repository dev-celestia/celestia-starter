//! IconLabel — an icon beside a label in one atom.

use gpui::{
    App, FontWeight, IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct IconLabel {
    style: StyleRefinement,
    icon: PhosphorIcon,
    label: SharedString,
    muted: bool,
}

impl IconLabel {
    pub fn new(icon: PhosphorIcon, label: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            icon,
            label: label.into(),
            muted: false,
        }
    }

    pub fn muted(mut self, muted: bool) -> Self {
        self.muted = muted;
        self
    }
}

impl Styled for IconLabel {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for IconLabel {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let color = if self.muted {
            theme.muted_foreground
        } else {
            theme.foreground
        };
        let mut root = div()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0))
            .child(Phosphor::new(self.icon).size(px(14.0)).color(color))
            .child(
                div()
                    .text_sm()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(color)
                    .child(self.label),
            );
        root.style().refine(&self.style);
        root
    }
}
