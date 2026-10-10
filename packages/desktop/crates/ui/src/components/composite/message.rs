//! Celestia chat message — the desktop counterpart of the web
//! `ai/message.tsx`.
//!
//! Written directly on `gpui` — no component-library message underneath.
//!
//! A message is four named slots (avatar, header, body, footer) plus the
//! alignment that ties them together. Named slots are the point: the row can
//! flip its order and every slot keeps its own identity, so a trailing-aligned
//! message is the *same* message mirrored, not a second layout.
//!
//! Two couplings worth knowing about:
//!
//! - [`MessageContent::bubble`] takes the crate's own [`Bubble`], so this file
//!   and `primitive::bubble` migrated together — neither can move alone.
//! - The footer is rendered **outside** the avatar row, so the bottom-anchored
//!   avatar stays flush with the content's bottom edge whatever the footer
//!   holds. Moving it inside would break that.
//!
//! Web metrics: `gap-2` between avatar and content, `gap(0.625rem)` inside the
//! slots, `text-sm` on the message and `text-xs` on header/footer, and a
//! `size-8` (32px) avatar baseline that the footer aligns against with a
//! `2.5rem` inset when an avatar is present.

use gpui::{
    AnyElement, App, FontWeight, IntoElement, ParentElement, Refineable as _, RenderOnce,
    StyleRefinement, Styled, Window, div, px, relative,
};

use crate::components::primitive::bubble::Bubble;
use crate::theme::ActiveTheme as _;

/// Horizontal alignment for a message and message-owned chat surfaces.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum MessageAlignment {
    /// Place the message at the leading edge.
    #[default]
    Start,
    /// Place the message at the trailing edge.
    End,
}

/// A vertical stack of consecutive messages from the same sender.
#[derive(IntoElement)]
pub struct MessageGroup {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl MessageGroup {
    /// Create an empty message group.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for MessageGroup {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for MessageGroup {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for MessageGroup {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MessageGroup {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut column = div().flex().flex_col().min_w_0().gap(px(8.0));
        column.style().refine(&self.style);
        column.children(self.children)
    }
}

/// A composable message row with named avatar, header, content, and footer slots.
///
/// Named slots let the message apply its alignment consistently while every
/// part remains independently styleable.
#[derive(IntoElement)]
pub struct Message {
    style: StyleRefinement,
    stack_style: StyleRefinement,
    alignment: MessageAlignment,
    avatar: Option<MessageAvatar>,
    header: Option<MessageHeader>,
    content: Option<MessageContent>,
    footer: Option<MessageFooter>,
}

impl Message {
    /// Create a leading-aligned message.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            stack_style: StyleRefinement::default(),
            alignment: MessageAlignment::Start,
            avatar: None,
            header: None,
            content: None,
            footer: None,
        }
    }

    /// Set whether the message is aligned to the leading or trailing edge.
    pub fn alignment(mut self, alignment: MessageAlignment) -> Self {
        self.alignment = alignment;
        self
    }

    /// Refine the inner vertical stack that contains the named slots.
    pub fn with_stack_style(mut self, style: StyleRefinement) -> Self {
        self.stack_style = style;
        self
    }

    /// Set an optional avatar or other sender identity element.
    pub fn avatar(mut self, avatar: impl IntoElement) -> Self {
        self.avatar = Some(MessageAvatar::new().child(avatar));
        self
    }

    /// Set a fully configured avatar slot.
    pub fn avatar_slot(mut self, avatar: MessageAvatar) -> Self {
        self.avatar = Some(avatar);
        self
    }

    /// Set the message header.
    pub fn header(mut self, header: MessageHeader) -> Self {
        self.header = Some(header);
        self
    }

    /// Set the message body.
    pub fn content(mut self, content: MessageContent) -> Self {
        self.content = Some(content);
        self
    }

    /// Set the message footer.
    pub fn footer(mut self, footer: MessageFooter) -> Self {
        self.footer = Some(footer);
        self
    }
}

impl Default for Message {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for Message {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Message {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let alignment = self.alignment;
        let has_avatar = self.avatar.is_some();
        let has_ghost_bubble = self
            .content
            .as_ref()
            .is_some_and(|content| content.has_ghost_bubble);
        let stack_style = self.stack_style;

        let mut root = div()
            .relative()
            .w_full()
            .min_w_0()
            .flex()
            .flex_col()
            .gap(px(10.0))
            .text_size(px(14.0))
            .line_height(relative(1.25));
        root = match alignment {
            MessageAlignment::Start => root.items_start(),
            MessageAlignment::End => root.items_end(),
        };
        root.style().refine(&self.style);

        // `items_end()` replaces the row-centering the shared helper would have
        // supplied: the avatar must sit flush with the content's bottom edge.
        let mut row = div()
            .w_full()
            .min_w_0()
            .flex()
            .flex_row()
            .items_end()
            .gap(px(8.0));
        if alignment == MessageAlignment::End {
            row = row.flex_row_reverse();
        }
        if let Some(avatar) = self.avatar {
            row = row.child(avatar);
        }

        let mut stack = div().w_full().min_w_0().flex().flex_col().gap(px(10.0));
        stack = match alignment {
            MessageAlignment::Start => stack.items_start(),
            MessageAlignment::End => stack.items_end(),
        };
        stack.style().refine(&stack_style);
        if let Some(header) = self.header {
            stack = stack.child(header.with_inherited_content_inset(!has_ghost_bubble));
        }
        if let Some(content) = self.content {
            stack = stack.child(content.aligned(alignment));
        }
        let mut root = root.child(row.child(stack));

        if let Some(footer) = self.footer {
            let mut footer = footer.with_inherited_content_inset(!has_ghost_bubble);
            // Align the footer with the content column: the avatar's shared
            // `size-8` baseline plus the row gap.
            if has_avatar {
                footer = match alignment {
                    MessageAlignment::Start => footer.ml(px(40.0)),
                    MessageAlignment::End => footer.mr(px(40.0)),
                };
            }
            root = root.child(footer);
        }

        root
    }
}

/// The sender identity slot rendered beside a [`Message`].
///
/// The slot reserves the shared `size-8` baseline; the message row keeps it
/// flush with the bottom edge of the visible message surface.
#[derive(IntoElement)]
pub struct MessageAvatar {
    style: StyleRefinement,
    children: Vec<AnyElement>,
}

impl MessageAvatar {
    /// Create an empty avatar slot.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            children: Vec::new(),
        }
    }
}

impl Default for MessageAvatar {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for MessageAvatar {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for MessageAvatar {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MessageAvatar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();

        let mut slot = div()
            .relative()
            .min_w(px(32.0))
            .flex_none()
            .flex()
            .flex_row()
            .items_center()
            .justify_center()
            .self_end()
            .overflow_hidden()
            .rounded(theme.radius_full())
            .bg(theme.muted);
        slot.style().refine(&self.style);
        slot.children(self.children)
    }
}

/// Header content such as a sender name and timestamp.
#[derive(IntoElement)]
pub struct MessageHeader {
    style: StyleRefinement,
    content_inset: Option<bool>,
    children: Vec<AnyElement>,
}

impl MessageHeader {
    /// Create an empty message header.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            content_inset: None,
            children: Vec::new(),
        }
    }

    /// Set whether the header keeps its default horizontal content inset.
    pub fn content_inset(mut self, content_inset: bool) -> Self {
        self.content_inset = Some(content_inset);
        self
    }

    fn with_inherited_content_inset(mut self, content_inset: bool) -> Self {
        self.content_inset.get_or_insert(content_inset);
        self
    }
}

impl Default for MessageHeader {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for MessageHeader {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for MessageHeader {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MessageHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();

        let mut header = div()
            .max_w_full()
            .min_w_0()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(4.0))
            .text_size(px(12.0))
            .line_height(relative(1.25))
            .font_weight(FontWeight::MEDIUM)
            .text_color(theme.muted_foreground);
        if self.content_inset.unwrap_or(true) {
            header = header.px(px(12.0));
        }
        header.style().refine(&self.style);
        header.children(self.children)
    }
}

/// The message body slot. It can contain bubbles, images, code, or files.
#[derive(IntoElement)]
pub struct MessageContent {
    style: StyleRefinement,
    alignment: MessageAlignment,
    has_ghost_bubble: bool,
    children: Vec<AnyElement>,
}

impl MessageContent {
    /// Create an empty message body.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            alignment: MessageAlignment::Start,
            has_ghost_bubble: false,
            children: Vec::new(),
        }
    }

    /// Add a typed bubble and inherit ghost-surface metadata layout.
    ///
    /// Ordinary `.child(...)` content remains available for arbitrary elements;
    /// use this builder when surrounding message slots should react to a
    /// bubble's variant.
    pub fn bubble(mut self, bubble: Bubble) -> Self {
        self.has_ghost_bubble |= bubble.is_ghost();
        self.children.push(bubble.into_any_element());
        self
    }

    fn aligned(mut self, alignment: MessageAlignment) -> Self {
        self.alignment = alignment;
        self
    }
}

impl Default for MessageContent {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for MessageContent {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for MessageContent {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MessageContent {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut body = div()
            .w_full()
            .max_w_full()
            .min_w_0()
            .flex()
            .flex_col()
            .gap(px(10.0));
        body = match self.alignment {
            MessageAlignment::Start => body.items_start(),
            MessageAlignment::End => body.items_end(),
        };
        body.style().refine(&self.style);
        body.children(self.children)
    }
}

/// Footer content such as delivery state, reactions, or action buttons.
#[derive(IntoElement)]
pub struct MessageFooter {
    style: StyleRefinement,
    content_inset: Option<bool>,
    children: Vec<AnyElement>,
}

impl MessageFooter {
    /// Create an empty message footer.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            content_inset: None,
            children: Vec::new(),
        }
    }

    /// Set whether the footer keeps its default horizontal content inset.
    pub fn content_inset(mut self, content_inset: bool) -> Self {
        self.content_inset = Some(content_inset);
        self
    }

    fn with_inherited_content_inset(mut self, content_inset: bool) -> Self {
        self.content_inset.get_or_insert(content_inset);
        self
    }
}

impl Default for MessageFooter {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for MessageFooter {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for MessageFooter {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MessageFooter {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();

        let mut footer = div()
            .max_w_full()
            .min_w_0()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(4.0))
            .text_size(px(12.0))
            .line_height(relative(1.25))
            .font_weight(FontWeight::MEDIUM)
            .text_color(theme.muted_foreground);
        if self.content_inset.unwrap_or(true) {
            footer = footer.px(px(12.0));
        }
        footer.style().refine(&self.style);
        footer.children(self.children)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::div;

    #[test]
    fn builder_wires_every_named_slot() {
        let stack_style = StyleRefinement::default().gap(px(4.0));
        let message = Message::new()
            .alignment(MessageAlignment::End)
            .with_stack_style(stack_style.clone())
            .avatar_slot(MessageAvatar::new().child(div()))
            .header(MessageHeader::new().content_inset(false).child("Alice"))
            .content(MessageContent::new().child("Hello"))
            .footer(MessageFooter::new().content_inset(false).child("Delivered"));

        assert_eq!(message.alignment, MessageAlignment::End);
        assert_eq!(message.stack_style, stack_style);
        assert!(message.avatar.is_some());
        assert!(message.header.is_some());
        assert!(message.content.is_some());
        assert!(message.footer.is_some());
        assert_eq!(message.header.as_ref().unwrap().content_inset, Some(false));
        assert_eq!(message.footer.as_ref().unwrap().content_inset, Some(false));

        let group = MessageGroup::new().child("First").child("Second");
        assert_eq!(group.children.len(), 2);

        let avatar = MessageAvatar::new().child("ME");
        assert_eq!(avatar.children.len(), 1);
    }

    #[test]
    fn content_alignment_is_private_to_the_message_row() {
        let content = MessageContent::new().aligned(MessageAlignment::End);
        assert_eq!(content.alignment, MessageAlignment::End);
    }

    /// A ghost bubble anywhere in the body drops the surrounding slots' content
    /// inset; an explicit `content_inset` on the slot still wins.
    #[test]
    fn ghost_bubble_inherits_message_slot_insets() {
        use crate::components::primitive::bubble::BubbleVariant;

        let content = MessageContent::new()
            .bubble(Bubble::new())
            .bubble(Bubble::new().with_variant(BubbleVariant::Ghost));

        assert!(content.has_ghost_bubble);
        assert_eq!(content.children.len(), 2);
        assert_eq!(
            MessageHeader::new()
                .with_inherited_content_inset(false)
                .content_inset,
            Some(false)
        );
        assert_eq!(
            MessageFooter::new()
                .with_inherited_content_inset(false)
                .content_inset,
            Some(false)
        );
        assert_eq!(
            MessageHeader::new()
                .content_inset(true)
                .with_inherited_content_inset(false)
                .content_inset,
            Some(true)
        );
        assert_eq!(
            MessageFooter::new()
                .content_inset(true)
                .with_inherited_content_inset(false)
                .content_inset,
            Some(true)
        );
    }

    /// A bubble-free body reports no ghost surface.
    #[test]
    fn plain_bubbles_leave_the_inset_alone() {
        let content = MessageContent::new().bubble(Bubble::new());
        assert!(!content.has_ghost_bubble);
    }
}
