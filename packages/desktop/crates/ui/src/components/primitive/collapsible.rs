//! Collapsible — the desktop counterpart of
//! `packages/ui/src/components/primitive/collapsible.tsx`.
//!
//! The web primitive is a thin wrapper over Base UI's `Collapsible.Root` /
//! `Trigger` / `Panel`: [`ParentElement`] children are the trigger row,
//! [`Collapsible::content`] is the panel, and the panel mounts only while
//! open. The desktop `Collapsible` keeps that shape and adds
//! [`Collapsible::motion_id`], which swaps the mount/unmount for a measured,
//! clipped reveal so open/close can be animated reversibly — a
//! `with_animation` timeline cannot express that, because it replays from its
//! start instead of reversing from wherever it currently is.
//!
//! Provenance: this file used to re-export `gpui-component`'s `Collapsible`,
//! which layered `gpui_base::Collapsible` over `gpui_base::spring` and
//! `gpui_base::MotionReveal`. All three now live here, on raw `gpui`:
//!
//! - the controlled mount semantics and plain column layout of
//!   `gpui_base::Collapsible`,
//! - the measured clipped reveal of `gpui_base::MotionReveal`, as [`Reveal`]
//!   below — a custom [`gpui::Element`] that lays its child out at full
//!   height, clips to `progress × height`, and re-requests a frame when the
//!   measurement changes so content that resizes while open stays correct,
//! - the progress value itself: a reversible 0→1 value transition keyed by the
//!   caller's `motion_id`. Upstream rode the theme's `spring_control` spring;
//!   this port uses [`crate::motion::slide_transition`], the design system's
//!   named `data-open` panel-entrance step (220ms, `--ease-out`), fed to the
//!   same value-transition primitive [`crate::components::primitive::button`]
//!   uses for its hover fade.

use gpui::{
    AnyElement, App, AvailableSpace, Bounds, ContentMask, Element, ElementId, GlobalElementId,
    InspectorElementId, IntoElement, LayoutId, ParentElement, Pixels, Refineable as _, RenderOnce,
    Style, StyleRefinement, Styled, Window, div, px, relative, size,
};
use gpui_base::motion::transition;

use crate::motion;

/// One slot inside the collapsible: a plain [`ParentElement`] child, or the
/// [`Collapsible::content`] panel whose mounting the `open` flag controls.
enum Child {
    Element(AnyElement),
    Content(AnyElement),
}

/// An interactive element which expands/collapses.
#[derive(IntoElement)]
pub struct Collapsible {
    children: Vec<Child>,
    style: StyleRefinement,
    motion_id: Option<ElementId>,
    open: bool,
}

impl Collapsible {
    /// Creates a new `Collapsible` instance.
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
            style: StyleRefinement::default(),
            motion_id: None,
            open: false,
        }
    }

    /// Sets whether the collapsible is open. default is false.
    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    /// Enables a reversible measured reveal under a stable identity.
    ///
    /// Without a `motion_id` the panel is *unmounted* while closed. With one,
    /// it stays mounted at a clipped height of `progress × measured height`,
    /// where progress samples toward `open ? 1 : 0` and reverses from wherever
    /// it currently is. The id must be stable across renders and unique per
    /// collapsible — it keys both the transition state and the measured-height
    /// cache.
    pub fn motion_id(mut self, id: impl Into<ElementId>) -> Self {
        self.motion_id = Some(id.into());
        self
    }

    /// Sets the content of the collapsible.
    ///
    /// If `open` is false, content will be hidden.
    pub fn content(mut self, content: impl IntoElement) -> Self {
        self.children
            .push(Child::Content(content.into_any_element()));
        self
    }
}

impl Default for Collapsible {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for Collapsible {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl ParentElement for Collapsible {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children
            .extend(elements.into_iter().map(Child::Element));
    }
}

impl RenderOnce for Collapsible {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        // Sampled every render, settled or not — past the first frame the
        // helper is a keyed-state read that returns the settled target.
        let progress = self.motion_id.as_ref().map(|id| {
            transition(
                (id.clone(), "reveal"),
                if self.open { 1.0 } else { 0.0 },
                motion::slide_transition(),
                window,
                cx,
            )
        });

        // The upstream base was a plain column — `v_flex()` with no
        // cross-axis alignment — so a raw `.flex().flex_col()` is exact.
        let mut root = div().flex().flex_col();
        // The caller's `Styled` chain wins over the default above.
        root.style().refine(&self.style);

        root.children(self.children.into_iter().filter_map(|child| match child {
            Child::Element(element) => Some(element),
            Child::Content(content) => match (&self.motion_id, progress) {
                // Mounted under a stable identity: revealed at the sampled
                // progress, whatever it is — including 0. Keeping the child in
                // the tree at height 0 is what lets the reveal reverse from
                // mid-flight instead of re-measuring from scratch.
                (Some(id), Some(progress)) => {
                    Some(Reveal::new(id.clone(), progress, content).into_any_element())
                }
                // No motion identity: plain controlled mount — the panel is
                // simply absent from the tree while closed.
                _ => self.open.then_some(content),
            },
        }))
    }
}

/// Measured-height cache for [`Reveal`], kept across frames so the clip height
/// tracks content that resizes while open.
#[derive(Clone, Copy, Default)]
struct RevealState {
    height: Option<Pixels>,
}

/// A measured, clipped vertical reveal driven by normalized progress — the
/// port of `gpui_base::MotionReveal`. The child is always laid out at its full
/// height and painted behind a content mask of `progress × height`, so the
/// reveal clips rather than squashes.
struct Reveal {
    id: ElementId,
    progress: f32,
    child: AnyElement,
}

impl Reveal {
    fn new(id: impl Into<ElementId>, progress: f32, child: AnyElement) -> Self {
        Self {
            id: id.into(),
            progress: progress.clamp(0.0, 1.0),
            child,
        }
    }
}

impl IntoElement for Reveal {
    type Element = Self;

    fn into_element(self) -> Self::Element {
        self
    }
}

impl Element for Reveal {
    type RequestLayoutState = ();
    type PrepaintState = ();

    fn id(&self) -> Option<ElementId> {
        Some(self.id.clone())
    }

    fn source_location(&self) -> Option<&'static std::panic::Location<'static>> {
        None
    }

    fn request_layout(
        &mut self,
        global_id: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        window: &mut Window,
        cx: &mut App,
    ) -> (LayoutId, Self::RequestLayoutState) {
        let height = window.with_element_state(
            global_id.expect("Reveal must have an id"),
            |state: Option<RevealState>, _| {
                let state = state.unwrap_or_default();
                (state.height, state)
            },
        );
        let mut style = Style::default();
        style.size.width = relative(1.0).into();
        match height {
            // First frame of an opening reveal: the height is not measured
            // yet, so lay out unconstrained rather than flashing 0 — the
            // prepaint below measures and the re-requested frame clips.
            None if self.progress > 0.0 => {}
            None => style.size.height = px(0.0).into(),
            Some(height) => style.size.height = (height * self.progress).into(),
        }
        (window.request_layout(style, None, cx), ())
    }

    fn prepaint(
        &mut self,
        global_id: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        bounds: Bounds<Pixels>,
        _: &mut Self::RequestLayoutState,
        window: &mut Window,
        cx: &mut App,
    ) -> Self::PrepaintState {
        // Measure the child at the reveal's definite width, unconstrained
        // height (MinContent) — that measurement is the reveal's 100%.
        let measured = self.child.layout_as_root(
            size(
                AvailableSpace::Definite(bounds.size.width),
                AvailableSpace::MinContent,
            ),
            window,
            cx,
        );
        let changed = window.with_element_state(
            global_id.expect("Reveal must have an id"),
            |state: Option<RevealState>, _| {
                let mut state = state.unwrap_or_default();
                let changed = state.height != Some(measured.height);
                state.height = Some(measured.height);
                (changed, state)
            },
        );
        if changed {
            window.request_animation_frame();
        }
        window.with_content_mask(Some(ContentMask { bounds }), |window| {
            self.child.prepaint_at(bounds.origin, window, cx);
        });
    }

    fn paint(
        &mut self,
        _: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        bounds: Bounds<Pixels>,
        _: &mut Self::RequestLayoutState,
        _: &mut Self::PrepaintState,
        window: &mut Window,
        cx: &mut App,
    ) {
        window.with_content_mask(Some(ContentMask { bounds }), |window| {
            self.child.paint(window, cx);
        });
    }
}

#[cfg(test)]
mod tests {
    use gpui::{Context, InteractiveElement as _, Render, TestAppContext, div, px};

    use super::*;

    struct Harness(bool);

    impl Render for Harness {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            Collapsible::new()
                .open(self.0)
                .child(
                    div()
                        .debug_selector(|| "collapsible-trigger".into())
                        .size(px(10.)),
                )
                .content(
                    div()
                        .debug_selector(|| "collapsible-content".into())
                        .size(px(10.)),
                )
        }
    }

    /// Port of the upstream facade test: the panel renders below the trigger
    /// while open, and is unmounted entirely while closed.
    #[gpui::test]
    fn preserves_vertical_layout_and_visibility(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::init(cx);
        });

        let (_, cx) = cx.add_window_view(|_, _| Harness(true));
        cx.update(|window, cx| window.draw(cx).clear(cx));
        let trigger = cx.debug_bounds("collapsible-trigger").unwrap();
        let content = cx.debug_bounds("collapsible-content").unwrap();
        assert!(trigger.origin.y < content.origin.y);

        let (_, cx) = cx.add_window_view(|_, _| Harness(false));
        cx.update(|window, cx| window.draw(cx).clear(cx));
        assert!(cx.debug_bounds("collapsible-trigger").is_some());
        assert!(cx.debug_bounds("collapsible-content").is_none());
    }

    /// Port of the upstream motion test: a `motion_id` keeps the closed panel
    /// mounted, so the reveal can reverse from wherever it currently is.
    #[gpui::test]
    fn motion_id_keeps_closed_content_mounted_for_reversible_reveal(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::init(cx);
        });

        struct MotionHarness;

        impl Render for MotionHarness {
            fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
                Collapsible::new()
                    .motion_id("details-motion")
                    .open(false)
                    .content(
                        div()
                            .debug_selector(|| "motion-content".into())
                            .size(px(10.)),
                    )
            }
        }

        let (_, cx) = cx.add_window_view(|_, _| MotionHarness);
        cx.update(|window, cx| window.draw(cx).clear(cx));
        assert!(cx.debug_bounds("motion-content").is_some());
    }

    /// Every builder branch painted: open and closed, with and without a
    /// motion identity, children plus a panel, and a caller `Styled` chain
    /// (the max width) landing on the container.
    struct TestView;

    impl Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .gap_2()
                .child(
                    Collapsible::new()
                        .open(true)
                        .child(div().child("Header row (always mounted)"))
                        .content(div().p_3().child("Revealed with layout animation.")),
                )
                .child(
                    Collapsible::new()
                        .open(false)
                        .content(div().p_3().child("Mounted only while open.")),
                )
                .child(
                    Collapsible::new()
                        .motion_id("testview-motion")
                        .open(true)
                        .content(div().p_3().child("Revealed at the sampled progress."))
                        .max_w(px(240.)),
                )
        }
    }

    #[gpui::test]
    fn collapsible_renders_without_panic(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::init(cx);
        });

        let _window = cx.add_window(|_window, _cx| TestView);
    }
}
