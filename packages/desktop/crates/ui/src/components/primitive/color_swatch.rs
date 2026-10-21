//! ColorSwatch — a small colour preview tile.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, Hsla, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

#[derive(IntoElement)]
pub struct ColorSwatch {
    id: ElementId,
    style: StyleRefinement,
    color: Hsla,
    label: Option<SharedString>,
    selected: bool,
    size: f32,
    on_click: Option<OnClick>,
}

impl ColorSwatch {
    pub fn new(id: impl Into<ElementId>, color: Hsla) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            color,
            label: None,
            selected: false,
            size: 20.0,
            on_click: None,
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Styled for ColorSwatch {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ColorSwatch {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let s = px(self.size);
        let id = self.id.clone();
        let mut root = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0));
        root.style().refine(&self.style);
        root.child(
            div()
                .id(ElementId::Name(format!("{}-swatch", id).into()))
                .size(s)
                .rounded(theme.radius)
                .bg(self.color)
                .border_1()
                .border_color(if self.selected {
                    theme.accent
                } else {
                    theme.border
                })
                .when(self.on_click.is_some(), |d| d.cursor_pointer())
                .when_some(self.on_click, |d, on| {
                    d.on_click(move |e, w, cx| on(e, w, cx))
                }),
        )
        .when_some(self.label, |d, label| {
            d.child(
                div()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child(label),
            )
        })
    }
}
