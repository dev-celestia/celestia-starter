//! ModelSelector — compact model picker list.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnSelect = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// One model option inside a [`ModelSelector`].
#[derive(Clone)]
pub struct ModelOption {
    pub id: SharedString,
    pub name: SharedString,
    pub provider: SharedString,
    pub selected: bool,
}

impl ModelOption {
    pub fn new(
        id: impl Into<SharedString>,
        name: impl Into<SharedString>,
        provider: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            provider: provider.into(),
            selected: false,
        }
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }
}

/// Presentational model list (host owns the dialog / popover shell).
#[derive(IntoElement)]
pub struct ModelSelector {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    options: Vec<ModelOption>,
    on_select: Option<Rc<dyn Fn(&str, &ClickEvent, &mut Window, &mut App) + 'static>>,
}

impl ModelSelector {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: "Models".into(),
            options: Vec::new(),
            on_select: None,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn option(mut self, option: ModelOption) -> Self {
        self.options.push(option);
        self
    }

    pub fn on_select(
        mut self,
        f: impl Fn(&str, &ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_select = Some(Rc::new(f));
        self
    }
}

impl Styled for ModelSelector {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ModelSelector {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_col()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .overflow_hidden();
        root.style().refine(&self.style);

        let on_select = self.on_select.clone();
        root.child(
            div()
                .px(px(12.0))
                .py(px(10.0))
                .border_b_1()
                .border_color(theme.border)
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .child(
                    Phosphor::new(PhosphorIcon::Cpu)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                )
                .child(
                    div()
                        .text_sm()
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(theme.foreground)
                        .child(self.title),
                ),
        )
        .children(self.options.into_iter().enumerate().map(|(i, opt)| {
            let selected = opt.selected;
            let id = opt.id.clone();
            let mut row = div()
                .id(ElementId::Name(format!("model-{}", opt.id).into()))
                .w_full()
                .px(px(12.0))
                .py(px(10.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(10.0))
                .cursor_pointer()
                .when(i > 0, |d| d.border_t_1().border_color(theme.border))
                .when(selected, |d| d.bg(theme.accent.opacity(0.08)))
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
                                .child(opt.name),
                        )
                        .child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(opt.provider),
                        ),
                )
                .when(selected, |d| {
                    d.child(
                        Phosphor::new(PhosphorIcon::CheckCircle)
                            .size(px(14.0))
                            .color(theme.accent),
                    )
                });
            if let Some(cb) = on_select.clone() {
                row = row.on_click(move |e, w, cx| cb(id.as_ref(), e, w, cx));
            }
            row
        }))
    }
}

/// Trigger chip that shows the active model name.
#[derive(IntoElement)]
pub struct ModelSelectorTrigger {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    on_click: Option<OnSelect>,
}

impl ModelSelectorTrigger {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            on_click: None,
        }
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Styled for ModelSelectorTrigger {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ModelSelectorTrigger {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut chip = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0))
            .px(px(10.0))
            .py(px(6.0))
            .rounded_full()
            .border_1()
            .border_color(theme.border)
            .bg(theme.background)
            .cursor_pointer()
            .child(
                Phosphor::new(PhosphorIcon::Cpu)
                    .size(px(12.0))
                    .color(theme.muted_foreground),
            )
            .child(
                div()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.foreground)
                    .child(self.label),
            )
            .child(
                Phosphor::new(PhosphorIcon::CaretDown)
                    .size(px(12.0))
                    .color(theme.muted_foreground),
            );
        chip.style().refine(&self.style);
        if let Some(on_click) = self.on_click {
            chip = chip.on_click(move |e, w, cx| on_click(e, w, cx));
        }
        chip
    }
}
