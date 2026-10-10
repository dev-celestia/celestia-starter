//! Crate-owned component contracts and free style helpers — the pieces the
//! rewritten components used to import from `gpui-component` / `gpui-base`.
//!
//! Everything here is a 1:1 port of the upstream definition it replaces, so a
//! call site only changes its `use` line, never its call:
//!
//! - [`Size`] / [`Sizable`] — `gpui-component`'s `sizing.rs`. The enum shape
//!   (`XSmall` / `Small` / `Medium` / `Large` plus a `Size(Pixels)` override)
//!   is data that wrapper files match on (`attachment`, `avatar`, `button`), so
//!   the arms must keep their order and meaning.
//! - [`Disableable`] / [`Selectable`] — `gpui-base`'s `component_traits.rs`.
//! - [`h_flex`] / [`v_flex`] — `gpui-base`'s `styled.rs`. **The cross-axis
//!   rules are not symmetric** and live here for good: `h_flex` centers its
//!   children on the cross axis; `v_flex` installs *no* cross-axis alignment.
//!   A row that relied on that centering keeps an explicit `.items_center()`
//!   when inlined by hand — which is exactly the silent-realignment trap the
//!   crate ledger warns about, and why the helpers exist.
//!
//! This module is intentionally *not* flat re-exported from
//! [`crate::components`] yet: shim files still `pub use` the upstream trait
//! names through their globs, and two same-named traits in one glob would make
//! every `use celestia_ui::components::*` ambiguous. Import from here by path;
//! the flat export lands when the last shim dies.

use gpui::{Div, Edges, Pixels, Styled, div, px};

/// A size step for elements — `gpui-component`'s `Size`, crate-owned.
#[derive(Clone, Default, Copy, PartialEq, Eq, Debug)]
pub enum Size {
    /// A caller-supplied pixel size, for the steps between the named ones.
    Size(Pixels),
    XSmall,
    Small,
    #[default]
    Medium,
    Large,
}

impl Size {
    /// Ordinal of the named step for `max` / `min` ordering; the pixel
    /// override carries its own value so two overrides compare by length.
    fn as_f32(&self) -> f32 {
        match self {
            Size::Size(val) => val.as_f32(),
            Size::XSmall => 0.,
            Size::Small => 1.,
            Size::Medium => 2.,
            Size::Large => 3.,
        }
    }

    /// Returns the size as a static string (`"xs"` / `"sm"` / `"md"` / `"lg"`,
    /// `"custom"` for the pixel override).
    pub fn as_str(&self) -> &'static str {
        match self {
            Size::XSmall => "xs",
            Size::Small => "sm",
            Size::Medium => "md",
            Size::Large => "lg",
            Size::Size(_) => "custom",
        }
    }

    /// Create a Size from a static string — `"xs"`, `"sm"`, `"md"`, `"lg"`
    /// (case-insensitive, `xsmall`/`small`/`medium`/`large` accepted). Any
    /// other value returns `Size::Medium`.
    pub fn from_str(size: &str) -> Self {
        match size.to_lowercase().as_str() {
            "xs" | "xsmall" => Size::XSmall,
            "sm" | "small" => Size::Small,
            "md" | "medium" => Size::Medium,
            "lg" | "large" => Size::Large,
            _ => Size::Medium,
        }
    }

    /// Returns the height for a table row.
    #[inline]
    pub fn table_row_height(&self) -> Pixels {
        match self {
            Size::Size(size) => *size,
            Size::XSmall => px(26.),
            Size::Small => px(30.),
            Size::Large => px(40.),
            _ => px(32.),
        }
    }

    /// Returns the padding for a table cell.
    #[inline]
    pub fn table_cell_padding(&self) -> Edges<Pixels> {
        match self {
            Size::XSmall => Edges {
                top: px(2.),
                bottom: px(2.),
                left: px(4.),
                right: px(4.),
            },
            Size::Small => Edges {
                top: px(3.),
                bottom: px(3.),
                left: px(6.),
                right: px(6.),
            },
            Size::Large => Edges {
                top: px(8.),
                bottom: px(8.),
                left: px(12.),
                right: px(12.),
            },
            _ => Edges {
                top: px(4.),
                bottom: px(4.),
                left: px(8.),
                right: px(8.),
            },
        }
    }

    /// Returns a smaller size.
    pub fn smaller(&self) -> Self {
        match self {
            Size::XSmall => Size::XSmall,
            Size::Small => Size::XSmall,
            Size::Medium => Size::Small,
            Size::Large => Size::Medium,
            Size::Size(val) => Size::Size(*val * 0.2),
        }
    }

    /// Returns a larger size.
    pub fn larger(&self) -> Self {
        match self {
            Size::XSmall => Size::Small,
            Size::Small => Size::Medium,
            Size::Medium => Size::Large,
            Size::Large => Size::Large,
            Size::Size(val) => Size::Size(*val * 1.2),
        }
    }

    /// Return the max size between two sizes.
    ///
    /// e.g. `Size::XSmall.max(Size::Small)` will return `Size::XSmall`.
    pub fn max(&self, other: Self) -> Self {
        match (self, other) {
            (Size::Size(a), Size::Size(b)) => Size::Size(px(a.as_f32().min(b.as_f32()))),
            (Size::Size(a), _) => Size::Size(*a),
            (_, Size::Size(b)) => Size::Size(b),
            (a, b) if a.as_f32() < b.as_f32() => *a,
            _ => other,
        }
    }

    /// Return the min size between two sizes.
    ///
    /// e.g. `Size::XSmall.min(Size::Small)` will return `Size::Small`.
    pub fn min(&self, other: Self) -> Self {
        match (self, other) {
            (Size::Size(a), Size::Size(b)) => Size::Size(px(a.as_f32().max(b.as_f32()))),
            (Size::Size(a), _) => Size::Size(*a),
            (_, Size::Size(b)) => Size::Size(b),
            (a, b) if a.as_f32() > b.as_f32() => *a,
            _ => other,
        }
    }

    /// Returns the horizontal input padding.
    pub fn input_px(&self) -> Pixels {
        match self {
            Self::Large => px(12.),
            Self::Medium => px(10.),
            Self::Small => px(8.),
            Self::XSmall => px(4.),
            _ => px(8.),
        }
    }

    /// Returns the vertical input padding.
    pub fn input_py(&self) -> Pixels {
        match self {
            Size::Large => px(10.),
            Size::Medium => px(8.),
            Size::Small => px(2.),
            Size::XSmall => px(0.),
            _ => px(2.),
        }
    }
}

impl From<Pixels> for Size {
    fn from(size: Pixels) -> Self {
        Size::Size(size)
    }
}

/// A trait for setting the size of an element. [`Size::Medium`] is the default.
#[allow(patterns_in_fns_without_body)]
pub trait Sizable: Sized {
    /// Set the size of this element. Accepts a [`Size`], or a [`Pixels`] for a
    /// custom size: `px(30.)`.
    fn with_size(mut self, size: impl Into<Size>) -> Self;

    /// Set to [`Size::XSmall`].
    #[inline(always)]
    fn xsmall(self) -> Self {
        self.with_size(Size::XSmall)
    }

    /// Set to [`Size::Small`].
    #[inline(always)]
    fn small(self) -> Self {
        self.with_size(Size::Small)
    }

    /// Set to [`Size::Large`].
    #[inline(always)]
    fn large(self) -> Self {
        self.with_size(Size::Large)
    }
}

/// A component that can render as disabled (inert, dimmed, non-interactive).
pub trait Disableable: Sized {
    fn disabled(self, disabled: bool) -> Self;
}

/// A component that participates in a selection set.
pub trait Selectable: Sized {
    fn selected(self, selected: bool) -> Self;
    fn is_selected(&self) -> bool;

    /// A weaker selection state — selects inside an already-selected group.
    /// Upstream's default ignores it; components opt in.
    fn secondary_selected(self, _: bool) -> Self {
        self
    }
}

/// A row that centers its children on the cross axis.
///
/// `h_flex()` is `.flex().flex_row().items_center()` — the centering is part
/// of the contract, not an accident. A row that overrides it writes
/// `.items_start()` after the helper.
pub fn h_flex() -> Div {
    div().flex().flex_row().items_center()
}

/// A column whose children stretch across the cross axis.
///
/// Unlike [`h_flex`] this installs *no* cross-axis alignment — a child that
/// must not stretch writes its own `.items_start()` / `.items_center()`.
pub fn v_flex() -> Div {
    div().flex().flex_col()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn size_max_min_orders_the_named_steps() {
        assert_eq!(Size::Small.min(Size::XSmall), Size::Small);
        assert_eq!(Size::XSmall.min(Size::Small), Size::Small);
        assert_eq!(Size::Small.min(Size::Medium), Size::Medium);
        assert_eq!(Size::Medium.min(Size::Large), Size::Large);
        assert_eq!(Size::Large.min(Size::Small), Size::Large);

        assert_eq!(Size::Small.max(Size::XSmall), Size::XSmall);
        assert_eq!(Size::XSmall.max(Size::Small), Size::XSmall);
        assert_eq!(Size::Small.max(Size::Medium), Size::Small);
        assert_eq!(Size::Medium.max(Size::Large), Size::Medium);
        assert_eq!(Size::Large.max(Size::Small), Size::Small);

        // The pixel override only compares against another pixel override.
        assert_eq!(
            Size::Size(px(10.)).min(Size::Size(px(20.))),
            Size::Size(px(20.))
        );
        assert_eq!(
            Size::Size(px(10.)).max(Size::Size(px(20.))),
            Size::Size(px(10.))
        );
    }

    #[test]
    fn size_as_str_covers_every_step() {
        assert_eq!(Size::XSmall.as_str(), "xs");
        assert_eq!(Size::Small.as_str(), "sm");
        assert_eq!(Size::Medium.as_str(), "md");
        assert_eq!(Size::Large.as_str(), "lg");
        assert_eq!(Size::Size(px(15.)).as_str(), "custom");
    }

    #[test]
    fn size_from_str_is_case_insensitive_and_defaults_to_medium() {
        assert_eq!(Size::from_str("xs"), Size::XSmall);
        assert_eq!(Size::from_str("xsmall"), Size::XSmall);
        assert_eq!(Size::from_str("sm"), Size::Small);
        assert_eq!(Size::from_str("small"), Size::Small);
        assert_eq!(Size::from_str("md"), Size::Medium);
        assert_eq!(Size::from_str("medium"), Size::Medium);
        assert_eq!(Size::from_str("lg"), Size::Large);
        assert_eq!(Size::from_str("large"), Size::Large);
        assert_eq!(Size::from_str("unknown"), Size::Medium);
        assert_eq!(Size::from_str("XS"), Size::XSmall);
        assert_eq!(Size::from_str("Md"), Size::Medium);
    }

    #[test]
    fn table_row_height_and_cell_padding_track_the_upstream_ladder() {
        assert_eq!(Size::XSmall.table_row_height(), px(26.));
        assert_eq!(Size::Small.table_row_height(), px(30.));
        assert_eq!(Size::Medium.table_row_height(), px(32.));
        assert_eq!(Size::Large.table_row_height(), px(40.));
        assert_eq!(Size::Size(px(48.)).table_row_height(), px(48.));

        let cell = Size::Small.table_cell_padding();
        assert_eq!(cell.left, px(6.));
        assert_eq!(cell.top, px(3.));
    }

    #[test]
    fn pixels_convert_into_size() {
        assert_eq!(Size::from(px(30.)), Size::Size(px(30.)));
    }
}
