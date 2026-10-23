use celestia_ui::components::Card;
use celestia_ui::components::primitive::button::{
    Button, ButtonLoadingStyle, ButtonSize, ButtonVariant,
};
use celestia_ui::components::primitive::icon::PhosphorIcon;
use celestia_ui::components::primitive::kbd::Kbd;
use celestia_ui::components::primitive::link::Link;
use celestia_ui::components::primitive::table::{DataTable, TableColumn};
use celestia_ui::theme::ActiveTheme as _;
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
    pub(crate) fn render_button(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;

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
                        v_flex()
                            .gap_1p5()
                            .child(api_caption("Sizes — labeled", muted))
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
                            ),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption(
                                "Icon slots + icon-only (square) — glyph follows the size ladder",
                                muted,
                            ))
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
                            ),
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
                                Button::new("btn-loading-diamond")
                                    .variant(ButtonVariant::Primary)
                                    .loading(true)
                                    .loading_style(ButtonLoadingStyle::Diamond)
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
                                    .loading_style(ButtonLoadingStyle::Diamond)
                                    .label("Quiet diamond"),
                            )
                            .child(
                                Button::icon("btn-loading-only", PhosphorIcon::Gear).loading(true),
                            )
                            .child(
                                Button::icon("btn-loading-diamond-only", PhosphorIcon::Gear)
                                    .loading(true)
                                    .loading_style(ButtonLoadingStyle::Diamond),
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
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption("Size metrics (labeled)", muted))
                            .child(
                                DataTable::new(
                                    [
                                        TableColumn::new("Step").width(88.),
                                        TableColumn::new("Height").width(72.),
                                        TableColumn::new("Pad X").width(64.),
                                        TableColumn::new("Gap").width(56.),
                                        TableColumn::new("Text").width(56.),
                                        TableColumn::new("Icon").width(56.),
                                    ],
                                    vec![
                                        row(&["xs", "20px", "8px", "4px", "10px", "10px"]),
                                        row(&["sm", "24px", "10px", "4px", "12px", "12px"]),
                                        row(&[
                                            "default", "26px", "12px", "6px", "12px", "14px",
                                        ]),
                                        row(&["md", "28px", "10px", "4px", "12px", "12px"]),
                                        row(&["lg", "36px", "14px", "8px", "14px", "16px"]),
                                    ],
                                )
                                .caption(
                                    "md is sm + one height step — taller than default, smaller icon. \
                                     Desktop lg widens text/gap vs web (web keeps text-xs / gap-1.5).",
                                ),
                            ),
                    )
                    .child(
                        v_flex()
                            .gap_1p5()
                            .child(api_caption("Icon-only metrics (square)", muted))
                            .child(
                                DataTable::new(
                                    [
                                        TableColumn::new("Step").width(88.),
                                        TableColumn::new("Button").width(88.),
                                        TableColumn::new("Glyph").width(72.),
                                    ],
                                    vec![
                                        row(&["icon-xs", "16px", "10px"]),
                                        row(&["icon-sm", "20px", "12px"]),
                                        row(&["icon", "26px", "14px"]),
                                        row(&["icon-lg", "32px", "16px"]),
                                    ],
                                )
                                .caption(
                                    "Default icon-only is icon (26×26, 14px glyph) — matches labeled \
                                     default height. Leading/trailing icons on labeled buttons use \
                                     the labeled size ladder above.",
                                ),
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

fn row(cells: &[&str]) -> Vec<SharedString> {
    cells.iter().map(|c| SharedString::from(*c)).collect()
}

fn api_caption(text: impl Into<SharedString>, muted: Hsla) -> Div {
    div()
        .text_xs()
        .font_weight(FontWeight::MEDIUM)
        .text_color(muted)
        .child(text.into())
}
