//! Animation kit — the motion catalog and loader math, ported from
//! `reference/zeron` (`crates/ui/src/motion.rs` + `crates/proto/src/motion.rs`).
//!
//! Two halves:
//!
//! 1. **Catalog** — [`CubicBezier`] (CSS-exact `cubic-bezier()`), [`MotionSpec`]
//!    (duration + delay + curve, foldable into a gpui [`Animation`]) and the
//!    named entrances ([`fade_in`], [`menu_in`], [`dialog_in`], …).
//! 2. **Pulse clock** — a shared ~30fps driver for the repeating loaders in
//!    [`components::composite::loaders`]. Loader cells stay phase-locked across instances
//!    because every caller reads phase off one epoch; a view leases a slot
//!    while its spinner is mounted and the clock parks entirely when the last
//!    lease expires, so a window with no spinner schedules nothing. This is the
//!    perf shape zeron adopted after a single mounted loader pinned the whole
//!    window at display refresh rate.
//!
//! Deviations from zeron, on purpose: no Windows precise-clock override and no
//! app-level ReduceMotion preference machinery (On/Off/background-pause) —
//! reduced motion is gpui's [`App::reduce_motion`] flag alone, which the app is
//! free to drive from OS accessibility settings. Under reduced motion the
//! loaders' [`ActivityPulse`] returns a static rest brightness and
//! [`pulse_delta`] returns 0; gpui additionally snaps every `with_animation`
//! element for the oneshot entrances.

use std::collections::HashMap;
use std::time::{Duration, Instant};

use gpui::{
    Animation, AnimationElement, AnimationExt, App, ElementId, EntityId, Global, Hsla, IntoElement,
    Rgba, Styled, px, rems,
};
use gpui_base::motion::Transition;
use gpui_base::{Easing, Spring};
use gpui_component::theme::MotionTokens;

// ---------------------------------------------------------------------------
// Cubic bezier
// ---------------------------------------------------------------------------

/// A CSS `cubic-bezier(x1, y1, x2, y2)` timing function (endpoints fixed at
/// (0,0) and (1,1)). Evaluation solves x(t) = input by Newton iteration with a
/// bisection fallback — the standard UnitBezier approach.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CubicBezier {
    pub x1: f32,
    pub y1: f32,
    pub x2: f32,
    pub y2: f32,
}

impl CubicBezier {
    pub const fn new(x1: f32, y1: f32, x2: f32, y2: f32) -> Self {
        Self { x1, y1, x2, y2 }
    }

    fn coefficients(a: f32, b: f32) -> (f32, f32, f32) {
        let c = 3.0 * a;
        let bb = 3.0 * (b - a) - c;
        let aa = 1.0 - c - bb;
        (aa, bb, c)
    }

    fn sample_x(&self, t: f32) -> f32 {
        let (a, b, c) = Self::coefficients(self.x1, self.x2);
        ((a * t + b) * t + c) * t
    }

    fn sample_y(&self, t: f32) -> f32 {
        let (a, b, c) = Self::coefficients(self.y1, self.y2);
        ((a * t + b) * t + c) * t
    }

    fn sample_x_derivative(&self, t: f32) -> f32 {
        let (a, b, c) = Self::coefficients(self.x1, self.x2);
        (3.0 * a * t + 2.0 * b) * t + c
    }

    /// Curve parameter `t` for a given progress `x` (both 0..1).
    fn solve_t_for_x(&self, x: f32) -> f32 {
        // Newton–Raphson.
        let mut t = x;
        for _ in 0..8 {
            let err = self.sample_x(t) - x;
            if err.abs() < 1e-6 {
                return t;
            }
            let d = self.sample_x_derivative(t);
            if d.abs() < 1e-6 {
                break;
            }
            t -= err / d;
        }
        // Bisection fallback (x(t) is monotonic for valid CSS beziers).
        let (mut lo, mut hi) = (0.0_f32, 1.0_f32);
        for _ in 0..32 {
            let mid = (lo + hi) / 2.0;
            if self.sample_x(mid) < x {
                lo = mid
            } else {
                hi = mid
            }
        }
        (lo + hi) / 2.0
    }

    /// Eased output for input progress `x ∈ [0,1]` (clamped).
    pub fn eval(&self, x: f32) -> f32 {
        if x <= 0.0 {
            return 0.0;
        }
        if x >= 1.0 {
            return 1.0;
        }
        // f32 rounding can push sample_y a hair past 1.0 (observed 1.000000119
        // near the end of menu animations); gpui's animation element asserts
        // `delta ∈ [0,1]` and aborts, so clamp the output hard.
        self.sample_y(self.solve_t_for_x(x)).clamp(0.0, 1.0)
    }

    /// This curve as a gpui easing closure.
    pub fn easing(self) -> impl Fn(f32) -> f32 + 'static {
        move |x| self.eval(x)
    }
}

/// zeron's signature entrance curve — CSS `cubic-bezier(0.16, 1, 0.3, 1)`.
pub const EASE_OUT_EXPO: CubicBezier = CubicBezier::new(0.16, 1.0, 0.3, 1.0);
/// CSS `ease-out` — width/height transitions.
pub const EASE_OUT: CubicBezier = CubicBezier::new(0.0, 0.0, 0.58, 1.0);
/// CSS `ease` — quick fades, menu/dialog pops.
pub const EASE: CubicBezier = CubicBezier::new(0.25, 0.1, 0.25, 1.0);
/// `easeOutQuint` — CSS `cubic-bezier(0.22, 1, 0.36, 1)`.
pub const EASE_OUT_QUINT: CubicBezier = CubicBezier::new(0.22, 1.0, 0.36, 1.0);
/// CSS `ease-in-out` — scroll glides.
pub const EASE_IN_OUT: CubicBezier = CubicBezier::new(0.42, 0.0, 0.58, 1.0);
/// Tailwind's default — hover fades.
pub const EASE_TAILWIND: CubicBezier = CubicBezier::new(0.4, 0.0, 0.2, 1.0);

// ---------------------------------------------------------------------------
// Celestia design-system motion (globals.css `@theme` → "Motion")
// ---------------------------------------------------------------------------
//
// The six curves above are Zeron's / the CSS keywords'. The three below are the
// Celestia web tokens — the ones every `duration-*` transition in
// `packages/ui/src/components/primitive/*.tsx` actually rides on. They carry a
// `_TOKEN` suffix because two of them share a name with a CSS *keyword* that is
// already taken above (`EASE_OUT` is `ease-out`, not `--ease-out`).
//
// Re-derive these when globals.css changes; the values are pinned by the tests
// at the bottom of this file.

/// `--ease-out` — the design system's signature curve. The tabs indicator and
/// panel entrance, the switch, popover and dialog entrances, and every
/// `ease-out` hover fade all use it: `cubic-bezier(0.23, 1, 0.32, 1)`.
pub const EASE_OUT_TOKEN: CubicBezier = CubicBezier::new(0.23, 1.0, 0.32, 1.0);
/// `--ease-in-out` — symmetric, for moves that should read as deliberate
/// rather than snappy: `cubic-bezier(0.77, 0, 0.175, 1)`.
pub const EASE_IN_OUT_TOKEN: CubicBezier = CubicBezier::new(0.77, 0.0, 0.175, 1.0);
/// `--ease-drawer` — sheets, drawers and the overlay scrim that rides with
/// them: `cubic-bezier(0.32, 0.72, 0, 1)`.
pub const EASE_DRAWER_TOKEN: CubicBezier = CubicBezier::new(0.32, 0.72, 0.0, 1.0);

/// `--transition-duration-instant` — 80ms. Press feedback (`active:*`).
pub const DURATION_INSTANT: Duration = Duration::from_millis(80);
/// `--transition-duration-fast` — 150ms. Hover colour and background fades.
pub const DURATION_FAST: Duration = Duration::from_millis(150);
/// `--transition-duration-normal` — 220ms. The tabs indicator, panel
/// entrances, dialog and overlay fades.
pub const DURATION_NORMAL: Duration = Duration::from_millis(220);
/// `--transition-duration-slow` — 320ms. Sheets, navigation-menu and toasts.
pub const DURATION_SLOW: Duration = Duration::from_millis(320);
/// `--transition-duration-slower` — 500ms. Caret blink and long reveals.
pub const DURATION_SLOWER: Duration = Duration::from_millis(500);

// ---------------------------------------------------------------------------
// Motion specs (the catalog)
// ---------------------------------------------------------------------------

/// One catalog entry: duration + optional delay + curve. The delay is folded into
/// the gpui animation timeline (gpui `Animation` has no native delay): the
/// animation runs for `delay + duration` and [`MotionSpec::progress`] holds 0
/// until the delay has elapsed.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MotionSpec {
    pub duration_ms: u64,
    pub delay_ms: u64,
    pub curve: CubicBezier,
}

impl MotionSpec {
    pub const fn new(duration_ms: u64, curve: CubicBezier) -> Self {
        Self {
            duration_ms,
            delay_ms: 0,
            curve,
        }
    }

    pub const fn with_delay(mut self, delay_ms: u64) -> Self {
        self.delay_ms = delay_ms;
        self
    }

    /// Wall-clock span of the whole timeline (delay + duration).
    pub fn total(&self) -> Duration {
        Duration::from_millis(self.delay_ms + self.duration_ms)
    }

    /// Eased progress (0..1) for a raw timeline delta (0..1 across [`Self::total`](Self::total)).
    /// Pure — unit-testable without a window.
    pub fn progress(&self, raw_delta: f32) -> f32 {
        let total = (self.delay_ms + self.duration_ms) as f32;
        if total <= 0.0 || self.duration_ms == 0 {
            return 1.0;
        }
        let t =
            (raw_delta.clamp(0.0, 1.0) * total - self.delay_ms as f32) / self.duration_ms as f32;
        self.curve.eval(t.clamp(0.0, 1.0))
    }

    /// A oneshot gpui [`Animation`] for this spec (delay folded in).
    /// Wall-clock span honors [`speed_scale`] (measurement knob).
    pub fn animation(&self) -> Animation {
        let spec = *self;
        Animation::new(spec.total().mul_f32(speed_scale())).with_easing(move |d| spec.progress(d))
    }
}

/// Entrances: 0.5s expo-out fade + 4px rise.
pub const FADE_IN: MotionSpec = MotionSpec::new(500, EASE_OUT_EXPO);
/// Quick fade: 0.15s.
pub const FADE_QUICK: MotionSpec = MotionSpec::new(150, EASE);
/// Popover-in: 0.14s (scale 0.96 approximated, translateY −2).
pub const MENU_IN: MotionSpec = MotionSpec::new(140, EASE);
/// Popover-out: 0.1s — quicker than the entrance (exits should get out of the
/// way; matches the Radix convention of a shorter close than open).
pub const MENU_OUT: MotionSpec = MotionSpec::new(100, EASE);
/// Dialog-in: 0.18s (scale 0.96→1 approximated).
pub const DIALOG_IN: MotionSpec = MotionSpec::new(180, EASE);
/// Boot-splash-style exit: 0.5s fade + 6px lift after a 0.15s hold.
pub const SPLASH_OUT: MotionSpec = MotionSpec::new(500, EASE).with_delay(150);
/// Sidebar / pane width+height transitions: 200ms ease-out.
pub const RESIZE: MotionSpec = MotionSpec::new(200, EASE_OUT);
/// Hover color fades.
pub const HOVER_FADE: MotionSpec = MotionSpec::new(150, EASE_TAILWIND);
/// The pulse loader's period: 2.4s per wave with a 0.15s per-cell stagger.
pub const PULSE: MotionSpec = MotionSpec::new(2400, EASE);
/// The gradient spinner's period: 750ms per-cell phase wave.
pub const GRADIENT_SPIN: MotionSpec = MotionSpec::new(750, EASE);

// ---------------------------------------------------------------------------
// The design-system scale as MotionSpecs
// ---------------------------------------------------------------------------
//
// One spec per `duration-*` utility the web primitives actually use, so a
// component can name the effect it is reproducing instead of restating a
// duration and a curve. `HOVER` is the `transition-colors duration-fast
// ease-out` that every interactive surface carries; `SLIDE` is the tabs
// indicator and panel entrance; `PRESS` is `active:duration-instant`.

/// Hover colour / background fade — `transition-colors duration-fast ease-out`.
pub const HOVER: MotionSpec = MotionSpec::new(150, EASE_OUT_TOKEN);
/// Selection and panel motion — the tabs indicator slide, `data-open` panel
/// entrances, `duration-normal` with the signature curve.
pub const SLIDE: MotionSpec = MotionSpec::new(220, EASE_OUT_TOKEN);
/// Press feedback — `active:duration-instant`.
pub const PRESS: MotionSpec = MotionSpec::new(80, EASE_OUT_TOKEN);
/// Popup entrance — `duration-fast ease-out` (popover, tooltip, hover card).
pub const POPUP_IN: MotionSpec = MotionSpec::new(150, EASE_OUT_TOKEN);
/// Overlay scrim and sheets — `duration-slow` with `--ease-drawer`.
pub const OVERLAY: MotionSpec = MotionSpec::new(320, EASE_DRAWER_TOKEN);

/// Standard entrance: opacity 0→1 + translateY 4→0 over [`FADE_IN`].
pub fn fade_in<E>(id: impl Into<ElementId>, element: E) -> AnimationElement<E>
where
    E: Styled + IntoElement + 'static,
{
    element.with_animation(id, FADE_IN.animation(), |el, t| {
        el.relative().opacity(t).top(px(4.0 * (1.0 - t)))
    })
}

/// Settling entrance: opacity 0→1 while moving 10px down into place.
pub fn settle_down<E>(id: impl Into<ElementId>, element: E) -> AnimationElement<E>
where
    E: Styled + IntoElement + 'static,
{
    element.with_animation(id, FADE_IN.animation(), |el, t| {
        el.relative().opacity(t).top(px(-10.0 * (1.0 - t)))
    })
}

/// Quick opacity-only fade over [`FADE_QUICK`].
pub fn fade_quick<E>(id: impl Into<ElementId>, element: E) -> AnimationElement<E>
where
    E: Styled + IntoElement + 'static,
{
    element.with_animation(id, FADE_QUICK.animation(), |el, t| el.opacity(t))
}

/// Popover entrance: fade + translateY −2→0 over [`MENU_IN`].
pub fn menu_in<E>(id: impl Into<ElementId>, element: E) -> AnimationElement<E>
where
    E: Styled + IntoElement + 'static,
{
    menu_in_from(id, -2.0, element)
}

/// [`menu_in`] travelling from the trigger's side: `from` is the signed
/// starting offset (negative above the resting place for dropdowns,
/// positive below it for menus that open upward).
pub fn menu_in_from<E>(id: impl Into<ElementId>, from: f32, element: E) -> AnimationElement<E>
where
    E: Styled + IntoElement + 'static,
{
    element.with_animation(id, MENU_IN.animation(), move |el, t| {
        el.relative()
            .opacity(0.3 + 0.7 * t)
            .top(px(from * (1.0 - t)))
    })
}

/// Dialog entrance over [`DIALOG_IN`] (scale approximated with fade + 2px rise).
pub fn dialog_in<E>(id: impl Into<ElementId>, element: E) -> AnimationElement<E>
where
    E: Styled + IntoElement + 'static,
{
    element.with_animation(id, DIALOG_IN.animation(), |el, t| {
        el.relative().opacity(t).top(px(2.0 * (1.0 - t)))
    })
}

/// Splash-style exit: hold 150ms, then fade out + lift 6px over 500ms.
pub fn splash_out<E>(id: impl Into<ElementId>, element: E) -> AnimationElement<E>
where
    E: Styled + IntoElement + 'static,
{
    element.with_animation(id, SPLASH_OUT.animation(), |el, t| {
        el.opacity(1.0 - t).top(px(-6.0 * t))
    })
}

// ---------------------------------------------------------------------------
// Value transitions — the `transition-*` half of the design system
// ---------------------------------------------------------------------------
//
// `with_animation` above replays a fixed timeline; it cannot express
// `transition-colors duration-fast ease-out`, because the target changes with
// interaction. `gpui_base::motion::transition` can: it samples a value toward a
// target and reverses from wherever it currently is. These helpers hand a
// component the policy for one of the design system's steps, so a hover fade is
// named the way the web names it.
//
// Call them while rendering, and key them per element:
//
// ```ignore
// let t = transition(("btn-hover", self.id.clone()), hovered as u8 as f32,
//                    motion::hover_transition(), window, cx);
// let bg = motion::mix(rest, hover, t);
// ```

/// `transition-colors duration-fast ease-out` — a hover colour or background
/// fade between two states.
pub fn hover_transition() -> Transition {
    spec_transition(HOVER)
}

/// `active:duration-instant` — press feedback.
pub fn press_transition() -> Transition {
    spec_transition(PRESS)
}

/// `duration-normal` with the signature curve — selection slides, indicator
/// travel and panel entrances.
pub fn slide_transition() -> Transition {
    spec_transition(SLIDE)
}

/// Any catalog [`MotionSpec`] as a value-transition policy. Every helper above
/// is this function over a named spec, so a helper's duration and curve are the
/// spec's — the ones the tests pin against `globals.css`.
pub fn spec_transition(spec: MotionSpec) -> Transition {
    Transition::new(Duration::from_millis(spec.duration_ms)).ease(spec.curve.easing())
}

// ---------------------------------------------------------------------------
// The design system as `gpui-component`'s MotionTokens
// ---------------------------------------------------------------------------

/// The Celestia motion policy as `gpui-component`'s [`MotionTokens`].
///
/// `theme.json` cannot carry this: `Theme::motion` is `#[serde(skip)]`, so the
/// scale is assigned directly in [`crate::theme::install`]. Without it every
/// re-exported `gpui-component` component — switch, checkbox, slider, accordion,
/// collapsible, progress, carousel, `TabBar` — animates on `gpui-component`'s own scale
/// (instant 0 / fast 120 / normal 180 / slow 280ms) rather than the web design
/// system's (80 / 150 / 220 / 320ms).
///
/// Mapping, web token → gpui slot:
///
/// | gpui slot | Celestia value | Because |
/// | --- | --- | --- |
/// | `duration_instant` | `DURATION_INSTANT` (80ms) | `active:duration-instant` |
/// | `duration_fast` | `DURATION_FAST` (150ms) | `duration-fast` hovers |
/// | `duration_normal` | `DURATION_NORMAL` (220ms) | indicator + entrances |
/// | `duration_slow` | `DURATION_SLOW` (320ms) | sheets, navigation-menu |
/// | `easing_enter` | `--ease-out` | `data-open:animate-in … ease-out` |
/// | `easing_exit` | `--ease-drawer` | sheet / drawer / overlay exit |
/// | `easing_move` | `--ease-out` | the tabs indicator's own curve |
/// | `spring_control` | 150ms | switch / checkbox thumbs are `duration-fast` |
/// | `spring_move` | 220ms | the tabs indicator is `duration-normal` |
pub fn motion_tokens() -> MotionTokens {
    MotionTokens {
        duration_instant: DURATION_INSTANT,
        duration_fast: DURATION_FAST,
        duration_normal: DURATION_NORMAL,
        duration_slow: DURATION_SLOW,
        easing_enter: easing(EASE_OUT_TOKEN),
        easing_exit: easing(EASE_DRAWER_TOKEN),
        easing_move: easing(EASE_OUT_TOKEN),
        spring_control: Spring::new(DURATION_FAST),
        spring_move: Spring::new(DURATION_NORMAL)
            .with_damping(0.85)
            .with_epsilon(0.1),
        distance_short: rems(0.25),
        distance_medium: rems(0.5),
    }
}

/// A [`CubicBezier`] as a gpui-base [`Easing`]. The control points are compile-
/// time constants, so an invalid curve is a bug, not a runtime condition.
fn easing(curve: CubicBezier) -> Easing {
    Easing::cubic_bezier(curve.x1, curve.y1, curve.x2, curve.y2)
        .expect("celestia motion curves are valid CSS beziers")
}

// ---------------------------------------------------------------------------
// Pulse clock — throttled drive for the repeating loaders
// ---------------------------------------------------------------------------

/// Repeat-tick interval for the pulse/spinner loaders (~30fps).
///
/// Running loaders as gpui `with_animation(...repeating...)` elements requests
/// a redraw every display frame for as long as they are mounted. A shared 30fps
/// clock is visually equivalent for these chunky cell waves at a fraction of
/// the redraws, and a window with no spinner mounted schedules nothing at all.
const PULSE_TICK: Duration = Duration::from_millis(33);

/// How long a view stays on the tick list after its last spinner paint. One
/// lease outlives a few missed frames; an unmounted spinner stops renewing and
/// the view drops off, letting the clock park.
const PULSE_LEASE: Duration = Duration::from_millis(300);

struct PulseClock {
    epoch: Instant,
    leases: HashMap<EntityId, PulseLease>,
    tick: u64,
    running: bool,
}

struct PulseLease {
    until: Instant,
    stride: u64,
}

impl PulseLease {
    fn renew(&mut self, now: Instant, stride: u64) {
        self.until = now + PULSE_LEASE;
        self.stride = self.stride.min(stride);
    }

    fn take_tick(&mut self, tick: u64) -> bool {
        if !tick.is_multiple_of(self.stride) {
            return false;
        }
        // Each paint re-establishes the fastest mounted animation. A retired
        // 30Hz animation must not permanently pull a 15Hz loader up to 30Hz.
        self.stride = u64::MAX;
        true
    }
}

impl Global for PulseClock {}

impl Default for PulseClock {
    fn default() -> Self {
        Self {
            epoch: Instant::now(),
            leases: HashMap::new(),
            tick: 0,
            running: false,
        }
    }
}

/// Current phase `[0,1)` of a repeating spec, plus a lease that keeps the
/// calling view re-rendering at [`PULSE_TICK`] while its spinner stays
/// mounted. All cells across all views share one epoch, so multi-instance
/// loaders stay phase-locked. Reduced motion returns a static 0 and schedules
/// nothing.
pub fn pulse_delta(spec: &MotionSpec, view: EntityId, cx: &mut App) -> f32 {
    pulse_delta_every(spec, view, 1, cx)
}

/// Coarser cell loaders need only 15Hz; their wall-clock period and phase stay
/// identical. Text dissolves still use the full 30Hz clock.
pub fn pulse_delta_slow(spec: &MotionSpec, view: EntityId, cx: &mut App) -> f32 {
    pulse_delta_every(spec, view, 2, cx)
}

fn pulse_delta_every(spec: &MotionSpec, view: EntityId, stride: u64, cx: &mut App) -> f32 {
    if cx.reduce_motion() {
        return 0.0;
    }
    pulse_lease_every(view, stride, cx);
    pulse_phase(spec, cx)
}

fn pulse_phase(spec: &MotionSpec, cx: &mut App) -> f32 {
    let clock = cx.default_global::<PulseClock>();
    (clock.epoch.elapsed().as_secs_f32() / spec.total().as_secs_f32()).fract()
}

/// Activity feedback uses a slow, uniform brightness pulse when the system
/// reduces motion. Decorative animation continues to use the
/// reduced-motion-gated helpers.
#[derive(Clone, Copy)]
pub struct ActivityPulse {
    phase: f32,
    subtle: bool,
}

impl ActivityPulse {
    pub fn opacity(&self, cell_phase: f32, dim: f32) -> f32 {
        if self.subtle {
            // No travelling chase or size change, just a gentle static rest
            // brightness (phase is pinned to 0 under reduced motion).
            0.6
        } else {
            gspin_opacity(self.phase + cell_phase, dim)
        }
    }
}

pub fn activity_pulse(view: EntityId, cx: &mut App) -> ActivityPulse {
    activity_pulse_every(view, 1, cx)
}

pub fn activity_pulse_slow(view: EntityId, cx: &mut App) -> ActivityPulse {
    activity_pulse_every(view, 2, cx)
}

fn activity_pulse_every(view: EntityId, stride: u64, cx: &mut App) -> ActivityPulse {
    if cx.reduce_motion() {
        // Static rest brightness, nothing scheduled.
        return ActivityPulse {
            phase: 0.0,
            subtle: true,
        };
    }
    let phase = {
        schedule_pulse_every(view, stride, cx);
        pulse_phase(&GRADIENT_SPIN, cx)
    };
    ActivityPulse {
        phase,
        subtle: false,
    }
}

/// Schedule cosmetic animation through the same bounded clock as loaders.
/// Renew only while painting an active animation; the clock parks after the
/// last lease expires, including when a view is hidden or removed.
pub fn pulse_lease(view: EntityId, cx: &mut App) {
    pulse_lease_every(view, 1, cx);
}

fn pulse_lease_every(view: EntityId, stride: u64, cx: &mut App) {
    if cx.reduce_motion() {
        return;
    }
    schedule_pulse_every(view, stride, cx);
}

fn schedule_pulse_every(view: EntityId, stride: u64, cx: &mut App) {
    let clock = cx.default_global::<PulseClock>();
    let now = Instant::now();
    clock
        .leases
        .entry(view)
        .or_insert(PulseLease {
            until: now + PULSE_LEASE,
            stride,
        })
        .renew(now, stride);
    if !clock.running {
        clock.running = true;
        cx.spawn(async move |cx| {
            loop {
                cx.background_executor().timer(PULSE_TICK).await;
                let parked = cx.update(|cx| {
                    let clock = cx.default_global::<PulseClock>();
                    let now = Instant::now();
                    clock.leases.retain(|_, lease| lease.until > now);
                    if clock.leases.is_empty() {
                        clock.running = false;
                        return true;
                    }
                    clock.tick = clock.tick.wrapping_add(1);
                    let tick = clock.tick;
                    let views: Vec<EntityId> = clock
                        .leases
                        .iter_mut()
                        .filter_map(|(view, lease)| lease.take_tick(tick).then_some(*view))
                        .collect();
                    for view in views {
                        cx.notify(view);
                    }
                    false
                });
                if parked {
                    break;
                }
            }
        })
        .detach();
    }
}

// ---------------------------------------------------------------------------
// Loader math (pure; rendered by components::composite::loaders)
// ---------------------------------------------------------------------------

/// Cells in the pulse wave loader.
pub const PULSE_CELLS: usize = 5;
/// Side length of the gradient spinner matrix.
pub const MATRIX_SIDE: usize = 3;
/// Pulse loader cells rest at this opacity between pulses.
pub const PULSE_MIN_OPACITY: f32 = 0.08;
/// …and at this scale.
pub const PULSE_MIN_SCALE: f32 = 0.9;
/// Per-cell stagger, as a fraction of the pulse period (0.15s of 2.4s).
pub const PULSE_STAGGER: f32 = 0.15 / 2.4;
/// Opacity a gradient-spinner cell rests at between pulses.
pub const GSPIN_DIM: f32 = 0.1;

/// Linear interpolation.
pub fn lerp(from: f32, to: f32, t: f32) -> f32 {
    from + (to - from) * t
}

/// A cell's phase, given the loader's raw phase and the cell's index.
pub fn staggered_phase(raw_delta: f32, index: usize, stagger: f32) -> f32 {
    (raw_delta - index as f32 * stagger).rem_euclid(1.0)
}

/// Cosine pulse: 0 at phase 0, 1 at phase 0.5, back to 0 at phase 1.
pub fn pulse_wave(phase: f32) -> f32 {
    0.5 - 0.5 * (phase * std::f32::consts::TAU).cos()
}

/// Pulse loader cell opacity for a phase: 0.08 → 1 → 0.08.
pub fn pulse_opacity(phase: f32) -> f32 {
    PULSE_MIN_OPACITY + (1.0 - PULSE_MIN_OPACITY) * pulse_wave(phase)
}

/// Pulse loader cell scale for a phase: 0.9 → 1 → 0.9.
pub fn pulse_scale(phase: f32) -> f32 {
    PULSE_MIN_SCALE + (1.0 - PULSE_MIN_SCALE) * pulse_wave(phase)
}

/// Gradient-spin cell opacity for a local phase `t` (0..1 of the period),
/// ported from zeron's `gradient-spin-pulse` keyframes: full at the cycle
/// start, easing down to `dim` by 45%, resting at `dim` until 92%, then rising
/// back to full — the per-cell phase offset sweeps this pulse across the grid.
pub fn gspin_opacity(t: f32, dim: f32) -> f32 {
    let t = t.rem_euclid(1.0);
    if t < 0.45 {
        lerp(1.0, dim, t / 0.45)
    } else if t < 0.92 {
        dim
    } else {
        lerp(dim, 1.0, (t - 0.92) / 0.08)
    }
}

/// The phase offset of a `(row, col)` cell in the 3×3 gradient spinner: the
/// pulse enters at the bottom edge and converges toward the top-centre cell, so
/// the wave reads as travelling upward.
pub fn gspin_cell_phase(row: usize, col: usize) -> f32 {
    let centre = (MATRIX_SIDE as f32 - 1.0) / 2.0;
    let max = MATRIX_SIDE as f32 - 1.0 + centre;
    let d = MATRIX_SIDE as f32 - 1.0 - row as f32 + (col as f32 - centre).abs();
    if max == 0.0 { 0.0 } else { d / (max + 1.0) }
}

/// Blend two colors by `t` the way the browser transitions them: component
/// interpolation in sRGB with premultiplied alpha — a wash fading in from
/// transparent brightens without passing through grey.
pub fn mix(from: Hsla, to: Hsla, t: f32) -> Hsla {
    let t = t.clamp(0.0, 1.0);
    if t <= 0.0 {
        return from;
    }
    if t >= 1.0 {
        return to;
    }
    let (f, g) = (Rgba::from(from), Rgba::from(to));
    let a = lerp(f.a, g.a, t);
    if a <= f32::EPSILON {
        // Both endpoints (effectively) transparent — carry the target's hue.
        return Hsla::from(Rgba {
            r: g.r,
            g: g.g,
            b: g.b,
            a: 0.0,
        });
    }
    Hsla::from(Rgba {
        r: lerp(f.r * f.a, g.r * g.a, t) / a,
        g: lerp(f.g * f.a, g.g * g.a, t) / a,
        b: lerp(f.b * f.a, g.b * g.a, t) / a,
        a,
    })
}

/// Dev/measurement knob (`CELESTIA_MOTION_SCALE`, default 1): stretches every
/// catalog timeline by this factor — e.g. `CELESTIA_MOTION_SCALE=10` slows the
/// 200ms tweens to 2s so screenshot bursts can sample the geometry per frame.
/// Read once; never set in production.
pub fn speed_scale() -> f32 {
    static SCALE: std::sync::OnceLock<f32> = std::sync::OnceLock::new();
    *SCALE.get_or_init(|| {
        std::env::var("CELESTIA_MOTION_SCALE")
            .ok()
            .and_then(|v| v.parse::<f32>().ok())
            .filter(|s| s.is_finite())
            .map(|s| s.clamp(0.01, 100.0))
            .unwrap_or(1.0)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cubic_bezier_matches_css_anchor_points() {
        // linear is identity
        let linear = CubicBezier::new(0.0, 0.0, 1.0, 1.0);
        assert!((linear.eval(0.25) - 0.25).abs() < 1e-4);
        // ease-out-expo endpoints and mid shape
        assert_eq!(EASE_OUT_EXPO.eval(0.0), 0.0);
        assert_eq!(EASE_OUT_EXPO.eval(1.0), 1.0);
        let mid = EASE_OUT_EXPO.eval(0.5);
        assert!(
            mid > 0.85,
            "expo-out should be far along at x=0.5, got {mid}"
        );
    }

    #[test]
    fn spec_delay_holds_progress_at_zero() {
        let spec = SPLASH_OUT;
        assert_eq!(spec.delay_ms, 150);
        // 10% into a 650ms timeline = 65ms: still inside the hold.
        assert_eq!(spec.progress(0.1), 0.0);
        // 50% into the timeline = 325ms: 175ms into the 500ms run.
        let half = spec.progress(0.5);
        assert!(half > 0.0 && half < 1.0, "mid-run progress {half}");
        assert_eq!(spec.progress(1.0), 1.0);
    }

    #[test]
    fn staggered_phase_wraps_backward() {
        // Index 0 is exactly the raw phase.
        assert!((staggered_phase(0.3, 0, 0.1) - 0.3).abs() < 1e-6);
        // Negative phases wrap into [0,1).
        let wrapped = staggered_phase(0.05, 1, 0.1);
        assert!((wrapped - 0.95).abs() < 1e-6);
    }

    #[test]
    fn pulse_opacity_and_scale_hit_their_floors() {
        assert!((pulse_opacity(0.0) - PULSE_MIN_OPACITY).abs() < 1e-6);
        assert!((pulse_opacity(0.5) - 1.0).abs() < 1e-6);
        assert!((pulse_scale(0.0) - PULSE_MIN_SCALE).abs() < 1e-6);
        assert!((pulse_scale(0.5) - 1.0).abs() < 1e-6);
    }

    #[test]
    fn gspin_opacity_tracks_the_keyframes() {
        assert!((gspin_opacity(0.0, GSPIN_DIM) - 1.0).abs() < 1e-6);
        assert!((gspin_opacity(0.45, GSPIN_DIM) - GSPIN_DIM).abs() < 1e-6);
        assert!((gspin_opacity(0.7, GSPIN_DIM) - GSPIN_DIM).abs() < 1e-6);
        assert!((gspin_opacity(1.0, GSPIN_DIM) - 1.0).abs() < 1e-6);
    }

    #[test]
    fn gspin_wave_enters_at_the_bottom_edge() {
        // Bottom-centre (row 2, col 1) has the smallest offset — the crest
        // arrives there first; top-centre (row 0, col 1) is last.
        let bottom = gspin_cell_phase(2, 1);
        let top = gspin_cell_phase(0, 1);
        assert!(bottom < top, "bottom {bottom} should lead top {top}");
    }

    #[test]
    fn mix_matches_premultiplied_srgb() {
        let a = Hsla::from(Rgba {
            r: 1.0,
            g: 0.0,
            b: 0.0,
            a: 1.0,
        });
        let b = Hsla::from(Rgba {
            r: 0.0,
            g: 0.0,
            b: 1.0,
            a: 1.0,
        });
        let mid = Rgba::from(mix(a, b, 0.5));
        assert!((mid.r - 0.5).abs() < 1e-6);
        assert!((mid.b - 0.5).abs() < 1e-6);
        // A transparent source blends by premultiplied alpha: half the
        // target's alpha, carrying its hue.
        let clear = Hsla::from(Rgba {
            r: 1.0,
            g: 1.0,
            b: 1.0,
            a: 0.0,
        });
        let blended = Rgba::from(mix(clear, b, 0.5));
        assert!((blended.a - 0.5).abs() < 1e-6);
        assert!(blended.b > blended.r);
        // Both endpoints transparent — zero alpha, target hue.
        let clear_blue = Hsla::from(Rgba {
            r: 0.0,
            g: 0.0,
            b: 1.0,
            a: 0.0,
        });
        let out = Rgba::from(mix(clear, clear_blue, 0.5));
        assert!(out.a <= f32::EPSILON);
        assert!(out.b > 0.9);
    }

    /// The three design-system curves are read off `globals.css` and must stay
    /// pinned to those control points — the same trap as the theme hex values.
    #[test]
    fn design_system_curves_match_globals_css() {
        assert_eq!(EASE_OUT_TOKEN, CubicBezier::new(0.23, 1.0, 0.32, 1.0));
        assert_eq!(EASE_IN_OUT_TOKEN, CubicBezier::new(0.77, 0.0, 0.175, 1.0));
        assert_eq!(EASE_DRAWER_TOKEN, CubicBezier::new(0.32, 0.72, 0.0, 1.0));

        // Endpoints are fixed, and the signature curve is far along at the
        // midpoint — the "fast start, long settle" the web transitions read as.
        for curve in [EASE_OUT_TOKEN, EASE_IN_OUT_TOKEN, EASE_DRAWER_TOKEN] {
            assert_eq!(curve.eval(0.0), 0.0);
            assert_eq!(curve.eval(1.0), 1.0);
        }
        assert!(EASE_OUT_TOKEN.eval(0.5) > 0.75);
        // `--ease-in-out` is deliberately asymmetric (0.77 / 0.175), so it is
        // NOT the identity at the midpoint: it is slow in *and* slow out, which
        // is what "moves that read as deliberate" means. Assert the shape, not
        // a midpoint value it was never going to have.
        assert!(EASE_IN_OUT_TOKEN.eval(0.25) < 0.25);
        assert!(EASE_IN_OUT_TOKEN.eval(0.75) > 0.75);
        assert!(EASE_IN_OUT_TOKEN.eval(0.5) > 0.4 && EASE_IN_OUT_TOKEN.eval(0.5) < 0.6);
    }

    #[test]
    fn design_system_durations_match_globals_css() {
        assert_eq!(DURATION_INSTANT, Duration::from_millis(80));
        assert_eq!(DURATION_FAST, Duration::from_millis(150));
        assert_eq!(DURATION_NORMAL, Duration::from_millis(220));
        assert_eq!(DURATION_SLOW, Duration::from_millis(320));
        assert_eq!(DURATION_SLOWER, Duration::from_millis(500));

        // A closed, monotonic scale — the property the token layer asserts.
        assert!(DURATION_INSTANT < DURATION_FAST);
        assert!(DURATION_FAST < DURATION_NORMAL);
        assert!(DURATION_NORMAL < DURATION_SLOW);
        assert!(DURATION_SLOW < DURATION_SLOWER);
    }

    /// The named specs must actually carry the design-system step, otherwise a
    /// component naming `HOVER` would silently animate on a Zeron curve.
    #[test]
    fn named_specs_carry_the_design_system_steps() {
        assert_eq!(HOVER.duration_ms, 150);
        assert_eq!(HOVER.curve, EASE_OUT_TOKEN);
        assert_eq!(SLIDE.duration_ms, 220);
        assert_eq!(SLIDE.curve, EASE_OUT_TOKEN);
        assert_eq!(PRESS.duration_ms, 80);
        assert_eq!(POPUP_IN.duration_ms, 150);
        assert_eq!(OVERLAY.duration_ms, 320);
        assert_eq!(OVERLAY.curve, EASE_DRAWER_TOKEN);
    }

    #[test]
    fn transition_helpers_build_from_the_pinned_specs() {
        // Every helper is `spec_transition(<named spec>)`, so its duration and
        // curve are the spec's — the values the two tests above pin. Nothing
        // else may creep into a helper.
        assert_eq!(HOVER.duration_ms, DURATION_FAST.as_millis() as u64);
        assert_eq!(PRESS.duration_ms, DURATION_INSTANT.as_millis() as u64);
        assert_eq!(SLIDE.duration_ms, DURATION_NORMAL.as_millis() as u64);
        assert_eq!(POPUP_IN.curve, EASE_OUT_TOKEN);
        assert_eq!(SLIDE.curve, EASE_OUT_TOKEN);
        assert_eq!(PRESS.curve, EASE_OUT_TOKEN);

        // Constructing them is infallible and allocates the expected easing.
        let _ = hover_transition();
        let _ = press_transition();
        let _ = slide_transition();
        let _ = spec_transition(OVERLAY);
    }

    /// `motion_tokens()` is what re-times the 55 re-exported `gpui-component`
    /// components, so pin it against `gpui-component`'s defaults it replaces.
    #[test]
    fn motion_tokens_replace_the_gpui_default_scale() {
        let tokens = motion_tokens();
        let kit = MotionTokens::default();

        assert_eq!(tokens.duration_instant, DURATION_INSTANT);
        assert_eq!(tokens.duration_fast, DURATION_FAST);
        assert_eq!(tokens.duration_normal, DURATION_NORMAL);
        assert_eq!(tokens.duration_slow, DURATION_SLOW);

        // Every duration actually moved off the kit default.
        assert_ne!(tokens.duration_instant, kit.duration_instant);
        assert_ne!(tokens.duration_fast, kit.duration_fast);
        assert_ne!(tokens.duration_normal, kit.duration_normal);
        assert_ne!(tokens.duration_slow, kit.duration_slow);

        // Curves sample like their source tokens.
        for (slot, curve) in [
            (tokens.easing_enter.clone(), EASE_OUT_TOKEN),
            (tokens.easing_exit.clone(), EASE_DRAWER_TOKEN),
            (tokens.easing_move.clone(), EASE_OUT_TOKEN),
        ] {
            for x in [0.0, 0.25, 0.5, 0.75, 1.0] {
                assert!(
                    (slot.sample(x) - curve.eval(x)).abs() < 1e-4,
                    "easing sample at {x}"
                );
            }
        }
        // …and differ from the kit's own curves.
        assert!((tokens.easing_enter.sample(0.5) - kit.easing_enter.sample(0.5)).abs() > 1e-3);
        assert!((tokens.easing_move.sample(0.5) - kit.easing_move.sample(0.5)).abs() > 1e-3);

        // The move spring keeps the kit's settle tolerance (it is a pixel
        // spring — the tabs indicator travels in pixels).
        assert_eq!(tokens.spring_move.epsilon(), 0.1);
    }
}
