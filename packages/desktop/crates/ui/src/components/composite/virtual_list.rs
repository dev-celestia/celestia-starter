//! Virtual list — virtualized rows/columns of uneven size → gpui-base
//! `virtual_list` (no web counterpart: browsers virtualize natively).
//!
//! Callers supply every item's size up front (`Rc<Vec<Size<Pixels>>>`) and a
//! render closure over the visible range; only items intersecting the
//! viewport are laid out and painted. Build one with [`v_virtual_list`] or
//! [`h_virtual_list`]; [`VirtualListScrollHandle`] drives the scroll offset
//! and doubles as a [`ScrollbarHandle`](gpui_base::ScrollbarHandle), so
//! scrollbars attach to it like any other scrollable.
//!
//! gpui-kit grew this exact re-export shim as `component::virtual_list` in
//! 0.7; while the stack is pinned to 0.6 the items only live on
//! `gpui::base`.

pub use gpui_base::virtual_list;
pub use gpui_base::{VirtualList, VirtualListScrollHandle, h_virtual_list, v_virtual_list};

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
}
