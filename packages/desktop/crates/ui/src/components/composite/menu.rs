//! Menus — `dropdown-menu.tsx` / `context-menu.tsx` / `menubar.tsx` → gpui
//! `menu`.
//!
//! Attach to any element: `.dropdown_menu(|menu, window, cx| …)` (dropdown
//! caret button) or `.context_menu(|menu, window, cx| …)` (right-click area),
//! then build with `PopupMenu::item(PopupMenuItem::new("Label").on_click(…))`
//! / `.separator()`.

pub use gpui_component::menu;
pub use gpui_component::menu::{
    ContextMenu, ContextMenuExt, DropdownMenu, PopupMenu, PopupMenuItem,
};
