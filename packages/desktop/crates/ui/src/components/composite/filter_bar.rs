//! Filter bar — a segmented chip track with optional trailing controls.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, BoxShadow, ClickEvent, ElementId, FontWeight, InteractiveElement as _,
    IntoElement, ParentElement, Refineable as _, RenderOnce, SharedString,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, point, px,
};

use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// `shadow-xs` — the same 1px lift the segmented tabs give their active pill.
fn shadow_xs() -> BoxShadow {
    BoxShadow {
        offset: point(px(0.), px(1.)),
        blur_radius: px(2.),
        spread_radius: px(0.),
        inset: false,
        color: gpui::rgba(0x0000_000d).into(),
    }
}

/// A selectable filter chip.
///
/// Inside a [`FilterBar`] the chip is a segment of the track (transparent until
/// selected). On its own — a search token, for example — it is a filled pill,
/// with the selected state using the same primary wash as a selected list row.
#[derive(IntoElement)]
pub struct FilterChip {
    id: ElementId,
    label: SharedString,
    active: bool,
    /// Set by [`FilterBar`] so the chip paints as a track segment.
    segmented: bool,
    on_click: Option<OnClick>,
}

impl FilterChip {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            active: false,
            segmented: false,
            on_click: None,
        }
    }

    pub fn active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }
}

impl RenderOnce for FilterChip {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let active = self.active;
        let segmented = self.segmented;
        let is_dark = theme.mode.is_dark();

        // Selection is a surface, not a trailing check. A check after the label
        // makes the selected chip wider than its siblings and reads as an icon
        // that didn't fit.
        let (bg, border, text, shadow) = if segmented {
            if active {
                if is_dark {
                    (
                        theme.input.opacity(0.30),
                        theme.input.opacity(0.40),
                        theme.foreground,
                        None,
                    )
                } else {
                    (
                        theme.background,
                        theme.transparent,
                        theme.foreground,
                        Some(shadow_xs()),
                    )
                }
            } else {
                (
                    theme.transparent,
                    theme.transparent,
                    theme.muted_foreground,
                    None,
                )
            }
        } else if active {
            (theme.list_active, theme.primary, theme.primary, None)
        } else {
            (
                theme.secondary,
                theme.transparent,
                theme.secondary_foreground,
                None,
            )
        };

        div()
            .id(self.id)
            .h(px(26.0))
            .px(px(12.0))
            .flex()
            .flex_shrink_0()
            .flex_row()
            .items_center()
            .justify_center()
            .rounded_full()
            .border_1()
            .border_color(border)
            .bg(bg)
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(text)
            .whitespace_nowrap()
            .when_some(shadow.filter(|_| theme.shadow), |this, shadow| {
                this.shadow(vec![shadow])
            })
            .when(self.on_click.is_some(), |this| this.cursor_pointer())
            .when(!active, |this| {
                this.hover(move |style| {
                    if segmented {
                        style.text_color(theme.foreground)
                    } else {
                        style
                            .bg(theme.secondary_hover)
                            .text_color(theme.secondary_foreground)
                    }
                })
            })
            .when_some(self.on_click, |this, on| {
                this.on_click(move |e, window, cx| on(e, window, cx))
            })
            .child(self.label)
    }
}

/// A toolbar row of filter chips with optional trailing controls.
///
/// Chips sit in a muted track, the same treatment as a segmented tab list, so
/// the row reads as one control. Trailing actions stay outside the track.
#[derive(IntoElement)]
pub struct FilterBar {
    id: ElementId,
    style: StyleRefinement,
    chips: Vec<FilterChip>,
    trailing: Vec<AnyElement>,
}

impl FilterBar {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            chips: Vec::new(),
            trailing: Vec::new(),
        }
    }

    pub fn chip(mut self, mut chip: FilterChip) -> Self {
        chip.segmented = true;
        self.chips.push(chip);
        self
    }

    pub fn trailing(mut self, child: impl IntoElement) -> Self {
        self.trailing.push(child.into_any_element());
        self
    }
}

impl Styled for FilterBar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for FilterBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id)
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(12.0));
        root.style().refine(&self.style);

        root.when(!self.chips.is_empty(), |this| {
            this.child(
                div()
                    .flex()
                    .flex_row()
                    .flex_wrap()
                    .items_center()
                    .gap(px(2.0))
                    .p(px(3.0))
                    .rounded_full()
                    .bg(theme.muted)
                    .children(self.chips),
            )
        })
        .when(!self.trailing.is_empty(), |this| {
            this.child(
                div()
                    .ml_auto()
                    .flex()
                    .flex_row()
                    .items_center()
                    .gap(px(8.0))
                    .children(self.trailing),
            )
        })
    }
}
