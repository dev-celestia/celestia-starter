//! Data table toolbar — search, column visibility cue, and bulk actions.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// Toolbar that sits above a table: leading search, trailing actions, optional
/// selection summary.
#[derive(IntoElement)]
pub struct DataTableToolbar {
    id: ElementId,
    style: StyleRefinement,
    search: Option<AnyElement>,
    selected_count: Option<usize>,
    leading: Vec<AnyElement>,
    trailing: Vec<AnyElement>,
}

impl DataTableToolbar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            search: None,
            selected_count: None,
            leading: Vec::new(),
            trailing: Vec::new(),
        }
    }

    pub fn search(mut self, search: impl IntoElement) -> Self {
        self.search = Some(search.into_any_element());
        self
    }

    pub fn selected_count(mut self, count: usize) -> Self {
        self.selected_count = Some(count);
        self
    }

    pub fn leading(mut self, child: impl IntoElement) -> Self {
        self.leading.push(child.into_any_element());
        self
    }

    pub fn trailing(mut self, child: impl IntoElement) -> Self {
        self.trailing.push(child.into_any_element());
        self
    }
}

impl Styled for DataTableToolbar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for DataTableToolbar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(10.0))
            .px(px(4.0))
            .py(px(6.0));
        root.style().refine(&self.style);

        root.child(
            div()
                .w(px(240.0))
                .flex_none()
                .when_some(self.search, |this, search| this.child(search)),
        )
        .when_some(self.selected_count.filter(|c| *c > 0), |this, count| {
            this.child(
                div()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.accent)
                    .child(SharedString::from(format!("{count} selected"))),
            )
        })
        .child(
            div()
                .flex_1()
                .min_w_0()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(6.0))
                .children(self.leading),
        )
        .child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(6.0))
                .children(self.trailing),
        )
    }
}
