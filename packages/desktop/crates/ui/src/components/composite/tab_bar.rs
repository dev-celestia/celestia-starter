//! Tab bar — closable document tabs with dirty / active indicators.
//!
//! Each [`TabBarItem`] can carry a leading and trailing slot (icons, badges,
//! custom marks) in addition to the label and optional close control.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, Context, ElementId, FontWeight, Hsla, InteractiveElement as _,
    IntoElement, ParentElement, Pixels, Refineable as _, RenderOnce, ScrollHandle, SharedString,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, px,
};

use crate::components::composite::menu::ContextMenuExt as _;
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;
use gpui_component::menu::PopupMenu;

/// One document tab in a [`TabBar`].
pub struct TabBarItem {
    pub id: SharedString,
    pub label: SharedString,
    pub dirty: bool,
    pub closable: bool,
    leading: Option<AnyElement>,
    trailing: Option<AnyElement>,
    context_menu:
        Option<Rc<dyn Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static>>,
}

impl TabBarItem {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            dirty: false,
            closable: true,
            leading: None,
            trailing: None,
            context_menu: None,
        }
    }

    /// Right-click menu for this tab (same builder as [`ContextMenuExt`]).
    pub fn context_menu(
        mut self,
        f: impl Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static,
    ) -> Self {
        self.context_menu = Some(Rc::new(f));
        self
    }

    pub fn dirty(mut self, dirty: bool) -> Self {
        self.dirty = dirty;
        self
    }

    pub fn closable(mut self, closable: bool) -> Self {
        self.closable = closable;
        self
    }

    /// Leading slot — typically an icon or mark before the label.
    pub fn leading(mut self, leading: impl IntoElement) -> Self {
        self.leading = Some(leading.into_any_element());
        self
    }

    /// Trailing slot — content before the close control (badge, status, …).
    pub fn trailing(mut self, trailing: impl IntoElement) -> Self {
        self.trailing = Some(trailing.into_any_element());
        self
    }
}

/// Default height of each tab chip.
pub const TAB_CHIP_HEIGHT: Pixels = px(30.);

/// A horizontal strip of document tabs.
#[derive(IntoElement)]
pub struct TabBar {
    id: ElementId,
    scroll_id: ElementId,
    style: StyleRefinement,
    items: Vec<TabBarItem>,
    active_id: Option<SharedString>,
    tab_height: Pixels,
    leading: Option<AnyElement>,
    trailing: Option<AnyElement>,
    scroll_handle: Option<ScrollHandle>,
    active_border: Option<Hsla>,
    on_select: Option<Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>>,
    on_close: Option<Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>>,
}

impl TabBar {
    pub fn new(id: impl Into<SharedString>) -> Self {
        let name: SharedString = id.into();
        Self {
            id: ElementId::Name(name.clone()),
            scroll_id: ElementId::Name(format!("{name}-scroll").into()),
            style: StyleRefinement::default(),
            items: Vec::new(),
            active_id: None,
            tab_height: TAB_CHIP_HEIGHT,
            leading: None,
            trailing: None,
            scroll_handle: None,
            active_border: None,
            on_select: None,
            on_close: None,
        }
    }

    /// Color of the strip's bottom rule and the active tab's border.
    /// Defaults to [`Theme::primary`](crate::theme::Theme::primary).
    pub fn active_border(mut self, color: impl Into<Hsla>) -> Self {
        self.active_border = Some(color.into());
        self
    }

    /// Track horizontal scroll so callers can reveal a tab with
    /// [`ScrollHandle::scroll_to_item`]. Does not auto-scroll on its own.
    pub fn track_scroll(mut self, scroll_handle: &ScrollHandle) -> Self {
        self.scroll_handle = Some(scroll_handle.clone());
        self
    }

    /// Height of each tab chip (default [`TAB_CHIP_HEIGHT`]).
    pub fn tab_height(mut self, height: impl Into<Pixels>) -> Self {
        self.tab_height = height.into();
        self
    }

    pub fn item(mut self, item: TabBarItem) -> Self {
        self.items.push(item);
        self
    }

    pub fn items(mut self, items: impl IntoIterator<Item = TabBarItem>) -> Self {
        self.items.extend(items);
        self
    }

    pub fn active(mut self, id: impl Into<SharedString>) -> Self {
        self.active_id = Some(id.into());
        self
    }

    /// Strip-level leading slot (workspace selector, back control, …).
    pub fn leading(mut self, leading: impl IntoElement) -> Self {
        self.leading = Some(leading.into_any_element());
        self
    }

    /// Strip-level trailing slot (actions, view switcher, …).
    pub fn trailing(mut self, trailing: impl IntoElement) -> Self {
        self.trailing = Some(trailing.into_any_element());
        self
    }

    pub fn on_select(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(f));
        self
    }

    pub fn on_close(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_close = Some(Rc::new(f));
        self
    }
}

impl Styled for TabBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for TabBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let active_id = self.active_id.clone();
        let tab_height = self.tab_height;
        let active_border = self.active_border.unwrap_or(theme.primary);
        let is_web = cfg!(target_family = "wasm");

        let mut root = div()
            .id(self.id)
            .w_full()
            .min_w_0()
            .flex()
            .flex_row()
            .items_end()
            .gap(px(2.0))
            .px(px(4.0))
            .pt(px(4.0))
            .border_b_1()
            .border_color(active_border)
            .bg(theme.muted.opacity(0.4));
        root.style().refine(&self.style);

        // Leading / trailing stay pinned; only the tab chips scroll horizontally.
        root.when_some(self.leading, |this, leading| {
            this.child(
                div()
                    .flex_shrink_0()
                    .flex()
                    .items_center()
                    .self_center()
                    .pr(px(4.0))
                    .child(leading),
            )
        })
        .child(
            div()
                .id(self.scroll_id)
                .flex_1()
                .min_w_0()
                .flex()
                .flex_row()
                .items_end()
                .gap(px(2.0))
                .overflow_x_scroll()
                .when(!is_web, |this| this.restrict_scroll_to_axis())
                .when_some(self.scroll_handle, |this, handle| this.track_scroll(&handle))
                .children(self.items.into_iter().map(|item| {
                    let TabBarItem {
                        id,
                        label,
                        dirty,
                        closable,
                        leading,
                        trailing,
                        context_menu,
                    } = item;
                    let selected = active_id.as_ref().is_some_and(|a| a == &id);
                    let tab_id = id.clone();
                    let close_id = id.clone();
                    let on_select = self.on_select.clone();
                    let on_close = self.on_close.clone();

                    let chip = div()
                        .id(ElementId::Name(format!("tab-{}", id).into()))
                        .relative()
                        .flex_shrink_0()
                        .h(tab_height)
                        .max_w(px(200.0))
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(4.0))
                        .px(px(8.0))
                        .rounded_t(theme.radius_sm())
                        .border_1()
                        .border_b_0()
                        .border_color(if selected {
                            active_border
                        } else {
                            theme.border.opacity(0.0)
                        })
                        .bg(if selected {
                            theme.background
                        } else {
                            theme.transparent
                        })
                        .cursor_pointer()
                        .hover(|s| {
                            if selected {
                                s
                            } else {
                                s.bg(theme.muted)
                            }
                        })
                        .on_click(move |_, window, cx| {
                            if let Some(on) = &on_select {
                                on(&tab_id, window, cx);
                            }
                        })
                        .when(dirty, |this| {
                            this.child(
                                div()
                                    .size(px(6.0))
                                    .rounded_full()
                                    .bg(if selected {
                                        theme.primary
                                    } else {
                                        theme.accent
                                    }),
                            )
                        })
                        .when_some(leading, |this, leading| {
                            this.child(
                                div()
                                    .flex_shrink_0()
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .child(leading),
                            )
                        })
                        .child(
                            div()
                                .flex_1()
                                .min_w_0()
                                .text_xs()
                                .font_weight(if selected {
                                    FontWeight::MEDIUM
                                } else {
                                    FontWeight::NORMAL
                                })
                                .text_color(if selected {
                                    theme.primary
                                } else {
                                    theme.muted_foreground
                                })
                                .whitespace_nowrap()
                                .overflow_hidden()
                                .text_ellipsis()
                                .child(label),
                        )
                        .when_some(trailing, |this, trailing| {
                            this.child(
                                div()
                                    .flex_shrink_0()
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .child(trailing),
                            )
                        })
                        .when(closable, |this| {
                            this.child(
                                div()
                                    .id(ElementId::Name(format!("tab-close-{}", id).into()))
                                    .size(px(14.0))
                                    .rounded(px(3.0))
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .hover(|s| s.bg(theme.border))
                                    .on_click(move |_: &ClickEvent, window, cx| {
                                        cx.stop_propagation();
                                        if let Some(on) = &on_close {
                                            on(&close_id, window, cx);
                                        }
                                    })
                                    .child(
                                        Phosphor::new(PhosphorIcon::X)
                                            .size(px(9.0))
                                            .color(theme.muted_foreground),
                                    ),
                            )
                        });

                    match context_menu {
                        Some(builder) => chip
                            .context_menu(move |menu, window, cx| builder(menu, window, cx))
                            .into_any_element(),
                        None => chip.into_any_element(),
                    }
                })),
        )
        .when_some(self.trailing, |this, trailing| {
            this.child(
                div()
                    .flex_shrink_0()
                    .flex()
                    .items_center()
                    .self_center()
                    .pl(px(4.0))
                    .child(trailing),
            )
        })
    }
}
