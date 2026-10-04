//! Label — the desktop counterpart of gpui-component's `Label`, reimplemented
//! on raw `gpui`. The web `label.tsx` is a plain form caption; the desktop
//! control carries the richer surface the reference app needs, so this is a
//! superset rather than a mirror.
//!
//! Three capabilities ride on one `StyledText`:
//!
//! - **secondary** — a muted tail appended after the main label. The two are
//!   concatenated into a single string and coloured by *byte range*, not by two
//!   sibling elements, so the whole thing wraps as one paragraph.
//! - **masked** — every character is replaced by a bullet (`•`). The count is
//!   taken in `chars()`, not bytes, so a masked CJK label is not three times too
//!   long. Masking also suppresses highlights: there is nothing legible to
//!   highlight.
//! - **highlights** — the matched search term is tinted `theme.blue`. A `Full`
//!   match finds every occurrence, overlapping included; a `Prefix` match only
//!   fires when the text starts with the term.
//!
//! Ranges are byte offsets into the UTF-8 string, which is why the full-match
//! loop advances to the next `char_boundary` rather than by one byte.

use std::ops::Range;

use gpui::{
    App, HighlightStyle, IntoElement, ParentElement as _, Refineable as _, RenderOnce,
    SharedString, StyleRefinement, Styled, StyledText, Window, div, prelude::FluentBuilder as _,
    rems,
};

use crate::theme::ActiveTheme as _;

/// The character a masked label draws in place of every visible one.
const MASKED: &str = "•";

/// Which occurrences of a search term a label highlights.
#[derive(Clone)]
pub enum HighlightsMatch {
    /// Only a term at the very start of the text.
    Prefix(SharedString),
    /// Every occurrence, anywhere.
    Full(SharedString),
}

impl HighlightsMatch {
    /// The search term.
    pub fn as_str(&self) -> &str {
        match self {
            Self::Prefix(s) => s.as_str(),
            Self::Full(s) => s.as_str(),
        }
    }

    /// Whether this is a prefix match.
    #[inline]
    pub fn is_prefix(&self) -> bool {
        matches!(self, Self::Prefix(_))
    }
}

impl From<&str> for HighlightsMatch {
    fn from(value: &str) -> Self {
        Self::Full(value.to_string().into())
    }
}

impl From<String> for HighlightsMatch {
    fn from(value: String) -> Self {
        Self::Full(value.into())
    }
}

impl From<SharedString> for HighlightsMatch {
    fn from(value: SharedString) -> Self {
        Self::Full(value)
    }
}

/// A text label with an optional muted tail, masking, and search highlighting.
#[derive(IntoElement)]
pub struct Label {
    style: StyleRefinement,
    label: SharedString,
    secondary: Option<SharedString>,
    masked: bool,
    highlights_text: Option<HighlightsMatch>,
}

impl Label {
    /// Create a new label.
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            label: label.into(),
            secondary: None,
            masked: false,
            highlights_text: None,
        }
    }

    /// Append secondary text after the label, drawn in `muted_foreground`.
    pub fn secondary(mut self, secondary: impl Into<SharedString>) -> Self {
        self.secondary = Some(secondary.into());
        self
    }

    /// Replace every character with a bullet.
    pub fn masked(mut self, masked: bool) -> Self {
        self.masked = masked;
        self
    }

    /// Tint the occurrences of `text` that match.
    pub fn highlights(mut self, text: impl Into<HighlightsMatch>) -> Self {
        self.highlights_text = Some(text.into());
        self
    }

    /// The label and its secondary tail as one string.
    fn full_text(&self) -> SharedString {
        match &self.secondary {
            Some(secondary) => format!("{} {}", self.label, secondary).into(),
            None => self.label.clone(),
        }
    }

    /// The byte ranges to colour: the label/secondary split first, then any
    /// search matches.
    fn highlight_ranges(&self, total_length: usize) -> Vec<Range<usize>> {
        let mut ranges = Vec::new();
        let full_text = self.full_text();

        if self.secondary.is_some() {
            ranges.push(0..self.label.len());
            ranges.push(self.label.len()..total_length);
        }

        if let Some(matched) = &self.highlights_text {
            let matched_str = matched.as_str();
            if !matched_str.is_empty() {
                let search_lower = matched_str.to_lowercase();
                let full_text_lower = full_text.to_lowercase();

                if matched.is_prefix() {
                    // A prefix match only fires at the very start.
                    if full_text_lower.starts_with(&search_lower) {
                        ranges.push(0..matched_str.len());
                    }
                } else {
                    // A full match walks every occurrence, overlaps included.
                    let mut search_start = 0;
                    while let Some(pos) = full_text_lower[search_start..].find(&search_lower) {
                        let match_start = search_start + pos;
                        let match_end = match_start + matched_str.len();

                        if match_end <= full_text.len() {
                            ranges.push(match_start..match_end);
                        }

                        search_start = match_start + 1;
                        while !full_text.is_char_boundary(search_start)
                            && search_start < full_text.len()
                        {
                            search_start += 1;
                        }

                        if search_start >= full_text.len() {
                            break;
                        }
                    }
                }
            }
        }

        ranges
    }

    /// Turn the ranges into styled highlights, or `None` when there is nothing
    /// to colour.
    fn measure_highlights(
        &self,
        length: usize,
        cx: &mut App,
    ) -> Option<Vec<(Range<usize>, HighlightStyle)>> {
        // Nothing legible to highlight once the text is masked.
        if self.masked {
            return None;
        }

        let ranges = self.highlight_ranges(length);
        if ranges.is_empty() {
            return None;
        }

        let mut highlights = Vec::new();
        let mut highlight_ranges_added = 0;

        if self.secondary.is_some() {
            // The label keeps the inherited colour; only the tail is muted.
            highlights.push((ranges[0].clone(), HighlightStyle::default()));
            highlights.push((
                ranges[1].clone(),
                HighlightStyle {
                    color: Some(cx.theme().muted_foreground),
                    ..Default::default()
                },
            ));
            highlight_ranges_added = 2;
        }

        for range in ranges.iter().skip(highlight_ranges_added) {
            highlights.push((
                range.clone(),
                HighlightStyle {
                    color: Some(cx.theme().blue),
                    ..Default::default()
                },
            ));
        }

        Some(gpui::combine_highlights(vec![], highlights).collect())
    }
}

impl Styled for Label {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Label {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let mut text = self.full_text();
        // Count characters, not bytes, so a masked multi-byte label keeps its
        // visible length.
        let chars_count = text.chars().count();

        if self.masked {
            text = SharedString::from(MASKED.repeat(chars_count));
        }

        let highlights = self.measure_highlights(text.len(), cx);

        let mut root = div()
            .line_height(rems(1.25))
            .text_color(cx.theme().foreground);
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&self.style);

        root.child(
            StyledText::new(&text).when_some(highlights, |this, hl| this.with_highlights(hl)),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `Range<usize>` has several `PartialEq` impls in this dependency graph
    /// (`aho_corasick`, `regex_automata`), so an empty literal has to carry its
    /// type.
    fn no_ranges() -> Vec<Range<usize>> {
        Vec::new()
    }

    #[test]
    fn highlight_ranges_cover_the_secondary_split_and_matches() {
        // No highlights, no secondary.
        assert_eq!(Label::new("Hello World").highlight_ranges(11), no_ranges());

        // Secondary text produces two ranges: label, then tail (with its space).
        let label = Label::new("Hello").secondary("World");
        assert_eq!(label.highlight_ranges(11), vec![0..5, 5..11]);

        // Full match is case-insensitive and finds every occurrence.
        assert_eq!(
            Label::new("Hello World")
                .highlights("WORLD")
                .highlight_ranges(11),
            vec![6..11]
        );
        assert_eq!(
            Label::new("Hello Hello Hello")
                .highlights("Hello")
                .highlight_ranges(17),
            vec![0..5, 6..11, 12..17]
        );

        // No match, and an empty search, both produce nothing.
        assert_eq!(
            Label::new("Hello World")
                .highlights("xyz")
                .highlight_ranges(11),
            no_ranges()
        );
        assert_eq!(
            Label::new("Hello World")
                .highlights("")
                .highlight_ranges(11),
            no_ranges()
        );

        // Overlapping matches are all reported.
        let overlapping = Label::new("aaaa").highlights("aa").highlight_ranges(4);
        assert!(overlapping.len() >= 2);
        assert_eq!(overlapping[0], 0..2);
        assert_eq!(overlapping[1], 1..3);

        // A match that straddles the label/secondary boundary.
        assert_eq!(
            Label::new("Hello")
                .secondary("World")
                .highlights("o W")
                .highlight_ranges(11),
            vec![0..5, 5..11, 4..7]
        );
    }

    #[test]
    fn a_prefix_match_only_fires_at_the_start() {
        let prefix = |text: &str, term: &str, len: usize| {
            Label::new(text)
                .highlights(HighlightsMatch::Prefix(term.into()))
                .highlight_ranges(len)
        };

        assert_eq!(prefix("aaaa", "aa", 4), vec![0..2]);
        // Prefix is case-insensitive and single-shot.
        assert_eq!(prefix("Hello hello HELLO", "hello", 17), vec![0..5]);
        assert_eq!(prefix("Hello Hello", "Hello", 11), vec![0..5]);
        // Not at the start → no match.
        assert_eq!(prefix("xyz Hello", "Hello", 9), no_ranges());
        assert_eq!(prefix("Hello World", "xyz", 11), no_ranges());
        assert_eq!(prefix("Hello World", "", 11), no_ranges());
        // Full match on the same input finds both.
        assert_eq!(
            Label::new("Hello Hello")
                .highlights(HighlightsMatch::Full("Hello".into()))
                .highlight_ranges(11),
            vec![0..5, 6..11]
        );
    }

    #[test]
    fn unicode_matches_report_byte_ranges() {
        let text = "你好世界，Hello World";
        let label = Label::new(text).highlights("世界");
        let start = text.find("世界").unwrap();
        assert_eq!(
            label.highlight_ranges(text.len()),
            vec![start..start + "世界".len()]
        );

        // A prefix match on multi-byte text is still measured in bytes.
        assert_eq!(
            Label::new("你好世界你好")
                .highlights(HighlightsMatch::Prefix("你好".into()))
                .highlight_ranges("你好世界你好".len()),
            vec![0..6]
        );
    }

    #[test]
    fn masked_labels_report_their_character_count() {
        // `chars()` not `len()`: "é🙂" is 6 bytes but 2 characters.
        assert_eq!("é🙂".len(), 6);
        assert_eq!("é🙂".chars().count(), 2);
        assert_eq!(MASKED.repeat("é🙂".chars().count()), "••");
    }

    /// Masking suppresses highlights even when a term would otherwise match —
    /// there is no legible text left to point at.
    #[gpui::test]
    fn masked_labels_suppress_highlights(cx: &mut gpui::TestAppContext) {
        cx.update(crate::init);
        cx.update(|cx| {
            let label = Label::new("é🙂")
                .secondary("世界")
                .highlights("🙂 世")
                .masked(true);
            assert!(
                label
                    .measure_highlights(label.full_text().len(), cx)
                    .is_none()
            );
        });
    }
}
