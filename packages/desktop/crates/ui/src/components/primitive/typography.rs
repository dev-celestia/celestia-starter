//! Typography — standardized text roles for Celestia desktop.
//!
//! One type scale, consistent weight / line-height / tone, so call sites stop
//! inventing ad-hoc `text_sm` + `FontWeight` combos. Prefer these over raw
//! `div().text_*()` for product copy.
//!
//! Scale (px sizes, unitless line-heights):
//!
//! | Variant | Size | Weight | LH |
//! | --- | --- | --- | --- |
//! | Display | 36 | Bold | 1.1 |
//! | H1 | 30 | Semibold | 1.15 |
//! | H2 | 24 | Semibold | 1.2 |
//! | H3 | 20 | Semibold | 1.25 |
//! | H4 | 16 | Semibold | 1.3 |
//! | Lead | 18 | Regular | 1.5 |
//! | Body | 14 | Regular | 1.5 |
//! | BodySm | 13 | Regular | 1.5 |
//! | Muted | 14 | Regular | 1.5 |
//! | Caption | 12 | Regular | 1.4 |
//! | Overline | 11 | Semibold | 1.3 |
//! | Code | 13 | Regular (mono) | 1.4 |

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, FontWeight, IntoElement, ParentElement, Pixels, Refineable as _, RenderOnce,
    SharedString, StyleRefinement, Styled, Window, div, px, relative,
};

use crate::theme::ActiveTheme as _;

/// Role in the type scale.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum TypographyVariant {
    /// Hero / marketing display.
    Display,
    H1,
    H2,
    H3,
    H4,
    /// Intro paragraph under a title.
    Lead,
    /// Default reading size.
    #[default]
    Body,
    /// Compact body (tables, dense UI).
    BodySm,
    /// Body sized, muted tone by default.
    Muted,
    /// Helper / footnote.
    Caption,
    /// Uppercase section label (pass text pre-uppercased — GPUI has no transform).
    Overline,
    /// Monospace inline / block code label.
    Code,
}

impl TypographyVariant {
    fn metrics(self) -> (Pixels, FontWeight, f32, bool) {
        match self {
            Self::Display => (px(36.0), FontWeight::BOLD, 1.1, false),
            Self::H1 => (px(30.0), FontWeight::SEMIBOLD, 1.15, false),
            Self::H2 => (px(24.0), FontWeight::SEMIBOLD, 1.2, false),
            Self::H3 => (px(20.0), FontWeight::SEMIBOLD, 1.25, false),
            Self::H4 => (px(16.0), FontWeight::SEMIBOLD, 1.3, false),
            Self::Lead => (px(18.0), FontWeight::NORMAL, 1.5, false),
            Self::Body => (px(14.0), FontWeight::NORMAL, 1.5, false),
            Self::BodySm => (px(13.0), FontWeight::NORMAL, 1.5, false),
            Self::Muted => (px(14.0), FontWeight::NORMAL, 1.5, false),
            Self::Caption => (px(12.0), FontWeight::NORMAL, 1.4, false),
            Self::Overline => (px(11.0), FontWeight::SEMIBOLD, 1.3, false),
            Self::Code => (px(13.0), FontWeight::NORMAL, 1.4, true),
        }
    }

    fn default_tone(self) -> TypographyTone {
        match self {
            Self::Muted | Self::Caption | Self::Overline => TypographyTone::Muted,
            _ => TypographyTone::Default,
        }
    }
}

/// Semantic text color.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum TypographyTone {
    #[default]
    Default,
    Muted,
    Accent,
    Destructive,
    Success,
    Warning,
    /// Inherit from the parent (no explicit `text_color`).
    Inherit,
}

/// Horizontal alignment.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum TypographyAlign {
    #[default]
    Start,
    Center,
    End,
}

/// Standardized text atom — pick a [`TypographyVariant`], optional tone / align.
#[derive(IntoElement)]
pub struct Typography {
    style: StyleRefinement,
    text: SharedString,
    variant: TypographyVariant,
    tone: Option<TypographyTone>,
    align: TypographyAlign,
    truncate: bool,
    children: Vec<AnyElement>,
}

impl Typography {
    /// Body text (default scale step).
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
            variant: TypographyVariant::Body,
            tone: None,
            align: TypographyAlign::default(),
            truncate: false,
            children: Vec::new(),
        }
    }

    pub fn variant(mut self, variant: TypographyVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn tone(mut self, tone: TypographyTone) -> Self {
        self.tone = Some(tone);
        self
    }

    pub fn align(mut self, align: TypographyAlign) -> Self {
        self.align = align;
        self
    }

    pub fn center(mut self) -> Self {
        self.align = TypographyAlign::Center;
        self
    }

    /// Single-line ellipsis truncation.
    pub fn truncate(mut self, truncate: bool) -> Self {
        self.truncate = truncate;
        self
    }

    // --- Convenience constructors ------------------------------------------

    pub fn display(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::Display)
    }

    pub fn h1(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::H1)
    }

    pub fn h2(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::H2)
    }

    pub fn h3(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::H3)
    }

    pub fn h4(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::H4)
    }

    pub fn lead(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::Lead)
    }

    pub fn body(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::Body)
    }

    pub fn body_sm(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::BodySm)
    }

    pub fn muted(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::Muted)
    }

    pub fn caption(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::Caption)
    }

    pub fn overline(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::Overline)
    }

    pub fn code(text: impl Into<SharedString>) -> Self {
        Self::new(text).variant(TypographyVariant::Code)
    }
}

impl ParentElement for Typography {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Typography {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Typography {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (size, weight, line_height, mono) = self.variant.metrics();
        // Body roles track the config's UI size (16px is 1:1). Code tracks
        // the monospace size instead of the 13px role default.
        let scale = f32::from(theme.font_size) / 16.0;
        let size = if mono {
            theme.mono_font_size
        } else {
            size * scale
        };
        let mono_family = theme.mono_font_family.clone();
        let tone = self.tone.unwrap_or_else(|| self.variant.default_tone());

        let mut root = div()
            .text_size(size)
            .font_weight(weight)
            .line_height(relative(line_height))
            .when(mono, move |d| d.font_family(mono_family))
            .when(matches!(self.align, TypographyAlign::Center), |d| {
                d.text_center()
            })
            .when(matches!(self.align, TypographyAlign::End), |d| {
                d.text_right()
            })
            .when(self.truncate, |d| d.truncate());

        root = match tone {
            TypographyTone::Default => root.text_color(theme.foreground),
            TypographyTone::Muted => root.text_color(theme.muted_foreground),
            TypographyTone::Accent => root.text_color(theme.accent),
            TypographyTone::Destructive => root.text_color(theme.danger),
            TypographyTone::Success => root.text_color(theme.success),
            TypographyTone::Warning => root.text_color(theme.warning),
            TypographyTone::Inherit => root,
        };

        root.style().refine(&self.style);
        root.child(self.text).children(self.children)
    }
}

/// Semantic heading wrapper — same metrics as [`Typography`] H1–H4 / Display.
#[derive(IntoElement)]
pub struct Heading {
    inner: Typography,
}

impl Heading {
    pub fn display(text: impl Into<SharedString>) -> Self {
        Self {
            inner: Typography::display(text),
        }
    }

    pub fn h1(text: impl Into<SharedString>) -> Self {
        Self {
            inner: Typography::h1(text),
        }
    }

    pub fn h2(text: impl Into<SharedString>) -> Self {
        Self {
            inner: Typography::h2(text),
        }
    }

    pub fn h3(text: impl Into<SharedString>) -> Self {
        Self {
            inner: Typography::h3(text),
        }
    }

    pub fn h4(text: impl Into<SharedString>) -> Self {
        Self {
            inner: Typography::h4(text),
        }
    }

    pub fn tone(mut self, tone: TypographyTone) -> Self {
        self.inner = self.inner.tone(tone);
        self
    }

    pub fn align(mut self, align: TypographyAlign) -> Self {
        self.inner = self.inner.align(align);
        self
    }

    pub fn center(mut self) -> Self {
        self.inner = self.inner.center();
        self
    }
}

impl Styled for Heading {
    fn style(&mut self) -> &mut StyleRefinement {
        self.inner.style()
    }
}

impl RenderOnce for Heading {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        self.inner.render(window, cx)
    }
}
