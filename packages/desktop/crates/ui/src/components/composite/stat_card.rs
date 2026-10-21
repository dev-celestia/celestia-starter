//! Stat card group — metric tiles with label, value, delta, optional sparkline.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, Hsla, InteractiveElement as _, IntoElement,
    ParentElement, PathBuilder, Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled,
    Window, canvas, div, point, px, relative,
};

use crate::theme::ActiveTheme as _;

/// Direction of a metric delta.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum StatDeltaTone {
    #[default]
    Neutral,
    Up,
    Down,
}

/// Padding and value typography density for a [`StatCard`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum StatCardSize {
    /// Dashboard tile: 14px padding, 22px value.
    #[default]
    Default,
    /// Compact tile: 10px padding, body-sized value.
    Small,
}

/// One metric tile.
#[derive(IntoElement)]
pub struct StatCard {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    value: SharedString,
    delta: Option<SharedString>,
    delta_tone: StatDeltaTone,
    sparkline: Vec<f32>,
    footer: Option<AnyElement>,
    size: StatCardSize,
}

impl StatCard {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        value: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            value: value.into(),
            delta: None,
            delta_tone: StatDeltaTone::default(),
            sparkline: Vec::new(),
            footer: None,
            size: StatCardSize::default(),
        }
    }

    pub fn size(mut self, size: StatCardSize) -> Self {
        self.size = size;
        self
    }

    pub fn delta(mut self, delta: impl Into<SharedString>, tone: StatDeltaTone) -> Self {
        self.delta = Some(delta.into());
        self.delta_tone = tone;
        self
    }

    /// Normalized 0..1 samples drawn as a tiny sparkline.
    pub fn sparkline(mut self, samples: impl IntoIterator<Item = f32>) -> Self {
        self.sparkline = samples.into_iter().collect();
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }
}

impl Styled for StatCard {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for StatCard {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let delta_color = match self.delta_tone {
            StatDeltaTone::Neutral => theme.muted_foreground,
            StatDeltaTone::Up => theme.success,
            StatDeltaTone::Down => theme.danger,
        };
        let spark = self.sparkline.clone();
        let line_color = theme.accent;
        let (min_w, gap, pad, spark_h) = match self.size {
            StatCardSize::Default => (px(160.0), px(8.0), px(14.0), px(32.0)),
            StatCardSize::Small => (px(120.0), px(4.0), px(10.0), px(24.0)),
        };
        let value = match self.size {
            StatCardSize::Default => div()
                .text_size(px(22.0))
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(theme.foreground)
                .child(self.value),
            StatCardSize::Small => div()
                .text_sm()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(theme.foreground)
                .child(self.value),
        };

        let mut root = div()
            .id(self.id)
            .flex_1()
            .min_w(min_w)
            .flex()
            .flex_col()
            .gap(gap)
            .p(pad)
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover);
        root.style().refine(&self.style);

        root.child(
            div()
                .text_xs()
                .font_weight(FontWeight::MEDIUM)
                .text_color(theme.muted_foreground)
                .child(self.label),
        )
        .child(
            div()
                .flex()
                .flex_row()
                .items_baseline()
                .justify_between()
                .gap(px(8.0))
                .child(value)
                .when_some(self.delta, |this, delta| {
                    this.child(
                        div()
                            .text_xs()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(delta_color)
                            .child(delta),
                    )
                }),
        )
        .when(!spark.is_empty(), |this| {
            this.child(
                div()
                    .w_full()
                    .h(spark_h)
                    .child(sparkline_canvas(spark, line_color)),
            )
        })
        .when_some(self.footer, |this, footer| this.child(footer))
    }
}

fn sparkline_canvas(samples: Vec<f32>, color: Hsla) -> impl IntoElement {
    canvas(
        |_, _, _| (),
        move |bounds, _, window, _| {
            if samples.len() < 2 {
                return;
            }
            let w = bounds.size.width;
            let h = bounds.size.height;
            let min = samples.iter().cloned().fold(f32::INFINITY, f32::min);
            let max = samples.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
            let span = (max - min).max(0.0001);
            let mut builder = PathBuilder::stroke(px(1.5));
            for (i, v) in samples.iter().enumerate() {
                let t = i as f32 / (samples.len() - 1) as f32;
                let x = bounds.origin.x + w * t;
                let y = bounds.origin.y + h * (1.0 - ((v - min) / span));
                let pt = point(x, y);
                if i == 0 {
                    builder.move_to(pt);
                } else {
                    builder.line_to(pt);
                }
            }
            if let Ok(path) = builder.build() {
                window.paint_path(path, color);
            }
        },
    )
    .size(relative(1.))
}

/// A responsive row of [`StatCard`]s.
#[derive(IntoElement)]
pub struct StatCardGroup {
    id: ElementId,
    style: StyleRefinement,
    cards: Vec<AnyElement>,
}

impl StatCardGroup {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            cards: Vec::new(),
        }
    }

    pub fn card(mut self, card: impl IntoElement) -> Self {
        self.cards.push(card.into_any_element());
        self
    }
}

impl Styled for StatCardGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for StatCardGroup {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .flex_wrap()
            .gap(px(12.0));
        root.style().refine(&self.style);
        root.children(self.cards)
    }
}
