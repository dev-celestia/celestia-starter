//! Window title bar — desktop-only native chrome (no web counterpart).
//!
//! Written directly on `gpui`. The upstream target (`gpui-component`'s
//! `title_bar`) reaches exactly **zero** `gpui-base` components — its only base
//! imports are the free style helpers (`h_flex`, `StyledExt`,
//! `InteractiveElementExt`), so nothing here has to be reimplemented on its
//! behalf. Two upstream helpers were inlined rather than ported:
//!
//! - `InteractiveElementExt::on_double_click` is `on_click` plus a
//!   `click_count() == 2` guard — spelled out inline at both call sites.
//! - `Icon::new(..).small()` resolves to a 14px glyph (`size_3p5`), which is
//!   [`Phosphor::size`] here.
//!
//! Four deliberate deviations from the upstream file, all marked `DEV:` below:
//! the caption glyphs, `Vec` in place of `SmallVec`, no `Render` impl on the
//! drag state, and the real `ClickEvent` handed to the close callback instead
//! of a synthesized default.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Background, ClickEvent, Decorations, Hsla, InteractiveElement, IntoElement,
    MouseButton, ParentElement, Pixels, Refineable as _, RenderOnce, Rgba,
    StatefulInteractiveElement as _, StyleRefinement, Styled, TitlebarOptions, Window,
    WindowControlArea, WindowOptions, div, linear_color_stop, linear_gradient, point, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// Height of the bar itself. Also the width of a single caption button, which
/// upstream expresses by passing this constant to `.w()`.
pub const TITLE_BAR_HEIGHT: Pixels = px(34.);

/// Reserved leading space. macOS keeps the traffic lights off our content;
/// every other platform leaves room for its own left-most chrome.
#[cfg(target_os = "macos")]
const TITLE_BAR_LEFT_PADDING: Pixels = px(80.);
#[cfg(not(target_os = "macos"))]
const TITLE_BAR_LEFT_PADDING: Pixels = px(12.);

/// Width of one caption button. Upstream writes `.w(TITLE_BAR_HEIGHT)` with a
/// comment claiming the Windows buttons are 35px wide; the code is
/// authoritative and draws 34px squares, so that is what is ported.
const WINDOW_CONTROL_WIDTH: Pixels = TITLE_BAR_HEIGHT;

/// Close-window override installed by [`TitleBar::on_close_window`].
type OnCloseWindow = Rc<Box<dyn Fn(&ClickEvent, &mut Window, &mut App)>>;

/// The bar's own background: a 180° gradient from a 55/45 channel-wise mix of
/// `title_bar` into `background`, up to `title_bar` at the bottom edge.
///
/// The mix is deliberately not `crate::motion::mix`, which works in sRGB and
/// premultiplies; this arithmetic runs per channel in the *linear* `Rgba` the
/// upstream file uses, and is pinned verbatim by its test.
fn default_title_bar_background(title_bar: Hsla, background: Hsla) -> Background {
    let title_bar_rgb = title_bar.to_rgb();
    let background_rgb = background.to_rgb();
    let mixed = Hsla::from(Rgba {
        r: title_bar_rgb.r * 0.55 + background_rgb.r * 0.45,
        g: title_bar_rgb.g * 0.55 + background_rgb.g * 0.45,
        b: title_bar_rgb.b * 0.55 + background_rgb.b * 0.45,
        a: title_bar_rgb.a * 0.55 + background_rgb.a * 0.45,
    });

    linear_gradient(
        180.,
        linear_color_stop(mixed, 0.),
        linear_color_stop(title_bar, 1.),
    )
}

/// A custom-drawn window title bar.
///
/// Place it as the first child of the window's root view and start the window
/// from [`TitleBar::window_options`], so the bar owns dragging and double
/// clicking. `child` / `children` fill the draggable region between the leading
/// padding and the caption buttons.
#[derive(IntoElement)]
pub struct TitleBar {
    style: StyleRefinement,
    // DEV: `Vec` rather than upstream's `SmallVec<[AnyElement; 1]>` — one inline
    // slot is not worth a new direct dependency on `smallvec`.
    children: Vec<AnyElement>,
    on_close_window: Option<OnCloseWindow>,
}

impl TitleBar {
    /// An empty title bar.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
            on_close_window: None,
        }
    }

    /// The titlebar block [`TitleBar::window_options`] embeds.
    pub fn title_bar_options() -> TitlebarOptions {
        TitlebarOptions {
            title: None,
            appears_transparent: true,
            traffic_light_position: Some(point(px(9.0), px(9.0))),
        }
    }

    /// Base [`WindowOptions`] for any window that renders a [`TitleBar`].
    ///
    /// ```no_run
    /// # use celestia_ui::components::composite::title_bar::TitleBar;
    /// # use celestia_ui::gpui::WindowOptions;
    /// let options = WindowOptions {
    ///     window_min_size: None,
    ///     ..TitleBar::window_options()
    /// };
    /// ```
    pub fn window_options() -> WindowOptions {
        WindowOptions {
            titlebar: Some(Self::title_bar_options()),
            // The bar draws itself and moves the window via `start_window_move`,
            // so AppKit must not treat it as a system window-move region.
            // Otherwise macOS handles title bar double clicks on its own (in
            // addition to our `on_click` below) and delays title bar clicks
            // while disambiguating double clicks.
            app_owns_titlebar_drag: true,
            ..Default::default()
        }
    }

    /// Replace the default close behaviour — `window.remove_window()` — with
    /// `f`. Linux only; a no-op elsewhere, matching upstream.
    pub fn on_close_window(
        mut self,
        f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        if cfg!(target_os = "linux") {
            self.on_close_window = Some(Rc::new(Box::new(f)));
        }
        self
    }
}

impl Default for TitleBar {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for TitleBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl ParentElement for TitleBar {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

/// One caption button. Drawn as a plain element: the platform hitbox — not a
/// click listener — is what performs the action on Windows, so the only
/// listeners installed here are the Linux fallbacks.
#[derive(IntoElement, Clone)]
enum ControlIcon {
    Minimize,
    Restore,
    Maximize,
    Close {
        on_close_window: Option<OnCloseWindow>,
    },
}

impl ControlIcon {
    fn minimize() -> Self {
        Self::Minimize
    }

    fn restore() -> Self {
        Self::Restore
    }

    fn maximize() -> Self {
        Self::Maximize
    }

    fn close(on_close_window: Option<OnCloseWindow>) -> Self {
        Self::Close { on_close_window }
    }

    fn id(&self) -> &'static str {
        match self {
            Self::Minimize => "minimize",
            Self::Restore => "restore",
            Self::Maximize => "maximize",
            Self::Close { .. } => "close",
        }
    }

    /// DEV: upstream's `IconName::WindowMinimize` / `WindowRestore` /
    /// `WindowMaximize` / `WindowClose` are not in the Phosphor catalog, so each
    /// maps to the closest shape Phosphor Core ships.
    fn glyph(&self) -> PhosphorIcon {
        match self {
            Self::Minimize => PhosphorIcon::Minus,
            Self::Restore => PhosphorIcon::CopySimple,
            Self::Maximize => PhosphorIcon::Square,
            Self::Close { .. } => PhosphorIcon::X,
        }
    }

    fn window_control_area(&self) -> WindowControlArea {
        match self {
            Self::Minimize => WindowControlArea::Min,
            Self::Restore | Self::Maximize => WindowControlArea::Max,
            Self::Close { .. } => WindowControlArea::Close,
        }
    }

    fn is_close(&self) -> bool {
        matches!(self, Self::Close { .. })
    }

    #[inline]
    fn hover_fg(&self, cx: &App) -> Hsla {
        if self.is_close() {
            cx.theme().danger_foreground
        } else {
            cx.theme().secondary_foreground
        }
    }

    #[inline]
    fn hover_bg(&self, cx: &App) -> Hsla {
        if self.is_close() {
            cx.theme().danger
        } else {
            cx.theme().secondary_hover
        }
    }

    #[inline]
    fn active_bg(&self, cx: &mut App) -> Hsla {
        if self.is_close() {
            cx.theme().danger_active
        } else {
            cx.theme().secondary_active
        }
    }
}

impl RenderOnce for ControlIcon {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let is_linux = cfg!(target_os = "linux");
        let is_windows = cfg!(target_os = "windows");
        let hover_fg = self.hover_fg(cx);
        let hover_bg = self.hover_bg(cx);
        let active_bg = self.active_bg(cx);
        let area = self.window_control_area();
        let glyph = self.glyph();
        // Cloned so the Linux listeners can own the discriminant; the match
        // below only reads it, so the `Fn` bound on `on_click` is satisfied.
        let icon = self.clone();

        div()
            .id(self.id())
            .flex()
            .w(WINDOW_CONTROL_WIDTH)
            .h_full()
            .flex_shrink_0()
            .justify_center()
            .content_center()
            .items_center()
            .text_color(cx.theme().foreground)
            .hover(|style| style.bg(hover_bg).text_color(hover_fg))
            .active(|style| style.bg(active_bg).text_color(hover_fg))
            .when(is_windows, |this| this.window_control_area(area))
            .when(is_linux, move |this| {
                // Windows performs these through the platform hitbox; Linux has
                // no such mechanism, so the listeners do the work there.
                let on_close_window = match &icon {
                    Self::Close { on_close_window } => on_close_window.clone(),
                    _ => None,
                };
                this.on_mouse_down(MouseButton::Left, |_, window, cx| {
                    window.prevent_default();
                    cx.stop_propagation();
                })
                // DEV: upstream synthesizes `ClickEvent::default()` for the
                // close callback; the real event is right here, so it is passed
                // through instead.
                .on_click(move |event, window, cx| {
                    cx.stop_propagation();
                    match icon {
                        Self::Minimize => window.minimize_window(),
                        Self::Restore | Self::Maximize => window.zoom_window(),
                        Self::Close { .. } => match on_close_window.clone() {
                            Some(f) => f(event, window, cx),
                            None => window.remove_window(),
                        },
                    }
                })
            })
            .child(Phosphor::new(glyph).size(px(14.0)))
    }
}

/// The min / max / close cluster, present on Windows and on client-decorated
/// Linux sessions only.
#[derive(IntoElement)]
struct WindowControls {
    on_close_window: Option<OnCloseWindow>,
}

impl RenderOnce for WindowControls {
    fn render(self, window: &mut Window, _: &mut App) -> impl IntoElement {
        // macOS draws the traffic lights itself, and there is no window chrome
        // to decorate in a browser.
        if cfg!(target_os = "macos") || cfg!(target_family = "wasm") {
            return div().id("window-controls");
        }

        // Under server-side decorations the window manager already renders its
        // own title bar, complete with min/max/close; drawing ours as well
        // stacks a duplicate set of controls on top of it (most visibly two
        // close buttons). gpui falls back to server-side decorations on X11
        // sessions without a compositor, and a Wayland compositor may grant
        // server mode even when client mode was requested. Skip ours unless this
        // window is actually client-side decorated, mirroring the
        // `is_client_decorated` gating of the title bar's window-menu overlay.
        #[cfg(target_os = "linux")]
        if !matches!(window.window_decorations(), Decorations::Client { .. }) {
            return div().id("window-controls");
        }

        // The window manager declares which controls it can honor; a tiling
        // compositor may support neither minimize nor maximize. Close is always
        // ours to offer.
        let supported = window.window_controls();

        div()
            .id("window-controls")
            .flex()
            .flex_row()
            .items_center()
            .flex_shrink_0()
            .h_full()
            .when(supported.minimize, |this| {
                this.child(ControlIcon::minimize())
            })
            .when(supported.maximize, |this| {
                this.child(if window.is_maximized() {
                    ControlIcon::restore()
                } else {
                    ControlIcon::maximize()
                })
            })
            .child(ControlIcon::close(self.on_close_window))
    }
}

/// Drag bookkeeping for [`TitleBar`]. Lives on the window via `use_state`, so
/// it survives the re-render every mouse event triggers.
///
/// DEV: no `Render` impl. Upstream carries an empty one with a "remove this when
/// GPUI has released v0.2.3" TODO; `Window::use_state<S: 'static>` places no
/// such bound in `gpui-pre-0.3.6`.
struct TitleBarState {
    should_move: bool,
}

impl RenderOnce for TitleBar {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let is_client_decorated = matches!(window.window_decorations(), Decorations::Client { .. });
        let is_web = cfg!(target_family = "wasm");
        let is_linux = cfg!(target_os = "linux");
        let is_macos = cfg!(target_os = "macos");

        let state = window.use_state(cx, |_, _| TitleBarState { should_move: false });

        let mut bar = div()
            .id("title-bar")
            .flex()
            .flex_row()
            .items_center()
            .justify_between()
            .h(TITLE_BAR_HEIGHT)
            .pl(TITLE_BAR_LEFT_PADDING)
            .border_b_1()
            .border_color(cx.theme().title_bar_border)
            .bg(default_title_bar_background(
                cx.theme().title_bar,
                cx.theme().background,
            ));
        // The caller's `Styled` chain wins over the defaults above.
        bar.style().refine(&self.style);

        let bar = bar
            // `on_double_click` is gpui-base's `on_click` + a click-count guard;
            // inlined here so the file stays on raw gpui.
            .when(is_linux, |this| {
                this.on_click(|event, window, _| {
                    if event.click_count() == 2 {
                        window.zoom_window();
                    }
                })
            })
            .when(is_macos, |this| {
                this.on_click(|event, window, _| {
                    if event.click_count() == 2 {
                        window.titlebar_double_click();
                    }
                })
            })
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
            // The move itself happens on the first move after the press, so a
            // plain click (press + release, no motion) never drags the window.
            .on_mouse_move(window.listener_for(&state, |state, _, window, _| {
                if state.should_move {
                    state.should_move = false;
                    window.start_window_move();
                }
            }))
            .child(
                div()
                    .id("bar")
                    .flex()
                    .flex_row()
                    .items_center()
                    .h_full()
                    .justify_between()
                    .flex_shrink_0()
                    .flex_1()
                    .when(!is_web, |this| {
                        this.window_control_area(WindowControlArea::Drag)
                            // Fullscreen hides the traffic lights, so macOS
                            // reclaims the 80px reservation and falls back to the
                            // ordinary 12px (`pl_3` is 0.75rem).
                            .when(window.is_fullscreen(), |this| this.pl_3())
                            .when(is_linux && is_client_decorated, |this| {
                                this.child(
                                    div()
                                        .top_0()
                                        .left_0()
                                        .absolute()
                                        .size_full()
                                        .h_full()
                                        .on_mouse_down(MouseButton::Right, move |ev, window, _| {
                                            window.show_window_menu(ev.position)
                                        }),
                                )
                            })
                    })
                    .children(self.children),
            )
            .child(WindowControls {
                on_close_window: self.on_close_window,
            });

        div().flex_shrink_0().child(bar)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::{Context, Render, TestAppContext, div};

    /// Port of upstream's test. The equality is total for the input pair — it
    /// pins the 55/45 weighting, the 180° angle, and which stop gets which
    /// colour — so no second assertion on the same pair is needed.
    #[test]
    fn default_title_bar_background_mixes_55_45_into_a_gradient() {
        let title_bar = Hsla::black();
        let background = Hsla::white();

        assert_eq!(
            default_title_bar_background(title_bar, background),
            linear_gradient(
                180.,
                linear_color_stop(
                    Hsla::from(Rgba {
                        r: 0.45,
                        g: 0.45,
                        b: 0.45,
                        a: 1.,
                    }),
                    0.,
                ),
                linear_color_stop(title_bar, 1.),
            )
        );
    }

    /// The pair above is grey, so a lightness interpolation would produce the
    /// same 0.45 and pass. A chromatic pair separates the two: mixing per
    /// channel moves red and blue independently, while an HSL blend would sweep
    /// the hue. This is the assertion that says *which* interpolation is ported.
    #[test]
    fn default_title_bar_background_mixes_per_channel_not_by_lightness() {
        let red = Hsla::from(Rgba {
            r: 1.0,
            g: 0.0,
            b: 0.0,
            a: 1.0,
        });
        let blue = Hsla::from(Rgba {
            r: 0.0,
            g: 0.0,
            b: 1.0,
            a: 1.0,
        });

        assert_eq!(
            default_title_bar_background(red, blue),
            linear_gradient(
                180.,
                linear_color_stop(
                    Hsla::from(Rgba {
                        r: 0.55,
                        g: 0.0,
                        b: 0.45,
                        a: 1.0,
                    }),
                    0.,
                ),
                linear_color_stop(red, 1.),
            )
        );
    }

    #[test]
    fn title_bar_metrics_are_the_platform_values() {
        assert_eq!(TITLE_BAR_HEIGHT, px(34.0));
        assert_eq!(WINDOW_CONTROL_WIDTH, px(34.0));

        #[cfg(target_os = "macos")]
        assert_eq!(TITLE_BAR_LEFT_PADDING, px(80.0));
        #[cfg(not(target_os = "macos"))]
        assert_eq!(TITLE_BAR_LEFT_PADDING, px(12.0));
    }

    #[test]
    fn caption_glyphs_are_the_standard_shapes() {
        assert_eq!(ControlIcon::minimize().glyph(), PhosphorIcon::Minus);
        assert_eq!(ControlIcon::restore().glyph(), PhosphorIcon::CopySimple);
        assert_eq!(ControlIcon::maximize().glyph(), PhosphorIcon::Square);
        assert_eq!(ControlIcon::close(None).glyph(), PhosphorIcon::X);

        assert_eq!(ControlIcon::minimize().id(), "minimize");
        assert_eq!(ControlIcon::restore().id(), "restore");
        assert_eq!(ControlIcon::maximize().id(), "maximize");
        assert_eq!(ControlIcon::close(None).id(), "close");

        assert_eq!(
            ControlIcon::minimize().window_control_area(),
            WindowControlArea::Min
        );
        assert_eq!(
            ControlIcon::restore().window_control_area(),
            WindowControlArea::Max
        );
        assert_eq!(
            ControlIcon::maximize().window_control_area(),
            WindowControlArea::Max
        );
        assert_eq!(
            ControlIcon::close(None).window_control_area(),
            WindowControlArea::Close
        );

        assert!(!ControlIcon::minimize().is_close());
        assert!(ControlIcon::close(None).is_close());
    }

    #[test]
    fn window_options_let_the_app_own_the_drag() {
        let options = TitleBar::window_options();
        assert!(options.app_owns_titlebar_drag);

        let titlebar = options.titlebar.expect("window_options sets a titlebar");
        assert!(titlebar.appears_transparent);
        assert_eq!(
            titlebar.traffic_light_position,
            Some(point(px(9.0), px(9.0)))
        );
        assert!(titlebar.title.is_none());

        // The standalone accessor must stay in step with what `window_options`
        // embeds.
        let direct = TitleBar::title_bar_options();
        assert!(direct.appears_transparent);
        assert_eq!(direct.traffic_light_position, Some(point(px(9.0), px(9.0))));
    }

    struct TitleBarView;

    impl Render for TitleBarView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .child(
                    TitleBar::new().child(
                        div()
                            .w_full()
                            .flex()
                            .justify_center()
                            .child(div().child("Celestia Desktop")),
                    ),
                )
                // A second bar with the close override installed and a styled
                // caller chain, so both the `refine` path and the callback
                // plumbing are compiled and mounted.
                .child(
                    TitleBar::new()
                        .on_close_window(|_, _, _| {})
                        .h(px(40.0))
                        .child(div().child("overridden")),
                )
                // The caption cluster short-circuits on macOS and in the
                // browser, so `WindowControls` never reaches `ControlIcon` on
                // this host. Mounting the four buttons directly is what keeps
                // their render path covered here.
                .child(
                    div()
                        .flex()
                        .flex_row()
                        .child(ControlIcon::minimize())
                        .child(ControlIcon::restore())
                        .child(ControlIcon::maximize())
                        .child(ControlIcon::close(None)),
                )
        }
    }

    #[gpui::test]
    fn title_bar_mounts(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| TitleBarView);
    }
}
