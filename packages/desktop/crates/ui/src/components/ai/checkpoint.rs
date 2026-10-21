//! Checkpoint — conversation restore marker.

use std::rc::Rc;

use gpui::{
    App, ClickEvent, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement,
    Refineable as _, RenderOnce, SharedString, StatefulInteractiveElement as _, StyleRefinement,
    Styled, Window, div, px,
};

use crate::components::primitive::icon::{Phosphor, PhosphorIcon};
use crate::theme::ActiveTheme as _;

type OnClick = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// Inline checkpoint marker with restore action.
#[derive(IntoElement)]
pub struct Checkpoint {
    id: ElementId,
    style: StyleRefinement,
    label: SharedString,
    on_restore: Option<OnClick>,
}

impl Checkpoint {
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            label: label.into(),
            on_restore: None,
        }
    }

    pub fn on_restore(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_restore = Some(Rc::new(f));
        self
    }
}

impl Styled for Checkpoint {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Checkpoint {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let mut root = div()
            .id(self.id.clone())
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0));
        root.style().refine(&self.style);

        let mut trigger = div()
            .id((self.id, "restore"))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(6.0))
            .px(px(8.0))
            .py(px(4.0))
            .rounded(theme.radius)
            .cursor_pointer()
            .child(
                Phosphor::new(PhosphorIcon::BookmarkSimple)
                    .size(px(14.0))
                    .color(theme.muted_foreground),
            )
            .child(
                div()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(theme.muted_foreground)
                    .child(self.label),
            );
        if let Some(on_restore) = self.on_restore {
            trigger = trigger.on_click(move |e, w, cx| on_restore(e, w, cx));
        }

        root.child(trigger)
            .child(div().flex_1().h(px(1.0)).bg(theme.border))
    }
}
