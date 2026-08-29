import type { ColorToken, TypographyToken, RadiusToken, ShadowToken } from "./types"

// Semantic Color Tokens definition
export const COLOR_TOKENS: ColorToken[] = [
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
export const TYPOGRAPHY_SCALE: TypographyToken[] = [
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
export const RADIUS_TOKENS: RadiusToken[] = [
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
export const SHADOW_TOKENS: ShadowToken[] = [
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

export const EXPORT_TAILWIND_V4 = `@theme inline {
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

export const EXPORT_CSS_VARS = `:root {
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

export const EXPORT_JSON = JSON.stringify(
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
