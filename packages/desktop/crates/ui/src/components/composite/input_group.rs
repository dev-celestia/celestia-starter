//! InputGroup — bordered shell with leading / trailing addons (web `input-group.tsx`).

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, StyleRefinement, Styled, Window, div, px,
};

use crate::theme::ActiveTheme as _;

/// Where an [`InputGroupAddon`] sits relative to the control.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum InputGroupAlign {
    #[default]
    InlineStart,
    InlineEnd,
    BlockStart,
    BlockEnd,
}

/// A bordered input shell. Put the live control via [`InputGroup::control`]
/// and optional addons via [`InputGroup::addon`].
#[derive(IntoElement)]
pub struct InputGroup {
    id: ElementId,
    style: StyleRefinement,
    control: Option<AnyElement>,
    start: Vec<AnyElement>,
    end: Vec<AnyElement>,
    block_start: Vec<AnyElement>,
    block_end: Vec<AnyElement>,
    invalid: bool,
    disabled: bool,
}

impl InputGroup {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            control: None,
            start: Vec::new(),
            end: Vec::new(),
            block_start: Vec::new(),
            block_end: Vec::new(),
            invalid: false,
            disabled: false,
        }
    }

    pub fn control(mut self, control: impl IntoElement) -> Self {
        self.control = Some(control.into_any_element());
        self
    }

    pub fn addon(mut self, addon: InputGroupAddon) -> Self {
        let align = addon.align;
        let el = addon.into_any_element();
        match align {
            InputGroupAlign::InlineStart => self.start.push(el),
            InputGroupAlign::InlineEnd => self.end.push(el),
            InputGroupAlign::BlockStart => self.block_start.push(el),
            InputGroupAlign::BlockEnd => self.block_end.push(el),
        }
        self
    }

    pub fn invalid(mut self, invalid: bool) -> Self {
        self.invalid = invalid;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Styled for InputGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for InputGroup {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_block = !self.block_start.is_empty() || !self.block_end.is_empty();
        let border = if self.invalid {
            theme.danger
        } else {
            theme.border
        };

        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .when(has_block, |this| this.flex_col())
            .when(!has_block, |this| this.flex_row().items_center())
            .rounded(theme.radius)
            .border_1()
            .border_color(border)
            .bg(theme.background)
            .when(self.disabled, |this| this.opacity(0.5))
            .overflow_hidden();
        root.style().refine(&self.style);

        root.children(self.block_start)
            .child(
                div()
                    .w_full()
                    .flex()
                    .flex_row()
                    .items_center()
                    .min_h(px(32.0))
                    .children(self.start)
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .px(px(8.0))
                            .py(px(4.0))
                            .when_some(self.control, |d, c| d.child(c)),
                    )
                    .children(self.end),
            )
            .children(self.block_end)
    }
}

/// Leading / trailing (or block) addon for an [`InputGroup`].
#[derive(IntoElement)]
pub struct InputGroupAddon {
    style: StyleRefinement,
    align: InputGroupAlign,
    children: Vec<AnyElement>,
}

impl InputGroupAddon {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            align: InputGroupAlign::default(),
            children: Vec::new(),
        }
    }

    pub fn align(mut self, align: InputGroupAlign) -> Self {
        self.align = align;
        self
    }

    pub fn start(mut self) -> Self {
        self.align = InputGroupAlign::InlineStart;
        self
    }

    pub fn end(mut self) -> Self {
        self.align = InputGroupAlign::InlineEnd;
        self
    }
}

impl Default for InputGroupAddon {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for InputGroupAddon {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for InputGroupAddon {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for InputGroupAddon {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .flex()
            .flex_row()
            .items_center()
            .justify_center()
            .gap(px(4.0))
            .px(px(8.0))
            .text_xs()
            .text_color(theme.muted_foreground)
            .when(matches!(self.align, InputGroupAlign::BlockStart), |this| {
                this.w_full()
                    .justify_start()
                    .border_b_1()
                    .border_color(theme.border)
                    .py(px(6.0))
            })
            .when(matches!(self.align, InputGroupAlign::BlockEnd), |this| {
                this.w_full()
                    .justify_start()
                    .border_t_1()
                    .border_color(theme.border)
                    .py(px(6.0))
            });
        root.style().refine(&self.style);
        root.children(self.children)
    }
}
