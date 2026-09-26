/**
 * Celestia theme system — the single entry point for everything
 * theme-related in apps/web.
 *
 * - `ThemeProvider`  — mount once in `app/layout.tsx` (mode + boot sync).
 * - `useTheme`       — mode reads/writes (light/dark/system).
 * - `useThemeSettings` — accent palette + corner radius state.
 * - `palettes.ts`    — palettes, radii, storage keys (data).
 * - `settings.ts`    — persistence + CSS-variable application (side effects).
 *
 * Import theme APIs from `@/lib/theme`, never from `next-themes`
 * directly, so the strategy, defaults, and sync behavior stay in one
 * place.
 */

export { ThemeProvider } from "./provider"
export { useTheme } from "next-themes"
export { useThemeSettings } from "./use-theme-settings"

export {
  DEFAULT_THEME_SETTINGS,
  PALETTES,
  PALETTE_BG_CLASSES,
  PALETTE_STORAGE_KEY,
  RADII,
  RADIUS_STORAGE_KEY,
} from "./palettes"
export type { AccentPalette, ThemeRadiusOption, ThemeSettings } from "./palettes"

export {
  applyThemeSettings,
  clearAppliedThemeSettings,
  isValidThemeSettings,
  readThemeSettings,
  resolvePalette,
  writeThemeSettings,
} from "./settings"
