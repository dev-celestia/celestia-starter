//! Description list — the desktop counterpart of
//! `packages/ui/src/components/primitive/description-list.tsx`.
//!
//! Written directly on `gpui`. A key/value metadata table that packs entries
//! into a fixed column grid: each entry declares how many columns it spans, and
//! [`DescriptionList::group_item_rows`] flows them into rows so a wide value
//! never straddles a row boundary.
//!
//! [`DescriptionListSize`] is this crate's own metric bucket. The component
//! library's shared `Sizable`/`Size` pair belongs to the theming service — the
//! last piece scheduled to move — so the bucket is re-declared here to keep
//! this module free of the facade in the meantime.

use gpui::prelude::FluentBuilder as _;
use gpui::{
    AnyElement, App, Axis, DefiniteLength, IntoElement, ParentElement as _, Refineable as _,
    RenderOnce, SharedString, StyleRefinement, Styled, Window, div, px, relative,
};

use crate::theme::ActiveTheme as _;

/// Metric bucket for a [`DescriptionList`].
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum DescriptionListSize {
    /// Tightest spacing.
    XSmall,
    /// Compact spacing.
    Small,
    /// The default.
    #[default]
    Medium,
    /// Roomiest spacing.
    Large,
}

/// One entry of a [`DescriptionList`].
pub enum DescriptionItem {
    /// A label/value pair spanning `span` columns.
    Item {
        /// The key.
        label: DescriptionText,
        /// The value.
        value: DescriptionText,
        /// How many columns the pair occupies.
        span: usize,
    },
    /// A full-width rule between groups of entries.
    Separator,
}

/// The label or value of a [`DescriptionItem`] — plain text or any element.
#[derive(IntoElement)]
pub enum DescriptionText {
    /// Plain text.
    String(SharedString),
    /// A caller-built element.
    AnyElement(AnyElement),
}

impl From<&str> for DescriptionText {
    fn from(text: &str) -> Self {
        Self::String(SharedString::from(text.to_string()))
    }
}

impl From<String> for DescriptionText {
    fn from(text: String) -> Self {
        Self::String(SharedString::from(text))
    }
}

impl From<SharedString> for DescriptionText {
    fn from(text: SharedString) -> Self {
        Self::String(text)
    }
}

impl From<AnyElement> for DescriptionText {
    fn from(element: AnyElement) -> Self {
        Self::AnyElement(element)
    }
}

impl RenderOnce for DescriptionText {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        match self {
            Self::String(text) => div().child(text).into_any_element(),
            Self::AnyElement(element) => element,
        }
    }
}

impl DescriptionItem {
    /// An entry labelled `label` with an empty value.
    pub fn new(label: impl Into<DescriptionText>) -> Self {
        Self::Item {
            label: label.into(),
            value: "".into(),
            span: 1,
        }
    }

    /// Set the entry's value.
    pub fn value(mut self, value: impl Into<DescriptionText>) -> Self {
        if let Self::Item { value: slot, .. } = &mut self {
            *slot = value.into();
        }
        self
    }

    /// Set how many columns the entry spans. No-op on [`DescriptionItem::Separator`].
    pub fn span(mut self, span: usize) -> Self {
        if let Self::Item { span: slot, .. } = &mut self {
            *slot = span;
        }
        self
    }

    fn columns_spanned(&self) -> Option<usize> {
        match self {
            Self::Item { span, .. } => Some(*span),
            Self::Separator => None,
        }
    }
}

/// A key/value metadata table.
#[derive(IntoElement)]
pub struct DescriptionList {
    style: StyleRefinement,
    items: Vec<DescriptionItem>,
    size: DescriptionListSize,
    layout: Axis,
    label_width: DefiniteLength,
    bordered: bool,
    columns: usize,
}

impl DescriptionList {
    /// A bordered, three-column list with horizontal label/value pairs.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            items: Vec::new(),
            layout: Axis::Horizontal,
            label_width: px(120.0).into(),
            size: DescriptionListSize::default(),
            bordered: true,
            columns: 3,
        }
    }

    /// Stack each label above its value.
    pub fn vertical() -> Self {
        Self::new().layout(Axis::Vertical)
    }

    /// Place each label beside its value — the default.
    pub fn horizontal() -> Self {
        Self::new().layout(Axis::Horizontal)
    }

    /// Set the label column width. Horizontal layout only. Defaults to `120px`.
    pub fn label_width(mut self, label_width: impl Into<DefiniteLength>) -> Self {
        self.label_width = label_width.into();
        self
    }

    /// Set the label/value axis.
    pub fn layout(mut self, layout: Axis) -> Self {
        self.layout = layout;
        self
    }

    /// Toggle the surrounding border. Horizontal layout only. Defaults to `true`.
    pub fn bordered(mut self, bordered: bool) -> Self {
        self.bordered = bordered;
        self
    }

    /// Set the column count, clamped to `1..=10`. Defaults to `3`.
    pub fn columns(mut self, columns: usize) -> Self {
        self.columns = columns.clamp(1, 10);
        self
    }

    /// Set the metric bucket.
    pub fn size(mut self, size: DescriptionListSize) -> Self {
        self.size = size;
        self
    }

    /// Append a label/value pair spanning `span` columns.
    pub fn item(
        mut self,
        label: impl Into<DescriptionText>,
        value: impl Into<DescriptionText>,
        span: usize,
    ) -> Self {
        self.items.push(DescriptionItem::Item {
            label: label.into(),
            value: value.into(),
            span,
        });
        self
    }

    /// Append an entry.
    pub fn child(mut self, child: impl Into<DescriptionItem>) -> Self {
        self.items.push(child.into());
        self
    }

    /// Append several entries.
    pub fn children(
        mut self,
        children: impl IntoIterator<Item = impl Into<DescriptionItem>>,
    ) -> Self {
        self.items.extend(children.into_iter().map(Into::into));
        self
    }

    /// Append a full-width separator.
    pub fn separator(mut self) -> Self {
        self.items.push(DescriptionItem::Separator);
        self
    }

    /// Flow `items` into rows of at most `columns` columns.
    ///
    /// An entry whose span would overflow the current row starts a new one, so
    /// a wide entry is never split across rows. A [`DescriptionItem::Separator`]
    /// spans the full width.
    fn group_item_rows(items: Vec<DescriptionItem>, columns: usize) -> Vec<Vec<DescriptionItem>> {
        let mut rows: Vec<Vec<DescriptionItem>> = vec![];
        let mut used = 0usize;

        for item in items {
            let span = item.columns_spanned().unwrap_or(columns);
            if rows.is_empty() {
                rows.push(vec![]);
            }
            if used + span > columns {
                rows.push(vec![]);
                used = 0;
            }
            rows.last_mut().expect("a row was pushed above").push(item);
            used += span;
        }

        // Drop the trailing row if nothing landed in it.
        while rows.last().is_some_and(|row| row.is_empty()) {
            rows.pop();
        }

        rows
    }
}

impl Default for DescriptionList {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for DescriptionList {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for DescriptionList {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let Self {
            items,
            size,
            layout,
            label_width,
            bordered,
            columns,
            style,
        } = self;
        let theme = cx.theme();

        let (base_gap, padding_x, padding_y) = match size {
            DescriptionListSize::XSmall | DescriptionListSize::Small => (px(2.0), px(4.0), px(2.0)),
            DescriptionListSize::Medium => (px(4.0), px(8.0), px(4.0)),
            DescriptionListSize::Large => (px(8.0), px(12.0), px(6.0)),
        };
        // An unbordered list carries the spacing as gaps; a bordered one moves
        // it into cell padding and closes the gaps so the rules join up.
        let (padding_x, padding_y, gap) = if bordered {
            (padding_x, padding_y, px(0.0))
        } else {
            (px(0.0), px(0.0), base_gap)
        };
        let label_width = (layout == Axis::Horizontal).then_some(label_width);
        let horizontal = layout == Axis::Horizontal;

        let rows = Self::group_item_rows(items, columns);
        let row_count = rows.len();

        let mut root = div()
            .flex()
            .flex_col()
            .gap(gap)
            .overflow_hidden()
            .when(bordered, |this| {
                this.rounded(theme.radius)
                    .border_1()
                    .border_color(theme.border)
            });
        // The caller's `Styled` chain wins over the defaults above.
        root.style().refine(&style);

        root.children(rows.into_iter().enumerate().map(|(row_ix, row)| {
            let is_last_row = row_ix + 1 == row_count;

            let row_el = div()
                .flex()
                .flex_row()
                .when(bordered && !is_last_row, |this| {
                    this.border_b_1().border_color(theme.border)
                });

            row_el.children(
                row.into_iter()
                    .enumerate()
                    .map(|(item_ix, item)| match item {
                        DescriptionItem::Item { label, value, span } => {
                            let mut label_el = div()
                                .when(horizontal, |this| this.h_full())
                                .text_color(theme.description_list_label_foreground)
                                .text_size(px(14.0))
                                .px(padding_x)
                                .py(padding_y)
                                .when(bordered, |this| {
                                    this.when(horizontal, |this| {
                                        this.border_r_1()
                                            .when(item_ix != 0, |this| this.border_l_1())
                                    })
                                    .when(!horizontal, |this| this.border_b_1())
                                    .border_color(theme.border)
                                    .bg(theme.tokens.description_list_label)
                                })
                                .when_some(label_width, |this, width| {
                                    this.w(width).flex_shrink_0()
                                });
                            label_el = label_el.child(label);

                            div()
                                .flex()
                                .flex_row()
                                .h_full()
                                .flex_1()
                                .flex_basis(relative(span as f32 / columns as f32))
                                .overflow_x_hidden()
                                .child(label_el)
                                .child(
                                    div()
                                        .flex_1()
                                        .px(padding_x)
                                        .py(padding_y)
                                        .overflow_hidden()
                                        .child(value),
                                )
                        }
                        DescriptionItem::Separator => {
                            div().h(px(8.0)).w_full().when(bordered, |this| {
                                this.bg(theme.tokens.description_list_label)
                            })
                        }
                    }),
            )
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::{DescriptionItem, DescriptionList};

    /// The row packer is the whole point of the component: an entry that would
    /// overflow its row must start a new one rather than straddle the boundary.
    #[test]
    fn entries_never_straddle_a_row_boundary() {
        let items = vec![
            DescriptionItem::new("test1"),
            DescriptionItem::new("test2").span(2),
            DescriptionItem::new("test3"),
            DescriptionItem::new("test4"),
            DescriptionItem::new("test5"),
            DescriptionItem::new("test6").span(3),
            DescriptionItem::new("test7"),
        ];

        let rows = DescriptionList::group_item_rows(items, 3);

        assert_eq!(rows.len(), 4);
        assert_eq!(rows[0].len(), 2);
        assert_eq!(rows[1].len(), 3);
        assert_eq!(rows[2].len(), 1);
        assert_eq!(rows[3].len(), 1);
    }

    /// A separator claims the whole width, so it always starts a fresh row.
    #[test]
    fn a_separator_claims_the_full_row() {
        let items = vec![
            DescriptionItem::new("a"),
            DescriptionItem::Separator,
            DescriptionItem::new("b"),
        ];

        let rows = DescriptionList::group_item_rows(items, 3);

        assert_eq!(rows.len(), 3);
        assert_eq!(rows[0].len(), 1);
        assert_eq!(rows[1].len(), 1);
        assert_eq!(rows[2].len(), 1);
    }

    /// An empty list produces no rows at all — not one empty row.
    #[test]
    fn an_empty_list_has_no_rows() {
        assert!(DescriptionList::group_item_rows(vec![], 3).is_empty());
    }

    #[test]
    fn columns_are_clamped_to_the_documented_range() {
        assert_eq!(DescriptionList::new().columns(0).columns, 1);
        assert_eq!(DescriptionList::new().columns(99).columns, 10);
        assert_eq!(DescriptionList::new().columns(4).columns, 4);
    }
}
