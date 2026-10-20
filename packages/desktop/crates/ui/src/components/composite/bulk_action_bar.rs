//! BulkActionBar — selection count + bulk actions strip.

use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct BulkActionBar {
    id: ElementId,
    style: StyleRefinement,
    selected: usize,
    label: Option<SharedString>,
    actions: Vec<AnyElement>,
}

impl BulkActionBar {
    pub fn new(id: impl Into<ElementId>, selected: usize) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            selected,
            label: None,
            actions: Vec::new(),
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }
}

impl Styled for BulkActionBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for BulkActionBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let label = self
            .label
            .unwrap_or_else(|| SharedString::from(format!("{} selected", self.selected)));
        let mut root = div()
            .id(self.id)
            .w_full()
            .h(px(40.0))
            .px(px(12.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(10.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.accent.opacity(0.35))
            .bg(theme.accent.opacity(0.08));
        root.style().refine(&self.style);
        root.child(
            div()
                .text_sm()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(theme.foreground)
                .child(label),
        )
        .child(div().flex_1())
        .children(self.actions)
    }
}
