//! Pagination — the desktop counterpart of
//! `packages/ui/src/components/composite/pagination.tsx`.
//!
//! The web composite exports a `nav` landmark plus its ingredients
//! (`PaginationLink` ghost/outline buttons, `PaginationPrevious` /
//! `PaginationNext` with the plain-English defaults `"Previous"` / `"Next"`,
//! and an `aria-hidden` `DotsThree` ellipsis). The desktop assembles the same
//! ingredients into one controlled [`Pagination`] built on the crate's own
//! [`Button`]: ghost page links that turn outline when active (web
//! `isActive`), caret nav buttons, and a dots ellipsis.
//!
//! Provenance: this file used to re-export `gpui-component`'s `Pagination`,
//! which drove everything from `gpui_base`'s pagination state machine and
//! rendered with `gpui-component`'s `Button`/`Icon`/`PopupMenu` and
//! `rust_i18n` labels. The state machine now lives here — [`PaginationState`]
//! and [`PaginationItem`] are a verbatim port of `gpui_base::PaginationState`
//! / `PaginationItem` (including the ellipsis windowing algorithm) — and the
//! rendering is the crate's [`Button`] with Phosphor carets.
//!
//! Deliberate deviations from the `gpui-component` shim:
//!
//! - **Labels.** Plain English `"Previous"` / `"Next"` — the same defaults web
//!   ships — instead of `rust_i18n` keys, per the crate's no-i18n convention.
//! - **The ellipsis is presentational.** Web renders it as a non-interactive
//!   `aria-hidden` span; upstream `gpui-component` attached a dropdown menu
//!   listing the hidden range. That menu rode `gpui-component`'s menu family,
//!   which this file must not import, so the ellipsis keeps the web's
//!   static-button behavior until the menu family migrates.
//! - **Icon-only pieces map onto the square icon steps.** The crate `Button`
//!   has no `compact` step, so the compact nav buttons and the ellipsis
//!   resolve their [`Size`] to a square [`ButtonSize`] (web's `size-8`
//!   ellipsis is exactly the `Icon` step) instead of a padded one.

use std::{ops::Range, rc::Rc};

use gpui::{
    App, ElementId, InteractiveElement as _, IntoElement, ParentElement, Refineable as _,
    RenderOnce, Role, SharedString, StatefulInteractiveElement as _, StyleRefinement, Styled,
    Window, prelude::FluentBuilder as _,
};

use crate::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use crate::components::primitive::icon::PhosphorIcon;
use crate::components::traits::{Disableable, Sizable, Size, h_flex};

type PageChangeHandler = Rc<dyn Fn(usize, &mut Window, &mut App)>;

/// A visible destination in a pagination control.
#[derive(Debug, Clone, Eq, PartialEq)]
pub enum PaginationItem {
    /// A numbered page link.
    Page(usize),
    /// A collapsed run of pages `[start, end)` — web's ellipsis slot. The
    /// range never includes page 1 or the last page, which are always
    /// rendered as [`PaginationItem::Page`].
    Ellipsis(Range<usize>),
}

/// The controlled behavior shared by every part of a pagination control.
///
/// Ported verbatim from `gpui_base::PaginationState`, which the shim reached
/// through `gpui_component::pagination`: clamped construction, the disabled
/// and bounds guards on [`PaginationState::request_page`], and the windowed
/// [`PaginationState::items`] listing.
#[derive(Clone)]
pub struct PaginationState {
    current_page: usize,
    total_pages: usize,
    visible_pages: usize,
    disabled: bool,
    on_change: Option<PageChangeHandler>,
}

impl PaginationState {
    pub fn new(current_page: usize, total_pages: usize) -> Self {
        let total_pages = total_pages.max(1);
        Self {
            current_page: current_page.clamp(1, total_pages),
            total_pages,
            visible_pages: 5,
            disabled: false,
            on_change: None,
        }
    }

    pub fn visible_pages(mut self, visible_pages: usize) -> Self {
        self.visible_pages = visible_pages.max(5);
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Handles a requested page change.
    ///
    /// Unlike the element-level controls, this is a model-level request that
    /// may also come from the keyboard or from application code, so it does
    /// not carry a pointer event.
    pub fn on_change(mut self, handler: impl Fn(usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_change = Some(Rc::new(handler));
        self
    }

    pub fn current_page(&self) -> usize {
        self.current_page
    }

    pub fn total_pages(&self) -> usize {
        self.total_pages
    }

    pub fn is_disabled(&self) -> bool {
        self.disabled
    }

    pub fn has_on_change(&self) -> bool {
        self.on_change.is_some()
    }

    pub fn previous_page(&self) -> Option<usize> {
        (!self.disabled && self.current_page > 1).then(|| self.current_page - 1)
    }

    pub fn next_page(&self) -> Option<usize> {
        (!self.disabled && self.current_page < self.total_pages).then(|| self.current_page + 1)
    }

    /// Requests a controlled page change after applying the shared disabled,
    /// bounds, and current-page guards.
    pub fn request_page(&self, page: usize, window: &mut Window, cx: &mut App) {
        if self.disabled || page == self.current_page || !(1..=self.total_pages).contains(&page) {
            return;
        }

        if let Some(on_change) = &self.on_change {
            on_change(page, window, cx);
        }
    }

    pub fn items(&self) -> Vec<PaginationItem> {
        calculate_items(self.current_page, self.total_pages, self.visible_pages)
    }
}

/// Pagination with page navigation, next and previous links.
#[derive(IntoElement)]
pub struct Pagination {
    id: ElementId,
    style: StyleRefinement,
    size: Size,
    current_page: usize,
    total_pages: usize,
    disabled: bool,
    compact: bool,
    visible_pages: usize,
    on_click: Option<Rc<dyn Fn(&usize, &mut Window, &mut App)>>,
}

impl Pagination {
    /// Create a new Pagination component with the given ID.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            size: Size::default(),
            current_page: 1,
            total_pages: 1,
            visible_pages: 5,
            disabled: false,
            compact: false,
            on_click: None,
        }
    }

    /// Set the current page number (1-based).
    ///
    /// The value will be clamped between 1 and total_pages when total_pages is set.
    pub fn current_page(mut self, page: usize) -> Self {
        self.current_page = page.max(1);
        self
    }

    /// Set the total number of pages.
    pub fn total_pages(mut self, pages: usize) -> Self {
        self.total_pages = pages.max(1);
        if self.current_page > self.total_pages {
            self.current_page = self.total_pages;
        }
        self
    }

    /// Set the handler for page change (when clicking on page numbers, prev, or next).
    ///
    /// This handler receives the new page number to navigate to.
    ///
    /// # Examples
    ///
    /// ```ignore
    /// Pagination::new("my-pagination")
    ///     .current_page(current_page)
    ///     .total_pages(total_pages)
    ///     .on_click(|page, _, cx| {
    ///         // Handle page change
    ///     })
    /// ```
    pub fn on_click(mut self, handler: impl Fn(&usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }

    /// Set to display as compact style.
    ///
    /// If true, only the prev, next buttons with only icon.
    pub fn compact(mut self) -> Self {
        self.compact = true;
        self
    }

    /// Set viewable maximum number of page buttons, default
    pub fn visible_pages(mut self, max: usize) -> Self {
        self.visible_pages = max;
        self
    }
}

impl Disableable for Pagination {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Sizable for Pagination {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into();
        self
    }
}

impl Styled for Pagination {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Pagination {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let state = PaginationState::new(self.current_page, self.total_pages)
            .visible_pages(self.visible_pages)
            .disabled(self.disabled);
        let state = match self.on_click.clone() {
            Some(on_click) => state.on_change(move |page, window, cx| on_click(&page, window, cx)),
            None => state,
        };
        let page_numbers = (!self.compact).then(|| state.items()).unwrap_or_default();

        let current_page = state.current_page();
        let is_disabled = self.disabled;
        let item_state = state.clone();
        let size = self.size;

        // `h_flex()` carries the `.items_center()` the upstream chain spelled
        // out after its own flex-row helper; `px_2().py_2().gap_1()` is the
        // shim's container rhythm.
        let mut root = h_flex()
            .id(self.id.clone())
            .role(Role::Navigation)
            .aria_label("Pagination")
            .px_2()
            .py_2()
            .gap_1();
        // The caller's `Styled` chain wins over the default above.
        root.style().refine(&self.style);

        root.child(nav_button("prev", true, &state, size, self.compact))
            .children(page_numbers.into_iter().map(|item| match item {
                PaginationItem::Page(page) => {
                    let is_selected = page == current_page;

                    let mut button = Button::new(page)
                        .with_size(size)
                        .label(page.to_string())
                        .variant(if is_selected {
                            ButtonVariant::Outline
                        } else {
                            ButtonVariant::Ghost
                        })
                        .disabled(is_disabled);
                    // The current page is where you already are; a control
                    // with no `on_click` has nowhere to send the rest.
                    if !is_selected && item_state.has_on_change() {
                        let state = item_state.clone();
                        button = button.on_click(move |_, window, cx| {
                            state.request_page(page, window, cx);
                        });
                    }
                    button.into_any_element()
                }
                PaginationItem::Ellipsis(range) => {
                    // Presentational, per web's `aria-hidden` ellipsis — see
                    // the module docs for the dropped dropdown.
                    Button::icon(
                        SharedString::from(format!("ellipsis-{}-{}", range.start, range.end)),
                        PhosphorIcon::DotsThree,
                    )
                    .size(icon_step(size))
                    .variant(ButtonVariant::Ghost)
                    .disabled(is_disabled)
                    .into_any_element()
                }
            }))
            .child(nav_button("next", false, &state, size, self.compact))
    }
}

/// The prev/next control — web's `PaginationPrevious` / `PaginationNext`: a
/// ghost surface with a caret and the plain-English label, or the caret alone
/// in `compact` mode, where the tooltip carries the label.
fn nav_button(
    id: &'static str,
    is_prev: bool,
    state: &PaginationState,
    size: Size,
    compact: bool,
) -> Button {
    let (label, caret) = if is_prev {
        ("Previous", PhosphorIcon::CaretLeft)
    } else {
        ("Next", PhosphorIcon::CaretRight)
    };

    let target_page = if is_prev {
        state.previous_page()
    } else {
        state.next_page()
    };

    // The caret sits on the side of travel: leading for prev, trailing for
    // next — exactly web's `data-icon="inline-start"` / `"inline-end"` slots.
    let button = if compact {
        Button::icon(id, caret)
            .size(icon_step(size))
            .variant(ButtonVariant::Ghost)
    } else if is_prev {
        Button::new(id)
            .leading_icon(caret)
            .label(label)
            .variant(ButtonVariant::Ghost)
            .with_size(size)
    } else {
        Button::new(id)
            .label(label)
            .trailing_icon(caret)
            .variant(ButtonVariant::Ghost)
            .with_size(size)
    };

    // A nav button at the boundary — or in a disabled control — renders
    // disabled, because `previous_page` / `next_page` return `None` there.
    // Clicks are only wired when there is a handler to receive them.
    button
        .disabled(target_page.is_none())
        .tooltip(label)
        .when_some(
            target_page.filter(|_| state.has_on_change()),
            |button, target_page| {
                let state = state.clone();
                button.on_click(move |_, window, cx| state.request_page(target_page, window, cx))
            },
        )
}

/// The square [`ButtonSize`] step for an icon-only control at a [`Size`]
/// step — the compact prev/next and the ellipsis. See the module docs.
fn icon_step(size: Size) -> ButtonSize {
    match size {
        Size::XSmall => ButtonSize::IconXs,
        Size::Small => ButtonSize::IconSm,
        Size::Large => ButtonSize::IconLg,
        _ => ButtonSize::Icon,
    }
}

/// The ellipsis windowing algorithm, verbatim from `gpui_base`: page 1 and
/// the last page are always visible, `side_pages` neighbors surround the
/// current page, and every run the window leaves out collapses into an
/// [`PaginationItem::Ellipsis`] range.
fn calculate_items(current: usize, total: usize, max_visible: usize) -> Vec<PaginationItem> {
    if total <= 1 {
        return vec![];
    }

    let max_visible = max_visible.max(5);
    if total <= max_visible {
        return (1..=total).map(PaginationItem::Page).collect();
    }

    let mut pages = vec![PaginationItem::Page(1)];
    let side_pages = (max_visible - 3) / 2;
    let start = if current <= side_pages + 1 {
        2
    } else if current > total - side_pages - 1 {
        total - side_pages - 1
    } else {
        current - side_pages
    };

    if start > 2 {
        pages.push(PaginationItem::Ellipsis(2..start));
    }

    let end = if current >= total - side_pages {
        total - 1
    } else if current <= side_pages + 1 {
        side_pages + 2
    } else {
        current + side_pages
    };

    pages.extend((start..=end).map(PaginationItem::Page));
    if end < total - 1 {
        pages.push(PaginationItem::Ellipsis(end + 1..total));
    }
    pages.push(PaginationItem::Page(total));
    pages
}

#[cfg(test)]
mod tests {
    use std::cell::Cell;

    use gpui::{Element as _, TestAppContext, accesskit};

    use super::*;

    #[test]
    fn clamps_controlled_values_and_navigation_boundaries() {
        let first = PaginationState::new(0, 0);
        assert_eq!(first.current_page(), 1);
        assert_eq!(first.total_pages(), 1);
        assert_eq!(first.previous_page(), None);
        assert_eq!(first.next_page(), None);

        let last = PaginationState::new(20, 10);
        assert_eq!(last.current_page(), 10);
        assert_eq!(last.previous_page(), Some(9));
        assert_eq!(last.next_page(), None);
        assert_eq!(last.clone().disabled(true).previous_page(), None);
    }

    #[test]
    fn creates_pages_and_navigable_ellipsis_ranges() {
        assert_eq!(
            PaginationState::new(5, 10).visible_pages(7).items(),
            vec![
                PaginationItem::Page(1),
                PaginationItem::Ellipsis(2..3),
                PaginationItem::Page(3),
                PaginationItem::Page(4),
                PaginationItem::Page(5),
                PaginationItem::Page(6),
                PaginationItem::Page(7),
                PaginationItem::Ellipsis(8..10),
                PaginationItem::Page(10),
            ]
        );
    }

    /// A single-page control renders no page buttons at all — just the nav
    /// pair, which both sit at their boundaries and therefore render
    /// disabled.
    #[test]
    fn single_page_controls_have_no_items() {
        assert_eq!(PaginationState::new(1, 1).items(), Vec::new());
    }

    #[gpui::test]
    fn validates_every_page_change_request(cx: &mut TestAppContext) {
        let window = cx.add_empty_window();
        window.update(|window, cx| {
            let requested = Rc::new(Cell::new(None));
            let state = PaginationState::new(3, 5).on_change({
                let requested = requested.clone();
                move |page, _, _| requested.set(Some(page))
            });

            state.request_page(3, window, cx);
            state.request_page(0, window, cx);
            state.request_page(6, window, cx);
            assert_eq!(requested.get(), None);

            state.request_page(4, window, cx);
            assert_eq!(requested.get(), Some(4));
            requested.set(None);
            state.clone().disabled(true).request_page(2, window, cx);
            assert_eq!(requested.get(), None);
        });
    }

    /// The container is a named navigation landmark, mirroring web's
    /// `<nav aria-label="pagination">`. The role rides `a11y_role()` at paint
    /// time, so the node is seeded with the role the container declares and
    /// the assertion pins the label `write_a11y_info` writes.
    #[gpui::test]
    fn exposes_a_named_navigation_landmark(cx: &mut TestAppContext) {
        let window = cx.add_empty_window();
        window.update(|window, cx| {
            let mut node = accesskit::Node::new(accesskit::Role::Navigation);
            Pagination::new("pagination")
                .total_pages(5)
                .render(window, cx)
                .into_element()
                .write_a11y_info(&mut node);

            assert_eq!(node.role(), accesskit::Role::Navigation);
            assert_eq!(node.label(), Some("Pagination"));
        });
    }

    /// Every builder branch painted: both display modes, every page-button
    /// surface (ghost, outline, disabled), boundary nav buttons, and an
    /// ellipsis (8 pages with 5 visible produces one).
    struct TestView;

    impl gpui::Render for TestView {
        fn render(&mut self, _: &mut Window, _: &mut gpui::Context<Self>) -> impl IntoElement {
            gpui::div()
                .flex()
                .flex_col()
                .gap_2()
                .child(Pagination::new("pg-demo").total_pages(8).current_page(3))
                .child(
                    Pagination::new("pg-compact")
                        .total_pages(12)
                        .current_page(6)
                        .compact(),
                )
                .child(
                    Pagination::new("pg-disabled")
                        .total_pages(4)
                        .current_page(2)
                        .disabled(true),
                )
                .child(
                    Pagination::new("pg-windowed")
                        .total_pages(20)
                        .current_page(10)
                        .visible_pages(9)
                        .on_click(|_, _, _| {}),
                )
                .child(Pagination::new("pg-small").total_pages(3).small())
        }
    }

    #[gpui::test]
    fn pagination_renders_without_panic(cx: &mut TestAppContext) {
        cx.update(|cx| {
            crate::init(cx);
        });

        let _window = cx.add_window(|_window, _cx| TestView);
    }
}
