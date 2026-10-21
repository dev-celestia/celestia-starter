//! Banner / callout strip — full-width persistent alert with actions.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Semantic tone for a [`Banner`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum BannerTone {
    #[default]
    Info,
    Success,
    Warning,
    Danger,
}

/// A full-width callout with icon, title, body, and optional action / dismiss.
#[derive(IntoElement)]
pub struct Banner {
    id: ElementId,
    style: StyleRefinement,
    tone: BannerTone,
    title: SharedString,
    body: Option<SharedString>,
    action_label: Option<SharedString>,
    on_action: Option<OnClick>,
    on_dismiss: Option<OnClick>,
    children: Vec<AnyElement>,
}

impl Banner {
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            tone: BannerTone::default(),
            title: title.into(),
            body: None,
            action_label: None,
            on_action: None,
            on_dismiss: None,
            children: Vec::new(),
        }
    }

    pub fn tone(mut self, tone: BannerTone) -> Self {
        self.tone = tone;
        self
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    pub fn action(
        mut self,
        label: impl Into<SharedString>,
        on_click: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.action_label = Some(label.into());
        self.on_action = Some(Rc::new(on_click));
        self
    }

    pub fn on_dismiss(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_dismiss = Some(Rc::new(f));
        self
    }
}

impl ParentElement for Banner {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Banner {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Banner {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (accent, icon) = match self.tone {
            BannerTone::Info => (theme.info, PhosphorIcon::Info),
            BannerTone::Success => (theme.success, PhosphorIcon::CheckCircle),
            BannerTone::Warning => (theme.warning, PhosphorIcon::Warning),
            BannerTone::Danger => (theme.danger, PhosphorIcon::XCircle),
        };

        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_row()
            .items_start()
            .gap(px(12.0))
            .px(px(14.0))
            .py(px(12.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(accent.opacity(0.24))
            .bg(accent.opacity(0.08));
        root.style().refine(&self.style);

        root.child(
            div()
                .flex_none()
                .mt(px(1.0))
                .child(Phosphor::new(icon).size(px(16.0)).color(accent)),
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
                        .text_sm()
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(theme.foreground)
                        .child(self.title),
                )
                .when_some(self.body, |this, body| {
                    this.child(
                        div()
                            .text_sm()
                            .text_color(theme.muted_foreground)
                            .child(body),
                    )
                })
                .children(self.children),
        )
        .when_some(
            self.action_label.zip(self.on_action),
            |this, (label, on)| {
                this.child(
                    div()
                        .id(ElementId::Name(format!("{}-action", self.id).into()))
                        .flex_none()
                        .px(px(10.0))
                        .py(px(4.0))
                        .rounded(px(6.0))
                        .bg(accent.opacity(0.16))
                        .text_xs()
                        .font_weight(FontWeight::MEDIUM)
                        .text_color(accent)
                        .cursor_pointer()
                        .hover(|s| s.bg(accent.opacity(0.24)))
                        .on_click(move |e, window, cx| on(e, window, cx))
                        .child(label),
                )
            },
        )
        .when_some(self.on_dismiss, |this, on| {
            this.child(
                div()
                    .id(ElementId::Name(format!("{}-dismiss", self.id).into()))
                    .flex_none()
                    .size(px(24.0))
                    .rounded(px(6.0))
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
