//! Bordered content container with optional title and description.
//!
//! Surface and edge are the web's: `bg-card` is `theme.popover` (light
//! `#ffffff`, dark `#171717` — the exact port of web `--card`), and the edge is
//! `ring-1 ring-foreground/10`, i.e. the foreground at 10%, not the `border`
//! token. `overflow-hidden` clips a leading/trailing child image to the card's
//! radius, which is what the web's `*:[img:first-child]:rounded-t-lg` relies on.

use gpui_component::{ActiveTheme, h_flex, v_flex};
use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, FontWeight, IntoElement, ParentElement, RenderOnce, SharedString, Styled,
    Window, div, px,
};

/// Card padding and spacing density.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum CardSize {
    /// 16px padding, 14px inter-group gap (web `default`).
    #[default]
    Default,
    /// 12px padding, 10px inter-group gap (web `sm`).
    Small,
}

/// A card: raised, bordered container grouping related content.
///
/// Elevation rule inherited from the web token layer: card sits above
/// background and below muted/secondary; on light the surfaces share a color
/// and the border does the delineation, on dark the border is white-alpha.
#[derive(IntoElement)]
pub struct Card {
    title: Option<SharedString>,
    description: Option<SharedString>,
    action: Option<AnyElement>,
    footer: Option<AnyElement>,
    size: CardSize,
    children: Vec<AnyElement>,
}

impl Card {
    pub fn new() -> Self {
        Self {
            title: None,
            description: None,
            action: None,
            footer: None,
            size: CardSize::default(),
            children: Vec::new(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Header action pinned to the top-right corner of the card header
    /// (mirrors web `CardAction`).
    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.action = Some(action.into_any_element());
        self
    }

    /// Card footer pinned at the bottom with a subtle divider
    /// (mirrors web `CardFooter`).
    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }

    pub fn size(mut self, size: CardSize) -> Self {
        self.size = size;
        self
    }
}

impl Default for Card {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for Card {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for Card {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let (p, gap) = match self.size {
            CardSize::Default => (px(16.), px(14.)),
            CardSize::Small => (px(12.), px(10.)),
        };

        let has_header =
            self.title.is_some() || self.description.is_some() || self.action.is_some();
        let header = if has_header {
            Some(
                h_flex()
                    .w_full()
                    .items_start()
                    .justify_between()
                    .gap_3()
                    .child(
                        v_flex()
                            .flex_1()
                            .min_w_0()
                            .gap(px(3.0))
                            .when_some(self.title, |this, title| {
                                this.child(
                                    div()
                                        .text_sm()
                                        .font_weight(FontWeight::SEMIBOLD)
                                        .text_color(cx.theme().foreground)
                                        .line_height(px(20.0))
                                        .child(title),
                                )
                            })
                            .when_some(self.description, |this, description| {
                                this.child(
                                    div()
                                        .text_xs()
                                        .text_color(cx.theme().muted_foreground)
                                        .line_height(px(16.0))
                                        .child(description),
                                )
                            }),
                    )
                    .when_some(self.action, |this, action| {
                        this.child(div().flex_none().child(action))
                    }),
            )
        } else {
            None
        };

        v_flex()
            .w_full()
            .gap(gap)
            .p(p)
            // `bg-card` → `theme.popover`; the desktop's `background` is the
            // page surface, which on dark (`#0a0a0a`) is a full step below the
            // card and made every card read as a hole.
            .bg(cx.theme().popover)
            .border_1()
            // `ring-1 ring-foreground/10` — an alpha of the foreground, not the
            // `border` token.
            .border_color(cx.theme().foreground.opacity(0.10))
            .rounded(cx.theme().radius)
            .overflow_hidden()
            .children(header)
            .children(self.children)
            .when_some(self.footer, |this, footer| {
                this.child(
                    div()
                        .w_full()
                        .pt(px(10.))
                        .border_t_1()
                        .border_color(cx.theme().border)
                        .child(footer),
                )
            })
    }
}
