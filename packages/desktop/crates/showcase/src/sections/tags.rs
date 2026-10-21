use celestia_ui::components::Card;
use celestia_ui::components::primitive::badge::{Badge, BadgeVariant, GpuiBadge};
use celestia_ui::components::primitive::caption::Caption;
use celestia_ui::components::primitive::chip::{Chip, ChipVariant};
use celestia_ui::components::primitive::color_swatch::ColorSwatch;
use celestia_ui::components::primitive::count_label::CountLabel;
use celestia_ui::components::primitive::disclosure::Disclosure;
use celestia_ui::components::primitive::file_glyph::{FileGlyph, FileGlyphKind};
use celestia_ui::components::primitive::hotkey_hint::HotkeyHint;
use celestia_ui::components::primitive::icon::PhosphorIcon;
use celestia_ui::components::primitive::icon_label::IconLabel;
use celestia_ui::components::primitive::initials::{Initials, InitialsSize};
use celestia_ui::components::primitive::inline_code::InlineCode;
use celestia_ui::components::primitive::pill::Pill;
use celestia_ui::components::primitive::pin::Pin;
use celestia_ui::components::primitive::quote::Quote;
use celestia_ui::components::primitive::relative_time::RelativeTime;
use celestia_ui::components::primitive::status_dot::{StatusDot, StatusDotTone};
use celestia_ui::components::primitive::truncate::Truncate;
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_tag_demo(&self, demo: Demo, cx: &mut Context<Self>) -> AnyElement {
        let accent = cx.theme().accent;
        match demo {
            Demo::Badge => Card::new()
                .title("Badge")
                .description("Semantic label chips.")
                .child(
                    h_flex()
                        .gap_2()
                        .flex_wrap()
                        .items_center()
                        .child(Badge::new("Primary"))
                        .child(Badge::new("Success").variant(BadgeVariant::Success))
                        .child(Badge::new("Warning").variant(BadgeVariant::Warning))
                        .child(Badge::new("Destructive").variant(BadgeVariant::Destructive))
                        .child(GpuiBadge::new().count(8).child(Badge::new("Inbox"))),
                )
                .into_any_element(),
            Demo::Chip => Card::new()
                .title("Chip")
                .description("Interactive selectable / dismissible tag.")
                .child(
                    h_flex()
                        .gap_2()
                        .flex_wrap()
                        .items_center()
                        .child(Chip::new("chip-rust", "Rust").icon(PhosphorIcon::Code))
                        .child(Chip::new("chip-ui", "UI").outline().selected(true))
                        .child(Chip::new("chip-soft", "Soft").variant(ChipVariant::Soft)),
                )
                .into_any_element(),
            Demo::Pill => Card::new()
                .title("Pill")
                .description("Compact filter pill.")
                .child(
                    h_flex()
                        .gap_2()
                        .items_center()
                        .child(Pill::new("pill-all", "All").active(true))
                        .child(Pill::new("pill-open", "Open"))
                        .child(Pill::new("pill-closed", "Closed")),
                )
                .into_any_element(),
            Demo::CountLabel => Card::new()
                .title("CountLabel")
                .description("Numeric count with overflow cap.")
                .child(
                    h_flex()
                        .gap_3()
                        .items_center()
                        .child(CountLabel::new("cnt", 12))
                        .child(CountLabel::new("cnt-max", 120).max(99)),
                )
                .into_any_element(),
            Demo::StatusDot => Card::new()
                .title("StatusDot")
                .description("Presence pip with optional label.")
                .child(
                    h_flex()
                        .gap_4()
                        .items_center()
                        .child(StatusDot::new("sd-on").online().label("Online"))
                        .child(StatusDot::new("sd-away").away().label("Away"))
                        .child(StatusDot::new("sd-busy").busy().label("Busy"))
                        .child(
                            StatusDot::new("sd-off")
                                .tone(StatusDotTone::Offline)
                                .label("Offline"),
                        ),
                )
                .into_any_element(),
            Demo::Caption => Card::new()
                .title("Caption")
                .description("Muted helper text.")
                .child(Caption::new("Muted helper under a control."))
                .into_any_element(),
            Demo::Initials => Card::new()
                .title("Initials")
                .description("Avatar initials glyph.")
                .child(
                    h_flex()
                        .gap_3()
                        .items_center()
                        .child(Initials::new("in-1", "Ada Lovelace"))
                        .child(
                            Initials::new("in-2", "AL")
                                .size(InitialsSize::Lg)
                                .bg(accent.opacity(0.2)),
                        ),
                )
                .into_any_element(),
            Demo::ColorSwatch => Card::new()
                .title("ColorSwatch")
                .description("Color specimen with optional label.")
                .child(
                    h_flex()
                        .gap_3()
                        .items_center()
                        .child(ColorSwatch::new("cs-1", accent).label("#accent").selected(true))
                        .child(ColorSwatch::new("cs-2", cx.theme().primary).label("#primary")),
                )
                .into_any_element(),
            Demo::FileGlyph => Card::new()
                .title("FileGlyph")
                .description("File-type glyph.")
                .child(
                    h_flex()
                        .gap_3()
                        .items_center()
                        .child(FileGlyph::new("fg-code").kind(FileGlyphKind::Code))
                        .child(FileGlyph::new("fg-img").kind(FileGlyphKind::Image))
                        .child(FileGlyph::new("fg-doc").kind(FileGlyphKind::Doc)),
                )
                .into_any_element(),
            Demo::Pin => Card::new()
                .title("Pin")
                .description("Pinned / unpinned control.")
                .child(
                    h_flex()
                        .gap_3()
                        .items_center()
                        .child(Pin::new("pin-1").pinned(true))
                        .child(Pin::new("pin-2").pinned(false)),
                )
                .into_any_element(),
            Demo::Disclosure => Card::new()
                .title("Disclosure")
                .description("Expand / collapse chevron.")
                .child(
                    h_flex()
                        .gap_3()
                        .items_center()
                        .child(Disclosure::new("disc-1").open(true))
                        .child(Disclosure::new("disc-2").open(false)),
                )
                .into_any_element(),
            Demo::InlineCode => Card::new()
                .title("InlineCode")
                .description("Inline code span.")
                .child(
                    h_flex()
                        .gap_2()
                        .items_center()
                        .child(div().text_sm().child("Use"))
                        .child(InlineCode::new("cx.theme()"))
                        .child(div().text_sm().child("for colors.")),
                )
                .into_any_element(),
            Demo::Quote => Card::new()
                .title("Quote")
                .description("Block quote with cite.")
                .child(Quote::new("Ship the primitives people actually reuse.").cite("— Celestia"))
                .into_any_element(),
            Demo::Truncate => Card::new()
                .title("Truncate")
                .description("Single-line ellipsis truncation.")
                .child(
                    div().w(px(280.0)).child(Truncate::new(
                        "packages/desktop/crates/ui/src/components/primitive/very_long_path.rs",
                    )),
                )
                .into_any_element(),
            Demo::RelativeTime => Card::new()
                .title("RelativeTime")
                .description("Relative time label.")
                .child(
                    h_flex()
                        .gap_4()
                        .items_center()
                        .child(RelativeTime::new("2m ago"))
                        .child(RelativeTime::new("yesterday")),
                )
                .into_any_element(),
            Demo::IconLabel => Card::new()
                .title("IconLabel")
                .description("Icon + text row.")
                .child(
                    h_flex()
                        .gap_4()
                        .items_center()
                        .child(IconLabel::new(PhosphorIcon::Folder, "crates/ui"))
                        .child(IconLabel::new(PhosphorIcon::File, "README.md")),
                )
                .into_any_element(),
            Demo::HotkeyHint => Card::new()
                .title("HotkeyHint")
                .description("Action label with keystroke.")
                .child(HotkeyHint::new(
                    "Command palette",
                    Keystroke::parse("cmd-k").expect("keystroke"),
                ))
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not a tags/badges demo."))
                .into_any_element(),
        }
    }
}
