//! FindReplaceBar — find / replace chrome for editors.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct FindReplaceBar {
    id: ElementId,
    style: StyleRefinement,
    find: Option<AnyElement>,
    replace: Option<AnyElement>,
    match_label: Option<SharedString>,
    actions: Vec<AnyElement>,
    show_replace: bool,
}

impl FindReplaceBar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            find: None,
            replace: None,
            match_label: None,
            actions: Vec::new(),
            show_replace: false,
        }
    }

    pub fn find(mut self, find: impl IntoElement) -> Self {
        self.find = Some(find.into_any_element());
        self
    }

    pub fn replace(mut self, replace: impl IntoElement) -> Self {
        self.replace = Some(replace.into_any_element());
        self.show_replace = true;
        self
    }

    pub fn match_label(mut self, label: impl Into<SharedString>) -> Self {
        self.match_label = Some(label.into());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }
}

impl Styled for FindReplaceBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for FindReplaceBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_find = self.find.is_some();
        let has_replace = self.replace.is_some();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .gap(px(6.0))
            .p(px(8.0))
            .border_b_1()
            .border_color(theme.border)
            .bg(theme.background);
        root.style().refine(&self.style);
        root.child(
            div()
                .w_full()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .when_some(self.find, |d, f| d.child(f))
                        .when(!has_find, |d| {
                            d.child(
                                div()
                                    .text_sm()
                                    .text_color(theme.muted_foreground)
                                    .child("Find…"),
                            )
                        }),
                )
                .when_some(self.match_label, |d, m| {
                    d.child(div().text_xs().text_color(theme.muted_foreground).child(m))
                })
                .children(self.actions),
        )
        .when(self.show_replace, |d| {
            d.child(
                div()
                    .w_full()
                    .when_some(self.replace, |el, r| el.child(r))
                    .when(!has_replace, |el| {
                        el.child(
                            div()
                                .text_sm()
                                .text_color(theme.muted_foreground)
                                .child("Replace…"),
                        )
                    }),
            )
        })
    }
}
