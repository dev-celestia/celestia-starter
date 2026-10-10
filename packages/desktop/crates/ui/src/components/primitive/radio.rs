//! Radio — the desktop counterpart of
//! `packages/ui/src/components/primitive/radio-group.tsx`.
//!
//! Written directly on `gpui`. The file used to re-export
//! `gpui_component::radio::Radio`, which wrapped `gpui_base::Radio`'s state
//! machine (and shipped a `RadioGroup` over `gpui_base::RadioGroup`); both
//! machines now live here, and the public surface the shim exposed — the
//! [`Radio`] type with [`Radio::checked`], [`Radio::on_click`],
//! [`Radio::label`], `Sizable`, `Styled`, `ParentElement` and the `From<&str>`
//! conversions — is preserved, alongside [`RadioGroup`], which the showcase
//! reaches through the same module.
//!
//! # The state machines
//!
//! A radio is **controlled** and never deselects itself: activating an
//! unchecked radio reports `true` through [`Radio::on_click`]; an already
//! checked radio registers no click handler at all, so neither pointer nor
//! keyboard activation can fire. Disabled radios likewise register no handler
//! and track no focus, while pointer events still bubble to ancestors (a radio
//! does not shield its row — it is not a wall, unlike the switch).
//!
//! [`RadioGroup`] is a thin container: it stamps each member with a positional
//! element id, its one-based `aria` position and the group's size, drives
//! `checked` from `selected_index`, and forwards clicks as the clicked index.
//! It carries no selection logic of its own — the owner writes the index back.
//!
//! # Decisions worth writing down
//!
//! - **The checked mark is a dot, not a check.** `gpui-component`'s radio drew
//!   its checkbox check glyph inside a filled circle; the web primitive draws a
//!   `primary-foreground` dot at half the box size. This is the desktop
//!   counterpart of the web package, so it draws the dot — centered, snapping
//!   (the web radio has no transition on its indicator, unlike the checkbox).
//! - **Pointer presses do not move focus**, like the checkbox: the crate
//!   follows the HTML rule, and `prevent_default()` on our own mouse-down
//!   handler is what suppresses gpui's click-to-focus listener.
//! - The indicator circle rounds with [`crate::theme`]'s `radius_full`, so a
//!   zero-radius theme squares it off like every other fully-round element.

use std::rc::Rc;

use gpui::{
    AnyElement, App, Axis, Div, ElementId, InteractiveElement, Interactivity, IntoElement,
    MouseButton, Orientation, ParentElement, Refineable as _, RenderOnce, Role, SharedString,
    Stateful, StatefulInteractiveElement, StyleRefinement, Styled, Toggled, Window, div,
    prelude::FluentBuilder as _, relative, rems,
};

use crate::components::primitive::tooltip::Tooltip;
use crate::components::traits::{Sizable, Size, h_flex, v_flex};
use crate::focus_ring::focus_ring;
use crate::theme::ActiveTheme as _;

/// The activation handler — fires with `true`; a radio never reports `false`.
type OnClick = Rc<dyn Fn(&bool, &mut Window, &mut App)>;
/// The group's activation handler — receives the clicked radio's index.
type OnGroupClick = Rc<dyn Fn(&usize, &mut Window, &mut App)>;

/// A Radio element.
///
/// This is not included the Radio group implementation, you can manage the group by yourself.
#[derive(IntoElement)]
pub struct Radio {
    base: Stateful<Div>,
    id: ElementId,
    style: StyleRefinement,
    label: Option<SharedString>,
    /// The announced name, when the visible label is not it.
    accessibility_label: Option<SharedString>,
    children: Vec<AnyElement>,
    checked: bool,
    disabled: bool,
    tab_stop: bool,
    tab_index: isize,
    size: Size,
    on_click: Option<OnClick>,
    tooltip: Option<SharedString>,
    position_in_set: Option<usize>,
    size_of_set: Option<usize>,
    focus_ring_enabled: bool,
}

impl Radio {
    /// Create a new Radio element with the given id.
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
            tab_index: 0,
            tab_stop: true,
            size: Size::default(),
            on_click: None,
            tooltip: None,
            position_in_set: None,
            size_of_set: None,
            focus_ring_enabled: true,
        }
    }

    /// Set tooltip text for the radio.
    pub fn tooltip(mut self, tooltip: impl Into<SharedString>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }

    /// Set the label of the Radio element.
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Set the name a screen reader announces, when the visible label is not
    /// it.
    ///
    /// A radio's name comes from its [`label`](Self::label) by default. Setting
    /// this replaces the announced name without changing what is displayed.
    pub fn accessibility_label(mut self, label: impl Into<SharedString>) -> Self {
        self.accessibility_label = Some(label.into());
        self
    }

    /// Set the checked state of the Radio element, default is `false`.
    pub fn checked(mut self, checked: bool) -> Self {
        self.checked = checked;
        self
    }

    /// Set the disabled state of the Radio element, default is `false`.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Set the tab index for the Radio element, default is `0`.
    pub fn tab_index(mut self, tab_index: isize) -> Self {
        self.tab_index = tab_index;
        self
    }

    /// Set the tab stop for the Radio element, default is `true`.
    pub fn tab_stop(mut self, tab_stop: bool) -> Self {
        self.tab_stop = tab_stop;
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

    /// Draw the focus ring when the radio is focused.
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

    /// Re-point this radio's element identity. [`RadioGroup`] keys its members
    /// by position, so the id a caller built the radio with is replaced. The
    /// `Stateful<Div>` is rebuilt, which drops any raw `InteractiveElement`
    /// interactivity a caller attached — the group owns activation anyway;
    /// the `Styled` refinement rides the separate `style` field and survives.
    fn set_id(&mut self, id: ElementId) {
        self.id = id.clone();
        self.base = div().id(id);
    }
}

impl Sizable for Radio {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Styled for Radio {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl InteractiveElement for Radio {
    fn interactivity(&mut self) -> &mut Interactivity {
        self.base.interactivity()
    }
}

impl StatefulInteractiveElement for Radio {}

impl ParentElement for Radio {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for Radio {
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
        let focus_handle = window
            .use_keyed_state(self.id.clone(), cx, |_, cx| cx.focus_handle())
            .read(cx)
            .clone();
        let is_focused = focus_handle.is_focused(window);
        let accessibility_label = self.accessibility_label.clone().or(self.label.clone());
        let position_in_set = self.position_in_set;
        let size_of_set = self.size_of_set;
        let on_click = self.on_click.clone();
        let children = self.children;

        // Upstream resolves the checked look first and halves both colors when
        // disabled paints last — the same table, spelled out.
        let (border, fill) = match (checked, disabled) {
            (true, false) => (cx.theme().primary, cx.theme().primary),
            (true, true) => (
                cx.theme().primary.opacity(0.5),
                cx.theme().primary.opacity(0.5),
            ),
            (false, false) => (cx.theme().input, cx.theme().input.opacity(0.5)),
            (false, true) => (cx.theme().input.opacity(0.5), cx.theme().input.opacity(0.5)),
        };
        let dot_color = if disabled {
            cx.theme().primary_foreground.opacity(0.5)
        } else {
            cx.theme().primary_foreground
        };

        let indicator = div()
            .relative()
            .size(indicator_size)
            // Center on the first 1.25em line, including when the label wraps.
            .when(has_content, |this| this.mt(indicator_size * 0.125))
            .flex_shrink_0()
            .flex()
            .items_center()
            .justify_center()
            .rounded(cx.theme().radius_full())
            .border_1()
            .border_color(border)
            .bg(fill)
            // The web dot: half the box, `primary-foreground`. It snaps — the
            // web radio's indicator carries no transition.
            .when(checked, |this| {
                this.child(
                    div()
                        .size(indicator_size * 0.5)
                        .rounded_full()
                        .bg(dot_color),
                )
            });

        let mut root = self
            .base
            .role(Role::RadioButton)
            .aria_toggled(if checked {
                Toggled::True
            } else {
                Toggled::False
            })
            // A radio is both "toggled" and "selected"; different assistive
            // technology reads one or the other, so state both rather than
            // making callers choose.
            .aria_selected(checked)
            .when_some(accessibility_label, |this, label| this.aria_label(label))
            .when_some(position_in_set, |this, position| {
                this.aria_position_in_set(position)
            })
            .when_some(size_of_set, |this, size| this.aria_size_of_set(size))
            .when(!disabled, |this| {
                this.track_focus(
                    &focus_handle
                        .tab_index(self.tab_index)
                        .tab_stop(self.tab_stop),
                )
            })
            .on_mouse_down(MouseButton::Left, |_, window, _| {
                // Pointer presses do not move focus, including while disabled.
                window.prevent_default()
            })
            .when_some(
                (!disabled && !checked).then_some(on_click).flatten(),
                |this, on_click| {
                    this.on_click(move |_, window, cx| {
                        window.prevent_default();
                        // A radio cannot deselect itself: the requested value
                        // is always `true`.
                        on_click(&true, window, cx);
                    })
                },
            )
            .flex()
            .flex_row()
            .gap_x_2()
            .items_start()
            .line_height(relative(1.))
            .text_color(if disabled {
                cx.theme().muted_foreground
            } else {
                cx.theme().foreground
            })
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
                    .w_full()
                    .line_height(relative(1.25))
                    .gap_1()
                    .when_some(self.label.clone(), |this, label| {
                        this.child(
                            div()
                                .size_full()
                                .when(disabled, |this| {
                                    this.text_color(cx.theme().muted_foreground)
                                })
                                .child(label),
                        )
                    })
                    .children(children),
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

/// A Radio group element.
#[derive(IntoElement)]
pub struct RadioGroup {
    base: Stateful<Div>,
    style: StyleRefinement,
    radios: Vec<Radio>,
    layout: Axis,
    selected_index: Option<usize>,
    disabled: bool,
    on_click: Option<OnGroupClick>,
}

impl RadioGroup {
    /// Creates a radio group with vertical layout and no selected item.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            base: div().id(id.into()),
            style: StyleRefinement::default(),
            on_click: None,
            layout: Axis::Vertical,
            selected_index: None,
            disabled: false,
            radios: vec![],
        }
    }

    /// Create a new Radio group with default Vertical layout.
    pub fn vertical(id: impl Into<ElementId>) -> Self {
        Self::new(id)
    }

    /// Create a new Radio group with Horizontal layout.
    pub fn horizontal(id: impl Into<ElementId>) -> Self {
        Self::new(id).layout(Axis::Horizontal)
    }

    /// Set the layout of the Radio group. Default is `Axis::Vertical`.
    pub fn layout(mut self, layout: Axis) -> Self {
        self.layout = layout;
        self
    }

    /// Alias for [`Self::on_change`]. The last callback registered with either name wins.
    pub fn on_click(self, handler: impl Fn(&usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_change(handler)
    }

    /// Handle a requested selected index from pointer or keyboard activation.
    ///
    /// This is a controlled value: the owner must write the requested value and
    /// call `cx.notify()` to render it. Disabled controls do not call the handler.
    /// This and [`Self::on_click`] share one callback; chaining them replaces
    /// the previous handler instead of calling both.
    pub fn on_change(mut self, handler: impl Fn(&usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }

    /// Set the selected index.
    pub fn selected_index(mut self, index: Option<usize>) -> Self {
        self.selected_index = index;
        self
    }

    /// Set the disabled state.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Add a child Radio element.
    pub fn child(mut self, child: impl Into<Radio>) -> Self {
        self.radios.push(child.into());
        self
    }

    /// Add multiple child Radio elements.
    pub fn children(mut self, children: impl IntoIterator<Item = impl Into<Radio>>) -> Self {
        self.radios.extend(children.into_iter().map(Into::into));
        self
    }
}

impl Styled for RadioGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl From<&'static str> for Radio {
    fn from(label: &'static str) -> Self {
        Self::new(label).label(label)
    }
}

impl From<SharedString> for Radio {
    fn from(label: SharedString) -> Self {
        Self::new(label.clone()).label(label)
    }
}

impl From<String> for Radio {
    fn from(label: String) -> Self {
        Self::new(SharedString::from(label.clone())).label(SharedString::from(label))
    }
}

impl RenderOnce for RadioGroup {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let on_click = self.on_click;
        let disabled = self.disabled;
        let selected_ix = self.selected_index;

        // `Axis::is_vertical` lives on gpui-base's `AxisExt`, which this file
        // no longer names — match instead.
        let base = if matches!(self.layout, Axis::Vertical) {
            v_flex()
        } else {
            h_flex().w_full().flex_wrap()
        };

        let total = self.radios.len();
        let mut group = self
            .base
            .role(Role::RadioGroup)
            .aria_orientation(match self.layout {
                Axis::Horizontal => Orientation::Horizontal,
                Axis::Vertical => Orientation::Vertical,
            })
            .flex_1()
            .child(
                base.gap_3()
                    .children(self.radios.into_iter().enumerate().map(|(ix, mut radio)| {
                        let checked = selected_ix == Some(ix);

                        radio.set_id(ix.into());
                        radio.position_in_set = Some(ix + 1);
                        radio.size_of_set = Some(total);
                        radio = radio.disabled(disabled).checked(checked);
                        radio.on_click = on_click.clone().map(|group_click| -> OnClick {
                            Rc::new(move |_: &bool, window, cx| group_click(&ix, window, cx))
                        });
                        radio
                    })),
            );
        group.style().refine(&self.style);
        group
    }
}

#[cfg(test)]
mod tests {
    use std::cell::Cell;

    use gpui::{
        Context, KeyDownEvent, KeyUpEvent, Keystroke, Modifiers, Render, TestAppContext,
        VisualTestContext, div, point, px,
    };

    use super::*;

    #[test]
    fn an_explicit_accessibility_label_replaces_the_visible_one() {
        let plain = Radio::new("automatic").label("Automatic");
        assert_eq!(plain.accessibility_label, None);
        assert_eq!(plain.label.as_deref(), Some("Automatic"));

        let named = Radio::new("automatic")
            .label("Automatic")
            .accessibility_label("Choose automatic mode");
        assert_eq!(
            named.accessibility_label.as_deref(),
            Some("Choose automatic mode"),
            "an explicit name must win over the visible label"
        );
        assert_eq!(
            named.label.as_deref(),
            Some("Automatic"),
            "and must not change what is drawn"
        );
    }

    struct RadioHarness {
        checked: bool,
        disabled: bool,
        changes: Rc<Cell<usize>>,
    }

    impl Render for RadioHarness {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            let changes = self.changes.clone();
            div().id("radio-parent").tab_group().size(px(100.)).child(
                Radio::new("radio")
                    .checked(self.checked)
                    .disabled(self.disabled)
                    .size(px(100.))
                    .on_click(move |checked, _, _| {
                        assert!(*checked);
                        changes.set(changes.get() + 1);
                    }),
            )
        }
    }

    fn harness(
        cx: &mut TestAppContext,
        checked: bool,
        disabled: bool,
    ) -> (&mut VisualTestContext, Rc<Cell<usize>>) {
        cx.update(crate::init);
        let changes = Rc::new(Cell::new(0));
        let (_, cx) = cx.add_window_view({
            let changes = changes.clone();
            move |_, _| RadioHarness {
                checked,
                disabled,
                changes,
            }
        });
        cx.update(|window, cx| window.draw(cx).clear(cx));
        (cx, changes)
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
    fn pointer_and_keyboard_activation_fire_once(cx: &mut TestAppContext) {
        let (cx, changes) = harness(cx, false, false);
        cx.simulate_click(point(px(10.), px(10.)), Modifiers::default());
        assert_eq!(changes.get(), 1);

        // A radio does not take focus from a pointer press; tab to it first.
        cx.update(|window, cx| window.focus_next(cx));
        activate_key(cx, "enter");
        activate_key(cx, "space");

        assert_eq!(changes.get(), 3);
    }

    #[gpui::test]
    fn checked_and_disabled_radios_are_inert(cx: &mut TestAppContext) {
        for (checked, disabled) in [(true, false), (false, true)] {
            let (cx, changes) = harness(cx, checked, disabled);
            cx.simulate_click(point(px(10.), px(10.)), Modifiers::default());
            cx.update(|window, cx| window.focus_next(cx));
            activate_key(cx, "enter");
            activate_key(cx, "space");
            assert_eq!(changes.get(), 0, "checked: {checked}, disabled: {disabled}");
        }
    }

    struct RadioGroupHarness {
        selection: Rc<Cell<Option<usize>>>,
    }

    impl Render for RadioGroupHarness {
        fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
            let selection = self.selection.clone();
            let handle = cx.entity();
            RadioGroup::new("group")
                .selected_index(self.selection.get())
                .on_click(move |ix, _, cx| {
                    // The group is controlled: write the index back and
                    // re-render so the clicked radio becomes the checked one.
                    selection.set(Some(*ix));
                    handle.update(cx, |_, cx| cx.notify());
                })
                .child(Radio::new("automatic").h_8().label("Automatic"))
                .child(Radio::new("manual").h_8().label("Manual"))
        }
    }

    #[gpui::test]
    fn group_reports_the_clicked_index(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let selection = Rc::new(Cell::new(None));
        let (_, cx) = cx.add_window_view({
            let selection = selection.clone();
            move |_, _| RadioGroupHarness { selection }
        });
        cx.update(|window, cx| window.draw(cx).clear(cx));

        // The second radio sits below the first (32px tall, 12px gap).
        cx.simulate_click(point(px(10.), px(60.)), Modifiers::default());
        assert_eq!(selection.get(), Some(1));
        // Activating the same radio again is a no-op: it is checked now, and a
        // radio never deselects itself.
        cx.simulate_click(point(px(10.), px(60.)), Modifiers::default());
        assert_eq!(selection.get(), Some(1));
    }

    struct TestView;

    impl Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .gap_2()
                .child(Radio::new("rd-solo").checked(true).label("Weekly"))
                .child(Radio::new("rd-disabled").disabled(true).label("Daily"))
                .child(Radio::new("rd-xs").label("xs").xsmall())
                .child(Radio::new("rd-lg").label("lg").large())
                .child(
                    Radio::new("rd-content")
                        .label("Plan")
                        .child(div().child("Details")),
                )
                .child(Radio::new("rd-tooltip").label("Tooltip").tooltip("Hint"))
                .child(
                    RadioGroup::new("rg-vertical")
                        .selected_index(Some(1))
                        .child("Automatic")
                        .child("Manual"),
                )
                .child(
                    RadioGroup::horizontal("rg-horizontal")
                        .disabled(true)
                        .children(["One", "Two", "Three"]),
                )
                .child(
                    RadioGroup::new("rg-empty")
                        .selected_index(None)
                        .child(Radio::new("string-id").label("From a String")),
                )
        }
    }

    #[gpui::test]
    fn radio_renders_all_variants_without_panic(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| TestView);
    }
}
