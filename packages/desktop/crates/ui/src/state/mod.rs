//! Application state for Celestia screens — the desktop counterpart of the
//! web app's zustand stores and React contexts.
//!
//! GPUI re-renders an entity when it calls `cx.notify()`. Widget state is
//! entity-per-thing (`Entity<InputState>`), but a shared *application state
//! tree* is one plain value with many readers and writers. This module
//! provides it in two layers:
//!
//! - **[`Store`] / [`StoreHandle`]** — the zustand layer: a store entity
//!   holding plain state, mutation methods that notify, and selector-gated
//!   subscriptions so entities only re-render when the slice they render
//!   changes.
//! - **[`StoreContext`]** — the React-context layer: provide a store-backed
//!   value once at the root, consume it anywhere without threading handles
//!   through every component.
//!
//! # Example
//!
//! ```ignore
//! use celestia_ui::state::{StoreContext, StoreHandle};
//!
//! // A store slice: plain data + `&mut self` actions (zustand's create/set).
//! #[derive(Clone, Default)]
//! struct WorkspaceState {
//!     open_tabs: usize,
//!     dirty: bool,
//! }
//!
//! impl WorkspaceState {
//!     fn tab_opened(&mut self) {
//!         self.open_tabs += 1;
//!     }
//! }
//!
//! // Create once and share the handle: getState / setState.
//! let workspace = StoreHandle::new(WorkspaceState::default(), cx);
//! workspace.set(cx, WorkspaceState::tab_opened); // action path
//! workspace.set(cx, |s| s.dirty = true);         // inline update
//! let dirty = workspace.read(cx).dirty;          // getState
//!
//! // useStore(selector): the Toolbar re-renders only when `dirty` flips.
//! let toolbar = Toolbar {
//!     save_visible: workspace.read(cx).dirty,
//! };
//! workspace.observe_slice(cx, |s| s.dirty, |toolbar, dirty, cx| {
//!     toolbar.save_visible = dirty;
//!     cx.notify();
//! })
//! .detach();
//!
//! // React context: provide at the root, consume anywhere.
//! StoreContext::<SessionState>::provide(SessionState::default(), cx);
//! let session = StoreContext::<SessionState>::require(cx);
//! session.update(cx, |s| s.user = "celeste".into());
//! ```
//!
//! Raw GPUI interop stays available: the handle derefs to the store entity,
//! so `cx.observe(&handle, …)` and `handle.read(cx)` work anywhere.

pub mod context;
pub mod store;

pub use context::{ContextSlot, StoreContext};
pub use store::{Store, StoreHandle};
