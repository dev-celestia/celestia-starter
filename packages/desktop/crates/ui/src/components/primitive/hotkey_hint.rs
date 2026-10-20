//! HotkeyHint — label + kbd chord for menus and tooltips.

use gpui::{
    App, IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::kbd::Kbd;
use crate::theme::ActiveTheme as _;
use gpui::Keystroke;

#[derive(IntoElement)]
pub struct HotkeyHint {
    style: StyleRefinement,
    label: SharedString,
    keystroke: Keystroke,
}

impl HotkeyHint {
    pub fn new(label: impl Into<SharedString>, keystroke: Keystroke) -> Self {
        Self {
            style: StyleRefinement::default(),
            label: label.into(),
            keystroke,
        }
    }
}

impl Styled for HotkeyHint {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for HotkeyHint {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .flex()
            .flex_row()
            .items_center()
            .justify_between()
            .gap(px(16.0))
            .w_full()
            .child(
                div()
                    .text_sm()
                    .text_color(theme.foreground)
                    .child(self.label),
            )
            .child(Kbd::new(self.keystroke));
        root.style().refine(&self.style);
        root
    }
}
