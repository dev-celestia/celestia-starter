//! File browser — dual-pane shell with breadcrumbs, tree slot, and list slot.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Pixels, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

/// One row in the file list pane.
#[derive(IntoElement)]
pub struct FileBrowserRow {
    id: ElementId,
    name: SharedString,
    meta: Option<SharedString>,
    is_dir: bool,
    selected: bool,
}

impl FileBrowserRow {
    pub fn new(id: impl Into<ElementId>, name: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            meta: None,
            is_dir: false,
            selected: false,
        }
    }

    pub fn meta(mut self, meta: impl Into<SharedString>) -> Self {
        self.meta = Some(meta.into());
        self
    }

    pub fn directory(mut self, is_dir: bool) -> Self {
        self.is_dir = is_dir;
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }
}

impl RenderOnce for FileBrowserRow {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let icon = if self.is_dir {
            PhosphorIcon::Folder
        } else {
            PhosphorIcon::File
        };
        div()
            .id(self.id)
            .w_full()
            .h(px(28.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .px(px(8.0))
            .rounded(px(6.0))
            .bg(if self.selected {
                theme.accent.opacity(0.12)
            } else {
                theme.transparent
            })
            .hover(|s| s.bg(theme.muted))
            .child(Phosphor::new(icon).size(px(14.0)).color(if self.is_dir {
                theme.accent
            } else {
                theme.muted_foreground
            }))
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_sm()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.foreground)
                    .whitespace_nowrap()
                    .overflow_hidden()
                    .text_ellipsis()
                    .child(self.name),
            )
            .when_some(self.meta, |this, meta| {
                this.child(
                    div()
                        .text_xs()
                        .text_color(theme.muted_foreground)
                        .child(meta),
                )
            })
    }
}

/// Dual-pane file browser chrome: breadcrumb + tree + list.
#[derive(IntoElement)]
pub struct FileBrowser {
    id: ElementId,
    style: StyleRefinement,
    breadcrumb: Option<AnyElement>,
    tree: Option<AnyElement>,
    tree_width: Pixels,
    rows: Vec<AnyElement>,
    toolbar: Option<AnyElement>,
}

impl FileBrowser {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            breadcrumb: None,
            tree: None,
            tree_width: px(200.0),
            rows: Vec::new(),
            toolbar: None,
        }
    }

    pub fn breadcrumb(mut self, breadcrumb: impl IntoElement) -> Self {
        self.breadcrumb = Some(breadcrumb.into_any_element());
        self
    }

    pub fn tree(mut self, tree: impl IntoElement) -> Self {
        self.tree = Some(tree.into_any_element());
        self
    }

    pub fn tree_width(mut self, width: impl Into<Pixels>) -> Self {
        self.tree_width = width.into();
        self
    }

    pub fn toolbar(mut self, toolbar: impl IntoElement) -> Self {
        self.toolbar = Some(toolbar.into_any_element());
        self
    }

    pub fn row(mut self, row: impl IntoElement) -> Self {
        self.rows.push(row.into_any_element());
        self
    }
}

impl Styled for FileBrowser {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for FileBrowser {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_tree = self.tree.is_some();
        let mut root = div()
            .id(self.id)
            .w_full()
            .h(px(320.0))
            .flex()
            .flex_col()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background)
            .overflow_hidden();
        root.style().refine(&self.style);

        root.when_some(self.breadcrumb, |this, crumb| {
            this.child(
                div()
                    .px(px(8.0))
                    .py(px(6.0))
                    .border_b_1()
                    .border_color(theme.border)
                    .child(crumb),
            )
        })
        .when_some(self.toolbar, |this, toolbar| {
            this.child(
                div()
                    .px(px(8.0))
                    .py(px(6.0))
                    .border_b_1()
                    .border_color(theme.border)
                    .child(toolbar),
            )
        })
        .child(
            div()
                .flex_1()
                .min_h_0()
                .flex()
                .flex_row()
                .child(
                    div()
                        .id("file-browser-tree")
                        .w(self.tree_width)
                        .flex_none()
                        .h_full()
                        .border_r_1()
                        .border_color(theme.border)
                        .p(px(8.0))
                        .overflow_y_scroll()
                        .when_some(self.tree, |this, tree| this.child(tree))
                        .when(!has_tree, |this| {
                            this.child(
                                div()
                                    .text_xs()
                                    .text_color(theme.muted_foreground)
                                    .child("Tree"),
                            )
                        }),
                )
                .child(
                    div()
                        .id("file-browser-list")
                        .flex_1()
                        .min_w_0()
                        .h_full()
                        .p(px(6.0))
                        .overflow_y_scroll()
                        .flex()
                        .flex_col()
                        .gap(px(2.0))
                        .children(self.rows),
                ),
        )
    }
}
