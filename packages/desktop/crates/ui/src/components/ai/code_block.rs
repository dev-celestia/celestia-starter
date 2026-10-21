//! AiCodeBlock — read-only code surface with language label and copy.

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

/// Presentational AI code block (language chip + optional copy).
#[derive(IntoElement)]
pub struct AiCodeBlock {
    id: ElementId,
    style: StyleRefinement,
    code: SharedString,
    language: Option<SharedString>,
    on_copy: Option<OnCopy>,
}

impl AiCodeBlock {
    pub fn new(id: impl Into<ElementId>, code: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            code: code.into(),
            language: None,
            on_copy: None,
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
}

impl Styled for AiCodeBlock {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for AiCodeBlock {
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
            .bg(theme.muted.opacity(0.45))
            .overflow_hidden();
        root.style().refine(&self.style);

        let show_header = self.language.is_some() || self.on_copy.is_some();
        root.when(show_header, |this| {
            let mut header = div()
                .w_full()
                .px(px(12.0))
                .py(px(8.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .border_b_1()
                .border_color(theme.border);
            if let Some(lang) = self.language {
                header = header.child(
                    div()
                        .flex_1()
                        .text_xs()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.muted_foreground)
                        .child(lang),
                );
            } else {
                header = header.child(div().flex_1());
            }
            if let Some(on_copy) = self.on_copy {
                header = header.child(
                    div()
                        .id((self.id.clone(), "copy"))
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(4.0))
                        .px(px(6.0))
                        .py(px(2.0))
                        .rounded(theme.radius)
                        .cursor_pointer()
                        .on_click(move |e, w, cx| on_copy(e, w, cx))
                        .child(
                            Phosphor::new(PhosphorIcon::Copy)
                                .size(px(12.0))
                                .color(theme.muted_foreground),
                        )
                        .child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child("Copy"),
                        ),
                );
            }
            this.child(header)
        })
        .child(
            div()
                .w_full()
                .p(px(12.0))
                .font_family(theme.mono_font_family.clone())
                .text_sm()
                .text_color(theme.foreground)
                .child(self.code),
        )
    }
}
