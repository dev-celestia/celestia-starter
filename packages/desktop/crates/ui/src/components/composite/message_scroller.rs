//! Message scroller — the virtualized transcript behind a chat surface, the
//! desktop counterpart of the web `ai/message-scroller.tsx`.
//!
//! Ported from `gpui-component` 0.6.6's `message_scroller.rs` onto raw gpui.
//! This module is the one part of the conversation stack that sits on
//! `gpui::ListState` — that state machine is *framework*, not widget layer, so
//! it keeps its upstream shape verbatim; what the rewrite replaces are the two
//! `gpui-base` overlays it used to borrow:
//!
//! - **Scrollbar.** [`ListScrollbar`] is a crate-owned vertical scrollbar for a
//!   `ListState`, built on the scrollbar plumbing gpui itself exposes
//!   (`max_offset_for_scrollbar`, `scroll_px_offset_for_scrollbar`,
//!   `set_offset_from_scrollbar`, `scrollbar_drag_started`/`_ended`). It is a
//!   deliberate subset of the upstream bar: always visible while the list
//!   overflows, no auto-hide visibility animation, no touch-drag, no
//!   per-instance mode — thumb rest/hover colors come from
//!   `cx.theme().border` / `muted_foreground`.
//! - **Wheel mask.** [`ListWheelMask`] keeps vertical wheel scrolling from
//!   leaking into an ancestor scroller. It is the vertical half of
//!   `gpui-base`'s `ScrollableMask`, including its capture-phase dispatch and
//!   edge chaining; the per-gesture axis lock rides gpui's own
//!   `OngoingScroll::filter` (the same logic gpui-base's `lock_axis` wraps),
//!   so `gpui-base`'s mask type is not needed.
//!
//! Other parity notes:
//!
//! - **Button.** The jump button is the crate's
//!   [`crate::components::primitive::button::Button`] (icon-only, Secondary).
//!   Upstream pill-restyled it (`rounded_full` + border/background overrides);
//!   the crate button owns its own recipe, so those overrides are gone —
//!   [`MessageScroller::with_jump_button_renderer`] is the supported
//!   customization path, exactly as upstream.
//! - **`with_jump_button_style`.** Upstream refined the style onto the button;
//!   the crate button is not free-styleable, so the refinement lands on the
//!   button's positioning row instead. Margin/alignment styles behave the
//!   same; surface styles (background, border) that targeted the button itself
//!   have no effect — restyle via the renderer callback.
//! - **Transitions.** Upstream faded the jump button and bottom edge on a
//!   fixed 200ms linear-default `Transition`. The port names the policy the
//!   way the design system does: [`crate::motion::slide_transition`] (the
//!   `duration-normal` entrance step) for both, with
//!   [`MessageScroller::with_jump_button_transition`] still overriding the
//!   duration literally.
//! - The row renderer, roles (`Role::Log`), spacing and geometry are upstream
//!   verbatim, as is the whole [`MessageScrollerState`] API.

use std::{cell::RefCell, ops::Range, rc::Rc, time::Duration};

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Bounds, ContentMask, Context, Corners, Element, ElementId, Entity, FollowMode,
    GlobalElementId, Hitbox, HitboxBehavior, Hsla, InspectorElementId, InteractiveElement as _,
    IntoElement, IsZero as _, LayoutId, ListAlignment, ListState, MouseButton, MouseDownEvent,
    MouseMoveEvent, MouseUpEvent, OngoingScroll, ParentElement as _, Pixels, Refineable as _,
    RenderOnce, Role, ScrollWheelEvent, SharedString, StatefulInteractiveElement as _, Style,
    StyleRefinement, Styled, Window, div, linear_color_stop, linear_gradient, list, point, px,
    relative, rems,
};
use gpui_base::motion::{Transition, transition};

use crate::components::primitive::button::{Button, ButtonVariant};
use crate::components::primitive::icon::PhosphorIcon;
use crate::motion;
use crate::theme::ActiveTheme as _;

/// How far past the viewport the virtual list keeps rendered rows, in px.
const LIST_OVERDRAW: Pixels = px(400.);

/// The design-system policy for the jump button's enter/leave and the bottom
/// fade — `duration-normal` with the signature curve. Upstream used a fixed
/// 200ms default; see the module docs.
const AFFORDANCE_TRANSITION: fn() -> Transition = motion::slide_transition;

/// Minimum scrollbar track hit area on the viewport's right edge.
const TRACK_WIDTH: Pixels = px(12.);
/// Painted thumb width.
const THUMB_WIDTH: Pixels = px(6.);
/// Gap between the thumb and the viewport's right edge.
const THUMB_MARGIN: Pixels = px(3.);
/// Smallest readable thumb length.
const MIN_THUMB_LENGTH: Pixels = px(24.);
/// Rounded ends of the thumb.
const THUMB_RADIUS: Pixels = px(3.);

/// The entity-owned scrolling state for a [`MessageScroller`].
///
/// The state owns only GPUI's virtual-list bookkeeping. Message data remains
/// with the caller and is read by the row renderer passed to
/// [`MessageScroller::new`].
pub struct MessageScrollerState {
    list_state: ListState,
}

impl MessageScrollerState {
    /// Create a state for `item_count` rows and enable tail following.
    ///
    /// The constructor receives the entity context so the list's scroll
    /// handler can safely defer its entity update until GPUI has released the
    /// list's internal borrow.
    pub fn new(item_count: usize, cx: &mut Context<Self>) -> Self {
        let list_state = ListState::new(item_count, ListAlignment::Top, LIST_OVERDRAW);
        list_state.set_follow_mode(FollowMode::Tail);

        let weak_state = cx.weak_entity();
        list_state.set_scroll_handler(move |_, _, cx| {
            let weak_state = weak_state.clone();

            cx.defer(move |cx| {
                let _ = weak_state.update(cx, |_, cx| cx.notify());
            });
        });

        Self { list_state }
    }

    /// The list state this state wraps — the handle the scroller, scrollbar and
    /// wheel mask all share.
    pub fn list_state(&self) -> &ListState {
        &self.list_state
    }

    /// Return the current number of rows known by the virtual list.
    pub fn item_count(&self) -> usize {
        self.list_state.item_count()
    }

    /// Return whether the user has scrolled away from the latest content.
    pub fn is_scrolled_up(&self) -> bool {
        self.list_state.max_offset_for_scrollbar().y > px(0.)
            && !self.list_state.is_following_tail()
            && !self.list_state.is_scrolled_to_end().unwrap_or(false)
    }

    /// Return whether the list is actively following its tail.
    pub fn is_following_tail(&self) -> bool {
        self.list_state.is_following_tail()
    }

    /// Reset the list to `item_count` rows.
    pub fn reset(&mut self, item_count: usize, cx: &mut Context<Self>) {
        self.list_state.reset(item_count);
        self.list_state.set_follow_mode(FollowMode::Tail);
        cx.notify();
    }

    /// Replace `old_range` with `count` new rows.
    ///
    /// Returns `false` when the range is outside the current list and leaves
    /// the state unchanged.
    pub fn splice(
        &mut self,
        old_range: Range<usize>,
        count: usize,
        cx: &mut Context<Self>,
    ) -> bool {
        if !self.valid_range(&old_range) {
            return false;
        }

        let neighbor = old_range.start.checked_sub(1);
        self.list_state.splice(old_range, count);

        // The default row wrapper pads every row except the last, so a row
        // whose "last" status may have flipped carries a stale measured
        // height. Remeasure the new last row and the survivor next to the
        // splice.
        if let Some(last) = self.list_state.item_count().checked_sub(1) {
            self.list_state.remeasure_items(last..last + 1);
            if let Some(neighbor) = neighbor.filter(|neighbor| *neighbor != last) {
                self.list_state.remeasure_items(neighbor..neighbor + 1);
            }
        }

        cx.notify();
        true
    }

    /// Append `count` rows to the end of the list.
    pub fn append(&mut self, count: usize, cx: &mut Context<Self>) -> bool {
        let item_count = self.list_state.item_count();
        self.splice(item_count..item_count, count, cx)
    }

    /// Prepend `count` rows while preserving the current scroll anchor.
    pub fn prepend(&mut self, count: usize, cx: &mut Context<Self>) -> bool {
        self.splice(0..0, count, cx)
    }

    /// Mark all rows for remeasurement while preserving a proportional anchor.
    pub fn remeasure(&mut self, cx: &mut Context<Self>) {
        self.list_state.remeasure();
        cx.notify();
    }

    /// Mark rows in `range` for remeasurement while preserving an item anchor.
    ///
    /// Returns `false` when the range is outside the current list.
    pub fn remeasure_items(&mut self, range: Range<usize>, cx: &mut Context<Self>) -> bool {
        if !self.valid_range(&range) {
            return false;
        }

        self.list_state.remeasure_items(range);
        cx.notify();
        true
    }

    /// Scroll to the row at `index`, if it exists.
    pub fn scroll_to_item(&mut self, index: usize, cx: &mut Context<Self>) -> bool {
        if index >= self.list_state.item_count() {
            return false;
        }

        self.list_state.scroll_to(gpui::ListOffset {
            item_ix: index,
            offset_in_item: px(0.),
        });
        cx.notify();
        true
    }

    /// Resume tail following and scroll to the latest row.
    pub fn scroll_to_end(&mut self, cx: &mut Context<Self>) {
        self.list_state.set_follow_mode(FollowMode::Tail);
        self.list_state.scroll_to_end();
        cx.notify();
    }

    fn valid_range(&self, range: &Range<usize>) -> bool {
        range.start <= range.end && range.end <= self.list_state.item_count()
    }
}

/// A virtualized message list with optional scrollbar and jump-to-latest UI.
#[derive(IntoElement)]
pub struct MessageScroller {
    id: ElementId,
    state: Entity<MessageScrollerState>,
    renderer: Box<dyn FnMut(usize, &mut Window, &mut App) -> AnyElement + 'static>,
    style: StyleRefinement,
    content_style: StyleRefinement,
    list_style: StyleRefinement,
    row_style: StyleRefinement,
    jump_button_style: StyleRefinement,
    jump_button_renderer: Option<Box<dyn FnOnce(Button) -> Button>>,
    jump_button_transition: Option<Duration>,
    bottom_fade: Option<Hsla>,
    scrollbar: bool,
    jump_button: bool,
    jump_button_label: SharedString,
}

impl MessageScroller {
    /// Create a message scroller with a renderer for each row.
    pub fn new<E>(
        id: impl Into<ElementId>,
        state: Entity<MessageScrollerState>,
        renderer: impl FnMut(usize, &mut Window, &mut App) -> E + 'static,
    ) -> Self
    where
        E: IntoElement,
    {
        let mut renderer = renderer;
        Self {
            id: id.into(),
            state,
            renderer: Box::new(move |index, window, cx| {
                renderer(index, window, cx).into_any_element()
            }),
            style: StyleRefinement::default(),
            content_style: StyleRefinement::default(),
            list_style: StyleRefinement::default(),
            row_style: StyleRefinement::default(),
            jump_button_style: StyleRefinement::default(),
            jump_button_renderer: None,
            jump_button_transition: None,
            bottom_fade: None,
            scrollbar: true,
            jump_button: true,
            jump_button_label: "Jump to latest".into(),
        }
    }

    /// Enable or disable the virtual-list scrollbar.
    pub fn scrollbar(mut self, scrollbar: bool) -> Self {
        self.scrollbar = scrollbar;
        self
    }

    /// Enable or disable the built-in jump-to-latest button.
    pub fn jump_button(mut self, jump_button: bool) -> Self {
        self.jump_button = jump_button;
        self
    }

    /// Set the label used by the built-in jump-to-latest button.
    pub fn with_jump_button_label(mut self, label: impl Into<SharedString>) -> Self {
        self.jump_button_label = label.into();
        self
    }

    /// Refine the viewport that contains the list and scrollbar.
    pub fn with_content_style(mut self, style: StyleRefinement) -> Self {
        self.content_style = style;
        self
    }

    /// Refine the GPUI list element used to render rows.
    pub fn with_list_style(mut self, style: StyleRefinement) -> Self {
        self.list_style = style;
        self
    }

    /// Refine the full-width wrapper around every rendered row.
    pub fn with_row_style(mut self, style: StyleRefinement) -> Self {
        self.row_style = style;
        self
    }

    /// Refine the built-in jump-to-latest button after its defaults.
    ///
    /// The refinement is applied to the button's positioning row — see the
    /// module docs for why it is not the button itself.
    pub fn with_jump_button_style(mut self, style: StyleRefinement) -> Self {
        self.jump_button_style = style;
        self
    }

    /// Customize the built-in jump button without replacing its scroll action.
    ///
    /// The callback receives the fully configured [`Button`], so its variant,
    /// semantic size, icon, tooltip, or instance styling may be adjusted.
    pub fn with_jump_button_renderer(
        mut self,
        renderer: impl FnOnce(Button) -> Button + 'static,
    ) -> Self {
        self.jump_button_renderer = Some(Box::new(renderer));
        self
    }

    /// Set how long the built-in jump button takes to enter or leave.
    ///
    /// A zero duration disables its transition. Reduced-motion preferences
    /// adopt the final state immediately.
    pub fn with_jump_button_transition(mut self, duration: Duration) -> Self {
        self.jump_button_transition = Some(duration);
        self
    }

    /// Fade the transcript's bottom edge into `color`.
    ///
    /// A partially visible row melts into the surface behind the scroller
    /// instead of clipping mid-line. The fade shows only while the reader is
    /// away from the live edge — at the bottom nothing is clipped. Pass the
    /// color of that surface; the fade is off by default and sits under the
    /// jump button.
    pub fn with_bottom_fade(mut self, color: impl Into<Hsla>) -> Self {
        self.bottom_fade = Some(color.into());
        self
    }
}

impl Styled for MessageScroller {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MessageScroller {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let root_id = self.id.clone();
        let (list_state, scrolled_up) = {
            let state = self.state.read(cx);
            (state.list_state.clone(), state.is_scrolled_up())
        };
        let show_jump_button = self.jump_button && scrolled_up;
        let jump_button_visibility = if self.jump_button {
            transition(
                (root_id.clone(), "jump-button-visibility"),
                if show_jump_button { 1. } else { 0. },
                match self.jump_button_transition {
                    Some(duration) => Transition::new(duration),
                    None => AFFORDANCE_TRANSITION(),
                },
                window,
                cx,
            )
        } else {
            0.
        };
        // At the live edge nothing is clipped below, so a visible fade would
        // suggest more content than there is.
        let bottom_fade_visibility = if self.bottom_fade.is_some() {
            transition(
                (root_id.clone(), "bottom-fade-visibility"),
                if scrolled_up { 1. } else { 0. },
                AFFORDANCE_TRANSITION(),
                window,
                cx,
            )
        } else {
            0.
        };
        let row_style = self.row_style;
        let jump_button_style = self.jump_button_style;
        let jump_button_renderer = self.jump_button_renderer;
        let mut renderer = self.renderer;

        // GPUI's `list` lays rows out at the full list width and offsets them
        // only by vertical padding, so the horizontal component of the list
        // style must be carried by every row wrapper instead.
        let mut list_style = self.list_style;
        let row_inset_left = list_style.padding.left.take();
        let row_inset_right = list_style.padding.right.take();

        // Read the count outside the row closure: the list holds a mutable
        // borrow of its state while rendering rows, so the closure must not
        // borrow it again. The count is stable within one render pass.
        let item_count = list_state.item_count();
        let list = list(list_state.clone(), move |index, window, cx| {
            let mut row = div()
                .w_full()
                .min_w_0()
                .px_3()
                // Spacing between rows only, like a CSS gap: the list's own
                // bottom padding owns the gap after the last row.
                .when(index + 1 < item_count, |this| this.pb_8())
                .when_some(row_inset_left, |this, left| this.pl(left))
                .when_some(row_inset_right, |this, right| this.pr(right));
            row.style().refine(&row_style);
            row.child(renderer(index, window, cx)).into_any_element()
        })
        .size_full()
        .min_h_0()
        .py_2();
        let list = {
            let mut list = list;
            list.style().refine(&list_style);
            list
        };

        let mut viewport = div()
            .id((root_id.clone(), "viewport"))
            // Announce appended rows as a log region, like shadcn's
            // `role="log"` transcript content.
            .role(Role::Log)
            .size_full()
            .min_h_0()
            .min_w_0()
            .child(list)
            // The fade sits above the rows but below the scrollbar and the
            // jump button, so neither control is washed out by it.
            .when_some(
                self.bottom_fade.filter(|_| bottom_fade_visibility > 0.),
                |this, color| {
                    this.child(
                        div()
                            .absolute()
                            .left_0()
                            .right_0()
                            .bottom_0()
                            .h(rems(3.))
                            .opacity(bottom_fade_visibility)
                            .bg(linear_gradient(
                                180.,
                                linear_color_stop(color.opacity(0.), 0.),
                                linear_color_stop(color, 1.),
                            )),
                    )
                },
            )
            .when(self.scrollbar, |this| {
                this.child(ListScrollbar::new(&list_state).id((root_id.clone(), "scrollbar")))
            });
        viewport.style().refine(&self.content_style);

        let mut root = div()
            .id(root_id.clone())
            .relative()
            .size_full()
            .min_h_0()
            .overflow_hidden()
            .child(viewport)
            // Keep vertical wheel scrolling from leaking into an ancestor
            // scroller (like in Table): the mask consumes vertical-dominant
            // wheel events while the list can move and chains to the ancestor
            // only at the edges.
            .child(ListWheelMask::new(&list_state).id(root_id.clone()));

        if self.jump_button && jump_button_visibility > 0. {
            let state = self.state.clone();

            let jump_button = Button::icon((root_id, "jump-to-latest"), PhosphorIcon::ArrowDown)
                .variant(ButtonVariant::Secondary)
                .tooltip(self.jump_button_label)
                .on_click(move |_, _, cx| {
                    state.update(cx, |state, cx| state.scroll_to_end(cx));
                })
                .when_some(jump_button_renderer, |button, renderer| renderer(button))
                .when(!show_jump_button, |button| button.disabled(true));

            // No explicit width or height: Button sizes an icon-only button as
            // a square on its own, and a renderer that adds a label or another
            // semantic size must be able to change the layout.
            let mut jump_button_row = div()
                .absolute()
                .left_0()
                .right_0()
                .bottom(rems(0.5 + jump_button_visibility * 0.5))
                .flex()
                .justify_center()
                .opacity(jump_button_visibility)
                .child(jump_button);
            jump_button_row.style().refine(&jump_button_style);
            root = root.child(jump_button_row);
        }
        root.style().refine(&self.style);
        root
    }
}

/// Longitudinal thumb geometry — the math upstream's scrollbar shares between
/// painting, track clicks and dragging, reduced to the vertical axis.
#[derive(Clone, Copy)]
struct ThumbGeometry {
    /// Top edge of the track.
    origin: Pixels,
    /// Logical thumb length (includes no inset — the port has none).
    length: Pixels,
    /// Usable travel: track length minus the thumb.
    travel: Pixels,
    /// Scrollable content span: content height minus the viewport.
    extent: Pixels,
}

impl ThumbGeometry {
    fn new(origin: Pixels, container: Pixels, content: Pixels) -> Self {
        let logical_length = (container / content * container)
            .max(MIN_THUMB_LENGTH)
            .min(container);
        Self {
            origin,
            length: logical_length,
            travel: container - logical_length,
            extent: (content - container).max(px(0.)),
        }
    }

    /// Thumb top for a scroll offset (negative-from-top, like
    /// [`ListState::scroll_px_offset_for_scrollbar`]).
    fn start(&self, offset: Pixels) -> Pixels {
        if self.extent <= px(0.) {
            return self.origin;
        }
        self.origin + (-offset / self.extent).clamp(0., 1.) * self.travel
    }

    /// Scroll offset for a pointer position with the thumb grabbed at `grab`.
    fn offset(&self, position: Pixels, grab: Pixels) -> Pixels {
        if self.travel <= px(0.) {
            return px(0.);
        }
        -self.extent * ((position - self.origin - grab) / self.travel).clamp(0., 1.)
    }
}

/// Per-element state of one [`ListScrollbar`], keyed by its element id.
#[derive(Default)]
struct ScrollbarState {
    dragging: bool,
    /// Pointer offset from the thumb's top edge at drag start.
    grab: Pixels,
    /// Whether the pointer is over the track; drives the thumb's hover color.
    hovered: bool,
}

/// A vertical scrollbar overlay for a [`ListState`] — the crate's replacement
/// for `gpui-base`'s scrollbar in this component. Paints only while the list
/// actually overflows.
struct ListScrollbar {
    id: ElementId,
    list_state: ListState,
}

impl ListScrollbar {
    fn new(list_state: &ListState) -> Self {
        Self {
            id: ElementId::Name("list-scrollbar".into()),
            list_state: list_state.clone(),
        }
    }

    fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = id.into();
        self
    }
}

impl IntoElement for ListScrollbar {
    type Element = Self;

    fn into_element(self) -> Self::Element {
        self
    }
}

impl Element for ListScrollbar {
    type RequestLayoutState = ();
    type PrepaintState = Hitbox;

    fn id(&self) -> Option<ElementId> {
        Some(self.id.clone())
    }

    fn source_location(&self) -> Option<&'static std::panic::Location<'static>> {
        None
    }

    fn request_layout(
        &mut self,
        _: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        window: &mut Window,
        cx: &mut App,
    ) -> (LayoutId, Self::RequestLayoutState) {
        // Fill the parent (the scroller root) — the track is carved out of the
        // resolved bounds during paint, like the wheel mask does.
        let mut style = Style::default();
        style.position = gpui::Position::Absolute;
        style.flex_grow = 1.0;
        style.flex_shrink = 1.0;
        style.size.width = relative(1.).into();
        style.size.height = relative(1.).into();

        (window.request_layout(style, None, cx), ())
    }

    fn prepaint(
        &mut self,
        _: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        bounds: Bounds<Pixels>,
        _: &mut Self::RequestLayoutState,
        window: &mut Window,
        _: &mut App,
    ) -> Self::PrepaintState {
        window.insert_hitbox(Self::cover_bounds(bounds), HitboxBehavior::Normal)
    }

    fn paint(
        &mut self,
        global_id: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        _: Bounds<Pixels>,
        _: &mut Self::RequestLayoutState,
        hitbox: &mut Self::PrepaintState,
        window: &mut Window,
        cx: &mut App,
    ) {
        let bounds = hitbox.bounds;
        let max_offset = self.list_state.max_offset_for_scrollbar().y.max(px(0.));
        if max_offset <= px(0.) {
            // Nothing to scroll: no bar, no listeners.
            return;
        }

        let theme = cx.theme();
        let viewport_height = bounds.size.height;
        let content_height = viewport_height + max_offset;
        let geometry = ThumbGeometry::new(bounds.origin.y, viewport_height, content_height);
        let current_offset = self.list_state.scroll_px_offset_for_scrollbar();
        let thumb_x = bounds.origin.x + bounds.size.width - THUMB_MARGIN - THUMB_WIDTH;
        let thumb_bounds = Bounds {
            origin: point(thumb_x, geometry.start(current_offset.y)),
            size: gpui::size(THUMB_WIDTH, geometry.length),
        };
        let track_bounds = Bounds {
            origin: point(thumb_x - (TRACK_WIDTH - THUMB_WIDTH), bounds.origin.y),
            size: gpui::size(TRACK_WIDTH, viewport_height),
        };

        let view_id = window.current_view();
        let drag: Rc<RefCell<ScrollbarState>> = global_id
            .map(|global_id| {
                window.with_element_state::<Rc<RefCell<ScrollbarState>>, _>(
                    global_id,
                    |state, _| {
                        let state = state.unwrap_or_default();
                        (state.clone(), state)
                    },
                )
            })
            .unwrap_or_default();

        window.with_content_mask(Some(ContentMask { bounds }), |window| {
            window.paint_layer(bounds, |window| {
                let active = drag.borrow().dragging || drag.borrow().hovered;
                let thumb_color = if active {
                    theme.muted_foreground
                } else {
                    theme.border
                };
                window.paint_quad(
                    gpui::fill(thumb_bounds, thumb_color).corner_radii(Corners::all(THUMB_RADIUS)),
                );
            });

            window.on_mouse_event({
                let drag = drag.clone();
                let list_state = self.list_state.clone();
                move |event: &MouseDownEvent, phase, _, cx| {
                    if !phase.bubble()
                        || event.button != MouseButton::Left
                        || !track_bounds.contains(&event.position)
                    {
                        return;
                    }
                    cx.stop_propagation();

                    let mut drag = drag.borrow_mut();
                    if thumb_bounds.contains(&event.position) {
                        // Grab the thumb where it is; the offset follows.
                        drag.dragging = true;
                        drag.grab = event.position.y - thumb_bounds.origin.y;
                        list_state.scrollbar_drag_started();
                    } else {
                        // Track click: center the thumb under the pointer.
                        drag.grab = geometry.length / 2.;
                        list_state.set_offset_from_scrollbar(point(
                            current_offset.x,
                            geometry.offset(event.position.y, drag.grab),
                        ));
                    }
                    cx.notify(view_id);
                }
            });

            window.on_mouse_event({
                let drag = drag.clone();
                let list_state = self.list_state.clone();
                move |event: &MouseMoveEvent, _, _, cx| {
                    let hovered = track_bounds.contains(&event.position);
                    let mut drag = drag.borrow_mut();

                    if drag.dragging && event.dragging() {
                        // Dragging may leave the track; the grab point pins
                        // the thumb under the pointer. Stop propagation so the
                        // move cannot select text or scroll ancestors.
                        list_state.set_offset_from_scrollbar(point(
                            current_offset.x,
                            geometry.offset(event.position.y, drag.grab),
                        ));
                        cx.stop_propagation();
                        cx.notify(view_id);
                    }

                    if drag.hovered != hovered {
                        drag.hovered = hovered;
                        cx.notify(view_id);
                    }
                }
            });

            window.on_mouse_event({
                let drag = drag.clone();
                let list_state = self.list_state.clone();
                move |event: &MouseUpEvent, phase, _, cx| {
                    if !phase.bubble() || event.button != MouseButton::Left {
                        return;
                    }
                    let mut drag = drag.borrow_mut();
                    if drag.dragging {
                        // Land the final position, then release.
                        list_state.set_offset_from_scrollbar(point(
                            current_offset.x,
                            geometry.offset(event.position.y, drag.grab),
                        ));
                        drag.dragging = false;
                        list_state.scrollbar_drag_ended();
                        cx.notify(view_id);
                    }
                }
            });
        });
    }
}

impl ListScrollbar {
    /// The hitbox and paint region: the scrollbar is laid out below the
    /// viewport (block layout stacks it after it), so lifting its bounds by
    /// one height covers the viewport — the same trick `gpui-base`'s wheel
    /// mask uses.
    fn cover_bounds(bounds: Bounds<Pixels>) -> Bounds<Pixels> {
        Bounds {
            origin: point(bounds.origin.x, bounds.origin.y - bounds.size.height),
            size: bounds.size,
        }
    }
}

/// A vertical wheel mask over a [`ListState`]: consumes vertical-dominant
/// wheel events in the capture phase while the list can move, and chains to
/// the ancestor scroller at the scroll edges. The vertical half of
/// `gpui-base`'s `ScrollableMask`.
struct ListWheelMask {
    id: ElementId,
    list_state: ListState,
}

impl ListWheelMask {
    fn new(list_state: &ListState) -> Self {
        Self {
            id: ElementId::Name("list-wheel-mask".into()),
            list_state: list_state.clone(),
        }
    }

    fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = id.into();
        self
    }
}

impl IntoElement for ListWheelMask {
    type Element = Self;

    fn into_element(self) -> Self::Element {
        self
    }
}

impl Element for ListWheelMask {
    type RequestLayoutState = ();
    type PrepaintState = Hitbox;

    // An id is needed to keep the gesture's axis lock across frames. The axis
    // suffix keeps two masks of one scroller apart when they share an id.
    fn id(&self) -> Option<ElementId> {
        Some((self.id.clone(), "vertical").into())
    }

    fn source_location(&self) -> Option<&'static std::panic::Location<'static>> {
        None
    }

    fn request_layout(
        &mut self,
        _: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        window: &mut Window,
        cx: &mut App,
    ) -> (LayoutId, Self::RequestLayoutState) {
        let mut style = Style::default();
        // Lay out relative to the scroller root to get the same size.
        style.position = gpui::Position::Absolute;
        style.flex_grow = 1.0;
        style.flex_shrink = 1.0;
        style.size.width = relative(1.).into();
        style.size.height = relative(1.).into();

        (window.request_layout(style, None, cx), ())
    }

    fn prepaint(
        &mut self,
        _: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        bounds: Bounds<Pixels>,
        _: &mut Self::RequestLayoutState,
        window: &mut Window,
        _: &mut App,
    ) -> Self::PrepaintState {
        window.insert_hitbox(ListScrollbar::cover_bounds(bounds), HitboxBehavior::Normal)
    }

    fn paint(
        &mut self,
        global_id: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        _: Bounds<Pixels>,
        _: &mut Self::RequestLayoutState,
        hitbox: &mut Self::PrepaintState,
        window: &mut Window,
        _cx: &mut App,
    ) {
        let line_height = window.line_height();
        let bounds = hitbox.bounds;
        let ongoing_scroll = global_id
            .map(|global_id| {
                window.with_element_state::<Rc<RefCell<OngoingScroll>>, _>(global_id, |state, _| {
                    let state = state.unwrap_or_default();
                    (state.clone(), state)
                })
            })
            .unwrap_or_default();

        window.with_content_mask(Some(ContentMask { bounds }), |window| {
            window.on_mouse_event({
                let view_id = window.current_view();
                let list_state = self.list_state.clone();
                let hitbox_id = hitbox.id;
                let ongoing_scroll = ongoing_scroll.clone();

                move |event: &ScrollWheelEvent, phase, window, cx| {
                    // Handle in the capture phase: ancestor scrollers such as
                    // `gpui::list` register their wheel listeners after their
                    // children paint, so in the bubble phase (reverse
                    // registration order) they run first and would consume the
                    // vertical component of a trackpad swipe before this mask
                    // could stop the propagation.
                    //
                    // `should_handle_scroll` (instead of a raw bounds check)
                    // keeps the mask inert when it is occluded, e.g. below an
                    // open dialog or context menu.
                    if !(phase.capture() && hitbox_id.should_handle_scroll(window)) {
                        return;
                    }

                    let mut delta = event.delta.pixel_delta(line_height);

                    // Lock the gesture to the axis it started on, so a
                    // diagonal trackpad swipe cannot flip which element
                    // consumes it from one event to the next. This is gpui's
                    // own gesture tracker — the axis lock `gpui-base`'s mask
                    // gets from its `lock_axis` extension.
                    if event.delta.precise() {
                        ongoing_scroll
                            .borrow_mut()
                            .filter(&mut delta, event.touch_phase);
                    }

                    // A vertical mask owns the vertical component only.
                    if !delta.x.is_zero() && !delta.y.is_zero() {
                        if delta.x.abs() > delta.y.abs() {
                            delta.y = px(0.);
                        } else {
                            delta.x = px(0.);
                        }
                    }

                    // The current offset must be clamped too: after a bubbled
                    // event, the list's own listener pushes the shared offset
                    // beyond the edge unclamped, and that transient overscroll
                    // would read as "room to scroll".
                    let axis_max = list_state.max_offset_for_scrollbar().y.max(px(0.));
                    let offset = list_state.scroll_px_offset_for_scrollbar();
                    let current = offset.y.clamp(-axis_max, px(0.));
                    let new_offset = (current + delta.y).clamp(-axis_max, px(0.));
                    if new_offset == current {
                        // At the edge or no overflow: bubble to the parent.
                        return;
                    }

                    list_state.set_offset_from_scrollbar(point(offset.x, new_offset));
                    cx.notify(view_id);
                    cx.stop_propagation();
                }
            });
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::components::traits::Sizable as _;
    use gpui::{AppContext as _, Render, TestAppContext};

    #[gpui::test]
    fn test_message_scroller_state_builder(cx: &mut TestAppContext) {
        let state = cx.new(|cx| MessageScrollerState::new(3, cx));

        cx.update(|cx| {
            assert_eq!(state.read(cx).item_count(), 3);
            assert!(!state.read(cx).is_scrolled_up());
            assert!(state.read(cx).is_following_tail());

            state.update(cx, |state, cx| {
                assert!(!state.scroll_to_item(3, cx));
                assert!(state.append(2, cx));
                assert_eq!(state.item_count(), 5);
                assert!(state.prepend(1, cx));
                assert_eq!(state.item_count(), 6);
                assert!(!state.splice(5..7, 0, cx));
                assert!(state.remeasure_items(0..6, cx));
                assert!(!state.remeasure_items(6..7, cx));
                assert!(state.scroll_to_item(2, cx));
                assert!(!state.is_scrolled_up());
                assert!(!state.is_following_tail());
                state.scroll_to_end(cx);
                assert!(state.is_following_tail());
                state.reset(2, cx);
                assert_eq!(state.item_count(), 2);
                assert!(state.is_following_tail());
            });
        });
    }

    #[gpui::test]
    fn test_message_scroller_builder(cx: &mut TestAppContext) {
        let state = cx.new(|cx| MessageScrollerState::new(0, cx));
        let scroller = MessageScroller::new("message-scroller", state, |_, _, _| div())
            .scrollbar(false)
            .jump_button(false)
            .with_jump_button_label("Latest")
            .with_content_style(StyleRefinement::default())
            .with_list_style(StyleRefinement::default())
            .with_row_style(StyleRefinement::default())
            .with_jump_button_style(StyleRefinement::default())
            .with_jump_button_renderer(|button| button.large())
            .with_jump_button_transition(Duration::from_millis(300))
            .with_bottom_fade(gpui::white());

        assert!(!scroller.scrollbar);
        assert!(!scroller.jump_button);
        assert_eq!(scroller.jump_button_label, "Latest");
        assert!(scroller.jump_button_renderer.is_some());
        assert_eq!(
            scroller.jump_button_transition,
            Some(Duration::from_millis(300))
        );
        assert_eq!(scroller.bottom_fade, Some(gpui::white()));
    }

    #[test]
    fn thumb_geometry_maps_offsets_and_positions_both_ways() {
        // A 1000px content in a 400px viewport: extent 600, thumb 160
        // (400² / 1000, well above the 24px floor), travel 240.
        let geometry = ThumbGeometry::new(px(0.), px(400.), px(1000.));
        assert_eq!(geometry.extent, px(600.));
        assert_eq!(geometry.length, px(160.));
        assert_eq!(geometry.travel, px(240.));

        // Top of the list maps to the top of the track…
        assert_eq!(geometry.start(px(0.)), px(0.));
        // …the bottom to travel.
        assert_eq!(geometry.start(px(-600.)), px(240.));

        // And a pointer at travel + half the thumb maps back to the bottom.
        assert_eq!(geometry.offset(px(240. + 80.), px(80.)), px(-600.));
        // A grab at the thumb's start keeps the thumb under the pointer.
        assert_eq!(geometry.offset(px(0.), px(0.)), px(0.));

        // No overflow: no extent, the thumb never moves and dragging is a
        // no-op.
        let static_geometry = ThumbGeometry::new(px(0.), px(400.), px(400.));
        assert_eq!(static_geometry.start(px(-123.)), px(0.));
        assert_eq!(static_geometry.offset(px(300.), px(0.)), px(0.));
    }

    struct ScrollerTestView {
        state: Entity<MessageScrollerState>,
    }

    impl Render for ScrollerTestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div().size_full().child(
                MessageScroller::new("test-scroller", self.state.clone(), |index, _, _| {
                    div().h(px(24.)).child(format!("row {index}"))
                })
                .with_bottom_fade(gpui::white()),
            )
        }
    }

    #[gpui::test]
    fn message_scroller_mounts_with_its_overlays(cx: &mut TestAppContext) {
        cx.update(crate::init);

        let state = cx.new(|cx| MessageScrollerState::new(48, cx));
        let _window = cx.add_window(|_, _| ScrollerTestView { state });
    }
}
