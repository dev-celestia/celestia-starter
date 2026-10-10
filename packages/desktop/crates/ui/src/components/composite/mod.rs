//! Composed surfaces — components assembled from several primitives, or
//! application-level assemblies (chrome, shells, editors).
//! Mirrors `packages/ui/src/components/composite/*.tsx`.
//!
//! If a component renders two or more primitives, or owns a layout region
//! rather than a control, it belongs here rather than in
//! [`crate::components::primitive`].
//!
//! Reached as `components::composite::<name>`. The typed exports are also
//! re-exported flat from [`crate::components`].
//!
//! ## SwiftUI-style layout
//!
//! The layout vocabulary ported 1:1 from SwiftUI is split one component per
//! file, like the rest of the crate: [`h_stack`] / [`v_stack`] / [`z_stack`]
//! for the stacks, [`spacer`] for the flexible gap, [`scroll_view`] for the
//! axis scroll container, [`v_grid`] for `LazyVGrid` (with
//! [`v_grid::GridItem`] column rules), and [`frame`] for the
//! `.frame(width:height:)` / `.padding()` modifier pair. The alignment enums
//! they share live together in [`alignment`].

pub mod alignment;
pub mod attachment;
pub mod charts;
pub mod code_editor;
pub mod color_picker;
pub mod combobox;
pub mod context_badge;
pub mod date_picker;
pub mod description_list;
pub mod dock;
pub mod empty;
pub mod frame;
pub mod group_box;
pub mod h_stack;
pub mod list;
pub mod loaders;
pub mod marker;
pub mod menu;
pub mod message;
pub mod message_scroller;
pub mod notice;
pub mod pagination;
pub mod scroll_view;
pub mod section_heading;
pub mod sidebar;
pub mod sidebar_layout;
pub mod spacer;
pub mod status_bar;
pub mod stepper;
pub mod text_editor;
pub mod title_bar;
pub mod tree;
pub mod v_grid;
pub mod v_stack;
pub mod virtual_list;
pub mod z_stack;
