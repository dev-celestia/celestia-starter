//! Reusable components for Celestia desktop apps — one file per primitive,
//! mirroring `packages/ui/src/components/primitive/*.tsx`.
//!
//! Two kinds of file live here:
//!
//! 1. **Celestia wrappers** with a shadcn-shaped prop surface, rendering
//!    gpui-kit components with Celestia theme colors: [`button::Button`],
//!    [`badge::Badge`], [`card::Card`], [`section_heading::SectionHeading`],
//!    [`text_editor::TextEditor`], [`code_editor::CodeEditor`].
//! 2. **Per-primitive re-exports** of the gpui-component library, each with a
//!    doc comment mapping the web package's file onto its desktop counterpart
//!    (`switch.rs`, `alert.rs`, `popover.rs`, …).
//!
//! Colors always come from `cx.theme()` / `crate::palette(cx)` — never from a
//! hex literal at a call site.

// Wrappers (celestia props on top of gpui primitives)
pub mod badge;
pub mod button;
pub mod card;
pub mod code_editor;
pub mod section_heading;
pub mod text_editor;

// Actions
pub mod command;
pub mod kbd;
pub mod link;
pub mod menu;

// Inputs
pub mod calendar;
pub mod checkbox;
pub mod color_picker;
pub mod combobox;
pub mod date_picker;
pub mod input;
pub mod input_otp;
pub mod label;
pub mod radio;
pub mod rating;
pub mod select;
pub mod slider;
pub mod stepper;
pub mod switch;
pub mod textarea;

// Feedback
pub mod alert;
pub mod progress;
pub mod shimmer;
pub mod skeleton;
pub mod spinner;
pub mod toast;
pub mod tooltip;

// Overlays
pub mod dialog;
pub mod hover_card;
pub mod popover;
pub mod sheet;

// Data display
pub mod avatar;
pub mod breadcrumb;
pub mod description_list;
pub mod empty;
pub mod list;
pub mod marker;
pub mod pagination;
pub mod table;
pub mod tree;

// Layout & window chrome
pub mod accordion;
pub mod carousel;
pub mod collapsible;
pub mod dock;
pub mod group_box;
pub mod resizable;
pub mod scroll_area;
pub mod separator;
pub mod sidebar;
pub mod sidebar_layout;
pub mod status_bar;
pub mod swiftui;
pub mod tabs;
pub mod title_bar;

// Chat / AI
pub mod attachment;
pub mod bubble;
pub mod message;

// Charts (generic <T, X, Y> API; see the module docs)
pub mod charts;

// Flat re-exports — `use celestia_ui::components::Button` works, mirroring the
// web package's index. Only files with typed exports are globbed here;
// module-only primitives (avatar, table, tree, …) are reached through their
// module path (`components::table`).
pub use accordion::*;
pub use alert::*;
pub use badge::*;
pub use button::*;
pub use card::*;
pub use checkbox::*;
pub use code_editor::*;
pub use color_picker::*;
pub use date_picker::*;
pub use dialog::*;
pub use input::*;
pub use input_otp::*;
pub use kbd::*;
pub use link::*;
pub use menu::*;
pub use popover::*;
pub use progress::*;
pub use radio::*;
pub use rating::*;
pub use section_heading::*;
pub use select::*;
pub use separator::*;
pub use sheet::*;
pub use sidebar_layout::*;
pub use skeleton::*;
pub use spinner::*;
pub use swiftui::*;
pub use switch::*;
pub use tabs::*;
pub use text_editor::*;
pub use textarea::*;
pub use title_bar::*;
pub use toast::*;
pub use tooltip::*;
