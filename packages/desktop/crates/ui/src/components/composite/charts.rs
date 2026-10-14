//! Charts — the desktop twins of the web kit's `chart-*.tsx` prefabs.
//!
//! Web → desktop mapping: `chart-line.tsx` → [`ChartLine`], `chart-pie.tsx` →
//! [`ChartPie`] with `donut` mode split out as [`ChartDonut`]. Series colors
//! come from [`crate::palette`] (`chart-1` … `chart-5`), matching the web
//! ramp; the prefabs resolve them for you, while the raw `gpui_component`
//! `chart`/`plot` re-exports below leave styling to the call site.

pub use gpui_component::{chart, plot};

use gpui::{
    AnyElement, App, ElementId, Hsla, IntoElement, ParentElement, Pixels, RenderOnce, SharedString,
    Styled, Window, div, px,
};

use crate::palette;

/// Interpolation between data points (the web prefab's `curveType`).
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum ChartCurve {
    /// Smoothed monotone interpolation (web `"monotone"`; the default).
    #[default]
    Natural,
    /// Straight segments (web `"linear"`).
    Linear,
    /// Right-angle steps (web `"step"`).
    StepAfter,
}

/// `ChartLine` — single-series trend line, the desktop twin of web
/// `chart-line.tsx`.
///
/// One `(x label, y value)` row per tick (`y` must be `f64`, the only numeric
/// type the underlying plot's scale supports). The line is stroked with the
/// house chart ramp (`palette.chart(0)`) unless [`Self::color`] overrides it.
/// The `id` opts the chart into the hover tooltip (crosshair + data dot) and
/// gives it a private tessellation cache; keep ids unique among siblings.
#[derive(IntoElement)]
pub struct ChartLine {
    id: ElementId,
    data: Vec<(SharedString, f64)>,
    name: Option<SharedString>,
    color: Option<Hsla>,
    curve: ChartCurve,
    dots: bool,
    grid: bool,
    x_axis: bool,
    height: Pixels,
}

impl ChartLine {
    /// `data` is one `(x label, y value)` pair per tick.
    pub fn new<I, L>(id: impl Into<ElementId>, data: I) -> Self
    where
        I: IntoIterator<Item = (L, f64)>,
        L: Into<SharedString>,
    {
        Self {
            id: id.into(),
            data: data
                .into_iter()
                .map(|(label, value)| (label.into(), value))
                .collect(),
            name: None,
            color: None,
            curve: ChartCurve::default(),
            dots: false,
            grid: true,
            x_axis: true,
            height: px(220.),
        }
    }

    /// Series name shown in the hover tooltip row.
    pub fn name(mut self, name: impl Into<SharedString>) -> Self {
        self.name = Some(name.into());
        self
    }

    /// Stroke color override (defaults to the first chart-ramp color).
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = Some(color.into());
        self
    }

    /// Interpolation between points; defaults to [`ChartCurve::Natural`].
    pub fn curve(mut self, curve: ChartCurve) -> Self {
        self.curve = curve;
        self
    }

    /// Draw a dot at every data point (web `dots`).
    pub fn dots(mut self, dots: bool) -> Self {
        self.dots = dots;
        self
    }

    /// Show the dashed horizontal grid (default on).
    pub fn grid(mut self, grid: bool) -> Self {
        self.grid = grid;
        self
    }

    /// Show the x-axis line and labels (default on).
    pub fn x_axis(mut self, x_axis: bool) -> Self {
        self.x_axis = x_axis;
        self
    }

    /// Plot height; the container stays full-width. Defaults to 220px.
    pub fn height(mut self, height: Pixels) -> Self {
        self.height = height;
        self
    }
}

impl RenderOnce for ChartLine {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let stroke = self.color.unwrap_or_else(|| palette(cx).chart(0));
        let mut plot = chart::LineChart::new(self.data)
            .x(|(label, _)| label.clone())
            .y(|(_, value)| *value)
            .stroke(stroke)
            .grid(self.grid)
            .x_axis(self.x_axis)
            .id(self.id);
        if let Some(name) = self.name {
            plot = plot.name(name);
        }
        plot = match self.curve {
            ChartCurve::Natural => plot.natural(),
            ChartCurve::Linear => plot.linear(),
            ChartCurve::StepAfter => plot.step_after(),
        };
        if self.dots {
            plot = plot.dot();
        }
        div().h(self.height).w_full().child(plot)
    }
}

/// `ChartPie` — share-of-total slices, the desktop twin of web `chart-pie.tsx`
/// in full-pie mode. See [`ChartDonut`] for the punched-out variant.
///
/// One `(label, value)` row per slice; values are `f32` and may be any
/// magnitudes — shares are derived. Slice colors cycle the house chart ramp
/// by index. With [`Self::labels`] on (default) each slice gets a leader line
/// and text outside the ring; the `id` opts into the hover tooltip (the slice
/// lifts, the others dim).
#[derive(IntoElement)]
pub struct ChartPie {
    id: ElementId,
    data: Vec<(SharedString, f32)>,
    name: Option<SharedString>,
    labels: bool,
    pad_angle: f32,
    height: Pixels,
}

impl ChartPie {
    /// `data` is one `(label, value)` pair per slice.
    pub fn new<I, L>(id: impl Into<ElementId>, data: I) -> Self
    where
        I: IntoIterator<Item = (L, f32)>,
        L: Into<SharedString>,
    {
        Self {
            id: id.into(),
            data: data
                .into_iter()
                .map(|(label, value)| (label.into(), value))
                .collect(),
            name: None,
            labels: true,
            pad_angle: 0.,
            height: px(240.),
        }
    }

    /// Series name shown in the hover tooltip row.
    pub fn name(mut self, name: impl Into<SharedString>) -> Self {
        self.name = Some(name.into());
        self
    }

    /// Draw leader-line labels outside the ring (default on).
    pub fn labels(mut self, labels: bool) -> Self {
        self.labels = labels;
        self
    }

    /// Gap between neighbouring slices, in degrees.
    pub fn pad_angle(mut self, pad_angle: f32) -> Self {
        self.pad_angle = pad_angle;
        self
    }

    /// Plot height; the container stays full-width. Defaults to 240px — the
    /// ring lays out at 40% of it (96px outer radius).
    pub fn height(mut self, height: Pixels) -> Self {
        self.height = height;
        self
    }
}

impl RenderOnce for ChartPie {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        // Slice colors resolve here because the plot's closures run without
        // `cx`; cycling the ramp by index keeps any slice count inside the
        // 5-color ramp.
        let ramp = palette(cx);
        let slices: Vec<(SharedString, f32, Hsla)> = self
            .data
            .iter()
            .enumerate()
            .map(|(ix, (label, value))| (label.clone(), *value, ramp.chart(ix)))
            .collect();

        let mut plot = chart::PieChart::new(slices)
            .id(self.id)
            .pad_angle(self.pad_angle)
            .value(|(_, value, _)| *value)
            .color(|(_, _, color)| *color);
        if self.labels {
            plot = plot.label(|(label, _, _)| label.clone());
        }
        if let Some(name) = self.name {
            plot = plot.name(name);
        }
        div().h(self.height).w_full().child(plot)
    }
}

/// `ChartDonut` — [`ChartPie`] with a punched-out centre, the web prefab's
/// `donut` mode as its own type.
///
/// `inner_radius` is absolute px against the ring laid out at 40% of the
/// container height (the 240px default gives a 96px outer radius and a 40px
/// ring). Slices are padded by default. Children render centered in the hole
/// — the web prefab's center-slot equivalent:
///
/// ```
/// ChartDonut::new("storage", [("Media", 320.0f32), ("Apps", 64.0)])
///     .child(div().text_sm().child("384 GB"))
/// ```
#[derive(IntoElement)]
pub struct ChartDonut {
    id: ElementId,
    data: Vec<(SharedString, f32)>,
    name: Option<SharedString>,
    inner_radius: f32,
    pad_angle: f32,
    height: Pixels,
    children: Vec<AnyElement>,
}

impl ChartDonut {
    /// `data` is one `(label, value)` pair per slice.
    pub fn new<I, L>(id: impl Into<ElementId>, data: I) -> Self
    where
        I: IntoIterator<Item = (L, f32)>,
        L: Into<SharedString>,
    {
        Self {
            id: id.into(),
            data: data
                .into_iter()
                .map(|(label, value)| (label.into(), value))
                .collect(),
            name: None,
            inner_radius: 56.,
            pad_angle: 2.,
            height: px(240.),
            children: Vec::new(),
        }
    }

    /// Series name shown in the hover tooltip row.
    pub fn name(mut self, name: impl Into<SharedString>) -> Self {
        self.name = Some(name.into());
        self
    }

    /// The punched-out radius, in px (defaults to 56 against a 96px ring).
    pub fn inner_radius(mut self, inner_radius: f32) -> Self {
        self.inner_radius = inner_radius;
        self
    }

    /// Gap between neighbouring slices, in degrees (defaults to 2).
    pub fn pad_angle(mut self, pad_angle: f32) -> Self {
        self.pad_angle = pad_angle;
        self
    }

    /// Square plot size (the ring lays out at 40% of it). Defaults to 240px.
    pub fn height(mut self, height: Pixels) -> Self {
        self.height = height;
        self
    }
}

impl ParentElement for ChartDonut {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for ChartDonut {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let ramp = palette(cx);
        let slices: Vec<(SharedString, f32, Hsla)> = self
            .data
            .iter()
            .enumerate()
            .map(|(ix, (label, value))| (label.clone(), *value, ramp.chart(ix)))
            .collect();

        let mut plot = chart::PieChart::new(slices)
            .id(self.id)
            .inner_radius(self.inner_radius)
            .pad_angle(self.pad_angle)
            .value(|(_, value, _)| *value)
            .color(|(_, _, color)| *color);
        if let Some(name) = self.name {
            plot = plot.name(name);
        }

        let mut container = div().relative().h(self.height).w(self.height).child(plot);
        // The children overlay is a plain (non-interactive) div centered over
        // the hole; it neither paints nor hit-tests over the ring.
        if !self.children.is_empty() {
            container = container.child(
                div()
                    .absolute()
                    .inset_0()
                    .flex()
                    .flex_col()
                    .items_center()
                    .justify_center()
                    .children(self.children),
            );
        }
        container
    }
}
