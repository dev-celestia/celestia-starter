/**
 * Celestia Mobile Design Tokens
 *
 * Strict semantic roles for mobile UI aligned with:
 * - better-colors (semantic roles, WCAG AA contrast floors, dark/light coherence)
 * - better-typography (proportional line-heights, tabular-nums, mobile font floors)
 * - better-interface (44x44pt minimum touch target, physical depth)
 *
 * `primary` is the design system's brand accent, kept in step with
 * `packages/ui/src/styles/globals.css` — it is the one chromatic role in the
 * ramp, and the red is the brand's. `packages/ui` declares it in OKLCH
 * (`oklch(0.55 0.22 27)` light / `oklch(0.68 0.22 27)` dark); React Native
 * cannot parse `oklch()`, so the sRGB equivalents are written out here.
 *
 * House rules
 * -----------
 * - **No hardcoded colour in a component.** Everything reads
 *   `useMobileTheme()`. This file is the only place a hex literal belongs.
 * - **Status hues have a luminance ceiling.** The four status hues each do two
 *   jobs — a *fill* carrying white ink (`badge`, `tag`, `button`) and *ink* on a
 *   near-white backdrop (`alert` title, form error, `progress` fill). Both reduce
 *   to the same inequality:
 *
 *       white ink on a fill:  1.05 / (L_rel + 0.05) >= 4.5  =>  L_rel <= 0.18333
 *       hue as ink on white:  1.05 / (L_rel + 0.05) >= 4.5  =>  L_rel <= 0.18333
 *
 *   So one value per hue serves both roles and no token family needs splitting.
 *   **Do not lighten a status hue past that ceiling** — the old ramp did, and 19
 *   pairings failed WCAG AA in the light theme while dark passed every one.
 *   `scripts/ui-audit/mobile-contrast.mjs` now asserts all 38, both themes.
 * - **`destructiveEdge` is derived, not chosen.** It is the sRGB bake of web's
 *   `--shadow-destructive-3d` = `color-mix(in oklch, var(--destructive), black
 *   30%)`. Change `destructive` and you must re-derive it, or the button's 2px
 *   bottom edge keeps the previous red. `scripts/ui-audit/mobile-contrast.mjs`
 *   asserts the relationship numerically.
 * - **An escalating gauge needs a perceptible step.** `MobileTokenMeter` runs
 *   `muted` -> `warning` -> `destructive` on a 4pt bar, so adjacent steps must
 *   differ on *some* axis. Pinning both status hues under the ceiling above puts
 *   them at the same lightness, which is why `destructive` is a full ramp step
 *   deeper than the hue alone would need. The gate asserts the separation.
 * - **`warning` is an approximation, not a match.** Web declares
 *   `oklch(0.5 0.17 75)`, which is **outside sRGB**; a browser gamut-maps it and
 *   the hue shifts to ~56 degrees. `#994e00` is that rendered value, so it is the
 *   honest sRGB counterpart — but it is not a hue-preserving conversion.
 * - Dark passes every pairing. Do not touch it without re-measuring.
 */

export interface ColorRamp {
  background: string
  surface: string
  card: string
  cardBorder: string
  foreground: string
  muted: string
  mutedBackground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  success: string
  successForeground: string
  warning: string
  warningForeground: string
  info: string
  infoForeground: string
  border: string
  inputBorder: string
  /**
   * The single modal scrim, mirroring web's `--overlay`. Web's house rule
   * (`globals.css`: *"One overlay. Dialog, Sheet, Drawer and AlertDialog all use
   * `bg-overlay`; do not introduce a second scrim opacity"*) applies here too:
   * `MobileModal` is the only consumer, and it composites this token through an
   * animated opacity rather than hardcoding a black.
   */
  overlay: string
  /**
   * The colour a platform drop shadow is cast in.
   *
   * Light mode draws a dark shadow over a white page, which works. **Dark mode
   * cannot**: the page is `#09090b`, and a shadow can only darken, so a black
   * shadow at 6% measures ~1.005:1 — invisible. That is the same reasoning
   * `packages/ui` records for `--elevation-edge` (*"a darker band cannot separate
   * from a near-black page"*), except that web's fix — flipping the band *light*
   * — only works for a solid 2px edge, not for a soft shadow.
   *
   * So in dark mode elevation is carried by the card's own surface (`card` sits
   * above `background`) and by `cardBorder`. This token is kept dark in both
   * themes because a *light* shadow would read as a glow; it is deliberately not
   * the elevation cue on dark.
   */
  shadow: string
  /**
   * The hard 2px bottom edge of a raised control — what `@celestia-project/ui`
   * spells `--shadow-3d`, `--shadow-3d-primary` and `--shadow-destructive-3d`.
   *
   * Web gets these free: `box-shadow: 0 2px 0 0 <colour>` draws a solid,
   * zero-blur silhouette. React Native has no such shadow, so the button draws
   * the edge as a real layer instead, which means the value has to be a
   * concrete colour here rather than a composed shadow.
   *
   * `primaryEdge` is the same value as `primary` (web reads the live
   * `--primary`), but it is named separately so the variant table can say what
   * it means instead of reaching for an unrelated role.
   *
   * `elevationEdge` is translucent — web spells it `rgb(0 0 0 / 15%)` — so it is
   * written as 8-digit hex, `#RRGGBBAA`, which keeps the whole ramp in one
   * notation. React Native parses it to the same value as the `rgba()` form
   * (verified against `@react-native/normalize-colors`).
   */
  elevationEdge: string
  primaryEdge: string
  destructiveEdge: string
  /**
   * Categorical chart series colours. The slot names mirror `--chart-1…5` in
   * `packages/ui`; the values deliberately do not.
   *
   * Web's ramp is neutral — `oklch(0.87 0 0)` through `oklch(0.269 0 0)`, a
   * monochrome lightness scale. `--chart-1` works out to 1.4:1 on white, and on
   * a phone a series is a 9pt dot rather than a filled band, so the first
   * series would simply not be there. These are a hue wheel anchored on the
   * brand red instead: red → amber → teal → blue → violet.
   *
   * Every step clears 4.8:1 on all three light surfaces and 5.4:1 on all three
   * dark ones, against a 3:1 floor (WCAG 1.4.11, non-text contrast). That
   * headroom is deliberate: the same five values are also used as legend
   * swatches, where a 9pt dot becomes a 10pt chip.
   *
   * The overlap with `warning` and `info` in dark mode is incidental. A status
   * colour answers "how did this go"; a series colour only answers "which one
   * is this". Different axes, so they get different tokens.
   */
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
}

export const lightColors: ColorRamp = {
  background: "#ffffff",
  surface: "#f8fafc",
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  foreground: "#0f172a",
  muted: "#475569",
  mutedBackground: "#f1f5f9",
  primary: "#d40c1a",
  primaryForeground: "#fafafa",
  secondary: "#f1f5f9",
  secondaryForeground: "#0f172a",
  accent: "#f1f5f9",
  accentForeground: "#0f172a",
  destructive: "#991b1b",
  destructiveForeground: "#ffffff",
  success: "#007b2a",
  successForeground: "#ffffff",
  warning: "#994e00",
  warningForeground: "#ffffff",
  info: "#0062c9",
  infoForeground: "#ffffff",
  border: "#e2e8f0",
  inputBorder: "#cbd5e1",
  overlay: "#000000b3",
  shadow: "#0f172a",
  elevationEdge: "#00000026",
  primaryEdge: "#d40c1a",
  destructiveEdge: "#5d0c0c",
  chart1: "#d40c1a",
  chart2: "#b45309",
  chart3: "#0f766e",
  chart4: "#1d4ed8",
  chart5: "#7e22ce",
}

export const darkColors: ColorRamp = {
  background: "#09090b",
  surface: "#18181b",
  card: "#121215",
  cardBorder: "#27272a",
  foreground: "#f8fafc",
  muted: "#94a3b8",
  mutedBackground: "#27272a",
  primary: "#ff4d46",
  primaryForeground: "#0a0a0a",
  secondary: "#27272a",
  secondaryForeground: "#f8fafc",
  accent: "#27272a",
  accentForeground: "#f8fafc",
  destructive: "#ff6467",
  destructiveForeground: "#09090b",
  success: "#34d399",
  successForeground: "#09090b",
  warning: "#fbbf24",
  warningForeground: "#09090b",
  info: "#60a5fa",
  infoForeground: "#09090b",
  border: "#27272a",
  inputBorder: "#3f3f46",
  overlay: "#000000b3",
  shadow: "#000000",
  elevationEdge: "#ffffff2e",
  primaryEdge: "#ff4d46",
  destructiveEdge: "#9e3b3d",
  chart1: "#ff4d46",
  chart2: "#fbbf24",
  chart3: "#2dd4bf",
  chart4: "#60a5fa",
  chart5: "#c084fc",
}

/**
 * Series colour slots, in draw order.
 *
 * `chartColor` wraps rather than truncating, so a sixth series reuses the first
 * colour instead of rendering nothing — a chart with a missing series is worse
 * than one that repeats a hue.
 */
export const CHART_SERIES = [
  "chart1",
  "chart2",
  "chart3",
  "chart4",
  "chart5",
] as const

export type ChartSeriesToken = (typeof CHART_SERIES)[number]

/**
 * Picks the series colour for `index` out of a ramp.
 *
 * Takes the ramp rather than importing one, so it stays pure: the caller
 * already has one from `useMobileTheme()`. Negative indices wrap too, so a
 * caller cannot index off the front of the array.
 */
export function chartColor(colors: ColorRamp, index: number): string {
  const count = CHART_SERIES.length
  const slot = CHART_SERIES[((index % count) + count) % count] ?? "chart1"
  return colors[slot]
}

export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "400" as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "500" as const,
  },
  callout: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
}

export const metrics = {
  minTouchTarget: 44,
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
  },
}

/**
 * The spacing scale — five steps, ascending, so the gap itself communicates the
 * relationship.
 *
 * | Step      | Gap | Used for |
 * |-----------|-----|----------|
 * | `inline`  | 4   | Inside one control cluster — a dot and its label, adjacent swatches |
 * | `label`   | 8   | A label and the control it labels |
 * | `row`     | 12  | Sibling rows inside one group — a stack of fields, a type ramp |
 * | `block`   | 16  | Two groups inside one card or section |
 * | `section` | 32  | Two sections |
 *
 * This is exported from the *library* on purpose. The scale was first written in
 * the consumer (`apps/mobile/src/showcase/spacing.ts`) to stop the gallery's
 * sections drifting apart — the same two jobs were being served by eight
 * hand-picked values (6, 8, 10, 12, 14, 16, 18, 20) — but a scale the library
 * does not export is a scale its consumers do not get. The gallery now re-exports
 * this one.
 *
 * **Migration is deliberately partial.** The component layer still contains
 * hand-picked literals that predate this export, and several of them (6, 10, 14,
 * 20, 24, 48) are not on the scale. Snapping them is a visible redesign across
 * 157 modules, so it is being done incrementally rather than in one sweep;
 * `scripts/ui-audit/mobile-contrast.mjs` prints the remaining census every run so
 * the debt stays visible instead of being silently frozen.
 */
export const spacing = {
  inline: 4,
  label: 8,
  row: 12,
  block: 16,
  section: 32,
} as const

export type SpacingStep = keyof typeof spacing
