"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  SunIcon,
  MoonIcon,
  DesktopIcon,
  ArrowsClockwiseIcon,
  CheckIcon,
} from "@phosphor-icons/react"
import { Button } from "@celestia-project/ui"
import { toast } from "@celestia-project/ui/components/sonner"
import { cn } from "@celestia-project/ui/lib/utils"

export interface PaletteItem {
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

export const PALETTES: PaletteItem[] = [
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

export const RADII = [
  { label: "0", value: "0rem" },
  { label: "0.3", value: "0.3rem" },
  { label: "0.5", value: "0.5rem" },
  { label: "0.75", value: "0.75rem" },
  { label: "1.0", value: "1.0rem" },
]

export function ThemeCustomizer() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [selectedPalette, setSelectedPalette] = React.useState<string>("emerald")
  const [selectedRadius, setSelectedRadius] = React.useState<string>("0.5rem")
  const [mounted, setMounted] = React.useState(false)

  // Load from LocalStorage on mount
  React.useEffect(() => {
    setMounted(true)
    const savedPalette = localStorage.getItem("celestia-theme-palette")
    const savedRadius = localStorage.getItem("celestia-theme-radius")

    if (savedPalette && PALETTES.some((p) => p.id === savedPalette)) {
      setSelectedPalette(savedPalette)
    }
    if (savedRadius && RADII.some((r) => r.value === savedRadius)) {
      setSelectedRadius(savedRadius)
    }
  }, [])

  // Apply CSS variables dynamically whenever palette, radius, or theme mode changes
  React.useEffect(() => {
    if (!mounted) return

    const palette = PALETTES.find((p) => p.id === selectedPalette) || PALETTES[0]
    if (!palette) return

    const isDark = resolvedTheme === "dark"
    const colors = isDark ? palette.dark : palette.light
    const root = document.documentElement

    root.style.setProperty("--primary", colors.primary)
    root.style.setProperty("--primary-foreground", colors.primaryForeground)
    root.style.setProperty("--ring", colors.ring)
    root.style.setProperty("--radius", selectedRadius)

    localStorage.setItem("celestia-theme-palette", selectedPalette)
    localStorage.setItem("celestia-theme-radius", selectedRadius)
  }, [selectedPalette, selectedRadius, resolvedTheme, mounted])

  const handlePaletteSelect = (palette: PaletteItem) => {
    setSelectedPalette(palette.id)
    toast.success(`Active palette: ${palette.name}`)
  }

  const handleRadiusSelect = (radiusVal: string, label: string) => {
    setSelectedRadius(radiusVal)
    toast.success(`Corner radius: ${label}`)
  }

  const handleReset = () => {
    setSelectedPalette("emerald")
    setSelectedRadius("0.5rem")
    setTheme("system")
    toast.success("Reset to defaults")
  }

  if (!mounted) return null

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-2.5 sm:px-4 sm:py-2.5 shadow-xs transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Color Palette Swatches */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[11px] font-medium text-muted-foreground mr-1 hidden sm:inline">
            Theme:
          </span>
          {PALETTES.map((palette) => {
            const isActive = selectedPalette === palette.id
            return (
              <button
                key={palette.id}
                onClick={() => handlePaletteSelect(palette)}
                title={palette.name}
                aria-label={`Select ${palette.name} palette`}
                className={cn(
                  "group flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer shrink-0",
                  isActive
                    ? "border-primary bg-primary/10 text-foreground shadow-xs ring-1 ring-primary/40"
                    : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <span
                  className="size-2.5 rounded-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: palette.colorHex }}
                />
                <span className="text-[11px]">{palette.name}</span>
                {isActive && (
                  <CheckIcon className="size-3 text-primary animate-in fade-in zoom-in-75 duration-150" weight="bold" />
                )}
              </button>
            )
          })}
        </div>

        {/* Right Controls: Radius, Mode & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Radius Segmented Control */}
          <div className="hidden md:flex items-center gap-1">
            <span className="text-[11px] font-medium text-muted-foreground mr-0.5">
              Radius:
            </span>
            <div className="flex items-center rounded-lg bg-muted/60 p-0.5 border border-border/40">
              {RADII.map((r) => {
                const isActive = selectedRadius === r.value
                return (
                  <button
                    key={r.value}
                    onClick={() => handleRadiusSelect(r.value, r.label)}
                    className={cn(
                      "px-2 py-0.5 text-[11px] font-medium rounded-md transition-all active:scale-95 cursor-pointer",
                      isActive
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5 border border-border/40">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-all active:scale-90 cursor-pointer",
                theme === "light"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Light mode"
              aria-label="Light mode"
            >
              <SunIcon className="size-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-all active:scale-90 cursor-pointer",
                theme === "dark"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Dark mode"
              aria-label="Dark mode"
            >
              <MoonIcon className="size-3.5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "p-1.5 rounded-md text-xs transition-all active:scale-90 cursor-pointer",
                theme === "system"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="System mode"
              aria-label="System mode"
            >
              <DesktopIcon className="size-3.5" />
            </button>
          </div>

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleReset}
            className="size-7 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
            title="Reset theme to default"
          >
            <ArrowsClockwiseIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
