//! Command palette — searchable action list (spotlight-style surface).
//!
//! Presentational: pass a query string and filtered items; the host owns the
//! input entity and open/close state.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};
// StatefulInteractiveElement provides overflow_*_scroll after `.id(...)`.

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::primitive::kbd::Kbd;
use crate::theme::ActiveTheme as _;

type OnItemSelect = Rc<dyn Fn(&mut Window, &mut App) + 'static>;
type OnPaletteSelect = Rc<dyn Fn(&SharedString, &mut Window, &mut App) + 'static>;

/// One actionable row in a [`CommandPalette`].
pub struct CommandPaletteItem {
    pub id: SharedString,
    pub label: SharedString,
    pub hint: Option<SharedString>,
    pub icon: Option<PhosphorIcon>,
    pub shortcut: Option<gpui::Keystroke>,
    pub disabled: bool,
    on_select: Option<OnItemSelect>,
}

impl CommandPaletteItem {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            hint: None,
            icon: None,
            shortcut: None,
            disabled: false,
            on_select: None,
        }
    }

    pub fn hint(mut self, hint: impl Into<SharedString>) -> Self {
        self.hint = Some(hint.into());
        self
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn shortcut(mut self, stroke: gpui::Keystroke) -> Self {
        self.shortcut = Some(stroke);
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_select(mut self, f: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(f));
        self
    }
}

/// Spotlight-style command surface: search slot + scrollable results.
#[derive(IntoElement)]
pub struct CommandPalette {
    id: ElementId,
    style: StyleRefinement,
    search: Option<AnyElement>,
    items: Vec<CommandPaletteItem>,
    empty_label: SharedString,
    selected_index: Option<usize>,
    on_select: Option<OnPaletteSelect>,
}

impl CommandPalette {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            search: None,
            items: Vec::new(),
            empty_label: "No matching commands".into(),
            selected_index: None,
            on_select: None,
        }
    }

    pub fn search(mut self, search: impl IntoElement) -> Self {
        self.search = Some(search.into_any_element());
        self
    }

    pub fn item(mut self, item: CommandPaletteItem) -> Self {
        self.items.push(item);
        self
    }

    pub fn items(mut self, items: impl IntoIterator<Item = CommandPaletteItem>) -> Self {
        self.items.extend(items);
        self
    }

    pub fn empty_label(mut self, label: impl Into<SharedString>) -> Self {
        self.empty_label = label.into();
        self
    }

    pub fn selected_index(mut self, index: Option<usize>) -> Self {
        self.selected_index = index;
        self
    }

    /// Called with the item id when a non-disabled row is clicked.
    /// Fires in addition to any per-item [`CommandPaletteItem::on_select`].
    pub fn on_select(mut self, f: impl Fn(&SharedString, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(f));
        self
    }
}

impl Styled for CommandPalette {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for CommandPalette {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let empty = self.items.is_empty();
        let has_search = self.search.is_some();

        let mut root = div()
            .id(self.id)
            .w(px(480.0))
            .max_h(px(420.0))
            .flex()
            .flex_col()
            .rounded(theme.radius_xl())
            .border_1()
            .border_color(theme.border)
            .bg(theme.popover)
            .shadow_md();
        root.style().refine(&self.style);

        root.child(
            div()
                .flex()
                .flex_row()
                .items_center()
                .gap(px(10.0))
                .px(px(14.0))
                .py(px(12.0))
                .border_b_1()
                .border_color(theme.border)
                .child(
                    Phosphor::new(PhosphorIcon::MagnifyingGlass)
                        .size(px(16.0))
                        .color(theme.muted_foreground),
                )
                .child(
                    div()
                        .flex_1()
                        .min_w_0()
                        .when_some(self.search, |this, search| this.child(search))
                        .when(!has_search, |this| {
                            this.child(
                                div()
                                    .text_sm()
                                    .text_color(theme.muted_foreground)
                                    .child("Type a command…"),
                            )
                        }),
                ),
        )
        .child(
            div()
                .id("command-palette-results")
                .flex_1()
                .min_h_0()
                .overflow_y_scroll()
                .py(px(6.0))
                .when(empty, |this| {
                    this.child(
                        div()
                            .px(px(14.0))
                            .py(px(20.0))
                            .text_sm()
                            .text_color(theme.muted_foreground)
                            .child(self.empty_label),
                    )
                })
                .children(self.items.into_iter().enumerate().map(|(ix, item)| {
                    let selected = self.selected_index == Some(ix);
                    let disabled = item.disabled;
                    let item_on_select = item.on_select.clone();
                    let palette_on_select = self.on_select.clone();
                    let item_id = item.id.clone();
                    div()
                        .id(ElementId::Name(format!("cmd-{}", item.id).into()))
                        .mx(px(6.0))
                        .px(px(10.0))
                        .py(px(8.0))
                        .rounded(theme.radius)
                        .flex()
                        .flex_row()
                        .items_center()
                        .gap(px(10.0))
                        .bg(if selected {
                            theme.accent.opacity(0.12)
                        } else {
                            theme.transparent
                        })
                        .when(!disabled, |this| {
                            this.cursor_pointer()
                                .hover(|s| {
                                    if selected {
                                        s.bg(theme.accent.opacity(0.18))
                                    } else {
                                        s.bg(theme.muted)
                                    }
                                })
                                .active(|s| s.bg(theme.accent.opacity(0.22)))
                        })
                        .when(disabled, |this| this.opacity(0.5))
                        .when(!disabled, |this| {
                            this.on_click(move |_, window, cx| {
                                if let Some(on) = &item_on_select {
                                    on(window, cx);
                                }
                                if let Some(on) = &palette_on_select {
                                    on(&item_id, window, cx);
                                }
                            })
                        })
                        .when_some(item.icon, |this, icon| {
                            this.child(Phosphor::new(icon).size(px(14.0)).color(if selected {
                                theme.accent
                            } else {
                                theme.muted_foreground
                            }))
                        })
                        .child(
                            div()
                                .flex_1()
                                .min_w_0()
                                .flex()
                                .flex_col()
                                .gap(px(2.0))
                                .child(
                                    div()
                                        .text_sm()
                                        .font_weight(FontWeight::MEDIUM)
                                        .text_color(theme.foreground)
                                        .child(item.label),
                                )
                                .when_some(item.hint, |this, hint| {
                                    this.child(
                                        div()
                                            .text_xs()
                                            .text_color(theme.muted_foreground)
                                            .child(hint),
                                    )
                                }),
                        )
                        .when_some(item.shortcut, |this, stroke| {
                            this.child(Kbd::new(stroke).outline())
                        })
                })),
        )
    }
}
