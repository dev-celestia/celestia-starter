//! Charts (the `chart-*.tsx` composites on the web).
//!
//! Web → desktop mapping: `chart.tsx` + `chart-area/bar/line/pie/radar/radial/
//! sparkline.tsx` → `chart`, `plot` for lower-level plotting. Series colors
//! come from [`crate::palette`] (`chart-1` … `chart-5`), matching the web ramp.

pub use gpui_kit::component::{chart, plot};
