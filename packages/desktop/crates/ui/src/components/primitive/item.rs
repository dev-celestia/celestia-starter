//! Item — the desktop counterpart of
//! `packages/ui/src/components/primitive/item.tsx`.
//!
//! A list-row atom with media / content / actions slots. Distinct from the
//! delegate-based [`crate::components::composite::list`] re-export.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::separator::Separator;
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Chrome for an [`Item`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ItemVariant {
    #[default]
    Default,
    Outline,
    Muted,
}

/// Density for an [`Item`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ItemSize {
    #[default]
    Default,
    Sm,
    Xs,
}

/// Media slot treatment.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ItemMediaVariant {
    #[default]
    Default,
    Icon,
    Image,
}

/// A group of [`Item`]s.
#[derive(IntoElement)]
pub struct ItemGroup {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ItemGroup {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ItemGroup {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ItemGroup {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ItemGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemGroup {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div().w_full().flex().flex_col().gap(px(10.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Horizontal rule between items.
#[derive(IntoElement)]
pub struct ItemSeparator {
    style: StyleRefinement,
}

impl ItemSeparator {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
        }
    }
}

impl Default for ItemSeparator {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for ItemSeparator {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemSeparator {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut sep = Separator::horizontal().mt(px(8.0)).mb(px(8.0));
        sep.style().refine(&self.style);
        sep
    }
}

/// One list-row atom.
#[derive(IntoElement)]
pub struct Item {
    id: Option<ElementId>,
    style: StyleRefinement,
    variant: ItemVariant,
    size: ItemSize,
    on_click: Option<OnClick>,
    children: Vec<AnyElement>,
}

impl Item {
    pub fn new() -> Self {
        Self {
            id: None,
            style: StyleRefinement::default(),
            variant: ItemVariant::default(),
            size: ItemSize::default(),
            on_click: None,
            children: Vec::new(),
        }
    }

    /// Stable element id — required for click handling and hover.
    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = Some(id.into());
        self
    }

    pub fn variant(mut self, variant: ItemVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn outline(mut self) -> Self {
        self.variant = ItemVariant::Outline;
        self
    }

    pub fn muted(mut self) -> Self {
        self.variant = ItemVariant::Muted;
        self
    }

    pub fn size(mut self, size: ItemSize) -> Self {
        self.size = size;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl Default for Item {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for Item {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Item {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Item {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (px_x, py) = match self.size {
            ItemSize::Xs => (px(10.0), px(8.0)),
            ItemSize::Sm | ItemSize::Default => (px(12.0), px(10.0)),
        };
        let (bg, border) = match self.variant {
            ItemVariant::Default => (theme.transparent, theme.transparent),
            ItemVariant::Outline => (theme.transparent, theme.border),
            ItemVariant::Muted => (theme.muted.opacity(0.5), theme.transparent),
        };

        let id = self.id.unwrap_or_else(|| ElementId::Name("item".into()));
        let mut root = div()
            .id(id)
            .w_full()
            .flex()
            .flex_row()
            .flex_wrap()
            .items_center()
            .gap(px(10.0))
            .px(px_x)
            .py(py)
            .rounded(theme.radius)
            .border_1()
            .border_color(border)
            .bg(bg)
            .text_xs()
            .text_color(theme.foreground)
            .when(self.on_click.is_some(), |this| {
                this.cursor_pointer().hover(|s| s.bg(theme.muted))
            });
        root.style().refine(&self.style);

        root.when_some(self.on_click, |this, on| {
            this.on_click(move |e, window, cx| on(e, window, cx))
        })
        .children(self.children)
    }
}

/// Leading media slot (icon / image).
#[derive(IntoElement)]
pub struct ItemMedia {
    style: StyleRefinement,
    variant: ItemMediaVariant,
    children: Vec<AnyElement>,
}

impl ItemMedia {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            variant: ItemMediaVariant::default(),
            children: Vec::new(),
        }
    }

    pub fn variant(mut self, variant: ItemMediaVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn icon(mut self) -> Self {
        self.variant = ItemMediaVariant::Icon;
        self
    }

    pub fn image(mut self) -> Self {
        self.variant = ItemMediaVariant::Image;
        self
    }
}

impl Default for ItemMedia {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ItemMedia {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ItemMedia {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemMedia {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .flex_none()
            .flex()
            .items_center()
            .justify_center()
            .when(matches!(self.variant, ItemMediaVariant::Image), |this| {
                this.size(px(32.0))
                    .rounded(px(6.0))
                    .overflow_hidden()
                    .bg(theme.muted)
            });
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Title + description column.
#[derive(IntoElement)]
pub struct ItemContent {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ItemContent {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ItemContent {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ItemContent {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ItemContent {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemContent {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div().flex_1().min_w_0().flex().flex_col().gap(px(2.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Medium title line.
#[derive(IntoElement)]
pub struct ItemTitle {
    style: StyleRefinement,
    text: SharedString,
}

impl ItemTitle {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for ItemTitle {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemTitle {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(theme.foreground)
            .child(self.text);
        root.style().refine(&self.style);
        root
    }
}

/// Muted description line.
#[derive(IntoElement)]
pub struct ItemDescription {
    style: StyleRefinement,
    text: SharedString,
}

impl ItemDescription {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for ItemDescription {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemDescription {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .text_xs()
            .text_color(theme.muted_foreground)
            .child(self.text);
        root.style().refine(&self.style);
        root
    }
}

/// Trailing action cluster.
#[derive(IntoElement)]
pub struct ItemActions {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ItemActions {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ItemActions {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ItemActions {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ItemActions {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemActions {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .flex_none()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Full-width header row inside an item.
#[derive(IntoElement)]
pub struct ItemHeader {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ItemHeader {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ItemHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ItemHeader {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ItemHeader {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemHeader {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .justify_between()
            .gap(px(8.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Full-width footer row inside an item.
#[derive(IntoElement)]
pub struct ItemFooter {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ItemFooter {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ItemFooter {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ItemFooter {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ItemFooter {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ItemFooter {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .justify_between()
            .gap(px(8.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}
