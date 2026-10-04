//! Context badges — pills standing in for structured context a message
//! carries, ported from `reference/zeron` (`crates/ui/src/badges.rs`).
//!
//! A surface stages context (a file reference, a commit, a diff comment),
//! folds it into the message as plain text, and renders a
//! [`MessageBadge`] pill in its place; hovering the pill lifts a card of
//! [`BadgeDetail`] rows. Nothing here knows what the context *is* — the three
//! detail slots (location, tag, body) are generic.

use std::sync::Arc;
use std::time::Duration;

use gpui_kit::component::Icon;
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, AppContext as _, Context, Div, ElementId, FontWeight, InteractiveElement, IntoElement, ParentElement, Render,
    SharedString, Stateful, StatefulInteractiveElement, Styled, Window, div, px,
};
use gpui_kit::assets::IconName;
use gpui_kit::component::ActiveTheme;

/// A badge pill: icon + label, plus optional hover-card details.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MessageBadge {
    pub icon: IconName,
    pub label: SharedString,
    /// Empty means the label says everything and the pill carries no card.
    pub details: Vec<BadgeDetail>,
}

/// One row of a hover card. Three generic slots, so a new badge kind fills
/// them without this module learning what it cites.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BadgeDetail {
    /// `src/main.rs:42`, a URL, a commit subject.
    pub location: SharedString,
    /// `L`/`R` for a diff side, a status, a count.
    pub tag: Option<SharedString>,
    pub body: SharedString,
}

/// The composer sizes its strip arithmetically, so this cannot be a
/// measurement.
pub const BADGE_HEIGHT: f32 = 24.0;

const PILL_RADIUS: f32 = 8.0;
const ICON_SIZE: f32 = 12.0;
const TEXT_SIZE: f32 = 12.0;
const CARD_WIDTH: f32 = 320.0;
const HOVER_DELAY: Duration = Duration::from_millis(280);

/// The badge pill. `id` scopes the hover card and must be stable per rendered
/// pill.
pub fn context_badge(
    id: impl Into<ElementId>,
    badge: &MessageBadge,
    cx: &App,
) -> Stateful<Div> {
    let theme = cx.theme();
    div()
        .id(id)
        .h(px(BADGE_HEIGHT))
        .flex()
        .flex_row()
        .items_center()
        .gap(px(6.0))
        .px(px(8.0))
        .rounded(px(PILL_RADIUS))
        .bg(theme.muted)
        .text_size(px(TEXT_SIZE))
        .font_weight(FontWeight::MEDIUM)
        .text_color(theme.muted_foreground)
        .child(
            Icon::new(badge.icon)
                .size(px(ICON_SIZE))
                .text_color(theme.muted_foreground.opacity(0.7)),
        )
        .child(badge.label.clone())
        .when(!badge.details.is_empty(), |el| {
            let details = Arc::new(badge.details.clone());
            el.tooltip(move |_, cx| {
                cx.new(|_| BadgeCard {
                    details: details.clone(),
                })
                .into()
            })
            .tooltip_show_delay(HOVER_DELAY)
        })
}

struct BadgeCard {
    details: Arc<Vec<BadgeDetail>>,
}

impl BadgeCard {
    fn row(detail: &BadgeDetail, cx: &App) -> Div {
        let theme = cx.theme();
        div()
            .flex()
            .flex_row()
            .gap(px(8.0))
            .p(px(8.0))
            .rounded(px(6.0))
            .bg(theme.muted.opacity(0.5))
            .child(
                div()
                    .flex_none()
                    .w(px(2.0))
                    .rounded(px(1.0))
                    .bg(theme.primary.opacity(0.35)),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .flex()
                    .flex_col()
                    .gap(px(4.0))
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .items_center()
                            .gap(px(6.0))
                            .font_family(theme.mono_font_family.clone())
                            .text_size(px(10.0))
                            .text_color(theme.muted_foreground.opacity(0.8))
                            .child(
                                div()
                                    .flex_1()
                                    .min_w_0()
                                    .truncate()
                                    .child(detail.location.clone()),
                            )
                            .children(detail.tag.clone().map(|tag| {
                                div()
                                    .flex_none()
                                    .px(px(4.0))
                                    .rounded(px(3.0))
                                    .bg(theme.muted)
                                    .child(tag)
                            })),
                    )
                    .child(
                        div()
                            .min_w_0()
                            .text_size(px(TEXT_SIZE))
                            .line_height(px(16.0))
                            .text_color(theme.popover_foreground)
                            .child(detail.body.clone()),
                    ),
            )
    }
}

impl Render for BadgeCard {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .w(px(CARD_WIDTH))
            .border_1()
            .border_color(theme.border)
            .rounded(px(12.0))
            .shadow_lg()
            .bg(theme.popover)
            .p(px(6.0))
            .flex()
            .flex_col()
            .gap(px(4.0))
            .children(self.details.iter().map(|detail| Self::row(detail, cx)))
    }
}
