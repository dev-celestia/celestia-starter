//! Shared notice chip — the tinted failure card, ported from `reference/zeron`
//! (`crates/ui/src/notice.rs`, the composer `Notice` / transcript `ErrorChip`).
//!
//! A tinted rounded chip — `border <accent>/[0.16]` over a `<accent>/[0.05]`
//! wash, never a bare stroke — with a header row (alert triangle + medium
//! label, a copy button pinned to its top-right corner: failure payloads are
//! meant to be pasted, not screenshotted) and the message below. The message
//! WRAPS instead of truncating: failure payloads carry exit statuses and
//! stderr, and a one-line ellipsis is what makes them undiagnosable from a
//! screenshot.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, AppContext as _, ClipboardItem, Context, Div, FontWeight, Hsla, InteractiveElement as _,
    IntoElement, ParentElement, Render, SharedString, StatefulInteractiveElement as _, Styled,
    Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::motion::mix;
use crate::theme::ActiveTheme as _;

/// The tooltip body for the copy affordance — a plain popover chip.
///
/// gpui's native `.tooltip(..)` takes a view builder, so this is the smallest
/// view that reads as a tooltip. No third-party tooltip widget is involved.
struct CopyHint;

impl Render for CopyHint {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .px(px(8.0))
            .py(px(4.0))
            .rounded(px(6.0))
            .bg(theme.popover)
            .border_1()
            .border_color(theme.border)
            .text_size(px(12.0))
            .text_color(theme.popover_foreground)
            .child("Copy message")
    }
}

/// The chip's header icon treatment, which also picks its metrics: the bare
/// triangle reads lighter and scales with the chip's text; the tile anchors a
/// block-level chip at fixed metrics.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum NoticeChipIcon {
    /// Bare 14px triangle in the label color; 12px inset/radius, 12px text on
    /// a 16px line height (the inline notice).
    Plain,
    /// 20px accent-washed tile holding a 12px triangle; 10px inset/radius,
    /// fixed 12px text (the block chip).
    Tile,
}

/// The failure notice both inline and block surfaces render: a tinted rounded
/// chip with a header row (triangle + medium label, copy button top-right)
/// and the wrapping message below. `warning` picks the amber palette over the
/// default danger red. Callers chain their own chrome (ids, dismissal,
/// `w_full().overflow_hidden()`).
pub fn notice_chip(
    warning: bool,
    label: &'static str,
    message: impl Into<SharedString>,
    icon: NoticeChipIcon,
    cx: &App,
) -> Div {
    let theme = cx.theme();
    let accent: Hsla = if warning { theme.warning } else { theme.danger };
    // zeron reads a `*_muted` theme role here; we derive the softened text
    // accent by pulling the accent toward the foreground (reads in both modes).
    let muted = mix(accent, theme.foreground, 0.35);
    let message = message.into();
    let copy_message = message.clone();
    let tile = matches!(icon, NoticeChipIcon::Tile);
    let frame = |inset: f32| {
        div()
            .flex()
            .flex_col()
            .gap(px(6.0))
            .rounded(px(inset))
            .border_1()
            .border_color(accent.opacity(0.16))
            .bg(accent.opacity(0.05))
            .px(px(inset))
            .py(px(8.0))
    };
    let chip = if tile {
        frame(10.0).text_size(px(12.0))
    } else {
        frame(12.0).text_size(px(12.0)).line_height(px(16.0))
    };
    let header_icon = if tile {
        div()
            .flex_none()
            .size(px(20.0))
            .rounded(px(6.0))
            .bg(accent.opacity(0.12))
            .flex()
            .items_center()
            .justify_center()
            .child(
                Phosphor::new(PhosphorIcon::Warning)
                    .size(px(12.0))
                    .color(muted.opacity(0.8)),
            )
            .into_any_element()
    } else {
        Phosphor::new(PhosphorIcon::Warning)
            .size(px(14.0))
            .color(muted.opacity(0.9))
            .into_any_element()
    };
    // The tile pins its own label/message colors; the plain icon inherits the
    // chip-wide muted accent.
    chip.child(
        div()
            .flex()
            .items_center()
            .gap(px(8.0))
            .child(header_icon)
            .child(
                div()
                    .font_weight(FontWeight::MEDIUM)
                    .when(tile, |label| label.text_color(muted.opacity(0.8)))
                    .child(label),
            )
            .child(div().flex_1())
            .child(
                div()
                    .id("notice-copy")
                    .flex_none()
                    .size(px(20.0))
                    .rounded(px(6.0))
                    .flex()
                    .items_center()
                    .justify_center()
                    .cursor_pointer()
                    .hover(move |s| s.bg(accent.opacity(0.12)))
                    // The composer chip dismisses on click; copying must
                    // not take the notice with it.
                    .on_click(move |_, _, cx| {
                        cx.stop_propagation();
                        cx.write_to_clipboard(ClipboardItem::new_string(copy_message.to_string()));
                    })
                    .tooltip(|_, cx| cx.new(|_| CopyHint).into())
                    .child(
                        Phosphor::new(PhosphorIcon::Copy)
                            .size(px(12.0))
                            .color(muted.opacity(0.8)),
                    ),
            ),
    )
    .child(
        div()
            .min_w_0()
            .w_full()
            .line_height(px(18.0))
            .when(tile, |message| {
                message.text_color(theme.foreground.opacity(0.85))
            })
            .child(message),
    )
}
