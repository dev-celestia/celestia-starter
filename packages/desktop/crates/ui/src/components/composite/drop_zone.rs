//! Drop zone — file / item drop target with idle / hover / active / error states.
//!
//! When `on_files` is set, the zone listens for platform [`ExternalPaths`] and
//! paints drag-over chrome automatically. Hosts may still force a visual
//! [`DropZoneState`] for gallery demos or validation errors.

use std::path::PathBuf;
use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    App, ClickEvent, ElementId, ExternalPaths, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    StyleRefinement, Styled, Window, div, px,
};

use crate::components::composite::dnd::{
    ItemDrag, claim_drop_slot, drop_progress, drop_release_hint, mix_drop_wash,
};
use crate::motion;
use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;
type OnFiles = Rc<dyn Fn(&Vec<PathBuf>, &mut Window, &mut App) + 'static>;
type OnItemDrop = Rc<dyn Fn(&ItemDrag, &mut Window, &mut App) + 'static>;
type CanAcceptFiles = Rc<dyn Fn(&Vec<PathBuf>, &mut Window, &mut App) -> bool + 'static>;

/// Visual engagement of a [`DropZone`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum DropZoneState {
    #[default]
    Idle,
    Hover,
    Active,
    Error,
}

/// A dashed target for file / item drops, with optional click-to-browse.
#[derive(IntoElement)]
pub struct DropZone {
    id: ElementId,
    style: StyleRefinement,
    state: DropZoneState,
    /// When true, `state` wins over automatic drag-over styling.
    force_state: bool,
    title: SharedString,
    description: Option<SharedString>,
    accept_items: bool,
    on_click: Option<OnClick>,
    on_files: Option<OnFiles>,
    on_item_drop: Option<OnItemDrop>,
    can_accept_files: Option<CanAcceptFiles>,
    disabled: bool,
}

impl DropZone {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            state: DropZoneState::default(),
            force_state: false,
            title: "Drop files here".into(),
            description: Some("or click to browse".into()),
            accept_items: false,
            on_click: None,
            on_files: None,
            on_item_drop: None,
            can_accept_files: None,
            disabled: false,
        }
    }

    /// Force a visual state (gallery demos, validation errors). Disables
    /// automatic drag-over chrome while set to anything other than the default
    /// idle path — pass [`DropZoneState::Idle`] with `force_state` false via
    /// omitting this, or use [`Self::force_state`].
    pub fn state(mut self, state: DropZoneState) -> Self {
        self.state = state;
        self.force_state = state != DropZoneState::Idle;
        self
    }

    /// Pin the visual state even when Idle (prevents drag-over restyle).
    pub fn force_state(mut self, force: bool) -> Self {
        self.force_state = force;
        self
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn accept_items(mut self, accept: bool) -> Self {
        self.accept_items = accept;
        self
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(f));
        self
    }

    /// Receive platform file paths dropped onto this zone.
    pub fn on_files(mut self, f: impl Fn(&Vec<PathBuf>, &mut Window, &mut App) + 'static) -> Self {
        self.on_files = Some(Rc::new(f));
        self
    }

    pub fn on_item_drop(mut self, f: impl Fn(&ItemDrag, &mut Window, &mut App) + 'static) -> Self {
        self.accept_items = true;
        self.on_item_drop = Some(Rc::new(f));
        self
    }

    /// Reject file drops that fail the predicate (size / extension checks).
    pub fn can_accept_files(
        mut self,
        f: impl Fn(&Vec<PathBuf>, &mut Window, &mut App) -> bool + 'static,
    ) -> Self {
        self.can_accept_files = Some(Rc::new(f));
        self
    }
}

impl Styled for DropZone {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for DropZone {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let accent = cx.theme().accent;
        let border_token = cx.theme().border;
        let muted = cx.theme().muted;
        let muted_foreground = cx.theme().muted_foreground;
        let danger = cx.theme().danger;
        let foreground = cx.theme().foreground;
        let radius_xl = cx.theme().radius_xl();
        let (border, bg, icon_color) = match self.state {
            DropZoneState::Idle => (
                border_token,
                muted.opacity(0.35),
                muted_foreground,
            ),
            DropZoneState::Hover => (
                accent.opacity(0.5),
                accent.opacity(0.06),
                accent,
            ),
            DropZoneState::Active => (accent, accent.opacity(0.12), accent),
            DropZoneState::Error => (
                danger.opacity(0.5),
                danger.opacity(0.06),
                danger,
            ),
        };
        let icon = match self.state {
            DropZoneState::Error => PhosphorIcon::Warning,
            DropZoneState::Active => PhosphorIcon::DownloadSimple,
            _ => PhosphorIcon::UploadSimple,
        };

        let interactive = !self.disabled
            && (self.on_files.is_some() || self.on_item_drop.is_some() || self.on_click.is_some());
        let force_state = self.force_state;
        let group: SharedString = match &self.id {
            ElementId::Name(name) => format!("drop-zone-{name}").into(),
            other => format!("drop-zone-{other:?}").into(),
        };
        let files_hint = ElementId::Name(format!("drop-zone-files-{group}").into());
        let item_hint = ElementId::Name(format!("drop-zone-item-{group}").into());
        let has_files = self.on_files.is_some();
        let accept_items = self.accept_items;
        let wash = if force_state {
            0.0
        } else {
            let files = if has_files {
                drop_progress::<ExternalPaths>(&files_hint, window, cx)
            } else {
                0.0
            };
            let items = if accept_items {
                drop_progress::<ItemDrag>(&item_hint, window, cx)
            } else {
                0.0
            };
            files.max(items)
        };
        let border = motion::mix(border, accent, wash);
        let bg = mix_drop_wash(bg, accent, wash);

        let mut root = div()
            .id(self.id.clone())
            .group(group.clone())
            .w_full()
            .min_h(px(140.0))
            .flex()
            .flex_col()
            .items_center()
            .justify_center()
            .gap(px(10.0))
            .px(px(24.0))
            .py(px(28.0))
            .rounded(radius_xl)
            .border_1()
            .border_dashed()
            .border_color(border)
            .bg(bg)
            .when(self.disabled, |this| this.opacity(0.5))
            .when(self.on_click.is_some() && !self.disabled, |this| {
                this.cursor_pointer()
            });
        root.style().refine(&self.style);

        let mut root = root
            .when_some(self.on_click, |this, on| {
                this.on_click(move |e, window, cx| on(e, window, cx))
            })
            .child(Phosphor::new(icon).size(px(28.0)).color(icon_color))
            .child(
                div()
                    .text_sm()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(foreground)
                    .child(self.title),
            )
            .when_some(self.description, |this, desc| {
                this.child(
                    div()
                        .text_xs()
                        .text_color(muted_foreground)
                        .child(desc),
                )
            });

        if !interactive {
            return root.into_any_element();
        }

        let can_accept_files = self.can_accept_files.clone();

        root = root.can_drop(move |value: &dyn std::any::Any, window, cx| {
            if let Some(paths) = value.downcast_ref::<ExternalPaths>() {
                if !has_files {
                    return false;
                }
                if let Some(pred) = can_accept_files.as_ref() {
                    return pred(&paths.paths().to_vec(), window, cx);
                }
                return true;
            }
            if accept_items && value.downcast_ref::<ItemDrag>().is_some() {
                return true;
            }
            false
        });

        if !force_state {
            let claim_files = files_hint.clone();
            let claim_item = item_hint.clone();
            root = root.on_mouse_move(move |_, _, cx| {
                if !cx.has_active_drag() {
                    return;
                }
                if has_files {
                    claim_drop_slot::<ExternalPaths>(claim_files.clone(), "", cx);
                }
                if accept_items {
                    claim_drop_slot::<ItemDrag>(claim_item.clone(), "", cx);
                }
            });
            if has_files {
                root = root.child(drop_release_hint::<ExternalPaths>(
                    files_hint,
                    "Release to drop",
                    accent,
                    window,
                    cx,
                ));
            }
            if accept_items {
                root = root.child(drop_release_hint::<ItemDrag>(
                    item_hint,
                    "Release to drop",
                    accent,
                    window,
                    cx,
                ));
            }
        }

        if let Some(on) = self.on_files {
            root = root.on_drop(move |paths: &ExternalPaths, window, cx| {
                on(&paths.paths().to_vec(), window, cx)
            });
        }

        if let Some(on) = self.on_item_drop {
            root = root.on_drop(move |drag: &ItemDrag, window, cx| on(drag, window, cx));
        }

        root.into_any_element()
    }
}
