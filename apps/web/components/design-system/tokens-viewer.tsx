"use client"

import * as React from "react"
import {
  CopyIcon,
  CheckIcon,
  PaletteIcon,
  TextTIcon,
  BoundingBoxIcon,
  DropIcon,
  CodeIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"
import { Badge, Button } from "@celestia-project/ui"

// Semantic Color Tokens definition
export const COLOR_TOKENS = [
  {
    name: "Background",
    cssVar: "--background",
    token: "bg-background",
    lightVal: "oklch(1 0 0)",
    darkVal: "oklch(0.145 0 0)",
    description: "Default page and layout background surface.",
  },
  {
    name: "Foreground",
    cssVar: "--foreground",
    token: "text-foreground",
    lightVal: "oklch(0.145 0 0)",
    darkVal: "oklch(0.985 0 0)",
    description: "Primary high-contrast text and icon color.",
  },
  {
    name: "Primary",
    cssVar: "--primary",
    token: "bg-primary",
    lightVal: "oklch(0.205 0 0)",
    darkVal: "oklch(0.985 0 0)",
    description: "Brand identity, primary actions, and focused states.",
  },
  {
    name: "Primary Foreground",
    cssVar: "--primary-foreground",
    token: "text-primary-foreground",
    lightVal: "oklch(0.985 0 0)",
    darkVal: "oklch(0.205 0 0)",
    description: "Contrasting text placed on top of primary elements.",
  },
  {
    name: "Secondary",
    cssVar: "--secondary",
    token: "bg-secondary",
    lightVal: "oklch(0.97 0 0)",
    darkVal: "oklch(0.269 0 0)",
    description: "Alternative subdued actions, secondary pills, tags.",
  },
  {
    name: "Muted",
    cssVar: "--muted",
    token: "bg-muted",
    lightVal: "oklch(0.97 0 0)",
    darkVal: "oklch(0.269 0 0)",
    description: "Subtle backgrounds, disabled items, table alternating rows.",
  },
  {
    name: "Muted Foreground",
    cssVar: "--muted-foreground",
    token: "text-muted-foreground",
    lightVal: "oklch(0.556 0 0)",
    darkVal: "oklch(0.708 0 0)",
    description: "Secondary descriptions, hints, metadata, placeholder text.",
  },
  {
    name: "Accent",
    cssVar: "--accent",
    token: "bg-accent",
    lightVal: "oklch(0.97 0 0)",
    darkVal: "oklch(0.269 0 0)",
    description: "Hover states on interactive rows, dropdowns, menubars.",
  },
  {
    name: "Destructive",
    cssVar: "--destructive",
    token: "bg-destructive",
    lightVal: "oklch(0.577 0.245 27.325)",
    darkVal: "oklch(0.396 0.141 25.723)",
    description: "Errors, destructive actions, danger alerts, delete buttons.",
  },
  {
    name: "Border",
    cssVar: "--border",
    token: "border-border",
    lightVal: "oklch(0.922 0 0)",
    darkVal: "oklch(0.269 0 0)",
    description: "Standard structural dividing lines, card outlines, separators.",
  },
  {
    name: "Input",
    cssVar: "--input",
    token: "border-input",
    lightVal: "oklch(0.922 0 0)",
    darkVal: "oklch(0.269 0 0)",
    description: "Form input boundaries, checkboxes, switches outlines.",
  },
  {
    name: "Ring",
    cssVar: "--ring",
    token: "ring-ring",
    lightVal: "oklch(0.708 0 0)",
    darkVal: "oklch(0.439 0 0)",
    description: "Accessible focus rings and keyboard navigation outlines.",
  },
  {
    name: "Card",
    cssVar: "--card",
    token: "bg-card",
    lightVal: "oklch(1 0 0)",
    darkVal: "oklch(0.145 0 0)",
    description: "Surface background for cards, modals, sheets, and popovers.",
  },
]

export const TYPOGRAPHY_SCALE = [
  {
    label: "Display / H1",
    tag: "h1",
    size: "36px - 48px",
    token: "text-4xl sm:text-5xl font-bold tracking-tight",
    sample: "Building resilient design systems",
    specs: "font-weight: 700 • line-height: 1.1 • tracking: -0.025em",
  },
  {
    label: "Heading 2",
    tag: "h2",
    size: "28px - 32px",
    token: "text-2xl sm:text-3xl font-semibold tracking-tight",
    sample: "Modular architecture for modern web applications",
    specs: "font-weight: 600 • line-height: 1.2 • tracking: -0.02em",
  },
  {
    label: "Heading 3",
    tag: "h3",
    size: "20px - 24px",
    token: "text-xl sm:text-2xl font-semibold tracking-tight",
    sample: "Accessible primitives built on Base UI",
    specs: "font-weight: 600 • line-height: 1.3 • tracking: -0.015em",
  },
  {
    label: "Body Large / Lead",
    tag: "p",
    size: "18px",
    token: "text-lg text-muted-foreground",
    sample: "Tailwind CSS v4 zero-runtime design tokens coupled with full type safety.",
    specs: "font-weight: 400 • line-height: 1.6 • tracking: normal",
  },
  {
    label: "Body Standard",
    tag: "p",
    size: "14px - 16px",
    token: "text-sm sm:text-base leading-relaxed text-foreground",
    sample: "Components are decoupled from framework runtime specifics and consume standardized CSS custom properties.",
    specs: "font-weight: 400 • line-height: 1.5 • tracking: normal",
  },
  {
    label: "Caption / Muted",
    tag: "span",
    size: "12px",
    token: "text-xs text-muted-foreground",
    sample: "Last updated 2 hours ago • Apache-2.0 / MIT Licensed",
    specs: "font-weight: 400 • line-height: 1.4 • tracking: normal",
  },
  {
    label: "Monospace / Code",
    tag: "code",
    size: "13px",
    token: "font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded",
    sample: "import { Button } from '@celestia-project/ui'",
    specs: "font-family: var(--font-geist-mono) • font-weight: 500",
  },
]

export const RADIUS_TOKENS = [
  { name: "Small", token: "rounded-sm", var: "--radius-sm", px: "calc(var(--radius) - 4px)", rem: "~4px", usage: "Badges, tooltips, tags" },
  { name: "Medium", token: "rounded-md", var: "--radius-md", px: "calc(var(--radius) - 2px)", rem: "~6px", usage: "Buttons, inputs, selects, dropdown items" },
  { name: "Large", token: "rounded-lg", var: "--radius-lg", px: "var(--radius)", rem: "~8px", usage: "Cards, dialogs, sheets, containers" },
  { name: "Extra Large", token: "rounded-xl", var: "--radius-xl", px: "calc(var(--radius) + 4px)", rem: "~12px", usage: "Hero cards, floating banners" },
  { name: "Full / Pill", token: "rounded-full", var: "9999px", px: "9999px", rem: "Pill", usage: "Avatars, status chips, icon action buttons" },
]

export const SHADOW_TOKENS = [
  { name: "Shadow XS", token: "shadow-xs", desc: "Subtle 1px border elevation for flat buttons and inputs" },
  { name: "Shadow SM", token: "shadow-sm", desc: "Cards, list items, subtle hover states" },
  { name: "Shadow MD", token: "shadow-md", desc: "Dropdown menus, popovers, contextual toolbars" },
  { name: "Shadow LG", token: "shadow-lg", desc: "Modals, dialogs, drawers, floating command palettes" },
  { name: "Shadow 2XL", token: "shadow-2xl", desc: "Floating overlays, global alerts, lightbox viewports" },
]

export function TokensViewer() {
  const [activeTab, setActiveTab] = React.useState<"colors" | "typography" | "radius" | "shadows" | "exporter">("colors")
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)
  const [exportFormat, setExportFormat] = React.useState<"tailwind-v4" | "css-vars" | "json">("tailwind-v4")

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getExportCode = () => {
    if (exportFormat === "tailwind-v4") {
      return `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}`
    }

    if (exportFormat === "css-vars") {
      return `:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
}`
    }

    return JSON.stringify(
      {
        version: "1.0.0",
        name: "celestia-design-tokens",
        tokens: {
          color: {
            background: { value: "{color.neutral.50}" },
            foreground: { value: "{color.neutral.950}" },
            primary: { value: "{color.brand.main}" },
            secondary: { value: "{color.neutral.200}" },
            muted: { value: "{color.neutral.100}" },
            border: { value: "{color.neutral.300}" },
          },
          radii: {
            sm: "4px",
            md: "6px",
            lg: "8px",
            xl: "12px",
            full: "9999px",
          },
          typography: {
            fontFamilySans: "var(--font-geist-sans), system-ui, sans-serif",
            fontFamilyMono: "var(--font-geist-mono), monospace",
          },
        },
      },
      null,
      2
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <Button
          variant={activeTab === "colors" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("colors")}
          className="gap-2"
        >
          <PaletteIcon className="size-4" />
          <span>Colors & Semantic Tokens</span>
        </Button>
        <Button
          variant={activeTab === "typography" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("typography")}
          className="gap-2"
        >
          <TextTIcon className="size-4" />
          <span>Typography Scale</span>
        </Button>
        <Button
          variant={activeTab === "radius" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("radius")}
          className="gap-2"
        >
          <BoundingBoxIcon className="size-4" />
          <span>Radius & Spacing</span>
        </Button>
        <Button
          variant={activeTab === "shadows" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("shadows")}
          className="gap-2"
        >
          <DropIcon className="size-4" />
          <span>Elevation & Shadows</span>
        </Button>
        <Button
          variant={activeTab === "exporter" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("exporter")}
          className="gap-2 ml-auto"
        >
          <CodeIcon className="size-4" />
          <span>Export Tokens</span>
        </Button>
      </div>

      {/* 1. Colors Tab */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Semantic Color Palette</h3>
              <p className="text-sm text-muted-foreground">
                All colors use the high-gamut <strong>OKLCH</strong> color space for uniform lightness and contrast parity across dark and light modes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_TOKENS.map((c) => (
              <div
                key={c.cssVar}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-border hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{c.name}</h4>
                    <span className="font-mono text-xs text-muted-foreground">{c.token}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`var(${c.cssVar})`, c.cssVar)}
                    className="rounded-md border border-border/60 p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                    title="Copy CSS variable"
                  >
                    {copiedKey === c.cssVar ? (
                      <CheckIcon className="size-3.5 text-green-500" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </button>
                </div>

                {/* Swatch Previews */}
                <div className="my-2 grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Light</span>
                    <div
                      className="h-10 w-full rounded-lg border border-border/40 shadow-inner flex items-center justify-center font-mono text-[10px] text-muted-foreground/80"
                      style={{ backgroundColor: c.lightVal }}
                    >
                      preview
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground truncate">{c.lightVal}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dark</span>
                    <div
                      className="h-10 w-full rounded-lg border border-border/40 shadow-inner flex items-center justify-center font-mono text-[10px] text-muted-foreground/80"
                      style={{ backgroundColor: c.darkVal }}
                    >
                      preview
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground truncate">{c.darkVal}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground border-t border-border/50 pt-2.5">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Typography Tab */}
      {activeTab === "typography" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Typographic Hierarchy</h3>
            <p className="text-sm text-muted-foreground">
              Powered by <strong>Geist Sans</strong> and <strong>Geist Mono</strong>. Engineered with precise optical tracking and line height ratios.
            </p>
          </div>

          <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden">
            {TYPOGRAPHY_SCALE.map((t, idx) => (
              <div key={idx} className="p-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm">{t.label}</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">{t.size}</Badge>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{t.specs}</p>
                  <span className="font-mono text-[11px] text-primary/80 mt-1 block truncate">class=&quot;{t.token}&quot;</span>
                </div>

                <div className="w-full lg:w-2/3 border-t border-border/40 pt-3 lg:border-t-0 lg:pt-0">
                  <div className={t.token}>{t.sample}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Radius & Spacing Tab */}
      {activeTab === "radius" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Corner Radii & Shape System</h3>
            <p className="text-sm text-muted-foreground">
              Standardized border radius scaling computed from a single root variable <code className="text-primary font-mono">--radius: 0.625rem</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RADIUS_TOKENS.map((r) => (
              <div key={r.name} className="flex flex-col items-center justify-between rounded-xl border border-border/80 bg-card p-5 text-center">
                <div className="flex w-full items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">{r.name}</span>
                  <Badge variant="outline" className="font-mono text-xs">{r.token}</Badge>
                </div>

                {/* Visual Representation Box */}
                <div className="my-6 flex h-24 w-24 items-center justify-center border-2 border-primary bg-primary/10 shadow-sm transition-all" style={{ borderRadius: r.rem === "Pill" ? "9999px" : r.rem }}>
                  <span className="font-mono text-[11px] font-medium text-primary">{r.rem}</span>
                </div>

                <div className="w-full border-t border-border/50 pt-3 text-left">
                  <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span>Formula:</span>
                    <span>{r.px}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <strong className="text-foreground">Usage:</strong> {r.usage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Shadows & Elevation Tab */}
      {activeTab === "shadows" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Elevation & Depth Layers</h3>
            <p className="text-sm text-muted-foreground">
              Layered depth tokens for structural separation without relying on heavy borders.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SHADOW_TOKENS.map((s) => (
              <div
                key={s.name}
                className={`flex flex-col justify-between rounded-xl border border-border/60 bg-card p-6 ${s.token} transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground text-sm">{s.name}</h4>
                    <span className="font-mono text-xs text-primary">{s.token}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>

                <div className="mt-6 flex items-center justify-center rounded-lg border border-border/40 bg-muted/40 py-4">
                  <span className="text-xs font-medium text-muted-foreground">Interactive Surface Element</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Exporter Tab */}
      {activeTab === "exporter" && (
        <div className="space-y-5 rounded-xl border border-border/80 bg-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Export Design Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Copy and integrate these tokens into any external project instantly.
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 p-1">
              <Button
                variant={exportFormat === "tailwind-v4" ? "default" : "ghost"}
                size="xs"
                onClick={() => setExportFormat("tailwind-v4")}
              >
                Tailwind v4
              </Button>
              <Button
                variant={exportFormat === "css-vars" ? "default" : "ghost"}
                size="xs"
                onClick={() => setExportFormat("css-vars")}
              >
                CSS Variables
              </Button>
              <Button
                variant={exportFormat === "json" ? "default" : "ghost"}
                size="xs"
                onClick={() => setExportFormat("json")}
              >
                Tokens JSON
              </Button>
            </div>
          </div>

          <div className="relative">
            <pre className="max-h-96 overflow-x-auto rounded-lg border border-border/80 bg-muted/70 p-4 font-mono text-xs leading-relaxed text-foreground">
              {getExportCode()}
            </pre>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => copyToClipboard(getExportCode(), "export-all")}
              className="absolute right-3 top-3 gap-1.5"
            >
              {copiedKey === "export-all" ? (
                <>
                  <CheckIcon className="size-3 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="size-3" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
