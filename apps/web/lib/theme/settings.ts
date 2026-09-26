/**
 * Theme settings persistence + application.
 *
 * Storage (localStorage) and DOM writes (inline CSS variables on
 * `<html>`) are the only side effects of the theme system. Both live
 * here so every caller — the bootstrapping provider and the interactive
 * customizer — resolves accents and radii identically.
 */

import {
  DEFAULT_THEME_SETTINGS,
  PALETTES,
  PALETTE_STORAGE_KEY,
  RADII,
  RADIUS_STORAGE_KEY,
  type AccentPalette,
  type ThemeSettings,
} from "./palettes"

export function resolvePalette(paletteId: string): AccentPalette {
  return (
    PALETTES.find((p) => p.id === paletteId) ??
    PALETTES.find((p) => p.id === DEFAULT_THEME_SETTINGS.paletteId) ??
    PALETTES[0]!
  )
}

export function isValidThemeSettings(
  value: { paletteId?: string | null; radius?: string | null } | null
): value is ThemeSettings {
  if (!value) return false
  return (
    typeof value.paletteId === "string" &&
    typeof value.radius === "string" &&
    PALETTES.some((p) => p.id === value.paletteId) &&
    RADII.some((r) => r.value === value.radius)
  )
}

/** Read persisted settings. Returns null when nothing (valid) is saved. Safe on the server. */
export function readThemeSettings(): ThemeSettings | null {
  if (typeof window === "undefined") return null

  try {
    const settings = {
      paletteId: window.localStorage.getItem(PALETTE_STORAGE_KEY),
      radius: window.localStorage.getItem(RADIUS_STORAGE_KEY),
    }
    return isValidThemeSettings(settings) ? settings : null
  } catch {
    return null
  }
}

export function writeThemeSettings(settings: ThemeSettings): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(PALETTE_STORAGE_KEY, settings.paletteId)
    window.localStorage.setItem(RADIUS_STORAGE_KEY, settings.radius)
  } catch {
    // Private mode / storage quota — theme still applies for this session.
  }
}

/**
 * Write the palette's accent + radius onto `<html>` as inline CSS
 * variables, choosing the dark variants under the resolved dark theme.
 * Inline overrides beat both `:root` and `.dark` declarations in
 * globals.css, which is how accents survive theme switches.
 */
export function applyThemeSettings(settings: ThemeSettings, resolvedTheme?: string): void {
  if (typeof document === "undefined") return

  const palette = resolvePalette(settings.paletteId)
  const colors = resolvedTheme === "dark" ? palette.dark : palette.light
  const root = document.documentElement

  root.style.setProperty("--primary", colors.primary)
  root.style.setProperty("--primary-foreground", colors.primaryForeground)
  root.style.setProperty("--ring", colors.ring)
  root.style.setProperty("--radius", settings.radius)
}

/**
 * Remove inline overrides, falling back to the stylesheet defaults
 * (zinc accent, 0.625rem radius) in the current theme.
 */
export function clearAppliedThemeSettings(): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  for (const name of ["--primary", "--primary-foreground", "--ring", "--radius"]) {
    root.style.removeProperty(name)
  }
}

export { DEFAULT_THEME_SETTINGS }
