//! Toolbar Menu — the desktop counterpart of
//! `packages/ui/src/components/composite/toolbar-menu.tsx`.
//!
//! A compact action strip for toolbars and side rails. Items can be icon-only
//! or icon + label, arranged horizontally or vertically, each with an
//! `on_click` handler.
//!
//! Written on raw gpui using the crate's [`Button`] and [`Separator`].

use std::rc::Rc;

use gpui::{
    AnyElement, App, Axis, ClickEvent, ElementId, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, Role, SharedString,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::components::primitive::icon::PhosphorIcon;
use crate::components::primitive::separator::Separator;
use crate::components::traits::{Sizable, Size, h_flex, v_flex};
use crate::theme::ActiveTheme as _;

/// Icon-only strip, or icon + visible label.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum ToolbarMenuAppearance {
    /// Square icon buttons; labels become tooltips / accessible names.
    #[default]
    Icon,
    /// Icon beside a visible text label.
    Labeled,
}

/// One action in a [`ToolbarMenu`].
#[derive(IntoElement)]
pub struct ToolbarMenuItem {
    id: ElementId,
    icon: PhosphorIcon,
    label: Option<SharedString>,
    tooltip: Option<SharedString>,
    active: bool,
    disabled: bool,
    on_click: Option<Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>>,
    /// Filled by the parent menu before render.
    appearance: ToolbarMenuAppearance,
    orientation: Axis,
    size: Size,
}

impl ToolbarMenuItem {
    pub fn new(id: impl Into<ElementId>, icon: PhosphorIcon) -> Self {
        Self {
            id: id.into(),
            icon,
            label: None,
            tooltip: None,
            active: false,
            disabled: false,
            on_click: None,
            appearance: ToolbarMenuAppearance::Icon,
            orientation: Axis::Horizontal,
            size: Size::default(),
        }
    }

    /// Visible when the menu uses [`ToolbarMenuAppearance::Labeled`];
    /// otherwise used as the tooltip / aria name.
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Override the native tooltip (defaults to the label string).
    pub fn tooltip(mut self, tooltip: impl Into<SharedString>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }

    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }

    fn with_menu_context(
        mut self,
        appearance: ToolbarMenuAppearance,
        orientation: Axis,
        size: Size,
    ) -> Self {
        self.appearance = appearance;
        self.orientation = orientation;
        self.size = size;
        self
    }
}

impl RenderOnce for ToolbarMenuItem {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let show_label = self.appearance == ToolbarMenuAppearance::Labeled && self.label.is_some();
        let tip = self
            .tooltip
            .clone()
            .or_else(|| self.label.clone())
            .unwrap_or_default();

        let mut button = if show_label {
            Button::new(self.id)
                .leading_icon(self.icon)
                .label(self.label.clone().unwrap_or_default())
                .variant(if self.active {
                    ButtonVariant::Secondary
                } else {
                    ButtonVariant::Ghost
                })
                .with_size(self.size)
        } else {
            Button::icon(self.id, self.icon)
                .size(icon_step(self.size))
                .variant(if self.active {
                    ButtonVariant::Secondary
                } else {
                    ButtonVariant::Ghost
                })
        };

        button = button.disabled(self.disabled);
        if !tip.is_empty() {
            button = button.tooltip(tip);
        }
        if let Some(on_click) = self.on_click {
            button = button.on_click(move |ev, window, cx| on_click(ev, window, cx));
        }

        // Vertical labeled strips stretch full width; icon-only stays centered.
        if self.orientation == Axis::Vertical && show_label {
            div().w_full().child(button).into_any_element()
        } else {
            button.into_any_element()
        }
    }
}

/// Hairline divider between toolbar items.
#[derive(IntoElement)]
pub struct ToolbarMenuSeparator {
    orientation: Option<Axis>,
    /// Filled by the parent menu when orientation is unset.
    menu_orientation: Axis,
}

impl ToolbarMenuSeparator {
    pub fn new() -> Self {
        Self {
            orientation: None,
            menu_orientation: Axis::Horizontal,
        }
    }

    /// Force the rule axis (defaults to the axis perpendicular to the menu).
    pub fn orientation(mut self, orientation: Axis) -> Self {
        self.orientation = Some(orientation);
        self
    }

    fn with_menu_orientation(mut self, menu_orientation: Axis) -> Self {
        self.menu_orientation = menu_orientation;
        self
    }
}

impl Default for ToolbarMenuSeparator {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for ToolbarMenuSeparator {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let axis = self.orientation.unwrap_or(match self.menu_orientation {
            Axis::Horizontal => Axis::Vertical,
            Axis::Vertical => Axis::Horizontal,
        });
        match axis {
            Axis::Vertical => Separator::vertical().h(px(16.)).into_any_element(),
            Axis::Horizontal => Separator::horizontal().w(px(16.)).into_any_element(),
        }
    }
}

enum ToolbarChild {
    Item(ToolbarMenuItem),
    Separator(ToolbarMenuSeparator),
}

/// Compact icon / labeled action strip — horizontal or vertical.
#[derive(IntoElement)]
pub struct ToolbarMenu {
    id: ElementId,
    style: StyleRefinement,
    orientation: Axis,
    appearance: ToolbarMenuAppearance,
    size: Size,
    children: Vec<ToolbarChild>,
}

impl ToolbarMenu {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            orientation: Axis::Horizontal,
            appearance: ToolbarMenuAppearance::Icon,
            size: Size::default(),
            children: Vec::new(),
        }
    }

    pub fn orientation(mut self, orientation: Axis) -> Self {
        self.orientation = orientation;
        self
    }

    pub fn horizontal(mut self) -> Self {
        self.orientation = Axis::Horizontal;
        self
    }

    pub fn vertical(mut self) -> Self {
        self.orientation = Axis::Vertical;
        self
    }

    pub fn appearance(mut self, appearance: ToolbarMenuAppearance) -> Self {
        self.appearance = appearance;
        self
    }

    pub fn icon_only(mut self) -> Self {
        self.appearance = ToolbarMenuAppearance::Icon;
        self
    }

    pub fn labeled(mut self) -> Self {
        self.appearance = ToolbarMenuAppearance::Labeled;
        self
    }

    pub fn item(mut self, item: ToolbarMenuItem) -> Self {
        self.children.push(ToolbarChild::Item(item));
        self
    }

    pub fn separator(mut self) -> Self {
        self.children
            .push(ToolbarChild::Separator(ToolbarMenuSeparator::new()));
        self
    }

    pub fn separator_item(mut self, separator: ToolbarMenuSeparator) -> Self {
        self.children.push(ToolbarChild::Separator(separator));
        self
    }
}

impl Sizable for ToolbarMenu {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Styled for ToolbarMenu {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for ToolbarMenu {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let appearance = self.appearance;
        let orientation = self.orientation;
        let size = self.size;

        let children: Vec<AnyElement> = self
            .children
            .into_iter()
            .map(|child| match child {
                ToolbarChild::Item(item) => item
                    .with_menu_context(appearance, orientation, size)
                    .into_any_element(),
                ToolbarChild::Separator(sep) => sep
                    .with_menu_orientation(orientation)
                    .into_any_element(),
            })
            .collect();

        let layout = match orientation {
            Axis::Horizontal => h_flex(),
            Axis::Vertical => v_flex(),
        };

        let mut root = layout
            .id(self.id)
            .role(Role::Toolbar)
            .items_center()
            .gap(px(2.))
            .p(px(2.))
            .rounded(cx.theme().radius)
            .border_1()
            .border_color(cx.theme().border.opacity(0.7))
            .bg(cx.theme().background)
            .children(children);

        if orientation == Axis::Vertical {
            root = root.items_stretch();
        }

        root.style().refine(&self.style);
        root
    }
}

fn icon_step(size: Size) -> ButtonSize {
    match size {
        Size::XSmall => ButtonSize::IconXs,
        Size::Small => ButtonSize::IconSm,
        Size::Large => ButtonSize::IconLg,
        _ => ButtonSize::IconSm,
    }
}

#[cfg(test)]
mod tests {
    use gpui::{Context, IntoElement, ParentElement as _, Render, TestAppContext, Window, div};

    use super::*;

    struct TestView;

    impl Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .gap(px(8.))
                .child(
                    ToolbarMenu::new("tm-icon")
                        .icon_only()
                        .item(
                            ToolbarMenuItem::new("refresh", PhosphorIcon::ArrowClockwise)
                                .label("Refresh")
                                .on_click(|_, _, _| {}),
                        )
                        .separator()
                        .item(
                            ToolbarMenuItem::new("trash", PhosphorIcon::Trash)
                                .label("Delete")
                                .active(true),
                        ),
                )
                .child(
                    ToolbarMenu::new("tm-labeled")
                        .labeled()
                        .vertical()
                        .item(
                            ToolbarMenuItem::new("filter", PhosphorIcon::Funnel).label("Filter"),
                        )
                        .item(
                            ToolbarMenuItem::new("export", PhosphorIcon::Export).label("Export"),
                        ),
                )
        }
    }

    #[gpui::test]
    fn toolbar_menu_renders_without_panic(cx: &mut TestAppContext) {
        cx.update(crate::init);
        let _window = cx.add_window(|_, _| TestView);
    }
}
