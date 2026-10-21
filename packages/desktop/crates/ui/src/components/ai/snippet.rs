//! Snippet — single-line copyable command / code chip.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnCopy = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Compact monospace snippet with optional prefix and copy.
#[derive(IntoElement)]
pub struct Snippet {
    id: ElementId,
    style: StyleRefinement,
    code: SharedString,
    prefix: Option<SharedString>,
    on_copy: Option<OnCopy>,
}

impl Snippet {
    pub fn new(id: impl Into<ElementId>, code: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            code: code.into(),
            prefix: None,
            on_copy: None,
        }
    }

    pub fn prefix(mut self, prefix: impl Into<SharedString>) -> Self {
        self.prefix = Some(prefix.into());
        self
    }

    pub fn on_copy(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_copy = Some(Rc::new(f));
        self
    }
}

impl Styled for Snippet {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Snippet {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .px(px(10.0))
            .py(px(8.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);

        root.when_some(self.prefix, |this, prefix| {
            this.child(
                div()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child(prefix),
            )
        })
        .child(
            div()
                .flex_1()
                .min_w_0()
                .font_family(theme.mono_font_family.clone())
                .text_sm()
                .text_color(theme.foreground)
                .child(self.code),
        )
        .when_some(self.on_copy, |this, on_copy| {
            this.child(
                div()
                    .id((self.id, "copy"))
                    .flex()
                    .items_center()
                    .justify_center()
                    .size(px(24.0))
                    .rounded(theme.radius)
                    .cursor_pointer()
                    .on_click(move |e, w, cx| on_copy(e, w, cx))
                    .child(
                        Phosphor::new(PhosphorIcon::Copy)
                            .size(px(12.0))
                            .color(theme.muted_foreground),
                    ),
            )
        })
    }
}
