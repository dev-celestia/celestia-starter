//! Initials — a circular letter monogram for identity fallbacks.

use gpui::{
    App, ElementId, FontWeight, Hsla, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum InitialsSize {
    Sm,
    #[default]
    Md,
    Lg,
}

#[derive(IntoElement)]
pub struct Initials {
    id: ElementId,
    style: StyleRefinement,
    text: SharedString,
    size: InitialsSize,
    bg: Option<Hsla>,
}

impl Initials {
    pub fn new(id: impl Into<ElementId>, text: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            text: text.into(),
            size: InitialsSize::default(),
            bg: None,
        }
    }

    pub fn size(mut self, size: InitialsSize) -> Self {
        self.size = size;
        self
    }

    pub fn bg(mut self, color: Hsla) -> Self {
        self.bg = Some(color);
        self
    }
}

impl Styled for Initials {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Initials {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (d, text) = match self.size {
            InitialsSize::Sm => (px(24.0), px(10.0)),
            InitialsSize::Md => (px(32.0), px(12.0)),
            InitialsSize::Lg => (px(40.0), px(14.0)),
        };
        let letters: String = self
            .text
            .chars()
            .filter(|c| !c.is_whitespace())
            .take(2)
            .collect::<String>()
            .to_uppercase();
        let mut root = div()
            .id(self.id)
            .size(d)
            .rounded_full()
            .bg(self.bg.unwrap_or(theme.muted))
            .flex()
            .items_center()
            .justify_center()
            .text_size(text)
            .font_weight(FontWeight::SEMIBOLD)
            .text_color(theme.foreground)
            .child(letters);
        root.style().refine(&self.style);
        root
    }
}
