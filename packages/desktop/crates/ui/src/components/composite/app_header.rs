//! AppHeader — top-of-content brand / title strip with nav and actions.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// A content-header chrome row: brand/title, center nav, trailing actions.
#[derive(IntoElement)]
pub struct AppHeader {
    id: ElementId,
    style: StyleRefinement,
    brand: Option<SharedString>,
    title: Option<SharedString>,
    leading: Option<AnyElement>,
    nav: Vec<AnyElement>,
    actions: Vec<AnyElement>,
    bordered: bool,
}

impl AppHeader {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            brand: None,
            title: None,
            leading: None,
            nav: Vec::new(),
            actions: Vec::new(),
            bordered: true,
        }
    }

    pub fn brand(mut self, brand: impl Into<SharedString>) -> Self {
        self.brand = Some(brand.into());
        self
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn leading(mut self, leading: impl IntoElement) -> Self {
        self.leading = Some(leading.into_any_element());
        self
    }

    pub fn nav_item(mut self, item: impl IntoElement) -> Self {
        self.nav.push(item.into_any_element());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }

    pub fn bordered(mut self, bordered: bool) -> Self {
        self.bordered = bordered;
        self
    }
}

impl Styled for AppHeader {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for AppHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .h(px(48.0))
            .px(px(14.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(12.0))
            .bg(theme.background)
            .when(self.bordered, |this| {
                this.border_b_1().border_color(theme.border)
            });
        root.style().refine(&self.style);

        root.when_some(self.leading, |this, leading| this.child(leading))
            .when_some(self.brand, |this, brand| {
                this.child(
                    div()
                        // Brand outranks the page title in chrome hierarchy.
                        .text_base()
                        .font_weight(FontWeight::BOLD)
                        .text_color(theme.foreground)
                        .child(brand),
                )
            })
            .when_some(self.title, |this, title| {
                this.child(
                    div()
                        .text_sm()
                        .text_color(theme.muted_foreground)
                        .child(title),
                )
            })
            .child(div().flex_1())
            .when(!self.nav.is_empty(), |this| {
                this.child(
                    div()
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(12.0))
                        .children(self.nav),
                )
                .child(div().flex_1())
            })
            .child(
                div()
                    .flex()
                    .flex_row()
                    .items_center()
                    .gap(px(12.0))
                    .children(self.actions),
            )
    }
}
