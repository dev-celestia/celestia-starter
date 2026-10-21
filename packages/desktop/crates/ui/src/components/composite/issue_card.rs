//! IssueCard — issue / ticket summary card.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum IssueTone {
    #[default]
    Default,
    Open,
    Closed,
    Urgent,
}

#[derive(IntoElement)]
pub struct IssueCard {
    id: ElementId,
    style: StyleRefinement,
    key: SharedString,
    title: SharedString,
    meta: Option<SharedString>,
    tone: IssueTone,
    actions: Vec<AnyElement>,
}

impl IssueCard {
    pub fn new(
        id: impl Into<ElementId>,
        key: impl Into<SharedString>,
        title: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            key: key.into(),
            title: title.into(),
            meta: None,
            tone: IssueTone::default(),
            actions: Vec::new(),
        }
    }

    pub fn meta(mut self, meta: impl Into<SharedString>) -> Self {
        self.meta = Some(meta.into());
        self
    }

    pub fn tone(mut self, tone: IssueTone) -> Self {
        self.tone = tone;
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }
}

impl Styled for IssueCard {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for IssueCard {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let accent = match self.tone {
            IssueTone::Default => theme.border,
            IssueTone::Open => theme.success,
            IssueTone::Closed => theme.muted_foreground,
            IssueTone::Urgent => theme.danger,
        };
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .overflow_hidden();
        root.style().refine(&self.style);
        root.child(div().w(px(3.0)).h_full().min_h(px(64.0)).bg(accent))
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .flex()
                    .flex_col()
                    .gap(px(6.0))
                    .p(px(12.0))
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .items_center()
                            .justify_between()
                            .gap(px(8.0))
                            .child(
                                div()
                                    .text_xs()
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .font_family(theme.mono_font_family.clone())
                                    .text_color(accent)
                                    .child(self.key),
                            )
                            .children(self.actions),
                    )
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.foreground)
                            .child(self.title),
                    )
                    .when_some(self.meta, |d, m| {
                        d.child(div().text_xs().text_color(theme.muted_foreground).child(m))
                    }),
            )
    }
}
