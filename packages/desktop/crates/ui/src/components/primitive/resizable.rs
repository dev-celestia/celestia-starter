//! Resizable panels — desktop twin of
//! `packages/ui/src/components/primitive/resizable.tsx`.
//!
//! Engine and hit-testing come from `gpui-base`; Celestia owns the builders and
//! divider chrome (hairline + engagement pill, optional always-on grip).
//!
//! ```ignore
//! use celestia_ui::components::primitive::resizable::{
//!     ResizablePanelGroup, resizable_panel,
//! };
//!
//! ResizablePanelGroup::horizontal("shell")
//!     .with_handle(true)
//!     .child(resizable_panel().size(px(220.)).child(sidebar))
//!     .child(resizable_panel().child(main))
//! ```

use std::ops::Range;
use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Axis, ElementId, Entity, IntoElement, ParentElement, Pixels, Refineable as _,
    RenderOnce, StyleRefinement, Styled, Window, deferred, div, px,
};
use gpui_base::{
    ResizablePanel as BasePanel, ResizablePanelGroup as BaseGroup, ResizeHandleContext,
    ResizeHandleRenderer, ResizeHandleState, h_resizable as base_h_resizable,
    resizable_panel as base_resizable_panel, v_resizable as base_v_resizable,
};

use crate::motion::{self, transition};
use crate::theme::ActiveTheme as _;

pub use gpui_base::{ResizablePanelEvent, ResizableState};

/// How thick the engagement / grip indicator is across the divider.
const INDICATOR_THICKNESS: Pixels = px(3.);

/// Create a [`ResizablePanel`] for use inside a [`ResizablePanelGroup`].
pub fn resizable_panel() -> ResizablePanel {
    ResizablePanel::new()
}

/// Horizontal resizable group (side-by-side panels).
pub fn h_resizable(id: impl Into<ElementId>) -> ResizablePanelGroup {
    ResizablePanelGroup::horizontal(id)
}

/// Vertical resizable group (stacked panels).
pub fn v_resizable(id: impl Into<ElementId>) -> ResizablePanelGroup {
    ResizablePanelGroup::vertical(id)
}

/// A row or column of drag-resizable panels — web `ResizablePanelGroup`.
#[derive(IntoElement)]
pub struct ResizablePanelGroup {
    id: ElementId,
    axis: Axis,
    state: Option<Entity<ResizableState>>,
    /// Cross-axis size (height when horizontal, width when vertical).
    size: Option<Pixels>,
    children: Vec<ResizablePanel>,
    /// When true, paint a grip on every divider even while idle (web `withHandle`).
    with_handle: bool,
    on_resize: Option<Rc<dyn Fn(&Entity<ResizableState>, &mut Window, &mut App)>>,
    style: StyleRefinement,
}

impl ResizablePanelGroup {
    pub fn horizontal(id: impl Into<ElementId>) -> Self {
        Self::new(id, Axis::Horizontal)
    }

    pub fn vertical(id: impl Into<ElementId>) -> Self {
        Self::new(id, Axis::Vertical)
    }

    fn new(id: impl Into<ElementId>, axis: Axis) -> Self {
        Self {
            id: id.into(),
            axis,
            state: None,
            size: None,
            children: Vec::new(),
            with_handle: false,
            on_resize: None,
            style: StyleRefinement::default(),
        }
    }

    /// Bind an external [`ResizableState`] (for persistence / size readback).
    pub fn with_state(mut self, state: &Entity<ResizableState>) -> Self {
        self.state = Some(state.clone());
        self
    }

    /// Cross-axis size of the group.
    pub fn size(mut self, size: impl Into<Pixels>) -> Self {
        self.size = Some(size.into());
        self
    }

    /// Always show a grip on dividers (web `ResizableHandle withHandle`).
    pub fn with_handle(mut self, with_handle: bool) -> Self {
        self.with_handle = with_handle;
        self
    }

    pub fn child(mut self, panel: impl Into<ResizablePanel>) -> Self {
        self.children.push(panel.into());
        self
    }

    pub fn children<I>(mut self, panels: impl IntoIterator<Item = I>) -> Self
    where
        I: Into<ResizablePanel>,
    {
        self.children = panels.into_iter().map(Into::into).collect();
        self
    }

    pub fn on_resize(
        mut self,
        f: impl Fn(&Entity<ResizableState>, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_resize = Some(Rc::new(f));
        self
    }
}

impl Styled for ResizablePanelGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ResizablePanelGroup {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        let appearance = resize_handle_appearance(self.with_handle);
        let mut group: BaseGroup = match self.axis {
            Axis::Horizontal => base_h_resizable(self.id),
            Axis::Vertical => base_v_resizable(self.id),
        }
        .with_handle_appearance(appearance);

        if let Some(state) = &self.state {
            group = group.with_state(state);
        }
        if let Some(size) = self.size {
            group = group.size(size);
        }
        if let Some(on_resize) = self.on_resize {
            group = group.on_resize(move |state, window, cx| on_resize(state, window, cx));
        }

        for panel in self.children {
            group = group.child(panel.into_base());
        }

        let mut root = div().size_full();
        root.style().refine(&self.style);
        root.child(group)
    }
}

/// One panel inside a [`ResizablePanelGroup`] — web `ResizablePanel`.
#[derive(IntoElement)]
pub struct ResizablePanel {
    initial_size: Option<Pixels>,
    size_range: Range<Pixels>,
    visible: bool,
    children: Vec<AnyElement>,
    style: StyleRefinement,
}

impl ResizablePanel {
    pub fn new() -> Self {
        Self {
            initial_size: None,
            size_range: px(100.)..Pixels::MAX,
            visible: true,
            children: Vec::new(),
            style: StyleRefinement::default(),
        }
    }

    pub fn size(mut self, size: impl Into<Pixels>) -> Self {
        self.initial_size = Some(size.into());
        self
    }

    pub fn size_range(mut self, range: impl Into<Range<Pixels>>) -> Self {
        self.size_range = range.into();
        self
    }

    pub fn visible(mut self, visible: bool) -> Self {
        self.visible = visible;
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }

    fn into_base(self) -> BasePanel {
        let mut panel = base_resizable_panel()
            .visible(self.visible)
            .size_range(self.size_range);
        if let Some(size) = self.initial_size {
            panel = panel.size(size);
        }
        panel.style().refine(&self.style);
        for child in self.children {
            panel = panel.child(child);
        }
        panel
    }
}

impl Default for ResizablePanel {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for ResizablePanel {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl ParentElement for ResizablePanel {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for ResizablePanel {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        // Panels are meant to live inside a group; rendering alone is a no-op shell.
        let _ = (window, cx);
        div().size_full().children(self.children)
    }
}

impl From<AnyElement> for ResizablePanel {
    fn from(value: AnyElement) -> Self {
        ResizablePanel::new().child(value)
    }
}

/// Celestia divider chrome for handles base does not already style.
pub fn resize_handle_appearance(with_handle: bool) -> ResizeHandleRenderer {
    Rc::new(move |handle, window, cx| Some(render_resize_handle(handle, with_handle, window, cx)))
}

fn indicator(state: ResizeHandleState, with_handle: bool) -> (Pixels, f32) {
    match state {
        ResizeHandleState::Idle if with_handle => (px(16.), 0.45),
        ResizeHandleState::Idle => (px(0.), 0.),
        ResizeHandleState::Hovered => (px(20.), 0.55),
        ResizeHandleState::Pressed => (px(28.), 0.75),
        ResizeHandleState::Dragging => (px(44.), 1.0),
    }
}

fn render_resize_handle(
    handle: &ResizeHandleContext,
    with_handle: bool,
    window: &mut Window,
    cx: &mut App,
) -> AnyElement {
    let axis = handle.axis();
    let (target_length, target_opacity) = indicator(handle.state(), with_handle);
    let policy = motion::hover_transition();
    let length = transition(
        "celestia-resizable-handle-length",
        target_length,
        policy.clone(),
        window,
        cx,
    );
    let opacity = transition(
        "celestia-resizable-handle-opacity",
        target_opacity,
        policy,
        window,
        cx,
    );

    let line_color = if handle.state().is_active() {
        cx.theme().muted_foreground
    } else {
        cx.theme().border
    };
    let pill_color = if handle.state() == ResizeHandleState::Dragging {
        cx.theme().foreground
    } else {
        cx.theme().muted_foreground
    };

    div()
        .flex_none()
        .flex()
        .bg(line_color)
        .map(|line| match axis {
            Axis::Horizontal => line.w(px(1.)).h_full().items_center(),
            Axis::Vertical => line.h(px(1.)).w_full().items_start().justify_center(),
        })
        .when(length > px(0.5), |line| {
            let pill = div()
                .flex_none()
                .rounded(cx.theme().radius_full())
                .bg(pill_color)
                .opacity(opacity)
                .map(|pill| match axis {
                    Axis::Horizontal => pill
                        .w(INDICATOR_THICKNESS)
                        .h(length)
                        .ml((INDICATOR_THICKNESS - px(1.)) * -0.5),
                    Axis::Vertical => pill
                        .h(INDICATOR_THICKNESS)
                        .w(length)
                        .mt((INDICATOR_THICKNESS - px(1.)) * -0.5),
                });
            line.child(match handle.edge() {
                Some(_) => deferred(pill).into_any_element(),
                None => pill.into_any_element(),
            })
        })
        .into_any_element()
}
