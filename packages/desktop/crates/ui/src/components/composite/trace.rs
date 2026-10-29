//! Agent trace blocks — [`Reasoning`] and [`Tool`].
//!
//! Both share the transcript rhythm: a flat, clickable header row (caret,
//! status / glyph, label) with the body revealed underneath once open. The
//! header owns the whole hit area; the body is inert so text inside it stays
//! selectable.
//!
//! - [`Reasoning`] — muted "Thinking" header that shimmers while streaming,
//!   collapsed by default.
//! - [`Tool`] — one row per call, with the call's detail (command, diff,
//!   output) under it once expanded.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _, Window,
    div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::primitive::shimmer::ShimmerText;
use crate::components::primitive::spinner::Spinner;
use crate::theme::ActiveTheme as _;

type OnToggle = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Lifecycle of a single tool call.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum TraceState {
    /// Queued, not started yet.
    #[default]
    Pending,
    /// In flight — the header spins.
    Running,
    /// Finished successfully.
    Done,
    /// Finished with an error from the tool itself.
    Failed,
    /// The user declined the call.
    Denied,
    /// The call could not be dispatched.
    Error,
}

impl TraceState {
    /// Short status word used by compact rows.
    pub fn label(self) -> &'static str {
        match self {
            Self::Pending => "Pending",
            Self::Running => "Running",
            Self::Done => "Done",
            Self::Failed => "Failed",
            Self::Denied => "Denied",
            Self::Error => "Error",
        }
    }

    /// Terminal states do not need a running affordance.
    pub fn is_terminal(self) -> bool {
        matches!(self, Self::Done | Self::Failed | Self::Denied | Self::Error)
    }
}

/// A reasoning part: muted header (shimmers while streaming), collapsed body
/// by default. Click the header to reveal the thought text.
#[derive(IntoElement)]
pub struct Reasoning {
    id: ElementId,
    header: SharedString,
    body: Option<SharedString>,
    streaming: bool,
    open: bool,
    on_toggle: Option<OnToggle>,
    children: Vec<AnyElement>,
}

impl Reasoning {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            header: "Thinking".into(),
            body: None,
            streaming: false,
            open: false,
            on_toggle: None,
            children: Vec::new(),
        }
    }

    /// Header label (default `"Thinking"`).
    pub fn header(mut self, header: impl Into<SharedString>) -> Self {
        self.header = header.into();
        self
    }

    /// The thought text revealed when open.
    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    /// Shimmer the header while tokens are still arriving.
    pub fn streaming(mut self, streaming: bool) -> Self {
        self.streaming = streaming;
        self
    }

    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    pub fn on_toggle(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_toggle = Some(Rc::new(f));
        self
    }

    /// Extra content under the body (copy buttons, truncation notices, …).
    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }

    pub fn children(mut self, children: impl IntoIterator<Item = AnyElement>) -> Self {
        self.children.extend(children);
        self
    }
}

impl RenderOnce for Reasoning {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let open = self.open;
        let streaming = self.streaming;
        let on_toggle = self.on_toggle;

        let header_text = if streaming {
            ShimmerText::wave(self.header.clone())
                .id(ElementId::Name(format!("{}-header", self.id).into()))
                .text_xs()
                .font_weight(FontWeight::MEDIUM)
                .text_color(muted)
                .into_any_element()
        } else {
            div()
                .text_xs()
                .font_weight(FontWeight::MEDIUM)
                .text_color(muted)
                .child(self.header.clone())
                .into_any_element()
        };

        let header = div()
            .id(ElementId::Name(format!("{}-trigger", self.id).into()))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(4.0))
            .py(px(2.0))
            .rounded(theme.radius_xs())
            .cursor_pointer()
            .hover(|s| s.bg(theme.muted.opacity(0.5)))
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
                .color(muted),
            )
            .child(
                Phosphor::new(PhosphorIcon::Brain)
                    .size(px(12.0))
                    .color(if streaming { theme.primary } else { muted }),
            )
            .child(header_text);

        let mut root = div()
            .id(self.id)
            .w_full()
            .min_w_0()
            .flex()
            .flex_col()
            .gap(px(4.0))
            .child(header);

        if open {
            if let Some(body) = self.body {
                root = root.child(
                    div()
                        .w_full()
                        .pl(px(16.0))
                        .pr(px(4.0))
                        .text_sm()
                        .line_height(px(20.0))
                        .text_color(muted)
                        .whitespace_normal()
                        .child(body),
                );
            }
            if !self.children.is_empty() {
                root = root.child(
                    div()
                        .flex()
                        .flex_col()
                        .gap(px(4.0))
                        .pl(px(16.0))
                        .children(self.children),
                );
            }
        }

        root
    }
}

/// A tool call: one flat row — status glyph, label, caret — with the call's
/// detail (command, diff, output) under it once expanded.
#[derive(IntoElement)]
pub struct Tool {
    id: ElementId,
    label: SharedString,
    detail: Option<SharedString>,
    state: TraceState,
    open: bool,
    on_toggle: Option<OnToggle>,
    children: Vec<AnyElement>,
}

impl Tool {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            detail: None,
            state: TraceState::default(),
            open: false,
            on_toggle: None,
            children: Vec::new(),
        }
    }

    pub fn state(mut self, state: TraceState) -> Self {
        self.state = state;
        self
    }

    /// Raw call detail, rendered monospace under the header when open.
    pub fn detail(mut self, detail: impl Into<SharedString>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    pub fn on_toggle(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_toggle = Some(Rc::new(f));
        self
    }

    /// Extra content under the detail (copy buttons, truncation notices, …).
    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }

    pub fn children(mut self, children: impl IntoIterator<Item = AnyElement>) -> Self {
        self.children.extend(children);
        self
    }
}

impl RenderOnce for Tool {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let open = self.open;
        let state = self.state;
        let expanded_body = open && (self.detail.is_some() || !self.children.is_empty());
        let on_toggle = self.on_toggle;

        let status = match state {
            TraceState::Pending => div()
                .flex()
                .items_center()
                .justify_center()
                .size(px(12.0))
                .child(Phosphor::new(PhosphorIcon::Circle).size(px(10.0)).color(muted))
                .into_any_element(),
            TraceState::Running => div()
                .flex()
                .items_center()
                .justify_center()
                .size(px(12.0))
                .child(Spinner::new().size(px(11.0)).color(theme.primary))
                .into_any_element(),
            TraceState::Done => div()
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
            TraceState::Failed | TraceState::Error => div()
                .flex()
                .items_center()
                .justify_center()
                .size(px(12.0))
                .child(
                    Phosphor::new(PhosphorIcon::XCircle)
                        .size(px(12.0))
                        .color(theme.danger),
                )
                .into_any_element(),
            TraceState::Denied => div()
                .flex()
                .items_center()
                .justify_center()
                .size(px(12.0))
                .child(
                    Phosphor::new(PhosphorIcon::Prohibit)
                        .size(px(12.0))
                        .color(theme.warning),
                )
                .into_any_element(),
        };

        let label_color = match state {
            TraceState::Denied => theme.warning,
            TraceState::Failed | TraceState::Error => theme.danger,
            TraceState::Pending => muted,
            TraceState::Running | TraceState::Done => theme.foreground,
        };

        let header = div()
            .id(ElementId::Name(format!("{}-trigger", self.id).into()))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0))
            .w_full()
            .min_w_0()
            .py(px(2.0))
            .rounded(theme.radius_xs())
            .when(expanded_body || on_toggle.is_some(), |this| {
                this.cursor_pointer()
                    .hover(|s| s.bg(theme.muted.opacity(0.5)))
            })
            .when_some(on_toggle, |this, on| {
                this.on_click(move |e: &ClickEvent, window, cx| on(e, window, cx))
            })
            .child(status)
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_sm()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(label_color)
                    .whitespace_nowrap()
                    .overflow_hidden()
                    .text_ellipsis()
                    .child(self.label.clone()),
            )
            .when(expanded_body, |this| {
                this.child(
                    Phosphor::new(if open {
                        PhosphorIcon::CaretDown
                    } else {
                        PhosphorIcon::CaretRight
                    })
                    .size(px(10.0))
                    .color(muted),
                )
            });

        let mut root = div()
            .id(self.id)
            .w_full()
            .min_w_0()
            .flex()
            .flex_col()
            .gap(px(4.0))
            .child(header);

        if expanded_body {
            let mut body = div().flex().flex_col().gap(px(4.0)).pl(px(18.0));
            if let Some(detail) = self.detail {
                body = body.child(
                    div()
                        .w_full()
                        .min_w_0()
                        .rounded(theme.radius_sm())
                        .border_1()
                        .border_color(theme.border)
                        .bg(theme.background)
                        .px(px(8.0))
                        .py(px(6.0))
                        .font_family(theme.mono_font_family.clone())
                        .text_size(px(12.0))
                        .line_height(px(18.0))
                        .text_color(muted)
                        .whitespace_normal()
                        .child(detail),
                );
            }
            if !self.children.is_empty() {
                body = body.children(self.children);
            }
            root = root.child(body);
        }

        root
    }
}
