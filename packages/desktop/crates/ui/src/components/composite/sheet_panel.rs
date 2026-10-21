//! SheetPanel — presentational side sheet (web `sheet.tsx` content chrome).
//!
//! Pair with the window-layer host from [`crate::components::primitive::sheet`]
//! (`window.open_sheet`) when you need a real overlay, or embed this panel
//! inline for gallery / nested layouts.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StyleRefinement, Styled, Window, div,
    px,
};

use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Which edge a [`SheetPanel`] docks to.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum SheetSide {
    Top,
    #[default]
    Right,
    Bottom,
    Left,
}

/// Presentational sheet surface with optional overlay, header, body, and footer.
#[derive(IntoElement)]
pub struct SheetPanel {
    id: ElementId,
    style: StyleRefinement,
    side: SheetSide,
    title: Option<SharedString>,
    description: Option<SharedString>,
    show_close: bool,
    on_close: Option<OnClick>,
    overlay: bool,
    size: f32,
    header_actions: Vec<AnyElement>,
    footer: Option<AnyElement>,
    children: Vec<AnyElement>,
}

impl SheetPanel {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            side: SheetSide::default(),
            title: None,
            description: None,
            show_close: true,
            on_close: None,
            overlay: true,
            size: 360.0,
            header_actions: Vec::new(),
            footer: None,
            children: Vec::new(),
        }
    }

    pub fn side(mut self, side: SheetSide) -> Self {
        self.side = side;
        self
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn show_close(mut self, show: bool) -> Self {
        self.show_close = show;
        self
    }

    pub fn on_close(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_close = Some(Rc::new(f));
        self
    }

    /// Draw a dimming scrim behind the panel (default `true`).
    pub fn overlay(mut self, overlay: bool) -> Self {
        self.overlay = overlay;
        self
    }

    /// Panel width (left/right) or height (top/bottom) in pixels.
    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    pub fn header_action(mut self, action: impl IntoElement) -> Self {
        self.header_actions.push(action.into_any_element());
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for SheetPanel {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for SheetPanel {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SheetPanel {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let id = self.id.clone();
        let side = self.side;
        let size = px(self.size);
        let vertical = matches!(side, SheetSide::Left | SheetSide::Right);

        let panel = div()
            .id(ElementId::Name(format!("{}-panel", id).into()))
            .flex()
            .flex_col()
            .bg(theme.popover)
            .border_color(theme.border)
            .when(vertical, |d| d.h_full().w(size))
            .when(!vertical, |d| d.w_full().h(size))
            .when(matches!(side, SheetSide::Right), |d| d.border_l_1())
            .when(matches!(side, SheetSide::Left), |d| d.border_r_1())
            .when(matches!(side, SheetSide::Top), |d| d.border_b_1())
            .when(matches!(side, SheetSide::Bottom), |d| d.border_t_1())
            .child(
                div()
                    .w_full()
                    .px(px(16.0))
                    .py(px(14.0))
                    .flex()
                    .flex_row()
                    .items_start()
                    .gap(px(10.0))
                    .border_b_1()
                    .border_color(theme.border)
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .flex()
                            .flex_col()
                            .gap(px(4.0))
                            .when_some(self.title, |d, title| {
                                d.child(
                                    div()
                                        .text_sm()
                                        .font_weight(FontWeight::SEMIBOLD)
                                        .text_color(theme.foreground)
                                        .child(title),
                                )
                            })
                            .when_some(self.description, |d, desc| {
                                d.child(
                                    div()
                                        .text_xs()
                                        .text_color(theme.muted_foreground)
                                        .child(desc),
                                )
                            }),
                    )
                    .when(!self.header_actions.is_empty(), |d| {
                        d.child(
                            div()
                                .flex()
                                .flex_row()
                                .items_center()
                                .gap(px(4.0))
                                .children(self.header_actions),
                        )
                    })
                    .when(self.show_close, |d| {
                        let on = self.on_close.clone();
                        let mut close = Button::icon(
                            ElementId::Name(format!("{}-close", id).into()),
                            Phosphor::new(PhosphorIcon::X).size(px(14.0)),
                        )
                        .size(ButtonSize::IconSm)
                        .variant(ButtonVariant::Ghost)
                        .accessibility_label("Close")
                        .tooltip("Close");
                        if let Some(on) = on {
                            close = close.on_click(move |e, w, cx| on(e, w, cx));
                        }
                        d.child(close)
                    }),
            )
            .child(
                div()
                    .flex_1()
                    .min_h_0()
                    .w_full()
                    .p(px(16.0))
                    .overflow_hidden()
                    .children(self.children),
            )
            .when_some(self.footer, |d, footer| {
                d.child(
                    div()
                        .w_full()
                        .px(px(16.0))
                        .py(px(12.0))
                        .border_t_1()
                        .border_color(theme.border)
                        .child(footer),
                )
            });

        let mut root = div()
            .id(self.id)
            .relative()
            .w_full()
            .when(vertical, |d| d.h(px(320.0)))
            .when(!vertical, |d| d.h(size + px(1.0)))
            .overflow_hidden()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border);
        root.style().refine(&self.style);

        root.when(self.overlay, |d| {
            d.child(
                div()
                    .absolute()
                    .inset_0()
                    .bg(theme.background.opacity(0.45)),
            )
        })
        .child(
            div()
                .absolute()
                .inset_0()
                .flex()
                .when(matches!(side, SheetSide::Right), |d| d.justify_end())
                .when(matches!(side, SheetSide::Left), |d| d.justify_start())
                .when(matches!(side, SheetSide::Top), |d| {
                    d.flex_col().justify_start()
                })
                .when(matches!(side, SheetSide::Bottom), |d| {
                    d.flex_col().justify_end()
                })
                .child(panel),
        )
    }
}

/// Standalone sheet header block (web `SheetHeader`).
#[derive(IntoElement)]
pub struct SheetHeader {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl SheetHeader {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for SheetHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for SheetHeader {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for SheetHeader {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SheetHeader {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div().w_full().flex().flex_col().gap(px(4.0)).p(px(16.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Sheet title text (web `SheetTitle`).
#[derive(IntoElement)]
pub struct SheetTitle {
    style: StyleRefinement,
    text: SharedString,
}

impl SheetTitle {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for SheetTitle {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SheetTitle {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .text_sm()
            .font_weight(FontWeight::SEMIBOLD)
            .text_color(theme.foreground)
            .child(self.text);
        root.style().refine(&self.style);
        root
    }
}

/// Sheet description text (web `SheetDescription`).
#[derive(IntoElement)]
pub struct SheetDescription {
    style: StyleRefinement,
    text: SharedString,
}

impl SheetDescription {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for SheetDescription {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SheetDescription {
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

/// Sheet footer block (web `SheetFooter`).
#[derive(IntoElement)]
pub struct SheetFooter {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl SheetFooter {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for SheetFooter {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for SheetFooter {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for SheetFooter {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for SheetFooter {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .w_full()
            .mt_auto()
            .flex()
            .flex_row()
            .items_center()
            .justify_end()
            .gap(px(8.0))
            .p(px(16.0))
            .border_t_1()
            .border_color(theme.border);
        root.style().refine(&self.style);
        root.children(self.children)
    }
}
