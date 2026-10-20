//! Chip — a compact, optionally dismissible tag.
//!
//! Distinct from [`Badge`](super::badge::Badge): chips are interactive (select /
//! dismiss) and commonly used in filter bars and token fields. No dedicated web
//! file; closest web cousins are filter chips assembled ad hoc.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::traits::{Disableable, Sizable, Size};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;
type OnDismiss = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Visual weight of a [`Chip`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ChipVariant {
    #[default]
    Default,
    Outline,
    Soft,
}

/// A compact tag with optional leading icon, selection, and dismiss.
#[derive(IntoElement)]
pub struct Chip {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    variant: ChipVariant,
    size: Size,
    selected: bool,
    disabled: bool,
    icon: Option<PhosphorIcon>,
    on_click: Option<OnClick>,
    on_dismiss: Option<OnDismiss>,
    children: Vec<AnyElement>,
}

impl Chip {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            variant: ChipVariant::default(),
            size: Size::Medium,
            selected: false,
            disabled: false,
            icon: None,
            on_click: None,
            on_dismiss: None,
            children: Vec::new(),
        }
    }

    pub fn variant(mut self, variant: ChipVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn outline(mut self) -> Self {
        self.variant = ChipVariant::Outline;
        self
    }

    pub fn soft(mut self) -> Self {
        self.variant = ChipVariant::Soft;
        self
    }

    pub fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }

    pub fn icon(mut self, icon: PhosphorIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }

    pub fn on_dismiss(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_dismiss = Some(Rc::new(f));
        self
    }
}

impl ParentElement for Chip {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Disableable for Chip {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Sizable for Chip {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Styled for Chip {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Chip {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (h, px_pad, text, icon_sz) = match self.size {
            Size::XSmall | Size::Small => (px(22.0), px(8.0), px(11.0), px(11.0)),
            Size::Large => (px(30.0), px(12.0), px(13.0), px(14.0)),
            _ => (px(26.0), px(10.0), px(12.0), px(12.0)),
        };
        let selected = self.selected;
        let disabled = self.disabled;
        let dismissable = self.on_dismiss.is_some();

        let (bg, fg, border) = match (self.variant, selected) {
            (_, true) => (
                theme.accent.opacity(0.16),
                theme.accent,
                theme.accent.opacity(0.32),
            ),
            (ChipVariant::Default, false) => (theme.muted, theme.foreground, theme.transparent),
            (ChipVariant::Outline, false) => (theme.background, theme.foreground, theme.border),
            (ChipVariant::Soft, false) => (
                theme.accent.opacity(0.08),
                theme.foreground,
                theme.transparent,
            ),
        };

        let mut root = div()
            .id(self.id.clone())
            .h(h)
            .px(px_pad)
            .flex()
            .flex_row()
            .items_center()
            .gap(px(4.0))
            .rounded_full()
            .bg(bg)
            .border_1()
            .border_color(border)
            .text_size(text)
            .font_weight(FontWeight::MEDIUM)
            .text_color(fg)
            .whitespace_nowrap()
            .when(disabled, |this| this.opacity(0.5))
            .when(!disabled && self.on_click.is_some(), |this| {
                this.cursor_pointer().hover(|s| s.bg(theme.muted))
            });
        root.style().refine(&self.style);

        root.when(!disabled, |this| {
            let on = self.on_click.clone();
            this.on_click(move |e: &ClickEvent, window, cx| {
                if let Some(on) = &on {
                    on(e, window, cx);
                }
            })
        })
        .when_some(self.icon, |this, icon| {
            this.child(Phosphor::new(icon).size(icon_sz).color(fg))
        })
        .child(self.label)
        .children(self.children)
        .when(dismissable, |this| {
            let on = self.on_dismiss.clone();
            this.child(
                div()
                    .id(ElementId::Name(format!("{}-x", self.id).into()))
                    .size(px(16.0))
                    .ml(px(2.0))
                    .rounded_full()
                    .flex()
                    .items_center()
                    .justify_center()
                    .cursor_pointer()
                    .hover(|s| s.bg(theme.background.opacity(0.5)))
                    .when(!disabled, |d| {
                        d.on_click(move |e: &ClickEvent, window, cx| {
                            if let Some(on) = &on {
                                on(e, window, cx);
                            }
                        })
                    })
                    .child(Phosphor::new(PhosphorIcon::X).size(px(10.0)).color(fg)),
            )
        })
    }
}
