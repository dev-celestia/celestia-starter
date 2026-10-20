//! Tab bar — closable document tabs with dirty / active indicators.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// One document tab in a [`TabBar`].
#[derive(Clone)]
pub struct TabBarItem {
    pub id: SharedString,
    pub label: SharedString,
    pub dirty: bool,
    pub closable: bool,
}

impl TabBarItem {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            dirty: false,
            closable: true,
        }
    }

    pub fn dirty(mut self, dirty: bool) -> Self {
        self.dirty = dirty;
        self
    }

    pub fn closable(mut self, closable: bool) -> Self {
        self.closable = closable;
        self
    }
}

/// A horizontal strip of document tabs.
#[derive(IntoElement)]
pub struct TabBar {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<TabBarItem>,
    active_id: Option<SharedString>,
    on_select: Option<Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>>,
    on_close: Option<Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>>,
}

impl TabBar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            items: Vec::new(),
            active_id: None,
            on_select: None,
            on_close: None,
        }
    }

    pub fn item(mut self, item: TabBarItem) -> Self {
        self.items.push(item);
        self
    }

    pub fn items(mut self, items: impl IntoIterator<Item = TabBarItem>) -> Self {
        self.items.extend(items);
        self
    }

    pub fn active(mut self, id: impl Into<SharedString>) -> Self {
        self.active_id = Some(id.into());
        self
    }

    pub fn on_select(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(f));
        self
    }

    pub fn on_close(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_close = Some(Rc::new(f));
        self
    }
}

impl Styled for TabBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for TabBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let active_id = self.active_id.clone();

        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_end()
            .gap(px(2.0))
            .px(px(4.0))
            .pt(px(4.0))
            .border_b_1()
            .border_color(theme.border)
            .bg(theme.muted.opacity(0.4));
        root.style().refine(&self.style);

        root.children(self.items.into_iter().map(|item| {
            let selected = active_id.as_ref().is_some_and(|a| a == &item.id);
            let tab_id = item.id.clone();
            let close_id = item.id.clone();
            let on_select = self.on_select.clone();
            let on_close = self.on_close.clone();

            div()
                .id(ElementId::Name(format!("tab-{}", item.id).into()))
                .h(px(22.5))
                .max_w(px(200.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(4.0))
                .px(px(8.0))
                .rounded_t(theme.radius_sm())
                .border_1()
                .border_b_0()
                .border_color(if selected {
                    theme.border
                } else {
                    theme.border.opacity(0.0)
                })
                .bg(if selected {
                    theme.background
                } else {
                    theme.transparent
                })
                .cursor_pointer()
                .hover(|s| s.bg(theme.muted))
                .on_click(move |_, window, cx| {
                    if let Some(on) = &on_select {
                        on(&tab_id, window, cx);
                    }
                })
                .when(item.dirty, |this| {
                    this.child(div().size(px(6.0)).rounded_full().bg(theme.accent))
                })
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .text_xs()
                        .font_weight(if selected {
                            FontWeight::MEDIUM
                        } else {
                            FontWeight::NORMAL
                        })
                        .text_color(if selected {
                            theme.foreground
                        } else {
                            theme.muted_foreground
                        })
                        .whitespace_nowrap()
                        .overflow_hidden()
                        .text_ellipsis()
                        .child(item.label),
                )
                .when(item.closable, |this| {
                    this.child(
                        div()
                            .id(ElementId::Name(format!("tab-close-{}", item.id).into()))
                            .size(px(14.0))
                            .rounded(px(3.0))
                            .flex()
                            .items_center()
                            .justify_center()
                            .hover(|s| s.bg(theme.border))
                            .on_click(move |_: &ClickEvent, window, cx| {
                                cx.stop_propagation();
                                if let Some(on) = &on_close {
                                    on(&close_id, window, cx);
                                }
                            })
                            .child(
                                Phosphor::new(PhosphorIcon::X)
                                    .size(px(9.0))
                                    .color(theme.muted_foreground),
                            ),
                    )
                })
        }))
    }
}
