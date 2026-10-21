//! StartBar — Windows-style taskbar / start bar chrome.
//!
//! Bottom (or top) strip with a start trigger, optional search, pinned / running
//! app buttons, and a trailing system-tray slot. Presentational: the host owns
//! open/active state and click handlers.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// One pinned or running app button on a [`StartBar`].
#[derive(Clone, IntoElement)]
pub struct StartBarItem {
    pub id: SharedString,
    pub label: SharedString,
    pub icon: Option<PhosphorIcon>,
    pub active: bool,
    pub running: bool,
    pub badge: Option<SharedString>,
    on_click: Option<Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>>,
}

impl StartBarItem {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon: None,
            active: false,
            running: false,
            badge: None,
            on_click: None,
        }
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    /// Show the running indicator pip even when not the foreground window.
    pub fn running(mut self, running: bool) -> Self {
        self.running = running;
        self
    }

    pub fn badge(mut self, badge: impl Into<SharedString>) -> Self {
        self.badge = Some(badge.into());
        self
    }

    pub fn on_click(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for StartBarItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let id = self.id.clone();
        let on_click = self.on_click.clone();
        let show_pip = self.active || self.running;

        div()
            .id(ElementId::Name(
                format!("start-bar-item-{}", self.id).into(),
            ))
            .h(px(40.0))
            .min_w(px(40.0))
            .px(px(8.0))
            .flex()
            .flex_col()
            .items_center()
            .justify_center()
            .gap(px(2.0))
            .rounded(theme.radius)
            .cursor_pointer()
            .when(self.active, |this| this.bg(theme.accent.opacity(0.16)))
            .when(!self.active, |this| this.hover(|s| s.bg(theme.muted)))
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
                    .size(px(22.0))
                    .when_some(self.icon, |this, icon| {
                        this.child(Phosphor::new(icon).size(px(18.0)).color(if self.active {
                            theme.foreground
                        } else {
                            theme.muted_foreground
                        }))
                    })
                    .when(self.icon.is_none(), |this| {
                        this.child(
                            div()
                                .text_xs()
                                .font_weight(FontWeight::SEMIBOLD)
                                .text_color(theme.foreground)
                                .child(
                                    self.label
                                        .chars()
                                        .next()
                                        .map(|c| c.to_string())
                                        .unwrap_or_else(|| "?".into()),
                                ),
                        )
                    })
                    .when_some(self.badge, |this, badge| {
                        this.child(
                            div()
                                .absolute()
                                .top(px(-4.0))
                                .right(px(-6.0))
                                .min_w(px(14.0))
                                .h(px(14.0))
                                .px(px(3.0))
                                .rounded_full()
                                .bg(theme.danger)
                                .flex()
                                .items_center()
                                .justify_center()
                                .text_xs()
                                .font_weight(FontWeight::BOLD)
                                .text_color(theme.danger_foreground)
                                .child(badge),
                        )
                    }),
            )
            .child(
                div()
                    .h(px(3.0))
                    .w(if self.active { px(16.0) } else { px(8.0) })
                    .rounded_full()
                    .when(show_pip, |this| {
                        this.bg(if self.active {
                            theme.accent
                        } else {
                            theme.muted_foreground.opacity(0.55)
                        })
                    })
                    .when(!show_pip, |this| this.bg(theme.transparent)),
            )
    }
}

/// Windows-style start / task bar: start · search · apps · tray.
#[derive(IntoElement)]
pub struct StartBar {
    id: ElementId,
    style: StyleRefinement,
    start: Option<AnyElement>,
    search: Option<AnyElement>,
    items: Vec<AnyElement>,
    tray: Option<AnyElement>,
    bordered: bool,
    elevated: bool,
}

impl StartBar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            start: None,
            search: None,
            items: Vec::new(),
            tray: None,
            bordered: true,
            elevated: false,
        }
    }

    /// Leading start / launcher button (or custom trigger).
    pub fn start(mut self, start: impl IntoElement) -> Self {
        self.start = Some(start.into_any_element());
        self
    }

    /// Optional search field or search trigger between start and apps.
    pub fn search(mut self, search: impl IntoElement) -> Self {
        self.search = Some(search.into_any_element());
        self
    }

    /// Append a pinned / running app button ([`StartBarItem`] or any element).
    pub fn item(mut self, item: impl IntoElement) -> Self {
        self.items.push(item.into_any_element());
        self
    }

    /// Trailing system-tray / clock cluster (typically [`super::system_tray::SystemTray`]).
    pub fn tray(mut self, tray: impl IntoElement) -> Self {
        self.tray = Some(tray.into_any_element());
        self
    }

    pub fn bordered(mut self, bordered: bool) -> Self {
        self.bordered = bordered;
        self
    }

    /// Slight elevation so the bar reads as floating chrome (Win11-style).
    pub fn elevated(mut self, elevated: bool) -> Self {
        self.elevated = elevated;
        self
    }
}

impl Styled for StartBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for StartBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .h(px(48.0))
            .px(px(8.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0))
            .bg(if self.elevated {
                theme.popover
            } else {
                theme.status_bar
            })
            .when(self.bordered, |this| {
                this.border_t_1().border_color(theme.status_bar_border)
            })
            .when(self.elevated, |this| {
                this.rounded(theme.radius)
                    .border_1()
                    .border_color(theme.border)
            });
        root.style().refine(&self.style);

        root.when_some(self.start, |this, start| {
            this.child(
                div()
                    .flex()
                    .flex_row()
                    .items_center()
                    .flex_shrink_0()
                    .child(start),
            )
        })
        .when_some(self.search, |this, search| {
            this.child(
                div()
                    .w(px(180.0))
                    .max_w(px(240.0))
                    .flex_shrink_0()
                    .child(search),
            )
        })
        .child(
            div()
                .flex_1()
                .min_w_0()
                .h_full()
                .flex()
                .flex_row()
                .items_center()
                .justify_center()
                .gap(px(2.0))
                .overflow_hidden()
                .children(self.items),
        )
        .when_some(self.tray, |this, tray| {
            this.child(
                div()
                    .flex()
                    .flex_row()
                    .items_center()
                    .flex_shrink_0()
                    .child(tray),
            )
        })
    }
}
