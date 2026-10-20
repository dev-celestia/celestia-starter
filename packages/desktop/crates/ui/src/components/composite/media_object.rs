//! MediaObject — classic media + title + description + actions layout.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// Alignment of the media slot relative to the text block.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum MediaObjectAlign {
    #[default]
    Start,
    Center,
}

/// Media (avatar / thumbnail) beside a title, description, and optional actions.
#[derive(IntoElement)]
pub struct MediaObject {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    description: Option<SharedString>,
    media: Option<AnyElement>,
    actions: Vec<AnyElement>,
    align: MediaObjectAlign,
    reverse: bool,
}

impl MediaObject {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            description: None,
            media: None,
            actions: Vec::new(),
            align: MediaObjectAlign::default(),
            reverse: false,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn media(mut self, media: impl IntoElement) -> Self {
        self.media = Some(media.into_any_element());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.actions.push(action.into_any_element());
        self
    }

    pub fn align(mut self, align: MediaObjectAlign) -> Self {
        self.align = align;
        self
    }

    /// Put media on the trailing edge.
    pub fn reverse(mut self, reverse: bool) -> Self {
        self.reverse = reverse;
        self
    }
}

impl Styled for MediaObject {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MediaObject {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let center = matches!(self.align, MediaObjectAlign::Center);

        let text = div()
            .flex_1()
            .min_w_0()
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
            .when_some(self.description, |d, desc| {
                d.child(
                    div()
                        .text_xs()
                        .text_color(theme.muted_foreground)
                        .child(desc),
                )
            });

        let media = self
            .media
            .map(|m| div().flex_none().child(m).into_any_element());

        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .gap(px(12.0))
            .when(center, |this| this.items_center())
            .when(!center, |this| this.items_start());
        root.style().refine(&self.style);

        if self.reverse {
            root.child(text).when_some(media, |d, m| d.child(m)).when(
                !self.actions.is_empty(),
                |d| {
                    d.child(
                        div()
                            .flex_none()
                            .flex()
                            .flex_row()
                            .items_center()
                            .gap(px(4.0))
                            .children(self.actions),
                    )
                },
            )
        } else {
            root.when_some(media, |d, m| d.child(m)).child(text).when(
                !self.actions.is_empty(),
                |d| {
                    d.child(
                        div()
                            .flex_none()
                            .flex()
                            .flex_row()
                            .items_center()
                            .gap(px(4.0))
                            .children(self.actions),
                    )
                },
            )
        }
    }
}
