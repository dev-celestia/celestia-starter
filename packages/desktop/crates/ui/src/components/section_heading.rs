//! Section heading: eyebrow + title + description, the agency idiom from the
//! web landing (SectionHeading/IconTile) ported to GPUI.

use gpui_kit::component::{ActiveTheme, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, FontWeight, IntoElement, ParentElement, RenderOnce, SharedString, Styled, Window, div, px,
};

#[derive(IntoElement)]
pub struct SectionHeading {
    eyebrow: Option<SharedString>,
    title: SharedString,
    description: Option<SharedString>,
}

impl SectionHeading {
    pub fn new(title: impl Into<SharedString>) -> Self {
        Self {
            eyebrow: None,
            title: title.into(),
            description: None,
        }
    }

    /// Small caps-style label above the title. Pass the string pre-uppercased;
    /// GPUI has no text-transform.
    pub fn eyebrow(mut self, eyebrow: impl Into<SharedString>) -> Self {
        self.eyebrow = Some(eyebrow.into());
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }
}

impl RenderOnce for SectionHeading {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        v_flex()
            .gap(px(6.0))
            .when_some(self.eyebrow, |this, eyebrow| {
                this.child(
                    div()
                        .text_xs()
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(cx.theme().muted_foreground)
                        .child(eyebrow),
                )
            })
            .child(
                div()
                    .text_size(px(18.))
                    .line_height(px(24.))
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(cx.theme().foreground)
                    .child(self.title),
            )
            .when_some(self.description, |this, description| {
                this.child(
                    div()
                        .text_sm()
                        .line_height(px(20.))
                        .text_color(cx.theme().muted_foreground)
                        .child(description),
                )
            })
    }
}
