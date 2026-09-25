/**
 * Celestia Mobile Design Tokens
 *
 * Strict semantic roles for mobile UI aligned with:
 * - better-colors (semantic roles, WCAG AA contrast floors, dark/light coherence)
 * - better-typography (proportional line-heights, tabular-nums, mobile font floors)
 * - better-interface (44x44pt minimum touch target, physical depth)
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
}

export const lightColors: ColorRamp = {
  background: "#ffffff",
  surface: "#f8fafc",
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  foreground: "#0f172a",
  muted: "#64748b",
  mutedBackground: "#f1f5f9",
  primary: "#0f172a",
  primaryForeground: "#ffffff",
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
}

export const darkColors: ColorRamp = {
  background: "#09090b",
  surface: "#18181b",
  card: "#121215",
  cardBorder: "#27272a",
  foreground: "#f8fafc",
  muted: "#94a3b8",
  mutedBackground: "#27272a",
  primary: "#f8fafc",
  primaryForeground: "#09090b",
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
