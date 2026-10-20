//! Text input — `packages/ui/src/components/primitive/input.tsx` → gpui `input`.
//! Also hosts `NumberInput` (no separate web primitive).
//!
//! Focus chrome matches web: `outline-none`, no `focus-visible:border-ring`
//! / ring. [`Input::new`] turns off gpui's tinted focus border by default;
//! restore it with `.focus_bordered(true)` when needed.

use gpui::Entity;

pub use gpui_component::input::{InputState, NumberInput};

/// Constructor for Celestia text inputs (focus border tint off).
///
/// Returns a gpui [`gpui_component::input::Input`] so method chaining is
/// unchanged: `Input::new(&state).cleanable(true)`.
pub struct Input;

impl Input {
    /// Same as gpui `Input::new`, with focus border tint disabled.
    #[inline]
    pub fn new(state: &Entity<InputState>) -> gpui_component::input::Input {
        gpui_component::input::Input::new(state).focus_bordered(false)
    }
}
