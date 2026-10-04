use celestia_ui::components::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::icon::{PHOSPHOR_VERSION, Phosphor, PhosphorIcon, PhosphorWeight};
use celestia_ui::components::input::Input;
use celestia_ui::components::toast::{Notification, WindowExt as _};
use celestia_ui::components::Card;
use gpui_kit::component::{ActiveTheme, h_flex, v_flex};
use gpui_kit::*;

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_icons(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let query = self.icon_search.read(cx).value().to_string();
        let needle = query.trim().to_lowercase();
        // The whole catalog mounts — scrolling is a paint offset in GPUI, so
        // the full grid is as smooth as a filtered one.
        let shown: Vec<PhosphorIcon> = PhosphorIcon::ALL
            .iter()
            .copied()
            .filter(|icon| needle.is_empty() || icon.name().contains(&needle))
            .collect();
        let total = shown.len();

        let weight = self.icon_weight;
        let grid = h_flex().flex_wrap().gap_1p5().children(shown.into_iter().map(|icon| {
            let name = icon.name();
            let snippet = format!("PhosphorIcon::{icon:?}");
            v_flex()
                .id(SharedString::from(format!("ph-{name}")))
                .items_center()
                .justify_center()
                .gap_1p5()
                .w_20()
                .py_2p5()
                .rounded(px(6.))
                .border_1()
                .border_color(cx.theme().border)
                .hover(|style| style.bg(cx.theme().tokens.tab_bar))
                .on_click(cx.listener(move |_, _, window, cx| {
                    cx.write_to_clipboard(gpui::ClipboardItem::new_string(snippet.clone()));
                    window.push_notification(
                        Notification::success(format!("Copied {snippet}")),
                        cx,
                    );
                }))
                .child(
                    Phosphor::new(icon)
                        .weight(weight)
                        .size(px(22.))
                        .color(cx.theme().foreground),
                )
                .child(
                    div()
                        .text_xs()
                        .text_color(cx.theme().muted_foreground)
                        .truncate()
                        .child(name),
                )
        }));

        let status = if total == 0 {
            format!("No icons match “{query}”.")
        } else {
            format!(
                "{total} glyphs · Phosphor Core {PHOSPHOR_VERSION} · {weight:?} weight. Click a tile to copy its Rust name."
            )
        };

        Card::new()
            .title("Phosphor icons")
            .description(format!(
                "The full catalog embedded in celestia-ui, {} glyphs per weight.",
                PhosphorIcon::COUNT
            ))
            .child(
                v_flex()
                    .gap_3()
                    .child(
                        h_flex()
                            .w_full()
                            .gap_2()
                            .items_center()
                            .child(
                                div()
                                    .flex_1()
                                    .child(Input::new(&self.icon_search)),
                            )
                            .child(self.weight_toggle(cx)),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child(status),
                    )
                    .child(grid),
            )
    }

    /// Regular / Bold / Fill switcher — the active weight renders primary.
    fn weight_toggle(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let toggle = |id: &'static str, label: &'static str, weight: PhosphorWeight, cx: &mut Context<Self>| {
            Button::new(id)
                .variant(if self.icon_weight == weight {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Ghost
                })
                .size(ButtonSize::XSmall)
                .label(label)
                .on_click(cx.listener(move |this, _, _, cx| {
                    this.icon_weight = weight;
                    cx.notify();
                }))
        };

        h_flex()
            .gap(px(3.))
            .child(toggle("ph-w-regular", "Regular", PhosphorWeight::Regular, cx))
            .child(toggle("ph-w-bold", "Bold", PhosphorWeight::Bold, cx))
            .child(toggle("ph-w-fill", "Fill", PhosphorWeight::Fill, cx))
    }
}
