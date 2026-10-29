//! Plan tray — the agent's todo list.
//!
//! A [`Plan`] is a header row (`Todo · 2/5`) with one [`PlanStep`] per item.
//! Steps fold away when collapsed so the composer keeps its room. `card(false)`
//! drops the outer surface when the caller already paints one (a tray).

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::primitive::spinner::Spinner;
use crate::theme::ActiveTheme as _;

type OnToggle = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Completion state of one plan step.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum PlanStepStatus {
    /// Still to do.
    #[default]
    Pending,
    /// In flight — the row spins.
    Active,
    /// Finished.
    Done,
}

/// One line of a [`Plan`].
#[derive(Clone)]
pub struct PlanStep {
    id: ElementId,
    text: SharedString,
    status: PlanStepStatus,
}

impl PlanStep {
    pub fn new(id: impl Into<ElementId>, text: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            text: text.into(),
            status: PlanStepStatus::default(),
        }
    }

    pub fn status(mut self, status: PlanStepStatus) -> Self {
        self.status = status;
        self
    }
}

/// A collapsible todo plan.
#[derive(IntoElement)]
pub struct Plan {
    id: ElementId,
    header: SharedString,
    steps: Vec<PlanStep>,
    card: bool,
    open: bool,
    on_toggle: Option<OnToggle>,
    on_dismiss: Option<OnToggle>,
}

impl Plan {
    pub fn new(id: impl Into<ElementId>, header: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            header: header.into(),
            steps: Vec::new(),
            card: true,
            open: false,
            on_toggle: None,
            on_dismiss: None,
        }
    }

    /// Paint the outer bordered surface (default `true`). Tray hosts that
    /// already draw a card pass `false`.
    pub fn card(mut self, card: bool) -> Self {
        self.card = card;
        self
    }

    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    pub fn step(mut self, step: PlanStep) -> Self {
        self.steps.push(step);
        self
    }

    pub fn steps(mut self, steps: impl IntoIterator<Item = PlanStep>) -> Self {
        self.steps.extend(steps);
        self
    }

    pub fn on_toggle(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_toggle = Some(Rc::new(f));
        self
    }

    /// Dismiss affordance in the header — only shown when set.
    pub fn on_dismiss(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_dismiss = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for Plan {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let open = self.open;
        let on_toggle = self.on_toggle;
        let on_dismiss = self.on_dismiss;
        let dismiss_id = ElementId::Name(format!("{}-dismiss", self.id).into());

        let header = div()
            .id(ElementId::Name(format!("{}-trigger", self.id).into()))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(4.0))
            .py(px(2.0))
            .rounded(theme.radius_xs())
            .when(on_toggle.is_some(), |this| {
                this.cursor_pointer()
                    .hover(|s| s.bg(theme.muted.opacity(0.5)))
            })
            .when_some(on_toggle, |this, on| {
                this.on_click(move |e: &ClickEvent, window, cx| on(e, window, cx))
            })
            .child(
                Phosphor::new(if open {
                    PhosphorIcon::CaretDown
                } else {
                    PhosphorIcon::CaretRight
                })
                .size(px(10.0))
                .color(theme.muted_foreground),
            )
            .child(
                Phosphor::new(PhosphorIcon::ListChecks)
                    .size(px(12.0))
                    .color(theme.muted_foreground),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.muted_foreground)
                    .whitespace_nowrap()
                    .overflow_hidden()
                    .text_ellipsis()
                    .child(self.header.clone()),
            )
            .when_some(on_dismiss, |this, on| {
                this.child(
                    div()
                        .id(dismiss_id)
                        .size(px(16.0))
                        .rounded(theme.radius_xs())
                        .flex()
                        .items_center()
                        .justify_center()
                        .hover(|s| s.bg(theme.muted))
                        .on_click(move |e: &ClickEvent, window, cx| {
                            cx.stop_propagation();
                            on(e, window, cx);
                        })
                        .child(
                            Phosphor::new(PhosphorIcon::X)
                                .size(px(10.0))
                                .color(theme.muted_foreground),
                        ),
                )
            });

        let mut root = div()
            .id(self.id)
            .w_full()
            .min_w_0()
            .flex()
            .flex_col()
            .when(self.card, |this| {
                this.rounded(theme.radius)
                    .border_1()
                    .border_color(theme.border)
                    .bg(theme.popover)
                    .px(px(8.0))
                    .py(px(6.0))
            })
            .child(header);

        if open && !self.steps.is_empty() {
            let rows = self.steps.into_iter().map(|step| {
                let color = match step.status {
                    PlanStepStatus::Done => theme.muted_foreground,
                    PlanStepStatus::Active => theme.foreground,
                    PlanStepStatus::Pending => theme.muted_foreground,
                };
                let glyph = match step.status {
                    PlanStepStatus::Done => div()
                        .flex()
                        .items_center()
                        .justify_center()
                        .size(px(12.0))
                        .child(
                            Phosphor::new(PhosphorIcon::CheckCircle)
                                .size(px(12.0))
                                .color(theme.success),
                        )
                        .into_any_element(),
                    PlanStepStatus::Active => div()
                        .flex()
                        .items_center()
                        .justify_center()
                        .size(px(12.0))
                        .child(Spinner::new().size(px(11.0)).color(theme.primary))
                        .into_any_element(),
                    PlanStepStatus::Pending => div()
                        .flex()
                        .items_center()
                        .justify_center()
                        .size(px(12.0))
                        .child(Phosphor::new(PhosphorIcon::Circle).size(px(10.0)).color(color))
                        .into_any_element(),
                };
                div()
                    .id(step.id)
                    .flex()
                    .flex_row()
                    .items_start()
                    .gap(px(6.0))
                    .py(px(2.0))
                    .w_full()
                    .min_w_0()
                    .child(glyph)
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .text_xs()
                            .line_height(px(16.0))
                            .text_color(color)
                            .whitespace_normal()
                            .child(step.text),
                    )
            });
            root = root.child(
                div()
                    .flex()
                    .flex_col()
                    .gap(px(2.0))
                    .pt(px(2.0))
                    .pl(px(2.0))
                    .children(rows),
            );
        }

        root
    }
}
