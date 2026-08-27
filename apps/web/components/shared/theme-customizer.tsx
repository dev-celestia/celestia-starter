"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  SunIcon,
  MoonIcon,
  DesktopIcon,
  ArrowsClockwiseIcon,
  CheckIcon,
  PaletteIcon,
} from "@phosphor-icons/react"
import {
  Button,
  Separator,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui"
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
  { label: "0.625", value: "0.625rem" },
  { label: "0.75", value: "0.75rem" },
  { label: "1.0", value: "1.0rem" },
]

const PALETTE_BG_CLASSES: Record<string, string> = {
  zinc: "bg-zinc-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
  yellow: "bg-yellow-500",
}

export function ThemeCustomizer() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [selectedPalette, setSelectedPalette] = React.useState<string>("emerald")
  const [selectedRadius, setSelectedRadius] = React.useState<string>("0.625rem")
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
    setSelectedRadius("0.625rem")
    setTheme("system")
    toast.success("Theme reset to defaults")
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" aria-label="Customize Theme" title="Customize Theme">
        <PaletteIcon className="size-4 text-muted-foreground" />
      </Button>
    )
  }

  const activePalette = (PALETTES.find((p) => p.id === selectedPalette) ?? PALETTES[1])!

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
            aria-label="Customize Theme"
            title="Theme Customizer"
          />
        }
      >
        <span
          className={cn(
            "size-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20 transition-transform group-hover:scale-110",
            PALETTE_BG_CLASSES[activePalette.id] || "bg-primary"
          )}
        />
        <span className="hidden sm:inline font-medium text-xs">Theme</span>
        {resolvedTheme === "dark" ? (
          <MoonIcon className="size-3.5 text-muted-foreground ml-0.5" />
        ) : resolvedTheme === "light" ? (
          <SunIcon className="size-3.5 text-muted-foreground ml-0.5" />
        ) : (
          <DesktopIcon className="size-3.5 text-muted-foreground ml-0.5" />
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-80 rounded-2xl bg-popover/90 backdrop-blur-2xl p-3.5 shadow-2xl ring-1 ring-foreground/10 outline-none space-y-3 animate-in fade-in-0 zoom-in-95"
      >
        {/* Section 1: Color Accent Palette */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Accent Color</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleReset}
              className="h-5 gap-1 text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-transform cursor-pointer px-1"
              title="Reset theme settings"
            >
              <ArrowsClockwiseIcon className="size-3" />
              <span>Reset</span>
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {PALETTES.map((palette) => {
              const isActive = selectedPalette === palette.id
              return (
                <button
                  key={palette.id}
                  onClick={() => handlePaletteSelect(palette)}
                  title={palette.name}
                  className={cn(
                    "group relative flex items-center justify-start gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-all active:scale-95 cursor-pointer",
                    isActive
                      ? "border-primary bg-primary/15 text-foreground font-semibold shadow-xs ring-1 ring-primary/40"
                      : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "size-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10",
                      PALETTE_BG_CLASSES[palette.id] || "bg-primary"
                    )}
                  />
                  <span className="text-xs truncate">{palette.name}</span>
                  {isActive && (
                    <CheckIcon className="size-3 text-primary ml-auto shrink-0 animate-in fade-in zoom-in-75 duration-150" weight="bold" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <Separator className="my-1 opacity-60" />

        {/* Section 2: Appearance Mode */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Interface Mode</span>
          <Tabs value={theme} onValueChange={(val) => val && setTheme(val as string)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="light">Light</TabsTrigger>
              <TabsTrigger value="dark">Dark</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="my-1 opacity-60" />

        {/* Section 3: Corner Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Corner Radius</span>
            <span className="text-xs font-mono text-muted-foreground">{selectedRadius}</span>
          </div>

          <Tabs
            value={selectedRadius}
            onValueChange={(val) => {
              if (!val) return
              const item = RADII.find((r) => r.value === val)
              if (item) handleRadiusSelect(item.value, item.label)
            }}
          >
            <TabsList className="w-full grid grid-cols-6">
              {RADII.map((r) => (
                <TabsTrigger key={r.value} value={r.value}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}

