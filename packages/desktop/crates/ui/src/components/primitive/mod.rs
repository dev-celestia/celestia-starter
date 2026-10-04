//! Atomic UI primitives — one control, or one visual atom, per file.
//! Mirrors `packages/ui/src/components/primitive/*.tsx`.
//!
//! A file belongs here when it renders a single control (or a single visual
//! atom) and does not assemble an application-level surface. Composing several
//! primitives into a larger surface is what puts a file in
//! [`crate::components::composite`] instead.
//!
//! Reached as `components::primitive::<name>`. The typed exports are also
//! re-exported flat from [`crate::components`], so `components::Button` works.

pub mod accordion;
pub mod alert;
pub mod avatar;
pub mod badge;
pub mod breadcrumb;
pub mod bubble;
pub mod button;
pub mod calendar;
pub mod card;
pub mod carousel;
pub mod checkbox;
pub mod collapsible;
pub mod command;
pub mod dialog;
pub mod hover_card;
pub mod icon;
pub mod input;
pub mod input_otp;
pub mod kbd;
pub mod label;
pub mod link;
pub mod popover;
pub mod progress;
pub mod radio;
pub mod rating;
pub mod resizable;
pub mod scroll_area;
pub mod select;
pub mod separator;
pub mod sheet;
pub mod shimmer;
pub mod skeleton;
pub mod slider;
pub mod spinner;
pub mod switch;
pub mod table;
pub mod tabs;
pub mod textarea;
pub mod toast;
pub mod tooltip;
