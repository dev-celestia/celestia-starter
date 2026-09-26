/**
 * Theme settings data — accent palettes, corner radii, storage keys.
 *
 * This is the single source of truth for everything the runtime theme
 * system can customize on top of the token layer in
 * `@celestia-project/ui/globals.css`. The tokens define the two base
 * palettes (light/dark); the values here are overrides written onto
 * `document.documentElement` as inline CSS variables.
 */

export interface AccentPalette {
  id: string
  name: string
  colorHex: string
  light: {
    primary: string
    primaryForeground: string
    ring: string
  }
  dark: {
    primary: string
    primaryForeground: string
    ring: string
  }
}

export interface ThemeRadiusOption {
  label: string
  value: string
}

/** Persisted, user-selectable theme overrides (accent + corner radius). */
export interface ThemeSettings {
  paletteId: string
  radius: string
}

export const PALETTES: AccentPalette[] = [
  {
    id: "zinc",
    name: "Zinc",
    colorHex: "#71717a",
    light: {
      primary: "oklch(0.205 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.708 0 0)",
    },
    dark: {
      primary: "oklch(0.922 0 0)",
      primaryForeground: "oklch(0.205 0 0)",
      ring: "oklch(0.556 0 0)",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    colorHex: "#10b981",
    light: {
      primary: "oklch(0.55 0.18 155)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.55 0.18 155)",
    },
    dark: {
      primary: "oklch(0.696 0.17 162.48)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.696 0.17 162.48)",
    },
  },
  {
    id: "violet",
    name: "Violet",
    colorHex: "#8b5cf6",
    light: {
      primary: "oklch(0.55 0.22 285)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.55 0.22 285)",
    },
    dark: {
      primary: "oklch(0.68 0.22 285)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.68 0.22 285)",
    },
  },
  {
    id: "blue",
    name: "Blue",
    colorHex: "#3b82f6",
    light: {
      primary: "oklch(0.55 0.20 250)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.55 0.20 250)",
    },
    dark: {
      primary: "oklch(0.68 0.20 250)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.68 0.20 250)",
    },
  },
  {
    id: "rose",
    name: "Rose",
    colorHex: "#f43f5e",
    light: {
      primary: "oklch(0.55 0.24 15)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.55 0.24 15)",
    },
    dark: {
      primary: "oklch(0.68 0.24 15)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.68 0.24 15)",
    },
  },
  {
    id: "orange",
    name: "Orange",
    colorHex: "#f97316",
    light: {
      primary: "oklch(0.62 0.20 45)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.62 0.20 45)",
    },
    dark: {
      primary: "oklch(0.72 0.20 45)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.72 0.20 45)",
    },
  },
  {
    id: "teal",
    name: "Teal",
    colorHex: "#06b6d4",
    light: {
      primary: "oklch(0.56 0.16 200)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.56 0.16 200)",
    },
    dark: {
      primary: "oklch(0.72 0.16 200)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.72 0.16 200)",
    },
  },
  {
    id: "yellow",
    name: "Yellow",
    colorHex: "#eab308",
    light: {
      primary: "oklch(0.65 0.18 85)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.65 0.18 85)",
    },
    dark: {
      primary: "oklch(0.78 0.18 85)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.78 0.18 85)",
    },
  },
]

export const RADII: ThemeRadiusOption[] = [
  { label: "0", value: "0rem" },
  { label: "0.3", value: "0.3rem" },
  { label: "0.5", value: "0.5rem" },
  { label: "0.625", value: "0.625rem" },
  { label: "0.75", value: "0.75rem" },
  { label: "1.0", value: "1.0rem" },
]

/** Shipped defaults. `--radius` in globals.css matches DEFAULT_RADIUS. */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  paletteId: "emerald",
  radius: "0.625rem",
}

/** Tailwind swatch classes for the palette picker, keyed by palette id. */
export const PALETTE_BG_CLASSES: Record<string, string> = {
  zinc: "bg-zinc-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
  yellow: "bg-yellow-500",
}

/* Storage keys. Unchanged since introduction so existing visitors keep
   their saved accent and radius. */
export const PALETTE_STORAGE_KEY = "celestia-theme-palette"
export const RADIUS_STORAGE_KEY = "celestia-theme-radius"
