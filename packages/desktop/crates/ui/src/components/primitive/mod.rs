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

pub mod accent_rail;
pub mod accordion;
pub mod alert;
pub mod aspect_ratio;
pub mod avatar;
pub mod badge;
pub mod battery;
pub mod breadcrumb;
pub mod bubble;
pub mod button;
pub mod calendar;
pub mod caption;
pub mod card;
pub mod carousel;
pub mod checkbox;
pub mod chip;
pub mod collapsible;
pub mod color_swatch;
pub mod command;
pub mod count_label;
pub mod dialog;
pub mod disclosure;
pub mod drag_handle;
pub mod drop_indicator;
pub mod fab;
pub mod file_glyph;
pub mod hotkey_hint;
pub mod hover_card;
pub mod icon;
pub mod icon_label;
pub mod image_icon;
pub mod initials;
pub mod inline_code;
pub mod input;
pub mod input_otp;
pub mod item;
pub mod kbd;
pub mod label;
pub mod link;
pub mod menubar;
pub mod meter;
pub mod navigation_menu;
pub mod number_stepper;
pub mod pill;
pub mod pin;
pub mod popover;
pub mod progress;
pub mod quote;
pub mod radio;
pub mod rating;
pub mod relative_time;
pub mod resizable;
pub mod scrim;
pub mod scroll_area;
pub mod scrubber;
pub mod select;
pub mod separator;
pub mod sheet;
pub mod shimmer;
pub mod signal_bars;
pub mod skeleton;
pub mod slider;
pub mod spinner;
pub mod status_dot;
pub mod switch;
pub mod table;
pub mod tabs;
pub mod textarea;
pub mod toast;
pub mod toggle;
pub mod tooltip;
pub mod truncate;
pub mod typography;
