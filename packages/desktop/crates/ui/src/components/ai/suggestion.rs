//! Suggestion chips — horizontal prompt starters.

use std::rc::Rc;

use gpui::{
    AnyElement, App, ClickEvent, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Horizontal row of suggestion chips.
#[derive(IntoElement)]
pub struct Suggestions {
    id: ElementId,
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl Suggestions {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for Suggestions {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Suggestions {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Suggestions {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .overflow_x_hidden();
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// A single clickable suggestion chip.
#[derive(IntoElement)]
pub struct Suggestion {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    on_click: Option<OnClick>,
}

impl Suggestion {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            on_click: None,
        }
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Styled for Suggestion {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Suggestion {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut chip = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .px(px(14.0))
            .py(px(6.0))
            .rounded_full()
            .border_1()
            .border_color(theme.border)
            .bg(theme.background)
            .cursor_pointer()
            .text_sm()
            .text_color(theme.foreground)
            .child(self.label);
        chip.style().refine(&self.style);
        if let Some(on_click) = self.on_click {
            chip = chip.on_click(move |e, w, cx| on_click(e, w, cx));
        }
        chip
    }
}
