use celestia_ui::components::Card;
use celestia_ui::components::alert::Alert;
use celestia_ui::components::progress::Progress;
use celestia_ui::components::skeleton::Skeleton;
use celestia_ui::components::spinner::Spinner;
use gpui_kit::component::{h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_feedback(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Feedback")
            .description("alert, progress, spinner, skeleton; toasts under Overlays.")
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
    }
}
