//! Star rating — the desktop counterpart of gpui-component's `Rating`,
//! reimplemented on raw `gpui`. The web has no rating primitive, so this is a
//! desktop-only control.
//!
//! Interaction state lives in a keyed window state (`window.use_keyed_state`),
//! not in the component struct: `Rating` is `RenderOnce`, so the hovered and
//! selected values have to survive between frames somewhere. The `value` prop
//! stays the source of truth — when the caller's value differs from the stored
//! default, the stored state resets, so an external change wins over a click.
//!
//! The star is a Phosphor glyph: `Star` at the regular weight when empty,
//! `StarFill` at the fill weight when filled. It inherits the surrounding text
//! colour, so the active colour is set once on the row rather than per star.
//!
//! [`RatingSize`] replaces gpui-component's shared `Sizable` / `Size`, which
//! this crate does not depend on. It mirrors the icon ladder those traits
//! produced (14 / 16 / 24px) because the star is an SVG and its box is what the
//! caller is really choosing.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, Hsla, InteractiveElement as _, IntoElement, ParentElement as _,
    Pixels, Refineable as _, RenderOnce, StatefulInteractiveElement as _, StyleRefinement, Styled,
    Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon, PhosphorWeight};
use crate::theme::ActiveTheme as _;

/// Star size. Mirrors gpui-component's icon ladder.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum RatingSize {
    /// A 14px star.
    Small,
    /// A 16px star.
    #[default]
    Medium,
    /// A 24px star.
    Large,
}

impl RatingSize {
    /// The star glyph box, in pixels.
    pub fn px(self) -> Pixels {
        match self {
            RatingSize::Small => px(14.0),
            RatingSize::Medium => px(16.0),
            RatingSize::Large => px(24.0),
        }
    }
}

/// Pointer and selection state of one rating, persisted per element id between
/// frames.
#[derive(Default)]
struct RatingState {
    /// The `value` prop the state was initialised with, so an external change
    /// can be told apart from the widget's own selection.
    default_value: usize,
    /// The currently selected value.
    value: usize,
    /// The star index the pointer is over, or 0 once it has left.
    hovered_value: usize,
}

/// Called with the new rating value when the selection changes.
type OnRatingChange = Rc<dyn Fn(&usize, &mut Window, &mut App) + 'static>;

/// A star rating control.
#[derive(IntoElement)]
pub struct Rating {
    id: ElementId,
    style: StyleRefinement,
    size: RatingSize,
    disabled: bool,
    value: usize,
    max: usize,
    color: Option<Hsla>,
    on_click: Option<OnRatingChange>,
}

impl Rating {
    /// Create a new rating with an `ElementId`.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            size: RatingSize::default(),
            disabled: false,
            value: 0,
            max: 5,
            color: None,
            on_click: None,
        }
    }

    /// Set the star size.
    pub fn with_size(mut self, size: RatingSize) -> Self {
        self.size = size;
        self
    }

    /// Set the star size (alias of [`Self::with_size`], matching the builder
    /// name the upstream control used).
    pub fn size(mut self, size: RatingSize) -> Self {
        self.size = size;
        self
    }

    /// Disable interaction. A disabled rating still renders its value.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Set the active star colour; defaults to `theme.yellow`.
    pub fn color(mut self, color: impl Into<Hsla>) -> Self {
        self.color = Some(color.into());
        self
    }

    /// Set the initial value (clamped to `0..=max`).
    pub fn value(mut self, value: usize) -> Self {
        self.value = value.min(self.max);
        self
    }

    /// Set the maximum number of stars, re-clamping the value.
    pub fn max(mut self, max: usize) -> Self {
        self.max = max;
        self.value = self.value.min(max);
        self
    }

    /// Called with the new value whenever the selection changes. Clicking the
    /// star that is already the current value clears it (`ix - 1`).
    pub fn on_click(mut self, handler: impl Fn(&usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }
}

impl Styled for Rating {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Rating {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = self.id;
        let size = self.size;
        let disabled = self.disabled;
        let max = self.max;
        let default_value = self.value;
        let active_color = self.color.unwrap_or(cx.theme().yellow);
        let on_click = self.on_click.clone();

        let state = window.use_keyed_state(id.clone(), cx, |_, _| RatingState {
            default_value,
            value: default_value,
            hovered_value: 0,
        });

        // The `value` prop wins over a previous click.
        if state.read(cx).default_value != default_value {
            state.update(cx, |state, _| {
                state.default_value = default_value;
                state.value = default_value;
            });
        }
        let value = state.read(cx).value;

        let mut root = div().id(id).flex().flex_row().items_center();
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.on_hover(window.listener_for(&state, move |state, hovered, _, cx| {
            if !hovered {
                state.hovered_value = 0;
                cx.notify();
            }
        }))
        .map(|mut this| {
            for ix in 1..=max {
                let filled = ix <= value;
                let hovered = state.read(cx).hovered_value >= ix;
                let weight = if filled {
                    PhosphorWeight::Fill
                } else {
                    PhosphorWeight::Regular
                };

                this = this.child(
                    div()
                        .id(ix)
                        .p(px(2.0))
                        .flex_none()
                        .flex_shrink_0()
                        .when(filled || hovered, |this| this.text_color(active_color))
                        .child(
                            Phosphor::new(PhosphorIcon::Star)
                                .weight(weight)
                                .size(size.px()),
                        )
                        .when(!disabled, |this| {
                            this.on_mouse_move(window.listener_for(
                                &state,
                                move |state, _, _, cx| {
                                    state.hovered_value = ix;
                                    cx.notify();
                                },
                            ))
                            .on_click({
                                let state = state.clone();
                                let on_click = on_click.clone();
                                move |_: &ClickEvent, window, cx| {
                                    let new = if value >= ix {
                                        ix.saturating_sub(1)
                                    } else {
                                        ix
                                    };

                                    state.update(cx, |state, cx| {
                                        state.value = new;
                                        cx.notify();
                                    });

                                    if let Some(on_click) = &on_click {
                                        on_click(&new, window, cx);
                                    }
                                }
                            })
                        }),
                );
            }
            this
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sizes_follow_the_upstream_icon_ladder() {
        assert_eq!(RatingSize::Small.px(), px(14.0));
        assert_eq!(RatingSize::Medium.px(), px(16.0));
        assert_eq!(RatingSize::Large.px(), px(24.0));
        assert_eq!(RatingSize::default(), RatingSize::Medium);
    }

    /// `value` and `max` clamp against each other in both directions, so the
    /// render loop can never ask for a star index outside `1..=max`.
    #[test]
    fn value_and_max_clamp_each_other() {
        assert_eq!(Rating::new("r").value(9).value, 5);
        assert_eq!(Rating::new("r").max(3).value(9).value, 3);
        assert_eq!(Rating::new("r").value(4).max(2).value, 2);
    }

    #[test]
    fn a_fresh_rating_is_empty_over_five_stars() {
        let rating = Rating::new("r");
        assert_eq!(rating.value, 0);
        assert_eq!(rating.max, 5);
        assert!(!rating.disabled);
    }
}
