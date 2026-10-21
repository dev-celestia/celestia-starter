//! FileGlyph — a file-type coloured icon tile.

use gpui::{
    App, ElementId, InteractiveElement as _, IntoElement, ParentElement, Refineable as _,
    RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum FileGlyphKind {
    #[default]
    Generic,
    Code,
    Image,
    Doc,
    Archive,
}

#[derive(IntoElement)]
pub struct FileGlyph {
    id: ElementId,
    style: StyleRefinement,
    kind: FileGlyphKind,
    extension: Option<SharedString>,
}

impl FileGlyph {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            kind: FileGlyphKind::default(),
            extension: None,
        }
    }

    pub fn kind(mut self, kind: FileGlyphKind) -> Self {
        self.kind = kind;
        self
    }

    pub fn extension(mut self, ext: impl Into<SharedString>) -> Self {
        self.extension = Some(ext.into());
        self
    }
}

impl Styled for FileGlyph {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for FileGlyph {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (icon, tint) = match self.kind {
            FileGlyphKind::Generic => (PhosphorIcon::File, theme.muted_foreground),
            FileGlyphKind::Code => (PhosphorIcon::FileCode, theme.info),
            FileGlyphKind::Image => (PhosphorIcon::FileImage, theme.success),
            FileGlyphKind::Doc => (PhosphorIcon::FileText, theme.warning),
            FileGlyphKind::Archive => (PhosphorIcon::FileZip, theme.accent),
        };
        let mut root = div()
            .id(self.id)
            .size(px(32.0))
            .rounded(theme.radius)
            .bg(tint.opacity(0.12))
            .flex()
            .items_center()
            .justify_center()
            .child(Phosphor::new(icon).size(px(16.0)).color(tint));
        root.style().refine(&self.style);
        root
    }
}
