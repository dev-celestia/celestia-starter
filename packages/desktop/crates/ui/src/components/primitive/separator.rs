//! Separator — the desktop counterpart of
//! `packages/ui/src/components/primitive/separator.tsx`.
//!
//! Written directly on `gpui`. A one-pixel rule on the requested axis. The
//! dashed variant paints through `canvas` + `PathBuilder` rather than using
//! `border_dashed()`: gpui exposes no dash-pattern control on borders — the
//! pattern is the renderer's and not configurable — while `PathBuilder` takes
//! an explicit `dash_array`. Painting the path is what preserves the web's
//! 4-on / 2-off rhythm, and the same code path then works at any length.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, Axis, Div, Hsla, IntoElement, ParentElement as _, PathBuilder, Refineable as _,
    RenderOnce, SharedString, StyleRefinement, Styled, Window, canvas, div, point, px,
};

use crate::theme::ActiveTheme as _;

/// The stroke treatment of the separator rule.
#[derive(Clone, Copy, PartialEq, Eq, Default, Debug)]
pub enum SeparatorStyle {
    /// A solid one-pixel rule.
    #[default]
    Solid,
    /// A 4-on / 2-off dashed rule.
    Dashed,
}

/// A hairline rule between two regions, optionally captioned.
#[derive(IntoElement)]
pub struct Separator {
    style: StyleRefinement,
    label: Option<SharedString>,
    axis: Axis,
    color: Option<Hsla>,
    line_style: SeparatorStyle,
}

impl Separator {
    /// A vertical rule that fills the height of its row.
    pub fn vertical() -> Self {
        Self::on(Axis::Vertical)
    }

    /// A horizontal rule that fills the width of its column.
    pub fn horizontal() -> Self {
        Self::on(Axis::Horizontal)
    }

    /// A vertical dashed rule.
    pub fn vertical_dashed() -> Self {
        Self::vertical().dashed()
    }

    /// A horizontal dashed rule.
    pub fn horizontal_dashed() -> Self {
        Self::horizontal().dashed()
    }

    fn on(axis: Axis) -> Self {
        Self {
            style: StyleRefinement::default(),
            label: None,
            axis,
            color: None,
            line_style: SeparatorStyle::default(),
        }
    }

    /// Caption the rule. The label sits on the theme background so it reads as
    /// a gap in the line.
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Override the rule colour (defaults to `theme.border`).
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = Some(color.into());
        self
    }

    /// Switch to the dashed treatment.
    pub fn dashed(mut self) -> Self {
        self.line_style = SeparatorStyle::Dashed;
        self
    }

    /// The absolute, full-bleed box the rule is painted into.
    fn rule_box(axis: Axis) -> Div {
        div().absolute().map(|this| match axis {
            Axis::Vertical => this.w(px(1.0)).h_full(),
            Axis::Horizontal => this.h(px(1.0)).w_full(),
        })
    }

    fn rule(axis: Axis, color: Hsla, line_style: SeparatorStyle) -> gpui::AnyElement {
        match line_style {
            SeparatorStyle::Solid => Self::rule_box(axis).bg(color).into_any_element(),
            SeparatorStyle::Dashed => Self::rule_box(axis)
                .child(
                    canvas(
                        |_, _, _| {},
                        move |bounds, _, window, _| {
                            let mut builder =
                                PathBuilder::stroke(px(1.0)).dash_array(&[px(4.0), px(2.0)]);
                            let (start, end) = match axis {
                                Axis::Horizontal => {
                                    let y = bounds.origin.y + px(0.5);
                                    (
                                        point(bounds.origin.x, y),
                                        point(bounds.origin.x + bounds.size.width, y),
                                    )
                                }
                                Axis::Vertical => {
                                    let x = bounds.origin.x + px(0.5);
                                    (
                                        point(x, bounds.origin.y),
                                        point(x, bounds.origin.y + bounds.size.height),
                                    )
                                }
                            };
                            builder.move_to(start);
                            builder.line_to(end);
                            if let Ok(line) = builder.build() {
                                window.paint_path(line, color);
                            }
                        },
                    )
                    .size_full(),
                )
                .into_any_element(),
        }
    }
}

impl Styled for Separator {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Separator {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let color = self.color.unwrap_or(cx.theme().border);
        let axis = self.axis;
        let line_style = self.line_style;

        let mut root = div().flex().flex_shrink_0().items_center().justify_center();
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.child(Self::rule(axis, color, line_style))
            .when_some(self.label, |this, label| {
                this.child(
                    div()
                        .px(px(8.0))
                        .py(px(4.0))
                        .mx_auto()
                        .text_size(px(12.0))
                        .bg(cx.theme().tokens.background)
                        .text_color(cx.theme().muted_foreground)
                        .child(label),
                )
            })
    }
}
