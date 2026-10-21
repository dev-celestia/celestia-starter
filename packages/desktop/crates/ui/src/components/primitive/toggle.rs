//! Toggle — the desktop counterpart of
//! `packages/ui/src/components/primitive/toggle.tsx`, plus a segmented
//! [`ToggleGroup`] (no web file; pairs with Toggle the way shadcn's
//! `toggle-group` does).
//!
//! A pressed on/off button — not a [`Switch`](super::switch::Switch). Controlled:
//! activation reports the requested next value through [`Toggle::on_click`].

use std::cell::Cell;
use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::traits::{Disableable, Sizable, Size};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&bool, &mut Window, &mut App) + 'static>;
type OnGroupClick = Rc<dyn Fn(&Vec<bool>, &mut Window, &mut App) + 'static>;

/// Visual weight of a [`Toggle`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ToggleVariant {
    /// Transparent until pressed / hovered (web `default`).
    #[default]
    Default,
    /// Bordered chip (web `outline`).
    Outline,
}

/// A pressed on/off button.
#[derive(IntoElement)]
pub struct Toggle {
    id: ElementId,
    style: StyleRefinement,
    checked: bool,
    disabled: bool,
    size: Size,
    variant: ToggleVariant,
    label: Option<SharedString>,
    children: Vec<AnyElement>,
    on_click: Option<OnClick>,
    /// Internal: which corners/edges to draw when inside a segmented group.
    join_left: bool,
    join_right: bool,
}

impl Toggle {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            checked: false,
            disabled: false,
            size: Size::Medium,
            variant: ToggleVariant::default(),
            label: None,
            children: Vec::new(),
            on_click: None,
            join_left: false,
            join_right: false,
        }
    }

    pub fn checked(mut self, checked: bool) -> Self {
        self.checked = checked;
        self
    }

    pub fn variant(mut self, variant: ToggleVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn outline(mut self) -> Self {
        self.variant = ToggleVariant::Outline;
        self
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn on_click(mut self, f: impl Fn(&bool, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl ParentElement for Toggle {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Disableable for Toggle {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Sizable for Toggle {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Styled for Toggle {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Toggle {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let checked = self.checked;
        let disabled = self.disabled;
        let (h, min_w, px_pad, text) = match self.size {
            Size::XSmall | Size::Small => (px(24.0), px(24.0), px(8.0), px(11.0)),
            Size::Large => (px(36.0), px(36.0), px(12.0), px(14.0)),
            _ => (px(32.0), px(32.0), px(10.0), px(12.0)),
        };
        let outline = matches!(self.variant, ToggleVariant::Outline);
        let radius = if self.join_left || self.join_right {
            px(0.0)
        } else {
            theme.radius
        };

        let mut root = div()
            .id(self.id)
            .h(h)
            .min_w(min_w)
            .px(px_pad)
            .flex()
            .flex_row()
            .items_center()
            .justify_center()
            .gap(px(4.0))
            .rounded(radius)
            .when(self.join_left, |this| this.rounded_l(theme.radius))
            .when(self.join_right, |this| this.rounded_r(theme.radius))
            .when(outline, |this| {
                this.border_1()
                    .border_color(theme.border)
                    .bg(theme.background)
            })
            .when(!outline, |this| this.bg(theme.transparent))
            .when(checked, |this| {
                this.bg(theme.muted).text_color(theme.foreground)
            })
            .when(!checked, |this| this.text_color(theme.muted_foreground))
            .text_size(text)
            .font_weight(FontWeight::MEDIUM)
            .whitespace_nowrap()
            .when(disabled, |this| this.opacity(0.5))
            .when(!disabled, |this| {
                this.cursor_pointer()
                    .hover(|s| s.bg(theme.muted).text_color(theme.foreground))
            });
        root.style().refine(&self.style);

        root.when(!disabled, |this| {
            let on = self.on_click.clone();
            this.on_click(move |_: &ClickEvent, window, cx| {
                if let Some(on) = &on {
                    on(&!checked, window, cx);
                }
            })
        })
        .when_some(self.label, |this, label| this.child(label))
        .children(self.children)
    }
}

/// A row of [`Toggle`]s, optionally joined as a segmented control.
#[derive(IntoElement)]
pub struct ToggleGroup {
    id: ElementId,
    style: StyleRefinement,
    size: Size,
    variant: ToggleVariant,
    disabled: bool,
    segmented: bool,
    /// When true, only one toggle may be on (radio behavior).
    exclusive: bool,
    items: Vec<Toggle>,
    on_click: Option<OnGroupClick>,
}

impl ToggleGroup {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            size: Size::Medium,
            variant: ToggleVariant::default(),
            disabled: false,
            segmented: false,
            exclusive: false,
            items: Vec::new(),
            on_click: None,
        }
    }

    pub fn child(mut self, toggle: Toggle) -> Self {
        self.items.push(toggle);
        self
    }

    pub fn children(mut self, children: impl IntoIterator<Item = Toggle>) -> Self {
        self.items.extend(children);
        self
    }

    pub fn variant(mut self, variant: ToggleVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn outline(mut self) -> Self {
        self.variant = ToggleVariant::Outline;
        self
    }

    pub fn segmented(mut self) -> Self {
        self.segmented = true;
        self
    }

    /// Mutual-exclusion: activating one clears the others.
    pub fn exclusive(mut self) -> Self {
        self.exclusive = true;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&Vec<bool>, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Disableable for ToggleGroup {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Sizable for ToggleGroup {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Styled for ToggleGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ToggleGroup {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let len = self.items.len();
        let checks: Vec<bool> = self.items.iter().map(|t| t.checked).collect();
        let exclusive = self.exclusive;
        let on_group = self.on_click.clone();
        let clicked = Rc::new(Cell::new(None::<usize>));

        let mut root = div()
            .id(self.id)
            .flex()
            .flex_row()
            .items_center()
            .gap(if self.segmented { px(0.0) } else { px(4.0) });
        root.style().refine(&self.style);

        root.children(self.items.into_iter().enumerate().map(|(ix, mut item)| {
            item.size = self.size;
            item.variant = self.variant;
            if self.disabled {
                item.disabled = true;
            }
            if self.segmented {
                item.join_left = ix == 0;
                item.join_right = ix + 1 == len;
            }

            let checks = checks.clone();
            let on_group = on_group.clone();
            let clicked = clicked.clone();
            let prev = item.on_click.take();
            item.on_click(move |next, window, cx| {
                clicked.set(Some(ix));
                let mut next_checks = checks.clone();
                if exclusive {
                    for (i, v) in next_checks.iter_mut().enumerate() {
                        *v = i == ix && *next;
                    }
                    if !next_checks.iter().any(|v| *v) {
                        next_checks[ix] = true;
                    }
                } else {
                    next_checks[ix] = *next;
                }
                if let Some(on) = &on_group {
                    on(&next_checks, window, cx);
                }
                if let Some(prev) = &prev {
                    prev(next, window, cx);
                }
            })
        }))
    }
}
