//! Window frame, OS sub-windows, chrome actions, and the app menu.
//!
//! [`Window`] draws traffic lights, a centered title (or title-bar tabs),
//! an optional toolbar slot, and a unified sidebar that runs under the lights.
//!
//! - [`WindowChrome::Embedded`] (default) — framed preview with border,
//!   radius, and shadow. Always draws lights.
//! - [`WindowChrome::Native`] — root of a real OS window opened with
//!   [`Self::window_options`] / [`open_window`]. No outer frame. On macOS,
//!   AppKit draws the lights; elsewhere the drawn lights drive close /
//!   minimize / zoom.
//!
//! [`open_window`] opens an OS window whose root chrome is [`Window`] with
//! [`WindowChrome::Native`]. Platform chrome is macOS-only for now; other OS
//! frames will branch here later.
//!
//! [`AppMenu`] is the menu bar `cx.set_menus` installs. In fullscreen, macOS
//! hides that bar and reveals it when the pointer hits the top of the screen.
//!
//! [`MenuBarPreview`] paints the same titles inside a view, for the gallery.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, BoxShadow, ElementId, Entity, FontWeight, InteractiveElement as _,
    IntoElement, Menu, MenuItem, MouseButton, OsAction, ParentElement, Pixels,
    Refineable as _, Render, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, TitlebarOptions, WindowBounds, WindowControlArea,
    WindowHandle, WindowOptions, actions, div, point, px, rgba, size,
};
use gpui::Window as PlatformWindow;

use super::traffic_lights::{TRAFFIC_LIGHT_DIAMETER, TrafficLights};
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Title-bar height for a standard window.
pub const WINDOW_TITLE_BAR_HEIGHT: Pixels = px(28.);

/// Distance from the window's left edge to the first traffic light (macOS metrics for now).
pub const TRAFFIC_INSET: Pixels = px(20.);

/// Corner radius of the window frame (macOS metrics for now).
pub const WINDOW_RADIUS: Pixels = px(10.);

/// Leading padding that clears AppKit (or drawn) traffic lights.
const TITLE_LEADING_PAD: Pixels = px(80.);

/// How the frame lays out its title bar and sidebar.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
pub enum WindowKind {
    /// Title band across the top. Sidebar slot is ignored.
    #[default]
    Standard,
    /// Sidebar column runs to the top of the frame. Lights sit on top of it.
    /// The title and toolbar sit over the content column.
    Unified,
}

/// Whether this frame is an in-view preview or the root of a real OS window.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
pub enum WindowChrome {
    /// Framed preview: border, radius, shadow, always-drawn lights.
    #[default]
    Embedded,
    /// Real OS window root: full size, no outer chrome. Platform lights on macOS for now.
    Native,
}

/// One title-bar tab. The host owns which id is active.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WindowTab {
    /// Stable id passed to select and close callbacks.
    pub id: SharedString,
    /// Label drawn in the tab.
    pub label: SharedString,
}

impl WindowTab {
    /// A tab with the given id and label.
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
        }
    }
}

type TabHandler = Rc<dyn Fn(&SharedString, &mut PlatformWindow, &mut App) + 'static>;
type LightHandler = Rc<dyn Fn(&mut PlatformWindow, &mut App) + 'static>;

/// A framed window surface. Chrome layout is macOS-only for now.
#[derive(IntoElement)]
pub struct Window {
    id: SharedString,
    style: StyleRefinement,
    title: SharedString,
    subtitle: Option<SharedString>,
    active: bool,
    edited: bool,
    kind: WindowKind,
    chrome: WindowChrome,
    tabs: Vec<WindowTab>,
    active_tab: Option<SharedString>,
    on_select_tab: Option<TabHandler>,
    on_close_tab: Option<TabHandler>,
    on_add_tab: Option<LightHandler>,
    toolbar: Vec<AnyElement>,
    sidebar: Option<AnyElement>,
    children: Vec<AnyElement>,
    on_close: Option<LightHandler>,
    on_minimize: Option<LightHandler>,
    on_zoom: Option<LightHandler>,
}

impl Window {
    /// An active standard window with the given title.
    pub fn new(id: impl Into<SharedString>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            subtitle: None,
            active: true,
            edited: false,
            kind: WindowKind::Standard,
            chrome: WindowChrome::Embedded,
            tabs: Vec::new(),
            active_tab: None,
            on_select_tab: None,
            on_close_tab: None,
            on_add_tab: None,
            toolbar: Vec::new(),
            sidebar: None,
            children: Vec::new(),
            on_close: None,
            on_minimize: None,
            on_zoom: None,
        }
    }

    /// Second line under the title. Hidden while tabs are present.
    pub fn subtitle(mut self, subtitle: impl Into<SharedString>) -> Self {
        self.subtitle = Some(subtitle.into());
        self
    }

    /// `false` grays the traffic lights and the title.
    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    /// Unsaved-changes dot in the close light.
    pub fn edited(mut self, edited: bool) -> Self {
        self.edited = edited;
        self
    }

    /// Standard title band, or a sidebar that extends under the lights.
    pub fn kind(mut self, kind: WindowKind) -> Self {
        self.kind = kind;
        self
    }

    /// Embedded preview (default) or real OS window chrome.
    pub fn chrome(mut self, chrome: WindowChrome) -> Self {
        self.chrome = chrome;
        self
    }

    /// Append a title-bar tab. Any tab hides the centered title.
    pub fn tab(mut self, tab: WindowTab) -> Self {
        self.tabs.push(tab);
        self
    }

    /// Which tab is drawn pressed. The host updates this.
    pub fn active_tab(mut self, id: impl Into<SharedString>) -> Self {
        self.active_tab = Some(id.into());
        self
    }

    /// Called with the tab id when a tab is clicked.
    pub fn on_select_tab(
        mut self,
        f: impl Fn(&SharedString, &mut PlatformWindow, &mut App) + 'static,
    ) -> Self {
        self.on_select_tab = Some(Rc::new(f));
        self
    }

    /// Called with the tab id when its close glyph is clicked.
    pub fn on_close_tab(
        mut self,
        f: impl Fn(&SharedString, &mut PlatformWindow, &mut App) + 'static,
    ) -> Self {
        self.on_close_tab = Some(Rc::new(f));
        self
    }

    /// Called when the trailing add button is clicked.
    pub fn on_add_tab(mut self, f: impl Fn(&mut PlatformWindow, &mut App) + 'static) -> Self {
        self.on_add_tab = Some(Rc::new(f));
        self
    }

    /// Trailing control in the title band.
    pub fn toolbar_item(mut self, item: impl IntoElement) -> Self {
        self.toolbar.push(item.into_any_element());
        self
    }

    /// Sidebar column. Rendered only for [`WindowKind::Unified`].
    pub fn sidebar(mut self, sidebar: impl IntoElement) -> Self {
        self.sidebar = Some(sidebar.into_any_element());
        self
    }

    /// Close light callback.
    pub fn on_close(mut self, f: impl Fn(&mut PlatformWindow, &mut App) + 'static) -> Self {
        self.on_close = Some(Rc::new(f));
        self
    }

    /// Minimize light callback.
    pub fn on_minimize(mut self, f: impl Fn(&mut PlatformWindow, &mut App) + 'static) -> Self {
        self.on_minimize = Some(Rc::new(f));
        self
    }

    /// Zoom light callback.
    pub fn on_zoom(mut self, f: impl Fn(&mut PlatformWindow, &mut App) + 'static) -> Self {
        self.on_zoom = Some(Rc::new(f));
        self
    }

    /// Tabs replace the centered title.
    pub fn shows_title(&self) -> bool {
        self.tabs.is_empty()
    }

    /// Titlebar block embedded by [`Self::window_options`].
    pub fn title_bar_options() -> TitlebarOptions {
        let y = (WINDOW_TITLE_BAR_HEIGHT - TRAFFIC_LIGHT_DIAMETER) / 2.;
        TitlebarOptions {
            title: None,
            appears_transparent: true,
            traffic_light_position: Some(point(TRAFFIC_INSET, y)),
        }
    }

    /// Base [`WindowOptions`] for a window whose root chrome is [`Window`]
    /// with [`WindowChrome::Native`].
    pub fn window_options() -> WindowOptions {
        WindowOptions {
            titlebar: Some(Self::title_bar_options()),
            // The title band moves the window via `start_window_move`, so
            // AppKit must not treat it as a system window-move region.
            app_owns_titlebar_drag: true,
            ..Default::default()
        }
    }
}

impl Styled for Window {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl ParentElement for Window {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

fn window_shadow() -> BoxShadow {
    BoxShadow {
        offset: point(px(0.), px(12.)),
        blur_radius: px(32.),
        spread_radius: px(0.),
        inset: false,
        color: rgba(0x00000022).into(),
    }
}

/// Drag bookkeeping for OS chrome. Lives on the window via `use_state`.
struct WindowDragState {
    should_move: bool,
}

impl RenderOnce for Window {
    fn render(self, window: &mut PlatformWindow, cx: &mut App) -> impl IntoElement {
        // Copy theme bits before any mutable `cx` borrow (`window.use_state`).
        let theme = cx.theme().colors.clone();
        let show_shadow = cx.theme().shadow;
        let shows_title = self.shows_title();
        let unified = self.kind == WindowKind::Unified;
        let os_chrome = self.chrome == WindowChrome::Native;
        // AppKit draws the lights on macOS; drawn lights are for previews and
        // for client-decorated Windows / Linux windows.
        let draw_lights = !os_chrome || !cfg!(target_os = "macos");

        let on_close = self.on_close.clone().or_else(|| {
            os_chrome.then(|| {
                Rc::new(|window: &mut PlatformWindow, _: &mut App| window.remove_window()) as LightHandler
            })
        });
        let on_minimize = self.on_minimize.clone().or_else(|| {
            os_chrome.then(|| {
                Rc::new(|window: &mut PlatformWindow, _: &mut App| window.minimize_window()) as LightHandler
            })
        });
        let on_zoom = self.on_zoom.clone().or_else(|| {
            os_chrome.then(|| {
                Rc::new(|window: &mut PlatformWindow, _: &mut App| window.zoom_window()) as LightHandler
            })
        });

        let lights = draw_lights.then(|| {
            traffic_lights(
                &self.id,
                self.active,
                self.edited,
                on_close,
                on_minimize,
                on_zoom,
            )
        });
        let center = if shows_title {
            title_block(&self.title, self.subtitle.clone(), self.active, &theme)
        } else {
            tab_strip(
                &self.id,
                &self.tabs,
                self.active_tab.clone(),
                self.on_select_tab.clone(),
                self.on_close_tab.clone(),
                self.on_add_tab.clone(),
                &theme,
            )
        };
        let toolbar = toolbar_slot(self.toolbar);

        let mut root = div()
            .id(ElementId::Name(format!("mac-window-{}", self.id).into()))
            .flex()
            .flex_col()
            .overflow_hidden()
            .bg(theme.background);
        if os_chrome {
            root = root.size_full();
        } else {
            root = root
                .w_full()
                .min_h(px(140.))
                .rounded(WINDOW_RADIUS)
                .border_1()
                .border_color(theme.window_border)
                .when(show_shadow, |this| this.shadow(vec![window_shadow()]));
        }
        root.style().refine(&self.style);

        let body = div()
            .flex_1()
            .min_h_0()
            .overflow_hidden()
            .bg(theme.background)
            .children(self.children);

        if unified {
            // Lights sit over the sidebar; title + toolbar sit over content.
            let content_title = if os_chrome {
                os_title_band(&self.id, None, center, toolbar, window, cx).into_any_element()
            } else {
                title_band(center, toolbar).into_any_element()
            };

            root.relative()
                .flex_row()
                .child(
                    div()
                        .w(px(180.))
                        .h_full()
                        .flex()
                        .flex_col()
                        .flex_shrink_0()
                        .pt(WINDOW_TITLE_BAR_HEIGHT)
                        .bg(theme.sidebar)
                        .text_color(theme.sidebar_foreground)
                        .border_r_1()
                        .border_color(theme.sidebar_border)
                        .children(self.sidebar),
                )
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .h_full()
                        .flex()
                        .flex_col()
                        .child(content_title)
                        .child(body),
                )
                .when_some(lights, |this, lights| {
                    this.child(
                        div()
                            .absolute()
                            .left(TRAFFIC_INSET)
                            .top_0()
                            .h(WINDOW_TITLE_BAR_HEIGHT)
                            .flex()
                            .items_center()
                            .child(lights),
                    )
                })
        } else {
            let title = if os_chrome {
                os_title_band(&self.id, lights, center, toolbar, window, cx).into_any_element()
            } else if let Some(lights) = lights {
                title_band_with_lights(lights, center, toolbar).into_any_element()
            } else {
                title_band(center, toolbar).into_any_element()
            };
            root.child(title).child(body)
        }
    }
}

fn traffic_lights(
    id: &SharedString,
    active: bool,
    edited: bool,
    on_close: Option<LightHandler>,
    on_minimize: Option<LightHandler>,
    on_zoom: Option<LightHandler>,
) -> TrafficLights {
    let mut lights = TrafficLights::new(format!("mac-window-{id}-lights"))
        .active(active)
        .edited(edited);
    if let Some(on_close) = on_close {
        lights = lights.on_close(move |window, cx| on_close(window, cx));
    }
    if let Some(on_minimize) = on_minimize {
        lights = lights.on_minimize(move |window, cx| on_minimize(window, cx));
    }
    if let Some(on_zoom) = on_zoom {
        lights = lights.on_zoom(move |window, cx| on_zoom(window, cx));
    }
    lights
}

fn title_block(
    title: &SharedString,
    subtitle: Option<SharedString>,
    active: bool,
    theme: &crate::theme::ThemeColor,
) -> AnyElement {
    let color = if active {
        theme.foreground
    } else {
        theme.muted_foreground
    };
    div()
        .flex()
        .flex_col()
        .items_center()
        .justify_center()
        .min_w_0()
        .child(
            div()
                .text_xs()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(color)
                .child(title.clone()),
        )
        .when_some(subtitle, |this, subtitle| {
            this.child(
                div()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child(subtitle),
            )
        })
        .into_any_element()
}

fn tab_strip(
    window_id: &SharedString,
    tabs: &[WindowTab],
    active_tab: Option<SharedString>,
    on_select: Option<TabHandler>,
    on_close: Option<TabHandler>,
    on_add: Option<LightHandler>,
    theme: &crate::theme::ThemeColor,
) -> AnyElement {
    let mut row = div().flex().flex_row().items_center().gap(px(4.));
    for tab in tabs {
        let selected = active_tab.as_ref() == Some(&tab.id);
        let tab_id = tab.id.clone();
        let select = on_select.clone();
        let close_id = tab.id.clone();
        let close = on_close.clone();
        row = row.child(
            div()
                .id(ElementId::Name(
                    format!("mac-window-{window_id}-tab-{}", tab.id).into(),
                ))
                .h(px(20.))
                .px(px(8.))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(4.))
                .rounded(px(6.))
                .cursor_pointer()
                .when(selected, |this| this.bg(theme.muted))
                .hover(|style| style.bg(theme.muted))
                .on_click(move |_, window, cx| {
                    if let Some(select) = &select {
                        select(&tab_id, window, cx);
                    }
                })
                .child(
                    div()
                        .text_xs()
                        .text_color(theme.foreground)
                        .child(tab.label.clone()),
                )
                .child(
                    div()
                        .id(ElementId::Name(
                            format!("mac-window-{window_id}-tab-{}-close", tab.id).into(),
                        ))
                        .size(px(12.))
                        .flex()
                        .items_center()
                        .justify_center()
                        .rounded_full()
                        .on_click(move |_, window, cx| {
                            cx.stop_propagation();
                            if let Some(close) = &close {
                                close(&close_id, window, cx);
                            }
                        })
                        .child(
                            Phosphor::new(PhosphorIcon::X)
                                .size(px(8.))
                                .color(theme.muted_foreground),
                        ),
                ),
        );
    }
    let add = on_add.clone();
    row.child(
        div()
            .id(ElementId::Name(
                format!("mac-window-{window_id}-tab-add").into(),
            ))
            .size(px(16.))
            .flex()
            .items_center()
            .justify_center()
            .rounded_full()
            .cursor_pointer()
            .on_click(move |_, window, cx| {
                if let Some(add) = &add {
                    add(window, cx);
                }
            })
            .child(
                Phosphor::new(PhosphorIcon::Plus)
                    .size(px(10.))
                    .color(theme.muted_foreground),
            ),
    )
    .into_any_element()
}

fn toolbar_slot(items: Vec<AnyElement>) -> AnyElement {
    div()
        .flex()
        .flex_row()
        .items_center()
        .gap(px(4.))
        .children(items)
        .into_any_element()
}

/// Standard title band: centered title or tabs, lights over the leading edge,
/// toolbar over the trailing edge.
fn title_band_with_lights(
    lights: TrafficLights,
    center: AnyElement,
    toolbar: AnyElement,
) -> impl IntoElement {
    div()
        .relative()
        .w_full()
        .h(WINDOW_TITLE_BAR_HEIGHT)
        .flex_shrink_0()
        .child(
            div()
                .size_full()
                .flex()
                .items_center()
                .justify_center()
                .px(TITLE_LEADING_PAD)
                .child(center),
        )
        .child(
            div()
                .absolute()
                .left(TRAFFIC_INSET)
                .top_0()
                .h_full()
                .flex()
                .items_center()
                .child(lights),
        )
        .child(
            div()
                .absolute()
                .right(px(8.))
                .top_0()
                .h_full()
                .flex()
                .items_center()
                .child(toolbar),
        )
}

fn title_band(center: AnyElement, toolbar: AnyElement) -> impl IntoElement {
    div()
        .relative()
        .w_full()
        .h(WINDOW_TITLE_BAR_HEIGHT)
        .flex_shrink_0()
        .child(
            div()
                .size_full()
                .flex()
                .items_center()
                .justify_center()
                .px(px(48.))
                .child(center),
        )
        .child(
            div()
                .absolute()
                .right(px(8.))
                .top_0()
                .h_full()
                .flex()
                .items_center()
                .child(toolbar),
        )
}

/// OS title band: same layout as the embedded band, plus drag / double-click.
fn os_title_band(
    id: &str,
    lights: Option<TrafficLights>,
    center: AnyElement,
    toolbar: AnyElement,
    window: &mut PlatformWindow,
    _cx: &mut App,
) -> impl IntoElement {
    let is_macos = cfg!(target_os = "macos");
    let is_linux = cfg!(target_os = "linux");
    let state = window.use_state(_cx, |_, _| WindowDragState {
        should_move: false,
    });
    let fullscreen = window.is_fullscreen();

    let mut band = div()
        .id(ElementId::Name(format!("mac-window-{id}-title").into()))
        .relative()
        .w_full()
        .h(WINDOW_TITLE_BAR_HEIGHT)
        .flex_shrink_0()
        .window_control_area(WindowControlArea::Drag)
        .on_mouse_down_out(window.listener_for(&state, |state, _, _, _| {
            state.should_move = false;
        }))
        .on_mouse_down(
            MouseButton::Left,
            window.listener_for(&state, |state, _, _, _| {
                state.should_move = true;
            }),
        )
        .on_mouse_up(
            MouseButton::Left,
            window.listener_for(&state, |state, _, _, _| {
                state.should_move = false;
            }),
        )
        .on_mouse_move(window.listener_for(&state, |state, _, window, _| {
            if state.should_move {
                state.should_move = false;
                window.start_window_move();
            }
        }));

    if is_macos {
        band = band.on_click(|event, window, _| {
            if event.click_count() == 2 {
                window.titlebar_double_click();
            }
        });
    }
    if is_linux {
        band = band.on_click(|event, window, _| {
            if event.click_count() == 2 {
                window.zoom_window();
            }
        });
    }

    band.child(
        div()
            .size_full()
            .flex()
            .items_center()
            .justify_center()
            .when(fullscreen, |this| this.px(px(12.)))
            .when(!fullscreen, |this| this.px(TITLE_LEADING_PAD))
            .child(center),
    )
    .when_some(lights, |this, lights| {
        this.child(
            div()
                .absolute()
                .left(TRAFFIC_INSET)
                .top_0()
                .h_full()
                .flex()
                .items_center()
                .child(lights),
        )
    })
    .child(
        div()
            .absolute()
            .right(px(8.))
            .top_0()
            .h_full()
            .flex()
            .items_center()
            .child(toolbar),
    )
}

// ── OS window, actions, and app menu ─────────────────────────────────

actions!(
    celestia_ui,
    [
        NewWindow,
        CloseWindow,
        MinimizeWindow,
        ZoomWindow,
        ToggleFullScreen,
        ShowHelp,
        EditUndo,
        EditRedo,
        EditCut,
        EditCopy,
        EditPaste,
        EditSelectAll,
    ]
);

/// Default size of a window opened with [`open_window`].
pub const WINDOW_SIZE: gpui::Size<Pixels> = size(px(960.), px(640.));

/// Smallest size AppKit will allow. Keeps a resize from collapsing the frame.
pub const WINDOW_MIN_SIZE: gpui::Size<Pixels> = size(px(640.), px(420.));

/// [`WindowOptions`] for an app window: transparent title bar, traffic-light
/// inset, a centered size, and a minimum size. Pair with a root
/// [`Window`] using [`WindowChrome::Native`]. Resize
/// stays with the platform (AppKit on macOS).
pub fn open_window_options(cx: &mut App) -> WindowOptions {
    WindowOptions {
        window_bounds: Some(WindowBounds::centered(WINDOW_SIZE, cx)),
        window_min_size: Some(WINDOW_MIN_SIZE),
        #[cfg(target_os = "linux")]
        window_background: gpui::WindowBackgroundAppearance::Transparent,
        #[cfg(target_os = "linux")]
        window_decorations: Some(gpui::WindowDecorations::Client),
        ..Window::window_options()
    }
}

/// Open a new OS window. `build` returns the root view, usually
/// `Root::new(...)`. The title is applied with `set_window_title`.
pub fn open_window<V: 'static + Render>(
    title: impl Into<SharedString>,
    cx: &mut App,
    build: impl FnOnce(&mut PlatformWindow, &mut App) -> Entity<V> + 'static,
) -> gpui::Result<WindowHandle<V>> {
    let title = title.into();
    let options = open_window_options(cx);
    cx.open_window(options, move |window, cx| {
        window.set_window_title(&title);
        build(window, cx)
    })
}

/// Bind New, Close, Minimize, and Enter Full Screen.
///
/// macOS uses ⌘N, ⌘W, ⌘M, and ⌃⌘F. Other platforms use Ctrl+N, Ctrl+W,
/// Ctrl+M, and F11. Zoom stays on the green traffic light and on any Window
/// menu the host adds — macOS has no single zoom shortcut.
pub fn bind_window_keys(cx: &mut App) {
    #[cfg(target_os = "macos")]
    cx.bind_keys([
        gpui::KeyBinding::new("cmd-n", NewWindow, None),
        gpui::KeyBinding::new("cmd-w", CloseWindow, None),
        gpui::KeyBinding::new("cmd-m", MinimizeWindow, None),
        gpui::KeyBinding::new("cmd-ctrl-f", ToggleFullScreen, None),
    ]);
    #[cfg(not(target_os = "macos"))]
    cx.bind_keys([
        gpui::KeyBinding::new("ctrl-n", NewWindow, None),
        gpui::KeyBinding::new("ctrl-w", CloseWindow, None),
        gpui::KeyBinding::new("ctrl-m", MinimizeWindow, None),
        gpui::KeyBinding::new("f11", ToggleFullScreen, None),
    ]);
}

/// The application menu bar. `install` replaces the bar via `cx.set_menus`.
///
/// The first menu is the application menu. macOS draws its title bold and
/// keeps it when the pointer reveals the bar in fullscreen. [`Self::without`]
/// will not remove it.
pub struct AppMenu {
    menus: Vec<Menu>,
}

impl AppMenu {
    /// Only the application menu. File, Edit, View, and Help are left out.
    pub fn new(app_name: impl Into<SharedString>) -> Self {
        Self {
            menus: vec![Menu::new(app_name)],
        }
    }

    /// Application menu plus File, Edit, View, and Help.
    ///
    /// File has New Window and Close. Edit has the standard editing actions
    /// wired to [`OsAction`]. View has Enter Full Screen. Help has one
    /// placeholder item. Add, replace, or drop menus before [`Self::install`].
    pub fn standard(app_name: impl Into<SharedString>) -> Self {
        Self::new(app_name)
            .menu(file_menu())
            .menu(edit_menu())
            .menu(view_menu())
            .menu(help_menu())
    }

    /// Change the application menu's title. It stays at index 0.
    pub fn rename_app(mut self, name: impl Into<SharedString>) -> Self {
        if let Some(app) = self.menus.first_mut() {
            app.name = name.into();
        }
        self
    }

    /// Append `menu`, or replace the existing menu with the same name.
    pub fn menu(mut self, menu: Menu) -> Self {
        if let Some(existing) = self
            .menus
            .iter_mut()
            .find(|existing| existing.name == menu.name)
        {
            *existing = menu;
        } else {
            self.menus.push(menu);
        }
        self
    }

    /// Append an item to the named menu. Creates that menu at the end when missing.
    pub fn item(mut self, menu_name: impl Into<SharedString>, item: MenuItem) -> Self {
        let menu_name = menu_name.into();
        if let Some(menu) = self.menus.iter_mut().find(|menu| menu.name == menu_name) {
            menu.items.push(item);
        } else {
            self.menus.push(Menu::new(menu_name).items(vec![item]));
        }
        self
    }

    /// Drop the named menu. Unknown names are ignored. The application menu stays.
    pub fn without(mut self, name: &str) -> Self {
        let Some(app) = self.menus.first().map(|menu| menu.name.clone()) else {
            return self;
        };
        if app.as_ref() == name {
            return self;
        }
        self.menus.retain(|menu| menu.name.as_ref() != name);
        self
    }

    /// Menu titles, in order. The gallery preview paints these.
    pub fn titles(&self) -> Vec<SharedString> {
        self.menus.iter().map(|menu| menu.name.clone()).collect()
    }

    /// The menus that [`Self::install`] will send.
    pub fn menus(&self) -> &[Menu] {
        &self.menus
    }

    /// Replace the process menu bar. Fullscreen reveals this list on top-edge hover.
    pub fn install(self, cx: &App) {
        cx.set_menus(self.menus);
    }
}

fn file_menu() -> Menu {
    Menu::new("File").items(vec![
        MenuItem::action("New Window", NewWindow),
        MenuItem::action("Close", CloseWindow),
    ])
}

fn edit_menu() -> Menu {
    Menu::new("Edit").items(vec![
        MenuItem::os_action("Undo", EditUndo, OsAction::Undo),
        MenuItem::os_action("Redo", EditRedo, OsAction::Redo),
        MenuItem::separator(),
        MenuItem::os_action("Cut", EditCut, OsAction::Cut),
        MenuItem::os_action("Copy", EditCopy, OsAction::Copy),
        MenuItem::os_action("Paste", EditPaste, OsAction::Paste),
        MenuItem::os_action("Select All", EditSelectAll, OsAction::SelectAll),
    ])
}

fn view_menu() -> Menu {
    Menu::new("View").items(vec![MenuItem::action(
        "Enter Full Screen",
        ToggleFullScreen,
    )])
}

fn help_menu() -> Menu {
    Menu::new("Help").items(vec![MenuItem::action("Help", ShowHelp)])
}

/// In-view preview of a [`AppMenu`]'s titles. The live fullscreen reveal is
/// the system bar installed with [`AppMenu::install`], not this element.
#[derive(IntoElement)]
pub struct MenuBarPreview {
    titles: Vec<SharedString>,
    style: StyleRefinement,
}

impl MenuBarPreview {
    /// Paint `menu`'s titles in menu-bar order.
    pub fn new(menu: &AppMenu) -> Self {
        Self {
            titles: menu.titles(),
            style: StyleRefinement::default(),
        }
    }
}

impl Styled for MenuBarPreview {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MenuBarPreview {
    fn render(self, _: &mut PlatformWindow, cx: &mut App) -> impl IntoElement {
        use crate::theme::ActiveTheme as _;

        let theme = cx.theme();
        let mut root = div()
            .h(px(24.))
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(14.))
            .px(px(12.))
            .bg(theme.title_bar)
            .border_b_1()
            .border_color(theme.title_bar_border)
            .text_size(px(13.));
        root.style().refine(&self.style);

        let mut titles = self.titles.into_iter();
        if let Some(app) = titles.next() {
            root = root.child(
                div()
                    .font_weight(FontWeight::BOLD)
                    .text_color(theme.foreground)
                    .child(app),
            );
        }
        root.children(titles.map(|title| div().text_color(theme.foreground).child(title)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::TestAppContext;

    #[test]
    fn metrics_match_the_title_band() {
        assert_eq!(WINDOW_TITLE_BAR_HEIGHT, px(28.0));
        assert_eq!(TRAFFIC_INSET, px(20.0));
        assert_eq!(WINDOW_RADIUS, px(10.0));
    }

    #[test]
    fn tabs_replace_the_centered_title() {
        let plain = Window::new("notes", "Notes");
        assert!(plain.shows_title());
        assert_eq!(plain.kind, WindowKind::Standard);
        assert_eq!(plain.chrome, WindowChrome::Embedded);

        let tabbed = Window::new("docs", "Docs").tab(WindowTab::new("a", "Notes"));
        assert!(!tabbed.shows_title());
    }

    #[test]
    fn window_options_own_the_titlebar_drag() {
        let options = Window::window_options();
        assert!(options.app_owns_titlebar_drag);
        let titlebar = options.titlebar.expect("window_options sets a titlebar");
        assert!(titlebar.appears_transparent);
        let y = (WINDOW_TITLE_BAR_HEIGHT - TRAFFIC_LIGHT_DIAMETER) / 2.;
        assert_eq!(
            titlebar.traffic_light_position,
            Some(point(TRAFFIC_INSET, y))
        );
    }

    fn action_names(menu: &Menu) -> Vec<&str> {
        menu.items
            .iter()
            .filter_map(|item| match item {
                MenuItem::Action { name, .. } => Some(name.as_ref()),
                MenuItem::Separator => None,
                MenuItem::Submenu(_) | MenuItem::SystemMenu(_) => None,
            })
            .collect()
    }

    #[test]
    fn standard_menu_is_the_starting_point() {
        let menu = AppMenu::standard("Celestia");
        let owned = menu.titles();
        let titles: Vec<&str> = owned.iter().map(|title| title.as_ref()).collect();
        assert_eq!(titles, ["Celestia", "File", "Edit", "View", "Help"]);
        assert_eq!(action_names(&menu.menus()[1]), ["New Window", "Close"]);
        assert_eq!(
            action_names(&menu.menus()[2]),
            ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All"]
        );
        assert_eq!(action_names(&menu.menus()[3]), ["Enter Full Screen"]);
        assert_eq!(action_names(&menu.menus()[4]), ["Help"]);
    }

    #[test]
    fn menu_item_and_without_customize_the_bar() {
        let replaced = AppMenu::standard("Celestia")
            .menu(Menu::new("File").items(vec![MenuItem::action("Open", ShowHelp)]));
        assert_eq!(action_names(&replaced.menus()[1]), ["Open"]);

        let appended =
            AppMenu::standard("Celestia").item("File", MenuItem::action("Open", ShowHelp));
        assert_eq!(
            action_names(&appended.menus()[1]),
            ["New Window", "Close", "Open"]
        );

        let created = AppMenu::new("Celestia")
            .item("Window", MenuItem::action("Minimize", MinimizeWindow));
        let created_titles = created.titles();
        let titles: Vec<&str> = created_titles.iter().map(|title| title.as_ref()).collect();
        assert_eq!(titles, ["Celestia", "Window"]);

        let trimmed = AppMenu::standard("Celestia")
            .without("Help")
            .without("Celestia");
        let trimmed_titles = trimmed.titles();
        let titles: Vec<&str> = trimmed_titles.iter().map(|title| title.as_ref()).collect();
        assert_eq!(titles, ["Celestia", "File", "Edit", "View"]);

        let only = AppMenu::new("Only");
        assert_eq!(
            only.titles()
                .iter()
                .map(|title| title.as_ref())
                .collect::<Vec<_>>(),
            ["Only"]
        );
        assert_eq!(
            AppMenu::new("A")
                .rename_app("B")
                .titles()
                .iter()
                .map(|title| title.as_ref())
                .collect::<Vec<_>>(),
            ["B"]
        );
    }

    #[gpui::test]
    fn open_window_options_include_the_title_bar(cx: &mut TestAppContext) {
        cx.update(|cx| {
            let options = open_window_options(cx);
            let titlebar = options
                .titlebar
                .expect("open_window_options sets a titlebar");
            let direct = Window::title_bar_options();
            assert!(titlebar.appears_transparent);
            assert!(options.app_owns_titlebar_drag);
            assert_eq!(
                titlebar.traffic_light_position,
                direct.traffic_light_position
            );
            assert!(options.window_min_size.is_some());
            assert!(options.window_bounds.is_some());
        });
    }
}
