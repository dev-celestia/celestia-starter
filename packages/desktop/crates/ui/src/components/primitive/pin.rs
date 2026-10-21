//! Pin — a pinned / favorite indicator glyph button.

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
pub struct Pin {
    id: ElementId,
    style: StyleRefinement,
    pinned: bool,
    on_click: Option<OnClick>,
}

impl Pin {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            pinned: false,
            on_click: None,
        }
    }

    pub fn pinned(mut self, pinned: bool) -> Self {
        self.pinned = pinned;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&bool, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Styled for Pin {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Pin {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let pinned = self.pinned;
        let color = if pinned {
            theme.accent
        } else {
            theme.muted_foreground
        };
        let mut root = div()
            .id(self.id)
            .size(px(24.0))
            .rounded(px(6.0))
            .flex()
            .items_center()
            .justify_center()
            .cursor_pointer()
            .hover(|s| s.bg(theme.muted))
            .child(
                Phosphor::new(PhosphorIcon::PushPin)
                    .size(px(14.0))
                    .color(color),
            );
        root.style().refine(&self.style);
        root.when_some(self.on_click, |d, on| {
            d.on_click(move |_: &ClickEvent, w, cx| on(&!pinned, w, cx))
        })
    }
}
