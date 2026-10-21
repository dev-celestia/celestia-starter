//! Sources — collapsible list of citations used by a response.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Collapsible “Used N sources” disclosure.
#[derive(IntoElement)]
pub struct Sources {
    id: ElementId,
    style: StyleRefinement,
    count: usize,
    open: bool,
    children: Vec<AnyElement>,
}

impl Sources {
    pub fn new(id: impl Into<ElementId>, count: usize) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            count,
            open: false,
            children: Vec::new(),
        }
    }

    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for Sources {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Sources {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Sources {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div().id(self.id).w_full().flex().flex_col().gap(px(8.0));
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .child(
                    div()
                        .text_xs()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.accent)
                        .child(format!("Used {} sources", self.count)),
                )
                .child(
                    Phosphor::new(PhosphorIcon::CaretDown)
                        .size(px(12.0))
                        .color(theme.accent),
                ),
        )
        .when(self.open, |this| {
            this.child(div().flex().flex_col().gap(px(6.0)).children(self.children))
        })
    }
}

/// A single source row (title + optional href caption).
#[derive(IntoElement)]
pub struct Source {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    href: Option<SharedString>,
}

impl Source {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            href: None,
        }
    }

    pub fn href(mut self, href: impl Into<SharedString>) -> Self {
        self.href = Some(href.into());
        self
    }
}

impl Styled for Source {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Source {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut row = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .child(
                Phosphor::new(PhosphorIcon::BookOpen)
                    .size(px(14.0))
                    .color(theme.muted_foreground),
            )
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap(px(1.0))
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.foreground)
                            .child(self.title),
                    )
                    .when_some(self.href, |d, href| {
                        d.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(href),
                        )
                    }),
            );
        row.style().refine(&self.style);
        row
    }
}
