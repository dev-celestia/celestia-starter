//! Traffic lights — close, minimize, zoom.
//!
//! Presentational. Compose into [`super::window::Window::title_bar`] when you
//! need drawn controls (previews, or client-decorated platforms). A
//! [`super::window::WindowChrome::Native`] root on macOS keeps AppKit's lights
//! — do not stack a second set.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ElementId, Hsla, InteractiveElement as _, IntoElement, ParentElement, Pixels,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px, rgb,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};

/// Diameter of one light. macOS draws 12px circles.
pub const TRAFFIC_LIGHT_DIAMETER: Pixels = px(12.);

/// Gap between lights.
pub const TRAFFIC_LIGHT_GAP: Pixels = px(8.);

/// Close, the leading light.
pub const TRAFFIC_CLOSE: u32 = 0xff5f57;
/// Minimize, the middle light.
pub const TRAFFIC_MINIMIZE: u32 = 0xfebc2e;
/// Zoom, the trailing light.
pub const TRAFFIC_ZOOM: u32 = 0x28c840;
/// Flat fill used while the window is inactive.
pub const TRAFFIC_INACTIVE: u32 = 0xc8c8c8;

/// Left-to-right order. Close, then minimize, then zoom.
pub const TRAFFIC_LIGHT_ROLES: [TrafficLightRole; 3] = [
    TrafficLightRole::Close,
    TrafficLightRole::Minimize,
    TrafficLightRole::Zoom,
];

type LightHandler = Rc<dyn Fn(&mut Window, &mut App) + 'static>;

/// Which light a button is.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TrafficLightRole {
    /// Red. Closes the window.
    Close,
    /// Yellow. Minimizes the window.
    Minimize,
    /// Green. Zooms (maximizes) the window.
    Zoom,
}

impl TrafficLightRole {
    /// Stable suffix used in element ids.
    pub fn id(self) -> &'static str {
        match self {
            Self::Close => "close",
            Self::Minimize => "minimize",
            Self::Zoom => "zoom",
        }
    }

    /// Glyph revealed when the cluster is hovered and the window is active.
    pub fn glyph(self) -> PhosphorIcon {
        match self {
            Self::Close => PhosphorIcon::X,
            Self::Minimize => PhosphorIcon::Minus,
            Self::Zoom => PhosphorIcon::Plus,
        }
    }

    fn fill(self, active: bool) -> Hsla {
        let code = if active {
            match self {
                Self::Close => TRAFFIC_CLOSE,
                Self::Minimize => TRAFFIC_MINIMIZE,
                Self::Zoom => TRAFFIC_ZOOM,
            }
        } else {
            TRAFFIC_INACTIVE
        };
        rgb(code).into()
    }
}

/// Glyphs show on every light once the pointer is over the cluster, and only
/// while the window is active.
pub fn traffic_glyphs_visible(active: bool, hovered: bool) -> bool {
    active && hovered
}

/// The unsaved dot sits in the close light until the cluster is hovered.
/// Inactive windows stay flat gray.
pub fn traffic_shows_edited_dot(active: bool, edited: bool, glyphs_visible: bool) -> bool {
    active && edited && !glyphs_visible
}

struct ClusterHover {
    hovered: bool,
}

/// The three traffic lights.
#[derive(IntoElement)]
pub struct TrafficLights {
    id: SharedString,
    style: StyleRefinement,
    active: bool,
    edited: bool,
    on_close: Option<LightHandler>,
    on_minimize: Option<LightHandler>,
    on_zoom: Option<LightHandler>,
}

impl TrafficLights {
    /// An active cluster with no callbacks.
    pub fn new(id: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            active: true,
            edited: false,
            on_close: None,
            on_minimize: None,
            on_zoom: None,
        }
    }

    /// `false` draws flat gray circles and hides glyphs and the edited dot.
    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    /// Draw the unsaved dot in the close light until the cluster is hovered.
    pub fn edited(mut self, edited: bool) -> Self {
        self.edited = edited;
        self
    }

    /// Called when the close light is clicked.
    pub fn on_close(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_close = Some(Rc::new(f));
        self
    }

    /// Called when the minimize light is clicked.
    pub fn on_minimize(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_minimize = Some(Rc::new(f));
        self
    }

    /// Called when the zoom light is clicked.
    pub fn on_zoom(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_zoom = Some(Rc::new(f));
        self
    }

    /// Whether the window is active.
    pub fn is_active(&self) -> bool {
        self.active
    }

    /// Whether the close light should be able to show the edited dot.
    pub fn is_edited(&self) -> bool {
        self.edited
    }
}

impl Styled for TrafficLights {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for TrafficLights {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let state = window.use_keyed_state(ElementId::Name(self.id.clone()), cx, |_, _| {
            ClusterHover { hovered: false }
        });
        let glyphs = traffic_glyphs_visible(self.active, state.read(cx).hovered);
        let ink: Hsla = rgb(0x000000).into();
        let id = self.id.clone();

        let mut root = div()
            .id(ElementId::Name(format!("traffic-{id}").into()))
            .flex()
            .flex_row()
            .items_center()
            .gap(TRAFFIC_LIGHT_GAP)
            .on_hover(window.listener_for(&state, |state, hovered, _, cx| {
                if state.hovered == *hovered {
                    return;
                }
                state.hovered = *hovered;
                cx.notify();
            }));
        root.style().refine(&self.style);

        root.children(TRAFFIC_LIGHT_ROLES.map(|role| {
            let handler = match role {
                TrafficLightRole::Close => self.on_close.clone(),
                TrafficLightRole::Minimize => self.on_minimize.clone(),
                TrafficLightRole::Zoom => self.on_zoom.clone(),
            };
            let show_dot = traffic_shows_edited_dot(self.active, self.edited, glyphs)
                && role == TrafficLightRole::Close;
            div()
                .id(ElementId::Name(
                    format!("traffic-{id}-{}", role.id()).into(),
                ))
                .size(TRAFFIC_LIGHT_DIAMETER)
                .rounded_full()
                .flex()
                .flex_shrink_0()
                .items_center()
                .justify_center()
                .bg(role.fill(self.active))
                .cursor_pointer()
                .on_click(move |_, window, cx| {
                    if let Some(handler) = &handler {
                        handler(window, cx);
                    }
                })
                .when(glyphs, |this| {
                    this.child(Phosphor::new(role.glyph()).size(px(7.)).color(ink))
                })
                .when(show_dot, |this| {
                    this.child(div().size(px(4.)).rounded_full().bg(ink))
                })
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::{Context, Render, TestAppContext, div};

    #[test]
    fn lights_are_close_then_minimize_then_zoom() {
        assert_eq!(
            TRAFFIC_LIGHT_ROLES,
            [
                TrafficLightRole::Close,
                TrafficLightRole::Minimize,
                TrafficLightRole::Zoom,
            ]
        );
        assert_eq!(TRAFFIC_LIGHT_DIAMETER, px(12.0));
        assert_eq!(TRAFFIC_LIGHT_GAP, px(8.0));
        assert_eq!(TRAFFIC_CLOSE, 0xff5f57);
        assert_eq!(TRAFFIC_MINIMIZE, 0xfebc2e);
        assert_eq!(TRAFFIC_ZOOM, 0x28c840);
        assert_eq!(TRAFFIC_INACTIVE, 0xc8c8c8);
        assert_eq!(TrafficLightRole::Close.glyph(), PhosphorIcon::X);
        assert_eq!(TrafficLightRole::Minimize.glyph(), PhosphorIcon::Minus);
        assert_eq!(TrafficLightRole::Zoom.glyph(), PhosphorIcon::Plus);
    }

    #[test]
    fn inactive_hides_glyphs_and_the_edited_dot_waits_for_hover() {
        let lights = TrafficLights::new("doc").active(false).edited(true);
        assert!(!lights.is_active());
        assert!(lights.is_edited());

        assert!(!traffic_glyphs_visible(false, true));
        assert!(!traffic_glyphs_visible(true, false));
        assert!(traffic_glyphs_visible(true, true));

        assert!(!traffic_shows_edited_dot(false, true, false));
        assert!(traffic_shows_edited_dot(true, true, false));
        assert!(!traffic_shows_edited_dot(true, true, true));
        assert!(!traffic_shows_edited_dot(true, false, false));
    }

    struct LightsView;

    impl Render for LightsView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div().child(
                TrafficLights::new("mounted")
                    .edited(true)
                    .on_close(|_, _| {})
                    .on_minimize(|_, _| {})
                    .on_zoom(|_, _| {}),
            )
        }
    }

    #[gpui::test]
    fn traffic_lights_mount(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| LightsView);
    }
}
