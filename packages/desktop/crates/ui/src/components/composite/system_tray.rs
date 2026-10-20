//! SystemTray — notification-area / clock cluster for a [`StartBar`](super::start_bar::StartBar).
//!
//! Mirrors the Windows system tray: a row of compact icon buttons, optional
//! chevron for overflow, and a clock / date block on the trailing edge.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// One icon button in a [`SystemTray`].
#[derive(Clone, IntoElement)]
pub struct SystemTrayItem {
    pub id: SharedString,
    pub icon: PhosphorIcon,
    pub active: bool,
    pub badge: bool,
    on_click: Option<Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>>,
}

impl SystemTrayItem {
    pub fn new(id: impl Into<SharedString>, icon: PhosphorIcon) -> Self {
        Self {
            id: id.into(),
            icon,
            active: false,
            badge: false,
            on_click: None,
        }
    }

    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    /// Small notification pip on the icon corner.
    pub fn badge(mut self, badge: bool) -> Self {
        self.badge = badge;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for SystemTrayItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let id = self.id.clone();
        let on_click = self.on_click.clone();

        div()
            .id(ElementId::Name(format!("tray-{}", self.id).into()))
            .size(px(28.0))
            .rounded(px(4.0))
            .flex()
            .items_center()
            .justify_center()
            .cursor_pointer()
            .when(self.active, |this| this.bg(theme.muted))
            .hover(|s| s.bg(theme.muted))
            .on_click(move |_, window, cx| {
                if let Some(on) = &on_click {
                    on(&id, window, cx);
                }
            })
            .child(
                div()
                    .relative()
                    .flex()
                    .items_center()
                    .justify_center()
                    .child(
                        Phosphor::new(self.icon)
                            .size(px(14.0))
                            .color(theme.muted_foreground),
                    )
                    .when(self.badge, |this| {
                        this.child(
                            div()
                                .absolute()
                                .top(px(-2.0))
                                .right(px(-2.0))
                                .size(px(6.0))
                                .rounded_full()
                                .bg(theme.accent),
                        )
                    }),
            )
    }
}

/// Clock / date block for the system tray.
#[derive(IntoElement)]
pub struct SystemTrayClock {
    id: ElementId,
    time: SharedString,
    date: Option<SharedString>,
    on_click: Option<Rc<dyn Fn(&mut Window, &mut App) + 'static>>,
}

impl SystemTrayClock {
    pub fn new(id: impl Into<ElementId>, time: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            time: time.into(),
            date: None,
            on_click: None,
        }
    }

    pub fn date(mut self, date: impl Into<SharedString>) -> Self {
        self.date = Some(date.into());
        self
    }

    pub fn on_click(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for SystemTrayClock {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let on_click = self.on_click.clone();

        div()
            .id(self.id)
            .h(px(28.0))
            .px(px(8.0))
            .rounded(px(4.0))
            .flex()
            .flex_row()
            .items_center()
            .justify_end()
            .gap(px(6.0))
            .cursor_pointer()
            .hover(|s| s.bg(theme.muted))
            .when_some(on_click, |this, on| {
                this.on_click(move |_, window, cx| on(window, cx))
            })
            .child(
                div()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.foreground)
                    .child(self.time),
            )
            .when_some(self.date, |this, date| {
                this.child(
                    div()
                        .text_xs()
                        .text_color(theme.muted_foreground)
                        .child(date),
                )
            })
    }
}

/// Notification-area cluster: icons + optional clock.
#[derive(IntoElement)]
pub struct SystemTray {
    id: ElementId,
    style: StyleRefinement,
    items: Vec<SystemTrayItem>,
    clock: Option<SystemTrayClock>,
    show_chevron: bool,
    on_chevron: Option<Rc<dyn Fn(&mut Window, &mut App) + 'static>>,
}

impl SystemTray {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            items: Vec::new(),
            clock: None,
            show_chevron: false,
            on_chevron: None,
        }
    }

    pub fn item(mut self, item: SystemTrayItem) -> Self {
        self.items.push(item);
        self
    }

    pub fn clock(mut self, clock: SystemTrayClock) -> Self {
        self.clock = Some(clock);
        self
    }

    /// Show a caret that opens the hidden icons flyout.
    pub fn chevron(mut self, show: bool) -> Self {
        self.show_chevron = show;
        self
    }

    pub fn on_chevron(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_chevron = Some(Rc::new(f));
        self
    }
}

impl Styled for SystemTray {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SystemTray {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let on_chevron = self.on_chevron.clone();

        let mut root = div()
            .id(self.id)
            .h(px(40.0))
            .px(px(4.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(2.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border.opacity(0.6))
            .bg(theme.muted.opacity(0.35));
        root.style().refine(&self.style);

        root.when(self.show_chevron, |this| {
            this.child(
                div()
                    .id("tray-chevron")
                    .size(px(22.0))
                    .rounded(px(4.0))
                    .flex()
                    .items_center()
                    .justify_center()
                    .cursor_pointer()
                    .hover(|s| s.bg(theme.muted))
                    .when_some(on_chevron, |el, on| {
                        el.on_click(move |_, window, cx| on(window, cx))
                    })
                    .child(
                        Phosphor::new(PhosphorIcon::CaretUp)
                            .size(px(12.0))
                            .color(theme.muted_foreground),
                    ),
            )
        })
        .children(self.items)
        .when_some(self.clock, |this, clock| this.child(clock))
    }
}
