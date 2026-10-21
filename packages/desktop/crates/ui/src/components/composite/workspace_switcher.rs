//! WorkspaceSwitcher — workspace / project picker strip.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct WorkspaceItem {
    id: ElementId,
    name: SharedString,
    path: Option<SharedString>,
    active: bool,
}

impl WorkspaceItem {
    pub fn new(id: impl Into<ElementId>, name: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            path: None,
            active: false,
        }
    }

    pub fn path(mut self, path: impl Into<SharedString>) -> Self {
        self.path = Some(path.into());
        self
    }

    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }
}

impl RenderOnce for WorkspaceItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .id(self.id)
            .w_full()
            .px(px(10.0))
            .py(px(8.0))
            .rounded(px(6.0))
            .flex()
            .flex_col()
            .gap(px(2.0))
            .when(self.active, |d| d.bg(theme.accent.opacity(0.12)))
            .when(!self.active, |d| d.hover(|s| s.bg(theme.muted)))
            .child(
                div()
                    .text_sm()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(theme.foreground)
                    .child(self.name),
            )
            .when_some(self.path, |d, p| {
                d.child(div().text_xs().text_color(theme.muted_foreground).child(p))
            })
    }
}

#[derive(IntoElement)]
pub struct WorkspaceSwitcher {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<AnyElement>,
}

impl WorkspaceSwitcher {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            items: Vec::new(),
        }
    }

    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }
}

impl Styled for WorkspaceSwitcher {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for WorkspaceSwitcher {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w(px(260.0))
            .flex()
            .flex_col()
            .gap(px(2.0))
            .p(px(6.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);
        root.children(self.items)
    }
}
