//! Conversation — chat thread shell with empty state.

use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Scrollable conversation column (host wraps in scroll if needed).
#[derive(IntoElement)]
pub struct Conversation {
    id: ElementId,
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl Conversation {
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

impl ParentElement for Conversation {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Conversation {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Conversation {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .gap(px(24.0))
            .p(px(16.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Empty-state placeholder for a conversation.
#[derive(IntoElement)]
pub struct ConversationEmpty {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    description: SharedString,
}

impl ConversationEmpty {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: "No messages yet".into(),
            description: "Start a conversation to see messages here".into(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = description.into();
        self
    }
}

impl Styled for ConversationEmpty {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ConversationEmpty {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .items_center()
            .justify_center()
            .gap(px(12.0))
            .p(px(32.0));
        root.style().refine(&self.style);

        root.child(
            Phosphor::new(PhosphorIcon::Sparkle)
                .size(px(28.0))
                .color(theme.muted_foreground),
        )
        .child(
            div()
                .text_sm()
                .font_weight(FontWeight::MEDIUM)
                .text_color(theme.foreground)
                .child(self.title),
        )
        .child(
            div()
                .max_w(px(320.0))
                .text_sm()
                .text_color(theme.muted_foreground)
                .child(self.description),
        )
    }
}
