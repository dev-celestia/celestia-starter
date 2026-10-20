//! AI surfaces — desktop counterparts of `packages/ui/src/components/ai/*.tsx`.
//!
//! Presentational builders for chat composers, reasoning, tools, plans, and
//! related agent chrome. Host apps own streaming / Entity state; these types
//! take callbacks and element slots.
//!
//! Reached as `components::ai::<name>`. Typed exports are also re-exported
//! flat from [`crate::components`] where names do not collide.

pub mod agent;
pub mod artifact;
pub mod chain_of_thought;
pub mod checkpoint;
pub mod code_block;
pub mod confirmation;
pub mod context_usage;
pub mod conversation;
pub mod inline_citation;
pub mod model_selector;
pub mod plan;
pub mod prompt_input;
pub mod queue;
pub mod reasoning;
pub mod snippet;
pub mod sources;
pub mod suggestion;
pub mod task;
pub mod terminal;
pub mod thinking_text;
pub mod tool;
