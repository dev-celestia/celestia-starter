//! Stepper — a step-by-step progress indicator for walking a user through a
//! series of stages (a wizard's "1 → 2 → 3" rail). No web counterpart in
//! `packages/ui`; this is a port of `gpui-component` 0.6.6's `stepper` family
//! (`stepper.rs` + `stepper/item.rs` + `stepper/trigger.rs`) onto raw gpui.
//!
//! Parity with upstream, and the deliberate departures:
//!
//! - **Public API is the shim's.** [`Stepper`] and [`StepperItem`] keep their
//!   names, constructors, builder methods and trait impls (`Sizable`,
//!   `Styled`, `ParentElement` for items). The one signature change is
//!   [`StepperItem::icon`], which takes any element (use a
//!   [`PhosphorIcon`](crate::components::primitive::icon::PhosphorIcon)) —
//!   upstream took `gpui-component`'s `Icon`, which no longer exists here.
//! - **Icons.** Upstream's catalog-independent `Icon` becomes a bare element
//!   slot inside the round indicator. The slot carries the indicator's pixel
//!   size as its text size, so a bare `PhosphorIcon` fills the circle — the
//!   same wrapper trick [`crate::components::primitive::button`] uses for its
//!   icon slots, since GPUI has no descendant styling.
//! - **Colors** come from `cx.theme()` — including
//!   [`crate::theme::ActiveTheme`]'s flat `secondary_hover` / `secondary_active`
//!   steps for the not-yet-reached indicator.
//! - **`test_support()` is dropped.** Upstream registered each item and
//!   trigger with `gpui-base`'s test-observation registry; the crate has no
//!   equivalent and the accessibility roles (`ListItem`,
//!   `aria_position_in_set`) carry the same facts.
//! - **One upstream geometry bug is fixed:** in the vertical + `text_center`
//!   layout the separator used horizontal margins (`mx`) where the horizontal
//!   layout's mirrored branch uses vertical ones — a copy-paste slip that put
//!   a vertical rail's connector off-center horizontally. The port writes
//!   `my`, matching the horizontal branch's symmetry.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Axis, ClickEvent, ElementId, Half as _, InteractiveElement as _, IntoElement,
    ParentElement, Pixels, Refineable as _, RenderOnce, Role, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px, relative,
};

use crate::components::traits::{Sizable, Size, h_flex, v_flex};
use crate::theme::ActiveTheme as _;

/// A step-by-step progress for users to navigate through a series of steps or
/// stages. Build with [`Stepper::new`], push [`StepperItem`]s, and hand the
/// selected step to [`Stepper::on_click`] to move between them.
#[derive(IntoElement)]
pub struct Stepper {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<StepperItem>,
    step: usize,
    layout: Axis,
    disabled: bool,
    size: Size,
    text_center: bool,
    on_click: Rc<dyn Fn(&usize, &mut Window, &mut App) + 'static>,
}

impl Stepper {
    /// Creates a new stepper with the given ID.
    ///
    /// Default use is horizontal layout with step 0 selected.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            items: Vec::new(),
            step: 0,
            layout: Axis::Horizontal,
            disabled: false,
            size: Size::default(),
            text_center: false,
            on_click: Rc::new(|_, _, _| {}),
        }
    }

    /// Set whether to center the text within each stepper item.
    pub fn text_center(mut self, center: bool) -> Self {
        self.text_center = center;
        self
    }

    /// Set the layout of the stepper, default is horizontal.
    pub fn layout(mut self, layout: Axis) -> Self {
        self.layout = layout;
        self
    }

    /// Sets the layout of the stepper to Vertical.
    pub fn vertical(mut self) -> Self {
        self.layout = Axis::Vertical;
        self
    }

    /// Sets the selected index of the stepper, default is 0.
    pub fn selected_index(mut self, index: usize) -> Self {
        self.step = index;
        self
    }

    /// Adds a stepper item to the stepper.
    pub fn item(mut self, item: StepperItem) -> Self {
        self.items.push(item);
        self
    }

    /// Add multiple stepper items to the stepper.
    pub fn items(mut self, items: impl IntoIterator<Item = StepperItem>) -> Self {
        self.items.extend(items);
        self
    }

    /// Set the disabled state of the stepper, default is false.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Add an on_click handler for when a step is clicked.
    ///
    /// The first parameter is the `step` of currently clicked item.
    pub fn on_click<F>(mut self, f: F) -> Self
    where
        F: Fn(&usize, &mut Window, &mut App) + 'static,
    {
        self.on_click = Rc::new(f);
        self
    }
}

impl Sizable for Stepper {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Styled for Stepper {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Stepper {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let total_items = self.items.len();
        // `h_flex()` centers on the cross axis; the vertical rail is the plain
        // `v_flex()` — the same contracts the crate traits own.
        let layout = match self.layout {
            Axis::Horizontal => h_flex(),
            Axis::Vertical => v_flex(),
        };
        let mut root =
            layout
                .id(self.id)
                .w_full()
                .children(self.items.into_iter().enumerate().map(|(step, item)| {
                    let is_last = step + 1 == total_items;
                    item.step(step)
                        .with_size(self.size)
                        .checked_step(self.step)
                        .layout(self.layout)
                        .text_center(self.text_center)
                        .when(self.disabled, |this| this.disabled(true))
                        .is_last(is_last)
                        .on_click({
                            let on_click = self.on_click.clone();
                            move |_, window, cx| {
                                on_click(&step, window, cx);
                            }
                        })
                }));
        root.style().refine(&self.style);
        root
    }
}

/// A step item within a [`Stepper`].
///
/// Upstream's `pub(super)` setters (`step`, `checked_step`, `layout`, …) are
/// how the parent [`Stepper`] drives its items; they stay crate-private here
/// too, so a caller's items describe only *content* (label children, optional
/// icon, disabled flag) while position and progress come from the stepper.
#[derive(IntoElement)]
pub struct StepperItem {
    step: usize,
    checked_step: usize,
    style: StyleRefinement,
    icon: Option<AnyElement>,
    children: Vec<AnyElement>,
    layout: Axis,
    disabled: bool,
    size: Size,
    is_last: bool,
    text_center: bool,
    on_click: Box<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>,
}

impl StepperItem {
    pub fn new() -> Self {
        Self {
            step: 0,
            checked_step: 0,
            style: StyleRefinement::default(),
            icon: None,
            layout: Axis::Horizontal,
            disabled: false,
            size: Size::default(),
            is_last: false,
            text_center: false,
            children: Vec::new(),
            on_click: Box::new(|_, _, _| {}),
        }
    }

    /// Set the icon of the stepper item.
    ///
    /// A bare [`crate::components::primitive::icon::PhosphorIcon`] renders at
    /// the indicator's size and inherits its text color; an element carrying
    /// its own explicit size keeps it.
    pub fn icon(mut self, icon: impl IntoElement) -> Self {
        self.icon = Some(icon.into_any_element());
        self
    }

    /// Set disabled state of the stepper item.
    ///
    /// Will override the stepper's disabled state if set to true.
    ///
    /// Default is false.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    fn text_center(mut self, center: bool) -> Self {
        self.text_center = center;
        self
    }

    fn step(mut self, ix: usize) -> Self {
        self.step = ix;
        self
    }

    fn checked_step(mut self, checked_step: usize) -> Self {
        self.checked_step = checked_step;
        self
    }

    fn layout(mut self, layout: Axis) -> Self {
        self.layout = layout;
        self
    }

    fn is_last(mut self, is_last: bool) -> Self {
        self.is_last = is_last;
        self
    }

    fn on_click<F>(mut self, f: F) -> Self
    where
        F: Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    {
        self.on_click = Box::new(f);
        self
    }
}

impl ParentElement for StepperItem {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Sizable for StepperItem {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Styled for StepperItem {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

/// The icon ladder for the round indicator, keyed off the item's size step.
fn indicator_icon_size(size: Size) -> Pixels {
    match size {
        Size::XSmall => px(8.),
        Size::Small => px(18.),
        Size::Large => px(32.),
        _ => px(24.),
    }
}

/// The connector's thickness ladder (`separator_wide` upstream).
fn separator_wide(size: Size) -> Pixels {
    match size {
        Size::XSmall => px(1.5),
        Size::Large => px(3.),
        _ => px(2.),
    }
}

/// Whether the trigger shows as reached (this step or any before it).
fn is_checked(step: usize, checked_step: usize) -> bool {
    step <= checked_step
}

/// Whether the connector after this item has already been crossed.
fn is_passed(step: usize, checked_step: usize) -> bool {
    step < checked_step
}

impl RenderOnce for StepperItem {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let passed = is_passed(self.step, self.checked_step);
        let icon_size = indicator_icon_size(self.size);

        let layout = match self.layout {
            Axis::Horizontal => h_flex(),
            Axis::Vertical => v_flex(),
        };
        let mut item_root = layout
            .id(("stepper-item", self.step))
            .role(Role::ListItem)
            .aria_position_in_set(self.step + 1)
            .relative()
            .when(!self.is_last, |this| this.flex_1())
            .when(self.text_center, |this| this.flex_1().justify_center())
            // Upstream overrides `h_flex()`'s cross-axis centering: the label
            // block hugs the top of the row so a two-line label does not
            // re-center the indicator.
            .items_start()
            .child(
                StepperTrigger::new()
                    .icon(self.icon)
                    .icon_size(icon_size)
                    .step(self.step)
                    .with_size(self.size)
                    .checked_step(self.checked_step)
                    .text_center(self.text_center)
                    .layout(self.layout)
                    .disabled(self.disabled)
                    .children(self.children)
                    .on_click({
                        let on_click = self.on_click;
                        move |event, window, cx| {
                            on_click(event, window, cx);
                        }
                    }),
            )
            .when(!self.is_last, |this| {
                this.child(
                    StepperSeparator::new()
                        .with_size(self.size)
                        .layout(self.layout)
                        .text_center(self.text_center)
                        .icon_size(icon_size)
                        .checked(passed),
                )
            });
        item_root.style().refine(&self.style);
        item_root
    }
}

/// The trigger part of a stepper item — the round numbered (or icon) chip plus
/// the item's label children.
#[derive(IntoElement)]
struct StepperTrigger {
    step: usize,
    checked_step: usize,
    style: StyleRefinement,
    icon: Option<AnyElement>,
    icon_size: Pixels,
    children: Vec<AnyElement>,
    layout: Axis,
    disabled: bool,
    text_center: bool,
    size: Size,
    on_click: Box<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>,
}

impl StepperTrigger {
    fn new() -> Self {
        Self {
            step: 0,
            checked_step: 0,
            icon: None,
            icon_size: px(24.),
            layout: Axis::Horizontal,
            disabled: false,
            size: Size::default(),
            children: Vec::new(),
            text_center: false,
            style: StyleRefinement::default(),
            on_click: Box::new(|_, _, _| {}),
        }
    }

    fn step(mut self, ix: usize) -> Self {
        self.step = ix;
        self
    }

    fn checked_step(mut self, checked_step: usize) -> Self {
        self.checked_step = checked_step;
        self
    }

    fn layout(mut self, layout: Axis) -> Self {
        self.layout = layout;
        self
    }

    fn icon(mut self, icon: Option<AnyElement>) -> Self {
        self.icon = icon;
        self
    }

    fn icon_size(mut self, size: Pixels) -> Self {
        self.icon_size = size;
        self
    }

    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }

    fn text_center(mut self, center: bool) -> Self {
        self.text_center = center;
        self
    }

    fn on_click<F>(mut self, f: F) -> Self
    where
        F: Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    {
        self.on_click = Box::new(f);
        self
    }
}

impl ParentElement for StepperTrigger {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

/// `gpui-component`'s `StyleSized::input_text_size`, crate-side — the text
/// ladder for input-like controls. Upstream applies it to the trigger with
/// `self.size.smaller()`, so the effective step is one notch down from the
/// item's own size.
fn apply_input_text_size<E: Styled>(el: E, size: Size) -> E {
    match size {
        Size::XSmall => el.text_xs(),
        Size::Small | Size::Medium => el.text_sm(),
        Size::Large => el.text_base(),
        Size::Size(size) => el.text_size(size * 0.875),
    }
}

/// Wrap a caller-supplied icon so it renders at the indicator's pixel size.
///
/// A `Div`'s paint pushes its text style onto its children, and a bare
/// [`crate::components::primitive::icon::PhosphorIcon`] reads the surrounding
/// text style — the same trick [`crate::components::primitive::button`]'s icon
/// slots use. An element with an explicit size keeps it.
fn icon_slot(icon: AnyElement, size: Pixels) -> gpui::Div {
    div().flex().items_center().text_size(size).child(icon)
}

impl RenderOnce for StepperTrigger {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let is_checked = is_checked(self.step, self.checked_step);
        let theme = cx.theme();

        // A horizontal stepper stacks the chip over its label (`v_flex`); a
        // vertical one puts them side by side (`h_flex`) — and only the
        // horizontal rail needs the tight 4px gap; the row reads better at 8px.
        let base = match self.layout {
            Axis::Horizontal => v_flex().gap_1(),
            Axis::Vertical => h_flex().gap_2(),
        };
        let mut trigger = apply_input_text_size(
            base.id(("trigger", self.step))
                .items_start()
                .when(self.text_center, |this| this.items_center()),
            self.size.smaller(),
        );
        trigger = trigger
            .child(
                div()
                    .id("indicator")
                    .size(self.icon_size)
                    .overflow_hidden()
                    .flex()
                    .rounded(theme.radius_full())
                    .items_center()
                    .justify_center()
                    .bg(theme.secondary)
                    .text_color(theme.secondary_foreground)
                    .when(!self.disabled && !is_checked, |this| {
                        this.hover(|this| this.bg(theme.secondary_hover))
                            .active(|this| this.bg(theme.secondary_active))
                    })
                    .when(is_checked, |this| {
                        this.bg(theme.primary).text_color(theme.primary_foreground)
                    })
                    .when(self.size != Size::XSmall, |this| {
                        this.child(match self.icon {
                            Some(icon) => icon_slot(icon, self.icon_size).into_any_element(),
                            None => div().child(format!("{}", self.step + 1)).into_any_element(),
                        })
                    }),
            )
            .children(self.children)
            .when(!self.disabled, |this| {
                this.on_click(move |event, window, cx| {
                    (self.on_click)(event, window, cx);
                })
            });
        trigger.style().refine(&self.style);
        trigger
    }
}

/// A separator between stepper items.
///
/// Default is `absolute` positioned: the connector is pinned to the item's
/// edge and runs through the space the `flex_1` row reserved for it, so the
/// chip and label never have to share their height with the rail.
#[derive(IntoElement)]
struct StepperSeparator {
    size: Size,
    checked: bool,
    icon_size: Pixels,
    layout: Axis,
    style: StyleRefinement,
    text_center: bool,
}

impl StepperSeparator {
    fn new() -> Self {
        Self {
            size: Size::default(),
            checked: false,
            icon_size: px(24.),
            layout: Axis::Horizontal,
            style: StyleRefinement::default(),
            text_center: false,
        }
    }

    fn with_size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }

    fn text_center(mut self, center: bool) -> Self {
        self.text_center = center;
        self
    }

    fn layout(mut self, layout: Axis) -> Self {
        self.layout = layout;
        self
    }

    fn icon_size(mut self, size: Pixels) -> Self {
        self.icon_size = size;
        self
    }

    fn checked(mut self, checked: bool) -> Self {
        self.checked = checked;
        self
    }
}

impl Styled for StepperSeparator {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for StepperSeparator {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let icon_size = self.icon_size;
        let text_center = self.text_center;
        let separator_wide = separator_wide(self.size);

        let gap = px(4.);
        let theme = cx.theme();

        // The connector hangs at the chip's vertical center (icon_size.half())
        // and is inset from the chip by the gap. Centered items split the
        // remaining rail around the middle instead of hugging the chip.
        let mut separator = div().absolute().flex_1();
        separator = match self.layout {
            Axis::Horizontal => separator
                .h(separator_wide)
                .mt(icon_size.half())
                .map(|this| {
                    if !text_center {
                        this.ml(icon_size + gap).mr(gap).left_0().right_0()
                    } else {
                        this.mx(icon_size.half() + gap)
                            .left(relative(0.5))
                            .right(relative(-0.5))
                    }
                }),
            // Upstream wrote `mx` here (mirroring the horizontal branch's
            // centered arm); a vertical rail centers with *vertical* margins —
            // see the module docs.
            Axis::Vertical => separator
                .w(separator_wide)
                .ml(icon_size.half())
                .map(|this| {
                    if !text_center {
                        this.mt(icon_size + gap).mb(gap).top_0().bottom_0()
                    } else {
                        this.my(icon_size.half() + gap)
                            .top(relative(0.5))
                            .bottom(relative(-0.5))
                    }
                }),
        };
        separator = separator
            .bg(theme.border)
            .when(self.checked, |this| this.bg(theme.primary));
        separator.style().refine(&self.style);
        separator
    }
}

#[cfg(test)]
mod tests {
    use gpui::{
        Context, IntoElement, ParentElement as _, Render, Styled as _, TestAppContext, Window, div,
        px,
    };

    use super::*;
    use crate::components::primitive::icon::PhosphorIcon;

    #[test]
    fn indicator_icon_size_tracks_the_upstream_ladder() {
        assert_eq!(indicator_icon_size(Size::XSmall), px(8.));
        assert_eq!(indicator_icon_size(Size::Small), px(18.));
        assert_eq!(indicator_icon_size(Size::Medium), px(24.));
        assert_eq!(indicator_icon_size(Size::Large), px(32.));
        // The pixel override rides the default (medium) arm, like upstream's
        // catch-all `_`.
        assert_eq!(indicator_icon_size(Size::Size(px(40.))), px(24.));
    }

    #[test]
    fn separator_wide_tracks_the_upstream_ladder() {
        assert_eq!(separator_wide(Size::XSmall), px(1.5));
        assert_eq!(separator_wide(Size::Small), px(2.));
        assert_eq!(separator_wide(Size::Medium), px(2.));
        assert_eq!(separator_wide(Size::Large), px(3.));
    }

    #[test]
    fn checked_includes_the_current_step_passed_does_not() {
        // The chip lights up at the checked step; the connector after it only
        // lights once the step is *passed*.
        assert!(is_checked(2, 2));
        assert!(is_checked(1, 2));
        assert!(!is_checked(3, 2));

        assert!(!is_passed(2, 2));
        assert!(is_passed(1, 2));
        assert!(!is_passed(3, 2));
    }

    #[test]
    fn input_text_size_ladder_matches_the_upstream_mapping() {
        // Applied to `size.smaller()`: Medium → Small → text_sm; Large →
        // Medium → text_sm. The ladder never reaches text_base below Large.
        fn probe(size: Size, expect_px: f32) {
            let mut el = div();
            el = apply_input_text_size(el, size.smaller());
            // The refinement carries the resolved font size.
            let font_size = el
                .style()
                .text
                .font_size
                .map(|f| match f {
                    gpui::AbsoluteLength::Pixels(p) => p,
                    gpui::AbsoluteLength::Rems(r) => r.to_pixels(px(16.)),
                })
                .expect("font size set");
            assert_eq!(font_size, px(expect_px), "{size:?}");
        }

        probe(Size::XSmall, 12.); // smaller → XSmall → text_xs
        probe(Size::Small, 12.); // smaller → XSmall → text_xs
        probe(Size::Medium, 14.); // smaller → Small → text_sm
        probe(Size::Large, 14.); // smaller → Medium → text_sm
    }

    struct TestView;

    impl Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .gap(px(12.))
                .child(
                    Stepper::new("t-horizontal")
                        .selected_index(1)
                        .item(StepperItem::new().icon(PhosphorIcon::Basket).child("Cart"))
                        .item(StepperItem::new().child("Delivery"))
                        .item(StepperItem::new().disabled(true).child("Payment"))
                        .item(StepperItem::new().child("Done"))
                        .on_click(|step, _, _| {
                            let _ = step;
                        }),
                )
                .child(
                    // Every branch a default mount skips: centered text, the
                    // pixel-size override, and the vertical rail whose
                    // centered separator the port fixed.
                    Stepper::new("t-centered")
                        .text_center(true)
                        .with_size(Size::Size(px(18.)))
                        .items([
                            StepperItem::new().child("One"),
                            StepperItem::new().child("Two"),
                        ]),
                )
                .child(
                    Stepper::new("t-vertical")
                        .vertical()
                        .selected_index(2)
                        .items([
                            StepperItem::new().icon(PhosphorIcon::Basket).child("Pick"),
                            StepperItem::new().child("Pack"),
                            StepperItem::new().child("Ship"),
                        ]),
                )
        }
    }

    #[gpui::test]
    fn stepper_renders_all_layouts_without_panic(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| TestView);
    }
}
