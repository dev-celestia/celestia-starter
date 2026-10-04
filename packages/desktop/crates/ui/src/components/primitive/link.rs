//! Link — the desktop counterpart of
//! `packages/ui/src/components/primitive/link.tsx`.
//!
//! Written directly on `gpui`. The desktop analogue of `<a>`: underlined link
//! text that opens `href` in the system browser. A caller-supplied `on_click`
//! runs *in addition* to the navigation, so a link can also drive app state.
//!
//! The pointer-down handler stops propagation so a link inside a draggable or
//! clickable row does not also trigger the row.

use gpui::{
    AnyElement, ClickEvent, ElementId, InteractiveElement as _, IntoElement, MouseButton,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div,
};

use crate::theme::ActiveTheme as _;

/// The activation handler for a [`Link`].
type OnClick = Box<dyn Fn(&ClickEvent, &mut Window, &mut gpui::App) + 'static>;

/// A hyperlink — underlined text that opens a URL, and/or runs a callback.
#[derive(IntoElement)]
pub struct Link {
    id: ElementId,
    style: StyleRefinement,
    href: Option<SharedString>,
    disabled: bool,
    on_click: Option<OnClick>,
    children: Vec<AnyElement>,
}

impl Link {
    /// A link with the given element id.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            href: None,
            disabled: false,
            on_click: None,
            children: Vec::new(),
        }
    }

    /// The URL to open in the system browser on activation.
    pub fn href(mut self, href: impl Into<SharedString>) -> Self {
        self.href = Some(href.into());
        self
    }

    /// Run in addition to navigation, if `href` is set.
    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut gpui::App) + 'static,
    ) -> Self {
        self.on_click = Some(Box::new(handler));
        self
    }

    /// Mark the link disabled. Retained for API parity — like the web
    /// primitive, a disabled link still paints its hover affordance but the
    /// state is advisory: activation is governed by whether `href` / `on_click`
    /// are set.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Styled for Link {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl ParentElement for Link {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements)
    }
}

impl RenderOnce for Link {
    fn render(self, _: &mut Window, cx: &mut gpui::App) -> impl IntoElement {
        let href = self.href.clone();
        let on_click = self.on_click;
        let link = cx.theme().link;

        let mut root = div()
            .id(self.id)
            .text_color(link)
            .text_decoration_1()
            .text_decoration_color(link.opacity(0.5))
            .hover(move |this| {
                this.text_color(link.opacity(0.8))
                    .text_decoration_1()
                    .text_decoration_color(link)
            })
            .active(move |this| {
                this.text_color(link.opacity(0.6))
                    .text_decoration_1()
                    .text_decoration_color(link)
            })
            .cursor_pointer()
            .on_mouse_down(MouseButton::Left, |_, _, cx| {
                cx.stop_propagation();
            })
            .on_click(move |event, window, cx| {
                if let Some(href) = &href {
                    cx.open_url(href);
                }
                if let Some(on_click) = &on_click {
                    on_click(event, window, cx);
                }
            });
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.children(self.children)
    }
}
