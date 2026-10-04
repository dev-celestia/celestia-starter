//! Breadcrumb — the desktop counterpart of
//! `packages/ui/src/components/primitive/breadcrumb.tsx`.
//!
//! Written directly on `gpui`. A path trail: each [`BreadcrumbItem`] is muted
//! link text except the last, which takes the full foreground colour. Items
//! are separated by a caret glyph injected by [`Breadcrumb`] itself, so the
//! caller never writes the separator.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, InteractiveElement as _, IntoElement,
    ParentElement as _, Refineable as _, RenderOnce, Role, SharedString,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// The click handler a [`BreadcrumbItem`] carries.
type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// A single stop on a [`Breadcrumb`] trail.
#[derive(IntoElement)]
pub struct BreadcrumbItem {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    on_click: Option<OnClick>,
    disabled: bool,
    is_last: bool,
}

impl BreadcrumbItem {
    /// A trail stop labelled `label`.
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            id: ElementId::Integer(0),
            style: StyleRefinement::default(),
            label: label.into(),
            on_click: None,
            disabled: false,
            is_last: false,
        }
    }

    /// Render the item as inert text.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Navigate when the item is activated.
    pub fn on_click(
        mut self,
        on_click: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(on_click));
        self
    }

    /// The position within the trail, used as the element id. Assigned by
    /// [`Breadcrumb`] so every item is individually addressable.
    fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = id.into();
        self
    }

    /// Marks the trailing item. Assigned by [`Breadcrumb`].
    fn mark_last(mut self, is_last: bool) -> Self {
        self.is_last = is_last;
        self
    }
}

impl Styled for BreadcrumbItem {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl From<&'static str> for BreadcrumbItem {
    fn from(value: &'static str) -> Self {
        Self::new(value)
    }
}

impl From<String> for BreadcrumbItem {
    fn from(value: String) -> Self {
        Self::new(value)
    }
}

impl From<SharedString> for BreadcrumbItem {
    fn from(value: SharedString) -> Self {
        Self::new(value)
    }
}

impl RenderOnce for BreadcrumbItem {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let interactive = self.on_click.is_some() && !self.disabled;

        let mut root = div()
            .id(self.id)
            .role(if interactive {
                Role::Link
            } else {
                Role::ListItem
            })
            .child(self.label)
            .text_color(if self.is_last || self.disabled {
                theme.foreground
            } else {
                theme.muted_foreground
            })
            .when(self.disabled, |this| {
                this.text_color(theme.muted_foreground)
            });
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        // A caller-supplied handler only wires up on a live item; a disabled
        // one keeps its role and colour but is inert.
        if let Some(on_click) = self.on_click.filter(|_| interactive) {
            root = root.cursor_pointer().on_click(move |event, window, cx| {
                on_click(event, window, cx);
            });
        }

        root
    }
}

/// The trail separator — a small caret between adjacent items.
#[derive(IntoElement)]
struct BreadcrumbSeparator;

impl RenderOnce for BreadcrumbSeparator {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        Phosphor::new(PhosphorIcon::CaretRight)
            .color(cx.theme().muted_foreground)
            .size(px(14.0))
    }
}

/// A breadcrumb trail.
#[derive(IntoElement)]
pub struct Breadcrumb {
    style: StyleRefinement,
    items: Vec<BreadcrumbItem>,
}

impl Breadcrumb {
    /// An empty trail.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            items: Vec::new(),
        }
    }

    /// Append a trail stop.
    pub fn child(mut self, item: impl Into<BreadcrumbItem>) -> Self {
        self.items.push(item.into());
        self
    }

    /// Append several trail stops.
    pub fn children(mut self, items: impl IntoIterator<Item = impl Into<BreadcrumbItem>>) -> Self {
        self.items.extend(items.into_iter().map(Into::into));
        self
    }
}

impl Default for Breadcrumb {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for Breadcrumb {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Breadcrumb {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let item_count = self.items.len();

        let mut children: Vec<AnyElement> = Vec::with_capacity(item_count.saturating_mul(2));
        for (ix, item) in self.items.into_iter().enumerate() {
            let is_last = ix + 1 == item_count;
            children.push(item.id(ix).mark_last(is_last).into_any_element());
            if !is_last {
                children.push(BreadcrumbSeparator.into_any_element());
            }
        }

        let mut root = div()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0))
            .text_size(px(14.0))
            .text_color(cx.theme().muted_foreground);
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.children(children)
    }
}
