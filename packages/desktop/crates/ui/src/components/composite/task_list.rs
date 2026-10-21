//! TaskList — checklist-style task rows with status.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnToggle = Rc<dyn Fn(&bool, &mut Window, &mut App) + 'static>;

#[derive(IntoElement)]
pub struct TaskItem {
    id: ElementId,
    title: SharedString,
    done: bool,
    meta: Option<SharedString>,
    on_toggle: Option<OnToggle>,
}

impl TaskItem {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            done: false,
            meta: None,
            on_toggle: None,
        }
    }

    pub fn done(mut self, done: bool) -> Self {
        self.done = done;
        self
    }

    pub fn meta(mut self, meta: impl Into<SharedString>) -> Self {
        self.meta = Some(meta.into());
        self
    }

    pub fn on_toggle(mut self, f: impl Fn(&bool, &mut Window, &mut App) + 'static) -> Self {
        self.on_toggle = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for TaskItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let done = self.done;
        let id = self.id.clone();
        let icon = if done {
            PhosphorIcon::CheckCircle
        } else {
            PhosphorIcon::Circle
        };
        div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .py(px(6.0))
            .child(
                div()
                    .id(ElementId::Name(format!("{}-toggle", id).into()))
                    .size(px(20.0))
                    .flex()
                    .items_center()
                    .justify_center()
                    .cursor_pointer()
                    .when_some(self.on_toggle, |d, on| {
                        d.on_click(move |_: &ClickEvent, w, cx| on(&!done, w, cx))
                    })
                    .child(Phosphor::new(icon).size(px(14.0)).color(if done {
                        theme.success
                    } else {
                        theme.muted_foreground
                    })),
            )
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
                            .text_color(if done {
                                theme.muted_foreground
                            } else {
                                theme.foreground
                            })
                            .child(self.title),
                    )
                    .when_some(self.meta, |d, m| {
                        d.child(div().text_xs().text_color(theme.muted_foreground).child(m))
                    }),
            )
    }
}

#[derive(IntoElement)]
pub struct TaskList {
    id: ElementId,
    style: StyleRefinement,
    title: Option<SharedString>,
    items: Vec<AnyElement>,
}

impl TaskList {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: None,
            items: Vec::new(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }
}

impl Styled for TaskList {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for TaskList {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .gap(px(2.0))
            .p(px(10.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);
        root.when_some(self.title, |d, t| {
            d.child(
                div()
                    .pb(px(6.0))
                    .text_sm()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(theme.foreground)
                    .child(t),
            )
        })
        .children(self.items)
    }
}
