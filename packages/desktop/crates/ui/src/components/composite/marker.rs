//! Celestia marker — the desktop counterpart of the web composite
//! `marker.tsx`.
//!
//! Written directly on `gpui` — no component-library marker underneath.
//!
//! The conversation's status row: "Today", "Celestia is thinking…", "Newer
//! messages above". It deliberately accepts arbitrary children rather than
//! fixed icon/content slots, so a glyph, a label, a spinner or an action all
//! compose without the marker having to grow a prop for each.
//!
//! Web metrics: `min-h-4` (16px) row, `gap-2` (8px), `text-xs/relaxed` on
//! `muted-foreground`, with a 14px glyph. The `separator` variant centres its
//! content between two `h-px` `flex-1` rules inset by `0.25rem`; `border`
//! adds a bottom hairline and `pb-2` (8px).
//!
//! Deviations from the reference implementation, both deliberate:
//!
//! - **`role` is `gpui::Role`, not a base-layer `RoleOverride`.** The
//!   override wrapper exists to distinguish "no role" from a role; `Option`
//!   says the same thing in the language. As upstream, the role only takes
//!   effect together with [`Marker::id`] — an accessibility node needs a
//!   stable identity to hang off.
//! - **The loading effects are the crate's own.** A `Spinner` marker uses
//!   [`crate::components::primitive::spinner::Spinner`], and the shimmer
//!   variant reuses [`ShimmerText`] for text and [`ShimmerStyle::animation`]
//!   for arbitrary content, so the pulse rides the same clock as every other
//!   shimmer in the app rather than a private one.

use gpui::{
    AnimationExt as _, AnyElement, App, ElementId, InteractiveElement as _, IntoElement,
    ParentElement, Refineable as _, RenderOnce, Role, SharedString,
    StatefulInteractiveElement as _, StyleRefinement, Styled, StyledText, Window, div, px,
    relative,
};

use crate::components::primitive::shimmer::{ShimmerStyle, ShimmerText};
use crate::components::primitive::spinner::Spinner;
use crate::theme::ActiveTheme as _;

/// The visual treatment used by a [`Marker`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum MarkerVariant {
    /// An inline marker with no additional divider.
    #[default]
    Plain,
    /// A centered marker with semantic divider lines on both sides.
    Separator,
    /// A marker with a semantic bottom border.
    Border,
}

/// The visual treatment used while a [`Marker`] is loading.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum MarkerLoadingStyle {
    /// Show a compact rotating spinner beside the marker content.
    #[default]
    Spinner,
    /// Sweep a highlight across marker content without adding an icon.
    Shimmer,
}

enum MarkerChild {
    Icon(MarkerIcon),
    Content(MarkerContent),
    Element(AnyElement),
}

/// A compact, composable row for conversation status and system markers.
///
/// `Marker` intentionally accepts arbitrary children. An icon, text, spinner,
/// or action can be composed directly without introducing fixed icon and
/// content slots. Use [`Styled`] methods on the marker to refine its layout or
/// typography for an application-specific use. Loading effects only affect
/// configured content slots, so icons and separators retain their appearance.
#[derive(IntoElement)]
pub struct Marker {
    id: Option<ElementId>,
    style: StyleRefinement,
    separator_style: StyleRefinement,
    variant: MarkerVariant,
    loading: bool,
    loading_style: MarkerLoadingStyle,
    shimmer_style: ShimmerStyle,
    role: Option<Role>,
    children: Vec<MarkerChild>,
}

impl Marker {
    /// Create a plain marker.
    pub fn new() -> Self {
        Self {
            id: None,
            style: StyleRefinement::default(),
            separator_style: StyleRefinement::default(),
            variant: MarkerVariant::default(),
            loading: false,
            loading_style: MarkerLoadingStyle::default(),
            shimmer_style: ShimmerStyle::default(),
            role: None,
            children: Vec::new(),
        }
    }

    /// Set a stable identity so the marker can appear in the accessibility tree.
    pub fn id(mut self, id: impl Into<ElementId>) -> Self {
        self.id = Some(id.into());
        self
    }

    /// Set the accessibility role announced for this marker.
    ///
    /// A marker is presentational by default. Set [`Role::Status`] on a row
    /// that reports streaming or loading progress so assistive technology
    /// announces its updates. Accessibility nodes need a stable identity, so
    /// the role takes effect only together with [`Self::id`].
    pub fn role(mut self, role: Role) -> Self {
        self.role = Some(role);
        self
    }

    /// Set the visual treatment of the marker.
    pub fn with_variant(mut self, variant: MarkerVariant) -> Self {
        self.variant = variant;
        self
    }

    /// Set whether the marker should display its configured loading effect.
    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    /// Set the visual treatment used when [`Self::loading`] is enabled.
    pub fn with_loading_style(mut self, loading_style: MarkerLoadingStyle) -> Self {
        self.loading_style = loading_style;
        self
    }

    /// Configure the text highlight used by [`MarkerLoadingStyle::Shimmer`].
    pub fn with_shimmer_style(mut self, shimmer_style: ShimmerStyle) -> Self {
        self.shimmer_style = shimmer_style;
        self
    }

    /// Refine the decorative lines used by [`MarkerVariant::Separator`].
    pub fn separator_style(mut self, style: StyleRefinement) -> Self {
        self.separator_style = style;
        self
    }

    /// Add a configured icon slot.
    pub fn icon(mut self, icon: MarkerIcon) -> Self {
        self.children.push(MarkerChild::Icon(icon));
        self
    }

    /// Add a configured content slot.
    pub fn content(mut self, content: MarkerContent) -> Self {
        self.children.push(MarkerChild::Content(content));
        self
    }
}

impl Default for Marker {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for Marker {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children
            .extend(elements.into_iter().map(MarkerChild::Element));
    }
}

impl Styled for Marker {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Marker {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let variant = self.variant;
        let loading = self.loading;
        let loading_style = self.loading_style;
        let shimmer_style = self.shimmer_style;
        let has_icon = self
            .children
            .iter()
            .any(|child| matches!(child, MarkerChild::Icon(_)));
        let separator_style = self.separator_style;
        let children = self.children.into_iter().map(move |child| match child {
            MarkerChild::Icon(icon) => icon.into_any_element(),
            MarkerChild::Content(mut content) => {
                content.shimmer = loading && loading_style == MarkerLoadingStyle::Shimmer;
                content.shimmer_style = shimmer_style;
                content.separator = variant == MarkerVariant::Separator;
                content.into_any_element()
            }
            MarkerChild::Element(element) => element,
        });

        // `items_center()` is the row-centering the shared helper would have
        // supplied; the marker never overrides it.
        let mut row = div()
            .w_full()
            .min_h(px(16.0))
            .flex()
            .flex_row()
            .items_center()
            .gap(px(8.0))
            .text_size(px(12.0))
            .line_height(relative(1.625))
            .text_color(theme.muted_foreground)
            .text_left();
        if variant == MarkerVariant::Separator {
            row = row.justify_center();
        }
        if variant == MarkerVariant::Border {
            row = row.border_b_1().border_color(theme.border).pb(px(8.0));
        }
        if variant == MarkerVariant::Separator {
            let mut rule = div()
                .flex_1()
                .min_w_0()
                .h(px(1.0))
                .mr(px(4.0))
                .bg(theme.border);
            rule.style().refine(&separator_style);
            row = row.child(rule);
        }
        // A spinner is only injected when the caller did not supply an icon of
        // their own — a custom glyph already reads as "something is happening".
        if loading && loading_style == MarkerLoadingStyle::Spinner && !has_icon {
            row = row.child(MarkerIcon::new().child(Spinner::new().size(px(12.0))));
        }
        row = row.children(children);
        if variant == MarkerVariant::Separator {
            let mut rule = div()
                .flex_1()
                .min_w_0()
                .h(px(1.0))
                .ml(px(4.0))
                .bg(theme.border);
            rule.style().refine(&separator_style);
            row = row.child(rule);
        }
        row.style().refine(&self.style);

        // `role` lives on the stateful element: accessibility nodes need the
        // stable identity that only an element id provides.
        match (self.id, self.role) {
            (Some(id), Some(role)) => row.id(id).role(role).into_any_element(),
            (Some(id), None) => row.id(id).into_any_element(),
            (None, _) => row.into_any_element(),
        }
    }
}

/// A compact decorative icon slot inside a [`Marker`].
#[derive(IntoElement)]
pub struct MarkerIcon {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl MarkerIcon {
    /// Create an empty marker icon slot.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for MarkerIcon {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for MarkerIcon {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for MarkerIcon {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MarkerIcon {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut slot = div()
            .size(px(16.0))
            .flex_none()
            .flex()
            .flex_row()
            .items_center()
            .justify_center();
        slot.style().refine(&self.style);
        slot.children(self.children)
    }
}

/// The independently styleable text or rich-content slot in a [`Marker`].
#[derive(IntoElement)]
pub struct MarkerContent {
    style: StyleRefinement,
    shimmer: bool,
    shimmer_style: ShimmerStyle,
    separator: bool,
    children: Vec<MarkerContentChild>,
}

enum MarkerContentChild {
    Text(SharedString),
    Element(AnyElement),
}

impl MarkerContent {
    /// Create an empty marker content slot.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            shimmer: false,
            shimmer_style: ShimmerStyle::default(),
            separator: false,
            children: Vec::new(),
        }
    }

    /// Add text that can receive a continuous loading shimmer.
    ///
    /// Arbitrary children remain supported through [`ParentElement`].
    pub fn text(mut self, text: impl Into<SharedString>) -> Self {
        self.children.push(MarkerContentChild::Text(text.into()));
        self
    }
}

impl Default for MarkerContent {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for MarkerContent {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children
            .extend(elements.into_iter().map(MarkerContentChild::Element));
    }
}

impl Styled for MarkerContent {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MarkerContent {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        // Reduced motion parks the sweep rather than looping it silently.
        let animate = self.shimmer && !cx.reduce_motion();
        let has_text = self
            .children
            .iter()
            .any(|child| matches!(child, MarkerContentChild::Text(_)));
        let base_opacity = self.style.opacity.unwrap_or(1.);
        let shimmer_style = self.shimmer_style;
        let children =
            self.children
                .into_iter()
                .enumerate()
                .map(move |(index, child)| match child {
                    MarkerContentChild::Text(text) if animate => ShimmerText::new(text)
                        .id(("marker-loading-text", index))
                        .with_shimmer_style(shimmer_style)
                        .into_any_element(),
                    MarkerContentChild::Text(text) => StyledText::new(text).into_any_element(),
                    MarkerContentChild::Element(element) => element,
                });

        let mut content = div().min_w_0();
        if self.separator {
            content = content.flex_none().text_center();
        }
        content.style().refine(&self.style);
        let content = content.children(children);

        // Text carries the sweep on its own; anything else pulses as a whole so
        // an arbitrary child still reads as loading.
        if animate && !has_text {
            content
                .with_animation(
                    "marker-loading-content",
                    shimmer_style.animation(),
                    move |this, phase| {
                        let highlight = (phase * std::f32::consts::TAU).cos().mul_add(0.5, 0.5);
                        this.opacity(base_opacity * highlight.mul_add(0.4, 0.6))
                    },
                )
                .into_any_element()
        } else {
            content.into_any_element()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builder_wires_variant_loading_and_slots() {
        let marker = Marker::new()
            .with_variant(MarkerVariant::Separator)
            .loading(true)
            .with_loading_style(MarkerLoadingStyle::Shimmer)
            .with_shimmer_style(ShimmerStyle::new().once(true))
            .separator_style(StyleRefinement::default())
            .content(MarkerContent::new().child("Today"));

        assert_eq!(marker.variant, MarkerVariant::Separator);
        assert!(marker.loading);
        assert_eq!(marker.loading_style, MarkerLoadingStyle::Shimmer);
        assert_eq!(marker.children.len(), 1);

        assert_eq!(Marker::default().variant, MarkerVariant::Plain);
        assert!(!Marker::default().loading);
        assert_eq!(Marker::default().loading_style, MarkerLoadingStyle::Spinner);
    }

    /// Order is preserved, so a content slot configured before `.loading(true)`
    /// still receives the shimmer.
    #[test]
    fn loading_style_applies_to_content_added_earlier() {
        let content_first = Marker::new()
            .content(MarkerContent::new().text("Thinking"))
            .with_loading_style(MarkerLoadingStyle::Shimmer)
            .loading(true);
        assert!(content_first.loading);
        assert_eq!(content_first.loading_style, MarkerLoadingStyle::Shimmer);
        assert!(matches!(
            &content_first.children[0],
            MarkerChild::Content(_)
        ));
    }

    #[test]
    fn icon_slot_coexists_with_content() {
        let custom_icon = Marker::new()
            .loading(true)
            .icon(MarkerIcon::new().child("custom"))
            .content(MarkerContent::new().text("Loading"));
        assert_eq!(custom_icon.children.len(), 2);
        assert!(matches!(&custom_icon.children[0], MarkerChild::Icon(_)));
    }

    /// The role is inert without an id — an accessibility node needs both.
    #[test]
    fn role_is_inert_without_an_identity() {
        assert_eq!(Marker::default().role, None);
        assert!(Marker::default().id.is_none());

        let status = Marker::new().id("sync-status").role(Role::Status);
        assert_eq!(status.id, Some("sync-status".into()));
        assert_eq!(status.role, Some(Role::Status));
    }

    #[test]
    fn styled_refinement_reaches_the_marker_and_the_content() {
        let styled = Marker::new().opacity(0.37).child("Status").child("Details");
        assert_eq!(styled.style.opacity, Some(0.37));
        assert_eq!(styled.children.len(), 2);

        let icon = MarkerIcon::new().child("icon");
        assert_eq!(icon.children.len(), 1);

        // Text and element children interleave without reordering.
        let content = MarkerContent::new()
            .text("Thinking")
            .child("…")
            .text("正在思考");
        assert_eq!(content.children.len(), 3);
        assert!(matches!(&content.children[0], MarkerContentChild::Text(_)));
        assert!(matches!(
            &content.children[1],
            MarkerContentChild::Element(_)
        ));
        assert!(matches!(&content.children[2], MarkerContentChild::Text(_)));
    }
}
