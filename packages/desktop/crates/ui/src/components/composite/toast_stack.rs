//! Toast stack — positioned host that queues dismissible notice chips.
//!
//! Complements `window.push_notification` for in-view demo stacks or custom
//! placement without the Root notification layer.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnDismiss = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Semantic tone for a stacked toast.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ToastTone {
    #[default]
    Default,
    Success,
    Warning,
    Danger,
}

/// Corner placement for a [`ToastStack`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ToastPlacement {
    #[default]
    BottomRight,
    BottomLeft,
    TopRight,
    TopLeft,
}

/// One dismissible toast entry.
#[derive(IntoElement)]
pub struct ToastItem {
    id: ElementId,
    title: SharedString,
    body: Option<SharedString>,
    tone: ToastTone,
    on_dismiss: Option<OnDismiss>,
}

impl ToastItem {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            body: None,
            tone: ToastTone::default(),
            on_dismiss: None,
        }
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    pub fn tone(mut self, tone: ToastTone) -> Self {
        self.tone = tone;
        self
    }

    pub fn on_dismiss(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_dismiss = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for ToastItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let accent = match self.tone {
            ToastTone::Default => theme.foreground,
            ToastTone::Success => theme.success,
            ToastTone::Warning => theme.warning,
            ToastTone::Danger => theme.danger,
        };
        let icon = match self.tone {
            ToastTone::Default => PhosphorIcon::Info,
            ToastTone::Success => PhosphorIcon::CheckCircle,
            ToastTone::Warning => PhosphorIcon::Warning,
            ToastTone::Danger => PhosphorIcon::XCircle,
        };

        div()
            .id(self.id.clone())
            .w(px(320.0))
            .flex()
            .flex_row()
            .items_start()
            .gap(px(10.0))
            .p(px(12.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .shadow_md()
            .child(Phosphor::new(icon).size(px(16.0)).color(accent))
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .flex()
                    .flex_col()
                    .gap(px(2.0))
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.foreground)
                            .child(self.title),
                    )
                    .when_some(self.body, |this, body| {
                        this.child(
                            div()
                                .text_xs()
                                .text_color(theme.muted_foreground)
                                .child(body),
                        )
                    }),
            )
            .when_some(self.on_dismiss, |this, on| {
                this.child(
                    div()
                        .id(ElementId::Name(format!("{}-x", self.id).into()))
                        .size(px(20.0))
                        .rounded(px(4.0))
                        .flex()
                        .items_center()
                        .justify_center()
                        .cursor_pointer()
                        .hover(|s| s.bg(theme.muted))
                        .on_click(move |e, window, cx| on(e, window, cx))
                        .child(
                            Phosphor::new(PhosphorIcon::X)
                                .size(px(12.0))
                                .color(theme.muted_foreground),
                        ),
                )
            })
    }
}

/// A floating stack of [`ToastItem`]s.
#[derive(IntoElement)]
pub struct ToastStack {
    id: ElementId,
    style: StyleRefinement,
    placement: ToastPlacement,
    items: Vec<AnyElement>,
}

impl ToastStack {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            placement: ToastPlacement::default(),
            items: Vec::new(),
        }
    }

    pub fn placement(mut self, placement: ToastPlacement) -> Self {
        self.placement = placement;
        self
    }

    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }
}

impl Styled for ToastStack {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ToastStack {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .id(self.id)
            .absolute()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .p(px(16.0))
            .map(|el| match self.placement {
                ToastPlacement::BottomRight => el.bottom_0().right_0(),
                ToastPlacement::BottomLeft => el.bottom_0().left_0(),
                ToastPlacement::TopRight => el.top_0().right_0(),
                ToastPlacement::TopLeft => el.top_0().left_0(),
            });
        root.style().refine(&self.style);
        root.children(self.items)
    }
}
