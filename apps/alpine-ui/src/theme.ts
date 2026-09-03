export interface AccentPalette {
  id: string
  name: string
  hex: string
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

export const ACCENTS: AccentPalette[] = [
  {
    id: "zinc",
    name: "Zinc",
    hex: "#71717a",
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
    hex: "#10b981",
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
    hex: "#8b5cf6",
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
    hex: "#3b82f6",
    light: {
      primary: "oklch(0.55 0.2 250)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.55 0.2 250)",
    },
    dark: {
      primary: "oklch(0.68 0.2 250)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.68 0.2 250)",
    },
  },
  {
    id: "rose",
    name: "Rose",
    hex: "#f43f5e",
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
    hex: "#f97316",
    light: {
      primary: "oklch(0.62 0.2 45)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.62 0.2 45)",
    },
    dark: {
      primary: "oklch(0.72 0.2 45)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.72 0.2 45)",
    },
  },
  {
    id: "teal",
    name: "Teal",
    hex: "#06b6d4",
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
    hex: "#eab308",
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

export type Mode = "light" | "dark" | "system"

const SYSTEM_MEDIA = window.matchMedia("(prefers-color-scheme: dark)")

function systemPrefersDark(): boolean {
  return SYSTEM_MEDIA.matches
}

interface ThemeStore {
  accents: AccentPalette[]
  radii: { label: string; value: string }[]
  open: boolean
  mode: Mode
  accentId: string
  radius: string
  readonly activeAccent: AccentPalette
  readonly isDark: boolean
  toggle(): void
  close(): void
  setMode(mode: Mode): void
  setAccent(id: string): void
  setRadius(value: string): void
  reset(): void
  apply(): void
  init(): void
}

export function createThemeStore(): ThemeStore {
  const saved = localStorage.getItem("alpine-ui-accents")
  const savedAccent = saved && ACCENTS.some((a) => a.id === saved) ? saved : "emerald"
  const savedRadius = localStorage.getItem("alpine-ui-radius") ?? "0.625rem"
  const savedMode = (localStorage.getItem("alpine-ui-mode") as Mode) ?? "system"

  return {
    accents: ACCENTS,
    radii: RADII,
    open: false,
    mode: savedMode,
    accentId: savedAccent,
    radius: savedRadius,

    get activeAccent(): AccentPalette {
      return this.accents.find((a) => a.id === this.accentId) ?? this.accents[1]!
    },

    get isDark(): boolean {
      return this.mode === "dark" || (this.mode === "system" && systemPrefersDark())
    },

    toggle() {
      this.open = !this.open
    },

    close() {
      this.open = false
    },

    setMode(mode: Mode) {
      this.mode = mode
      localStorage.setItem("alpine-ui-mode", mode)
      this.apply()
    },

    setAccent(id: string) {
      this.accentId = id
      localStorage.setItem("alpine-ui-accents", id)
      this.apply()
    },

    setRadius(value: string) {
      this.radius = value
      localStorage.setItem("alpine-ui-radius", value)
      this.apply()
    },

    reset() {
      this.mode = "system"
      this.accentId = "emerald"
      this.radius = "0.625rem"
      localStorage.removeItem("alpine-ui-mode")
      localStorage.removeItem("alpine-ui-accents")
      localStorage.removeItem("alpine-ui-radius")
      this.apply()
    },

    apply() {
      const dark = this.isDark
      document.documentElement.classList.toggle("dark", dark)
      const palette = this.activeAccent
      const colors = dark ? palette.dark : palette.light
      const root = document.documentElement
      root.style.setProperty("--primary", colors.primary)
      root.style.setProperty("--primary-foreground", colors.primaryForeground)
      root.style.setProperty("--ring", colors.ring)
      root.style.setProperty("--radius", this.radius)
    },

    init(this: ThemeStore & { $watch: (k: string, fn: (v: boolean) => void) => void }) {
      this.apply()
      const onSystemChange = () => {
        if (this.mode === "system") this.apply()
      }
      SYSTEM_MEDIA.addEventListener("change", onSystemChange)
      this.$watch("open", (v: boolean) => {
        if (!v) {
          // reset inline vars are fine to leave; re-apply keeps in sync
          this.apply()
        }
      })
    },
  }
}
