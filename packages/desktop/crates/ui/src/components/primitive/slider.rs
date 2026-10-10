//! Slider — the desktop counterpart of
//! `packages/ui/src/components/primitive/slider.tsx` (Base UI's slider).
//!
//! Written directly on `gpui`. The file used to re-export
//! `gpui_component::slider::Slider`, a styling layer over `gpui-base`'s slider
//! state machine; the machine now lives here, and the public surface the shim
//! exposed — [`Slider`], [`SliderState`], [`SliderValue`], [`SliderEvent`] and
//! [`SliderScale`] — is preserved unchanged. (The showcase constructs a
//! `SliderState` in an entity and mounts `Slider::new(&state)`.)
//!
//! # The state machine
//!
//! [`SliderState`] owns the value bookkeeping: min/max/step and the
//! [`SliderScale`] (linear or logarithmic), the [`SliderValue`] (single or
//! range) and its 0..1 `percentage` projection that places the fill and the
//! thumbs. It emits [`SliderEvent::Change`] continuously while the user
//! drags or clicks and [`SliderEvent::Release`] once on mouse up — subscribe
//! with `cx.subscribe` on the state entity, the same surface the shim
//! exposed. A programmatic [`SliderState::set_value`] notifies without
//! emitting, as upstream did.
//!
//! Pointer interaction is the raw-gpui drag protocol: mouse-down on the rail
//! jumps to the clicked position (for a range slider the nearer thumb moves),
//! and the native drag that starts from that press keeps updating the value
//! through `on_drag_move` until mouse-up. `DragThumb` / `DragTrack` ghosts
//! stand in for upstream's drag payloads, and a thumb grab stops propagation
//! on mouse-down so grabbing a thumb never jumps it to the click position.
//! Release is detected on the root both inside and outside the slider.
//!
//! Keyboard: the root tracks a [`FocusHandle`] (arrow keys step, Home/End
//! jump) — an addition over upstream, which only exposed the a11y
//! Increment/Decrement actions carried over here. Both drive the *end* value
//! (single sliders have only one) and emit `Change`; keyboard interaction
//! never emits `Release`, since nothing is being dragged.
//!
//! # Parity with the web primitive
//!
//! - a `muted` rail with a `primary` range fill (web: track `bg-muted`,
//!   indicator `bg-primary`), 4px inside a 16px hit row (web `h-1` track).
//! - a 12px thumb (web `size-3`) with a 1px `ring`-colored border and the
//!   theme's background fill. Web's literal `bg-white` becomes
//!   `cx.theme().background` so the thumb survives dark mode.
//! - the hover ring (web `hover:ring-2 ring-ring`) grows out of the thumb and
//!   holds while pressed, on [`motion::DURATION_FAST`] — dragging moves the
//!   thumb under the pointer, so hover alone would flicker.
//! - disabled renders the control at half opacity (web
//!   `data-disabled:opacity-50`) and registers no interaction at all.
//!
//! # Deviations
//!
//! - upstream's `Styled` override channels are preserved — a caller's
//!   `.bg()` recolors the range fill and `.text_color()` the thumb fill —
//!   but the root itself always paints `transparent` on `foreground`, exactly
//!   as upstream did: the overrides are *read*, never painted on the root.
//! - upstream's caller corner-radius overrides are not carried over: the rail
//!   is a pill and the thumb rounds off the theme radius (web `rounded-md` is
//!   `--radius - 2px`).
//! - a non-positive `step` no longer produces `NaN` on the value paths (see
//!   [`snap_to_step`]); upstream's `(value / step).round() * step` did.

use std::ops::Range;
use std::time::Duration;

use gpui::{
    AccessibleAction, AnimationExt as _, App, AppContext as _, Axis, Bounds, Context,
    DefiniteLength, DragMoveEvent, ElementId, Empty, Entity, EntityId, EventEmitter, Hsla,
    InteractiveElement as _, IntoElement, KeyDownEvent, MouseButton, MouseDownEvent, Orientation,
    ParentElement as _, Pixels, Refineable as _, Render, RenderOnce, Role, Size, SpringAnimation,
    SpringConfig, StatefulInteractiveElement as _, Styled, Window, canvas, div,
    prelude::FluentBuilder as _, px, relative,
};

use crate::components::traits::Disableable;
use crate::motion;
use crate::theme::ActiveTheme as _;

/// The rail's thickness — web `h-1` (4px).
const TRACK_SIZE: Pixels = px(4.);
/// The hit row the rail rides in — the generous click target around it.
const TRACK_HIT_SIZE: Pixels = px(16.);
/// The thumb's side — web `size-3` (12px).
const THUMB_SIZE: Pixels = px(12.);
/// The hover ring's full width — web `ring-2` (2px).
const RING_WIDTH: Pixels = px(2.);
/// The resting length of a vertical slider (web `min-h-40` is 10rem; a fixed
/// height stands in for it, overridable through the `Styled` impl).
const VERTICAL_LENGTH: Pixels = px(160.);

/// Snaps `value` onto the step grid (`0, step, 2·step, …`) — the pointer
/// mapping and the keyboard nudge share it, so a value can never drift off
/// the grid a caller configured. A non-positive `step` passes the value
/// through unchanged; upstream's `(value / step).round() * step` produced
/// `NaN` for a zero step.
fn snap_to_step(value: f32, step: f32) -> f32 {
    if step > 0.0 {
        (value / step).round() * step
    } else {
        value
    }
}

/// Whether `axis` is horizontal — raw gpui's `Axis` carries no orientation
/// predicates (that was `gpui_base::AxisExt`).
fn is_horizontal(axis: Axis) -> bool {
    matches!(axis, Axis::Horizontal)
}

/// The extent of `size` along `axis` — the piece of `gpui_base::AxisExt` the
/// pointer mapping needs.
fn axis_size(size: Size<Pixels>, axis: Axis) -> Pixels {
    if is_horizontal(axis) {
        size.width
    } else {
        size.height
    }
}

/// The physical policy behind the thumb ring: the crate's pixel spring at
/// critical damping over one design-system response, as the switch's thumb
/// travels on.
fn spring_config(response: Duration) -> SpringConfig {
    let frequency = std::f32::consts::TAU / response.as_secs_f32();
    SpringConfig::new(frequency * frequency, 2.0 * frequency, 1.0)
}

/// Events emitted by the [`SliderState`].
pub enum SliderEvent {
    /// Emitted continuously while the slider value is being changed by the user.
    Change(SliderValue),
    /// Emitted once when the user releases the slider after a drag or click.
    Release(SliderValue),
}

/// The value of the slider, can be a single value or a range of values.
///
/// - Can from a f32 value, which will be treated as a single value.
/// - Or from a (f32, f32) tuple, which will be treated as a range of values.
///
/// The default value is `SliderValue::Single(0.0)`.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum SliderValue {
    Single(f32),
    Range(f32, f32),
}

impl std::fmt::Display for SliderValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SliderValue::Single(value) => write!(f, "{}", value),
            SliderValue::Range(start, end) => write!(f, "{}..{}", start, end),
        }
    }
}

impl From<f32> for SliderValue {
    fn from(value: f32) -> Self {
        SliderValue::Single(value)
    }
}

impl From<(f32, f32)> for SliderValue {
    fn from(value: (f32, f32)) -> Self {
        SliderValue::Range(value.0, value.1)
    }
}

impl From<Range<f32>> for SliderValue {
    fn from(value: Range<f32>) -> Self {
        SliderValue::Range(value.start, value.end)
    }
}

impl Default for SliderValue {
    fn default() -> Self {
        SliderValue::Single(0.)
    }
}

impl SliderValue {
    /// Clamp the value to the given range.
    pub fn clamp(self, min: f32, max: f32) -> Self {
        match self {
            SliderValue::Single(value) => SliderValue::Single(value.clamp(min, max)),
            SliderValue::Range(start, end) => {
                SliderValue::Range(start.clamp(min, max), end.clamp(min, max))
            }
        }
    }

    /// Check if the value is a single value.
    #[inline]
    pub fn is_single(&self) -> bool {
        matches!(self, SliderValue::Single(_))
    }

    /// Check if the value is a range of values.
    #[inline]
    pub fn is_range(&self) -> bool {
        matches!(self, SliderValue::Range(_, _))
    }

    /// Get the start value.
    pub fn start(&self) -> f32 {
        match self {
            SliderValue::Single(value) => *value,
            SliderValue::Range(start, _) => *start,
        }
    }

    /// Get the end value.
    pub fn end(&self) -> f32 {
        match self {
            SliderValue::Single(value) => *value,
            SliderValue::Range(_, end) => *end,
        }
    }

    fn set_start(&mut self, value: f32) {
        if let SliderValue::Range(_, end) = self {
            *self = SliderValue::Range(value.min(*end), *end);
        } else {
            *self = SliderValue::Single(value);
        }
    }

    fn set_end(&mut self, value: f32) {
        if let SliderValue::Range(start, _) = self {
            *self = SliderValue::Range(*start, value.max(*start));
        } else {
            *self = SliderValue::Single(value);
        }
    }
}

/// The scale mode of the slider.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SliderScale {
    /// Linear scale where values change uniformly across the slider range.
    /// This is the default mode.
    #[default]
    Linear,
    /// Logarithmic scale where the distance between values increases
    /// exponentially. Useful for parameters with a large range where smaller
    /// changes matter more at the low end (volume, frequency, zoom). Requires
    /// `min > 0` and `max > min`.
    Logarithmic,
}

impl SliderScale {
    #[inline]
    pub fn is_linear(&self) -> bool {
        matches!(self, SliderScale::Linear)
    }

    #[inline]
    pub fn is_logarithmic(&self) -> bool {
        matches!(self, SliderScale::Logarithmic)
    }
}

/// State of the [`Slider`].
///
/// Hold it in an entity (`cx.new(|_| SliderState::new())`) and pass it to
/// [`Slider::new`]; value changes arrive as [`SliderEvent`]s through
/// `cx.subscribe`.
pub struct SliderState {
    min: f32,
    max: f32,
    step: f32,
    value: SliderValue,
    /// The 0..1 thumb positions the render path places the fill and thumbs
    /// by. In single-value mode only `end` is used; `start` stays 0.
    percentage: Range<f32>,
    /// The bounds of the rail after rendering, recorded at prepaint by the
    /// render path and used to map pointer positions onto values.
    bounds: Bounds<Pixels>,
    scale: SliderScale,
    /// Tracks whether the user is currently interacting with the slider so we
    /// only emit [`SliderEvent::Release`] after a real press/drag.
    dragging: bool,
}

impl SliderState {
    /// Create a new [`SliderState`].
    pub fn new() -> Self {
        Self {
            min: 0.0,
            max: 100.0,
            step: 1.0,
            value: SliderValue::default(),
            percentage: (0.0..0.0),
            bounds: Bounds::default(),
            scale: SliderScale::default(),
            dragging: false,
        }
    }

    /// Set the minimum value of the slider, default: 0.0
    pub fn min(mut self, min: f32) -> Self {
        if self.scale.is_logarithmic() {
            assert!(
                min > 0.0,
                "`min` must be greater than 0 for SliderScale::Logarithmic"
            );
            assert!(
                min < self.max,
                "`min` must be less than `max` for Logarithmic scale"
            );
        }
        self.min = min;
        self.update_thumb_pos();
        self
    }

    /// Set the maximum value of the slider, default: 100.0
    pub fn max(mut self, max: f32) -> Self {
        if self.scale.is_logarithmic() {
            assert!(
                max > self.min,
                "`max` must be greater than `min` for Logarithmic scale"
            );
        }
        self.max = max;
        self.update_thumb_pos();
        self
    }

    /// Set the step value of the slider, default: 1.0
    pub fn step(mut self, step: f32) -> Self {
        self.step = step;
        self
    }

    /// Set the scale of the slider, default: [`SliderScale::Linear`].
    pub fn scale(mut self, scale: SliderScale) -> Self {
        if scale.is_logarithmic() {
            assert!(
                self.min > 0.0,
                "`min` must be greater than 0 for Logarithmic scale"
            );
            assert!(
                self.max > self.min,
                "`max` must be greater than `min` for Logarithmic scale"
            );
        }
        self.scale = scale;
        self.update_thumb_pos();
        self
    }

    /// Set the default value of the slider, default: 0.0
    pub fn default_value(mut self, value: impl Into<SliderValue>) -> Self {
        self.value = value.into();
        self.update_thumb_pos();
        self
    }

    /// Set the value of the slider.
    ///
    /// Programmatic writes notify for a repaint but do not emit
    /// [`SliderEvent`]s — only user interaction does.
    pub fn set_value(
        &mut self,
        value: impl Into<SliderValue>,
        _: &mut Window,
        cx: &mut Context<Self>,
    ) {
        self.value = value.into();
        self.update_thumb_pos();
        cx.notify();
    }

    /// Get the value of the slider.
    pub fn value(&self) -> SliderValue {
        self.value
    }

    /// Get the minimum value.
    pub fn min_value(&self) -> f32 {
        self.min
    }

    /// Get the maximum value.
    pub fn max_value(&self) -> f32 {
        self.max
    }

    /// Get the step value.
    pub fn step_value(&self) -> f32 {
        self.step
    }

    /// Converts a value between 0.0 and 1.0 to a value between the minimum and
    /// maximum value, depending on the chosen scale.
    fn percentage_to_value(&self, percentage: f32) -> f32 {
        match self.scale {
            SliderScale::Linear => self.min + (self.max - self.min) * percentage,
            SliderScale::Logarithmic => {
                // when percentage is 0, this simplifies to (max/min)^0 * min = 1 * min = min
                // when percentage is 1, this simplifies to (max/min)^1 * min = (max*min)/min = max
                // we clamp just to make sure we don't have issue with floating point precision
                let base = self.max / self.min;
                (base.powf(percentage) * self.min).clamp(self.min, self.max)
            }
        }
    }

    /// Converts a value between the minimum and maximum value to a value
    /// between 0.0 and 1.0, depending on the chosen scale.
    fn value_to_percentage(&self, value: f32) -> f32 {
        match self.scale {
            SliderScale::Linear => {
                let range = self.max - self.min;
                if range <= 0.0 {
                    0.0
                } else {
                    (value - self.min) / range
                }
            }
            SliderScale::Logarithmic => {
                let base = self.max / self.min;
                (value / self.min).log(base).clamp(0.0, 1.0)
            }
        }
    }

    fn update_thumb_pos(&mut self) {
        match self.value {
            SliderValue::Single(value) => {
                let percentage = self.value_to_percentage(value.clamp(self.min, self.max));
                self.percentage = 0.0..percentage;
            }
            SliderValue::Range(start, end) => {
                let clamped_start = start.clamp(self.min, self.max);
                let clamped_end = end.clamp(self.min, self.max);
                self.percentage =
                    self.value_to_percentage(clamped_start)..self.value_to_percentage(clamped_end);
            }
        }
    }

    /// Update value by mouse position
    #[doc(hidden)]
    pub fn update_value_by_position(
        &mut self,
        axis: Axis,
        position: gpui::Point<Pixels>,
        is_start: bool,
        _: &mut Window,
        cx: &mut Context<Self>,
    ) {
        self.dragging = true;
        let bounds = self.bounds;
        let horizontal = is_horizontal(axis);

        let inner_pos = if horizontal {
            position.x - bounds.left()
        } else {
            bounds.bottom() - position.y
        };
        let total_size = axis_size(bounds.size, axis);
        let percentage = inner_pos.clamp(px(0.), total_size) / total_size;

        let percentage = if is_start {
            percentage.clamp(0.0, self.percentage.end)
        } else {
            percentage.clamp(self.percentage.start, 1.0)
        };

        let value = self.percentage_to_value(percentage);
        let value = snap_to_step(value, self.step);

        if is_start {
            self.percentage.start = percentage;
            self.value.set_start(value);
        } else {
            self.percentage.end = percentage;
            self.value.set_end(value);
        }
        cx.emit(SliderEvent::Change(self.value));
        cx.notify();
    }

    /// Emit [`SliderEvent::Release`] if the user was actively interacting
    /// with the slider. Called on mouse-up both inside and outside the slider.
    #[doc(hidden)]
    pub fn handle_release(&mut self, cx: &mut Context<Self>) {
        if !self.dragging {
            return;
        }
        self.dragging = false;
        cx.emit(SliderEvent::Release(self.value));
    }

    /// Steps the slider's *end* value by one [`Self::step_value`] — the
    /// arrow keys and the a11y increment/decrement actions — snapping onto
    /// the step grid first so a pointer-set value cannot drift off it, and
    /// emits [`SliderEvent::Change`].
    fn nudge(&mut self, up: bool, window: &mut Window, cx: &mut Context<Self>) {
        let base = snap_to_step(self.value.end(), self.step);
        let target = if up {
            base + self.step
        } else {
            base - self.step
        };
        self.set_value(target.clamp(self.min, self.max), window, cx);
        cx.emit(SliderEvent::Change(self.value));
    }

    /// Jumps the slider's *end* value to `max` (or `min`) — the Home/End keys
    /// — and emits [`SliderEvent::Change`].
    fn jump_to(&mut self, to_max: bool, window: &mut Window, cx: &mut Context<Self>) {
        let target = if to_max { self.max } else { self.min };
        self.set_value(target, window, cx);
        cx.emit(SliderEvent::Change(self.value));
    }
}

impl EventEmitter<SliderEvent> for SliderState {}

impl SliderState {
    /// The 0..1 thumb positions the render path places the fill and thumbs by.
    #[doc(hidden)]
    pub fn percentage(&self) -> Range<f32> {
        self.percentage.clone()
    }

    /// The rail bounds recorded at prepaint, used to map pointer positions.
    #[doc(hidden)]
    pub fn bounds(&self) -> Bounds<Pixels> {
        self.bounds
    }

    /// Records the rail bounds at prepaint.
    #[doc(hidden)]
    pub fn set_bounds(&mut self, bounds: Bounds<Pixels>) {
        self.bounds = bounds;
    }
}

/// The active drag payload while a thumb is being dragged. The `(entity, is
/// start)` tag lets an `on_drag_move` listener tell its own slider's drags
/// apart from any other `DragThumb` in flight.
#[derive(Clone)]
struct DragThumb((EntityId, bool));

impl Render for DragThumb {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        Empty
    }
}

/// The active drag payload for a press-drag on the track of a single-value
/// slider (a range track jumps on click, but only its thumbs drag).
#[derive(Clone)]
struct DragTrack(EntityId);

impl Render for DragTrack {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        Empty
    }
}

/// Pointer state of one thumb, written by its own listeners and read on the
/// next frame to size the hover ring.
#[derive(Default)]
struct ThumbInteraction {
    hovered: bool,
    pressed: bool,
}

impl ThumbInteraction {
    /// The ring shows while the pointer is over the thumb, and stays while
    /// the thumb is dragged: dragging moves the thumb under the pointer, so
    /// hover alone drops out for a frame on every move and the ring would
    /// flicker.
    fn is_active(&self) -> bool {
        self.hovered || self.pressed
    }
}

/// Flips one thumb's pressed flag — the capture/up listeners all funnel here.
fn set_thumb_press(interaction: &Entity<ThumbInteraction>, pressed: bool, cx: &mut App) {
    interaction.update(cx, |interaction, cx| {
        if interaction.pressed != pressed {
            interaction.pressed = pressed;
            cx.notify();
        }
    });
}

/// The animated hover ring of one thumb — the web `hover:ring-2 ring-ring`.
///
/// The pointer state rides a keyed window state (so it survives every render
/// of this stateless element) and the ring's growth rides a keyed spring on
/// [`motion::DURATION_FAST`], reversing from wherever it is when the pointer
/// re-enters mid-fade.
struct ThumbRing {
    interaction: Entity<ThumbInteraction>,
    color: Hsla,
    /// The ring's corner radius at full extension: the thumb's own radius
    /// grown by the ring width, so the two nest.
    radius: Pixels,
    /// Whether the ring should be out, sampled when the ring was built.
    active: bool,
}

impl ThumbRing {
    /// Samples the ring for the `start` or end thumb of the slider keyed by
    /// `id`.
    fn new(
        id: EntityId,
        start: bool,
        color: Hsla,
        radius: Pixels,
        window: &mut Window,
        cx: &mut App,
    ) -> Self {
        let interaction = if start {
            window.use_keyed_state(("slider-ring-start", id), cx, |_, _| {
                ThumbInteraction::default()
            })
        } else {
            window.use_keyed_state(("slider-ring-end", id), cx, |_, _| {
                ThumbInteraction::default()
            })
        };
        let active = interaction.read(cx).is_active();

        Self {
            interaction,
            color,
            radius,
            active,
        }
    }
}

/// A Slider element.
#[derive(IntoElement)]
pub struct Slider {
    state: Entity<SliderState>,
    axis: Axis,
    style: gpui::StyleRefinement,
    disabled: bool,
    reverse: bool,
}

impl Slider {
    /// Create a new [`Slider`] element bind to the [`SliderState`].
    pub fn new(state: &Entity<SliderState>) -> Self {
        Self {
            axis: Axis::Horizontal,
            state: state.clone(),
            style: gpui::StyleRefinement::default(),
            disabled: false,
            reverse: false,
        }
    }

    /// As a horizontal slider.
    pub fn horizontal(mut self) -> Self {
        self.axis = Axis::Horizontal;
        self
    }

    /// As a vertical slider.
    pub fn vertical(mut self) -> Self {
        self.axis = Axis::Vertical;
        self
    }

    /// Set the disabled state of the slider, default: false
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Reverse the filled (highlighted) side of the track, default: false.
    ///
    /// By default the track is filled from the min end to the thumb. With
    /// `reverse`, the fill goes from the thumb to the max end instead — useful
    /// when the slider represents a remaining amount (e.g. time left).
    ///
    /// This only changes the visual fill; values, events and interactions are
    /// unaffected. It applies to single-value sliders and is ignored for
    /// range sliders.
    pub fn reverse(mut self) -> Self {
        self.reverse = true;
        self
    }
}

impl Styled for Slider {
    fn style(&mut self) -> &mut gpui::StyleRefinement {
        &mut self.style
    }
}

/// The crate's `Disableable`, over the same field the inherent
/// [`Slider::disabled`] builder drives.
impl Disableable for Slider {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl RenderOnce for Slider {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let axis = self.axis;
        let horizontal = is_horizontal(axis);
        let entity_id = self.state.entity_id();

        // Copy the state out — the reads below are immutable while the keyed
        // state and the theme need `&mut App`.
        let (value, percentage, min, max, step) = {
            let state = self.state.read(cx);
            (
                state.value(),
                state.percentage(),
                state.min_value(),
                state.max_value(),
                state.step_value(),
            )
        };
        let is_range = value.is_range();

        // The web recipe: `bg-muted` rail, `bg-primary` fill, thumb filled
        // with the background and bordered in the ring color. Upstream's
        // override channels are preserved: a caller's `.bg()` recolors the
        // fill and `.text_color()` the thumb fill; both are read, never
        // painted on the root.
        let bar_color = self
            .style
            .background
            .clone()
            .and_then(|bg| bg.color())
            .and_then(|bg| bg.as_solid())
            .unwrap_or(cx.theme().primary);
        let track_color = cx.theme().muted;
        let thumb_bg = self.style.text.color.unwrap_or(cx.theme().background);
        let ring_color = cx.theme().ring;
        // Web `rounded-md` is `calc(var(--radius) - 2px)`, clamped at 0.
        let thumb_radius = (cx.theme().radius - px(2.)).max(px(0.));
        let ring_radius = thumb_radius + RING_WIDTH;

        let focus_handle = window
            .use_keyed_state(("slider-focus", entity_id), cx, |_, cx| cx.focus_handle())
            .read(cx)
            .clone();

        let end_ring = ThumbRing::new(entity_id, false, ring_color, ring_radius, window, cx);
        let start_ring =
            is_range.then(|| ThumbRing::new(entity_id, true, ring_color, ring_radius, window, cx));

        // The (fill_start, fill_end) insets of the range fill. `reverse`
        // flips a single-value fill to run from the thumb to the max end —
        // the "remaining amount" read (web has no counterpart; upstream did).
        let (fill_start, fill_end) = if self.reverse && !is_range {
            (relative(percentage.end), relative(0.))
        } else {
            (relative(percentage.start), relative(1. - percentage.end))
        };

        let build_thumb = {
            let state = self.state.clone();
            let axis = axis;
            let disabled = self.disabled;
            let entity_id = entity_id;
            let thumb_bg = thumb_bg;
            let thumb_radius = thumb_radius;
            let border_color = ring_color;
            let ring_color = ring_color;
            move |position: DefiniteLength,
                  start: bool,
                  ring: ThumbRing|
                  -> gpui::Stateful<gpui::Div> {
                let thumb_key: ElementId = if start {
                    ("slider-thumb-start", entity_id).into()
                } else {
                    ("slider-thumb-end", entity_id).into()
                };
                let ring_spring_key: ElementId = if start {
                    ("slider-ring-start-spring", entity_id).into()
                } else {
                    ("slider-ring-end-spring", entity_id).into()
                };

                // The ring grows out of the thumb's edge: inset by its own
                // width so its inner edge sits flush against the thumb.
                let ring_border = div().absolute().with_spring(
                    ring_spring_key,
                    SpringAnimation::new(spring_config(motion::DURATION_FAST))
                        .to(if ring.active { 1.0 } else { 0.0 })
                        .with_epsilon(0.01),
                    move |ring, t: f32| {
                        let width = RING_WIDTH * t;
                        ring.top(-width)
                            .left(-width)
                            .right(-width)
                            .bottom(-width)
                            .rounded(ring_radius + width)
                            .border(width)
                            .border_color(ring_color)
                    },
                );

                let mut thumb = div()
                    .id(thumb_key)
                    .absolute()
                    .flex_none()
                    .flex()
                    .items_center()
                    .justify_center()
                    .size(THUMB_SIZE)
                    .rounded(thumb_radius)
                    .bg(thumb_bg)
                    .border_1()
                    .border_color(border_color)
                    .child(ring_border);

                // A 12px thumb on a 4px rail: pull it in by half the
                // difference so it centers on the rail, and back by half the
                // thumb so the offset aims the thumb's *center* at the value.
                if horizontal {
                    thumb = thumb
                        .top(-(THUMB_SIZE - TRACK_SIZE) / 2.)
                        .left(position)
                        .ml(-(THUMB_SIZE / 2.));
                } else {
                    thumb = thumb
                        .bottom(position)
                        .left(-(THUMB_SIZE - TRACK_SIZE) / 2.)
                        .mb(-(THUMB_SIZE / 2.));
                }

                if !disabled {
                    thumb = thumb
                        .on_hover({
                            let interaction = ring.interaction.clone();
                            move |entered, _, cx| {
                                let entered = *entered;
                                interaction.update(cx, |interaction, cx| {
                                    if interaction.hovered != entered {
                                        interaction.hovered = entered;
                                        cx.notify();
                                    }
                                });
                            }
                        })
                        // The thumb stops propagation on mouse down to own the
                        // drag, so the press is read in the capture phase.
                        .capture_any_mouse_down({
                            let interaction = ring.interaction.clone();
                            move |_, _, cx| set_thumb_press(&interaction, true, cx)
                        })
                        .capture_any_mouse_up({
                            let interaction = ring.interaction.clone();
                            move |_, _, cx| set_thumb_press(&interaction, false, cx)
                        })
                        .on_mouse_up_out(MouseButton::Left, {
                            let interaction = ring.interaction.clone();
                            move |_, _, cx| set_thumb_press(&interaction, false, cx)
                        })
                        .on_mouse_down(MouseButton::Left, |_, _, cx| cx.stop_propagation())
                        .on_drag(DragThumb((entity_id, start)), |drag, _, _, cx| {
                            cx.stop_propagation();
                            cx.new(|_| drag.clone())
                        })
                        .on_drag_move({
                            let state = state.clone();
                            move |event: &DragMoveEvent<DragThumb>, window, cx| {
                                let DragThumb((drag_slider, drag_start)) = event.drag(cx);
                                // Copy the tag out — `event.drag` borrows `cx`
                                // for the match, and the update below needs it
                                // mutably.
                                let is_start = *drag_start;
                                if *drag_slider == entity_id && is_start == start {
                                    state.update(cx, |state, cx| {
                                        state.update_value_by_position(
                                            axis,
                                            event.event.position,
                                            is_start,
                                            window,
                                            cx,
                                        )
                                    });
                                }
                            }
                        });
                }

                thumb
            }
        };

        // The rail: muted pill with the primary range fill. The canvas paints
        // nothing; its prepaint hands the rail's window bounds to the pointer
        // mapping. Deliberately no notify — a bounds write that re-rendered
        // would re-enter layout every frame for as long as the slider is
        // mounted.
        let state_for_bounds = self.state.clone();
        let fill = div()
            .absolute()
            .when(horizontal, |this| {
                this.h_full().left(fill_start).right(fill_end)
            })
            .when(!horizontal, |this| {
                this.w_full().bottom(fill_start).top(fill_end)
            })
            .bg(bar_color)
            .rounded(TRACK_SIZE / 2.);
        let indicator = div()
            .relative()
            .when(horizontal, |this| this.w_full().h(TRACK_SIZE))
            .when(!horizontal, |this| this.h_full().w(TRACK_SIZE))
            .bg(track_color)
            .rounded(TRACK_SIZE / 2.)
            .child(
                canvas(
                    move |bounds, _, cx| {
                        state_for_bounds.update(cx, |state, _| state.set_bounds(bounds))
                    },
                    |_, _, _, _| {},
                )
                .absolute()
                .inset_0(),
            )
            .child(fill)
            .when_some(start_ring, |this, ring| {
                this.child(build_thumb(relative(percentage.start), true, ring))
            })
            .child(build_thumb(relative(percentage.end), false, end_ring));

        // The hit row around the rail: clicking jumps to the position, and on
        // a single-value slider the press continues as a drag.
        let state_for_down = self.state.clone();
        let state_for_drag = self.state.clone();
        let mut track = div()
            .id(("slider-track", entity_id))
            .flex()
            .flex_shrink_0()
            .when(horizontal, |this| {
                this.items_center().h(TRACK_HIT_SIZE).w_full()
            })
            .when(!horizontal, |this| {
                this.justify_center().w(TRACK_HIT_SIZE).h_full()
            })
            .child(indicator);

        if !self.disabled {
            track = track
                .on_mouse_down(MouseButton::Left, {
                    let percentage = percentage;
                    move |event: &MouseDownEvent, window, cx| {
                        state_for_down.update(cx, |state, cx| {
                            // A range jump moves the thumb the click is
                            // nearest to: compare against the midpoint
                            // between the two thumbs.
                            let is_start = if is_range {
                                let size = axis_size(state.bounds.size, axis);
                                let position = if horizontal {
                                    event.position.x - state.bounds.left()
                                } else {
                                    state.bounds.bottom() - event.position.y
                                };
                                let center = ((percentage.end - percentage.start) / 2.
                                    + percentage.start)
                                    * size;
                                position < center
                            } else {
                                false
                            };
                            state.update_value_by_position(
                                axis,
                                event.position,
                                is_start,
                                window,
                                cx,
                            );
                        });
                    }
                })
                .when(!is_range, |this| {
                    this.on_drag(DragTrack(entity_id), |drag, _, _, cx| {
                        cx.stop_propagation();
                        cx.new(|_| drag.clone())
                    })
                    .on_drag_move({
                        let state = state_for_drag.clone();
                        move |event: &DragMoveEvent<DragTrack>, window, cx| {
                            let DragTrack(drag_slider) = event.drag(cx);
                            if *drag_slider == entity_id {
                                state.update(cx, |state, cx| {
                                    state.update_value_by_position(
                                        axis,
                                        event.event.position,
                                        false,
                                        window,
                                        cx,
                                    )
                                });
                            }
                        }
                    })
                });
        }

        let mut root = div()
            .id(("slider", entity_id))
            .flex()
            .when(horizontal, |this| this.w_full())
            .when(!horizontal, |this| this.h(VERTICAL_LENGTH))
            .role(Role::Slider)
            .aria_numeric_value(f64::from(value.end()))
            .aria_min_numeric_value(f64::from(min))
            .aria_max_numeric_value(f64::from(max))
            .aria_numeric_value_step(f64::from(step))
            .aria_orientation(if horizontal {
                Orientation::Horizontal
            } else {
                Orientation::Vertical
            })
            .when(!self.disabled, |this| {
                // `tab_index(0)` + `tab_stop(true)` make the slider a tab
                // stop, so `focus_next` and Tab both reach it; a focused
                // element also auto-focuses on mouse-down (raw gpui's
                // `track_focus` behavior), which is what hands the slider the
                // keyboard after a click.
                this.track_focus(&focus_handle.tab_index(0).tab_stop(true))
            })
            .child(track);

        if self.disabled {
            // Web `data-disabled:opacity-50`. Every listener above is absent,
            // so a disabled slider is fully inert.
            root = root.opacity(0.5);
        } else {
            root = root
                .on_key_down({
                    let state = self.state.clone();
                    move |event: &KeyDownEvent, window, cx| {
                        // Base UI convention: left and down decrement, right
                        // and up increment, regardless of orientation.
                        match event.keystroke.key.as_ref() {
                            "left" | "down" => {
                                state.update(cx, |state, cx| state.nudge(false, window, cx))
                            }
                            "right" | "up" => {
                                state.update(cx, |state, cx| state.nudge(true, window, cx))
                            }
                            "home" => {
                                state.update(cx, |state, cx| state.jump_to(false, window, cx))
                            }
                            "end" => state.update(cx, |state, cx| state.jump_to(true, window, cx)),
                            _ => {}
                        }
                    }
                })
                .on_a11y_action(AccessibleAction::Increment, {
                    let state = self.state.clone();
                    move |_, window, cx| state.update(cx, |state, cx| state.nudge(true, window, cx))
                })
                .on_a11y_action(AccessibleAction::Decrement, {
                    let state = self.state.clone();
                    move |_, window, cx| {
                        state.update(cx, |state, cx| state.nudge(false, window, cx))
                    }
                })
                // The release is owned by the root so it fires whether the
                // mouse comes up over the slider or anywhere else.
                .on_mouse_up(MouseButton::Left, {
                    let state = self.state.clone();
                    move |_, _, cx| state.update(cx, |state, cx| state.handle_release(cx))
                })
                .on_mouse_up_out(MouseButton::Left, {
                    let state = self.state.clone();
                    move |_, _, cx| state.update(cx, |state, cx| state.handle_release(cx))
                });
        }

        root.style().refine(&self.style);
        // The root never paints the caller's `.bg()` / `.text_color()` — both
        // were read as the fill / thumb overrides above — as upstream did.
        let root = root
            .bg(cx.theme().transparent)
            .text_color(cx.theme().foreground);
        root
    }
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;
    use std::rc::Rc;

    use gpui::{Keystroke, Modifiers, TestAppContext, VisualTestContext, point};

    use super::*;

    // ---------------------------------------------------------------------
    // Pure logic — value algebra, scale mapping, step snapping
    // ---------------------------------------------------------------------

    #[test]
    fn slider_value_conversions_and_clamping_are_preserved() {
        assert_eq!(SliderValue::from(5.), SliderValue::Single(5.));
        assert_eq!(SliderValue::from((2., 8.)), SliderValue::Range(2., 8.));
        assert_eq!(SliderValue::from(2.0..8.0), SliderValue::Range(2., 8.));
        assert_eq!(SliderValue::default(), SliderValue::Single(0.));
        assert!(SliderValue::Single(3.).is_single());
        assert!(!SliderValue::Single(3.).is_range());
        assert!(SliderValue::Range(1., 2.).is_range());
        assert_eq!(SliderValue::Range(1., 2.).start(), 1.);
        assert_eq!(SliderValue::Range(1., 2.).end(), 2.);
        assert_eq!(
            SliderValue::Range(-1., 12.).clamp(0., 10.),
            SliderValue::Range(0., 10.)
        );
        assert_eq!(SliderValue::Single(7.).to_string(), "7");
        assert_eq!(SliderValue::Range(1., 2.).to_string(), "1..2");
    }

    #[test]
    fn linear_state_keeps_percentage_and_range_ordering() {
        let state = SliderState::new()
            .min(0.)
            .max(200.)
            .default_value((50., 150.));
        assert_eq!(state.value(), SliderValue::Range(50., 150.));
        assert_eq!(state.percentage(), 0.25..0.75);
        assert_eq!(
            (state.min_value(), state.max_value(), state.step_value()),
            (0., 200., 1.)
        );
    }

    #[test]
    fn logarithmic_state_keeps_mapping() {
        let state = SliderState::new()
            .min(1.)
            .max(1000.)
            .scale(SliderScale::Logarithmic)
            .default_value(10.);
        let percentage = state.percentage().end;
        assert!((percentage - (1. / 3.)).abs() < 0.0001);
    }

    #[test]
    #[should_panic(expected = "`min` must be greater than 0")]
    fn logarithmic_scale_rejects_a_non_positive_min() {
        let _ = SliderState::new().scale(SliderScale::Logarithmic);
    }

    #[test]
    fn percentage_and_value_mapping_round_trips() {
        let state = SliderState::new().min(20.).max(80.);
        for value in [20., 35., 50., 80.] {
            let percentage = state.value_to_percentage(value);
            assert!(
                (state.percentage_to_value(percentage) - value).abs() < 1e-4,
                "{value}"
            );
        }
        // A degenerate range maps to 0 rather than dividing by zero.
        let flat = SliderState::new().min(5.).max(5.);
        assert_eq!(flat.value_to_percentage(5.), 0.0);
    }

    #[test]
    fn snap_to_step_rounds_onto_the_grid() {
        assert_eq!(snap_to_step(50.3, 1.), 50.);
        assert_eq!(snap_to_step(50.6, 1.), 51.);
        assert_eq!(snap_to_step(0.31, 0.25), 0.25);
        assert_eq!(snap_to_step(-0.3, 1.), 0.);
        // A non-positive step passes the value through instead of NaN-ing.
        assert_eq!(snap_to_step(5., 0.), 5.);
        assert_eq!(snap_to_step(5., -1.), 5.);
    }

    #[test]
    fn a_custom_step_snaps_pointer_values_onto_its_grid() {
        let state = SliderState::new()
            .min(0.)
            .max(1.)
            .step(0.25)
            .default_value(0.3);
        assert_eq!(state.value(), SliderValue::Single(0.3));
        // A pointer landing at 30% of a 0..1 range snaps to the nearest
        // quarter step, never to 0.3.
        let value = state.percentage_to_value(0.3);
        assert_eq!(snap_to_step(value, state.step_value()), 0.25);
    }

    #[test]
    fn spring_config_is_the_crate_response_at_critical_damping() {
        let (frequency, damping_ratio) = spring_config(motion::DURATION_FAST).canonical();
        assert!((frequency - std::f32::consts::TAU / 0.15).abs() < 1e-3);
        // ζ = 1: the ring grows out and back without overshooting.
        assert!((damping_ratio - 1.0).abs() < 1e-4);
    }

    // ---------------------------------------------------------------------
    // Mount tests
    // ---------------------------------------------------------------------

    struct Harness {
        state: Entity<SliderState>,
        disabled: bool,
    }

    impl Render for Harness {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .id("slider-harness")
                .tab_group()
                .w(px(100.))
                .h(px(24.))
                .child(Slider::new(&self.state).disabled(self.disabled))
        }
    }

    fn harness(
        cx: &mut TestAppContext,
        disabled: bool,
    ) -> (&mut VisualTestContext, Entity<SliderState>) {
        cx.update(crate::init);
        let state = cx.new(|_| SliderState::new());
        let result = state.clone();
        let (_, cx) = cx.add_window_view(move |_, _| Harness { state, disabled });
        // A first draw so the rail's bounds are recorded before any input.
        cx.update(|window, cx| window.draw(cx).clear(cx));
        (cx, result)
    }

    fn press_key(cx: &mut VisualTestContext, key: &str) {
        cx.simulate_event(KeyDownEvent {
            keystroke: Keystroke::parse(key).unwrap(),
            is_held: false,
            prefer_character_input: false,
        });
    }

    #[gpui::test]
    fn pointer_click_jumps_to_the_clicked_value(cx: &mut TestAppContext) {
        let (cx, state) = harness(cx, false);
        cx.simulate_click(point(px(50.), px(12.)), Modifiers::default());
        cx.update(|_, cx| assert_eq!(state.read(cx).value(), SliderValue::Single(50.)));
    }

    #[gpui::test]
    fn disabled_slider_is_inert(cx: &mut TestAppContext) {
        let (cx, state) = harness(cx, true);
        cx.simulate_click(point(px(50.), px(12.)), Modifiers::default());
        cx.update(|_, cx| assert_eq!(state.read(cx).value(), SliderValue::Single(0.)));
    }

    #[gpui::test]
    fn pointer_click_emits_change_then_release(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let state = cx.new(|_| SliderState::new());
        let observed: Rc<RefCell<Vec<(&'static str, SliderValue)>>> = Rc::default();
        let sink = observed.clone();
        let view_state = state.clone();
        let (_, mut cx) = cx.add_window_view(move |_, cx| {
            cx.subscribe(&view_state, move |_, _, event: &SliderEvent, _| {
                sink.borrow_mut().push(match event {
                    SliderEvent::Change(value) => ("change", *value),
                    SliderEvent::Release(value) => ("release", *value),
                });
            })
            .detach();
            Harness {
                state: view_state,
                disabled: false,
            }
        });
        cx.update(|window, cx| window.draw(cx).clear(cx));
        cx.simulate_click(point(px(50.), px(12.)), Modifiers::default());

        let observed = observed.borrow();
        assert_eq!(
            observed.as_slice(),
            [
                ("change", SliderValue::Single(50.)),
                ("release", SliderValue::Single(50.)),
            ]
        );
    }

    #[gpui::test]
    fn arrow_keys_step_when_focused(cx: &mut TestAppContext) {
        let (cx, state) = harness(cx, false);
        cx.update(|window, cx| window.focus_next(cx));
        cx.update(|window, cx| assert!(window.focused(cx).is_some(), "the slider took focus"));

        press_key(cx, "right");
        cx.update(|_, cx| assert_eq!(state.read(cx).value(), SliderValue::Single(1.)));
        press_key(cx, "right");
        cx.update(|_, cx| assert_eq!(state.read(cx).value(), SliderValue::Single(2.)));
        press_key(cx, "left");
        cx.update(|_, cx| assert_eq!(state.read(cx).value(), SliderValue::Single(1.)));
        // Home/End clamp to the configured range.
        press_key(cx, "end");
        cx.update(|_, cx| assert_eq!(state.read(cx).value(), SliderValue::Single(100.)));
        press_key(cx, "home");
        cx.update(|_, cx| assert_eq!(state.read(cx).value(), SliderValue::Single(0.)));
    }

    #[gpui::test]
    fn disabled_slider_never_takes_focus(cx: &mut TestAppContext) {
        let (cx, _state) = harness(cx, true);
        cx.update(|window, cx| window.focus_next(cx));
        cx.update(|window, cx| assert!(window.focused(cx).is_none()));
    }

    struct TestView {
        plain: Entity<SliderState>,
        range: Entity<SliderState>,
        reversed: Entity<SliderState>,
        disabled: Entity<SliderState>,
        vertical: Entity<SliderState>,
    }

    impl Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .gap_3()
                .p_2()
                .w(px(320.))
                .child(Slider::new(&self.plain).horizontal())
                .child(Slider::new(&self.range))
                .child(Slider::new(&self.reversed).reverse())
                .child(Slider::new(&self.disabled).disabled(true))
                .child(Slider::new(&self.vertical).vertical())
        }
    }

    #[gpui::test]
    fn slider_renders_all_variants_without_panic(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, cx| TestView {
            plain: cx.new(|_| SliderState::new().default_value(35.)),
            range: cx.new(|_| SliderState::new().default_value((20., 80.))),
            reversed: cx.new(|_| SliderState::new().default_value(70.)),
            disabled: cx.new(|_| SliderState::new().default_value(50.)),
            vertical: cx.new(|_| SliderState::new().default_value(40.)),
        });
    }
}
