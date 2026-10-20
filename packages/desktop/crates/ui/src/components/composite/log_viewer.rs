//! LogViewer — scrollable log rows with level badges.

use gpui::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum LogLevel {
    #[default]
    Info,
    Warn,
    Error,
    Debug,
}

#[derive(IntoElement)]
pub struct LogRow {
    id: ElementId,
    level: LogLevel,
    time: SharedString,
    message: SharedString,
}

impl LogRow {
    pub fn new(
        id: impl Into<ElementId>,
        time: impl Into<SharedString>,
        message: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            level: LogLevel::default(),
            time: time.into(),
            message: message.into(),
        }
    }

    pub fn level(mut self, level: LogLevel) -> Self {
        self.level = level;
        self
    }
}

impl RenderOnce for LogRow {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (label, color) = match self.level {
            LogLevel::Info => ("INF", theme.info),
            LogLevel::Warn => ("WRN", theme.warning),
            LogLevel::Error => ("ERR", theme.danger),
            LogLevel::Debug => ("DBG", theme.muted_foreground),
        };
        div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_start()
            .gap(px(8.0))
            .py(px(3.0))
            .child(
                div()
                    .w(px(28.0))
                    .text_xs()
                    .font_family(theme.mono_font_family.clone())
                    .font_weight(FontWeight::BOLD)
                    .text_color(color)
                    .child(label),
            )
            .child(
                div()
                    .w(px(64.0))
                    .text_xs()
                    .font_family(theme.mono_font_family.clone())
                    .text_color(theme.muted_foreground)
                    .child(self.time),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_xs()
                    .font_family(theme.mono_font_family.clone())
                    .text_color(theme.foreground)
                    .child(self.message),
            )
    }
}

#[derive(IntoElement)]
pub struct LogViewer {
    id: ElementId,
    style: StyleRefinement,
    rows: Vec<LogRow>,
}

impl LogViewer {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            rows: Vec::new(),
        }
    }

    pub fn row(mut self, row: LogRow) -> Self {
        self.rows.push(row);
        self
    }
}

impl Styled for LogViewer {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for LogViewer {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .p(px(8.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background)
            .min_h(px(120.0));
        root.style().refine(&self.style);
        root.children(self.rows)
    }
}
