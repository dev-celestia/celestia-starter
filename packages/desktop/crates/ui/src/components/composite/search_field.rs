//! Search field — input chrome with leading search icon, clear button, and
//! optional loading spinner / filter chips.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::primitive::spinner::Spinner;
use crate::theme::ActiveTheme as _;

type OnClear = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// A search-shaped control shell. Pass the live input via [`SearchField::input`].
#[derive(IntoElement)]
pub struct SearchField {
    id: ElementId,
    style: StyleRefinement,
    input: Option<AnyElement>,
    placeholder_hint: Option<SharedString>,
    loading: bool,
    clearable: bool,
    on_clear: Option<OnClear>,
    chips: Vec<AnyElement>,
}

impl SearchField {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            input: None,
            placeholder_hint: None,
            loading: false,
            clearable: true,
            on_clear: None,
            chips: Vec::new(),
        }
    }

    /// The interactive input element (typically `Input::new(...).appearance(false)`
    /// so the field's own chrome does not nest inside this shell's border).
    pub fn input(mut self, input: impl IntoElement) -> Self {
        self.input = Some(input.into_any_element());
        self
    }

    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    pub fn clearable(mut self, clearable: bool) -> Self {
        self.clearable = clearable;
        self
    }

    pub fn on_clear(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_clear = Some(Rc::new(f));
        self
    }

    pub fn chip(mut self, chip: impl IntoElement) -> Self {
        self.chips.push(chip.into_any_element());
        self
    }

    pub fn hint(mut self, hint: impl Into<SharedString>) -> Self {
        self.placeholder_hint = Some(hint.into());
        self
    }
}

impl Styled for SearchField {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SearchField {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let show_clear = self.clearable && self.on_clear.is_some() && !self.loading;
        let has_input = self.input.is_some();

        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0));
        root.style().refine(&self.style);

        root.child(
            div()
                .w_full()
                .h(px(32.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .px(px(10.0))
                .rounded(theme.radius)
                .border_1()
                .border_color(theme.border)
                .bg(theme.background)
                .child(
                    Phosphor::new(PhosphorIcon::MagnifyingGlass)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                )
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .when_some(self.input, |this, input| this.child(input))
                        .when(!has_input, |this| {
                            this.child(
                                div().text_sm().text_color(theme.muted_foreground).child(
                                    self.placeholder_hint.unwrap_or_else(|| "Search…".into()),
                                ),
                            )
                        }),
                )
                .when(self.loading, |this| {
                    this.child(Spinner::new().size(px(14.0)))
                })
                .when(show_clear, |this| {
                    let on_clear = self.on_clear.clone();
                    this.child(
                        div()
                            .id(ElementId::Name(format!("{}-clear", self.id).into()))
                            .size(px(20.0))
                            .rounded(px(4.0))
                            .flex()
                            .items_center()
                            .justify_center()
                            .cursor_pointer()
                            .hover(|s| s.bg(theme.muted))
                            .on_click(move |e, window, cx| {
                                if let Some(on) = &on_clear {
                                    on(e, window, cx);
                                }
                            })
                            .child(
                                Phosphor::new(PhosphorIcon::X)
                                    .size(px(12.0))
                                    .color(theme.muted_foreground),
                            ),
                    )
                }),
        )
        .when(!self.chips.is_empty(), |this| {
            this.child(
                div()
                    .flex()
                    .flex_row()
                    .flex_wrap()
                    .gap(px(6.0))
                    .children(self.chips),
            )
        })
    }
}
