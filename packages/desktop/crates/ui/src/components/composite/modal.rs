//! Modal — presentational centered dialog chrome (web `dialog.tsx` content).
//!
//! Pair with the window-layer host from [`crate::components::primitive::dialog`]
//! (`window.open_dialog`) when you need a real overlay, or embed this panel
//! inline for gallery / nested layouts.
//!
//! Also ships composable building blocks matching the web API:
//! [`ModalHeader`], [`ModalTitle`], [`ModalDescription`], [`ModalBody`],
//! [`ModalFooter`].

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

/// Width ladder for a [`Modal`] panel (web `sm:max-w-*`).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ModalSize {
    /// ~320px — compact confirms and alerts.
    Small,
    /// ~384px — default dialog content width (`sm:max-w-sm`).
    #[default]
    Medium,
    /// ~448px — forms and multi-field content.
    Large,
    /// ~560px — wide content (tables, previews).
    XLarge,
}

impl ModalSize {
    fn width(self) -> f32 {
        match self {
            Self::Small => 320.0,
            Self::Medium => 384.0,
            Self::Large => 448.0,
            Self::XLarge => 560.0,
        }
    }
}

/// Presentational centered modal surface with optional overlay, header, body,
/// and footer.
#[derive(IntoElement)]
pub struct Modal {
    id: ElementId,
    style: StyleRefinement,
    title: Option<SharedString>,
    description: Option<SharedString>,
    show_close: bool,
    on_close: Option<OnClick>,
    overlay: bool,
    size: ModalSize,
    footer: Option<AnyElement>,
    children: Vec<AnyElement>,
}

impl Modal {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            title: None,
            description: None,
            show_close: true,
            on_close: None,
            overlay: true,
            size: ModalSize::default(),
            footer: None,
            children: Vec::new(),
        }
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

    pub fn size(mut self, size: ModalSize) -> Self {
        self.size = size;
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

impl ParentElement for Modal {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Modal {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Modal {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let id = self.id.clone();
        let width = px(self.size.width());
        let has_header = self.title.is_some() || self.description.is_some() || self.show_close;

        let panel = div()
            .id(ElementId::Name(format!("{}-panel", id).into()))
            .relative()
            .w(width)
            .flex()
            .flex_col()
            .gap(px(16.0))
            .p(px(16.0))
            .rounded(theme.radius_xl())
            .bg(theme.popover)
            .border_1()
            .border_color(theme.border)
            .text_color(theme.popover_foreground)
            .when(has_header, |d| {
                d.child(
                    div()
                        .w_full()
                        .flex()
                        .flex_row()
                        .items_start()
                        .gap(px(10.0))
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
                                            .line_height(px(18.0))
                                            .text_color(theme.muted_foreground)
                                            .child(desc),
                                    )
                                }),
                        )
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
            })
            .when(!self.children.is_empty(), |d| {
                d.child(
                    div()
                        .w_full()
                        .flex()
                        .flex_col()
                        .gap(px(8.0))
                        .min_h_0()
                        .children(self.children),
                )
            })
            .when_some(self.footer, |d, footer| {
                d.child(
                    div()
                        .w_full()
                        .flex()
                        .flex_row()
                        .items_center()
                        .justify_end()
                        .gap(px(8.0))
                        .child(footer),
                )
            });

        let mut root = div()
            .id(self.id)
            .relative()
            .w_full()
            .h(px(280.0))
            .overflow_hidden()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border);
        root.style().refine(&self.style);

        root.when(self.overlay, |d| {
            d.child(div().absolute().inset_0().bg(theme.overlay))
        })
        .child(
            div()
                .absolute()
                .inset_0()
                .flex()
                .items_center()
                .justify_center()
                .p(px(16.0))
                .child(panel),
        )
    }
}

/// Standalone modal header block (web `DialogHeader`).
#[derive(IntoElement)]
pub struct ModalHeader {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ModalHeader {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ModalHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ModalHeader {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ModalHeader {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ModalHeader {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div().w_full().flex().flex_col().gap(px(4.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Modal title text (web `DialogTitle`).
#[derive(IntoElement)]
pub struct ModalTitle {
    style: StyleRefinement,
    text: SharedString,
}

impl ModalTitle {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for ModalTitle {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ModalTitle {
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

/// Modal description text (web `DialogDescription`).
#[derive(IntoElement)]
pub struct ModalDescription {
    style: StyleRefinement,
    text: SharedString,
}

impl ModalDescription {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
        }
    }
}

impl Styled for ModalDescription {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ModalDescription {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .text_xs()
            .line_height(px(18.0))
            .text_color(theme.muted_foreground)
            .child(self.text);
        root.style().refine(&self.style);
        root
    }
}

/// Modal body slot for free-form content (web dialog children between header
/// and footer).
#[derive(IntoElement)]
pub struct ModalBody {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ModalBody {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ModalBody {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ModalBody {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ModalBody {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ModalBody {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div().w_full().flex().flex_col().gap(px(8.0)).min_h_0();
        root.style().refine(&self.style);
        root.children(self.children)
    }
}

/// Modal footer block (web `DialogFooter`).
#[derive(IntoElement)]
pub struct ModalFooter {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl ModalFooter {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for ModalFooter {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for ModalFooter {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for ModalFooter {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ModalFooter {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .justify_end()
            .gap(px(8.0));
        root.style().refine(&self.style);
        root.children(self.children)
    }
}
