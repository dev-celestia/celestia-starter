//! SideNav — vertical navigation list with active state.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

#[derive(IntoElement)]
pub struct SideNavItem {
    id: ElementId,
    label: SharedString,
    icon: Option<PhosphorIcon>,
    active: bool,
    badge: Option<SharedString>,
    on_click: Option<OnClick>,
}

impl SideNavItem {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon: None,
            active: false,
            badge: None,
            on_click: None,
        }
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    pub fn badge(mut self, badge: impl Into<SharedString>) -> Self {
        self.badge = Some(badge.into());
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for SideNavItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let active = self.active;
        div()
            .id(self.id)
            .w_full()
            .h(px(32.0))
            .px(px(10.0))
            .rounded(px(6.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .when(active, |d| d.bg(theme.accent.opacity(0.12)))
            .when(!active, |d| d.hover(|s| s.bg(theme.muted)))
            .cursor_pointer()
            .when_some(self.on_click, |d, on| {
                d.on_click(move |e, w, cx| on(e, w, cx))
            })
            .when_some(self.icon, |d, icon| {
                d.child(Phosphor::new(icon).size(px(14.0)).color(if active {
                    theme.accent
                } else {
                    theme.muted_foreground
                }))
            })
            .child(
                div()
                    .flex_1()
                    .text_sm()
                    .font_weight(if active {
                        FontWeight::SEMIBOLD
                    } else {
                        FontWeight::MEDIUM
                    })
                    .text_color(if active {
                        theme.foreground
                    } else {
                        theme.muted_foreground
                    })
                    .child(self.label),
            )
            .when_some(self.badge, |d, b| {
                d.child(div().text_xs().text_color(theme.muted_foreground).child(b))
            })
    }
}

#[derive(IntoElement)]
pub struct SideNav {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<AnyElement>,
}

impl SideNav {
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

impl Styled for SideNav {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SideNav {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div().id(self.id).w_full().flex().flex_col().gap(px(2.0));
        root.style().refine(&self.style);
        root.children(self.items)
    }
}
