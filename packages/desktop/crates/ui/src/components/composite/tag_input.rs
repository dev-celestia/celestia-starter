//! TagInput — token field chrome with chips and a trailing input slot.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct TagInput {
    id: ElementId,
    style: StyleRefinement,
    tags: Vec<AnyElement>,
    input: Option<AnyElement>,
    placeholder: Option<SharedString>,
}

impl TagInput {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            tags: Vec::new(),
            input: None,
            placeholder: None,
        }
    }

    pub fn tag(mut self, tag: impl IntoElement) -> Self {
        self.tags.push(tag.into_any_element());
        self
    }

    pub fn input(mut self, input: impl IntoElement) -> Self {
        self.input = Some(input.into_any_element());
        self
    }

    pub fn placeholder(mut self, placeholder: impl Into<SharedString>) -> Self {
        self.placeholder = Some(placeholder.into());
        self
    }
}

impl Styled for TagInput {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for TagInput {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_input = self.input.is_some();
        let mut root = div()
            .id(self.id)
            .w_full()
            .min_h(px(36.0))
            .px(px(8.0))
            .py(px(6.0))
            .flex()
            .flex_row()
            .flex_wrap()
            .items_center()
            .gap(px(6.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background);
        root.style().refine(&self.style);
        root.children(self.tags)
            .when_some(self.input, |d, i| {
                d.child(div().flex_1().min_w(px(80.0)).child(i))
            })
            .when(!has_input, |d| {
                d.child(
                    div()
                        .flex_1()
                        .min_w(px(80.0))
                        .text_sm()
                        .text_color(theme.muted_foreground)
                        .child(self.placeholder.unwrap_or_else(|| "Add tag…".into())),
                )
            })
    }
}
