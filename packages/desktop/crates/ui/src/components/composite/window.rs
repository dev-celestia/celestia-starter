//! macOS window frame — in-view previews and real OS window chrome.
//!
//! [`MacWindow`] draws traffic lights, a centered title (or title-bar tabs),
//! an optional toolbar slot, and a unified sidebar that runs under the lights.
//!
//! - [`MacWindowChrome::Embedded`] (default) — framed preview with border,
//!   radius, and shadow. Always draws lights.
//! - [`MacWindowChrome::Window`] — root of a real OS window opened with
//!   [`Self::window_options`] / [`super::windowing::open_mac_window`]. No outer
//!   frame. On macOS, AppKit draws the lights; elsewhere the drawn lights drive
//!   close / minimize / zoom.
//!
//! Mac-first chrome for now; Windows / Linux frames land here later.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, BoxShadow, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    MouseButton, ParentElement, Pixels, Refineable as _, RenderOnce, SharedString,
    StatefulInteractiveElement as _, StyleRefinement, Styled, TitlebarOptions, Window,
    WindowControlArea, WindowOptions, div, point, px, rgba,
};

use super::traffic_lights::{TRAFFIC_LIGHT_DIAMETER, TrafficLights};
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Title-bar height for a standard Mac window.
pub const MAC_TITLE_BAR_HEIGHT: Pixels = px(28.);

/// Distance from the window's left edge to the first traffic light.
pub const MAC_TRAFFIC_INSET: Pixels = px(20.);

/// Corner radius of a macOS window.
pub const MAC_WINDOW_RADIUS: Pixels = px(10.);

/// Leading padding that clears AppKit (or drawn) traffic lights.
const MAC_TITLE_LEADING_PAD: Pixels = px(80.);

/// How the frame lays out its title bar and sidebar.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
pub enum MacWindowKind {
    /// Title band across the top. Sidebar slot is ignored.
    #[default]
    Standard,
    /// Sidebar column runs to the top of the frame. Lights sit on top of it.
    /// The title and toolbar sit over the content column.
    Unified,
}

/// Whether this frame is an in-view preview or the root of a real OS window.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
pub enum MacWindowChrome {
    /// Framed preview: border, radius, shadow, always-drawn lights.
    #[default]
    Embedded,
    /// Real OS window root: full size, no outer chrome. AppKit lights on macOS.
    Window,
}

/// One title-bar tab. The host owns which id is active.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct MacWindowTab {
    /// Stable id passed to select and close callbacks.
    pub id: SharedString,
    /// Label drawn in the tab.
    pub label: SharedString,
}

impl MacWindowTab {
    /// A tab with the given id and label.
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
        }
    }
}

type TabHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>;
type LightHandler = Rc<dyn Fn(&mut Window, &mut App) + 'static>;

/// A framed macOS window surface.
#[derive(IntoElement)]
pub struct MacWindow {
    id: SharedString,
    style: StyleRefinement,
    title: SharedString,
    subtitle: Option<SharedString>,
    active: bool,
    edited: bool,
    kind: MacWindowKind,
    chrome: MacWindowChrome,
    tabs: Vec<MacWindowTab>,
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

impl MacWindow {
    /// An active standard window with the given title.
    pub fn new(id: impl Into<SharedString>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: title.into(),
            subtitle: None,
            active: true,
            edited: false,
            kind: MacWindowKind::Standard,
            chrome: MacWindowChrome::Embedded,
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
    pub fn kind(mut self, kind: MacWindowKind) -> Self {
        self.kind = kind;
        self
    }

    /// Embedded preview (default) or real OS window chrome.
    pub fn chrome(mut self, chrome: MacWindowChrome) -> Self {
        self.chrome = chrome;
        self
    }

    /// Append a title-bar tab. Any tab hides the centered title.
    pub fn tab(mut self, tab: MacWindowTab) -> Self {
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
        f: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_select_tab = Some(Rc::new(f));
        self
    }

    /// Called with the tab id when its close glyph is clicked.
    pub fn on_close_tab(
        mut self,
        f: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_close_tab = Some(Rc::new(f));
        self
    }

    /// Called when the trailing add button is clicked.
    pub fn on_add_tab(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_add_tab = Some(Rc::new(f));
        self
    }

    /// Trailing control in the title band.
    pub fn toolbar_item(mut self, item: impl IntoElement) -> Self {
        self.toolbar.push(item.into_any_element());
        self
    }

    /// Sidebar column. Rendered only for [`MacWindowKind::Unified`].
    pub fn sidebar(mut self, sidebar: impl IntoElement) -> Self {
        self.sidebar = Some(sidebar.into_any_element());
        self
    }

    /// Close light callback.
    pub fn on_close(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_close = Some(Rc::new(f));
        self
    }

    /// Minimize light callback.
    pub fn on_minimize(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_minimize = Some(Rc::new(f));
        self
    }

    /// Zoom light callback.
    pub fn on_zoom(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_zoom = Some(Rc::new(f));
        self
    }

    /// Tabs replace the centered title.
    pub fn shows_title(&self) -> bool {
        self.tabs.is_empty()
    }

    /// Titlebar block embedded by [`Self::window_options`].
    pub fn title_bar_options() -> TitlebarOptions {
        let y = (MAC_TITLE_BAR_HEIGHT - TRAFFIC_LIGHT_DIAMETER) / 2.;
        TitlebarOptions {
            title: None,
            appears_transparent: true,
            traffic_light_position: Some(point(MAC_TRAFFIC_INSET, y)),
        }
    }

    /// Base [`WindowOptions`] for a window whose root chrome is [`MacWindow`]
    /// with [`MacWindowChrome::Window`].
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

impl Styled for MacWindow {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl ParentElement for MacWindow {
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
struct MacWindowDragState {
    should_move: bool,
}

impl RenderOnce for MacWindow {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        // Copy theme bits before any mutable `cx` borrow (`window.use_state`).
        let theme = cx.theme().colors.clone();
        let show_shadow = cx.theme().shadow;
        let shows_title = self.shows_title();
        let unified = self.kind == MacWindowKind::Unified;
        let os_chrome = self.chrome == MacWindowChrome::Window;
        // AppKit draws the lights on macOS; drawn lights are for previews and
        // for client-decorated Windows / Linux windows.
        let draw_lights = !os_chrome || !cfg!(target_os = "macos");

        let on_close = self.on_close.clone().or_else(|| {
            os_chrome.then(|| {
                Rc::new(|window: &mut Window, _: &mut App| window.remove_window()) as LightHandler
            })
        });
        let on_minimize = self.on_minimize.clone().or_else(|| {
            os_chrome.then(|| {
                Rc::new(|window: &mut Window, _: &mut App| window.minimize_window()) as LightHandler
            })
        });
        let on_zoom = self.on_zoom.clone().or_else(|| {
            os_chrome.then(|| {
                Rc::new(|window: &mut Window, _: &mut App| window.zoom_window()) as LightHandler
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
                .rounded(MAC_WINDOW_RADIUS)
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
                        .pt(MAC_TITLE_BAR_HEIGHT)
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
                            .left(MAC_TRAFFIC_INSET)
                            .top_0()
                            .h(MAC_TITLE_BAR_HEIGHT)
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
    tabs: &[MacWindowTab],
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
        .h(MAC_TITLE_BAR_HEIGHT)
        .flex_shrink_0()
        .child(
            div()
                .size_full()
                .flex()
                .items_center()
                .justify_center()
                .px(MAC_TITLE_LEADING_PAD)
                .child(center),
        )
        .child(
            div()
                .absolute()
                .left(MAC_TRAFFIC_INSET)
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
        .h(MAC_TITLE_BAR_HEIGHT)
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
    window: &mut Window,
    _cx: &mut App,
) -> impl IntoElement {
    let is_macos = cfg!(target_os = "macos");
    let is_linux = cfg!(target_os = "linux");
    let state = window.use_state(_cx, |_, _| MacWindowDragState {
        should_move: false,
    });
    let fullscreen = window.is_fullscreen();

    let mut band = div()
        .id(ElementId::Name(format!("mac-window-{id}-title").into()))
        .relative()
        .w_full()
        .h(MAC_TITLE_BAR_HEIGHT)
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
            .when(!fullscreen, |this| this.px(MAC_TITLE_LEADING_PAD))
            .child(center),
    )
    .when_some(lights, |this, lights| {
        this.child(
            div()
                .absolute()
                .left(MAC_TRAFFIC_INSET)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn metrics_match_the_mac_title_band() {
        assert_eq!(MAC_TITLE_BAR_HEIGHT, px(28.0));
        assert_eq!(MAC_TRAFFIC_INSET, px(20.0));
        assert_eq!(MAC_WINDOW_RADIUS, px(10.0));
    }

    #[test]
    fn tabs_replace_the_centered_title() {
        let plain = MacWindow::new("notes", "Notes");
        assert!(plain.shows_title());
        assert_eq!(plain.kind, MacWindowKind::Standard);
        assert_eq!(plain.chrome, MacWindowChrome::Embedded);

        let tabbed = MacWindow::new("docs", "Docs").tab(MacWindowTab::new("a", "Notes"));
        assert!(!tabbed.shows_title());
    }

    #[test]
    fn window_options_own_the_titlebar_drag() {
        let options = MacWindow::window_options();
        assert!(options.app_owns_titlebar_drag);
        let titlebar = options.titlebar.expect("window_options sets a titlebar");
        assert!(titlebar.appears_transparent);
        let y = (MAC_TITLE_BAR_HEIGHT - TRAFFIC_LIGHT_DIAMETER) / 2.;
        assert_eq!(
            titlebar.traffic_light_position,
            Some(point(MAC_TRAFFIC_INSET, y))
        );
    }
}
