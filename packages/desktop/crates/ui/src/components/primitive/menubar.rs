//! Menubar — the desktop counterpart of
//! `packages/ui/src/components/primitive/menubar.tsx`.
//!
//! A top-of-window menu strip. Each [`MenubarMenu`] is a ghost trigger that
//! opens a [`PopupMenu`] via `Button::dropdown_menu` (same family as web's
//! menubar → dropdown-menu composition).

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::composite::menu::PopupMenu;
use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::theme::ActiveTheme as _;

type MenuBuilder = Box<dyn Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static>;

/// One top-level menu in a [`Menubar`].
pub struct MenubarMenu {
    id: ElementId,
    label: SharedString,
    build: MenuBuilder,
}

impl MenubarMenu {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        build: impl Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            build: Box::new(build),
        }
    }
}

/// A bordered strip of top-level menu triggers.
#[derive(IntoElement)]
pub struct Menubar {
    id: ElementId,
    style: StyleRefinement,
    menus: Vec<MenubarMenu>,
    trailing: Vec<AnyElement>,
}

impl Menubar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            menus: Vec::new(),
            trailing: Vec::new(),
        }
    }

    pub fn menu(mut self, menu: MenubarMenu) -> Self {
        self.menus.push(menu);
        self
    }

    pub fn trailing(mut self, child: impl IntoElement) -> Self {
        self.trailing.push(child.into_any_element());
        self
    }
}

impl Styled for Menubar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Menubar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .h(px(36.0))
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(2.0))
            .px(px(4.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background);
        root.style().refine(&self.style);

        root.children(self.menus.into_iter().map(|menu| {
            let build = menu.build;
            Button::new(menu.id)
                .variant(ButtonVariant::Ghost)
                .size(ButtonSize::Small)
                .label(menu.label)
                .dropdown_caret(true)
                .dropdown_menu(move |popup, window, cx| build(popup, window, cx))
        }))
        .when(!self.trailing.is_empty(), |this| {
            this.child(div().flex_1()).children(self.trailing)
        })
    }
}
