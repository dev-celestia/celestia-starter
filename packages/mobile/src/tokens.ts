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
