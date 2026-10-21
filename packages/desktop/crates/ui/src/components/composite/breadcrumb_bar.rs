//! Breadcrumb bar — path trail with optional root icon and overflow collapse.
//!
//! Builds on [`Breadcrumb`](crate::components::primitive::breadcrumb::Breadcrumb)
//! when the trail is short; when longer than [`BreadcrumbBar::max_visible`],
//! middle segments collapse into an ellipsis chip.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// One stop in a [`BreadcrumbBar`].
pub struct BreadcrumbBarItem {
    id: ElementId,
    label: SharedString,
    on_click: Option<OnClick>,
}

impl BreadcrumbBarItem {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            on_click: None,
        }
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

/// A chrome path bar with optional root glyph and overflow ellipsis.
#[derive(IntoElement)]
pub struct BreadcrumbBar {
    id: ElementId,
    style: StyleRefinement,
    root_icon: Option<PhosphorIcon>,
    items: Vec<BreadcrumbBarItem>,
    max_visible: usize,
}

impl BreadcrumbBar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            root_icon: Some(PhosphorIcon::House),
            items: Vec::new(),
            max_visible: 4,
        }
    }

    pub fn root_icon(mut self, icon: Option<PhosphorIcon>) -> Self {
        self.root_icon = icon;
        self
    }

    pub fn max_visible(mut self, n: usize) -> Self {
        self.max_visible = n.max(2);
        self
    }

    pub fn item(mut self, item: BreadcrumbBarItem) -> Self {
        self.items.push(item);
        self
    }

    pub fn items(mut self, items: impl IntoIterator<Item = BreadcrumbBarItem>) -> Self {
        self.items.extend(items);
        self
    }
}

impl Styled for BreadcrumbBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

fn crumb(
    id: ElementId,
    label: SharedString,
    is_last: bool,
    on_click: Option<OnClick>,
    theme: &crate::theme::Theme,
) -> impl IntoElement {
    div()
        .id(id)
        .flex()
        .flex_row()
        .items_center()
        .px(px(6.0))
        .py(px(2.0))
        .rounded(px(4.0))
        .text_sm()
        .font_weight(if is_last {
            FontWeight::MEDIUM
        } else {
            FontWeight::NORMAL
        })
        .text_color(if is_last {
            theme.foreground
        } else {
            theme.muted_foreground
        })
        .when(!is_last && on_click.is_some(), |this| {
            this.cursor_pointer()
                .hover(|s| s.bg(theme.muted).text_color(theme.foreground))
        })
        .when_some(on_click.filter(|_| !is_last), |this, on| {
            this.on_click(move |e, window, cx| on(e, window, cx))
        })
        .child(label)
}

impl RenderOnce for BreadcrumbBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let total = self.items.len();
        let collapse = total > self.max_visible;
        let keep_tail = self.max_visible.saturating_sub(1);

        let mut root = div()
            .id(self.id)
            .w_full()
            .h(px(32.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(2.0))
            .px(px(8.0))
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background);
        root.style().refine(&self.style);

        root.when_some(self.root_icon, |this, icon| {
            this.child(
                div().flex_none().mr(px(4.0)).child(
                    Phosphor::new(icon)
                        .size(px(14.0))
                        .color(theme.muted_foreground),
                ),
            )
        })
        .children({
            let mut out: Vec<gpui::AnyElement> = Vec::new();
            for (i, item) in self.items.into_iter().enumerate() {
                let is_last = i + 1 == total;
                let show = if !collapse {
                    true
                } else if i == 0 {
                    true
                } else if i + keep_tail >= total {
                    true
                } else if i == 1 {
                    // ellipsis placeholder once
                    out.push(
                        div()
                            .id("breadcrumb-ellipsis")
                            .px(px(6.0))
                            .text_sm()
                            .text_color(theme.muted_foreground)
                            .child("…")
                            .into_any_element(),
                    );
                    out.push(
                        Phosphor::new(PhosphorIcon::CaretRight)
                            .size(px(10.0))
                            .color(theme.muted_foreground)
                            .into_any_element(),
                    );
                    false
                } else {
                    false
                };

                if !show {
                    continue;
                }

                if i > 0 || self.root_icon.is_some() {
                    // separator before every shown item except the very first crumb when no root
                }
                if !(i == 0 && self.root_icon.is_none()) {
                    out.push(
                        Phosphor::new(PhosphorIcon::CaretRight)
                            .size(px(10.0))
                            .color(theme.muted_foreground)
                            .into_any_element(),
                    );
                }

                out.push(
                    crumb(item.id, item.label, is_last, item.on_click, theme).into_any_element(),
                );
            }
            out
        })
    }
}
