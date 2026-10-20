//! Navigation menu — the desktop counterpart of
//! `packages/ui/src/components/primitive/navigation-menu.tsx`.
//!
//! Horizontal nav with optional flyout menus. Flyouts ride
//! [`Button::dropdown_menu`](crate::components::primitive::button::Button::dropdown_menu)
//! (same PopupMenu family as the web menubar / dropdown composition).

use std::rc::Rc;

use gpui::{
    AnyElement, App, ClickEvent, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::composite::menu::PopupMenu;
use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::components::primitive::icon::PhosphorIcon;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;
type MenuBuilder = Rc<dyn Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static>;

/// One entry in a [`NavigationMenu`].
pub enum NavigationMenuItem {
    /// Immediate link / action — no flyout.
    Link {
        id: ElementId,
        label: SharedString,
        active: bool,
        on_click: Option<OnClick>,
    },
    /// Trigger that opens a dropdown flyout.
    Flyout {
        id: ElementId,
        label: SharedString,
        build: MenuBuilder,
    },
}

impl NavigationMenuItem {
    pub fn link(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self::Link {
            id: id.into(),
            label: label.into(),
            active: false,
            on_click: None,
        }
    }

    pub fn active(mut self, active: bool) -> Self {
        if let Self::Link { active: a, .. } = &mut self {
            *a = active;
        }
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        if let Self::Link { on_click, .. } = &mut self {
            *on_click = Some(Rc::new(f));
        }
        self
    }

    pub fn flyout(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        build: impl Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static,
    ) -> Self {
        Self::Flyout {
            id: id.into(),
            label: label.into(),
            build: Rc::new(build),
        }
    }
}

/// Horizontal navigation strip with link and flyout items.
#[derive(IntoElement)]
pub struct NavigationMenu {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<NavigationMenuItem>,
}

impl NavigationMenu {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            items: Vec::new(),
        }
    }

    pub fn item(mut self, item: NavigationMenuItem) -> Self {
        self.items.push(item);
        self
    }
}

impl Styled for NavigationMenu {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for NavigationMenu {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(2.0));
        root.style().refine(&self.style);

        root.children(self.items.into_iter().map(|item| -> AnyElement {
            match item {
                NavigationMenuItem::Link {
                    id,
                    label,
                    active,
                    on_click,
                } => {
                    let mut btn = Button::new(id)
                        .variant(if active {
                            ButtonVariant::Secondary
                        } else {
                            ButtonVariant::Ghost
                        })
                        .size(ButtonSize::Small)
                        .label(label);
                    if let Some(on) = on_click {
                        btn = btn.on_click(move |e, window, cx| on(e, window, cx));
                    }
                    btn.into_any_element()
                }
                NavigationMenuItem::Flyout { id, label, build } => Button::new(id)
                    .variant(ButtonVariant::Ghost)
                    .size(ButtonSize::Small)
                    .label(label)
                    .trailing_icon(PhosphorIcon::CaretDown)
                    .dropdown_menu(move |menu, window, cx| build(menu, window, cx))
                    .into_any_element(),
            }
        }))
    }
}
