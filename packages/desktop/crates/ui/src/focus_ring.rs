//! The Celestia focus ring — the desktop counterpart of
//! `focus-visible:ring-2 focus-visible:ring-ring`.
//!
//! The house rule lives in `packages/ui/src/styles/globals.css`:
//!
//! > Every focus ring is `focus-visible:ring-2 focus-visible:ring-ring` (2px,
//! > full strength). Diluted rings (`ring-ring/30`) fail WCAG 2.4.11.
//!
//! and is enforced on the web by `scripts/ui-audit/focus-rings.mjs`. `gpui-component`'s
//! own [`ThemeStyled::focus_ring_style`](gpui_component::ThemeStyled::focus_ring_style)
//! draws a **3px ring at 50% opacity** — deliberately softer, and therefore the
//! opposite of the Celestia rule. Components in this crate that show a focus
//! ring call [`focus_ring`] here instead, so the desktop ring is the same 2px
//! at full strength as the web one.
//!
//! Geometry follows `gpui-component`'s helper: the ring is a child painted *outside* the
//! element's border box, so an ancestor that clips its content will cut it off.
//! Leave the element a couple of pixels of room, or don't clip.
//!
//! ```ignore
//! let el = div().border_1().border_color(border).rounded(radius);
//! let el = if focus_handle.is_focused(window) {
//!     focus_ring(el, window, cx)
//! } else {
//!     el
//! };
//! ```

use gpui::{App, Corners, Edges, ParentElement, Pixels, StyleRefinement, Styled, Window, div, px};
use gpui_component::{ActiveTheme as _, StyledExt as _};

/// Ring thickness — Tailwind's `ring-2`, and the value the web audit gate
/// requires.
pub const FOCUS_RING_WIDTH: Pixels = px(2.);

/// Distance between the element's border box and the ring.
pub const FOCUS_RING_OFFSET: Pixels = px(2.);

/// Paint a 2px, full-strength `ring`-coloured ring around `element`.
///
/// `element` must already carry the border width and corner radius it will be
/// painted with: the ring reads both so it hugs the border and matches the
/// corners.
pub fn focus_ring<T: Styled + ParentElement>(mut element: T, window: &Window, cx: &App) -> T {
    let rem_size = window.rem_size();
    let style = element.style();

    let border_widths = Edges::<Pixels> {
        top: resolve(style.border_widths.top, rem_size),
        bottom: resolve(style.border_widths.bottom, rem_size),
        left: resolve(style.border_widths.left, rem_size),
        right: resolve(style.border_widths.right, rem_size),
    };
    let radius = Corners::<Pixels> {
        top_left: resolve(style.corner_radii.top_left, rem_size),
        top_right: resolve(style.corner_radii.top_right, rem_size),
        bottom_left: resolve(style.corner_radii.bottom_left, rem_size),
        bottom_right: resolve(style.corner_radii.bottom_right, rem_size),
    }
    .map(|value| *value + FOCUS_RING_WIDTH);

    let mut ring_style = StyleRefinement::default();
    ring_style.corner_radii.top_left = Some(radius.top_left.into());
    ring_style.corner_radii.top_right = Some(radius.top_right.into());
    ring_style.corner_radii.bottom_left = Some(radius.bottom_left.into());
    ring_style.corner_radii.bottom_right = Some(radius.bottom_right.into());

    let inset = FOCUS_RING_OFFSET;
    element.child(
        div()
            .flex_none()
            .absolute()
            .top(-(inset + border_widths.top))
            .left(-(inset + border_widths.left))
            .right(-(inset + border_widths.right))
            .bottom(-(inset + border_widths.bottom))
            .border(FOCUS_RING_WIDTH)
            // Full strength: no `alpha()` — see the module docs.
            .border_color(cx.theme().ring)
            .refine_style(&ring_style),
    )
}

fn resolve(value: Option<gpui::AbsoluteLength>, rem_size: Pixels) -> Pixels {
    value
        .map(|value| value.to_pixels(rem_size))
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The two values the web audit gate pins. If either moves, the desktop
    /// ring stops matching `focus-visible:ring-2 focus-visible:ring-ring`.
    #[test]
    fn ring_is_two_pixels_and_full_strength() {
        assert_eq!(FOCUS_RING_WIDTH, px(2.));
        assert_eq!(FOCUS_RING_OFFSET, px(2.));

        // The rule is stated in terms of Tailwind's `ring-2`, which is 2px.
        // `gpui-component`'s own ring is 3px at 50% — assert we are not that.
        assert_ne!(FOCUS_RING_WIDTH, px(3.));
    }
}
