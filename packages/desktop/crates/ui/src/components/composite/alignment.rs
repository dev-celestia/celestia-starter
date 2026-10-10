//! SwiftUI alignment vocabulary — how the stack primitives position their
//! children on the cross axis (no web counterpart).
//!
//! The three enums live together rather than beside each stack because they are
//! one shared vocabulary: [`HStack`](super::h_stack::HStack) reads
//! [`VerticalAlignment`], [`VStack`](super::v_stack::VStack) reads
//! [`HorizontalAlignment`], and [`ZStack`](super::z_stack::ZStack) reads
//! [`ZAlignment`].

/// `VerticalAlignment` — how an `HStack` aligns its children vertically.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum VerticalAlignment {
    Top,
    #[default]
    Center,
    Bottom,
}

/// `HorizontalAlignment` — how a `VStack` aligns its children horizontally.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum HorizontalAlignment {
    #[default]
    Leading,
    Center,
    Trailing,
}

/// Combined alignment for `ZStack` layers.
#[derive(Clone, Copy, Default, PartialEq, Eq, Debug)]
pub enum ZAlignment {
    Top,
    #[default]
    Center,
    Bottom,
    Leading,
    Trailing,
    TopLeading,
    TopTrailing,
    BottomLeading,
    BottomTrailing,
}
