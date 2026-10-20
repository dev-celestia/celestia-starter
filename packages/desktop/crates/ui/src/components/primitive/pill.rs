//! Pill — a rounded selection / filter pill.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

#[derive(IntoElement)]
pub struct Pill {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    active: bool,
    on_click: Option<OnClick>,
}

impl Pill {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            active: false,
            on_click: None,
        }
    }

    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Styled for Pill {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Pill {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let active = self.active;
        let mut root = div()
            .id(self.id)
            .h(px(28.0))
            .px(px(12.0))
            .rounded_full()
            .flex()
            .items_center()
            .justify_center()
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .whitespace_nowrap()
            .when(active, |d| {
                d.bg(theme.accent).text_color(theme.accent_foreground)
            })
            .when(!active, |d| {
                d.bg(theme.muted)
                    .text_color(theme.muted_foreground)
                    .hover(|s| s.bg(theme.muted).text_color(theme.foreground))
            })
            .when(self.on_click.is_some(), |d| d.cursor_pointer())
            .child(self.label);
        root.style().refine(&self.style);
        root.when_some(self.on_click, |d, on| {
            d.on_click(move |e, w, cx| on(e, w, cx))
        })
    }
}
