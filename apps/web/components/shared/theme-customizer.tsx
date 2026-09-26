"use client"

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
import { toast } from "@celestia-project/ui/primitive/sonner"
import { cn } from "@celestia-project/ui/lib/utils"
import {
  PALETTES,
  PALETTE_BG_CLASSES,
  RADII,
  resolvePalette,
  useTheme,
  useThemeSettings,
} from "@/lib/theme"

/**
 * Theme customizer UI — accent palette, interface mode, corner radius.
 *
 * Pure presentation: state and persistence come from `useThemeSettings`
 * (lib/theme), mode from `useTheme`. All selectable values and storage
 * live in `lib/theme/palettes.ts`.
 */
export function ThemeCustomizer() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { settings, ready, setPalette, setRadius, reset } = useThemeSettings()

  const handlePaletteSelect = (paletteId: string) => {
    setPalette(paletteId)
    toast.success(`Active palette: ${resolvePalette(paletteId).name}`)
  }

  const handleRadiusSelect = (radiusVal: string, label: string) => {
    setRadius(radiusVal)
    toast.success(`Corner radius: ${label}`)
  }

  const handleReset = () => {
    reset()
    setTheme("system")
    toast.success("Theme reset to defaults")
  }

  if (!ready) {
    return (
      <Button variant="ghost" size="icon-sm" aria-label="Customize Theme" title="Customize Theme">
        <PaletteIcon className="size-4 text-muted-foreground" />
      </Button>
    )
  }

  const activePalette = resolvePalette(settings.paletteId)

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
          <MoonIcon className="size-3.5 text-muted-foreground ms-0.5" />
        ) : resolvedTheme === "light" ? (
          <SunIcon className="size-3.5 text-muted-foreground ms-0.5" />
        ) : (
          <DesktopIcon className="size-3.5 text-muted-foreground ms-0.5" />
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
              const isActive = settings.paletteId === palette.id
              return (
                <button
                  key={palette.id}
                  onClick={() => handlePaletteSelect(palette.id)}
                  title={palette.name}
                  className={cn(
                    "group relative flex items-center justify-start gap-1.5 rounded-sm border px-2 py-1.5 text-xs transition-all active:scale-95 cursor-pointer",
                    isActive
                      ? "border-primary bg-primary/15 text-foreground font-semibold shadow-xs ring-1 ring-primary/40"
                      : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "size-2.5  w-8 h-4 rounded-xs shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10",
                      PALETTE_BG_CLASSES[palette.id] || "bg-primary"
                    )}
                  />
                  {isActive && (
                    <CheckIcon className="size-3 text-primary ms-auto shrink-0 animate-in fade-in zoom-in-75 duration-fast" weight="bold" />
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
          <Tabs
            value={theme ?? "system"}
            onValueChange={(val) => {
              if (val) {
                setTheme(val as string)
                toast.success(`Theme: ${String(val).charAt(0).toUpperCase() + String(val).slice(1)}`)
              }
            }}
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="light" className="gap-1.5 text-xs cursor-pointer">
                <SunIcon className="size-3.5" />
                <span>Light</span>
              </TabsTrigger>
              <TabsTrigger value="dark" className="gap-1.5 text-xs cursor-pointer">
                <MoonIcon className="size-3.5" />
                <span>Dark</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-1.5 text-xs cursor-pointer">
                <DesktopIcon className="size-3.5" />
                <span>System</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="my-1 opacity-60" />

        {/* Section 3: Corner Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Corner Radius</span>
            <span className="text-xs font-mono text-muted-foreground">{settings.radius}</span>
          </div>

          <Tabs
            value={settings.radius}
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
