use celestia_ui::components::Card;
use celestia_ui::components::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::toast::{Notification, WindowExt as _};
use celestia_ui::state::StoreContext;
use gpui_kit::component::{ActiveTheme, h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

/// The demo's shared state tree — plain data plus `&mut self` actions, the
/// zustand "slice" pattern. Lives in a `StoreHandle` owned by [`Showcase`].
#[derive(Clone, Debug, PartialEq)]
pub(crate) struct GalleryState {
    pub(crate) count: u32,
    pub(crate) label: SharedString,
}

impl Default for GalleryState {
    fn default() -> Self {
        Self {
            count: 0,
            label: "Ready".into(),
        }
    }
}

impl GalleryState {
    pub(crate) fn increment(&mut self) {
        self.count += 1;
    }

    pub(crate) fn cycle_label(&mut self) {
        self.label = match self.label.as_ref() {
            "Ready" => "Recording",
            "Recording" => "Streaming",
            _ => "Ready",
        }
        .into();
    }

    pub(crate) fn reset(&mut self) {
        *self = Self::default();
    }
}

/// Ambient context value — provided once in `main.rs`
/// (`StoreContext::<Session>::provide`), consumed here without any handles
/// being threaded through.
#[derive(Clone)]
pub(crate) struct Session {
    user: SharedString,
    role: SharedString,
}

impl Default for Session {
    fn default() -> Self {
        Self {
            user: "arham".into(),
            role: "Maintainer".into(),
        }
    }
}

impl Session {
    fn switch(&mut self) {
        if self.user == "arham" {
            self.user = "celeste".into();
            self.role = "Reviewer".into();
        } else {
            *self = Self::default();
        }
    }
}

impl Showcase {
    pub(crate) fn render_state(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let state = self.demo_state.read(cx);

        let store_card = Card::new()
            .title("External store")
            .description("One StoreHandle — set() through actions, read() at render time.")
            .child(
                h_flex()
                    .gap_2()
                    .flex_wrap()
                    .items_center()
                    .child(value_chip(format!("count = {}", state.count), cx))
                    .child(value_chip(format!("label = {}", state.label), cx))
                    .child(
                        Button::new("st-increment")
                            .variant(ButtonVariant::Primary)
                            .label("Increment")
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.demo_state.set(cx, GalleryState::increment);
                            })),
                    )
                    .child(
                        Button::new("st-cycle")
                            .variant(ButtonVariant::Outline)
                            .label("Cycle label")
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.demo_state.set(cx, GalleryState::cycle_label);
                            })),
                    )
                    .child(
                        Button::new("st-reset")
                            .variant(ButtonVariant::Ghost)
                            .label("Reset")
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.demo_state.set(cx, GalleryState::reset);
                            })),
                    ),
            );

        let gating_card = Card::new()
            .title("Selector-gated subscriptions")
            .description("observe_slice() — each counter moves only when its own slice changes.")
            .child(
                v_flex()
                    .gap_2()
                    .child(slice_row(
                        "count slice",
                        format!("count = {}", self.state_count),
                        self.state_count_notifications,
                        cx,
                    ))
                    .child(slice_row(
                        "label slice",
                        format!("label = {}", self.state_label),
                        self.state_label_notifications,
                        cx,
                    ))
                    .child(
                        h_flex()
                            .gap_2()
                            .flex_wrap()
                            .items_center()
                            .child(
                                Button::new("st-bump-count")
                                    .variant(ButtonVariant::Outline)
                                    .size(ButtonSize::Small)
                                    .label("Bump count")
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.demo_state.set(cx, |s| s.count += 1);
                                    })),
                            )
                            .child(
                                Button::new("st-bump-label")
                                    .variant(ButtonVariant::Outline)
                                    .size(ButtonSize::Small)
                                    .label("Bump label")
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.demo_state.set(cx, GalleryState::cycle_label);
                                    })),
                            )
                            .child(
                                Button::new("st-bump-both")
                                    .variant(ButtonVariant::Outline)
                                    .size(ButtonSize::Small)
                                    .label("Bump both")
                                    .on_click(cx.listener(|this, _, _, cx| {
                                        this.demo_state.set(cx, |s| {
                                            s.count += 1;
                                            s.cycle_label();
                                        });
                                    })),
                            )
                            .child(
                                Button::new("st-if-changed")
                                    .variant(ButtonVariant::Ghost)
                                    .size(ButtonSize::Small)
                                    .label("set_if_changed (no-op)")
                                    .on_click(cx.listener(|this, _, window, cx| {
                                        let current = this.demo_state.read(cx).count;
                                        this.demo_state.set_if_changed(cx, |s| s.count = current);
                                        window.push_notification(
                                            Notification::success(
                                                "No-op write — no notification, no slice fired.",
                                            ),
                                            cx,
                                        );
                                    })),
                            ),
                    ),
            );

        let session_card = {
            let session = StoreContext::<Session>::consume(cx);
            Card::new()
                .title("Ambient context")
                .description(
                    "StoreContext::<Session>::provide in main.rs, consume() here — no prop drilling.",
                )
                .child(
                    h_flex()
                        .gap_2()
                        .flex_wrap()
                        .items_center()
                        .child(match &session {
                            Some(session) => value_chip(
                                format!(
                                    "{} · {}",
                                    session.read(cx).user,
                                    session.read(cx).role
                                ),
                                cx,
                            ),
                            None => value_chip("no provider".into(), cx),
                        })
                        .child(
                            Button::new("st-switch-session")
                                .variant(ButtonVariant::Outline)
                                .label("Switch session")
                                .on_click(cx.listener(|_, _, window, cx| {
                                    let session = StoreContext::<Session>::require(cx);
                                    session.update(cx, Session::switch);
                                    let user = session.select(cx, |s| s.user.to_string());
                                    window.push_notification(
                                        Notification::success(format!("Signed in as {user}")),
                                        cx,
                                    );
                                })),
                        ),
                )
        };

        v_flex()
            .gap_4()
            .child(store_card)
            .child(gating_card)
            .child(session_card)
    }
}

fn value_chip(text: String, cx: &App) -> Div {
    div()
        .px_2()
        .py_0p5()
        .rounded(cx.theme().radius)
        .bg(cx.theme().tokens.tab_bar)
        .border_1()
        .border_color(cx.theme().border)
        .text_xs()
        .child(text)
}

fn slice_row(slice: &'static str, value: String, notifications: usize, cx: &App) -> Div {
    h_flex()
        .justify_between()
        .items_center()
        .px_3()
        .py_1p5()
        .rounded(cx.theme().radius)
        .bg(cx.theme().tokens.tab_bar)
        .border_1()
        .border_color(cx.theme().border)
        .child(
            h_flex()
                .gap_2()
                .items_center()
                .child(
                    div()
                        .text_xs()
                        .font_weight(FontWeight::SEMIBOLD)
                        .child(slice),
                )
                .child(
                    div()
                        .text_xs()
                        .text_color(cx.theme().muted_foreground)
                        .child(value),
                ),
        )
        .child(
            div()
                .text_xs()
                .text_color(cx.theme().muted_foreground)
                .child(format!("{notifications} notifications")),
        )
}
