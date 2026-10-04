//! Celestia progress — the desktop counterpart of
//! `packages/ui/src/components/primitive/progress.tsx`.
//!
//! Two shapes, both drawn directly on `gpui`:
//!
//! - [`Progress`] — the linear bar. Web metrics: a `h-1` track, `rounded-md`,
//!   `bg-muted`, with a `bg-primary` indicator filling it left to right.
//! - [`ProgressCircle`] — the radial form. gpui paths have no arc primitive, so
//!   the arc is a stroked polyline, exactly as
//!   [`crate::components::composite::loaders::progress_ring`] does it.

use gpui::{
    App, ElementId, Hsla, InteractiveElement as _, IntoElement, ParentElement, PathBuilder, Pixels,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, canvas, div, point,
    px, relative,
};

use crate::theme::ActiveTheme as _;

/// A linear progress bar. `value` is a fraction in `0.0..=1.0`.
#[derive(IntoElement)]
pub struct Progress {
    id: ElementId,
    value: f32,
    style: StyleRefinement,
}

impl Progress {
    /// An empty bar. The id scopes the element's identity.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            value: 0.0,
            style: StyleRefinement::default(),
        }
    }

    /// Set completion as a fraction; values outside `0..=1` are clamped.
    pub fn value(mut self, value: f32) -> Self {
        self.value = value.clamp(0.0, 1.0);
        self
    }
}

impl Styled for Progress {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Progress {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut track = div()
            .id(self.id)
            .w_full()
            .h(px(4.0))
            .flex()
            .items_center()
            .overflow_hidden()
            .rounded(px(6.0))
            .bg(theme.muted)
            .child(div().h_full().bg(theme.primary).w(relative(self.value)));
        track.style().refine(&self.style);
        track
    }
}

/// Stroke width of [`ProgressCircle`].
const RING_STROKE: f32 = 3.0;
/// Polyline segments for a full circle — plenty for a ≤64px ring.
const RING_SEGMENTS: f32 = 64.0;

/// A radial progress ring. `value` is a fraction in `0.0..=1.0`.
#[derive(IntoElement)]
pub struct ProgressCircle {
    id: ElementId,
    value: f32,
    diameter: Pixels,
    style: StyleRefinement,
}

impl ProgressCircle {
    /// An empty ring at the default 32px diameter.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            value: 0.0,
            diameter: px(32.0),
            style: StyleRefinement::default(),
        }
    }

    /// Set completion as a fraction; values outside `0..=1` are clamped.
    pub fn value(mut self, value: f32) -> Self {
        self.value = value.clamp(0.0, 1.0);
        self
    }

    /// Set the outer diameter.
    pub fn size(mut self, diameter: impl Into<Pixels>) -> Self {
        self.diameter = diameter.into();
        self
    }
}

impl Styled for ProgressCircle {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ProgressCircle {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let track = theme.muted;
        let fill = theme.primary;
        let diameter = self.diameter;
        let fraction = self.value;

        let arc = canvas(
            |_, _, _| (),
            move |bounds, _, window, _| {
                let center = bounds.center();
                let radius = diameter.as_f32() / 2.0 - RING_STROKE;
                let mut paint_arc = |sweep: f32, color: Hsla| {
                    if sweep <= 0.0 {
                        return;
                    }
                    let steps = ((RING_SEGMENTS * sweep).ceil() as usize).max(2);
                    let at = |i: usize| {
                        // Clockwise from 12 o'clock.
                        let theta = -std::f32::consts::FRAC_PI_2
                            + std::f32::consts::TAU * sweep * (i as f32 / steps as f32);
                        point(
                            center.x + px(radius * theta.cos()),
                            center.y + px(radius * theta.sin()),
                        )
                    };
                    let mut builder = PathBuilder::stroke(px(RING_STROKE));
                    builder.move_to(at(0));
                    for i in 1..=steps {
                        builder.line_to(at(i));
                    }
                    if let Ok(path) = builder.build() {
                        window.paint_path(path, color);
                    }
                };
                paint_arc(1.0, track);
                paint_arc(fraction, fill);
            },
        )
        .absolute()
        .inset_0();

        let mut ring = div()
            .id(self.id)
            .relative()
            .size(diameter)
            .flex()
            .items_center()
            .justify_center()
            .child(arc)
            .child(
                div()
                    .text_size(px(9.0))
                    .text_color(theme.muted_foreground)
                    .child(SharedString::from(format!(
                        "{}%",
                        (fraction * 100.0).round() as u32
                    ))),
            );
        ring.style().refine(&self.style);
        ring
    }
}
