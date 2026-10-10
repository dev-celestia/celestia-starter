//! Sidebar app-shell layout — the desktop counterpart of the web
//! `composite/sidebar.tsx` / dashboard-shell shape: a fixed-width, themable
//! navigation column plus a flexible content pane.
//!
//! Built from plain element composition (not gpui-component's generic
//! `Sidebar<E>` item machinery) so call sites stay legible; every color comes
//! from the `sidebar.*` theme roles.
//!
//! ```ignore
//! SidebarLayout::new("shell")
//!     .sidebar(SidebarHeader::new().child(brand))
//!     .sidebar(SidebarSection::new("Components"))
//!     .sidebar(SidebarNav::new("nav").children(items))
//!     .sidebar(SidebarFooter::new().child(footer))
//!     .content(self.render_body(cx))
//! ```

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement, IntoElement,
    ParentElement, Pixels, RenderOnce, SharedString, StatefulInteractiveElement, Styled, Window,
    div, px,
};

use crate::focus_ring::focus_ring;
use crate::theme::ActiveTheme as _;

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// The shell: fixed-width sidebar column + flexible content pane.
#[derive(IntoElement)]
pub struct SidebarLayout {
    id: ElementId,
    width: Pixels,
    sidebar: Vec<AnyElement>,
    content: Option<AnyElement>,
}

impl SidebarLayout {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            width: px(240.),
            sidebar: Vec::new(),
            content: None,
        }
    }

    /// Sidebar column width. The column is hidden only by not calling
    /// `.sidebar(...)`; collapse-to-icons is a call-site concern.
    pub fn width(mut self, width: Pixels) -> Self {
        self.width = width;
        self
    }

    /// Push one block onto the sidebar column (header, nav, footer…).
    pub fn sidebar(mut self, block: impl IntoElement) -> Self {
        self.sidebar.push(block.into_any_element());
        self
    }

    /// The content pane.
    pub fn content(mut self, content: impl IntoElement) -> Self {
        self.content = Some(content.into_any_element());
        self
    }
}

impl RenderOnce for SidebarLayout {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();

        div()
            .flex()
            .flex_row()
            // `h_flex()`'s cross-axis centering; nothing below overrides it.
            .items_center()
            .id(self.id)
            .size_full()
            .child(
                div()
                    .flex()
                    .flex_col()
                    .w(self.width)
                    .flex_none()
                    .h_full()
                    .bg(theme.sidebar)
                    .text_color(theme.sidebar_foreground)
                    .border_r_1()
                    .border_color(theme.sidebar_border)
                    .overflow_hidden()
                    .children(self.sidebar),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .h_full()
                    .overflow_hidden()
                    .children(self.content),
            )
    }
}

/// Title block at the top of the sidebar column.
#[derive(IntoElement)]
pub struct SidebarHeader {
    children: Vec<AnyElement>,
}

impl SidebarHeader {
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }
}

impl Default for SidebarHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for SidebarHeader {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for SidebarHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .flex()
            .flex_row()
            .h_12()
            .flex_none()
            .px_3()
            .gap_2()
            .items_center()
            .border_b_1()
            .border_color(cx.theme().sidebar_border)
            .children(self.children)
    }
}

/// Small uppercase group label between nav blocks.
#[derive(IntoElement)]
pub struct SidebarSection {
    label: SharedString,
}

impl SidebarSection {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
        }
    }
}

impl RenderOnce for SidebarSection {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .px_3()
            .pt(px(16.0))
            .pb(px(4.0))
            .flex_none()
            .text_xs()
            .font_weight(FontWeight::SEMIBOLD)
            .text_color(cx.theme().muted_foreground)
            .child(self.label)
    }
}

/// Vertical nav container; takes the remaining sidebar height and scrolls
/// internally when the items overflow.
#[derive(IntoElement)]
pub struct SidebarNav {
    id: ElementId,
    children: Vec<AnyElement>,
}

impl SidebarNav {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            children: Vec::new(),
        }
    }
}

impl ParentElement for SidebarNav {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for SidebarNav {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        div()
            .flex()
            .flex_col()
            .id(self.id)
            .flex_1()
            .min_h_0()
            .px_2()
            .py_2()
            .gap_1()
            .overflow_y_scroll()
            .children(self.children)
    }
}

/// One nav row — rounded, hover-tinted, accent-filled when selected.
///
/// # No colour transition here, on purpose
///
/// The web's `SidebarMenuButton` carries `transition-[width,height,padding]` —
/// geometry only. Its `hover:bg-sidebar-accent`, `active:bg-sidebar-accent` and
/// `data-active:bg-sidebar-accent` all land in the same frame; the 220ms
/// `duration-normal ease-linear` transition belongs to the *container's*
/// `transition-[width]`, which drives the collapse-to-icon rail. This row is a
/// fixed-width row, so there is nothing for a duration to drive: adding a
/// colour fade would be a new effect the web does not have.
///
/// What the web does have and this row did not: the `text-xs` step (it was
/// rendering a step large at `text-sm`), the press tint, and
/// `focus-visible:ring-2`.
#[derive(IntoElement)]
pub struct SidebarNavItem {
    id: ElementId,
    label: SharedString,
    icon: Option<AnyElement>,
    badge: Option<SharedString>,
    selected: bool,
    on_click: Option<ClickHandler>,
}

impl SidebarNavItem {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon: None,
            badge: None,
            selected: false,
            on_click: None,
        }
    }

    pub fn icon(mut self, icon: impl IntoElement) -> Self {
        self.icon = Some(icon.into_any_element());
        self
    }

    pub fn badge(mut self, badge: impl Into<SharedString>) -> Self {
        self.badge = Some(badge.into());
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for SidebarNavItem {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let (
            sidebar_accent,
            sidebar_accent_foreground,
            sidebar_foreground,
            muted,
            muted_foreground,
            primary,
        ) = {
            let theme = cx.theme();
            (
                theme.sidebar_accent,
                theme.sidebar_accent_foreground,
                theme.sidebar_foreground,
                theme.muted,
                theme.muted_foreground,
                theme.primary,
            )
        };

        let focus_handle = cx.focus_handle();
        let focus_handle = window
            .use_keyed_state(self.id.clone(), cx, move |_, _| focus_handle)
            .read(cx)
            .clone();

        let mut row = div()
            .flex()
            .flex_row()
            .id(self.id)
            .w_full()
            .h_8()
            .px_2()
            .gap_2()
            .items_center()
            .rounded(px(6.))
            // `text-xs` — the web row is one type step below the old desktop
            // value.
            .text_xs()
            .cursor_pointer()
            .track_focus(&focus_handle)
            .when(self.selected, |row| {
                row.bg(sidebar_accent)
                    .text_color(sidebar_accent_foreground)
                    .font_weight(FontWeight::MEDIUM)
            })
            .when(!self.selected, |row| {
                row.text_color(sidebar_foreground)
                    .hover(|style| style.bg(sidebar_accent))
                    // `active:bg-sidebar-accent active:text-sidebar-accent-foreground`
                    // — the press tint the desktop was missing.
                    .active(|style| {
                        style
                            .bg(sidebar_accent)
                            .text_color(sidebar_accent_foreground)
                    })
            });

        if self.selected {
            row = row.child(
                div()
                    .w(px(2.5))
                    .h(px(14.0))
                    .rounded(px(1.0))
                    .bg(primary)
                    .flex_none(),
            );
        }

        if let Some(icon) = self.icon {
            row = row.child(div().flex_none().child(icon));
        }

        row = row.child(div().flex_1().min_w_0().truncate().child(self.label));

        if let Some(badge) = self.badge {
            row = row.child(
                div()
                    .flex_none()
                    .px(px(6.0))
                    .py(px(2.0))
                    .rounded(px(4.))
                    .bg(muted)
                    .text_xs()
                    .text_color(muted_foreground)
                    .child(badge),
            );
        }

        if let Some(on_click) = self.on_click {
            row = row.on_click(move |event, window, cx| on_click(event, window, cx));
        }

        // `focus-visible:ring-2` — the Celestia 2px full-strength ring.
        if focus_handle.is_focused(window) {
            row = focus_ring(row, window, cx);
        }
        row
    }
}

/// Footer strip pinned to the bottom of the sidebar column.
#[derive(IntoElement)]
pub struct SidebarFooter {
    children: Vec<AnyElement>,
}

impl SidebarFooter {
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }
}

impl Default for SidebarFooter {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for SidebarFooter {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for SidebarFooter {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .flex()
            .flex_row()
            .flex_none()
            .px_2()
            .py_2()
            .gap_2()
            .items_center()
            .border_t_1()
            .border_color(cx.theme().sidebar_border)
            .children(self.children)
    }
}
