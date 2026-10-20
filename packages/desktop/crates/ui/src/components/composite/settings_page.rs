//! Settings page — sectioned scrollable settings with sticky section titles.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// One titled block inside a [`SettingsPage`].
#[derive(IntoElement)]
pub struct SettingsSection {
    title: SharedString,
    description: Option<SharedString>,
    children: Vec<AnyElement>,
}

impl SettingsSection {
    pub fn new(title: impl Into<SharedString>) -> Self {
        Self {
            title: title.into(),
            description: None,
            children: Vec::new(),
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }
}

impl ParentElement for SettingsSection {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for SettingsSection {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .w_full()
            .flex()
            .flex_col()
            .gap(px(12.0))
            .child(
                div()
                    .bg(theme.background)
                    .pb(px(4.0))
                    .flex()
                    .flex_col()
                    .gap(px(2.0))
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(theme.foreground)
                            .child(self.title),
                    )
                    .when_some(self.description, |this, desc| {
                        this.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(desc),
                        )
                    }),
            )
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap(px(12.0))
                    .children(self.children),
            )
    }
}

/// A scrollable settings surface with a page title and stacked sections.
#[derive(IntoElement)]
pub struct SettingsPage {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    description: Option<SharedString>,
    sections: Vec<AnyElement>,
}

impl SettingsPage {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            description: None,
            sections: Vec::new(),
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn section(mut self, section: impl IntoElement) -> Self {
        self.sections.push(section.into_any_element());
        self
    }
}

impl Styled for SettingsPage {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SettingsPage {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .h_full()
            .flex()
            .flex_col()
            .gap(px(20.0))
            .p(px(20.0))
            .overflow_y_scroll();
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_col()
                .gap(px(4.0))
                .child(
                    div()
                        .text_size(px(20.0))
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(theme.foreground)
                        .child(self.title),
                )
                .when_some(self.description, |this, desc| {
                    this.child(
                        div()
                            .text_sm()
                            .text_color(theme.muted_foreground)
                            .child(desc),
                    )
                }),
        )
        .children(self.sections)
    }
}
