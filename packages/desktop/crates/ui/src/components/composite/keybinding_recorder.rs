//! Keybinding recorder — capture + display shortcuts with conflict state.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, Keystroke,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::components::primitive::kbd::Kbd;
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Recording / conflict state for a [`KeybindingRecorder`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum KeybindingState {
    #[default]
    Idle,
    Recording,
    Conflict,
}

/// A control that shows the current binding and enters a listening state.
#[derive(IntoElement)]
pub struct KeybindingRecorder {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    binding: Option<Keystroke>,
    state: KeybindingState,
    conflict_with: Option<SharedString>,
    on_start: Option<OnClick>,
    on_clear: Option<OnClick>,
}

impl KeybindingRecorder {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            binding: None,
            state: KeybindingState::default(),
            conflict_with: None,
            on_start: None,
            on_clear: None,
        }
    }

    pub fn binding(mut self, stroke: Option<Keystroke>) -> Self {
        self.binding = stroke;
        self
    }

    pub fn state(mut self, state: KeybindingState) -> Self {
        self.state = state;
        self
    }

    pub fn conflict_with(mut self, name: impl Into<SharedString>) -> Self {
        self.conflict_with = Some(name.into());
        self.state = KeybindingState::Conflict;
        self
    }

    pub fn on_start_recording(
        mut self,
        f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_start = Some(Rc::new(f));
        self
    }

    pub fn on_clear(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_clear = Some(Rc::new(f));
        self
    }
}

impl Styled for KeybindingRecorder {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for KeybindingRecorder {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let recording = matches!(self.state, KeybindingState::Recording);
        let conflict = matches!(self.state, KeybindingState::Conflict);
        let has_binding = self.binding.is_some();
        let border = if conflict {
            theme.danger.opacity(0.5)
        } else if recording {
            theme.accent.opacity(0.6)
        } else {
            theme.border
        };

        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(12.0));
        root.style().refine(&self.style);

        root.child(
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
                        .child(self.label),
                )
                .when_some(self.conflict_with, |this, name| {
                    this.child(
                        div()
                            .text_xs()
                            .text_color(theme.danger)
                            .child(format!("Conflicts with {name}")),
                    )
                })
                .when(recording, |this| {
                    this.child(
                        div()
                            .text_xs()
                            .text_color(theme.accent)
                            .child("Press a key combination…"),
                    )
                }),
        )
        .child(
            div()
                .id(ElementId::Name(format!("{}-cap", self.id).into()))
                .h(px(28.0))
                .min_w(px(120.0))
                .flex()
                .flex_row()
                .items_center()
                .justify_center()
                .gap(px(6.0))
                .px(px(10.0))
                .rounded(theme.radius)
                .border_1()
                .border_color(border)
                .bg(if recording {
                    theme.accent.opacity(0.08)
                } else {
                    theme.background
                })
                .cursor_pointer()
                .hover(|s| s.bg(theme.muted))
                .when_some(self.on_start, |this, on| {
                    this.on_click(move |e, window, cx| on(e, window, cx))
                })
                .when_some(self.binding, |this, stroke| this.child(Kbd::new(stroke)))
                .when(!has_binding && !recording, |this| {
                    this.child(
                        div()
                            .text_xs()
                            .text_color(theme.muted_foreground)
                            .child("Click to record"),
                    )
                })
                .when(recording, |this| {
                    this.child(
                        Phosphor::new(PhosphorIcon::Keyboard)
                            .size(px(14.0))
                            .color(theme.accent),
                    )
                }),
        )
        .when(has_binding && self.on_clear.is_some(), |this| {
            let on_clear = self.on_clear.clone();
            this.child(
                div()
                    .id(ElementId::Name(format!("{}-clear", self.id).into()))
                    .size(px(24.0))
                    .rounded(px(6.0))
                    .flex()
                    .items_center()
                    .justify_center()
                    .cursor_pointer()
                    .hover(|s| s.bg(theme.muted))
                    .on_click(move |e, window, cx| {
                        if let Some(on) = &on_clear {
                            on(e, window, cx);
                        }
                    })
                    .child(
                        Phosphor::new(PhosphorIcon::X)
                            .size(px(12.0))
                            .color(theme.muted_foreground),
                    ),
            )
        })
    }
}
