//! Disclosure — a chevron that indicates expand / collapse.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, StatefulInteractiveElement as _, StyleRefinement, Styled, Window,
    div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&bool, &mut Window, &mut App) + 'static>;

#[derive(IntoElement)]
pub struct Disclosure {
    id: ElementId,
    style: StyleRefinement,
    open: bool,
    on_click: Option<OnClick>,
}

impl Disclosure {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            open: false,
            on_click: None,
        }
    }

    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&bool, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Styled for Disclosure {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Disclosure {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let open = self.open;
        let icon = if open {
            PhosphorIcon::CaretDown
        } else {
            PhosphorIcon::CaretRight
        };
        let mut root = div()
            .id(self.id)
            .size(px(20.0))
            .rounded(px(4.0))
            .flex()
            .items_center()
            .justify_center()
            .cursor_pointer()
            .hover(|s| s.bg(theme.muted))
            .child(
                Phosphor::new(icon)
                    .size(px(12.0))
                    .color(theme.muted_foreground),
            );
        root.style().refine(&self.style);
        root.when_some(self.on_click, |d, on| {
            d.on_click(move |_: &ClickEvent, w, cx| on(&!open, w, cx))
        })
    }
}
