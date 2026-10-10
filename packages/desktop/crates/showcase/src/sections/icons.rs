use std::rc::Rc;

use celestia_ui::components::Card;
use celestia_ui::components::composite::virtual_list::VirtualListBuilder;
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::icon::{
    PHOSPHOR_VERSION, Phosphor, PhosphorIcon, PhosphorWeight,
};
use celestia_ui::components::primitive::input::Input;
use celestia_ui::components::primitive::toast::{Notification, WindowExt as _};
use gpui::*;
use gpui_component::{ActiveTheme, h_flex, v_flex};

use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_icons(
        &self,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        let query = self.icon_search.read(cx).value().to_string();
        let needle = query.trim().to_lowercase();
        let shown: Vec<PhosphorIcon> = PhosphorIcon::ALL
            .iter()
            .copied()
            .filter(|icon| needle.is_empty() || icon.name().contains(&needle))
            .collect();
        let total = shown.len();

        let weight = self.icon_weight;

        // Responsive columns based on available content viewport width:
        // Window minus sidebar (~220px), outer padding (64px), and card padding (48px).
        let content_w = (window.viewport_size().width - px(340.)).max(px(320.));
        let cols = ((content_w / px(86.)).floor() as usize).clamp(3, 16);
        let row_count = if shown.is_empty() {
            0
        } else {
            shown.len().div_ceil(cols)
        };

        let shown = Rc::new(shown);
        let shown_for_list = shown.clone();

        let list_height = (window.viewport_size().height - px(340.)).clamp(px(380.), px(680.));

        let list_body = if total == 0 {
            v_flex()
                .size_full()
                .items_center()
                .justify_center()
                .gap_2()
                .py_12()
                .child(
                    div()
                        .text_sm()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(cx.theme().foreground)
                        .child("No glyphs found"),
                )
                .child(
                    div()
                        .text_xs()
                        .text_color(cx.theme().muted_foreground)
                        .child(format!(
                            "No icons match \u{201c}{query}\u{201d}. Try another search term."
                        )),
                )
                .into_any_element()
        } else {
            VirtualListBuilder::vertical(cx.entity(), "ph-icons-virtual-list")
                .uniform(row_count, px(76.))
                .track_scroll(&self.icon_scroll_handle)
                .render_item(move |this, row_ix, _window, cx| {
                    let weight = this.icon_weight;
                    let start = row_ix * cols;
                    let end = (start + cols).min(shown_for_list.len());
                    let row_icons = &shown_for_list[start..end];

                    h_flex()
                        .id(ElementId::Name(format!("icon-row-{row_ix}").into()))
                        .w_full()
                        .h(px(70.))
                        .gap_1p5()
                        .items_center()
                        .children(row_icons.iter().copied().map(|icon| {
                            let name = icon.name();
                            let snippet = format!("PhosphorIcon::{icon:?}");
                            v_flex()
                                .id(SharedString::from(format!("ph-{name}")))
                                .items_center()
                                .justify_center()
                                .gap_1p5()
                                .w_20()
                                .h(px(70.))
                                .rounded(px(6.))
                                .border_1()
                                .border_color(cx.theme().border)
                                .hover(|style| style.bg(cx.theme().tokens.tab_bar))
                                .cursor_pointer()
                                .on_click(move |_, window, cx| {
                                    cx.write_to_clipboard(gpui::ClipboardItem::new_string(
                                        snippet.clone(),
                                    ));
                                    window.push_notification(
                                        Notification::success(format!("Copied {snippet}")),
                                        cx,
                                    );
                                })
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
                        }))
                })
                .h_full()
                .into_any_element()
        };

        let status = if total == 0 {
            format!("No icons match \u{201c}{query}\u{201d}.")
        } else {
            format!(
                "{total} glyphs \u{00b7} Phosphor Core {PHOSPHOR_VERSION} \u{00b7} {weight:?} weight \u{00b7} virtualized. Click a tile to copy its Rust name."
            )
        };

        Card::new()
            .title("Phosphor icons")
            .description(format!(
                "The full catalog embedded in celestia-ui, {} glyphs per weight, virtualized with VirtualListBuilder for smooth scrolling.",
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
                            .child(div().flex_1().child(Input::new(&self.icon_search)))
                            .child(self.weight_toggle(cx)),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(cx.theme().muted_foreground)
                            .child(status),
                    )
                    .child(
                        div()
                            .h(list_height)
                            .w_full()
                            .rounded(cx.theme().radius)
                            .border_1()
                            .border_color(cx.theme().border)
                            .bg(cx.theme().background)
                            .p_2()
                            .overflow_hidden()
                            .child(list_body),
                    ),
            )
    }

    /// Regular / Bold / Fill switcher — the active weight renders primary.
    fn weight_toggle(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let toggle = |id: &'static str,
                      label: &'static str,
                      weight: PhosphorWeight,
                      cx: &mut Context<Self>| {
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
            .child(toggle(
                "ph-w-regular",
                "Regular",
                PhosphorWeight::Regular,
                cx,
            ))
            .child(toggle("ph-w-bold", "Bold", PhosphorWeight::Bold, cx))
            .child(toggle("ph-w-fill", "Fill", PhosphorWeight::Fill, cx))
    }
}
