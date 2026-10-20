//! Drawer — bottom (or edge) drawer with swipe handle (web `drawer.tsx`).
//!
//! Presentational chrome. Host owns open/close state; embed inside a layer or
//! use alongside [`crate::components::primitive::sheet`] for window overlays.

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

/// Edge a [`Drawer`] attaches to. Defaults to bottom (mobile sheet idiom).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum DrawerSide {
    #[default]
    Bottom,
    Top,
    Left,
    Right,
}

/// A drawer surface with optional drag handle, title, body, and footer.
#[derive(IntoElement)]
pub struct Drawer {
    id: ElementId,
    style: StyleRefinement,
    side: DrawerSide,
    title: Option<SharedString>,
    description: Option<SharedString>,
    show_handle: bool,
    show_close: bool,
    on_close: Option<OnClick>,
    overlay: bool,
    size: f32,
    footer: Option<AnyElement>,
    children: Vec<AnyElement>,
}

impl Drawer {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            side: DrawerSide::default(),
            title: None,
            description: None,
            show_handle: true,
            show_close: true,
            on_close: None,
            overlay: true,
            size: 280.0,
            footer: None,
            children: Vec::new(),
        }
    }

    pub fn side(mut self, side: DrawerSide) -> Self {
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

    pub fn show_handle(mut self, show: bool) -> Self {
        self.show_handle = show;
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

    pub fn overlay(mut self, overlay: bool) -> Self {
        self.overlay = overlay;
        self
    }

    /// Height (top/bottom) or width (left/right) in pixels.
    pub fn size(mut self, size: f32) -> Self {
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

impl ParentElement for Drawer {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Drawer {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Drawer {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let id = self.id.clone();
        let side = self.side;
        let size = px(self.size);
        let horizontal = matches!(side, DrawerSide::Left | DrawerSide::Right);
        let handle_on_top = matches!(side, DrawerSide::Bottom);
        let handle_on_bottom = matches!(side, DrawerSide::Top);

        let panel = div()
            .id(ElementId::Name(format!("{}-panel", id).into()))
            .flex()
            .flex_col()
            .bg(theme.popover)
            .border_color(theme.border)
            .when(!horizontal, |d| {
                d.w_full().h(size).rounded_t(theme.radius_lg)
            })
            .when(horizontal, |d| d.h_full().w(size))
            .when(matches!(side, DrawerSide::Bottom), |d| d.border_t_1())
            .when(matches!(side, DrawerSide::Top), |d| {
                d.border_b_1().rounded_t(px(0.0)).rounded_b(theme.radius_lg)
            })
            .when(matches!(side, DrawerSide::Left), |d| d.border_r_1())
            .when(matches!(side, DrawerSide::Right), |d| d.border_l_1())
            .when(self.show_handle && handle_on_top, |d| {
                d.child(DrawerHandle::new().axis_horizontal(!horizontal))
            })
            .child(
                div()
                    .w_full()
                    .px(px(16.0))
                    .pt(if self.show_handle && handle_on_top {
                        px(4.0)
                    } else {
                        px(14.0)
                    })
                    .pb(px(10.0))
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
            .child(
                div()
                    .flex_1()
                    .min_h_0()
                    .w_full()
                    .px(px(16.0))
                    .pb(px(12.0))
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
            })
            .when(self.show_handle && handle_on_bottom, |d| {
                d.child(DrawerHandle::new().axis_horizontal(!horizontal))
            });

        let frame_h = if horizontal {
            px(320.0)
        } else {
            size + px(1.0)
        };

        let mut root = div()
            .id(self.id)
            .relative()
            .w_full()
            .h(frame_h)
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
                .when(matches!(side, DrawerSide::Bottom), |d| {
                    d.flex_col().justify_end()
                })
                .when(matches!(side, DrawerSide::Top), |d| {
                    d.flex_col().justify_start()
                })
                .when(matches!(side, DrawerSide::Left), |d| d.justify_start())
                .when(matches!(side, DrawerSide::Right), |d| d.justify_end())
                .child(panel),
        )
    }
}

/// Grabber / swipe handle for a [`Drawer`].
#[derive(IntoElement)]
pub struct DrawerHandle {
    style: StyleRefinement,
    /// `true` = horizontal bar (bottom/top drawers); `false` = vertical rail.
    axis_horizontal: bool,
}

impl DrawerHandle {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            axis_horizontal: true,
        }
    }

    pub fn axis_horizontal(mut self, horizontal: bool) -> Self {
        self.axis_horizontal = horizontal;
        self
    }
}

impl Default for DrawerHandle {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for DrawerHandle {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for DrawerHandle {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .w_full()
            .flex()
            .items_center()
            .justify_center()
            .when(self.axis_horizontal, |d| d.h(px(16.0)))
            .when(!self.axis_horizontal, |d| d.w(px(16.0)).h_full())
            .child(
                div()
                    .rounded_full()
                    .bg(theme.muted_foreground.opacity(0.35))
                    .when(self.axis_horizontal, |d| d.w(px(36.0)).h(px(4.0)))
                    .when(!self.axis_horizontal, |d| d.h(px(36.0)).w(px(4.0))),
            );
        root.style().refine(&self.style);
        root
    }
}
