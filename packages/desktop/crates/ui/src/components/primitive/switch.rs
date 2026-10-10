//! Switch — the desktop counterpart of
//! `packages/ui/src/components/primitive/switch.tsx`.
//!
//! Written directly on `gpui`. The file used to re-export
//! `gpui_component::switch::Switch`, which wrapped `gpui_base::Switch`'s state
//! machine (plus its `SwitchTrack` / `SwitchThumb` parts); that machine now
//! lives here, and the public surface the shim exposed — the [`Switch`] type
//! with [`Switch::checked`], [`Switch::on_click`], [`Switch::label`],
//! [`Switch::color`], `Sizable` and `Disableable` — is preserved.
//!
//! # The state machine
//!
//! The checked value is **controlled**: activation reports the *requested*
//! next value (`!checked` at render time) through [`Switch::on_click`], and the
//! owner writes it back and notifies. Pointer and keyboard activation both
//! funnel through the div's `on_click`, which raw gpui natively synthesizes
//! from Enter/Space key ups on a focused element. A disabled switch registers
//! no click handler and tracks no focus, and stops mouse-down propagation —
//! so unlike a disabled checkbox it also shields ancestors from the click.
//!
//! # Motion
//!
//! Both animated values ride [`motion::DURATION_FAST`] (150ms, critical
//! damping — the web's `transition-[…] duration-fast` with `--ease-out`):
//!
//! - the **thumb travel** is a keyed spring over the thumb's `left` offset.
//!   The position is geometry, not a semantic state style — the spring owns it
//!   end to end and reverses from wherever the thumb is when the switch is
//!   toggled again mid-travel. The spring epsilon is 0.1px: a pixel spring
//!   settles perceptibly sooner than the sub-0.001 default, and stops
//!   scheduling frames once it is inside the tolerance.
//! - the **track fill** blends `switch` → `primary` (or [`Switch::color`])
//!   with [`motion::mix`]; a disabled track paints the static half-opacity
//!   color directly.
//!
//! One deviation from the `gpui-component` upstream it replaces: its thumb rode
//! the theme's `spring_move` (220ms, ζ = 0.85); the crate's motion-token table
//! pins switch thumbs to `duration-fast`, and the web primitive agrees.
//! `gpui-component`'s `label_side` knob had no public builder on the styled
//! switch and is not carried over.

use std::rc::Rc;
use std::time::Duration;

use gpui::{
    AnimationExt as _, AnyElement, App, Div, ElementId, Hsla, InteractiveElement as _, IntoElement,
    MouseButton, ParentElement as _, Refineable as _, RenderOnce, Role, SharedString,
    SpringAnimation, SpringConfig, Stateful, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Toggled, Window, div, prelude::FluentBuilder as _, px,
};

use crate::components::primitive::tooltip::Tooltip;
use crate::components::traits::{Disableable, Sizable, Size};
use crate::motion;
use crate::theme::ActiveTheme as _;

/// The activation handler — receives the *requested* next checked value.
type OnClick = Rc<dyn Fn(&bool, &mut Window, &mut App)>;

/// The raw-gpui spring policy for one design-system duration — the physical
/// counterpart of the crate's `Spring::new(response)` (ω₀ = 2π/response,
/// damping ratio ζ = 1, so no overshoot), expressed as gpui's
/// [`SpringConfig`]. Both control springs in this file are built from it, so
/// they ride `--transition-duration-fast` (150ms) like the web primitive.
fn spring_config(response: Duration) -> SpringConfig {
    let frequency = std::f32::consts::TAU / response.as_secs_f32();
    SpringConfig::new(frequency * frequency, 2.0 * frequency, 1.0)
}

/// A Switch element that can be toggled on or off.
#[derive(IntoElement)]
pub struct Switch {
    base: Stateful<Div>,
    id: ElementId,
    style: StyleRefinement,
    checked: bool,
    disabled: bool,
    label: Option<SharedString>,
    /// The announced name, when the visible label is not it.
    accessibility_label: Option<SharedString>,
    on_click: Option<OnClick>,
    size: Size,
    color: Option<Hsla>,
    tooltip: Option<SharedString>,
}

impl Switch {
    /// Create a new Switch element.
    pub fn new(id: impl Into<ElementId>) -> Self {
        let id = id.into();
        Self {
            base: div().id(id.clone()),
            id,
            style: StyleRefinement::default(),
            checked: false,
            disabled: false,
            label: None,
            accessibility_label: None,
            on_click: None,
            size: Size::Medium,
            color: None,
            tooltip: None,
        }
    }

    /// Set the checked state of the switch.
    pub fn checked(mut self, checked: bool) -> Self {
        self.checked = checked;
        self
    }

    /// Set the label of the switch.
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Set the name a screen reader announces, when the visible label is not
    /// it.
    ///
    /// A switch's name comes from its [`label`](Self::label) by default.
    /// Setting this replaces the announced name without changing what is
    /// displayed.
    pub fn accessibility_label(mut self, label: impl Into<SharedString>) -> Self {
        self.accessibility_label = Some(label.into());
        self
    }

    /// Alias for [`Self::on_change`]. The last callback registered with either name wins.
    pub fn on_click(self, handler: impl Fn(&bool, &mut Window, &mut App) + 'static) -> Self {
        self.on_change(handler)
    }

    /// Handle a requested checked value from pointer or keyboard activation.
    ///
    /// This is a controlled value: the owner must write the requested value and
    /// call `cx.notify()` to render it. Disabled controls do not call the handler.
    /// This and [`Self::on_click`] share one callback; chaining them replaces
    /// the previous handler instead of calling both.
    pub fn on_change(mut self, handler: impl Fn(&bool, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }

    /// Set the background color of the switch when checked.
    /// Defaults to `cx.theme().primary`.
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = Some(color.into());
        self
    }

    /// Set tooltip text for the switch.
    pub fn tooltip(mut self, tooltip: impl Into<SharedString>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }
}

impl Styled for Switch {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Sizable for Switch {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Disableable for Switch {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

/// Track geometry for one size step: `(width, height, thumb side)`.
fn track_metrics(size: Size) -> (gpui::Pixels, gpui::Pixels, gpui::Pixels) {
    match size {
        Size::XSmall | Size::Small => (px(28.), px(16.), px(12.)),
        _ => (px(36.), px(20.), px(16.)),
    }
}

impl RenderOnce for Switch {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let checked = self.checked;
        let disabled = self.disabled;
        let accessibility_label = self.accessibility_label.clone().or(self.label.clone());
        let on_click = self.on_click.clone();

        let (track_width, track_height, bar_width) = track_metrics(self.size);
        let inset = px(2.);
        // The track and thumb round into a pill, unless the theme squares the
        // whole UI away (radius 0).
        let radius = if cx.theme().radius >= px(4.) {
            track_height
        } else {
            cx.theme().radius
        };

        let checked_bg = self.color.unwrap_or(cx.theme().primary);
        let unchecked_bg = cx.theme().switch;
        // GPUI's element opacity multiplies each primitive's alpha instead of
        // compositing the subtree as one group, so fading the whole control
        // would let the track show through the thumb. Fading the track alone
        // lands on the pixels a grouped fade would: the thumb is `background`.
        let disabled_track_bg = (if checked { checked_bg } else { unchecked_bg }).opacity(0.5);
        let thumb_bg = cx.theme().switch_thumb;

        let focus_handle = window
            .use_keyed_state(self.id.clone(), cx, |_, cx| cx.focus_handle())
            .read(cx)
            .clone();

        // The thumb's position is geometry, not a semantic state style: the
        // spring owns it end to end and reverses from wherever the thumb is
        // when the switch is toggled again mid-travel. A newly mounted spring
        // starts at its target, so a checked switch mounts settled on the
        // right. The 0.1px tolerance is the pixel-spring epsilon the crate's
        // motion tokens use — sub-pixel travel would otherwise keep the
        // spring scheduling frames long after the travel reads as done.
        let thumb_target = if checked {
            track_width - bar_width - inset * 2.0
        } else {
            px(0.)
        };
        let thumb = div()
            .rounded(radius)
            .size(bar_width)
            .bg(thumb_bg)
            .with_spring(
                (self.id.clone(), "thumb"),
                SpringAnimation::new(spring_config(motion::DURATION_FAST))
                    .to(thumb_target)
                    .with_epsilon(0.1),
                |thumb, x: gpui::Pixels| thumb.left(x),
            );

        let mut track = div()
            .id((self.id.clone(), "track"))
            .w(track_width)
            .h(track_height)
            .rounded(radius)
            .flex()
            .items_center()
            .border(inset)
            .border_color(cx.theme().transparent)
            .child(thumb);
        // The tooltip rides the track — the switch's visual target — as upstream.
        if let Some(tooltip) = self.tooltip {
            track =
                track.tooltip(move |window, cx| Tooltip::new(tooltip.clone()).build(window, cx));
        }
        // The web track fades `background-color` at `duration-fast`; a
        // disabled track paints its fixed half-opacity color directly.
        let track: AnyElement = if disabled {
            track.bg(disabled_track_bg).into_any_element()
        } else {
            track
                .with_spring(
                    (self.id.clone(), "track-fill"),
                    SpringAnimation::new(spring_config(motion::DURATION_FAST)).to(if checked {
                        1.0
                    } else {
                        0.0
                    }),
                    move |el, t: f32| el.bg(motion::mix(unchecked_bg, checked_bg, t)),
                )
                .into_any_element()
        };

        let mut root = self
            .base
            .role(Role::Switch)
            .aria_toggled(if checked {
                Toggled::True
            } else {
                Toggled::False
            })
            .when_some(accessibility_label, |this, label| this.aria_label(label))
            // The base switch always stamped its handle `tab_index(0)` +
            // `tab_stop(true)`; `focus_next` skips handles that are not tab
            // stops, so this is what makes the switch tab-reachable.
            .when(!disabled, |this| {
                this.track_focus(&focus_handle.tab_index(0).tab_stop(true))
            })
            .when(disabled, |this| {
                this.on_mouse_down(MouseButton::Left, |_, _, cx| {
                    cx.stop_propagation();
                })
            })
            .when_some(
                (!disabled).then_some(on_click).flatten(),
                |this, on_click| {
                    this.on_click(move |_, window, cx| on_click(&!checked, window, cx))
                },
            )
            .flex()
            .flex_row()
            .gap_2()
            .items_start()
            .text_color(if disabled {
                cx.theme().muted_foreground
            } else {
                cx.theme().foreground
            })
            .child(track);

        if let Some(label) = self.label {
            let mut label_el =
                div()
                    .line_height(track_height)
                    .child(label)
                    .text_color(if disabled {
                        cx.theme().muted_foreground
                    } else {
                        cx.theme().foreground
                    });
            label_el = match self.size {
                Size::XSmall | Size::Small => label_el.text_sm(),
                _ => label_el.text_base(),
            };
            root = root.child(label_el);
        }

        root.style().refine(&self.style);
        root
    }
}

#[cfg(test)]
mod tests {
    use std::cell::Cell;

    use gpui::{
        Context, KeyDownEvent, KeyUpEvent, Keystroke, Modifiers, Render, TestAppContext,
        VisualTestContext, div, point,
    };

    use super::*;

    #[test]
    fn an_explicit_accessibility_label_replaces_the_visible_one() {
        let plain = Switch::new("wifi").label("Wi-Fi");
        assert_eq!(plain.accessibility_label, None);
        assert_eq!(plain.label.as_deref(), Some("Wi-Fi"));

        let named = Switch::new("wifi")
            .label("Wi-Fi")
            .accessibility_label("Toggle Wi-Fi");
        assert_eq!(
            named.accessibility_label.as_deref(),
            Some("Toggle Wi-Fi"),
            "an explicit name must win over the visible label"
        );
        assert_eq!(
            named.label.as_deref(),
            Some("Wi-Fi"),
            "and must not change what is drawn"
        );
    }

    #[test]
    fn track_geometry_matches_the_size_ladder() {
        // Small steps shrink to a 28x16 track with a 12px thumb; the default
        // and large steps stay at 36x20 with a 16px thumb.
        assert_eq!(track_metrics(Size::XSmall), (px(28.), px(16.), px(12.)));
        assert_eq!(track_metrics(Size::Small), (px(28.), px(16.), px(12.)));
        assert_eq!(track_metrics(Size::Medium), (px(36.), px(20.), px(16.)));
        assert_eq!(track_metrics(Size::Large), (px(36.), px(20.), px(16.)));
        assert_eq!(
            track_metrics(Size::Size(px(40.))),
            (px(36.), px(20.), px(16.))
        );
    }

    #[test]
    fn spring_config_is_the_crate_response_at_critical_damping() {
        let (frequency, damping_ratio) = spring_config(motion::DURATION_FAST).canonical();
        assert!((frequency - std::f32::consts::TAU / 0.15).abs() < 1e-3);
        // ζ = 1: the thumb arrives without overshooting past the track edge.
        assert!((damping_ratio - 1.0).abs() < 1e-4);
    }

    struct SwitchHarness {
        disabled: bool,
        toggles: Rc<Cell<usize>>,
        parent_clicks: Rc<Cell<usize>>,
    }

    impl Render for SwitchHarness {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            let toggles = self.toggles.clone();
            let parent_clicks = self.parent_clicks.clone();
            div()
                .id("switch-parent")
                .tab_group()
                .size(px(100.))
                .on_click(move |_, _, _| parent_clicks.set(parent_clicks.get() + 1))
                .child(Switch::new("switch").disabled(self.disabled).on_click(
                    move |checked, _, _| {
                        assert!(*checked);
                        toggles.set(toggles.get() + 1);
                    },
                ))
        }
    }

    fn harness(
        cx: &mut TestAppContext,
        disabled: bool,
    ) -> (&mut VisualTestContext, Rc<Cell<usize>>, Rc<Cell<usize>>) {
        cx.update(crate::init);
        let toggles = Rc::new(Cell::new(0));
        let parent_clicks = Rc::new(Cell::new(0));
        let (_, cx) = cx.add_window_view({
            let toggles = toggles.clone();
            let parent_clicks = parent_clicks.clone();
            move |_, _| SwitchHarness {
                disabled,
                toggles,
                parent_clicks,
            }
        });
        cx.update(|window, cx| window.draw(cx).clear(cx));
        (cx, toggles, parent_clicks)
    }

    fn activate_key(cx: &mut VisualTestContext, key: &str) {
        let keystroke = Keystroke::parse(key).unwrap();
        cx.simulate_event(KeyDownEvent {
            keystroke: keystroke.clone(),
            is_held: false,
            prefer_character_input: false,
        });
        cx.simulate_event(KeyUpEvent { keystroke });
    }

    #[gpui::test]
    fn pointer_activation_fires_once_and_focuses(cx: &mut TestAppContext) {
        let (cx, toggles, _) = harness(cx, false);
        cx.simulate_click(point(px(10.), px(10.)), Modifiers::default());

        assert_eq!(toggles.get(), 1);
        cx.update(|window, cx| assert!(window.focused(cx).is_some()));
    }

    #[gpui::test]
    fn supports_tab_enter_and_space(cx: &mut TestAppContext) {
        let (cx, toggles, _) = harness(cx, false);
        cx.update(|window, cx| window.focus_next(cx));
        cx.update(|window, cx| assert!(window.focused(cx).is_some()));

        activate_key(cx, "enter");
        activate_key(cx, "space");

        assert_eq!(toggles.get(), 2);
    }

    #[gpui::test]
    fn disabled_switch_is_inert_and_blocks_parent(cx: &mut TestAppContext) {
        let (cx, toggles, parent_clicks) = harness(cx, true);
        cx.simulate_click(point(px(10.), px(10.)), Modifiers::default());

        assert_eq!(toggles.get(), 0);
        assert_eq!(parent_clicks.get(), 0);
        cx.update(|window, cx| assert!(window.focused(cx).is_none()));
    }

    struct TestView;

    impl Render for TestView {
        fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .gap_2()
                .child(Switch::new("sw-default").label("Default"))
                .child(Switch::new("sw-checked").checked(true).label("Checked"))
                .child(Switch::new("sw-disabled").disabled(true).label("Disabled"))
                .child(
                    Switch::new("sw-checked-disabled")
                        .checked(true)
                        .disabled(true)
                        .label("Checked and disabled"),
                )
                .child(Switch::new("sw-xs").label("xs").xsmall())
                .child(Switch::new("sw-sm").label("sm").small())
                .child(Switch::new("sw-lg").label("lg").large())
                // Icon-only form, a custom checked color, a tooltip and an
                // instance style override.
                .child(Switch::new("sw-icon").checked(true))
                .child(
                    Switch::new("sw-color")
                        .checked(true)
                        .color(cx.theme().success)
                        .label("Success"),
                )
                .child(Switch::new("sw-tooltip").label("Tooltip").tooltip("Hint"))
                .child(Switch::new("sw-styled").label("Styled").px_4())
        }
    }

    #[gpui::test]
    fn switch_renders_all_variants_without_panic(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| TestView);
    }
}
