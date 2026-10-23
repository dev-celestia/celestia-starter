//! FileTree — interactive workspace directory hierarchy (web `ai/file-tree.tsx`).
//!
//! Presentational: the host owns expanded / selected path state and passes it
//! via builders. Nest [`FileTreeFolder`] / [`FileTreeFile`] with `.child(…)`.
//! For the generic gpui-component tree host, see [`crate::components::composite::tree`].

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, Context, ElementId, FontWeight, Hsla, InteractiveElement as _,
    IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, px,
};
use gpui_component::menu::{ContextMenuExt as _, PopupMenu};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;
type ContextMenuFn =
    Rc<dyn Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static>;

/// Root file-tree surface (web `FileTree`).
#[derive(IntoElement)]
pub struct FileTree {
    id: ElementId,
    style: StyleRefinement,
    children: Vec<AnyElement>,
    context_menu: Option<ContextMenuFn>,
    /// Inset around the rows (default: on). Off for a tree that owns its pane.
    padded: bool,
}

impl FileTree {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            children: Vec::new(),
            context_menu: None,
            padded: true,
        }
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }

    /// Draw the 8px inset around the rows (default: on).
    ///
    /// A tree that fills a panel edge-to-edge turns this off so the rows (and
    /// their selection pill) meet the panel border instead of floating inside it.
    pub fn padded(mut self, padded: bool) -> Self {
        self.padded = padded;
        self
    }

    /// Right-click menu for the tree background (empty area).
    pub fn context_menu(
        mut self,
        f: impl Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static,
    ) -> Self {
        self.context_menu = Some(Rc::new(f));
        self
    }
}

impl ParentElement for FileTree {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for FileTree {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for FileTree {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let id = self.id.clone();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .rounded(theme.radius)
            .border_1()
            .border_color(theme.border)
            .bg(theme.background)
            .font_family(theme.mono_font_family.clone())
            .text_sm()
            .overflow_hidden()
            .child(
                div()
                    .id(ElementId::Name(format!("{}-body", id).into()))
                    .w_full()
                    .when(self.padded, |this| this.p(px(8.0)))
                    .flex()
                    .flex_col()
                    .gap(px(0.))
                    .children(self.children),
            );
        root.style().refine(&self.style);
        match self.context_menu {
            Some(builder) => root
                .context_menu(move |menu, window, cx| builder(menu, window, cx))
                .into_any_element(),
            None => root.into_any_element(),
        }
    }
}

/// Expandable folder row + nested children (web `FileTreeFolder`).
#[derive(IntoElement)]
pub struct FileTreeFolder {
    id: ElementId,
    path: SharedString,
    name: SharedString,
    expanded: bool,
    selected: bool,
    /// Soften the label (e.g. gitignored paths).
    dimmed: bool,
    /// Override label color (e.g. git dirty status). Wins over [`Self::dimmed`].
    label_color: Option<Hsla>,
    on_toggle: Option<OnClick>,
    on_select: Option<OnClick>,
    actions: Option<AnyElement>,
    /// Custom folder mark (e.g. explorer-icon SVG). Replaces the Phosphor icon.
    mark: Option<AnyElement>,
    context_menu: Option<ContextMenuFn>,
    children: Vec<AnyElement>,
}

impl FileTreeFolder {
    /// `id` is typically the same string as `path` (stable ElementId).
    pub fn new(path: impl Into<SharedString>, name: impl Into<SharedString>) -> Self {
        let path = path.into();
        Self {
            id: ElementId::Name(path.clone()),
            path,
            name: name.into(),
            expanded: false,
            selected: false,
            dimmed: false,
            label_color: None,
            on_toggle: None,
            on_select: None,
            actions: None,
            mark: None,
            context_menu: None,
            children: Vec::new(),
        }
    }

    pub fn expanded(mut self, expanded: bool) -> Self {
        self.expanded = expanded;
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    /// Soften the label color (gitignored / excluded paths).
    pub fn dimmed(mut self, dimmed: bool) -> Self {
        self.dimmed = dimmed;
        self
    }

    /// Override the folder name color (e.g. git status tint).
    pub fn label_color(mut self, color: Hsla) -> Self {
        self.label_color = Some(color);
        self
    }

    /// Fired when the caret / expand control is clicked.
    pub fn on_toggle(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_toggle = Some(Rc::new(f));
        self
    }

    /// Fired when the folder label is clicked (select, not toggle).
    pub fn on_select(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(f));
        self
    }

    pub fn actions(mut self, actions: impl IntoElement) -> Self {
        self.actions = Some(actions.into_any_element());
        self
    }

    /// Custom folder mark (e.g. explorer-icon SVG). Replaces the Phosphor icon.
    pub fn mark(mut self, mark: impl IntoElement) -> Self {
        self.mark = Some(mark.into_any_element());
        self
    }

    /// Right-click menu for this folder row.
    pub fn context_menu(
        mut self,
        f: impl Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static,
    ) -> Self {
        self.context_menu = Some(Rc::new(f));
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for FileTreeFolder {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for FileTreeFolder {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let expanded = self.expanded;
        let selected = self.selected;
        let dimmed = self.dimmed;
        let name_color = self
            .label_color
            .unwrap_or(if dimmed {
                theme.muted_foreground
            } else {
                theme.foreground
            });
        let folder_icon = if expanded {
            PhosphorIcon::FolderOpen
        } else {
            PhosphorIcon::Folder
        };
        let caret = if expanded {
            PhosphorIcon::CaretDown
        } else {
            PhosphorIcon::CaretRight
        };
        let has_mark = self.mark.is_some();

        let row = div()
            .id(ElementId::Name(format!("{}-row", self.path).into()))
            .w_full()
            .h(px(22.0))
            .px(px(6.0))
            .rounded(px(2.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(4.0))
            .when(selected, |d| d.bg(theme.muted))
            .when(!selected, |d| d.hover(|s| s.bg(theme.muted.opacity(0.5))))
            .child(
                div()
                    .id(ElementId::Name(format!("{}-toggle", self.path).into()))
                    .size(px(16.0))
                    .flex()
                    .items_center()
                    .justify_center()
                    .cursor_pointer()
                    .flex_shrink_0()
                    .child(
                        Phosphor::new(caret)
                            .size(px(12.0))
                            .color(theme.muted_foreground),
                    )
                    .when_some(self.on_toggle, |d, on| {
                        d.on_click(move |e, w, cx| on(e, w, cx))
                    }),
            )
            .child(
                div()
                    .id(ElementId::Name(format!("{}-label", self.path).into()))
                    .flex_1()
                    .min_w_0()
                    .h_full()
                    .flex()
                    .flex_row()
                    .items_center()
                    .gap(px(4.0))
                    .cursor_pointer()
                    .when(dimmed, |d| d.opacity(0.5))
                    .when_some(self.on_select, |d, on| {
                        d.on_click(move |e, w, cx| on(e, w, cx))
                    })
                    .when_some(self.mark, |d, mark| d.child(mark))
                    .when(!has_mark, |d| {
                        d.child(Phosphor::new(folder_icon).size(px(14.0)).color(theme.info))
                    })
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(name_color)
                            .whitespace_nowrap()
                            .overflow_hidden()
                            .text_ellipsis()
                            .child(self.name),
                    ),
            )
            .when_some(self.actions, |d, actions| d.child(actions));

        let row = match self.context_menu {
            Some(builder) => row
                .context_menu(move |menu, window, cx| builder(menu, window, cx))
                .into_any_element(),
            None => row.into_any_element(),
        };

        div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_col()
            .child(row)
            .when(expanded && !self.children.is_empty(), |d| {
                d.child(
                    div()
                        .id(ElementId::Name(format!("{}-children", self.path).into()))
                        .w_full()
                        .ml(px(12.0))
                        .pl(px(8.0))
                        .border_l_1()
                        .border_color(theme.border)
                        .flex()
                        .flex_col()
                        .gap(px(0.))
                        .children(self.children),
                )
            })
    }
}

/// File leaf row (web `FileTreeFile`).
#[derive(IntoElement)]
pub struct FileTreeFile {
    id: ElementId,
    name: SharedString,
    selected: bool,
    /// Soften the label (e.g. gitignored paths).
    dimmed: bool,
    /// Override label color (e.g. git dirty status). Wins over [`Self::dimmed`].
    label_color: Option<Hsla>,
    icon: Option<PhosphorIcon>,
    /// Custom mark (SVG / image). Wins over [`Self::icon`] when set.
    mark: Option<AnyElement>,
    on_select: Option<OnClick>,
    actions: Option<AnyElement>,
    context_menu: Option<ContextMenuFn>,
}

impl FileTreeFile {
    /// `path` is used as the stable [`ElementId`] (same as web `path` prop).
    pub fn new(path: impl Into<SharedString>, name: impl Into<SharedString>) -> Self {
        let path = path.into();
        Self {
            id: ElementId::Name(path),
            name: name.into(),
            selected: false,
            dimmed: false,
            label_color: None,
            icon: None,
            mark: None,
            on_select: None,
            actions: None,
            context_menu: None,
        }
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    /// Soften the label color (gitignored / excluded paths).
    pub fn dimmed(mut self, dimmed: bool) -> Self {
        self.dimmed = dimmed;
        self
    }

    /// Override the file name color (e.g. git status tint).
    pub fn label_color(mut self, color: Hsla) -> Self {
        self.label_color = Some(color);
        self
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    /// Custom file mark (SVG / image). Wins over [`Self::icon`] when set.
    pub fn mark(mut self, mark: impl IntoElement) -> Self {
        self.mark = Some(mark.into_any_element());
        self
    }

    /// Right-click menu for this file row.
    pub fn context_menu(
        mut self,
        f: impl Fn(PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu + 'static,
    ) -> Self {
        self.context_menu = Some(Rc::new(f));
        self
    }

    pub fn on_select(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(f));
        self
    }

    pub fn actions(mut self, actions: impl IntoElement) -> Self {
        self.actions = Some(actions.into_any_element());
        self
    }
}

impl RenderOnce for FileTreeFile {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let selected = self.selected;
        let dimmed = self.dimmed;
        let name_color = self
            .label_color
            .unwrap_or(if dimmed {
                theme.muted_foreground
            } else {
                theme.foreground
            });
        let icon = self.icon.unwrap_or(PhosphorIcon::File);
        let has_mark = self.mark.is_some();

        let row = div()
            .id(self.id)
            .w_full()
            .h(px(22.0))
            .px(px(6.0))
            .rounded(px(2.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(4.0))
            .cursor_pointer()
            .when(selected, |d| d.bg(theme.muted))
            .when(!selected, |d| d.hover(|s| s.bg(theme.muted.opacity(0.5))))
            .when_some(self.on_select, |d, on| {
                d.on_click(move |e, w, cx| on(e, w, cx))
            })
            // Spacer aligns with folder caret column.
            .child(div().size(px(16.0)).flex_shrink_0())
            .when_some(self.mark, |d, mark| {
                d.child(div().when(dimmed, |m| m.opacity(0.5)).child(mark))
            })
            .when(!has_mark, |d| {
                d.child(
                    Phosphor::new(icon)
                        .size(px(14.0))
                        .color(if dimmed {
                            theme.muted_foreground.opacity(0.5)
                        } else {
                            theme.muted_foreground
                        }),
                )
            })
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_sm()
                    .font_weight(FontWeight::NORMAL)
                    .text_color(name_color)
                    .when(dimmed && self.label_color.is_none(), |d| d.opacity(0.85))
                    .whitespace_nowrap()
                    .overflow_hidden()
                    .text_ellipsis()
                    .child(self.name),
            )
            .when_some(self.actions, |d, actions| d.child(actions));

        match self.context_menu {
            Some(builder) => row
                .context_menu(move |menu, window, cx| builder(menu, window, cx))
                .into_any_element(),
            None => row.into_any_element(),
        }
    }
}

/// Trailing action slot that stops selection bubbling (web `FileTreeActions`).
#[derive(IntoElement)]
pub struct FileTreeActions {
    id: ElementId,
    children: Vec<AnyElement>,
}

impl FileTreeActions {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            children: Vec::new(),
        }
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl ParentElement for FileTreeActions {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for FileTreeActions {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        div()
            .id(self.id)
            .ml_auto()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(2.0))
            .flex_shrink_0()
            .children(self.children)
    }
}
