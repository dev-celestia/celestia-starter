use celestia_ui::components::Card;
use celestia_ui::components::primitive::alert::Alert;
use celestia_ui::components::primitive::battery::Battery;
use celestia_ui::components::primitive::fab::Fab;
use celestia_ui::components::primitive::icon::PhosphorIcon;
use celestia_ui::components::primitive::meter::Meter;
use celestia_ui::components::primitive::number_stepper::NumberStepper;
use celestia_ui::components::primitive::progress::Progress;
use celestia_ui::components::primitive::scrubber::Scrubber;
use celestia_ui::components::primitive::shimmer::ShimmerText;
use celestia_ui::components::primitive::signal_bars::SignalBars;
use celestia_ui::components::primitive::skeleton::Skeleton;
use celestia_ui::components::primitive::loader::{Loader, LoaderVariant};
use celestia_ui::components::primitive::spinner::Spinner;
use celestia_ui::components::primitive::toast::{Notification, WindowExt};
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_feedback_demo(&self, demo: Demo, cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::Alert => Card::new()
                .title("Alert")
                .description("Status banners.")
                .child(
                    v_flex()
                        .gap_3()
                        .child(Alert::info("al-info", "This is an informational alert."))
                        .child(Alert::success("al-ok", "Everything went well."))
                        .child(Alert::warning("al-warn", "Watch out for this."))
                        .child(Alert::error("al-err", "Something failed.")),
                )
                .into_any_element(),
            Demo::Progress => Card::new()
                .title("Progress")
                .description("Linear progress bar.")
                .child(Progress::new("pg-1").value(0.65))
                .into_any_element(),
            Demo::Meter => Card::new()
                .title("Meter")
                .description("Capacity meter with auto-tone.")
                .child(
                    Meter::new("meter-disk")
                        .label("Disk")
                        .value_label("48 GB / 64 GB")
                        .value(0.75),
                )
                .into_any_element(),
            Demo::Scrubber => Card::new()
                .title("Scrubber")
                .description("Media scrubber.")
                .child(Scrubber::new("scrub-1", 0.42))
                .into_any_element(),
            Demo::SignalBars => Card::new()
                .title("SignalBars")
                .description("Signal strength bars.")
                .child(
                    h_flex()
                        .gap_4()
                        .items_center()
                        .child(SignalBars::new("sig-1", 1))
                        .child(SignalBars::new("sig-2", 2))
                        .child(SignalBars::new("sig-3", 3))
                        .child(SignalBars::new("sig-4", 4)),
                )
                .into_any_element(),
            Demo::Battery => Card::new()
                .title("Battery")
                .description("Battery level indicator.")
                .child(
                    h_flex()
                        .gap_4()
                        .items_center()
                        .child(Battery::new("bat", 0.55))
                        .child(Battery::new("bat-low", 0.12).charging(true)),
                )
                .into_any_element(),
            Demo::NumberStepper => Card::new()
                .title("NumberStepper")
                .description("Inline ± stepper.")
                .child(NumberStepper::new("ns-1", 3).range(0, 10))
                .into_any_element(),
            Demo::Fab => Card::new()
                .title("Fab")
                .description("Floating action button.")
                .child(
                    Fab::new("fab-1", PhosphorIcon::Plus)
                        .accessibility_label("Create new item")
                        .on_click(|_, window, cx| {
                            window
                                .push_notification(Notification::success("FAB action fired."), cx);
                        }),
                )
                .into_any_element(),
            Demo::Spinner => Card::new()
                .title("Spinner")
                .description("Indeterminate spinner.")
                .child(h_flex().gap_4().items_center().child(Spinner::new()))
                .into_any_element(),
            Demo::Loader => Card::new()
                .title("Loader")
                .description("Icon-sized pixel loaders (16px default, same slot as Spinner).")
                .child(
                    v_flex()
                        .gap_4()
                        .child(
                            h_flex()
                                .gap_6()
                                .items_center()
                                .child(loader_sample("Diamond", Loader::diamond(), cx))
                                .child(loader_sample("Orbit", Loader::orbit(), cx))
                                .child(loader_sample("Box dots", Loader::box_dots(), cx))
                                .child(loader_sample("Dots", Loader::dots(), cx))
                                .child(loader_sample("Bars", Loader::bars(), cx))
                                .child(loader_sample("Blocks", Loader::blocks(), cx)),
                        )
                        .child(
                            h_flex()
                                .gap_4()
                                .items_center()
                                .child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Sizes"),
                                )
                                .child(Loader::new().variant(LoaderVariant::Diamond).size(px(12.)))
                                .child(Loader::orbit().size(px(16.)))
                                .child(Loader::box_dots().size(px(20.)))
                                .child(Loader::dots().size(px(20.)))
                                .child(Loader::bars().size(px(24.)))
                                .child(Loader::blocks().size(px(28.))),
                        ),
                )
                .into_any_element(),
            Demo::Skeleton => Card::new()
                .title("Skeleton")
                .description("Placeholder skeleton.")
                .child(
                    v_flex()
                        .gap_2()
                        .child(Skeleton::new().h_4().w(px(192.)))
                        .child(Skeleton::new().h_4().w(px(128.))),
                )
                .into_any_element(),
            Demo::Shimmer => Card::new()
                .title("Shimmer")
                .description("Pulse and travelling-wave shimmer text.")
                .child(
                    v_flex()
                        .gap_4()
                        .child(
                            v_flex()
                                .gap_1()
                                .child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Pulse"),
                                )
                                .child(ShimmerText::new("Thinking…")),
                        )
                        .child(
                            v_flex()
                                .gap_1()
                                .child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .child("Wave"),
                                )
                                .child(ShimmerText::wave("Shimmering text across glyphs")),
                        ),
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not a feedback demo."))
                .into_any_element(),
        }
    }
}

fn loader_sample(
    label: &'static str,
    loader: Loader,
    cx: &mut Context<Showcase>,
) -> impl IntoElement {
    v_flex()
        .gap_1()
        .items_center()
        .child(
            div()
                .text_xs()
                .text_color(cx.theme().muted_foreground)
                .child(label),
        )
        .child(loader)
}
