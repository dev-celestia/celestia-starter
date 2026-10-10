//! Checkbox — the desktop counterpart of
//! `packages/ui/src/components/primitive/checkbox.tsx`.
//!
//! Written directly on `gpui`. The file used to re-export
//! `gpui_component::checkbox::Checkbox`, which wrapped `gpui_base::Checkbox`'s
//! state machine; that machine now lives here, and everything the shim exposed
//! is preserved: the [`Checkbox`] type, its constructors and builders
//! ([`Checkbox::checked`], [`Checkbox::on_click`], [`Checkbox::label`], …), and
//! the same trait set (`Sizable`, `Disableable`, `Selectable`, `Styled`,
//! `ParentElement`, `InteractiveElement`).
//!
//! # The state machine
//!
//! The checked value is **controlled**: activation never mutates anything — it
//! reports the *requested* next value (`!checked` at render time) through
//! [`Checkbox::on_click`], and the owner writes it back and notifies. Pointer
//! and keyboard activation both funnel through the div's `on_click`, which raw
//! gpui natively synthesizes from Enter/Space key ups on a focused element, so
//! both fire exactly once per activation. Disabled controls register no click
//! handler and track no focus, which makes them inert by construction while
//! letting pointer events bubble to ancestors.
//!
//! # Decisions worth writing down
//!
//! - **Pointer presses do not move focus.** The base control prevented the
//!   default on mouse down — the same rule HTML checkboxes follow — so clicking
//!   a checkbox inside a form never steals the tab order. Because gpui's
//!   click-to-focus listener is registered *before* user mouse-down listeners
//!   (and bubble dispatch runs them in reverse), `prevent_default()` on our own
//!   mouse-down handler is what suppresses it.
//! - **The check mark fades, it does not unmount.** The glyph's opacity is a
//!   keyed spring ([`motion::DURATION_FAST`], critical damping — the web's
//!   `transition-[…opacity] duration-fast` on the indicator). Keeping the path
//!   mounted while the spring drains is what makes the fade-*out* visible; the
//!   upstream note on exactly this trap is why the guard is `opacity > 0`
//!   rather than `checked`.
//! - **The indicator's fill and border blend on the same 150ms spring** (the
//!   web transitions `background-color,border-color` at `duration-fast`),
//!   blending with [`motion::mix`]. Disabled swaps the blend for the static
//!   half-opacity colors, matching upstream's state-style precedence (disabled
//!   paints last, so it wins).
//! - **The mark is Phosphor Bold.** Web draws a lucide `Check` at 2px stroke —
//!   at the 8-14px sizes the box uses, Phosphor Regular renders hairline-thin,
//!   while Bold matches the web's effective stroke weight.
//! - **Web's `active:scale-[0.92]` press squeeze is omitted**: gpui has no
//!   transform on divs (only on text and SVG), and a fake scale via geometry
//!   would reflow the row.
//! - The check mark is centered in the box (web's `place-content-center`);
//!   `gpui-component`'s absolute top/left 1px inset relied on its own icon set's
//!   internal padding.

use std::rc::Rc;
use std::time::Duration;

use gpui::{
    AnimationExt as _, AnyElement, App, Div, ElementId, InteractiveElement, Interactivity,
    IntoElement, MouseButton, ParentElement, Refineable as _, RenderOnce, Role, SharedString,
    SpringAnimation, SpringConfig, Stateful, StatefulInteractiveElement, StyleRefinement, Styled,
    Toggled, Window, div, prelude::FluentBuilder as _, px, relative, rems, svg,
};

use crate::components::primitive::icon::{PhosphorIcon, PhosphorWeight};
use crate::components::primitive::tooltip::Tooltip;
use crate::components::traits::{Disableable, Selectable, Sizable, Size, v_flex};
use crate::focus_ring::focus_ring;
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

/// A checkbox element.
#[derive(IntoElement)]
pub struct Checkbox {
    base: Stateful<Div>,
    id: ElementId,
    style: StyleRefinement,
    label: Option<SharedString>,
    /// The announced name, when the visible label is not it.
    accessibility_label: Option<SharedString>,
    children: Vec<AnyElement>,
    checked: bool,
    disabled: bool,
    size: Size,
    tab_stop: bool,
    tab_index: isize,
    on_click: Option<OnClick>,
    /// The accessibility role, defaulting to `Role::CheckBox`. The raw-gpui
    /// counterpart of upstream's `RoleOverride` (which could also suppress the
    /// role entirely — with gpui's `.role()` a caller passes any role).
    role: Option<Role>,
    tooltip: Option<SharedString>,
    focus_ring_enabled: bool,
}

impl Checkbox {
    /// Create a new Checkbox with the given id.
    pub fn new(id: impl Into<ElementId>) -> Self {
        let id = id.into();
        Self {
            base: div().id(id.clone()),
            id,
            style: StyleRefinement::default(),
            label: None,
            accessibility_label: None,
            children: Vec::new(),
            checked: false,
            disabled: false,
            size: Size::default(),
            on_click: None,
            tab_stop: true,
            tab_index: 0,
            role: None,
            tooltip: None,
            focus_ring_enabled: true,
        }
    }

    /// Override the accessibility role (default [`Role::CheckBox`]).
    pub fn role(mut self, role: impl Into<Role>) -> Self {
        self.role = Some(role.into());
        self
    }

    /// Set tooltip text for the checkbox.
    pub fn tooltip(mut self, tooltip: impl Into<SharedString>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }

    /// Set the label for the checkbox.
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Set the name a screen reader announces, overriding the visible label.
    ///
    /// This does not change the label drawn on screen.
    pub fn accessibility_label(mut self, label: impl Into<SharedString>) -> Self {
        self.accessibility_label = Some(label.into());
        self
    }

    /// Set the checked state for the checkbox.
    pub fn checked(mut self, checked: bool) -> Self {
        self.checked = checked;
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

    /// Set the tab stop for the checkbox, default is true.
    pub fn tab_stop(mut self, tab_stop: bool) -> Self {
        self.tab_stop = tab_stop;
        self
    }

    /// Set the tab index for the checkbox, default is 0.
    pub fn tab_index(mut self, tab_index: isize) -> Self {
        self.tab_index = tab_index;
        self
    }

    /// Draw the focus ring when the checkbox is focused.
    ///
    /// Upstream exposed this through `gpui_component`'s `FocusableExt` trait;
    /// with that layer gone it is an inherent builder with the same shape.
    pub fn focus_ring(mut self, enabled: bool) -> Self {
        self.focus_ring_enabled = enabled;
        self
    }

    /// Whether the focus ring draws when focused. See [`Self::focus_ring`].
    pub fn is_focus_ring_enabled(&self) -> bool {
        self.focus_ring_enabled
    }
}

impl InteractiveElement for Checkbox {
    fn interactivity(&mut self) -> &mut Interactivity {
        self.base.interactivity()
    }
}
impl StatefulInteractiveElement for Checkbox {}

impl Styled for Checkbox {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl Disableable for Checkbox {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Selectable for Checkbox {
    fn selected(self, selected: bool) -> Self {
        self.checked(selected)
    }

    fn is_selected(&self) -> bool {
        self.checked
    }
}

impl ParentElement for Checkbox {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Sizable for Checkbox {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

/// Size of the check-mark glyph for one size step. One rung below the box
/// ladder, matching `gpui-component`'s `size_2`…`size_3p5` svg ladder.
fn mark_size(size: Size) -> gpui::Pixels {
    match size {
        Size::XSmall => px(8.),
        Size::Small => px(10.),
        Size::Large => px(14.),
        _ => px(12.),
    }
}

impl RenderOnce for Checkbox {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let checked = self.checked;
        let disabled = self.disabled;
        let has_content = self.label.is_some() || !self.children.is_empty();
        let indicator_size = rems(match self.size {
            Size::XSmall => 0.75,
            Size::Small => 0.875,
            Size::Large => 1.125,
            _ => 1.0,
        });
        let mark_px = mark_size(self.size);

        let focus_handle = window
            .use_keyed_state(self.id.clone(), cx, |_, cx| cx.focus_handle())
            .read(cx)
            .clone();
        let is_focused = focus_handle.is_focused(window);

        let unchecked_border = cx.theme().input;
        let checked_color = cx.theme().primary;
        let unchecked_fill = cx.theme().input_background();
        // Upstream resolves `checked` styles first and `disabled` last, so the
        // disabled colors win where both apply — the same table, spelled out.
        let (border, fill, mark_color, text_color) = match (checked, disabled) {
            (true, false) => (
                checked_color,
                checked_color,
                cx.theme().primary_foreground,
                cx.theme().foreground,
            ),
            (true, true) => (
                checked_color.opacity(0.5),
                checked_color.opacity(0.5),
                cx.theme().primary_foreground.opacity(0.5),
                cx.theme().muted_foreground,
            ),
            (false, true) => (
                unchecked_border.opacity(0.5),
                unchecked_fill,
                cx.theme().primary_foreground.opacity(0.5),
                cx.theme().muted_foreground,
            ),
            (false, false) => (
                unchecked_border,
                unchecked_fill,
                cx.theme().primary_foreground,
                cx.theme().foreground,
            ),
        };
        let radius = cx.theme().radius.min(px(4.));

        // The mark keeps its path while the spring is still fading it out —
        // see the module docs.
        let mark = svg()
            .path(PhosphorWeight::Bold.path(PhosphorIcon::Check))
            .size(mark_px)
            .flex_shrink_0()
            .text_color(mark_color)
            .with_spring(
                (self.id.clone(), "mark"),
                SpringAnimation::new(spring_config(motion::DURATION_FAST)).to(if checked {
                    1.0
                } else {
                    0.0
                }),
                |mark, opacity: f32| mark.opacity(opacity.clamp(0.0, 1.0)),
            );

        let indicator = div()
            .relative()
            .size(indicator_size)
            // Center on the first 1.25em line, including when the label wraps.
            .when(has_content, |this| this.mt(indicator_size * 0.125))
            .flex_shrink_0()
            .flex()
            .items_center()
            .justify_center()
            .border_1()
            .rounded(radius)
            .child(mark);
        // Enabled, the fill and border blend toward the checked look on the
        // design system's fast spring; disabled paints the static half-opacity
        // colors directly (nothing to blend toward — the state is fixed).
        let indicator: AnyElement = if disabled {
            indicator.bg(fill).border_color(border).into_any_element()
        } else {
            indicator
                .with_spring(
                    (self.id.clone(), "fill"),
                    SpringAnimation::new(spring_config(motion::DURATION_FAST)).to(if checked {
                        1.0
                    } else {
                        0.0
                    }),
                    move |el, t: f32| {
                        el.bg(motion::mix(unchecked_fill, checked_color, t))
                            .border_color(motion::mix(unchecked_border, checked_color, t))
                    },
                )
                .into_any_element()
        };

        let accessibility_label = self.accessibility_label.clone().or(self.label.clone());
        let on_click = self.on_click.clone();
        let label_color = text_color;

        let mut root = self
            .base
            .role(self.role.unwrap_or(Role::CheckBox))
            .aria_toggled(if checked {
                Toggled::True
            } else {
                Toggled::False
            })
            .when_some(accessibility_label, |this, label| this.aria_label(label))
            .when(!disabled, |this| {
                this.track_focus(
                    &focus_handle
                        .tab_index(self.tab_index)
                        .tab_stop(self.tab_stop),
                )
            })
            .on_mouse_down(MouseButton::Left, |_, window, _| {
                // Preserve the legacy Checkbox behavior: pointer presses do
                // not move focus, including while disabled.
                window.prevent_default();
            })
            .when_some(
                (!disabled).then_some(on_click).flatten(),
                |this, on_click| {
                    this.on_click(move |_, window, cx| {
                        window.prevent_default();
                        on_click(&!checked, window, cx);
                    })
                },
            )
            .flex()
            .flex_row()
            .gap_2()
            .items_start()
            .line_height(relative(1.))
            .text_color(text_color)
            .rounded(cx.theme().radius * 0.5)
            .child(indicator);

        root = match self.size {
            Size::XSmall => root.text_xs(),
            Size::Small => root.text_sm(),
            Size::Large => root.text_lg(),
            _ => root,
        };

        if has_content {
            root = root.child(
                v_flex()
                    .flex_1()
                    .overflow_hidden()
                    .line_height(relative(1.25))
                    .gap_1()
                    .when_some(self.label.clone(), |this, label| {
                        this.child(div().size_full().text_color(label_color).child(label))
                    })
                    .children(self.children),
            );
        }

        if let Some(tooltip) = self.tooltip {
            root = root.tooltip(move |window, cx| Tooltip::new(tooltip.clone()).build(window, cx));
        }

        // The instance style lands before the ring so the ring hugs whatever
        // border and radius the caller ended up with.
        root.style().refine(&self.style);

        if is_focused && self.focus_ring_enabled {
            root = focus_ring(root, window, cx);
        }

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
        let plain = Checkbox::new("remember").label("Remember me");
        assert_eq!(plain.accessibility_label, None);
        assert_eq!(plain.label.as_deref(), Some("Remember me"));

        let named = Checkbox::new("remember")
            .label("Remember me")
            .accessibility_label("Remember this account");
        assert_eq!(
            named.accessibility_label.as_deref(),
            Some("Remember this account"),
            "an explicit name must win over the visible label"
        );
        assert_eq!(
            named.label.as_deref(),
            Some("Remember me"),
            "and must not change what is drawn"
        );
    }

    #[test]
    fn mark_size_stays_one_rung_below_the_box_ladder() {
        assert_eq!(mark_size(Size::XSmall), px(8.));
        assert_eq!(mark_size(Size::Small), px(10.));
        assert_eq!(mark_size(Size::Medium), px(12.));
        assert_eq!(mark_size(Size::Large), px(14.));
        // The pixel override uses the default box's mark.
        assert_eq!(mark_size(Size::Size(px(20.))), px(12.));
    }

    #[test]
    fn spring_config_is_the_crate_response_at_critical_damping() {
        let (frequency, damping_ratio) = spring_config(motion::DURATION_FAST).canonical();
        assert!((frequency - std::f32::consts::TAU / 0.15).abs() < 1e-3);
        // ζ = 1: the mark and fill fade never overshoot into an unchecked look.
        assert!((damping_ratio - 1.0).abs() < 1e-4);
    }

    struct CheckboxHarness {
        disabled: bool,
        clicks: Rc<Cell<usize>>,
        parent_clicks: Rc<Cell<usize>>,
    }

    impl Render for CheckboxHarness {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            let clicks = self.clicks.clone();
            let parent_clicks = self.parent_clicks.clone();
            div()
                .id("checkbox-parent")
                .tab_group()
                .size(px(100.))
                .on_click(move |_, _, _| parent_clicks.set(parent_clicks.get() + 1))
                .child(
                    Checkbox::new("checkbox")
                        .disabled(self.disabled)
                        .size_full()
                        .on_click(move |checked, _, _| {
                            assert!(*checked);
                            clicks.set(clicks.get() + 1);
                        }),
                )
        }
    }

    fn harness(
        cx: &mut TestAppContext,
        disabled: bool,
    ) -> (&mut VisualTestContext, Rc<Cell<usize>>, Rc<Cell<usize>>) {
        cx.update(crate::init);
        let clicks = Rc::new(Cell::new(0));
        let parent_clicks = Rc::new(Cell::new(0));
        let (_, cx) = cx.add_window_view({
            let clicks = clicks.clone();
            let parent_clicks = parent_clicks.clone();
            move |_, _| CheckboxHarness {
                disabled,
                clicks,
                parent_clicks,
            }
        });
        cx.update(|window, cx| window.draw(cx).clear(cx));
        (cx, clicks, parent_clicks)
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
    fn pointer_activation_fires_once_without_moving_focus(cx: &mut TestAppContext) {
        let (cx, clicks, _) = harness(cx, false);
        cx.simulate_click(point(px(10.), px(10.)), Modifiers::default());

        assert_eq!(clicks.get(), 1);
        cx.update(|window, cx| assert!(window.focused(cx).is_none()));
    }

    #[gpui::test]
    fn supports_tab_enter_and_space(cx: &mut TestAppContext) {
        let (cx, clicks, _) = harness(cx, false);
        cx.update(|window, cx| window.focus_next(cx));
        cx.update(|window, cx| assert!(window.focused(cx).is_some()));

        activate_key(cx, "enter");
        activate_key(cx, "space");

        assert_eq!(clicks.get(), 2);
    }

    #[gpui::test]
    fn disabled_is_inert_and_pointer_activation_bubbles(cx: &mut TestAppContext) {
        let (cx, clicks, parent_clicks) = harness(cx, true);
        cx.simulate_click(point(px(10.), px(10.)), Modifiers::default());

        assert_eq!(clicks.get(), 0);
        assert_eq!(parent_clicks.get(), 1);
        cx.update(|window, cx| assert!(window.focused(cx).is_none()));
    }

    struct TestView;

    impl Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .gap_2()
                .child(Checkbox::new("cb-default").label("Default"))
                .child(Checkbox::new("cb-checked").checked(true).label("Checked"))
                .child(
                    Checkbox::new("cb-disabled")
                        .disabled(true)
                        .label("Disabled"),
                )
                .child(
                    Checkbox::new("cb-checked-disabled")
                        .checked(true)
                        .disabled(true)
                        .label("Checked and disabled"),
                )
                // Every size step, plus the icon-only form.
                .child(Checkbox::new("cb-xs").label("xs").xsmall())
                .child(Checkbox::new("cb-sm").label("sm").small())
                .child(Checkbox::new("cb-lg").label("lg").large())
                .child(Checkbox::new("cb-icon").checked(true))
                // Custom content below the label, a tooltip, and the
                // `Selectable` alias for the checked state.
                .child(
                    Checkbox::new("cb-content")
                        .label("Remember me")
                        .child(div().child("Additional detail")),
                )
                .child(Checkbox::new("cb-tooltip").label("Tooltip").tooltip("Hint"))
                .child(
                    Checkbox::new("cb-selected")
                        .selected(true)
                        .label("Selected"),
                )
                .child(
                    Checkbox::new("cb-roles")
                        .role(Role::Button)
                        .focus_ring(false)
                        .tab_stop(false)
                        .label("Knobs"),
                )
        }
    }

    #[gpui::test]
    fn checkbox_renders_all_variants_without_panic(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| TestView);
    }
}
