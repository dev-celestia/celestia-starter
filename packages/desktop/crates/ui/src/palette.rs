//! Product-level palette: semantic color roles `gpui-component`'s `Theme` has no slot
//! for. Same rule as the web token layer — raw hex literals live only here;
//! call sites take colors by role through [`palette`].
//!
//! These values are mode-independent on purpose: `--brand` / `--brand-deep`
//! and the chart ramp are defined once in `packages/ui/src/styles/globals.css`
//! `:root` and never overridden by `.dark`. The accessor form keeps call sites
//! stable if a mode-dependent role is ever added.

use gpui::{App, Hsla, rgb};

pub struct Palette {
    brand: u32,
    brand_deep: u32,
    brand_foreground: u32,
    chart_1: u32,
    chart_2: u32,
    chart_3: u32,
    chart_4: u32,
    chart_5: u32,
}

const PALETTE: Palette = Palette {
    brand: 0xdc2626,
    brand_deep: 0xb51230,
    brand_foreground: 0xffffff,
    // The web chart ramp is grayscale in both themes.
    chart_1: 0xd4d4d4,
    chart_2: 0x737373,
    chart_3: 0x525252,
    chart_4: 0x404040,
    chart_5: 0x262626,
};

impl Palette {
    /// Landing accent (`--brand`). Fills pair with [`Self::brand_foreground`];
    /// gradients run `brand → brand_deep` (`.accent-gradient` on the web).
    pub fn brand(&self) -> Hsla {
        rgb(self.brand).into()
    }

    /// Gradient end / pressed state (`--brand-deep`).
    pub fn brand_deep(&self) -> Hsla {
        rgb(self.brand_deep).into()
    }

    /// Text/icons on a [`Self::brand`] fill (`--brand-foreground`).
    pub fn brand_foreground(&self) -> Hsla {
        rgb(self.brand_foreground).into()
    }

    /// Categorical series color, `chart-1` … `chart-5` (`ix` 0-based; out of
    /// range wraps instead of panicking — series counts are data-driven).
    pub fn chart(&self, ix: usize) -> Hsla {
        rgb(match ix % 5 {
            0 => self.chart_1,
            1 => self.chart_2,
            2 => self.chart_3,
            3 => self.chart_4,
            _ => self.chart_5,
        })
        .into()
    }
}

/// The product palette. Takes `cx` for signature stability (the values are
/// currently mode-independent).
pub fn palette(_cx: &App) -> &'static Palette {
    &PALETTE
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::Rgba;

    fn hex(color: Hsla) -> u32 {
        let rgba = Rgba::from(color);
        let to8 = |v: f32| (v * 255.0).round() as u32;
        (to8(rgba.r) << 16) | (to8(rgba.g) << 8) | to8(rgba.b)
    }

    #[test]
    fn brand_matches_the_web_tokens() {
        assert_eq!(hex(PALETTE.brand()), 0xdc2626);
        assert_eq!(hex(PALETTE.brand_deep()), 0xb51230);
        assert_eq!(hex(PALETTE.brand_foreground()), 0xffffff);
    }

    #[test]
    fn chart_ramp_is_the_grayscale_ramp() {
        let expected = [0xd4d4d4, 0x737373, 0x525252, 0x404040, 0x262626];
        for (ix, want) in expected.iter().enumerate() {
            assert_eq!(hex(PALETTE.chart(ix)), *want);
        }
        // Out of range wraps, it doesn't panic.
        assert_eq!(hex(PALETTE.chart(5)), expected[0]);
    }
}
