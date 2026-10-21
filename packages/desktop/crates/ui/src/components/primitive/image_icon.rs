//! ImageIcon — image or icon mark, optionally paired with a label.
//!
//! Use the mark alone (no label) for toolbars and grids, or attach a label
//! beside / below it for file rows, app tiles, and picker cells.
//!
//! ```ignore
//! // Icon only
//! ImageIcon::icon("file", PhosphorIcon::File).size(ImageIconSize::Md)
//!
//! // Image with label underneath
//! ImageIcon::src("shot", path)
//!     .size(ImageIconSize::Lg)
//!     .label("Screenshot")
//!     .layout(ImageIconLayout::Vertical)
//!
//! // Icon + horizontal label
//! ImageIcon::icon("folder", PhosphorIcon::Folder)
//!     .label("crates/ui")
//!     .description("12 files")
//! ```

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, ImageSource, InteractiveElement as _, IntoElement,
    ObjectFit, ParentElement, Pixels, Refineable as _, RenderOnce, SharedString, StyleRefinement,
    Styled, StyledImage as _, Window, div, img, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Box size for the image / icon mark.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ImageIconSize {
    /// 20px mark.
    Sm,
    /// 32px mark.
    #[default]
    Md,
    /// 48px mark.
    Lg,
    /// 64px mark.
    Xl,
}

impl ImageIconSize {
    pub fn px(self) -> Pixels {
        match self {
            ImageIconSize::Sm => px(20.),
            ImageIconSize::Md => px(32.),
            ImageIconSize::Lg => px(48.),
            ImageIconSize::Xl => px(64.),
        }
    }

    fn icon_px(self) -> Pixels {
        match self {
            ImageIconSize::Sm => px(12.),
            ImageIconSize::Md => px(18.),
            ImageIconSize::Lg => px(24.),
            ImageIconSize::Xl => px(32.),
        }
    }

    fn label_gap(self) -> Pixels {
        match self {
            ImageIconSize::Sm | ImageIconSize::Md => px(8.),
            ImageIconSize::Lg | ImageIconSize::Xl => px(10.),
        }
    }
}

/// Corner treatment of the mark.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ImageIconShape {
    /// Theme radius (default).
    #[default]
    Rounded,
    /// Sharp corners.
    Square,
    /// Fully circular (avatar-like).
    Circle,
}

/// Where the optional label sits relative to the mark.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ImageIconLayout {
    /// Label to the right of the mark (rows, lists).
    #[default]
    Horizontal,
    /// Label below the mark (tiles, grids).
    Vertical,
}

enum MarkKind {
    Icon(PhosphorIcon),
    Image(ImageSource),
    Custom(AnyElement),
}

/// Image or icon mark with an optional label / description.
#[derive(IntoElement)]
pub struct ImageIcon {
    id: ElementId,
    style: StyleRefinement,
    mark: MarkKind,
    size: ImageIconSize,
    shape: ImageIconShape,
    layout: ImageIconLayout,
    label: Option<SharedString>,
    description: Option<SharedString>,
    muted: bool,
    bordered: bool,
}

impl ImageIcon {
    /// Phosphor icon mark.
    pub fn icon(id: impl Into<ElementId>, icon: PhosphorIcon) -> Self {
        Self::new(id, MarkKind::Icon(icon))
    }

    /// Raster / path image mark.
    pub fn src(id: impl Into<ElementId>, source: impl Into<ImageSource>) -> Self {
        Self::new(id, MarkKind::Image(source.into()))
    }

    /// Custom mark content (SVG, avatar, etc.).
    pub fn custom(id: impl Into<ElementId>, child: impl IntoElement) -> Self {
        Self::new(id, MarkKind::Custom(child.into_any_element()))
    }

    fn new(id: impl Into<ElementId>, mark: MarkKind) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            mark,
            size: ImageIconSize::default(),
            shape: ImageIconShape::default(),
            layout: ImageIconLayout::default(),
            label: None,
            description: None,
            muted: false,
            bordered: true,
        }
    }

    pub fn size(mut self, size: ImageIconSize) -> Self {
        self.size = size;
        self
    }

    pub fn shape(mut self, shape: ImageIconShape) -> Self {
        self.shape = shape;
        self
    }

    pub fn layout(mut self, layout: ImageIconLayout) -> Self {
        self.layout = layout;
        self
    }

    /// Caption beside or below the mark. Omit for an icon/image-only control.
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Secondary line under the label (ignored when there is no label).
    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn muted(mut self, muted: bool) -> Self {
        self.muted = muted;
        self
    }

    /// Draw a border around the mark (default `true`).
    pub fn bordered(mut self, bordered: bool) -> Self {
        self.bordered = bordered;
        self
    }
}

impl Styled for ImageIcon {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ImageIcon {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let box_px = self.size.px();
        let icon_px = self.size.icon_px();
        let gap = self.size.label_gap();
        let vertical = matches!(self.layout, ImageIconLayout::Vertical);

        let radius = match self.shape {
            ImageIconShape::Rounded => theme.radius,
            ImageIconShape::Square => px(0.),
            ImageIconShape::Circle => theme.radius_full(),
        };

        let fg = if self.muted {
            theme.muted_foreground
        } else {
            theme.foreground
        };
        let muted_fg = theme.muted_foreground;

        let mark = div()
            .id(ElementId::Name(format!("{}-mark", self.id).into()))
            .size(box_px)
            .flex_none()
            .flex()
            .items_center()
            .justify_center()
            .overflow_hidden()
            .rounded(radius)
            .bg(theme.muted)
            .when(self.bordered, |this| {
                this.border_1().border_color(theme.border)
            })
            .map(|this| match self.mark {
                MarkKind::Icon(icon) => {
                    this.child(Phosphor::new(icon).size(icon_px).color(if self.muted {
                        muted_fg
                    } else {
                        theme.foreground
                    }))
                }
                MarkKind::Image(source) => this.child(
                    img(source)
                        .size_full()
                        .object_fit(ObjectFit::Cover)
                        .when(self.muted, |img| img.opacity(0.7)),
                ),
                MarkKind::Custom(child) => this.child(child),
            });

        let has_label = self.label.is_some();
        let text = self.label.map(|label| {
            div()
                .min_w_0()
                .flex()
                .flex_col()
                .gap(px(2.))
                .when(vertical, |this| this.items_center())
                .when(!vertical, |this| this.items_start())
                .child(
                    div()
                        .text_sm()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(fg)
                        .when(vertical, |t| t.text_center())
                        .child(label),
                )
                .when_some(self.description, |this, desc| {
                    this.child(
                        div()
                            .text_xs()
                            .text_color(muted_fg)
                            .when(vertical, |t| t.text_center())
                            .child(desc),
                    )
                })
        });

        let mut root = div()
            .id(self.id)
            .flex()
            .when(vertical, |this| this.flex_col().items_center())
            .when(!vertical, |this| this.flex_row().items_center())
            .gap(gap)
            .child(mark)
            .when(has_label, |this| this.when_some(text, |t, el| t.child(el)));
        root.style().refine(&self.style);
        root
    }
}
