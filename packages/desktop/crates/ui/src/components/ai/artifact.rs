//! Artifact — bordered panel for generated files / canvases.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div,
    px,
};

use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::components::primitive::icon::PhosphorIcon;
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Generated artifact chrome with title, actions, and body.
#[derive(IntoElement)]
pub struct Artifact {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    description: Option<SharedString>,
    actions: Vec<AnyElement>,
    children: Vec<AnyElement>,
    on_close: Option<OnClick>,
}

impl Artifact {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            description: None,
            actions: Vec::new(),
            children: Vec::new(),
            on_close: None,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }

    pub fn on_close(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_close = Some(Rc::new(f));
        self
    }
}

impl ParentElement for Artifact {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Artifact {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Artifact {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_col()
            .rounded(theme.radius_xl())
            .border_1()
            .border_color(theme.border)
            .bg(theme.background)
            .overflow_hidden();
        root.style().refine(&self.style);

        let mut header = div()
            .w_full()
            .px(px(14.0))
            .py(px(10.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(10.0))
            .border_b_1()
            .border_color(theme.border)
            .bg(theme.muted.opacity(0.35))
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .flex()
                    .flex_col()
                    .gap(px(2.0))
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.foreground)
                            .child(self.title),
                    )
                    .when_some(self.description, |d, desc| {
                        d.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(desc),
                        )
                    }),
            )
            .children(self.actions);

        if let Some(on_close) = self.on_close {
            header = header.child(
                Button::icon((self.id.clone(), "close"), PhosphorIcon::X)
                    .variant(ButtonVariant::Ghost)
                    .size(ButtonSize::IconSm)
                    .on_click(move |e, w, cx| on_close(e, w, cx)),
            );
        }

        root.child(header)
            .child(div().w_full().flex_1().p(px(14.0)).children(self.children))
    }
}
