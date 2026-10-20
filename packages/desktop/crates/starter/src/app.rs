//! Root window view — replace this with your screens.
//!
//! Pattern to copy:
//! 1. Hold UI state on the entity (`clicks`, `page`, …).
//! 2. Mutate with `cx.notify()` so GPUI re-renders.
//! 3. Build the tree from `celestia_ui::components::*` and theme via `cx.theme()`.
//! 4. Talk to `apps/api` through `celestia_bridge` (never import the DB).
//! 5. Windowing via `composite/windowing` — `open_mac_window`, `MacAppMenu`, actions.

use crate::actions::ToggleTheme;
use celestia_bridge::{BridgeClient, Health, brief};
use celestia_ui::components::Card;
use celestia_ui::components::HorizontalAlignment;
use celestia_ui::components::SectionHeading;
use celestia_ui::components::VStack;
use celestia_ui::components::composite::sidebar_layout::{
    SidebarFooter, SidebarHeader, SidebarLayout, SidebarNav, SidebarNavItem, SidebarSection,
};
use celestia_ui::components::composite::window::{
    MacWindow, MacWindowChrome, MacWindowKind, MacWindowTab,
};
use celestia_ui::components::composite::windowing::{
    CloseWindow, MinimizeWindow, NewWindow, ShowHelp, ToggleFullScreen, ZoomWindow,
    open_mac_window,
};
use celestia_ui::components::primitive::badge::{Badge, BadgeVariant};
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::icon::PhosphorIcon;
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::toast::{Notification, WindowExt as _};
use celestia_ui::theme::{ActiveTheme as _, Theme};
use gpui::*;

#[derive(Clone, Copy, PartialEq, Eq)]
enum Page {
    Home,
    Backend,
    About,
}

#[derive(Clone)]
enum HealthState {
    Idle,
    Loading,
    Ok(Health),
    Err(String),
}

pub struct StarterApp {
    focus_handle: FocusHandle,
    page: Page,
    clicks: u32,
    bridge: BridgeClient,
    health: HealthState,
}

impl StarterApp {
    pub fn new(_window: &mut Window, cx: &mut Context<Self>) -> Self {
        Self {
            focus_handle: cx.focus_handle(),
            page: Page::Home,
            clicks: 0,
            bridge: BridgeClient::from_env(),
            health: HealthState::Idle,
        }
    }

    fn toggle_theme(cx: &mut App) {
        Theme::toggle(cx);
    }

    /// Open another starter window. File → New Window and the Home controls
    /// both call this (`composite/windowing::open_mac_window`).
    pub fn open_sub_window(cx: &mut App) {
        let _ = open_mac_window("Celestia Starter", cx, |window, cx| {
            let view = cx.new(|cx| Self::new(window, cx));
            cx.new(|cx| gpui_component::Root::new(view, window, cx))
        });
    }

    fn go(&mut self, page: Page, cx: &mut Context<Self>) {
        self.page = page;
        cx.notify();
    }

    fn bump(&mut self, cx: &mut Context<Self>) {
        self.clicks = self.clicks.saturating_add(1);
        cx.notify();
    }

    fn ping_backend(&mut self, cx: &mut Context<Self>) {
        self.health = HealthState::Loading;
        cx.notify();

        let bridge = self.bridge.clone();
        celestia_bridge::run(
            cx,
            move || bridge.health(),
            |this, result, cx| {
                this.health = match result {
                    Ok(health) => HealthState::Ok(health),
                    Err(err) => HealthState::Err(brief(&err)),
                };
                cx.notify();
            },
        )
        .detach();
    }
}

impl Render for StarterApp {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        // Dialog / sheet / toast overlays are mounted by `celestia_ui::init`
        // (gpui-component 0.7 root plugin). Do not re-mount them here.

        div()
            .id("starter")
            .role(Role::Group)
            .aria_label("Celestia starter")
            .key_context("StarterApp")
            .track_focus(&self.focus_handle)
            .on_action(cx.listener(|_, _: &ToggleTheme, _, cx| Self::toggle_theme(cx)))
            .on_action(|_: &NewWindow, _, cx| Self::open_sub_window(cx))
            .on_action(|_: &CloseWindow, window, _| window.remove_window())
            .on_action(|_: &MinimizeWindow, window, _| window.minimize_window())
            .on_action(|_: &ZoomWindow, window, _| window.zoom_window())
            .on_action(|_: &ToggleFullScreen, window, _| window.toggle_fullscreen())
            .on_action(|_: &ShowHelp, window, cx| {
                window.push_notification(
                    Notification::info(
                        "Help — File → New Window, Window → Minimize / Zoom, View → Full Screen.",
                    ),
                    cx,
                );
            })
            .size_full()
            .child(
                MacWindow::new("starter", "Celestia Starter")
                    .chrome(MacWindowChrome::Window)
                    .toolbar_item(
                        Button::new("title-new-window")
                            .variant(ButtonVariant::Ghost)
                            .size(ButtonSize::Small)
                            .label("New Window")
                            .on_click(|_, _, cx| StarterApp::open_sub_window(cx)),
                    )
                    .child(self.render_shell(cx)),
            )
    }
}

impl StarterApp {
    fn render_shell(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let is_dark = cx.theme().is_dark();

        SidebarLayout::new("shell")
            .sidebar(
                SidebarHeader::new().child(
                    div()
                        .flex()
                        .flex_col()
                        .gap_0p5()
                        .child(
                            div()
                                .text_sm()
                                .font_weight(FontWeight::SEMIBOLD)
                                .child("My App"),
                        )
                        .child(
                            div()
                                .text_xs()
                                .text_color(cx.theme().sidebar_foreground.opacity(0.7))
                                .child("celestia-desktop-starter"),
                        ),
                ),
            )
            .sidebar(SidebarSection::new("Navigate"))
            .sidebar(
                SidebarNav::new("nav")
                    .child(
                        SidebarNavItem::new("home", "Home")
                            .icon(PhosphorIcon::House)
                            .selected(self.page == Page::Home)
                            .on_click(cx.listener(|this, _, _, cx| this.go(Page::Home, cx))),
                    )
                    .child(
                        SidebarNavItem::new("backend", "Backend")
                            .icon(PhosphorIcon::HardDrives)
                            .selected(self.page == Page::Backend)
                            .on_click(cx.listener(|this, _, _, cx| this.go(Page::Backend, cx))),
                    )
                    .child(
                        SidebarNavItem::new("about", "About")
                            .icon(PhosphorIcon::Info)
                            .selected(self.page == Page::About)
                            .on_click(cx.listener(|this, _, _, cx| this.go(Page::About, cx))),
                    ),
            )
            .sidebar(
                SidebarFooter::new().child(
                    Button::new("theme")
                        .variant(ButtonVariant::Ghost)
                        .leading_icon(if is_dark {
                            PhosphorIcon::Sun
                        } else {
                            PhosphorIcon::Moon
                        })
                        .label(if is_dark { "Light mode" } else { "Dark mode" })
                        .on_click(|_, _, cx| Theme::toggle(cx)),
                ),
            )
            .content(self.render_page(cx))
    }

    fn render_page(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let body: AnyElement = match self.page {
            Page::Home => self.render_home(cx).into_any_element(),
            Page::Backend => self.render_backend(cx).into_any_element(),
            Page::About => self.render_about(cx).into_any_element(),
        };

        div()
            .id("content")
            .size_full()
            .overflow_y_scroll()
            .p_6()
            .child(body)
    }

    fn render_home(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let theme_stroke = Keystroke::parse(if cfg!(target_os = "macos") {
            "cmd-d"
        } else {
            "ctrl-d"
        })
        .expect("valid keystroke");

        VStack::new(HorizontalAlignment::Leading)
            .spacing(px(16.))
            .child(
                SectionHeading::new("Welcome")
                    .eyebrow("GETTING STARTED")
                    .description(
                        "This crate is the copy-paste skeleton for a Celestia Desktop app. \
                         Edit `app.rs`, keep `main.rs` for bootstrap.",
                    ),
            )
            .child(
                Card::new()
                    .title("Hello, Celestia")
                    .description("A button, local entity state, and theme tokens.")
                    .child(
                        VStack::new(HorizontalAlignment::Leading)
                            .spacing(px(12.))
                            .child(
                                div()
                                    .text_sm()
                                    .text_color(cx.theme().muted_foreground)
                                    .child(format!("Clicks: {}", self.clicks)),
                            )
                            .child(
                                Button::new("bump")
                                    .variant(ButtonVariant::Primary)
                                    .leading_icon(PhosphorIcon::Plus)
                                    .label("Increment")
                                    .on_click(cx.listener(|this, _, _, cx| this.bump(cx))),
                            ),
                    ),
            )
            .child(
                Card::new()
                    .title("Windowing")
                    .description(
                        "composite/window + composite/windowing — Mac-first today. \
                         New Window opens a real OS window; menu bar is installed in main.rs.",
                    )
                    .child(
                        VStack::new(HorizontalAlignment::Leading)
                            .spacing(px(12.))
                            .child(
                                div()
                                    .flex()
                                    .flex_row()
                                    .flex_wrap()
                                    .gap(px(8.))
                                    .child(
                                        Button::new("home-new-window")
                                            .label("New Window")
                                            .on_click(|_, _, cx| StarterApp::open_sub_window(cx)),
                                    )
                                    .child(
                                        Button::new("home-minimize")
                                            .variant(ButtonVariant::Outline)
                                            .label("Minimize")
                                            .on_click(|_, window, _| window.minimize_window()),
                                    )
                                    .child(
                                        Button::new("home-zoom")
                                            .variant(ButtonVariant::Outline)
                                            .label("Zoom")
                                            .on_click(|_, window, _| window.zoom_window()),
                                    )
                                    .child(
                                        Button::new("home-fullscreen")
                                            .variant(ButtonVariant::Outline)
                                            .label("Full Screen")
                                            .on_click(|_, window, _| window.toggle_fullscreen()),
                                    ),
                            )
                            .child(
                                MacWindow::new("starter-preview", "Notes")
                                    .subtitle("composite/window")
                                    .kind(MacWindowKind::Unified)
                                    .h(px(160.))
                                    .on_minimize(|window, _| window.minimize_window())
                                    .on_zoom(|window, _| window.zoom_window())
                                    .sidebar(
                                        div()
                                            .px(px(12.))
                                            .py(px(8.))
                                            .text_xs()
                                            .child("Sidebar"),
                                    )
                                    .tab(MacWindowTab::new("a", "Notes"))
                                    .tab(MacWindowTab::new("b", "Todo"))
                                    .active_tab("a")
                                    .child(
                                        div()
                                            .p(px(12.))
                                            .text_sm()
                                            .text_color(cx.theme().muted_foreground)
                                            .child(
                                                "Embedded preview. Real chrome uses MacWindowChrome::Window.",
                                            ),
                                    ),
                            ),
                    ),
            )
            .child(
                div()
                    .flex()
                    .items_center()
                    .gap_2()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .child("Toggle theme with")
                    .child(Kbd::new(theme_stroke))
                    .child("· New Window with ⌘N · Full Screen with ⌃⌘F"),
            )
    }

    fn render_backend(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let (badge, label, detail) = match &self.health {
            HealthState::Idle => (
                BadgeVariant::Secondary,
                "Idle",
                "Click Ping to call GET /api/health.".to_string(),
            ),
            HealthState::Loading => (
                BadgeVariant::Secondary,
                "Loading",
                "Waiting for apps/api…".to_string(),
            ),
            HealthState::Ok(health) => (
                BadgeVariant::Success,
                "Online",
                format!("status = \"{}\"", health.status),
            ),
            HealthState::Err(msg) => {
                let detail = if msg.contains("Connection") || msg.contains("request failed") {
                    format!(
                        "{msg} — start the API with `pnpm --filter @workspace/api dev` \
                         (default {}).",
                        self.bridge.base_url()
                    )
                } else {
                    msg.clone()
                };
                (BadgeVariant::Destructive, "Error", detail)
            }
        };

        VStack::new(HorizontalAlignment::Leading)
            .spacing(px(16.))
            .child(
                SectionHeading::new("Backend bridge")
                    .eyebrow("CELESTIA-BRIDGE")
                    .description(
                        "Desktop UI talks to apps/api over HTTP — the same boundary as the \
                         web app. No database access from GPUI.",
                    ),
            )
            .child(
                Card::new()
                    .title("Health check")
                    .description(format!("Base URL: {}", self.bridge.base_url()))
                    .child(
                        VStack::new(HorizontalAlignment::Leading)
                            .spacing(px(12.))
                            .child(status_line(cx, badge, label, detail))
                            .child(
                                Button::new("ping")
                                    .variant(ButtonVariant::Primary)
                                    .leading_icon(PhosphorIcon::ArrowClockwise)
                                    .label(match self.health {
                                        HealthState::Loading => "Pinging…",
                                        _ => "Ping /api/health",
                                    })
                                    .disabled(matches!(self.health, HealthState::Loading))
                                    .on_click(cx.listener(|this, _, _, cx| this.ping_backend(cx))),
                            ),
                    ),
            )
            .child(
                Card::new().title("Next steps").child(
                    VStack::new(HorizontalAlignment::Leading)
                        .spacing(px(8.))
                        .child(checklist_line(
                            "Set CELESTIA_API_URL if the API is not on 127.0.0.1:4000",
                        ))
                        .child(checklist_line(
                            "bridge.sign_in_email(…) then bridge.list_posts() for blog data",
                        ))
                        .child(checklist_line(
                            "Always call through celestia_bridge::run — never block the UI thread",
                        )),
                ),
            )
    }

    fn render_about(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        VStack::new(HorizontalAlignment::Leading)
            .spacing(px(16.))
            .child(
                SectionHeading::new("About")
                    .eyebrow("BOILERPLATE")
                    .description("What this starter wires up for you."),
            )
            .child(
                Card::new().title("Bootstrap checklist").child(
                    VStack::new(HorizontalAlignment::Leading)
                        .spacing(px(8.))
                        .child(checklist_line(
                            "gpui_platform::application().with_assets(CelestiaAssets)",
                        ))
                        .child(checklist_line("celestia_ui::init(cx) before any window"))
                        .child(checklist_line(
                            "MacAppMenu::standard(…).install(cx) + bind_mac_window_keys(cx)",
                        ))
                        .child(checklist_line(
                            "open_mac_window(…) → Root::new(view, window, cx)",
                        ))
                        .child(checklist_line(
                            "MacWindow::chrome(Window) for real OS chrome; Embedded for previews",
                        ))
                        .child(checklist_line(
                            "Theme::toggle / AppTheme for light-dark + tokens",
                        ))
                        .child(checklist_line(
                            "celestia_bridge::BridgeClient::from_env() → apps/api",
                        )),
                ),
            )
    }
}

fn status_line(
    cx: &App,
    variant: BadgeVariant,
    label: &'static str,
    detail: String,
) -> impl IntoElement {
    div()
        .flex()
        .flex_col()
        .gap_2()
        .child(Badge::new(label).variant(variant))
        .child(
            div()
                .text_sm()
                .text_color(cx.theme().muted_foreground)
                .child(detail),
        )
}

fn checklist_line(text: &'static str) -> impl IntoElement {
    div()
        .flex()
        .gap_2()
        .items_start()
        .child(div().text_sm().child("•"))
        .child(div().text_sm().child(text))
}

