use celestia_ui::components::Card;
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::icon::PhosphorIcon;
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::link::Link;
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::showcase::Showcase;

/// Every size step, at the variant that shows the chrome off best.
const SIZE_STEPS: [(&str, ButtonSize); 5] = [
    ("xs", ButtonSize::XSmall),
    ("sm", ButtonSize::Small),
    ("default", ButtonSize::Medium),
    ("md", ButtonSize::Md),
    ("lg", ButtonSize::Large),
];

const ICON_STEPS: [(&str, ButtonSize); 4] = [
    ("icon-xs", ButtonSize::IconXs),
    ("icon-sm", ButtonSize::IconSm),
    ("icon", ButtonSize::Icon),
    ("icon-lg", ButtonSize::IconLg),
];

impl Showcase {
    /// Dedicated Button gallery — variants, sizes, icons, loading. No Kbd/Link.
    pub(crate) fn render_button(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Button")
            .description("primitive/button — variants, sizes, icon slots, loading, and caret.")
            .child(
                v_flex()
                    .gap_4()
                    .child(
                        h_flex()
                            .gap_2()
                            .flex_wrap()
                            .items_center()
                            .child(
                                Button::new("btn-primary")
                                    .variant(ButtonVariant::Primary)
                                    .label("Primary"),
                            )
                            .child(
                                Button::new("btn-secondary")
                                    .variant(ButtonVariant::Secondary)
                                    .label("Secondary"),
                            )
                            .child(
                                Button::new("btn-destructive")
                                    .variant(ButtonVariant::Destructive)
                                    .label("Destructive"),
                            )
                            .child(
                                Button::new("btn-success")
                                    .variant(ButtonVariant::Success)
                                    .label("Success"),
                            )
                            .child(
                                Button::new("btn-warning")
                                    .variant(ButtonVariant::Warning)
                                    .label("Warning"),
                            )
                            .child(
                                Button::new("btn-info")
                                    .variant(ButtonVariant::Info)
                                    .label("Info"),
                            )
                            .child(
                                Button::new("btn-outline")
                                    .variant(ButtonVariant::Outline)
                                    .label("Outline"),
                            )
                            .child(
                                Button::new("btn-ghost")
                                    .variant(ButtonVariant::Ghost)
                                    .label("Ghost"),
                            )
                            .child(
                                Button::new("btn-quiet")
                                    .variant(ButtonVariant::Quiet)
                                    .label("Quiet"),
                            )
                            .child(
                                Button::new("btn-link")
                                    .variant(ButtonVariant::Link)
                                    .label("Link"),
                            ),
                    )
                    .child(
                        h_flex()
                            .gap_2()
                            .flex_wrap()
                            .items_center()
                            .children(SIZE_STEPS.map(|(label, size)| {
                                Button::new(SharedString::from(format!("btn-size-{label}")))
                                    .variant(ButtonVariant::Primary)
                                    .size(size)
                                    .label(label)
                            })),
                    )
                    .child(
                        h_flex()
                            .gap_2()
                            .flex_wrap()
                            .items_center()
                            .child(
                                Button::new("btn-leading")
                                    .leading_icon(PhosphorIcon::Plus)
                                    .label("Add"),
                            )
                            .child(
                                Button::new("btn-trailing")
                                    .trailing_icon(PhosphorIcon::ArrowRight)
                                    .label("Next"),
                            )
                            .child(
                                Button::new("btn-both-icons")
                                    .variant(ButtonVariant::Outline)
                                    .leading_icon(PhosphorIcon::DownloadSimple)
                                    .trailing_icon(PhosphorIcon::CaretDown)
                                    .label("Export"),
                            )
                            .children(ICON_STEPS.map(|(label, size)| {
                                Button::icon(
                                    SharedString::from(format!("btn-{label}")),
                                    PhosphorIcon::Gear,
                                )
                                .size(size)
                            })),
                    )
                    .child(
                        h_flex()
                            .gap_2()
                            .flex_wrap()
                            .items_center()
                            .child(
                                Button::new("btn-loading")
                                    .variant(ButtonVariant::Primary)
                                    .loading(true)
                                    .label("Saving"),
                            )
                            .child(
                                Button::new("btn-loading-icon")
                                    .variant(ButtonVariant::Outline)
                                    .loading(true)
                                    .trailing_icon(PhosphorIcon::ArrowRight)
                                    .label("Loading"),
                            )
                            .child(
                                Button::new("btn-loading-quiet")
                                    .variant(ButtonVariant::Quiet)
                                    .loading(true)
                                    .label("Quiet loading"),
                            )
                            .child(
                                Button::icon("btn-loading-only", PhosphorIcon::Gear).loading(true),
                            )
                            .child(
                                Button::new("btn-disabled")
                                    .variant(ButtonVariant::Primary)
                                    .disabled(true)
                                    .label("Disabled"),
                            ),
                    )
                    .child(
                        h_flex()
                            .gap_2()
                            .flex_wrap()
                            .items_center()
                            .child(
                                Button::new("btn-mono")
                                    .variant(ButtonVariant::Outline)
                                    .mono(true)
                                    .label("0x1234"),
                            )
                            .child(
                                Button::new("btn-caret")
                                    .variant(ButtonVariant::Outline)
                                    .dropdown_caret(true)
                                    .label("Dropdown"),
                            ),
                    ),
            )
    }

    pub(crate) fn render_kbd(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Kbd")
            .description("primitive/kbd — keyboard shortcut badge.")
            .child(
                h_flex()
                    .gap_3()
                    .items_center()
                    .flex_wrap()
                    .child(Kbd::new(
                        Keystroke::parse("cmd-d").expect("valid keystroke"),
                    ))
                    .child(Kbd::new(
                        Keystroke::parse("cmd-shift-p").expect("valid keystroke"),
                    ))
                    .child(Kbd::new(
                        Keystroke::parse("escape").expect("valid keystroke"),
                    )),
            )
    }

    pub(crate) fn render_link(&self, _cx: &mut Context<Self>) -> impl IntoElement {
        Card::new()
            .title("Link")
            .description("primitive/link — interactive hyperlink.")
            .child(
                h_flex()
                    .gap_3()
                    .items_center()
                    .child(
                        Link::new("link-gpui")
                            .href("https://gpui.rs")
                            .child("gpui.rs"),
                    )
                    .child(
                        Link::new("link-celestia")
                            .href("https://github.com")
                            .child("Open docs"),
                    ),
            )
    }
}
