//! Celestia tabs — the desktop counterpart of
//! `packages/ui/src/components/primitive/tabs.tsx`.
//!
//! Mirrors shadcn tabs with two variants:
//! - [`TabsVariant::Default`]: segmented pill track (`bg-muted` track, floating
//!   `bg-background` + `shadow-xs` active pill in light mode, `bg-input/30` +
//!   `border-input/40` in dark mode).
//! - [`TabsVariant::Line`]: underline line track with subtle border-b separator
//!   and a floating 2px indicator bar.
//!
//! Three standard sizes:
//! - [`TabsSize::Small`]: 24px height (`h-6`), 11px font size.
//! - [`TabsSize::Default`]: 30px height (`h-7.5`), 12px font size.
//! - [`TabsSize::Large`]: 36px height (`h-9`), 13px font size.
//!
//! # Motion parity with the web primitive
//!
//! Three effects the web `tabs.tsx` carries, reproduced here:
//!
//! 1. **The sliding indicator.** The web renders a single absolutely-positioned
//!    `<TabsIndicator>` sized to `--active-tab-{top,left,width,height}`, which
//!    base-ui recomputes on every selection change, and transitions
//!    `transition-[left,top,width,height] duration-normal
//!    [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]` — 220ms on
//!    `--ease-out`. Here the same element is a `spring`-driven `div` whose
//!    target geometry is sampled from each trigger's `on_prepaint` bounds. The
//!    spring (rather than a tween) is what lets a second switch mid-slide
//!    redirect the indicator from where it *is* instead of restarting it from
//!    the tab it left; the settle time is `duration-normal` and the curve is
//!    `--ease-out`, so the two agree on when the motion is over.
//! 2. **The trigger ink fade** — `transition-colors duration-fast ease-out`.
//!    The old desktop trigger swapped its text colour instantly through
//!    `.hover(...)`. The web hangs *both* `hover:text-foreground` and
//!    `data-active:text-foreground` off that one rule, so a single blend here
//!    covers both: the label (and its icon, which inherits the colour) fades
//!    into the active state on selection and back out on deselection, and fades
//!    on hover while unselected.
//! 3. **The panel entrance** — `data-open:animate-in data-open:fade-in-0
//!    data-open:zoom-in-[0.99] duration-normal`.
//!
//! ## What could not be reproduced
//!
//! `active:scale-[0.97] active:duration-instant` on the trigger is a *transform*,
//! and GPUI has no element transform — only images and SVGs take a
//! `TransformationMatrix`, so there is nothing to scale a subtree with. The
//! `zoom-in-[0.99]` half of the panel entrance is the same 1% scale and is
//! approximated by a 2px rise, which reads the same on a panel edge. The
//! trigger's press therefore keeps the web's *colour* behaviour (no colour
//! change beyond hover) and drops only the geometry. See
//! `reference/gpui-kit/.../popover.rs`, which documents the same constraint for
//! the dropdown entrance.
//!
//! Re-exports [`Tab`] and [`TabBar`] from `gpui-kit` for full backward
//! compatibility.

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use gpui_base::motion::transition;
use gpui_base::{ElementExt as _, spring};
use gpui_component::{ActiveTheme, Disableable, Selectable, h_flex, v_flex};
use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnimationExt as _, AnyElement, App, Bounds, BoxShadow, ClickEvent, ElementId, FocusHandle,
    FontWeight, InteractiveElement, IntoElement, ParentElement, Pixels, RenderOnce, SharedString,
    StatefulInteractiveElement as _, Styled, Window, div, point, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::focus_ring::focus_ring;
use crate::motion;

pub use gpui_component::tab::{Tab, TabBar};

/// Visual presentation style of the tabs list.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum TabsVariant {
    /// Segmented pill track (`bg-muted` track, floating `bg-background` active
    /// pill with `shadow-xs`).
    #[default]
    Default,
    /// Underline line track with a floating bottom indicator bar
    /// (`variant="line"` in shadcn).
    Line,
}

/// Height and padding scale for tabs.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum TabsSize {
    /// 24px height, compact (web `sm`).
    Small,
    /// 30px height (web `default` / `h-7.5`).
    #[default]
    Default,
    /// 36px height (web `lg` / `h-9`).
    Large,
}

/// Orientation of the tabs container.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum TabsOrientation {
    #[default]
    Horizontal,
    Vertical,
}

/// `shadow-xs` — `0 1px 2px 0 rgb(0 0 0 / 0.05)`, the elevation the web gives
/// the active pill in the segmented track.
fn shadow_xs() -> BoxShadow {
    BoxShadow {
        offset: point(px(0.), px(1.)),
        blur_radius: px(2.),
        spread_radius: px(0.),
        inset: false,
        color: gpui::rgba(0x0000_000d).into(),
    }
}

/// The root tabs container (mirrors web `<Tabs>`).
#[derive(IntoElement)]
pub struct Tabs {
    id: ElementId,
    orientation: TabsOrientation,
    children: Vec<AnyElement>,
}

impl Tabs {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            orientation: TabsOrientation::default(),
            children: Vec::new(),
        }
    }

    pub fn orientation(mut self, orientation: TabsOrientation) -> Self {
        self.orientation = orientation;
        self
    }
}

impl ParentElement for Tabs {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for Tabs {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        let el = match self.orientation {
            TabsOrientation::Horizontal => v_flex().gap_2(),
            TabsOrientation::Vertical => h_flex().gap_2(),
        };
        el.id(self.id).children(self.children)
    }
}

/// Geometry sampled during prepaint: the list's own box plus one box per
/// trigger, all in window coordinates.
///
/// Written through a `RefCell` from `on_prepaint`, which deliberately does not
/// notify — a bounds write that triggered a re-render would re-enter layout
/// every frame for as long as the list is mounted.
struct IndicatorBounds {
    container: Bounds<Pixels>,
    tabs: Vec<Bounds<Pixels>>,
}

impl IndicatorBounds {
    fn new(num_tabs: usize) -> Self {
        Self {
            container: Bounds::default(),
            tabs: vec![Bounds::default(); num_tabs],
        }
    }

    fn resize(&mut self, num_tabs: usize) {
        self.tabs.resize(num_tabs, Bounds::default());
    }
}

/// The index of the selected trigger, if any.
///
/// The web reads this off base-ui's root `value`. The desktop's triggers each
/// carry their own `selected` flag, so the list reads it back instead of keeping
/// a parallel index in sync — one source of truth, and no way for the indicator
/// to point at a different tab than the one that renders as active.
fn selected_index(children: &[TabsTrigger]) -> Option<usize> {
    children.iter().position(|tab| tab.is_selected())
}

/// Push the list's variant and size onto a trigger.
///
/// The desktop stand-in for the web's `group/tabs-list` data attributes, which
/// the triggers style themselves from: a trigger's own `variant` / `size` are
/// *overridden* by the list's, so a `Line` list cannot end up with a trigger
/// that still paints the segmented treatment.
fn adopt(variant: TabsVariant, size: TabsSize, child: TabsTrigger) -> TabsTrigger {
    child.variant(variant).size(size)
}

/// Track container grouping tab triggers (mirrors web `<TabsList>`).
///
/// Holds its children as typed [`TabsTrigger`]s rather than `AnyElement`s so it
/// can (a) find the selected index for the sliding indicator and (b) push its
/// own `variant` / `size` down onto every trigger, the way the web's
/// `group/tabs-list` data attributes do. Mark selection on the trigger
/// (`TabsTrigger::selected`) — the list reads it; there is no second source of
/// truth to keep in sync.
#[derive(IntoElement)]
pub struct TabsList {
    id: ElementId,
    variant: TabsVariant,
    size: TabsSize,
    children: Vec<TabsTrigger>,
}

impl TabsList {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            variant: TabsVariant::default(),
            size: TabsSize::default(),
            children: Vec::new(),
        }
    }

    pub fn variant(mut self, variant: TabsVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn size(mut self, size: TabsSize) -> Self {
        self.size = size;
        self
    }

    /// Add a trigger. The list owns the layout, so a trigger's own `variant`
    /// and `size` are overridden by the list's.
    pub fn child(mut self, child: TabsTrigger) -> Self {
        self.children.push(child);
        self
    }

    /// Add several triggers.
    pub fn children(mut self, children: impl IntoIterator<Item = TabsTrigger>) -> Self {
        self.children.extend(children);
        self
    }
}

impl RenderOnce for TabsList {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let is_dark = cx.theme().mode.is_dark();
        let (muted, border, input, background, foreground, transparent, radius) = {
            let theme = cx.theme();
            (
                theme.muted,
                theme.border,
                theme.input,
                theme.background,
                theme.foreground,
                theme.transparent,
                theme.radius,
            )
        };

        let height = match self.size {
            TabsSize::Small => px(24.),
            TabsSize::Default => px(30.),
            TabsSize::Large => px(36.),
        };

        let num_tabs = self.children.len();
        let selected_ix = selected_index(&self.children);

        let bounds_rc = if selected_ix.is_some() && num_tabs > 0 {
            let rc: Rc<RefCell<IndicatorBounds>> = window
                .use_keyed_state(
                    ElementId::from((self.id.clone(), "tab-bounds")),
                    cx,
                    |_, _| Rc::new(RefCell::new(IndicatorBounds::new(num_tabs))),
                )
                .read(cx)
                .clone();
            rc.borrow_mut().resize(num_tabs);
            Some(rc)
        } else {
            None
        };

        let anim = window.use_keyed_state(
            ElementId::from((self.id.clone(), "tab-anim")),
            cx,
            |_, _| (px(0.), px(0.)),
        );
        // The first paint has no bounds yet, so the indicator cannot be built.
        // Flipping this flag mutates a window-owned entity, which is what makes
        // gpui draw the frame that turns the sampled bounds into an indicator.
        let initialized = window.use_keyed_state(
            ElementId::from((self.id.clone(), "tab-init")),
            cx,
            |_, _| false,
        );
        if !*initialized.read(cx) {
            initialized.update(cx, |seen, _| *seen = true);
        }

        if let (Some(rc), Some(selected_ix)) = (bounds_rc.as_ref(), selected_ix) {
            // One immutable borrow, resolved into a plain value, so no `RefCell`
            // guard is held across an entity update. The target is simply where
            // the selected tab is — no history is kept, because the spring
            // retargets from wherever the indicator already is and carries its
            // velocity across, which is what lets a second switch mid-slide
            // redirect rather than restart.
            let target = {
                let bounds = rc.borrow();
                if bounds.container.size.width == px(0.) {
                    None
                } else {
                    // The indicator lives inside the first tab's wrapper, so it
                    // is positioned relative to that wrapper, not the list.
                    let origin = bounds
                        .tabs
                        .first()
                        .map(|tab| tab.origin.x)
                        .unwrap_or(bounds.container.origin.x);
                    bounds
                        .tabs
                        .get(selected_ix)
                        .map(|tab| (tab.origin.x - origin, tab.size.width))
                }
            };

            if let Some(target) = target
                && *anim.read(cx) != target
            {
                anim.update(cx, |slot, _| *slot = target);
            }
        }

        let (to_left, to_width) = *anim.read(cx);
        // Until the first bounds sample lands there is nothing to position, and
        // the selected trigger paints its own active state instead.
        let indicator_ready = to_width > px(0.);
        let (left, width) = if indicator_ready {
            // `duration-normal` on `--ease-out`, as a spring so a mid-flight
            // retarget carries the velocity it already has.
            let policy = cx.theme().motion_tokens().spring_move;
            (
                spring(
                    (self.id.clone(), "indicator-left"),
                    to_left,
                    policy,
                    window,
                    cx,
                ),
                spring(
                    (self.id.clone(), "indicator-width"),
                    to_width,
                    policy,
                    window,
                    cx,
                ),
            )
        } else {
            (to_left, to_width)
        };

        let indicator = indicator_ready.then(|| {
            let el = div().absolute().top_0().bottom_0().left(left).w(width);
            match self.variant {
                TabsVariant::Default => {
                    // `rounded-md bg-background shadow-xs dark:border
                    // dark:border-input/40 dark:bg-input/30`.
                    let el = el.rounded(px(6.)).bg(if is_dark {
                        input.opacity(0.30)
                    } else {
                        background
                    });
                    if is_dark {
                        el.border_1().border_color(input.opacity(0.40))
                    } else {
                        el.shadow(vec![shadow_xs()])
                    }
                }
                TabsVariant::Line => {
                    // `rounded-full bg-foreground bottom-0 h-0.5`.
                    el.child(
                        div()
                            .absolute()
                            .left_0()
                            .right_0()
                            .bottom_0()
                            .h(px(2.))
                            .rounded_full()
                            .bg(foreground),
                    )
                }
            }
        });

        let variant = self.variant;
        let size = self.size;
        let mut indicator = indicator;
        let mut rendered = Vec::with_capacity(num_tabs);
        for (ix, child) in self.children.into_iter().enumerate() {
            let child = adopt(variant, size, child).indicator_ready(indicator_ready);
            let wrapper = div().flex_shrink_0().relative();
            let wrapper = match bounds_rc.clone() {
                Some(rc) => wrapper.on_prepaint(move |bounds, _, _| {
                    if let Some(slot) = rc.borrow_mut().tabs.get_mut(ix) {
                        *slot = bounds;
                    }
                }),
                None => wrapper,
            };
            // The indicator rides inside the first wrapper so the flex item
            // indices stay 1:1 with the triggers.
            rendered.push(
                wrapper
                    .when(ix == 0, |this| {
                        this.when_some(indicator.take(), |this, indicator| this.child(indicator))
                    })
                    .child(child)
                    .into_any_element(),
            );
        }

        match variant {
            TabsVariant::Default => h_flex()
                .id(self.id)
                .h(height)
                .p(px(3.))
                .gap(px(2.))
                .items_center()
                .justify_center()
                .rounded(radius)
                .bg(muted)
                .children(rendered),
            TabsVariant::Line => h_flex()
                .id(self.id)
                .h(height)
                .gap(px(4.))
                .items_end()
                .border_b_1()
                .border_color(border.opacity(0.5))
                .bg(transparent)
                .children(rendered),
        }
    }
}

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// Persistent per-trigger state: the focus handle behind the house focus ring,
/// and the hover flag the colour fade reads.
struct TriggerState {
    focus_handle: FocusHandle,
    hovered: Cell<bool>,
}

/// Individual tab trigger button (mirrors web `<TabsTrigger>`).
#[derive(IntoElement)]
pub struct TabsTrigger {
    id: ElementId,
    label: Option<SharedString>,
    icon: Option<PhosphorIcon>,
    selected: bool,
    disabled: bool,
    variant: TabsVariant,
    size: TabsSize,
    /// Set by [`TabsList`] once the sliding indicator owns the selected state.
    /// Until then the trigger draws its own, so the very first frame is not a
    /// frame with no selection affordance at all.
    indicator_ready: bool,
    on_click: Option<ClickHandler>,
    children: Vec<AnyElement>,
}

impl TabsTrigger {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            label: None,
            icon: None,
            selected: false,
            disabled: false,
            variant: TabsVariant::default(),
            size: TabsSize::default(),
            indicator_ready: false,
            on_click: None,
            children: Vec::new(),
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn variant(mut self, variant: TabsVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn size(mut self, size: TabsSize) -> Self {
        self.size = size;
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }

    /// Only [`TabsList`] calls this — see the field docs.
    fn indicator_ready(mut self, ready: bool) -> Self {
        self.indicator_ready = ready;
        self
    }
}

impl Selectable for TabsTrigger {
    fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    fn is_selected(&self) -> bool {
        self.selected
    }
}

impl Disableable for TabsTrigger {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl ParentElement for TabsTrigger {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TabsTrigger {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let is_dark = cx.theme().mode.is_dark();

        let (font_size, px_pad, icon_size) = match self.size {
            TabsSize::Small => (px(11.), px(8.), px(12.)),
            TabsSize::Default => (px(12.), px(10.), px(14.)),
            TabsSize::Large => (px(13.), px(14.), px(16.)),
        };

        // `text-muted-foreground` at rest. The web hangs both `hover:text-foreground`
        // and `data-active:text-foreground` off the same `transition-colors
        // duration-fast ease-out` rule, so one blend serves both and the colour
        // fades *into* the active state rather than snapping when the tab is
        // selected.
        let (rest_text, active_text) = (cx.theme().muted_foreground, cx.theme().foreground);

        let state = window.use_keyed_state(self.id.clone(), cx, |_, cx| TriggerState {
            focus_handle: cx.focus_handle(),
            hovered: Cell::new(false),
        });
        let (focus_handle, is_hovered) = {
            let state = state.read(cx);
            (state.focus_handle.clone(), state.hovered.get())
        };

        // `transition-colors duration-fast ease-out`.
        let active_t = if self.disabled {
            0.0
        } else {
            transition(
                (self.id.clone(), "ink"),
                if self.selected || is_hovered {
                    1.0
                } else {
                    0.0
                },
                motion::hover_transition(),
                window,
                cx,
            )
        };
        let text = motion::mix(rest_text, active_text, active_t);

        let mut el = div()
            .id(self.id.clone())
            .relative()
            .h_full()
            .px(px_pad)
            .gap(px(6.))
            .flex()
            .items_center()
            .justify_center()
            .whitespace_nowrap()
            .text_size(font_size);

        if self.disabled {
            el = el.opacity(0.5).cursor_not_allowed();
        } else {
            let state_hover = state.clone();
            el = el
                .cursor_pointer()
                .track_focus(&focus_handle)
                .on_hover(move |hovered, _, cx| {
                    if state_hover.read(cx).hovered.get() == *hovered {
                        return;
                    }
                    state_hover.update(cx, |state, cx| {
                        state.hovered.set(*hovered);
                        cx.notify();
                    });
                });
            if let Some(on_click) = self.on_click {
                el = el.on_click(move |event, window, cx| on_click(event, window, cx));
            }
        }

        match self.variant {
            TabsVariant::Default => {
                el = el.rounded(px(6.)).border_1();
                if self.selected {
                    // The sliding indicator paints the active pill once it is
                    // ready; the trigger then contributes only its ink. Before
                    // that (first frame, or a list with no indicator) it paints
                    // the pill itself.
                    if self.indicator_ready {
                        el = el
                            .bg(transparent_bg(cx))
                            .border_color(transparent_bg(cx))
                            .text_color(text)
                            .font_weight(FontWeight::MEDIUM);
                    } else if is_dark {
                        el = el
                            .bg(cx.theme().input.opacity(0.35))
                            .border_color(cx.theme().border)
                            .text_color(text)
                            .font_weight(FontWeight::MEDIUM);
                    } else {
                        el = el
                            .bg(cx.theme().background)
                            .border_color(cx.theme().border.opacity(0.2))
                            .shadow(vec![shadow_xs()])
                            .text_color(text)
                            .font_weight(FontWeight::MEDIUM);
                    }
                } else {
                    el = el
                        .bg(transparent_bg(cx))
                        .border_color(transparent_bg(cx))
                        .text_color(text);
                }
            }
            TabsVariant::Line => {
                // The web trigger is `border border-transparent`; the underline
                // is the indicator's job, not the trigger's.
                el = el
                    .rounded_none()
                    .border_1()
                    .border_color(transparent_bg(cx))
                    .text_color(text);
                if self.selected {
                    el = el.font_weight(FontWeight::MEDIUM);
                    if !self.indicator_ready {
                        el = el.child(
                            div()
                                .absolute()
                                .left_0()
                                .right_0()
                                .bottom_0()
                                .h(px(2.))
                                .rounded_full()
                                .bg(active_text),
                        );
                    }
                }
            }
        }

        if let Some(icon) = self.icon {
            // No explicit colour: `Phosphor` falls back to the inherited text
            // style, so the glyph fades with the label instead of snapping
            // while the label is still mid-transition.
            el = el.child(Phosphor::new(icon).size(icon_size));
        }

        if let Some(label) = self.label {
            el = el.child(label);
        }

        el = el.children(self.children);

        // `focus-visible:ring-2 focus-visible:ring-ring` — the Celestia house
        // ring, not gpui-kit's 3px-at-50% helper.
        if !self.disabled && focus_handle.is_focused(window) {
            el = focus_ring(el, window, cx);
        }

        el
    }
}

/// `theme.transparent`, pulled out so the two branches above read as the web's
/// `border-transparent` / `bg-transparent` rather than as bare `transparent()`.
fn transparent_bg(cx: &App) -> gpui::Hsla {
    cx.theme().transparent
}

/// Content panel rendered for a specific tab (mirrors web `<TabsContent>`).
#[derive(IntoElement)]
pub struct TabsContent {
    id: ElementId,
    visible: bool,
    children: Vec<AnyElement>,
}

impl TabsContent {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            visible: true,
            children: Vec::new(),
        }
    }

    pub fn visible(mut self, visible: bool) -> Self {
        self.visible = visible;
        self
    }
}

impl ParentElement for TabsContent {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TabsContent {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        if !self.visible {
            return div().id(self.id).into_any_element();
        }
        let id = self.id;
        // `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.99]
        // duration-normal [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]`.
        // The zoom is a 1% scale — a transform, which GPUI cannot apply to a
        // subtree — so a 2px rise stands in for it and the fade carries the
        // rest. The animation id is per-panel, so switching tabs (which swaps
        // which `TabsContent` is mounted) replays the entrance.
        div()
            .id(id.clone())
            .w_full()
            .text_xs()
            .line_height(px(18.0))
            .children(self.children)
            .with_animation(
                ElementId::from((id, "enter")),
                motion::SLIDE.animation(),
                |el, t| el.opacity(t).relative().top(px(2.0 * (1.0 - t))),
            )
            .into_any_element()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::{Context, Render, TestAppContext};

    /// The list reads the selection off its triggers rather than keeping a
    /// parallel index, so the indicator and the trigger that paints itself as
    /// active can never disagree. Pinned in both directions: a list with no
    /// selection must report `None`, which is what stops a "always returns the
    /// first tab" regression from passing.
    #[test]
    fn the_selected_index_is_read_back_from_the_triggers() {
        let none = [
            TabsTrigger::new("a").label("A"),
            TabsTrigger::new("b").label("B"),
        ];
        assert_eq!(selected_index(&none), None);

        let second = [
            TabsTrigger::new("a").label("A"),
            TabsTrigger::new("b").label("B").selected(true),
        ];
        assert_eq!(selected_index(&second), Some(1));

        let empty: [TabsTrigger; 0] = [];
        assert_eq!(selected_index(&empty), None);
    }

    /// The list owns the layout, so its variant and size win over the trigger's
    /// own — the desktop stand-in for the web's `group/tabs-list` data
    /// attributes. A reversal here would silently let a `Line` list paint
    /// segmented triggers.
    #[test]
    fn the_list_overrides_each_trigger_variant_and_size() {
        let adopted = adopt(
            TabsVariant::Line,
            TabsSize::Large,
            TabsTrigger::new("t")
                .variant(TabsVariant::Default)
                .size(TabsSize::Small),
        );

        assert_eq!(adopted.variant, TabsVariant::Line);
        assert_eq!(adopted.size, TabsSize::Large);
    }

    /// Exercises the whole render path — the prepaint bounds sampler, the
    /// spring-driven indicator, the trigger's ink transition and the panel
    /// entrance — in both variants, so a panic in any of them fails here rather
    /// than in a window.
    struct TabsView;

    impl Render for TabsView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .child(
                    Tabs::new("tabs-default")
                        .child(
                            TabsList::new("list-default")
                                .child(TabsTrigger::new("d0").label("Overview").selected(true))
                                .child(
                                    TabsTrigger::new("d1")
                                        .label("Configuration")
                                        .icon(PhosphorIcon::BookOpen),
                                )
                                .child(TabsTrigger::new("d2").label("Security").disabled(true)),
                        )
                        .child(TabsContent::new("panel-default").child("Overview panel")),
                )
                .child(
                    Tabs::new("tabs-line")
                        .child(
                            TabsList::new("list-line")
                                .variant(TabsVariant::Line)
                                .size(TabsSize::Small)
                                .children([
                                    TabsTrigger::new("l0").label("Overview").selected(true),
                                    TabsTrigger::new("l1").label("Configuration"),
                                ]),
                        )
                        // A hidden panel must render nothing at all.
                        .child(
                            TabsContent::new("panel-line")
                                .visible(false)
                                .child("hidden"),
                        ),
                )
        }
    }

    #[gpui::test]
    fn tabs_render_both_variants_without_panic(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::init(cx);
        });

        let _window = cx.add_window(|_window, _cx| TabsView);
    }
}
