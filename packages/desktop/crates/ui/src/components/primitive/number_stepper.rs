//! NumberStepper — decrement / value / increment control.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnChange = Rc<dyn Fn(&i64, &mut Window, &mut App) + 'static>;

#[derive(IntoElement)]
pub struct NumberStepper {
    id: ElementId,
    style: StyleRefinement,
    value: i64,
    min: i64,
    max: i64,
    on_change: Option<OnChange>,
}

impl NumberStepper {
    pub fn new(id: impl Into<ElementId>, value: i64) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            value,
            min: i64::MIN,
            max: i64::MAX,
            on_change: None,
        }
    }

    pub fn range(mut self, min: i64, max: i64) -> Self {
        self.min = min;
        self.max = max;
        self
    }

    pub fn on_change(mut self, f: impl Fn(&i64, &mut Window, &mut App) + 'static) -> Self {
        self.on_change = Some(Rc::new(f));
        self
    }
}

impl Styled for NumberStepper {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for NumberStepper {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let value = self.value;
        let min = self.min;
        let max = self.max;
        let on = self.on_change.clone();
        let id = self.id.clone();
        let mut root = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .overflow_hidden()
            .bg(theme.background);
        root.style().refine(&self.style);

        let btn = |suffix: &str, icon: PhosphorIcon, next: i64, enabled: bool| {
            let on = on.clone();
            div()
                .id(ElementId::Name(format!("{}-{}", id, suffix).into()))
                .size(px(28.0))
                .flex()
                .items_center()
                .justify_center()
                .when(enabled, |d| {
                    d.cursor_pointer().hover(|s| s.bg(theme.muted)).on_click(
                        move |_: &ClickEvent, w, cx| {
                            if let Some(on) = &on {
                                on(&next, w, cx);
                            }
                        },
                    )
                })
                .when(!enabled, |d| d.opacity(0.4))
                .child(Phosphor::new(icon).size(px(12.0)).color(theme.foreground))
        };

        root.child(btn(
            "dec",
            PhosphorIcon::Minus,
            value.saturating_sub(1).max(min),
            value > min,
        ))
        .child(
            div()
                .min_w(px(36.0))
                .px(px(6.0))
                .text_sm()
                .font_weight(FontWeight::MEDIUM)
                .text_center()
                .text_color(theme.foreground)
                .child(SharedString::from(value.to_string())),
        )
        .child(btn(
            "inc",
            PhosphorIcon::Plus,
            value.saturating_add(1).min(max),
            value < max,
        ))
    }
}
