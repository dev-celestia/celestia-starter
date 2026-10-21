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

pub mod action_bar;
pub mod activity_feed;
pub mod alignment;
pub mod app_header;
pub mod attachment;
pub mod banner;
pub mod breadcrumb_bar;
pub mod bulk_action_bar;
pub mod button_group;
pub mod charts;
pub mod chat_composer;
pub mod checklist;
pub mod code_block;
pub mod code_editor;
pub mod color_picker;
pub mod combobox;
pub mod command_palette;
pub mod comment_thread;
pub mod commit_row;
pub mod confirm_dialog;
pub mod context_badge;
pub mod conversation_list;
pub mod data_table_toolbar;
pub mod date_picker;
pub mod dnd;
pub mod dock;
pub mod drawer;
pub mod drop_zone;
pub mod empty;
pub mod file_browser;
pub mod file_tree;
pub mod filter_bar;
pub mod find_replace_bar;
pub mod form_field;
pub mod frame;
pub mod group_box;
pub mod h_stack;
pub mod input_group;
pub mod inspector_panel;
pub mod issue_card;
pub mod kanban_board;
pub mod keybinding_recorder;
pub mod list;
pub mod loaders;
pub mod log_viewer;
pub mod window;
pub mod marker;
pub mod media_object;
pub mod menu;
pub mod message;
pub mod message_scroller;
pub mod modal;
pub mod notice;
pub mod notification_center;
pub mod onboarding_tip;
pub mod outline_view;
pub mod page_header;
pub mod pagination;
pub mod panel;
pub mod project_card;
pub mod property_list;
pub mod resizable_split;
pub mod scroll_view;
pub mod search_field;
pub mod section_heading;
pub mod settings_page;
pub mod sheet_panel;
pub mod side_nav;
pub mod sidebar;
pub mod sidebar_layout;
pub mod sortable_list;
pub mod spacer;
pub mod split_pane;
pub mod start_bar;
pub mod start_menu;
pub mod stat_card;
pub mod status_bar;
pub mod stepper;
pub mod system_tray;
pub mod tab_bar;
pub mod tag_input;
pub mod task_list;
pub mod terminal_panel;
pub mod text_editor;
pub mod timeline;
pub mod title_bar;
pub mod toast_stack;
pub mod toolbar;
pub mod toolbar_menu;
pub mod traffic_lights;
pub mod tree;
pub mod user_menu;
pub mod v_grid;
pub mod v_stack;
pub mod virtual_list;
pub mod wizard;
pub mod workspace_switcher;
pub mod z_stack;
