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
pub mod group_box;
pub mod list;
pub mod loaders;
pub mod marker;
pub mod menu;
pub mod message;
pub mod notice;
pub mod pagination;
pub mod section_heading;
pub mod sidebar;
pub mod sidebar_layout;
pub mod status_bar;
pub mod stepper;
pub mod swiftui;
pub mod text_editor;
pub mod title_bar;
pub mod tree;
pub mod virtual_list;
