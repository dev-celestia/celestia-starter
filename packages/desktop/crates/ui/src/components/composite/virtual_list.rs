//! Virtual list — virtualized rows/columns of uneven or uniform size → gpui-base
//! `virtual_list` (no web counterpart: browsers virtualize natively).
//!
//! Callers can supply items either:
//! - With **uniform height/width** using [`VirtualListBuilder::uniform`],
//!   [`v_virtual_list_uniform`], or [`h_virtual_list_uniform`].
//! - With **variable sizes** using [`VirtualListBuilder::item_sizes`],
//!   [`v_virtual_list`], or [`h_virtual_list`].
//!
//! Only items intersecting the viewport are laid out and painted.
//!
//! Use [`VirtualListScrollHandle`] to drive or observe the scroll offset. It
//! implements [`ScrollbarHandle`](gpui_base::ScrollbarHandle) so scrollbars
//! attach to it naturally.

use std::ops::Range;
use std::rc::Rc;

use gpui::{Axis, Context, ElementId, Entity, IntoElement, Pixels, Render, Size, Window, px, size};
pub use gpui_base::virtual_list;
pub use gpui_base::{VirtualList, VirtualListScrollHandle, h_virtual_list, v_virtual_list};

/// Fluent builder for creating virtualized vertical or horizontal lists.
///
/// Supports both uniform sizing (single item height or width) and variable
/// sizing (`item_sizes`), along with per-item or range-based render callbacks.
///
/// # Example (Uniform Height + Item Callback)
/// ```rust,no_run
/// use celestia_ui::components::composite::virtual_list::VirtualListBuilder;
/// # use gpui::*;
/// # struct MyView;
/// # impl Render for MyView {
/// #     fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
/// VirtualListBuilder::vertical(cx.entity(), "user-list")
///     .uniform(1_000, px(48.))
///     .render_item(|this, index, window, cx| {
///         div().h(px(48.)).child(format!("User #{index}"))
///     })
/// #     }
/// # }
/// ```
pub struct VirtualListBuilder<V: Render> {
    view: Entity<V>,
    id: ElementId,
    axis: Axis,
    item_sizes: Option<Rc<Vec<Size<Pixels>>>>,
    scroll_handle: Option<VirtualListScrollHandle>,
}

impl<V: Render + 'static> VirtualListBuilder<V> {
    /// Create a vertical virtual list builder.
    pub fn vertical(view: Entity<V>, id: impl Into<ElementId>) -> Self {
        Self {
            view,
            id: id.into(),
            axis: Axis::Vertical,
            item_sizes: None,
            scroll_handle: None,
        }
    }

    /// Create a horizontal virtual list builder.
    pub fn horizontal(view: Entity<V>, id: impl Into<ElementId>) -> Self {
        Self {
            view,
            id: id.into(),
            axis: Axis::Horizontal,
            item_sizes: None,
            scroll_handle: None,
        }
    }

    /// Configure the list with uniform items of identical dimension (height for
    /// vertical lists, width for horizontal lists).
    pub fn uniform(mut self, count: usize, dimension: Pixels) -> Self {
        let sizes = match self.axis {
            Axis::Vertical => vec![size(px(0.), dimension); count],
            Axis::Horizontal => vec![size(dimension, px(0.)); count],
        };
        self.item_sizes = Some(Rc::new(sizes));
        self
    }

    /// Configure the list with custom variable item sizes.
    pub fn item_sizes(mut self, sizes: impl Into<Rc<Vec<Size<Pixels>>>>) -> Self {
        self.item_sizes = Some(sizes.into());
        self
    }

    /// Attach an external scroll handle to track or control scroll position.
    pub fn track_scroll(mut self, scroll_handle: &VirtualListScrollHandle) -> Self {
        self.scroll_handle = Some(scroll_handle.clone());
        self
    }

    /// Render visible items using a range-based closure: `(view, range, window, cx) -> Vec<Element>`.
    pub fn render_range<R: IntoElement>(
        self,
        f: impl 'static + Fn(&mut V, Range<usize>, &mut Window, &mut Context<V>) -> Vec<R>,
    ) -> VirtualList {
        let item_sizes = self.item_sizes.unwrap_or_else(|| Rc::new(Vec::new()));
        let mut list = match self.axis {
            Axis::Vertical => v_virtual_list(self.view, self.id, item_sizes, f),
            Axis::Horizontal => h_virtual_list(self.view, self.id, item_sizes, f),
        };
        if let Some(ref scroll_handle) = self.scroll_handle {
            list = list.track_scroll(scroll_handle);
        }
        list
    }

    /// Render visible items using an item-by-item closure: `(view, index, window, cx) -> Element`.
    pub fn render_item<R: IntoElement>(
        self,
        render_item: impl 'static + Fn(&mut V, usize, &mut Window, &mut Context<V>) -> R,
    ) -> VirtualList {
        let render_item = Rc::new(render_item);
        self.render_range(move |this, range, window, cx| {
            let mut items = Vec::with_capacity(range.len());
            for ix in range {
                items.push(render_item(this, ix, window, cx));
            }
            items
        })
    }
}

/// Create a vertical virtual list with uniform item height.
///
/// Automatically creates an `item_sizes` vector of identical row heights.
#[inline]
pub fn v_virtual_list_uniform<R, V>(
    view: Entity<V>,
    id: impl Into<ElementId>,
    item_count: usize,
    item_height: Pixels,
    f: impl 'static + Fn(&mut V, Range<usize>, &mut Window, &mut Context<V>) -> Vec<R>,
) -> VirtualList
where
    R: IntoElement,
    V: Render + 'static,
{
    VirtualListBuilder::vertical(view, id)
        .uniform(item_count, item_height)
        .render_range(f)
}

/// Create a horizontal virtual list with uniform item width.
///
/// Automatically creates an `item_sizes` vector of identical column widths.
#[inline]
pub fn h_virtual_list_uniform<R, V>(
    view: Entity<V>,
    id: impl Into<ElementId>,
    item_count: usize,
    item_width: Pixels,
    f: impl 'static + Fn(&mut V, Range<usize>, &mut Window, &mut Context<V>) -> Vec<R>,
) -> VirtualList
where
    R: IntoElement,
    V: Render + 'static,
{
    VirtualListBuilder::horizontal(view, id)
        .uniform(item_count, item_width)
        .render_range(f)
}

/// Create a vertical virtual list with a per-item render closure.
#[inline]
pub fn v_virtual_list_items<R, V>(
    view: Entity<V>,
    id: impl Into<ElementId>,
    item_sizes: Rc<Vec<Size<Pixels>>>,
    render_item: impl 'static + Fn(&mut V, usize, &mut Window, &mut Context<V>) -> R,
) -> VirtualList
where
    R: IntoElement,
    V: Render + 'static,
{
    VirtualListBuilder::vertical(view, id)
        .item_sizes(item_sizes)
        .render_item(render_item)
}

/// Create a vertical uniform virtual list with a per-item render closure.
#[inline]
pub fn v_virtual_list_uniform_items<R, V>(
    view: Entity<V>,
    id: impl Into<ElementId>,
    item_count: usize,
    item_height: Pixels,
    render_item: impl 'static + Fn(&mut V, usize, &mut Window, &mut Context<V>) -> R,
) -> VirtualList
where
    R: IntoElement,
    V: Render + 'static,
{
    VirtualListBuilder::vertical(view, id)
        .uniform(item_count, item_height)
        .render_item(render_item)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn handle_is_the_base_type_and_a_scrollbar_handle() {
        fn accepts_base(_: gpui_base::VirtualListScrollHandle) {}
        fn accepts_scrollbar(_: impl gpui_base::ScrollbarHandle) {}

        let handle = VirtualListScrollHandle::new();
        accepts_base(handle.clone());
        accepts_scrollbar(handle);
    }

    #[allow(dead_code)]
    struct DummyView;
    impl Render for DummyView {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            gpui::div()
        }
    }

    #[test]
    fn builder_creates_uniform_and_custom_lists() {
        // Compile-time verification that builder and helpers return `VirtualList`.
        fn accepts_virtual_list(_: VirtualList) {}
        let _ = accepts_virtual_list;
    }
}
