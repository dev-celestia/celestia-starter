//! StartMenu — Windows-style start menu flyout.
//!
//! Search header, pinned app grid, recommended list, and a footer with user /
//! power actions. Presentational: the host owns open state and navigation.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// A pinned tile in the start menu grid.
#[derive(Clone, IntoElement)]
pub struct StartMenuPin {
    pub id: SharedString,
    pub label: SharedString,
    pub icon: PhosphorIcon,
    on_click: Option<Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>>,
}

impl StartMenuPin {
    pub fn new(
        id: impl Into<SharedString>,
        label: impl Into<SharedString>,
        icon: PhosphorIcon,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon,
            on_click: None,
        }
    }

    pub fn on_click(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for StartMenuPin {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let id = self.id.clone();
        let on_click = self.on_click.clone();

        div()
            .id(ElementId::Name(format!("start-pin-{}", self.id).into()))
            .w(px(88.0))
            .h(px(72.0))
            .px(px(6.0))
            .rounded(theme.radius)
            .flex()
            .flex_col()
            .items_center()
            .justify_center()
            .gap(px(6.0))
            .cursor_pointer()
            .hover(|s| s.bg(theme.muted))
            .on_click(move |_, window, cx| {
                if let Some(on) = &on_click {
                    on(&id, window, cx);
                }
            })
            .child(
                div()
                    .size(px(32.0))
                    .rounded(px(8.0))
                    .bg(theme.accent.opacity(0.14))
                    .flex()
                    .items_center()
                    .justify_center()
                    .child(
                        Phosphor::new(self.icon)
                            .size(px(18.0))
                            .color(theme.foreground),
                    ),
            )
            .child(
                div()
                    .w_full()
                    .text_xs()
                    .text_center()
                    .text_color(theme.foreground)
                    .whitespace_nowrap()
                    .overflow_hidden()
                    .text_ellipsis()
                    .child(self.label),
            )
    }
}

/// A recommended / recent row under the pinned grid.
#[derive(Clone, IntoElement)]
pub struct StartMenuItem {
    pub id: SharedString,
    pub label: SharedString,
    pub hint: Option<SharedString>,
    pub icon: Option<PhosphorIcon>,
    on_click: Option<Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>>,
}

impl StartMenuItem {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            hint: None,
            icon: None,
            on_click: None,
        }
    }

    pub fn hint(mut self, hint: impl Into<SharedString>) -> Self {
        self.hint = Some(hint.into());
        self
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn on_click(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for StartMenuItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let id = self.id.clone();
        let on_click = self.on_click.clone();

        div()
            .id(ElementId::Name(format!("start-item-{}", self.id).into()))
            .w_full()
            .h(px(36.0))
            .px(px(10.0))
            .rounded(px(6.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(10.0))
            .cursor_pointer()
            .hover(|s| s.bg(theme.muted))
            .on_click(move |_, window, cx| {
                if let Some(on) = &on_click {
                    on(&id, window, cx);
                }
            })
            .when_some(self.icon, |this, icon| {
                this.child(
                    Phosphor::new(icon)
                        .size(px(16.0))
                        .color(theme.muted_foreground),
                )
            })
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_sm()
                    .text_color(theme.foreground)
                    .whitespace_nowrap()
                    .overflow_hidden()
                    .text_ellipsis()
                    .child(self.label),
            )
            .when_some(self.hint, |this, hint| {
                this.child(
                    div()
                        .text_xs()
                        .text_color(theme.muted_foreground)
                        .child(hint),
                )
            })
    }
}

/// Start menu flyout: search, pinned grid, recommended list, footer.
#[derive(IntoElement)]
pub struct StartMenu {
    id: ElementId,
    style: StyleRefinement,
    search: Option<AnyElement>,
    pins_label: SharedString,
    pins: Vec<AnyElement>,
    recommended_label: SharedString,
    recommended: Vec<AnyElement>,
    footer_leading: Option<AnyElement>,
    footer_trailing: Vec<AnyElement>,
}

impl StartMenu {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            search: None,
            pins_label: "Pinned".into(),
            pins: Vec::new(),
            recommended_label: "Recommended".into(),
            recommended: Vec::new(),
            footer_leading: None,
            footer_trailing: Vec::new(),
        }
    }

    pub fn search(mut self, search: impl IntoElement) -> Self {
        self.search = Some(search.into_any_element());
        self
    }

    pub fn pins_label(mut self, label: impl Into<SharedString>) -> Self {
        self.pins_label = label.into();
        self
    }

    pub fn pin(mut self, pin: impl IntoElement) -> Self {
        self.pins.push(pin.into_any_element());
        self
    }

    pub fn recommended_label(mut self, label: impl Into<SharedString>) -> Self {
        self.recommended_label = label.into();
        self
    }

    pub fn recommended(mut self, item: impl IntoElement) -> Self {
        self.recommended.push(item.into_any_element());
        self
    }

    /// Typically a user avatar / account row.
    pub fn footer_leading(mut self, leading: impl IntoElement) -> Self {
        self.footer_leading = Some(leading.into_any_element());
        self
    }

    /// Power / settings actions on the footer trailing edge.
    pub fn footer_action(mut self, action: impl IntoElement) -> Self {
        self.footer_trailing.push(action.into_any_element());
        self
    }
}

impl Styled for StartMenu {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for StartMenu {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w(px(360.0))
            .flex()
            .flex_col()
            .rounded(theme.radius_lg)
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .overflow_hidden();
        root.style().refine(&self.style);

        root.when_some(self.search, |this, search| {
            this.child(div().px(px(14.0)).pt(px(14.0)).pb(px(8.0)).child(search))
        })
        .when(!self.pins.is_empty(), |this| {
            this.child(
                div()
                    .px(px(14.0))
                    .pt(px(8.0))
                    .child(
                        div()
                            .mb(px(6.0))
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(theme.muted_foreground)
                            .child(self.pins_label.clone()),
                    )
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .flex_wrap()
                            .gap(px(4.0))
                            .children(self.pins),
                    ),
            )
        })
        .when(!self.recommended.is_empty(), |this| {
            this.child(
                div()
                    .px(px(14.0))
                    .pt(px(12.0))
                    .pb(px(8.0))
                    .child(
                        div()
                            .mb(px(6.0))
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(theme.muted_foreground)
                            .child(self.recommended_label.clone()),
                    )
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(2.0))
                            .children(self.recommended),
                    ),
            )
        })
        .child(
            div()
                .mt(px(4.0))
                .px(px(10.0))
                .py(px(8.0))
                .border_t_1()
                .border_color(theme.border)
                .flex()
                .flex_row()
                .items_center()
                .gap(px(8.0))
                .when_some(self.footer_leading, |this, leading| this.child(leading))
                .child(div().flex_1())
                .child(
                    div()
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(4.0))
                        .children(self.footer_trailing),
                ),
        )
    }
}
