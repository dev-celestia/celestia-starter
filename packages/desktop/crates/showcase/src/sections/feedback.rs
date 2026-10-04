use celestia_ui::components::Card;
use celestia_ui::components::alert::Alert;
use celestia_ui::components::context_badge::{BadgeDetail, MessageBadge, context_badge};
use celestia_ui::components::loaders::{
    gradient_spinner, mini_mono_spinner, mini_spinner, progress_ring, pulse_loader,
};
use celestia_ui::components::notice::{NoticeChipIcon, notice_chip};
use celestia_ui::components::progress::Progress;
use celestia_ui::components::skeleton::Skeleton;
use celestia_ui::components::spinner::Spinner;
use gpui_kit::assets::IconName;
use gpui_kit::component::{ActiveTheme, h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_feedback(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let view = cx.entity_id();
        let foreground = cx.theme().foreground;
        let muted = cx.theme().muted_foreground;
        let primary = cx.theme().primary;
        Card::new()
            .title("Feedback")
            .description(
                "alert, progress, spinner, skeleton; zeron-port loaders, notice chips, context badges; toasts under Overlays.",
            )
            .child(
                v_flex()
                    .gap_3()
                    .child(Alert::info("al-info", "This is an informational alert."))
                    .child(Alert::success("al-ok", "Everything went well."))
                    .child(Alert::warning("al-warn", "Watch out for this."))
                    .child(Alert::error("al-err", "Something failed."))
                    .child(Progress::new("pg-1").value(0.65))
                    .child(
                        h_flex()
                            .gap_3()
                            .items_center()
                            .child(Spinner::new())
                            .child(Skeleton::new().h_4().w(px(192.))),
                    ),
            )
            // zeron-port loaders (components/loaders.rs) — all four run on the
            // shared pulse clock in celestia_ui::motion.
            .child(
                v_flex()
                    .gap_3()
                    .child(
                        h_flex()
                            .gap_4()
                            .items_center()
                            .child(pulse_loader(8.0, view, cx))
                            .child(gradient_spinner(6.0, view, cx))
                            .child(mini_mono_spinner("fb-mini-mono", 4.0, muted))
                            .child(mini_spinner(
                                "fb-mini-accent",
                                4.0,
                                [primary, primary.opacity(0.6), primary.opacity(0.3)],
                            )),
                    )
                    .child(
                        h_flex()
                            .gap_4()
                            .items_center()
                            .child(progress_ring(65, 40.0, foreground))
                            .child(progress_ring(100, 40.0, primary)),
                    ),
            )
            // Notice chips (components/notice.rs) — the tinted failure card.
            .child(
                v_flex()
                    .gap_3()
                    .child(notice_chip(
                        false,
                        "Command failed",
                        "cargo build exited with status 101: unresolved import `celestia_ui::loaderz`",
                        NoticeChipIcon::Tile,
                        cx,
                    ))
                    .child(notice_chip(
                        true,
                        "Rate limited",
                        "Retrying in 30s — the payload stays copyable while you wait.",
                        NoticeChipIcon::Plain,
                        cx,
                    )),
            )
            // Context badges (components/context_badge.rs) — hover the first
            // pill for the details card.
            .child(
                h_flex().gap_2().child(
                    context_badge(
                        "fb-badge-comments",
                        &MessageBadge {
                            icon: IconName::FileCode,
                            label: "2 comments".into(),
                            details: vec![
                                BadgeDetail {
                                    location: "src/main.rs:42".into(),
                                    tag: Some("R".into()),
                                    body: "early-return here".into(),
                                },
                                BadgeDetail {
                                    location: "src/lib.rs:7".into(),
                                    tag: Some("L".into()),
                                    body: "why was this dropped?".into(),
                                },
                            ],
                        },
                        cx,
                    ),
                ),
            )
    }
}
