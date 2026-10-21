//! Fab — a circular floating action button.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, InteractiveElement as _, IntoElement, MouseButton, ParentElement,
    Refineable as _, RenderOnce, Role, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::focus_ring::focus_ring;
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

#[derive(IntoElement)]
pub struct Fab {
    id: ElementId,
    style: StyleRefinement,
    icon: PhosphorIcon,
    /// Accessible name — icon-only FABs need an explicit label for AT.
    accessibility_label: SharedString,
    on_click: Option<OnClick>,
}

impl Fab {
    pub fn new(id: impl Into<ElementId>, icon: PhosphorIcon) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            icon,
            accessibility_label: SharedString::from("Action"),
            on_click: None,
        }
    }

    /// Accessible name announced by assistive technology.
    pub fn accessibility_label(mut self, label: impl Into<SharedString>) -> Self {
        self.accessibility_label = label.into();
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Styled for Fab {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Fab {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let accent = cx.theme().accent;
        let accent_fg = cx.theme().accent_foreground;
        let focus_handle = window.use_keyed_state(self.id.clone(), cx, |_, cx| cx.focus_handle());
        let focus_handle = focus_handle.read(cx).clone();

        let clickable = self.on_click.is_some();
        let mut root = div()
            .id(self.id)
            .size(px(48.0))
            .rounded_full()
            .bg(accent)
            .flex()
            .items_center()
            .justify_center()
            .role(Role::Button)
            .aria_label(self.accessibility_label)
            .track_focus(&focus_handle.clone().tab_index(0).tab_stop(true))
            .when(clickable, |d| {
                d.cursor_pointer()
                    .hover(|s| s.opacity(0.92))
                    // Keep parent scroll / drag handlers from eating the press.
                    .on_mouse_down(MouseButton::Left, |_, _, cx| cx.stop_propagation())
            })
            .child(Phosphor::new(self.icon).size(px(20.0)).color(accent_fg));
        root.style().refine(&self.style);
        root = root.when_some(self.on_click, |d, on| {
            d.on_click(move |e, w, cx| {
                cx.stop_propagation();
                on(e, w, cx)
            })
        });

        if focus_handle.is_focused(window) {
            root = focus_ring(root, window, cx);
        }
        root
    }
}
