//! Quote — a blockquote with a leading accent rail.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString,
    StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct Quote {
    style: StyleRefinement,
    text: SharedString,
    cite: Option<SharedString>,
    children: Vec<AnyElement>,
}

impl Quote {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
            cite: None,
            children: Vec::new(),
        }
    }

    pub fn cite(mut self, cite: impl Into<SharedString>) -> Self {
        self.cite = Some(cite.into());
        self
    }
}

impl ParentElement for Quote {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Quote {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Quote {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .w_full()
            .flex()
            .flex_row()
            .gap(px(10.0))
            .pl(px(12.0))
            .border_l_2()
            .border_color(theme.accent)
            .child(
                div()
                    .flex_1()
                    .flex()
                    .flex_col()
                    .gap(px(4.0))
                    .child(
                        div()
                            .text_sm()
                            .italic()
                            .text_color(theme.foreground)
                            .child(self.text),
                    )
                    .when_some(self.cite, |d, cite| {
                        d.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(cite),
                        )
                    })
                    .children(self.children),
            );
        root.style().refine(&self.style);
        root
    }
}
