//! Group box — the desktop counterpart of
//! `packages/ui/src/components/primitive/group-box.tsx`.
//!
//! Written directly on `gpui`. A titled container that groups related content.
//! Three variants decide how much chrome the box carries: `Normal` is bare,
//! `Fill` tints the content surface, `Outline` draws a border around it. Only
//! the two decorated variants inset their content.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Background, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, StyleRefinement, Styled, Window, div, px, relative,
};

use crate::theme::ActiveTheme as _;

/// How much chrome a [`GroupBox`] carries.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub enum GroupBoxVariant {
    /// No background, no border, content flush with the box.
    #[default]
    Normal,
    /// A tinted content surface.
    Fill,
    /// A bordered content surface.
    Outline,
}

/// Builder methods shared by anything that can take a [`GroupBoxVariant`].
pub trait GroupBoxVariants: Sized {
    /// Set the variant.
    fn with_variant(self, variant: GroupBoxVariant) -> Self;

    /// Use [`GroupBoxVariant::Normal`].
    fn normal(self) -> Self {
        self.with_variant(GroupBoxVariant::Normal)
    }

    /// Use [`GroupBoxVariant::Fill`].
    fn fill(self) -> Self {
        self.with_variant(GroupBoxVariant::Fill)
    }

    /// Use [`GroupBoxVariant::Outline`].
    fn outline(self) -> Self {
        self.with_variant(GroupBoxVariant::Outline)
    }
}

impl GroupBoxVariant {
    /// The variant's canonical lowercase name.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Normal => "normal",
            Self::Fill => "fill",
            Self::Outline => "outline",
        }
    }
}

/// Parses a variant name, falling back to [`GroupBoxVariant::Normal`] for
/// anything unrecognised — the parse is total, so there is no error case.
impl From<&str> for GroupBoxVariant {
    fn from(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "fill" => Self::Fill,
            "outline" => Self::Outline,
            _ => Self::Normal,
        }
    }
}

impl From<String> for GroupBoxVariant {
    fn from(s: String) -> Self {
        Self::from(s.as_str())
    }
}

/// A titled container that groups related content.
#[derive(IntoElement)]
pub struct GroupBox {
    id: Option<ElementId>,
    variant: GroupBoxVariant,
    style: StyleRefinement,
    title_style: StyleRefinement,
    title: Option<AnyElement>,
    content_style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl GroupBox {
    /// An untitled, `Normal` group box.
    pub fn new() -> Self {
        Self {
            id: None,
            variant: GroupBoxVariant::default(),
            style: StyleRefinement::default(),
            title_style: StyleRefinement::default(),
            title: None,
            content_style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }

    /// Set the element id (defaults to `"group-box"`).
    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = Some(id.into());
        self
    }

    /// Set the title rendered above the content surface.
    pub fn title(mut self, title: impl IntoElement) -> Self {
        self.title = Some(title.into_any_element());
        self
    }

    /// Override the title's style.
    pub fn title_style(mut self, style: StyleRefinement) -> Self {
        self.title_style = style;
        self
    }

    /// Override the content surface's style.
    pub fn content_style(mut self, style: StyleRefinement) -> Self {
        self.content_style = style;
        self
    }
}

impl Default for GroupBox {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for GroupBox {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for GroupBox {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl GroupBoxVariants for GroupBox {
    fn with_variant(mut self, variant: GroupBoxVariant) -> Self {
        self.variant = variant;
        self
    }
}

impl RenderOnce for GroupBox {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (bg, border, padded): (Option<Background>, _, bool) = match self.variant {
            GroupBoxVariant::Normal => (None, None, false),
            GroupBoxVariant::Fill => (Some(theme.tokens.group_box.into()), None, true),
            GroupBoxVariant::Outline => (None, Some(theme.border), true),
        };

        let mut root = div()
            .id(self.id.unwrap_or_else(|| "group-box".into()))
            .w_full()
            .flex()
            .flex_col()
            // A decorated box already has padding separating title from
            // content, so it needs less of a gap than a bare one.
            .gap(if padded { px(12.0) } else { px(16.0) });
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        if let Some(title) = self.title {
            let mut title_el = div()
                .text_color(theme.muted_foreground)
                .line_height(relative(1.25));
            title_el.style().refine(&self.title_style);
            root = root.child(title_el.child(title));
        }

        let mut content = div()
            .flex()
            .flex_col()
            .when_some(bg, |this, bg| this.bg(bg))
            .when_some(border, |this, border| this.border_1().border_color(border))
            .text_color(theme.group_box_foreground)
            .when(padded, |this| this.p(px(16.0)))
            .gap(px(16.0))
            .rounded(theme.radius);
        content.style().refine(&self.content_style);

        root.child(content.children(self.children))
    }
}

#[cfg(test)]
mod tests {
    use super::GroupBoxVariant;

    /// `as_str` and `From<&str>` are inverses, and an unrecognised name is a
    /// `Normal` rather than an error — the parse is total by design.
    #[test]
    fn variant_names_round_trip_and_unknown_falls_back_to_normal() {
        for variant in [
            GroupBoxVariant::Normal,
            GroupBoxVariant::Fill,
            GroupBoxVariant::Outline,
        ] {
            assert_eq!(GroupBoxVariant::from(variant.as_str()), variant);
        }

        assert_eq!(GroupBoxVariant::from("other"), GroupBoxVariant::Normal);
        assert_eq!(GroupBoxVariant::from("FILL"), GroupBoxVariant::Fill);
        assert_eq!(GroupBoxVariant::from("OutLine"), GroupBoxVariant::Outline);
        assert_eq!(
            GroupBoxVariant::from(String::from("fill")),
            GroupBoxVariant::Fill
        );
    }
}
