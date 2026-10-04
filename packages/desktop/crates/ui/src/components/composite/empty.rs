//! Empty state — the desktop counterpart of
//! `packages/ui/src/components/primitive/empty.tsx`.
//!
//! Written directly on `gpui`. A dashed placeholder shown when a query or
//! dataset comes back with nothing, composed from independently styled slots:
//! [`EmptyHeader`] (media → title → description) and [`EmptyContent`] for the
//! caller's actions.
//!
//! Slot order is a contract, not a consequence of builder order — the named
//! setters can be called in any sequence and the visual order still holds.
//! Anything added with `child`/`children` follows the named slots.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, IntoElement, ParentElement, Refineable as _, RenderOnce, StyleRefinement,
    Styled, Window, div, px, relative, rems,
};

use crate::theme::ActiveTheme as _;

/// A presentational empty state.
#[derive(IntoElement)]
pub struct Empty {
    style: StyleRefinement,
    header: Option<EmptyHeader>,
    content: Option<EmptyContent>,
    children: Vec<AnyElement>,
}

impl Empty {
    /// An empty state with no background or visible border beyond the dashed
    /// placeholder outline.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            header: None,
            content: None,
            children: Vec::new(),
        }
    }

    /// Set the header, replacing any previously configured one.
    pub fn header(mut self, header: EmptyHeader) -> Self {
        self.header = Some(header);
        self
    }

    /// Set the content, replacing any previously configured one.
    pub fn content(mut self, content: EmptyContent) -> Self {
        self.content = Some(content);
        self
    }
}

impl Default for Empty {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for Empty {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Empty {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Empty {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();

        let mut root = div()
            .w_full()
            .min_w_0()
            .flex_1()
            .flex()
            .flex_col()
            .items_center()
            .justify_center()
            .gap(px(16.0))
            .p(px(24.0))
            .rounded(theme.radius_tokens().xl)
            .border_1()
            .border_dashed()
            .border_color(theme.border)
            .text_center()
            .text_color(theme.foreground);
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.when_some(self.header, |this, header| this.child(header))
            .when_some(self.content, |this, content| this.child(content))
            .children(self.children)
    }
}

/// The media, title, and description of an [`Empty`], in that order.
///
/// Every slot is optional, and replacing one leaves the others intact.
#[derive(IntoElement)]
pub struct EmptyHeader {
    style: StyleRefinement,
    media: Option<EmptyMedia>,
    title: Option<EmptyTitle>,
    description: Option<EmptyDescription>,
}

impl EmptyHeader {
    /// A centered header capped at 24rem.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            media: None,
            title: None,
            description: None,
        }
    }

    /// Set the media, replacing any previously configured media.
    pub fn media(mut self, media: EmptyMedia) -> Self {
        self.media = Some(media);
        self
    }

    /// Set the title, replacing any previously configured title.
    pub fn title(mut self, title: EmptyTitle) -> Self {
        self.title = Some(title);
        self
    }

    /// Set the description, replacing any previously configured description.
    pub fn description(mut self, description: EmptyDescription) -> Self {
        self.description = Some(description);
        self
    }
}

impl Default for EmptyHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for EmptyHeader {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for EmptyHeader {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .w_full()
            .max_w(rems(24.0))
            .min_w_0()
            .flex()
            .flex_col()
            .items_center()
            .gap(px(8.0));
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.when_some(self.media, |this, media| this.child(media))
            .when_some(self.title, |this, title| this.child(title))
            .when_some(self.description, |this, description| {
                this.child(description)
            })
    }
}

/// Visual treatment for an [`EmptyMedia`] slot.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum EmptyMediaVariant {
    /// Unframed content — an image, avatar, or avatar group.
    #[default]
    Default,
    /// A muted, rounded 2rem frame for a single icon.
    Icon,
}

/// The media slot of an [`Empty`] — icons, images, avatars, custom elements.
#[derive(IntoElement)]
pub struct EmptyMedia {
    style: StyleRefinement,
    variant: EmptyMediaVariant,
    children: Vec<AnyElement>,
}

impl EmptyMedia {
    /// An unframed media slot.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            variant: EmptyMediaVariant::Default,
            children: Vec::new(),
        }
    }

    /// Set the visual treatment without disturbing the supplied children.
    pub fn with_variant(mut self, variant: EmptyMediaVariant) -> Self {
        self.variant = variant;
        self
    }
}

impl Default for EmptyMedia {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for EmptyMedia {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for EmptyMedia {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for EmptyMedia {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();

        // A column preserves the intrinsic width of nested rows such as an
        // avatar group, which would otherwise collapse inside a centered slot.
        let mut root = div()
            .flex_shrink_0()
            .flex()
            .flex_col()
            .items_center()
            .justify_center()
            .mb(px(8.0))
            .when(self.variant == EmptyMediaVariant::Icon, |this| {
                this.size(px(32.0))
                    .rounded(theme.radius_tokens().lg)
                    .bg(theme.muted)
                    .text_color(theme.foreground)
                    // A glyph inherits one rem unless it sets an explicit size.
                    .text_size(px(16.0))
            });
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.children(self.children)
    }
}

/// The title of an [`Empty`] — text or custom children.
#[derive(IntoElement)]
pub struct EmptyTitle {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl EmptyTitle {
    /// An empty title.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for EmptyTitle {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for EmptyTitle {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for EmptyTitle {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for EmptyTitle {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .max_w_full()
            .min_w_0()
            .text_size(px(14.0))
            .font_weight(gpui::FontWeight::MEDIUM)
            .whitespace_normal();
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.children(self.children)
    }
}

/// Supporting text or rich content for an [`Empty`].
#[derive(IntoElement)]
pub struct EmptyDescription {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl EmptyDescription {
    /// A muted description that wraps to the available width.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for EmptyDescription {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for EmptyDescription {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for EmptyDescription {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for EmptyDescription {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let mut root = div()
            .w_full()
            .min_w_0()
            .text_size(px(14.0))
            .line_height(relative(1.625))
            .text_color(cx.theme().muted_foreground)
            .whitespace_normal();
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.children(self.children)
    }
}

/// Actions, inputs, or other caller-owned content below an [`EmptyHeader`].
#[derive(IntoElement)]
pub struct EmptyContent {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl EmptyContent {
    /// A centered content column capped at 24rem.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for EmptyContent {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for EmptyContent {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for EmptyContent {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for EmptyContent {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut root = div()
            .w_full()
            .max_w(rems(24.0))
            .min_w_0()
            .flex()
            .flex_col()
            .items_center()
            .gap(px(10.0))
            .text_size(px(14.0));
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.children(self.children)
    }
}

#[cfg(test)]
mod tests {
    use gpui::{IntoElement, StyleRefinement};

    use super::*;

    /// Slot order is a contract: the named setters can be called in any order
    /// and the render order still holds. This pins the *storage*, which is what
    /// makes the order independent of builder sequence.
    #[test]
    fn named_setters_replace_without_disturbing_the_other_slots() {
        let empty = Empty::new()
            .child("trailing content")
            .header(EmptyHeader::new().media(EmptyMedia::new()))
            .content(EmptyContent::new().child("Replaced content"))
            .header(
                EmptyHeader::new()
                    .title(EmptyTitle::new().child("Title"))
                    .description(EmptyDescription::new().child("Description"))
                    .media(
                        EmptyMedia::new()
                            .with_variant(EmptyMediaVariant::Icon)
                            .child("Media"),
                    ),
            )
            .content(EmptyContent::new().children(["First action", "Second action"]));

        assert_eq!(empty.children.len(), 1);

        let header = empty.header.expect("header was set");
        let media = header.media.expect("media was set");
        assert_eq!(media.variant, EmptyMediaVariant::Icon);
        assert_eq!(media.children.len(), 1);
        assert_eq!(header.title.expect("title was set").children.len(), 1);
        assert_eq!(
            header
                .description
                .expect("description was set")
                .children
                .len(),
            1
        );

        // The second `content` call replaced the first, not appended to it.
        assert_eq!(empty.content.expect("content was set").children.len(), 2);
    }

    /// A default `Empty` is genuinely empty — no phantom slots.
    #[test]
    fn a_default_empty_has_no_slots() {
        let empty = Empty::default();
        assert!(empty.header.is_none());
        assert!(empty.content.is_none());
        assert!(empty.children.is_empty());
        assert_eq!(EmptyMedia::default().variant, EmptyMediaVariant::Default);
    }

    /// Caller styles land on the element's own `StyleRefinement`, so a later
    /// `.refine()` in `render` cannot silently drop them.
    #[test]
    fn caller_styles_are_stored_on_the_element() {
        fn stored(style: StyleRefinement, mut el: impl Styled) -> StyleRefinement {
            el.style().refine(&style);
            el.style().clone()
        }

        let style = StyleRefinement::default().p_4().border_1();
        assert_eq!(stored(style.clone(), Empty::new()), style);

        let header_style = StyleRefinement::default().items_start();
        assert_eq!(
            stored(header_style.clone(), EmptyHeader::new()),
            header_style
        );

        let media_style = StyleRefinement::default().size_10();
        assert_eq!(stored(media_style.clone(), EmptyMedia::new()), media_style);

        let content_style = StyleRefinement::default().flex_row().gap_2();
        assert_eq!(
            stored(content_style.clone(), EmptyContent::new()),
            content_style
        );
    }

    /// Every slot type is usable as a bare element, which is what lets them be
    /// nested without an explicit `into_any_element`.
    #[test]
    fn slots_convert_into_elements() {
        let _: gpui::AnyElement = EmptyTitle::new().child("t").into_any_element();
        let _: gpui::AnyElement = EmptyDescription::new().child("d").into_any_element();
        let _: gpui::AnyElement = EmptyMedia::new().child("m").into_any_element();
        let _: gpui::AnyElement = EmptyContent::new().child("c").into_any_element();
        let _: gpui::AnyElement = EmptyHeader::new().into_any_element();
        let _: gpui::AnyElement = Empty::new().into_any_element();
    }
}
