//! TerminalPanel — chrome for a terminal / console output region.

use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(IntoElement)]
pub struct TerminalPanel {
    id: ElementId,
    style: StyleRefinement,
    title: SharedString,
    lines: Vec<SharedString>,
    toolbar: Vec<AnyElement>,
}

impl TerminalPanel {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: "Terminal".into(),
            lines: Vec::new(),
            toolbar: Vec::new(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn line(mut self, line: impl Into<SharedString>) -> Self {
        self.lines.push(line.into());
        self
    }

    pub fn tool(mut self, tool: impl IntoElement) -> Self {
        self.toolbar.push(tool.into_any_element());
        self
    }
}

impl Styled for TerminalPanel {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for TerminalPanel {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background)
            .overflow_hidden();
        root.style().refine(&self.style);
        root.child(
            div()
                .px(px(10.0))
                .h(px(32.0))
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .border_b_1()
                .border_color(theme.border)
                .bg(theme.muted.opacity(0.4))
                .child(
                    div()
                        .flex_1()
                        .text_xs()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(theme.muted_foreground)
                        .child(self.title),
                )
                .children(self.toolbar),
        )
        .child(
            div()
                .w_full()
                .p(px(10.0))
                .min_h(px(100.0))
                .flex()
                .flex_col()
                .gap(px(2.0))
                .children(self.lines.into_iter().map(|line| {
                    div()
                        .text_xs()
                        .font_family(theme.mono_font_family.clone())
                        .text_color(theme.foreground)
                        .child(line)
                })),
        )
    }
}
