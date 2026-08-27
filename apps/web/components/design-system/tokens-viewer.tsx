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
} from "@phosphor-icons/react"
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TextEditor,
} from "@celestia-project/ui"
import { useTheme } from "next-themes"

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
    description: "Borders of input fields, checkboxes, and form controls.",
  },
  {
    name: "Ring",
    cssVar: "--ring",
    token: "ring-ring",
    lightVal: "oklch(0.708 0 0)",
    darkVal: "oklch(0.439 0 0)",
    description: "Accessible focus rings applied during keyboard navigation.",
  },
  {
    name: "Card",
    cssVar: "--card",
    token: "bg-card",
    lightVal: "oklch(1 0 0)",
    darkVal: "oklch(0.205 0 0)",
    description: "Elevated surfaces, card panels, modals, dropdown containers.",
  },
  {
    name: "Card Foreground",
    cssVar: "--card-foreground",
    token: "text-card-foreground",
    lightVal: "oklch(0.145 0 0)",
    darkVal: "oklch(0.985 0 0)",
    description: "Text and icon elements placed on top of card surfaces.",
  },
  {
    name: "Popover",
    cssVar: "--popover",
    token: "bg-popover",
    lightVal: "oklch(1 0 0)",
    darkVal: "oklch(0.205 0 0)",
    description: "Floating tooltips, dropdown popovers, select menus.",
  },
]

// Typography Scale Definition
export const TYPOGRAPHY_SCALE = [
  {
    label: "Display 2XL",
    token: "text-4xl sm:text-5xl font-bold tracking-tight",
    specs: "3rem / 48px · Leading 1.1 · Tracking -0.02em",
    size: "48px",
    sample: "Celestia Starter UI",
  },
  {
    label: "Display XL",
    token: "text-3xl sm:text-4xl font-bold tracking-tight",
    specs: "2.25rem / 36px · Leading 1.2 · Tracking -0.02em",
    size: "36px",
    sample: "High-Performance Full-Stack Starter",
  },
  {
    label: "Heading Large (H1)",
    token: "text-2xl sm:text-3xl font-semibold tracking-tight",
    specs: "1.875rem / 30px · Leading 1.25 · Tracking -0.015em",
    size: "30px",
    sample: "Production-Grade Design Engineering",
  },
  {
    label: "Heading Medium (H2)",
    token: "text-xl sm:text-2xl font-semibold tracking-tight",
    specs: "1.5rem / 24px · Leading 1.3 · Tracking -0.01em",
    size: "24px",
    sample: "Unstyled Base UI Primitives",
  },
  {
    label: "Heading Small (H3)",
    token: "text-lg sm:text-xl font-semibold",
    specs: "1.25rem / 20px · Leading 1.4 · Tracking -0.005em",
    size: "20px",
    sample: "Zero Runtime CSS Overhead",
  },
  {
    label: "Body Large",
    token: "text-base leading-relaxed",
    specs: "1rem / 16px · Leading 1.625 · Tracking normal",
    size: "16px",
    sample: "Accessible WAI-ARIA 2.1 component architecture engineered for scale.",
  },
  {
    label: "Body Default",
    token: "text-sm leading-relaxed",
    specs: "0.875rem / 14px · Leading 1.5 · Tracking normal",
    size: "14px",
    sample: "Tailwind CSS v4 custom variables mapped at build time.",
  },
  {
    label: "Caption / Microcopy",
    token: "text-xs text-muted-foreground",
    specs: "0.75rem / 12px · Leading 1.4 · Tracking normal",
    size: "12px",
    sample: "MIT License © 2026 Celestia Project",
  },
  {
    label: "Monospace Code",
    token: "font-mono text-xs",
    specs: "0.75rem / 12px · Geist Mono · Tab 2",
    size: "12px",
    sample: "const tokens = oklch(0.205 0 0);",
  },
]

// Radii Scale Definition
export const RADIUS_TOKENS = [
  {
    name: "Small (sm)",
    token: "rounded-sm",
    px: "calc(var(--radius) - 4px)",
    rem: "0.375rem (6px)",
    usage: "Small badges, inner chips, tooltips, tags.",
  },
  {
    name: "Medium (md)",
    token: "rounded-md",
    px: "calc(var(--radius) - 2px)",
    rem: "0.5rem (8px)",
    usage: "Inputs, textareas, select menus, standard buttons.",
  },
  {
    name: "Large (lg - default)",
    token: "rounded-lg",
    px: "var(--radius)",
    rem: "0.625rem (10px)",
    usage: "Standard cards, modals, sheets, accordions, popovers.",
  },
  {
    name: "Extra Large (xl)",
    token: "rounded-xl",
    px: "calc(var(--radius) + 4px)",
    rem: "0.875rem (14px)",
    usage: "Floating hero containers, featured cards, drawers.",
  },
  {
    name: "Full / Pill",
    token: "rounded-full",
    px: "9999px",
    rem: "Pill",
    usage: "Avatars, status pills, circular icon action buttons.",
  },
]

// Shadow & Elevation Definition
export const SHADOW_TOKENS = [
  {
    name: "Shadow Extra-Small (xs)",
    token: "shadow-xs",
    desc: "Subtle baseline border reinforcement on inputs and badges.",
  },
  {
    name: "Shadow Small (sm)",
    token: "shadow-sm",
    desc: "Slight elevation for buttons, chips, and small interactive cards.",
  },
  {
    name: "Shadow Medium (md)",
    token: "shadow-md",
    desc: "Elevated surfaces, dropdown menus, context menus, and toolbars.",
  },
  {
    name: "Shadow Large (lg)",
    token: "shadow-lg",
    desc: "High-elevation floating dialogs, floating action sheets, and drawers.",
  },
  {
    name: "Shadow Extra-Large (xl)",
    token: "shadow-xl",
    desc: "Modal overlays, command palettes, and primary floating alert dialogs.",
  },
]

export function TokensViewer() {
  const { resolvedTheme } = useTheme()
  const editorTheme = resolvedTheme === "light" ? "light" : "dark"

  const [activeTab, setActiveTab] = React.useState("colors")
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
            fontSans: "Geist Sans",
            fontMono: "Geist Mono",
          },
        },
      },
      null,
      2
    )
  }

  return (
    <div className="space-y-6">
      {/* Token Tabs Strip */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full overflow-hidden">
        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 pb-2">
          <TabsList className="inline-flex w-max flex-nowrap h-9 p-1 gap-1">
            <TabsTrigger value="colors" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <PaletteIcon className="size-4 shrink-0" />
              <span>Colors & Semantic Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <TextTIcon className="size-4 shrink-0" />
              <span>Typography Scale</span>
            </TabsTrigger>
            <TabsTrigger value="radius" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <BoundingBoxIcon className="size-4 shrink-0" />
              <span>Radius & Spacing</span>
            </TabsTrigger>
            <TabsTrigger value="shadows" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <DropIcon className="size-4 shrink-0" />
              <span>Elevation & Shadows</span>
            </TabsTrigger>
            <TabsTrigger value="exporter" className="gap-2 text-xs shrink-0 whitespace-nowrap">
              <CodeIcon className="size-4 shrink-0" />
              <span>Export Tokens</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Colors Tab */}
        <TabsContent value="colors" className="space-y-6 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Semantic Color Palette</h3>
            <p className="text-sm text-muted-foreground">
              All colors use the high-gamut <strong>OKLCH</strong> color space for uniform lightness and contrast parity across dark and light modes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_TOKENS.map((c) => (
              <Card key={c.cssVar} className="group relative flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">{c.name}</CardTitle>
                    <CardDescription className="font-mono text-xs">{c.token}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => copyToClipboard(`var(${c.cssVar})`, c.cssVar)}
                    title="Copy CSS variable"
                  >
                    {copiedKey === c.cssVar ? (
                      <CheckIcon className="size-3.5 text-green-500" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </CardHeader>

                <CardContent className="p-4 pt-0">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 2. Typography Tab */}
        <TabsContent value="typography" className="space-y-6 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Typographic Hierarchy</h3>
            <p className="text-sm text-muted-foreground">
              Powered by <strong>Geist Sans</strong> and <strong>Geist Mono</strong>. Engineered with precise optical tracking and line height ratios.
            </p>
          </div>

          <Card className="divide-y divide-border/60 overflow-hidden">
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
          </Card>
        </TabsContent>

        {/* 3. Radius & Spacing Tab */}
        <TabsContent value="radius" className="space-y-6 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Corner Radii & Shape System</h3>
            <p className="text-sm text-muted-foreground">
              Standardized border radius scaling computed from a single root variable <code className="text-primary font-mono">--radius: 0.625rem</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RADIUS_TOKENS.map((r) => (
              <Card key={r.name} className="flex flex-col items-center justify-between p-5 text-center">
                <CardHeader className="flex flex-row w-full items-center justify-between p-0">
                  <CardTitle className="text-sm font-semibold">{r.name}</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">{r.token}</Badge>
                </CardHeader>

                <CardContent className="w-full p-0">
                  {/* Visual Representation Box */}
                  <div
                    className="my-6 mx-auto flex h-24 w-24 items-center justify-center border-2 border-primary bg-primary/10 shadow-xs transition-all"
                    style={{ borderRadius: r.rem === "Pill" ? "9999px" : r.rem }}
                  >
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 4. Shadows & Elevation Tab */}
        <TabsContent value="shadows" className="space-y-6 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Elevation & Depth Layers</h3>
            <p className="text-sm text-muted-foreground">
              Layered depth tokens for structural separation without relying on heavy borders.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SHADOW_TOKENS.map((s) => (
              <Card key={s.name} className={`flex flex-col justify-between p-6 ${s.token} transition-all`}>
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-sm font-semibold">{s.name}</CardTitle>
                    <span className="font-mono text-xs text-primary">{s.token}</span>
                  </div>
                  <CardDescription className="text-xs">{s.desc}</CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4">
                  <div className="flex items-center justify-center rounded-lg border border-border/40 bg-muted/40 py-4">
                    <span className="text-xs font-medium text-muted-foreground">Interactive Surface Element</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 5. Exporter Tab */}
        <TabsContent value="exporter" className="space-y-5 pt-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Export Design Tokens</CardTitle>
                <CardDescription className="text-sm">
                  Copy and integrate these tokens into any external project instantly.
                </CardDescription>
              </div>

              <Tabs value={exportFormat} onValueChange={(v) => setExportFormat(v as "tailwind-v4" | "css-vars" | "json")}>
                <TabsList>
                  <TabsTrigger value="tailwind-v4">Tailwind v4</TabsTrigger>
                  <TabsTrigger value="css-vars">CSS Variables</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="relative rounded-lg border border-border/80 overflow-hidden bg-background">
                <TextEditor
                  value={getExportCode()}
                  language={exportFormat === "json" ? "json" : "css"}
                  theme={editorTheme}
                  height={320}
                  disableValidation
                  options={{
                    readOnly: true,
                    lineNumbers: "on",
                    lineNumbersMinChars: 3,
                    folding: false,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => copyToClipboard(getExportCode(), "export-all")}
                  className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === "export-all" ? (
                    <CheckIcon className="size-3.5 text-green-500" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
