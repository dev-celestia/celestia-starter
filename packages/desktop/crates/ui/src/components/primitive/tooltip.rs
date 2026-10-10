//! Tooltip — the desktop counterpart of `tooltip.tsx`, written on raw `gpui`.
//!
//! gpui's native tooltip mechanism (`InteractiveElement::tooltip`) owns the
//! hover detection, placement and switching between hints; what it asks the
//! caller for is a *view* to paint. This file is that view, styled with the
//! Celestia tokens so `.tooltip(...)` on any element renders like the web's
//! popover-surfaced hint.
//!
//! ```ignore
//! el.tooltip(move |window, cx| Tooltip::new("Save changes").build(window, cx))
//! ```
//!
//! This replaces the `gpui_component::tooltip::Tooltip` re-export the file used
//! to be; the constructor shape (`new` + `build`) is kept so call sites only
//! change their `use` line.

use gpui::{
    AnyView, App, AppContext as _, Context, IntoElement, ParentElement as _, Render, SharedString,
    Styled as _, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// A static text hint, painted on the popover surface with the theme border.
pub struct Tooltip {
    text: SharedString,
}

impl Tooltip {
    /// A hint for `text`.
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self { text: text.into() }
    }

    /// Build the hover view gpui's native tooltip renders.
    pub fn build(self, _: &mut Window, cx: &mut App) -> AnyView {
        cx.new(|_| self).into()
    }
}

impl Render for Tooltip {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div()
            // The margin keeps the hint clear of the cursor and the window edge.
            .m_3()
            .flex()
            .items_center()
            .font_family(cx.theme().font_family.clone())
            .bg(cx.theme().popover)
            .text_color(cx.theme().popover_foreground)
            .border_1()
            .border_color(cx.theme().border)
            .shadow_md()
            .rounded(cx.theme().radius)
            .py_0p5()
            .px_2()
            .text_size(px(14.))
            .child(self.text.clone())
    }
}

#[cfg(test)]
mod tests {
    use gpui::{
        Context, InteractiveElement as _, IntoElement, ParentElement as _, Render,
        StatefulInteractiveElement as _, TestAppContext, Window, div,
    };

    /// Mounts the hint through the same path callers use — the native
    /// `.tooltip(..)` builder — so the view is exercised inside a real window.
    struct HintView;

    impl Render for HintView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .id("hinted")
                .child("Hover me")
                .tooltip(|window, cx| super::Tooltip::new("Save").build(window, cx))
        }
    }

    #[gpui::test]
    fn tooltip_mounts_through_the_native_builder(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| HintView);
    }
}
