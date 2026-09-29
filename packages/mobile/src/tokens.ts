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
  muted: "#64748b",
  mutedBackground: "#f1f5f9",
  primary: "#d40c1a",
  primaryForeground: "#fafafa",
  secondary: "#f1f5f9",
  secondaryForeground: "#0f172a",
  accent: "#f1f5f9",
  accentForeground: "#0f172a",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  success: "#10b981",
  successForeground: "#ffffff",
  warning: "#f59e0b",
  warningForeground: "#ffffff",
  info: "#3b82f6",
  infoForeground: "#ffffff",
  border: "#e2e8f0",
  inputBorder: "#cbd5e1",
  elevationEdge: "#00000026",
  primaryEdge: "#d40c1a",
  destructiveEdge: "#942626",
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
