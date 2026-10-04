//! Celestia tabs — the desktop counterpart of
//! `packages/ui/src/components/primitive/tabs.tsx`.
//!
//! Mirrors shadcn tabs with two variants:
//! - [`TabsVariant::Default`]: segmented pill track (`bg-muted` track, floating
//!   `bg-background` + `shadow-xs` active pill in light mode, `bg-input/35` +
//!   `border-input` in dark mode).
//! - [`TabsVariant::Line`]: underline line track with subtle border-b separator
//!   and active underline indicator bar.
//!
//! Three standard sizes:
//! - [`TabsSize::Small`]: 24px height (`h-6`), 11px font size.
//! - [`TabsSize::Default`]: 30px height (`h-7.5`), 12px font size.
//! - [`TabsSize::Large`]: 36px height (`h-9`), 13px font size.
//!
//! Re-exports [`Tab`] and [`TabBar`] from `gpui-kit` for full backward compatibility.

use std::rc::Rc;

use gpui_kit::assets::IconName;
use gpui_kit::component::{ActiveTheme, Disableable, Icon, Selectable, h_flex, v_flex};
use gpui_kit::{
    AnyElement, App, BoxShadow, ClickEvent, ElementId, FontWeight, InteractiveElement, IntoElement,
    ParentElement, RenderOnce, SharedString, StatefulInteractiveElement, Styled, Window, div,
    point, px,
};

pub use gpui_kit::component::tab::{Tab, TabBar};

/// Visual presentation style of the tabs list.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum TabsVariant {
    /// Segmented pill track (`bg-muted` track, floating `bg-background` active pill with shadow-xs).
    #[default]
    Default,
    /// Underline line track with bottom border indicator line (`variant="line"` in shadcn).
    Line,
}

/// Height and padding scale for tabs.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum TabsSize {
    /// 24px height, compact (web `sm`).
    Small,
    /// 30px height (web `default` / `h-7.5`).
    #[default]
    Default,
    /// 36px height (web `lg` / `h-9`).
    Large,
}

/// Orientation of the tabs container.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum TabsOrientation {
    #[default]
    Horizontal,
    Vertical,
}

/// The root tabs container (mirrors web `<Tabs>`).
#[derive(IntoElement)]
pub struct Tabs {
    id: ElementId,
    orientation: TabsOrientation,
    children: Vec<AnyElement>,
}

impl Tabs {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            orientation: TabsOrientation::default(),
            children: Vec::new(),
        }
    }

    pub fn orientation(mut self, orientation: TabsOrientation) -> Self {
        self.orientation = orientation;
        self
    }
}

impl ParentElement for Tabs {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for Tabs {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        let el = match self.orientation {
            TabsOrientation::Horizontal => v_flex().gap_2(),
            TabsOrientation::Vertical => h_flex().gap_2(),
        };
        el.id(self.id).children(self.children)
    }
}

/// Track container grouping tab triggers (mirrors web `<TabsList>`).
#[derive(IntoElement)]
pub struct TabsList {
    id: ElementId,
    variant: TabsVariant,
    size: TabsSize,
    children: Vec<AnyElement>,
}

impl TabsList {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            variant: TabsVariant::default(),
            size: TabsSize::default(),
            children: Vec::new(),
        }
    }

    pub fn variant(mut self, variant: TabsVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn size(mut self, size: TabsSize) -> Self {
        self.size = size;
        self
    }
}

impl ParentElement for TabsList {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TabsList {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let height = match self.size {
            TabsSize::Small => px(24.),
            TabsSize::Default => px(30.),
            TabsSize::Large => px(36.),
        };

        match self.variant {
            TabsVariant::Default => h_flex()
                .id(self.id)
                .h(height)
                .p(px(3.))
                .gap(px(2.))
                .items_center()
                .justify_center()
                .rounded(theme.radius)
                .bg(theme.muted)
                .children(self.children),
            TabsVariant::Line => h_flex()
                .id(self.id)
                .h(height)
                .gap(px(4.))
                .items_end()
                .border_b_1()
                .border_color(theme.border.opacity(0.5))
                .bg(theme.transparent)
                .children(self.children),
        }
    }
}

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// Individual tab trigger button (mirrors web `<TabsTrigger>`).
#[derive(IntoElement)]
pub struct TabsTrigger {
    id: ElementId,
    label: Option<SharedString>,
    icon: Option<IconName>,
    selected: bool,
    disabled: bool,
    variant: TabsVariant,
    size: TabsSize,
    on_click: Option<ClickHandler>,
    children: Vec<AnyElement>,
}

impl TabsTrigger {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            label: None,
            icon: None,
            selected: false,
            disabled: false,
            variant: TabsVariant::default(),
            size: TabsSize::default(),
            on_click: None,
            children: Vec::new(),
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn icon(mut self, icon: IconName) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn variant(mut self, variant: TabsVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn size(mut self, size: TabsSize) -> Self {
        self.size = size;
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
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
}

impl Selectable for TabsTrigger {
    fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    fn is_selected(&self) -> bool {
        self.selected
    }
}

impl Disableable for TabsTrigger {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl ParentElement for TabsTrigger {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TabsTrigger {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let is_dark = theme.mode.is_dark();

        let (font_size, px_pad, icon_size) = match self.size {
            TabsSize::Small => (px(11.), px(8.), px(12.)),
            TabsSize::Default => (px(12.), px(10.), px(14.)),
            TabsSize::Large => (px(13.), px(14.), px(16.)),
        };

        let mut el = div()
            .id(self.id)
            .h_full()
            .px(px_pad)
            .gap(px(6.))
            .flex()
            .items_center()
            .justify_center()
            .whitespace_nowrap()
            .text_size(font_size);

        if self.disabled {
            el = el.opacity(0.5).cursor_not_allowed();
        } else {
            el = el.cursor_pointer();
            if let Some(on_click) = self.on_click {
                el = el.on_click(move |event, window, cx| on_click(event, window, cx));
            }
        }

        match self.variant {
            TabsVariant::Default => {
                el = el.rounded(px(6.));
                if self.selected {
                    let shadow = BoxShadow {
                        offset: point(px(0.), px(1.)),
                        blur_radius: px(2.),
                        spread_radius: px(0.),
                        inset: false,
                        color: gpui_kit::rgba(0x0000_0012).into(),
                    };
                    if is_dark {
                        el = el
                            .bg(theme.input.opacity(0.35))
                            .border_1()
                            .border_color(theme.border)
                            .text_color(theme.foreground)
                            .font_weight(FontWeight::MEDIUM);
                    } else {
                        el = el
                            .bg(theme.background)
                            .border_1()
                            .border_color(theme.border.opacity(0.2))
                            .shadow(vec![shadow])
                            .text_color(theme.foreground)
                            .font_weight(FontWeight::MEDIUM);
                    }
                } else {
                    el = el
                        .bg(theme.transparent)
                        .border_1()
                        .border_color(theme.transparent)
                        .text_color(theme.muted_foreground);
                    if !self.disabled {
                        el = el.hover(|style| style.text_color(theme.foreground));
                    }
                }
            }
            TabsVariant::Line => {
                el = el.rounded_none();
                if self.selected {
                    el = el
                        .border_b_2()
                        .border_color(theme.foreground)
                        .text_color(theme.foreground)
                        .font_weight(FontWeight::MEDIUM);
                } else {
                    el = el
                        .border_b_2()
                        .border_color(theme.transparent)
                        .text_color(theme.muted_foreground);
                    if !self.disabled {
                        el = el.hover(|style| style.text_color(theme.foreground));
                    }
                }
            }
        }

        if let Some(icon) = self.icon {
            let icon_color = if self.selected {
                theme.foreground
            } else {
                theme.muted_foreground
            };
            el = el.child(Icon::new(icon).size(icon_size).text_color(icon_color));
        }

        if let Some(label) = self.label {
            el = el.child(label);
        }

        el.children(self.children)
    }
}

/// Content panel rendered for a specific tab (mirrors web `<TabsContent>`).
#[derive(IntoElement)]
pub struct TabsContent {
    id: ElementId,
    visible: bool,
    children: Vec<AnyElement>,
}

impl TabsContent {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            visible: true,
            children: Vec::new(),
        }
    }

    pub fn visible(mut self, visible: bool) -> Self {
        self.visible = visible;
        self
    }
}

impl ParentElement for TabsContent {
    fn extend(&mut self, children: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(children);
    }
}

impl RenderOnce for TabsContent {
    fn render(self, _: &mut Window, _cx: &mut App) -> impl IntoElement {
        if !self.visible {
            return div().id(self.id).into_any_element();
        }
        div()
            .id(self.id)
            .w_full()
            .text_xs()
            .line_height(px(18.0))
            .children(self.children)
            .into_any_element()
    }
}
