"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from "./palettes"
import { applyThemeSettings, readThemeSettings, writeThemeSettings } from "./settings"

/**
 * State + persistence for the user-selectable theme overrides (accent
 * palette, corner radius). Mode (light/dark/system) is next-themes'
 * domain — read it with `useTheme()` from the same barrel.
 *
 * Saved overrides hydrate once via the lazy `useState` initializer;
 * nothing renders from `settings` until `ready` flips after hydration,
 * so the server snapshot difference never reaches the DOM. Every
 * change — including a light/dark flip, which swaps the accent's dark
 * variants in — applies to the DOM and to storage from the effect
 * below. While it is mounted the hook is the writer; the provider's
 * boot sync re-applies saved values everywhere else (e.g. on pages
 * without a header).
 */
export function useThemeSettings() {
  const { resolvedTheme } = useTheme()
  const [settings, setSettings] = React.useState<ThemeSettings>(
    () => readThemeSettings() ?? DEFAULT_THEME_SETTINGS
  )
  const ready = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  React.useEffect(() => {
    if (!ready) return
    applyThemeSettings(settings, resolvedTheme)
    writeThemeSettings(settings)
  }, [settings, resolvedTheme, ready])

  const setPalette = React.useCallback((paletteId: string) => {
    setSettings((current) => ({ ...current, paletteId }))
  }, [])

  const setRadius = React.useCallback((radius: string) => {
    setSettings((current) => ({ ...current, radius }))
  }, [])

  const reset = React.useCallback(() => {
    setSettings(DEFAULT_THEME_SETTINGS)
  }, [])

  return { settings, ready, setPalette, setRadius, reset }
}
