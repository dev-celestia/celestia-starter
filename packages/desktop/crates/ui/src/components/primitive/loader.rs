//! Icon-sized loading marks — pixel chases and soft processing pulses that sit
//! in the same slot as a [`crate::components::primitive::spinner::Spinner`] /
//! Phosphor glyph (default `size-4` / 16px).
//!
//! Chase variants (hard flash-fade, Cursor-style pixel ring):
//!
//! - [`LoaderVariant::Diamond`] — eight squares on a diamond ring.
//! - [`LoaderVariant::Orbit`] — same chase on a circle.
//! - [`LoaderVariant::BoxDots`] — eight round dots on a square perimeter.
//! - [`LoaderVariant::Snake`] — eight cells around a 3×3 ring.
//! - [`LoaderVariant::Zigzag`] — diagonal flash sequence.
//!
//! Processing variants (softer, Cursor “thinking / generating” feel):
//!
//! - [`LoaderVariant::Wave`] — five dots with a travelling highlight.
//! - [`LoaderVariant::Bounce`] — three dots bouncing in sequence.
//! - [`LoaderVariant::Cascade`] — four dots falling top → bottom.
//! - [`LoaderVariant::Breath`] — single soft breathing disc.
//! - [`LoaderVariant::Spark`] — centre + four arms blooming outward.
//! - [`LoaderVariant::Dots`] / [`Bars`] / [`Blocks`] — compact row / EQ / 2×2.
//!
//! Boxy 3×3 (two-tone with theme primary):
//!
//! - [`LoaderVariant::GridZigzag`] — serpentine flash across all nine cells.
//! - [`LoaderVariant::GridShift`] — scrambled / “random” phase offsets.
//! - [`LoaderVariant::GridSpin`] — clockwise ring, centre last.
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

use crate::motion;
use crate::theme::ActiveTheme as _;

/// Visual treatment for an icon-slot loader.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum LoaderVariant {
    /// Eight squares on a diamond ring (web `Diamond` / Cursor pixel reference).
    #[default]
    Diamond,
    /// Eight squares on a circle.
    Orbit,
    /// Eight round dots on a square box perimeter.
    BoxDots,
    /// Eight cells chasing around a 3×3 ring (no centre).
    Snake,
    /// Diagonal flash sequence across the icon slot.
    Zigzag,
    /// Five soft dots with a travelling wave (Cursor “thinking”).
    Wave,
    /// Three dots bouncing in sequence.
    Bounce,
    /// Four dots cascading top → bottom.
    Cascade,
    /// Single soft breathing disc.
    Breath,
    /// Centre + four cardinal arms blooming outward.
    Spark,
    /// Three horizontal dots.
    Dots,
    /// Three vertical bars.
    Bars,
    /// 2×2 block chase.
    Blocks,
    /// Full 3×3 boxy zigzag (two-tone primary).
    GridZigzag,
    /// Full 3×3 boxy with scrambled phase offsets.
    GridShift,
    /// Full 3×3 boxy clockwise spin (centre last).
    GridSpin,
}

/// An icon-sized indeterminate loader.
#[derive(IntoElement)]
pub struct Loader {
    variant: LoaderVariant,
    size: Pixels,
    speed: Duration,
    /// Highlight / active colour. Grid variants default to theme `primary`.
    color: Option<Hsla>,
    /// Rest / inactive colour. Grid variants default to muted primary wash.
    secondary: Option<Hsla>,
}

impl Loader {
    /// 16px diamond chase on the inherited text color, 800ms per lap.
    pub fn new() -> Self {
        Self {
            variant: LoaderVariant::Diamond,
            size: px(16.0),
            speed: Duration::from_millis(800),
            color: None,
            secondary: None,
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

    /// Eight cells around a 3×3 ring.
    pub fn snake() -> Self {
        Self::new()
            .variant(LoaderVariant::Snake)
            .speed(Duration::from_millis(900))
    }

    /// Diagonal flash sequence.
    pub fn zigzag() -> Self {
        Self::new().variant(LoaderVariant::Zigzag)
    }

    /// Soft travelling wave across five dots (Cursor-style processing).
    pub fn wave() -> Self {
        Self::new()
            .variant(LoaderVariant::Wave)
            .speed(Duration::from_millis(1600))
    }

    /// Three bouncing dots.
    pub fn bounce() -> Self {
        Self::new()
            .variant(LoaderVariant::Bounce)
            .speed(Duration::from_millis(1200))
    }

    /// Four cascading dots.
    pub fn cascade() -> Self {
        Self::new()
            .variant(LoaderVariant::Cascade)
            .speed(Duration::from_millis(1100))
    }

    /// Single soft breathing disc.
    pub fn breath() -> Self {
        Self::new()
            .variant(LoaderVariant::Breath)
            .speed(Duration::from_millis(1800))
    }

    /// Centre spark with four blooming arms.
    pub fn spark() -> Self {
        Self::new()
            .variant(LoaderVariant::Spark)
            .speed(Duration::from_millis(1400))
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

    /// Full 3×3 boxy zigzag — primary + muted wash, 24px default.
    pub fn grid_zigzag() -> Self {
        Self::new()
            .variant(LoaderVariant::GridZigzag)
            .size(px(24.0))
            .speed(Duration::from_millis(1000))
    }

    /// Full 3×3 boxy with scrambled (“random”) phases.
    pub fn grid_shift() -> Self {
        Self::new()
            .variant(LoaderVariant::GridShift)
            .size(px(24.0))
            .speed(Duration::from_millis(1100))
    }

    /// Full 3×3 boxy clockwise spin (centre last).
    pub fn grid_spin() -> Self {
        Self::new()
            .variant(LoaderVariant::GridSpin)
            .size(px(24.0))
            .speed(Duration::from_millis(1000))
    }

    /// Set the glyph slot size (defaults to 16px, same as
    /// [`super::spinner::Spinner`]; grid variants default to 24px).
    pub fn size(mut self, size: impl Into<Pixels>) -> Self {
        self.size = size.into();
        self
    }

    /// Set the active / highlight fill (grid defaults to theme `primary`).
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = Some(color.into());
        self
    }

    /// Set the rest / inactive fill (grid defaults to a muted primary wash).
    pub fn secondary(mut self, color: impl Into<Hsla>) -> Self {
        self.secondary = Some(color.into());
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
        let theme = cx.theme();
        let is_grid = matches!(
            self.variant,
            LoaderVariant::GridZigzag | LoaderVariant::GridShift | LoaderVariant::GridSpin
        );
        let primary = self.color.unwrap_or_else(|| {
            if is_grid {
                theme.primary
            } else {
                window.text_style().color
            }
        });
        let secondary = self.secondary.unwrap_or_else(|| {
            if is_grid {
                theme.primary.opacity(0.22)
            } else {
                primary.opacity(0.25)
            }
        });
        let size: f32 = self.size.into();
        let speed = self.speed;
        let reduce = cx.reduce_motion();

        match self.variant {
            LoaderVariant::Diamond => {
                ring_loader(size, primary, speed, reduce, &diamond_cells(), flash_fade, false)
            }
            LoaderVariant::Orbit => {
                ring_loader(size, primary, speed, reduce, &orbit_cells(), flash_fade, false)
            }
            LoaderVariant::BoxDots => {
                ring_loader(size, primary, speed, reduce, &box_dot_cells(), flash_fade, true)
            }
            LoaderVariant::Snake => {
                ring_loader(size, primary, speed, reduce, &snake_cells(), soft_pulse, false)
            }
            LoaderVariant::Zigzag => {
                ring_loader(size, primary, speed, reduce, &zigzag_cells(), flash_fade, false)
            }
            LoaderVariant::Wave => wave_loader(size, primary, speed, reduce),
            LoaderVariant::Bounce => bounce_loader(size, primary, speed, reduce),
            LoaderVariant::Cascade => cascade_loader(size, primary, speed, reduce),
            LoaderVariant::Breath => breath_loader(size, primary, speed, reduce),
            LoaderVariant::Spark => spark_loader(size, primary, speed, reduce),
            LoaderVariant::Dots => row_loader(size, primary, speed, reduce, 3, true, soft_pulse),
            LoaderVariant::Bars => bars_loader(size, primary, speed, reduce),
            LoaderVariant::Blocks => blocks_loader(size, primary, speed, reduce),
            LoaderVariant::GridZigzag => {
                grid9_loader(size, primary, secondary, speed, reduce, &GRID_ZIGZAG_PHASE)
            }
            LoaderVariant::GridShift => {
                grid9_loader(size, primary, secondary, speed, reduce, &GRID_SHIFT_PHASE)
            }
            LoaderVariant::GridSpin => {
                grid9_loader(size, primary, secondary, speed, reduce, &GRID_SPIN_PHASE)
            }
        }
    }
}

/// Serpentine order: 0→1→2→5→4→3→6→7→8, phase = index / 9.
const GRID_ZIGZAG_PHASE: [f32; 9] = {
    let mut p = [0.0_f32; 9];
    let order = [0usize, 1, 2, 5, 4, 3, 6, 7, 8];
    let mut i = 0;
    while i < 9 {
        p[order[i]] = i as f32 / 9.0;
        i += 1;
    }
    p
};

/// Scrambled phases — reads as random shift without true RNG (stable across frames).
const GRID_SHIFT_PHASE: [f32; 9] = [0.00, 0.47, 0.13, 0.81, 0.29, 0.66, 0.94, 0.52, 0.18];

/// Clockwise ring from top-left, centre last: 0→1→2→5→8→7→6→3→4.
const GRID_SPIN_PHASE: [f32; 9] = {
    let mut p = [0.0_f32; 9];
    let order = [0usize, 1, 2, 5, 8, 7, 6, 3, 4];
    let mut i = 0;
    while i < 9 {
        p[order[i]] = i as f32 / 9.0;
        i += 1;
    }
    p
};

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

/// 3×3 ring excluding the centre, clockwise from top-left.
fn snake_cells() -> [(f32, f32, f32); 8] {
    const C: f32 = 0.26;
    const G: f32 = 0.11; // gap so 3*C + 2*G ≈ 1
    let at = |col: usize, row: usize| -> (f32, f32, f32) {
        (col as f32 * (C + G), row as f32 * (C + G), C)
    };
    [
        at(0, 0),
        at(1, 0),
        at(2, 0),
        at(2, 1),
        at(2, 2),
        at(1, 2),
        at(0, 2),
        at(0, 1),
    ]
}

/// Diagonal zigzag: main diagonal then anti-diagonal.
fn zigzag_cells() -> [(f32, f32, f32); 6] {
    const C: f32 = 0.22;
    [
        (0.00, 0.00, C),
        (0.39, 0.39, C),
        (0.78, 0.78, C),
        (0.78, 0.00, C),
        (0.39, 0.39, C),
        (0.00, 0.78, C),
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

/// Soft cosine pulse used by processing variants (0.15 → 1 → 0.15).
fn soft_pulse(t: f32) -> f32 {
    let wave = 0.5 - 0.5 * (t.rem_euclid(1.0) * TAU).cos();
    0.15 + 0.85 * wave
}

/// Narrow travelling band — bright only near phase 0, dim elsewhere.
fn wave_band(t: f32) -> f32 {
    let t = t.rem_euclid(1.0);
    // Distance to crest on a circle.
    let d = t.min(1.0 - t);
    let spread = 0.22;
    let intensity = (1.0 - d / spread).clamp(0.0, 1.0);
    0.18 + 0.82 * ease_in_out(intensity)
}

const REST_OPACITY: f32 = 0.45;

/// Full 3×3 boxy grid — square cells, two-tone primary ↔ secondary by phase.
fn grid9_loader(
    size: f32,
    primary: Hsla,
    secondary: Hsla,
    speed: Duration,
    reduce: bool,
    phases: &[f32; 9],
) -> AnyElement {
    let cell = size * 0.28;
    let gap = (size - cell * 3.0) / 4.0;
    let phases = *phases;

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children((0..9).map(move |i| {
            let col = i % 3;
            let row = i / 3;
            let x = gap + col as f32 * (cell + gap);
            let y = gap + row as f32 * (cell + gap);
            let phase = phases[i];
            let block = div()
                .absolute()
                .left(px(x))
                .top(px(y))
                .size(px(cell))
                .rounded(px(cell * 0.12))
                .bg(if reduce {
                    motion::mix(secondary, primary, 0.35)
                } else {
                    secondary
                });
            if reduce {
                block.opacity(REST_OPACITY).into_any_element()
            } else {
                block
                    .with_animation(
                        ("loader-grid9", i),
                        Animation::new(speed).repeat().with_easing(move |t| {
                            flash_fade((t - phase).rem_euclid(1.0))
                        }),
                        move |el, wave| {
                            el.bg(motion::mix(secondary, primary, wave))
                                .opacity(0.55 + 0.45 * wave)
                        },
                    )
                    .into_any_element()
            }
        }))
        .into_any_element()
}

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

fn wave_loader(size: f32, color: Hsla, speed: Duration, reduce: bool) -> AnyElement {
    const COUNT: usize = 5;
    let cell = size * 0.14;
    let gap = (size - cell * COUNT as f32) / (COUNT as f32 + 1.0);
    let stagger = 1.0 / COUNT as f32;

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children((0..COUNT).map(move |i| {
            let x = gap + i as f32 * (cell + gap);
            let y = (size - cell) / 2.0;
            let dot = div()
                .absolute()
                .left(px(x))
                .top(px(y))
                .size(px(cell))
                .rounded_full()
                .bg(color);
            if reduce {
                dot.opacity(REST_OPACITY).into_any_element()
            } else {
                let phase = i as f32 * stagger;
                dot.with_animation(
                    ("loader-wave", i),
                    Animation::new(speed).repeat().with_easing(move |t| {
                        wave_band((t - phase).rem_euclid(1.0))
                    }),
                    |el, opacity| el.opacity(opacity),
                )
                .into_any_element()
            }
        }))
        .into_any_element()
}

fn bounce_loader(size: f32, color: Hsla, speed: Duration, reduce: bool) -> AnyElement {
    const COUNT: usize = 3;
    let cell = size * 0.22;
    let gap = (size - cell * COUNT as f32) / (COUNT as f32 + 1.0);
    let rest_y = (size - cell) * 0.55;
    let lift = size * 0.28;
    let stagger = 1.0 / COUNT as f32;

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children((0..COUNT).map(move |i| {
            let x = gap + i as f32 * (cell + gap);
            let dot = div()
                .absolute()
                .left(px(x))
                .top(px(rest_y))
                .size(px(cell))
                .rounded_full()
                .bg(color);
            if reduce {
                dot.opacity(REST_OPACITY).into_any_element()
            } else {
                let phase = i as f32 * stagger;
                dot.with_animation(
                    ("loader-bounce", i),
                    Animation::new(speed).repeat().with_easing(move |t| {
                        soft_pulse((t - phase).rem_euclid(1.0))
                    }),
                    move |el, wave| {
                        // Peak of soft_pulse lifts the dot; trough parks it.
                        el.top(px(rest_y - lift * wave))
                            .opacity(0.35 + 0.65 * wave)
                    },
                )
                .into_any_element()
            }
        }))
        .into_any_element()
}

fn cascade_loader(size: f32, color: Hsla, speed: Duration, reduce: bool) -> AnyElement {
    const COUNT: usize = 4;
    let cell = size * 0.18;
    let gap = (size - cell * COUNT as f32) / (COUNT as f32 + 1.0);
    let stagger = 1.0 / COUNT as f32;
    let x = (size - cell) / 2.0;

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children((0..COUNT).map(move |i| {
            let y = gap + i as f32 * (cell + gap);
            let dot = div()
                .absolute()
                .left(px(x))
                .top(px(y))
                .size(px(cell))
                .rounded_full()
                .bg(color);
            if reduce {
                dot.opacity(REST_OPACITY).into_any_element()
            } else {
                let phase = i as f32 * stagger;
                dot.with_animation(
                    ("loader-cascade", i),
                    Animation::new(speed).repeat().with_easing(move |t| {
                        flash_fade((t - phase).rem_euclid(1.0))
                    }),
                    |el, opacity| el.opacity(opacity),
                )
                .into_any_element()
            }
        }))
        .into_any_element()
}

fn breath_loader(size: f32, color: Hsla, speed: Duration, reduce: bool) -> AnyElement {
    let max = size * 0.72;
    let min = size * 0.38;

    let slot = div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .flex()
        .items_center()
        .justify_center();

    if reduce {
        return slot
            .child(
                div()
                    .size(px((max + min) / 2.0))
                    .rounded_full()
                    .bg(color)
                    .opacity(REST_OPACITY),
            )
            .into_any_element();
    }

    slot.child(
        div()
            .rounded_full()
            .bg(color)
            .with_animation(
                "loader-breath",
                Animation::new(speed).repeat().with_easing(soft_pulse),
                move |el, wave| {
                    el.size(px(min + (max - min) * wave))
                        .opacity(0.35 + 0.55 * wave)
                },
            ),
    )
    .into_any_element()
}

fn spark_loader(size: f32, color: Hsla, speed: Duration, reduce: bool) -> AnyElement {
    // Centre + N/E/S/W arms. Arms lag the centre slightly so it reads as a bloom.
    let core = size * 0.28;
    let arm = size * 0.18;
    let mid = (size - core) / 2.0;
    let arm_mid = (size - arm) / 2.0;
    let inset = size * 0.06;

    let cells: [(f32, f32, f32, f32); 5] = [
        (mid, mid, core, 0.0),                         // centre
        (arm_mid, inset, arm, 0.15),                   // north
        (size - inset - arm, arm_mid, arm, 0.30),      // east
        (arm_mid, size - inset - arm, arm, 0.45),      // south
        (inset, arm_mid, arm, 0.60),                   // west
    ];

    div()
        .relative()
        .flex_shrink_0()
        .size(px(size))
        .children(cells.into_iter().enumerate().map(move |(i, (x, y, c, phase))| {
            let cell = div()
                .absolute()
                .left(px(x))
                .top(px(y))
                .size(px(c))
                .rounded(px(c * 0.2))
                .bg(color);
            if reduce {
                cell.opacity(REST_OPACITY).into_any_element()
            } else {
                cell.with_animation(
                    ("loader-spark", i),
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
