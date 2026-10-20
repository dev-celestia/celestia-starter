//! InlineCitation — superscript source chip beside prose.

use gpui::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// Inline citation badge (hostname + optional +N overflow).
#[derive(IntoElement)]
pub struct InlineCitation {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    extra: usize,
}

impl InlineCitation {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            extra: 0,
        }
    }

    /// Additional sources beyond the primary label (renders as `+N`).
    pub fn extra(mut self, count: usize) -> Self {
        self.extra = count;
        self
    }

    /// Build from a list of source URLs / paths — first becomes the label.
    pub fn from_sources(id: impl Into<ElementId>, sources: &[&str]) -> Self {
        let label = sources
            .first()
            .map(|s| format_source(s))
            .unwrap_or_else(|| "source".into());
        let extra = sources.len().saturating_sub(1);
        Self::new(id, label).extra(extra)
    }
}

fn format_source(source: &str) -> SharedString {
    if let Some(rest) = source
        .strip_prefix("https://")
        .or_else(|| source.strip_prefix("http://"))
    {
        let host = rest.split('/').next().unwrap_or(rest);
        return host.into();
    }
    source.rsplit('/').next().unwrap_or(source).into()
}

impl Styled for InlineCitation {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for InlineCitation {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let text = if self.extra > 0 {
            format!("{} +{}", self.label, self.extra)
        } else {
            self.label.to_string()
        };
        let mut chip = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .px(px(8.0))
            .py(px(2.0))
            .rounded_full()
            .bg(theme.muted)
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(theme.muted_foreground)
            .child(text);
        chip.style().refine(&self.style);
        chip
    }
}
