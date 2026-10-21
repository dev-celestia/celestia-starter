//! Caption — a short supporting line under media or a control.
//!
//! The desktop counterpart of ad-hoc muted helper text on the web. Keeps
//! caption typography consistent without each call site picking sizes.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString,
    StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// Alignment of a [`Caption`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum CaptionAlign {
    #[default]
    Start,
    Center,
    End,
}

/// Muted supporting text, optionally with a leading/trailing child.
#[derive(IntoElement)]
pub struct Caption {
    style: StyleRefinement,
    text: SharedString,
    align: CaptionAlign,
    children: Vec<AnyElement>,
}

impl Caption {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
            align: CaptionAlign::default(),
            children: Vec::new(),
        }
    }

    pub fn align(mut self, align: CaptionAlign) -> Self {
        self.align = align;
        self
    }

    pub fn center(mut self) -> Self {
        self.align = CaptionAlign::Center;
        self
    }
}

impl ParentElement for Caption {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Caption {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Caption {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(4.0))
            .text_xs()
            .text_color(theme.muted_foreground)
            .when(matches!(self.align, CaptionAlign::Center), |this| {
                this.justify_center().text_center()
            })
            .when(matches!(self.align, CaptionAlign::End), |this| {
                this.justify_end().text_right()
            });
        root.style().refine(&self.style);
        root.child(self.text).children(self.children)
    }
}
