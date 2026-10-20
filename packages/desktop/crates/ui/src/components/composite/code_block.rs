//! CodeBlock — read-only monospace snippet with optional language label and copy.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnCopy = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// A presentational code surface. For editable highlighted buffers use
/// [`CodeEditor`](crate::components::composite::code_editor::CodeEditor).
#[derive(IntoElement)]
pub struct CodeBlock {
    id: ElementId,
    style: StyleRefinement,
    code: SharedString,
    language: Option<SharedString>,
    on_copy: Option<OnCopy>,
    line_numbers: bool,
}

impl CodeBlock {
    pub fn new(id: impl Into<ElementId>, code: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            code: code.into(),
            language: None,
            on_copy: None,
            line_numbers: false,
        }
    }

    pub fn language(mut self, language: impl Into<SharedString>) -> Self {
        self.language = Some(language.into());
        self
    }

    pub fn on_copy(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_copy = Some(Rc::new(f));
        self
    }

    pub fn line_numbers(mut self, enabled: bool) -> Self {
        self.line_numbers = enabled;
        self
    }
}

impl Styled for CodeBlock {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for CodeBlock {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let lines: Vec<SharedString> = self.code.split('\n').map(SharedString::from).collect();
        let show_copy = self.on_copy.is_some();

        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_col()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.muted.opacity(0.45))
            .overflow_hidden();
        root.style().refine(&self.style);

        root.child(
            div()
                .w_full()
                .px(px(12.0))
                .py(px(6.0))
                .flex()
                .flex_row()
                .items_center()
                .justify_between()
                .border_b_1()
                .border_color(theme.border)
                .child(
                    div()
                        .text_xs()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.muted_foreground)
                        .child(self.language.unwrap_or_else(|| "code".into())),
                )
                .when(show_copy, |this| {
                    let on = self.on_copy.clone();
                    this.child(
                        div()
                            .id(ElementId::Name(format!("{}-copy", self.id).into()))
                            .size(px(24.0))
                            .rounded(px(6.0))
                            .flex()
                            .items_center()
                            .justify_center()
                            .cursor_pointer()
                            .hover(|s| s.bg(theme.muted))
                            .on_click(move |e, window, cx| {
                                if let Some(on) = &on {
                                    on(e, window, cx);
                                }
                            })
                            .child(
                                Phosphor::new(PhosphorIcon::Copy)
                                    .size(px(12.0))
                                    .color(theme.muted_foreground),
                            ),
                    )
                }),
        )
        .child(
            div()
                .w_full()
                .p(px(12.0))
                .flex()
                .flex_col()
                .gap(px(2.0))
                .children(lines.into_iter().enumerate().map(|(ix, line)| {
                    div()
                        .flex()
                        .flex_row()
                        .gap(px(12.0))
                        .when(self.line_numbers, |d| {
                            d.child(
                                div()
                                    .w(px(24.0))
                                    .flex_none()
                                    .text_xs()
                                    .font_family(theme.mono_font_family.clone())
                                    .text_color(theme.muted_foreground.opacity(0.7))
                                    .text_right()
                                    .child(format!("{}", ix + 1)),
                            )
                        })
                        .child(
                            div()
                                .flex_1()
                                .min_w_0()
                                .text_xs()
                                .font_family(theme.mono_font_family.clone())
                                .text_color(theme.foreground)
                                .child(if line.is_empty() {
                                    SharedString::from(" ")
                                } else {
                                    line
                                }),
                        )
                })),
        )
    }
}
