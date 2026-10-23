//! Icon-sized loading marks — pixel chases that sit in the same slot as a
//! [`crate::components::primitive::spinner::Spinner`] / Phosphor glyph
//! (default `size-4` / 16px).
//!
//! Variants:
//!
//! - [`LoaderVariant::Diamond`] — eight squares on a diamond ring; flash-fade
//!   chase matching the web `spin-pixel` keyframes (0 → 1 in 1%, then ease out).
//! - [`LoaderVariant::Orbit`] — same chase on a circle.
//! - [`LoaderVariant::BoxDots`] — eight round dots on a square box perimeter.
//! - [`LoaderVariant::Dots`] — three horizontal dots, soft staggered pulse.
//! - [`LoaderVariant::Bars`] — three vertical bars, soft staggered pulse.
//! - [`LoaderVariant::Blocks`] — 2×2 grid chase.
//!
//! Motion uses gpui `with_animation` (not the shared pulse clock), so call sites
//! need no `EntityId`. Under reduced motion every cell parks at a static rest
//! brightness and no frames are scheduled.

use std::f32::consts::{FRAC_PI_2, TAU};
use std::time::Duration;

use gpui::{
    Animation, AnimationExt as _, AnyElement, App, Hsla, IntoElement, ParentElement as _, Pixels,
    RenderOnce, Styled as _, Window, div, ease_in_out, px,
};

/// Visual treatment for an icon-slot loader.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum LoaderVariant {
    /// Eight squares on a diamond ring (web `Diamond` reference).
    #[default]
    Diamond,
    /// Eight squares on a circle.
    Orbit,
    /// Eight round dots on a square box perimeter.
    BoxDots,
    /// Three horizontal dots.
    Dots,
    /// Three vertical bars.
    Bars,
    /// 2×2 block chase.
    Blocks,
}

/// An icon-sized indeterminate loader.
#[derive(IntoElement)]
pub struct Loader {
    variant: LoaderVariant,
    size: Pixels,
    speed: Duration,
    color: Option<Hsla>,
}

impl Loader {
    /// 16px diamond chase on the inherited text color, 800ms per lap.
    pub fn new() -> Self {
        Self {
            variant: LoaderVariant::Diamond,
            size: px(16.0),
            speed: Duration::from_millis(800),
            color: None,
        }
    }

    /// Eight-pixel diamond ring (default).
    pub fn diamond() -> Self {
        Self::new().variant(LoaderVariant::Diamond)
    }

    /// Eight-pixel circular chase.
    pub fn orbit() -> Self {
        Self::new().variant(LoaderVariant::Orbit)
    }

    /// Eight round dots chasing around a square box.
    pub fn box_dots() -> Self {
        Self::new().variant(LoaderVariant::BoxDots)
    }

    /// Three horizontal dots.
    pub fn dots() -> Self {
        Self::new()
            .variant(LoaderVariant::Dots)
            .speed(Duration::from_millis(1000))
    }

    /// Three vertical bars.
    pub fn bars() -> Self {
        Self::new()
            .variant(LoaderVariant::Bars)
            .speed(Duration::from_millis(1000))
    }

    /// 2×2 block chase.
    pub fn blocks() -> Self {
        Self::new()
            .variant(LoaderVariant::Blocks)
            .speed(Duration::from_millis(900))
    }

    /// Set the glyph slot size (defaults to 16px, same as
    /// [`super::spinner::Spinner`]).
    pub fn size(mut self, size: impl Into<Pixels>) -> Self {
        self.size = size.into();
        self
    }

    /// Set the fill color; defaults to the surrounding text color.
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = Some(color.into());
        self
    }

    /// Duration of one full chase / pulse cycle.
    pub fn speed(mut self, speed: Duration) -> Self {
        self.speed = speed;
        self
    }

    /// Choose the pixel layout and chase pattern.
    pub fn variant(mut self, variant: LoaderVariant) -> Self {
        self.variant = variant;
        self
    }
}

impl Default for Loader {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for Loader {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let color = self.color.unwrap_or_else(|| window.text_style().color);
        let size: f32 = self.size.into();
        let speed = self.speed;
        let reduce = cx.reduce_motion();

        match self.variant {
            LoaderVariant::Diamond => {
                ring_loader(size, color, speed, reduce, &diamond_cells(), flash_fade, false)
            }
            LoaderVariant::Orbit => {
                ring_loader(size, color, speed, reduce, &orbit_cells(), flash_fade, false)
            }
            LoaderVariant::BoxDots => {
                ring_loader(size, color, speed, reduce, &box_dot_cells(), flash_fade, true)
            }
            LoaderVariant::Dots => row_loader(size, color, speed, reduce, 3, true, soft_pulse),
            LoaderVariant::Bars => bars_loader(size, color, speed, reduce),
            LoaderVariant::Blocks => blocks_loader(size, color, speed, reduce),
        }
    }
}

/// Unit-square `(x, y, cell)` for the diamond ring — web viewBox 20 with 4×4
/// rects at the eight compass points.
fn diamond_cells() -> [(f32, f32, f32); 8] {
    [
        (0.40, 0.00, 0.20), // top
        (0.60, 0.20, 0.20), // top-right
        (0.80, 0.40, 0.20), // right
        (0.60, 0.60, 0.20), // bottom-right
        (0.40, 0.80, 0.20), // bottom
        (0.20, 0.60, 0.20), // bottom-left
        (0.00, 0.40, 0.20), // left
        (0.20, 0.20, 0.20), // top-left
    ]
}

/// Eight cells on a circle (centre 0.5, radius 0.36, cell 0.18), clockwise from top.
fn orbit_cells() -> [(f32, f32, f32); 8] {
    const R: f32 = 0.36;
    const C: f32 = 0.18;
    let mut out = [(0.0_f32, 0.0_f32, C); 8];
    for (i, slot) in out.iter_mut().enumerate() {
        let theta = -FRAC_PI_2 + TAU * (i as f32 / 8.0);
        let cx = 0.5 + R * theta.cos() - C / 2.0;
        let cy = 0.5 + R * theta.sin() - C / 2.0;
        *slot = (cx, cy, C);
    }
    out
}

/// Eight round dots on an axis-aligned box — corners + edge midpoints,
/// clockwise from top (same chase order as [`diamond_cells`]).
fn box_dot_cells() -> [(f32, f32, f32); 8] {
    const C: f32 = 0.20;
    [
        (0.40, 0.00, C), // top
        (0.80, 0.00, C), // top-right
        (0.80, 0.40, C), // right
        (0.80, 0.80, C), // bottom-right
        (0.40, 0.80, C), // bottom
        (0.00, 0.80, C), // bottom-left
        (0.00, 0.40, C), // left
        (0.00, 0.00, C), // top-left
    ]
}

/// Web `spin-pixel` keyframes: flash on in the first 1%, ease-in-out fade for
/// the rest of the cycle.
fn flash_fade(t: f32) -> f32 {
    let t = t.rem_euclid(1.0);
    if t <= 0.01 {
        t / 0.01
    } else {
        1.0 - ease_in_out((t - 0.01) / 0.99)
    }
}

/// Soft cosine pulse used by dots / bars / blocks (0.15 → 1 → 0.15).
fn soft_pulse(t: f32) -> f32 {
    let wave = 0.5 - 0.5 * (t.rem_euclid(1.0) * TAU).cos();
    0.15 + 0.85 * wave
}

const REST_OPACITY: f32 = 0.45;

fn ring_loader(
    size: f32,
    color: Hsla,
    speed: Duration,
    reduce: bool,
    cells: &[(f32, f32, f32)],
    curve: fn(f32) -> f32,
    circular: bool,
) -> AnyElement {
    let n = cells.len().max(1) as f32;
    let stagger = 1.0 / n;
    let cells = cells.to_vec();

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children(cells.into_iter().enumerate().map(move |(i, (x, y, c))| {
            let mut cell = div()
                .absolute()
                .left(px(size * x))
                .top(px(size * y))
                .size(px(size * c))
                .bg(color);
            if circular {
                cell = cell.rounded_full();
            }
            if reduce {
                cell.opacity(REST_OPACITY).into_any_element()
            } else {
                let phase = i as f32 * stagger;
                cell.with_animation(
                    ("loader-ring", i),
                    Animation::new(speed).repeat().with_easing(move |t| {
                        curve((t - phase).rem_euclid(1.0))
                    }),
                    |el, opacity| el.opacity(opacity),
                )
                .into_any_element()
            }
        }))
        .into_any_element()
}

fn row_loader(
    size: f32,
    color: Hsla,
    speed: Duration,
    reduce: bool,
    count: usize,
    circular: bool,
    curve: fn(f32) -> f32,
) -> AnyElement {
    let count = count.max(1);
    let cell = size * 0.28;
    let gap = (size - cell * count as f32) / (count as f32 + 1.0);
    let stagger = 1.0 / count as f32;

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children((0..count).map(move |i| {
            let x = gap + i as f32 * (cell + gap);
            let y = (size - cell) / 2.0;
            let mut cell_el = div()
                .absolute()
                .left(px(x))
                .top(px(y))
                .size(px(cell))
                .bg(color);
            if circular {
                cell_el = cell_el.rounded_full();
            }
            if reduce {
                cell_el.opacity(REST_OPACITY).into_any_element()
            } else {
                let phase = i as f32 * stagger;
                cell_el
                    .with_animation(
                        ("loader-row", i),
                        Animation::new(speed).repeat().with_easing(move |t| {
                            curve((t - phase).rem_euclid(1.0))
                        }),
                        |el, opacity| el.opacity(opacity),
                    )
                    .into_any_element()
            }
        }))
        .into_any_element()
}

fn bars_loader(size: f32, color: Hsla, speed: Duration, reduce: bool) -> AnyElement {
    const COUNT: usize = 3;
    let bar_w = size * 0.18;
    let gap = (size - bar_w * COUNT as f32) / (COUNT as f32 + 1.0);
    let stagger = 1.0 / COUNT as f32;

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children((0..COUNT).map(move |i| {
            let x = gap + i as f32 * (bar_w + gap);
            // Fixed outer slot; the bar breathes height inside it.
            let slot = div()
                .absolute()
                .left(px(x))
                .top(px(0.0))
                .w(px(bar_w))
                .h(px(size))
                .flex()
                .items_center()
                .justify_center();

            if reduce {
                slot.child(
                    div()
                        .w(px(bar_w))
                        .h(px(size * 0.55))
                        .rounded(px(bar_w / 2.0))
                        .bg(color)
                        .opacity(REST_OPACITY),
                )
                .into_any_element()
            } else {
                let phase = i as f32 * stagger;
                slot.child(
                    div()
                        .w(px(bar_w))
                        .rounded(px(bar_w / 2.0))
                        .bg(color)
                        .with_animation(
                            ("loader-bar", i),
                            Animation::new(speed).repeat().with_easing(move |t| {
                                soft_pulse((t - phase).rem_euclid(1.0))
                            }),
                            move |el, wave| {
                                el.h(px(size * (0.35 + 0.55 * wave)))
                                    .opacity(0.35 + 0.65 * wave)
                            },
                        ),
                )
                .into_any_element()
            }
        }))
        .into_any_element()
}

fn blocks_loader(size: f32, color: Hsla, speed: Duration, reduce: bool) -> AnyElement {
    // Clockwise from top-left: (0,0) → (1,0) → (1,1) → (0,1).
    const ORDER: [(usize, usize); 4] = [(0, 0), (1, 0), (1, 1), (0, 1)];
    let cell = size * 0.38;
    let gap = size - cell * 2.0;
    let stagger = 0.25;

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children(ORDER.into_iter().enumerate().map(move |(i, (col, row))| {
            let x = col as f32 * (cell + gap);
            let y = row as f32 * (cell + gap);
            let block = div()
                .absolute()
                .left(px(x))
                .top(px(y))
                .size(px(cell))
                .rounded(px(cell * 0.15))
                .bg(color);
            if reduce {
                block.opacity(REST_OPACITY).into_any_element()
            } else {
                let phase = i as f32 * stagger;
                block
                    .with_animation(
                        ("loader-blocks", i),
                        Animation::new(speed).repeat().with_easing(move |t| {
                            soft_pulse((t - phase).rem_euclid(1.0))
                        }),
                        |el, opacity| el.opacity(opacity),
                    )
                    .into_any_element()
            }
        }))
        .into_any_element()
}
