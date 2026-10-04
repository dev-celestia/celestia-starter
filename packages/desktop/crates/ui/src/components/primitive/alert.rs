//! Celestia alert — the desktop counterpart of
//! `packages/ui/src/components/primitive/alert.tsx`.
//!
//! Written directly on `gpui` — no component-library alert underneath.
//!
//! Web metrics, carried over verbatim: `w-full rounded-lg border px-2 py-1.5
//! text-xs/relaxed` on the **card surface**, with the variant accent applied as
//! *text* colour rather than a fill (`bg-card text-destructive`, not
//! `bg-destructive/10`). The leading icon is `size-3.5` (14px), nudged down 2px
//! (`*:[svg]:translate-y-0.5`) so it optically aligns with the first text line.
//!
//! The desktop theme has no `card` slot, so the surface is `theme.popover` —
//! the same substitution [`crate::components::primitive::card`] makes.

use std::rc::Rc;

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, Hsla, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, Role, SharedString, Stateful,
    StatefulInteractiveElement as _, StyleRefinement, Styled, Window, div, px,
};

use crate::components::primitive::icon::PhosphorIcon;
use crate::theme::{ActiveTheme as _, ThemeColor};

/// Visual weight of the alert (web `variant`).
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum AlertVariant {
    /// Neutral card surface, default foreground (web `default`).
    #[default]
    Default,
    /// Danger accent as text (web `destructive`).
    Destructive,
    /// Success accent as text.
    Success,
    /// Warning accent as text.
    Warning,
    /// Info accent as text.
    Info,
}

impl AlertVariant {
    /// The accent this variant carries as text, or `None` for the neutral
    /// default (which uses the plain foreground).
    fn accent(self, theme: &ThemeColor) -> Option<Hsla> {
        match self {
            Self::Default => None,
            Self::Destructive => Some(theme.danger),
            Self::Success => Some(theme.success),
            Self::Warning => Some(theme.warning),
            Self::Info => Some(theme.info),
        }
    }
}

/// A dismiss handler — the shape gpui's click listeners take.
type OnClose = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>;

/// A static message block — icon, optional title, and body.
#[derive(IntoElement)]
pub struct Alert {
    id: ElementId,
    style: StyleRefinement,
    variant: AlertVariant,
    icon: Option<AnyElement>,
    title: Option<SharedString>,
    message: SharedString,
    banner: bool,
    visible: bool,
    on_close: Option<OnClose>,
}

impl Alert {
    /// A neutral alert carrying `message`.
    pub fn new(id: impl Into<ElementId>, message: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            variant: AlertVariant::default(),
            icon: None,
            title: None,
            message: message.into(),
            banner: false,
            visible: true,
            on_close: None,
        }
    }

    /// An informational alert, led by the info glyph.
    pub fn info(id: impl Into<ElementId>, message: impl Into<SharedString>) -> Self {
        Self::new(id, message)
            .variant(AlertVariant::Info)
            .icon(PhosphorIcon::Info)
    }

    /// A success alert, led by the check glyph.
    pub fn success(id: impl Into<ElementId>, message: impl Into<SharedString>) -> Self {
        Self::new(id, message)
            .variant(AlertVariant::Success)
            .icon(PhosphorIcon::CheckCircle)
    }

    /// A warning alert, led by the triangle glyph.
    pub fn warning(id: impl Into<ElementId>, message: impl Into<SharedString>) -> Self {
        Self::new(id, message)
            .variant(AlertVariant::Warning)
            .icon(PhosphorIcon::Warning)
    }

    /// A failure alert, led by the cross glyph. `error` is the web's
    /// `destructive` variant.
    pub fn error(id: impl Into<ElementId>, message: impl Into<SharedString>) -> Self {
        Self::new(id, message)
            .variant(AlertVariant::Destructive)
            .icon(PhosphorIcon::XCircle)
    }

    /// Set the visual weight.
    pub fn variant(mut self, variant: AlertVariant) -> Self {
        self.variant = variant;
        self
    }

    /// Set the leading glyph. The default constructors already pick one; pass
    /// any element to replace it.
    pub fn icon(mut self, icon: impl IntoElement) -> Self {
        self.icon = Some(icon.into_any_element());
        self
    }

    /// Add a medium-weight title line above the message.
    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    /// Full-bleed banner: no border, no radius, no title.
    pub fn banner(mut self) -> Self {
        self.banner = true;
        self
    }

    /// Render nothing when `visible` is false.
    pub fn visible(mut self, visible: bool) -> Self {
        self.visible = visible;
        self
    }

    /// Show a dismiss affordance in the trailing corner.
    pub fn on_close(
        mut self,
        on_close: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_close = Some(Rc::new(on_close));
        self
    }
}

impl Styled for Alert {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

/// The trailing dismiss affordance: a 20px square that tints on hover.
fn close_button(on_close: OnClose, theme: &ThemeColor) -> Stateful<gpui::Div> {
    div()
        .id("alert-close")
        .flex_none()
        .size(px(20.0))
        .rounded(px(6.0))
        .flex()
        .items_center()
        .justify_center()
        .cursor_pointer()
        .text_color(theme.muted_foreground)
        .hover(move |s| s.bg(theme.muted).text_color(theme.foreground))
        .on_click(move |event, window, cx| on_close(event, window, cx))
        .child(PhosphorIcon::X)
}

impl RenderOnce for Alert {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let accent = self.variant.accent(theme);
        let foreground = accent.unwrap_or(theme.foreground);
        // Web: `*:data-[slot=alert-description]:text-<accent>/90` for the status
        // variants, plain muted foreground otherwise.
        let body_color = match accent {
            Some(accent) => accent.opacity(0.9),
            None => theme.muted_foreground,
        };

        let mut root = div()
            .id(self.id)
            .role(Role::Alert)
            .w_full()
            .flex()
            .flex_row()
            .items_start()
            .gap(px(6.0))
            .px(px(8.0))
            .py(px(6.0))
            .text_size(px(12.0))
            .line_height(px(18.0))
            .text_color(foreground)
            .bg(theme.popover)
            .border_1()
            .border_color(theme.border)
            .when(!self.banner, |el| el.rounded(theme.radius_lg));
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        if !self.visible {
            return root;
        }

        if let Some(icon) = self.icon {
            // `*:[svg]:translate-y-0.5` — a 2px optical nudge off the top edge.
            root = root.child(
                div()
                    .flex_none()
                    .mt(px(2.0))
                    .flex()
                    .items_center()
                    .child(icon),
            );
        }

        let mut body = div().flex_1().min_w_0().flex().flex_col().gap(px(2.0));
        if let Some(title) = self.title {
            body = body.child(div().font_weight(FontWeight::MEDIUM).child(title));
        }
        body = body.child(div().text_color(body_color).child(self.message));
        root = root.child(body);

        if let Some(on_close) = self.on_close {
            root = root.child(close_button(on_close, theme));
        }

        root
    }
}
