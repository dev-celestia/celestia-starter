# @celestia-project/ui

> Shadcn-style React component primitives built on **Base UI** and **Tailwind CSS v4** — part of the [Celestia Starter](https://github.com/dev-celestia/celestia-starter) monorepo.

[![npm version](https://img.shields.io/npm/v/@celestia-project/ui)](https://www.npmjs.com/package/@celestia-project/ui)
[![license](https://img.shields.io/npm/l/@celestia-project/ui)](./LICENSE)

> 📘 **Full Documentation**: Detailed implementation info (import options, component mappings, sub-components, and props reference) is located in [packages/ui/docs](./docs/implementation-details.md) and on the docs site at [`/docs/components/implementation-details`](file:///Users/arham/Desktop/project/celestia-starter/apps/web/content/docs/components/implementation-details.mdx).

---

## Features

- **120+ components** — organized as primitives, composites, and AI chat components
- Built on [Base UI](https://base-ui.com) for accessible, unstyled primitives
- Styled with **Tailwind CSS v4** and `tw-animate-css`
- Full **TypeScript** support with bundled `.d.ts` types
- Tree-shakeable ESM output via `tsup`
- Light + dark theme via CSS variables (oklch-based shadcn palette)

---

## Installation

```bash
pnpm add @celestia-project/ui
# or
npm install @celestia-project/ui
# or
yarn add @celestia-project/ui
```

**Peer dependencies** (install separately if not already present):

```bash
pnpm add react@^19 react-dom@^19
```

---

## Setup

Choose the integration method that fits your project setup:

### Option A: Quickstart (New or standalone apps)

If you do not have an existing Tailwind v4 configuration and want an all-in-one setup, import the global stylesheet directly in your app entry point (e.g. `app/layout.tsx` for Next.js or `main.tsx` for Vite):

```tsx
import "@celestia-project/ui/globals.css";
```

This imports Tailwind CSS v4, `tw-animate-css`, shadcn base styles, animations, and all CSS design tokens (light + dark themes).

### Option B: Existing Tailwind v4 App (`@source` directive)

If your app already has an existing Tailwind CSS v4 setup (`@import "tailwindcss";`) and custom CSS variables, do **not** import `@celestia-project/ui/globals.css` to prevent stylesheet collisions or theme variable overrides.

Instead, add the `@source` directive in your main CSS file (e.g., `src/styles/globals.css`) so Tailwind v4 scans the UI package for utility classes, and map the shadcn theme variables in `@theme inline`:

```css
@import "tailwindcss";

/* 1. Point Tailwind v4 to scan @celestia-project/ui */
@source "../../node_modules/@celestia-project/ui";
@source "../**";

@custom-variant dark (&:is(.dark *));

/* 2. Map shadcn tokens to CSS variables */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
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

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  /* Optional: Celestia UI tokens & motion */
  --color-bg: hsl(var(--bg, 0 0% 4%));
  --color-surface: hsl(var(--surface, 0 0% 8%));
  --color-text-primary: hsl(var(--text, 0 0% 96%));
  --color-fog: hsl(0 0% 53%);
  --color-stroke: hsl(var(--stroke, 0 0% 12%));

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  --animate-scroll-down: scroll-down 1.5s ease-in-out infinite;
  --animate-role-fade-in: role-fade-in 0.4s cubic-bezier(0.23, 1, 0.32, 1) both;
  --animate-gradient-shift: gradient-shift 6s ease infinite;

  @keyframes scroll-down {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(200%);
    }
  }

  @keyframes role-fade-in {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
}
```

### PostCSS Configuration (if needed)

If your app doesn't already have a PostCSS config, you can re-export the one bundled with this package:

```js
// postcss.config.mjs
export { default } from "@celestia-project/ui/postcss.config"
```

### Dark Mode Setup

The dark theme activates on the `.dark` class. Use [next-themes](https://github.com/pacocoursey/next-themes) or set the class manually:

```tsx
<html className="dark">...</html>
```

---

## Usage

### Barrel import (recommended for most cases)

```tsx
import { Button, Card, CardHeader, CardContent, Badge } from "@celestia-project/ui";

export function MyCard() {
  return (
    <Card>
      <CardHeader>
        <Badge variant="secondary">New</Badge>
      </CardHeader>
      <CardContent>
        <Button>Get started</Button>
      </CardContent>
    </Card>
  );
}
```

### Deep imports (for better tree-shaking in non-bundler environments)

Components are organized into two tiers — **primitives** (single-purpose building blocks) and **composites** (assembled from multiple primitives):

```tsx
import { Button } from "@celestia-project/ui/primitive/button";
import { Field, FieldLabel, FieldDescription, FieldError } from "@celestia-project/ui/composite/field";
import { cn } from "@celestia-project/ui/lib/utils";
import { useIsMobile } from "@celestia-project/ui/hooks/use-mobile";
```

AI chat components deep-import from the `ai/` namespace:

```tsx
import { PromptInput } from "@celestia-project/ui/components/ai/prompt-input";
```

### `cn` utility

```tsx
import { cn } from "@celestia-project/ui";

<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## Component Reference

Components are split into two tiers plus the AI namespace:

| Tier       | Import path                          | Meaning                                                              |
| ---------- | ------------------------------------ | -------------------------------------------------------------------- |
| Primitive  | `@celestia-project/ui/primitive/*`   | Single-purpose building blocks (forms, overlays, data display, ...)  |
| Composite  | `@celestia-project/ui/composite/*`   | Assembled from primitives (fields, groups, sidebars, editors, ...)   |
| AI         | `@celestia-project/ui/components/ai/*` | Chat & agent components (prompt input, canvas, model selector, ...)  |

All three tiers are also re-exported from the barrel `@celestia-project/ui`.

### Primitives

<details>
<summary><strong>Layout & Structure</strong></summary>

| Component                                                                         | Import                |
| --------------------------------------------------------------------------------- | --------------------- |
| `AspectRatio`                                                                     | `primitive/aspect-ratio` |
| `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription` | `primitive/card`      |
| `Resizable`, `ResizablePanel`, `ResizablePanelGroup`, `ResizableHandle`           | `primitive/resizable` |
| `Separator`                                                                       | `primitive/separator` |
| `Sheet` (+ parts)                                                                 | `primitive/sheet`     |

</details>

<details>
<summary><strong>Typography & Display</strong></summary>

| Component                                 | Import              |
| ----------------------------------------- | ------------------- |
| `Alert`, `AlertTitle`, `AlertDescription` | `primitive/alert`   |
| `Badge`                                   | `primitive/badge`   |
| `Breadcrumb` (+ parts)                    | `primitive/breadcrumb` |
| `Bubble`                                  | `primitive/bubble`  |
| `Item`                                    | `primitive/item`    |
| `Kbd`                                     | `primitive/kbd`     |
| `Ripple`                                  | `primitive/ripple`  |
| `Skeleton`                                | `primitive/skeleton`|
| `Table` (+ parts)                         | `primitive/table`   |

</details>

<details>
<summary><strong>Forms & Inputs</strong></summary>

| Component                                                        | Import           |
| ---------------------------------------------------------------- | ---------------- |
| `Button`                                                         | `primitive/button` |
| `Checkbox`                                                       | `primitive/checkbox` |
| `Input`                                                          | `primitive/input` |
| `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` | `primitive/input-otp` |
| `Label`                                                          | `primitive/label` |
| `RadioGroup`, `RadioGroupItem`                                   | `primitive/radio-group` |
| `Select` (+ parts)                                               | `primitive/select` |
| `Slider`                                                         | `primitive/slider` |
| `Switch`                                                         | `primitive/switch` |
| `Textarea`                                                       | `primitive/textarea` |
| `Toggle`                                                         | `primitive/toggle` |

</details>

<details>
<summary><strong>Overlays & Popups</strong></summary>

| Component                                                        | Import              |
| ---------------------------------------------------------------- | ------------------- |
| `ContextMenu` (+ parts)                                          | `primitive/context-menu` |
| `Dialog` (+ parts)                                               | `primitive/dialog`  |
| `Drawer` (+ parts)                                               | `primitive/drawer`  |
| `DropdownMenu` (+ parts)                                         | `primitive/dropdown-menu` |
| `HoverCard`, `HoverCardTrigger`, `HoverCardContent`              | `primitive/hover-card` |
| `Popover`, `PopoverTrigger`, `PopoverContent`                    | `primitive/popover` |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `primitive/tooltip` |

</details>

<details>
<summary><strong>Navigation</strong></summary>

| Component                                        | Import            |
| ------------------------------------------------ | ----------------- |
| `Menubar` (+ parts)                              | `primitive/menubar` |
| `NavigationMenu` (+ parts)                       | `primitive/navigation-menu` |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `primitive/tabs`  |

</details>

<details>
<summary><strong>Data & Media</strong></summary>

| Component                                 | Import        |
| ----------------------------------------- | ------------- |
| `Avatar`, `AvatarImage`, `AvatarFallback` | `primitive/avatar` |
| `Calendar`                                | `primitive/calendar` |
| `Carousel` (+ parts)                      | `primitive/carousel` |
| `Progress`                                | `primitive/progress` |
| `ScrollArea`                              | `primitive/scroll-area` |

</details>

<details>
<summary><strong>Feedback & Utilities</strong></summary>

| Component                                                            | Import             |
| -------------------------------------------------------------------- | ------------------ |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | `primitive/accordion` |
| `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`            | `primitive/collapsible` |
| `Command` (+ parts)                                                  | `primitive/command` |
| `Direction`                                                          | `primitive/direction` |
| `Spinner`                                                            | `primitive/spinner` |
| `SonnerToaster` (re-exported as to avoid collision with `Toaster`)   | barrel `index`     |
| `Toast`, `Toaster` (+ parts)                                         | `primitive/toast`  |

</details>

### Composites

<details>
<summary><strong>Forms & Inputs</strong></summary>

| Component                                                        | Import          |
| ---------------------------------------------------------------- | --------------- |
| `ButtonGroup`, `ButtonGroupText`                                 | `composite/button-group` |
| `Combobox` (+ parts)                                             | `composite/combobox` |
| `Field`, `FieldLabel`, `FieldDescription`, `FieldError`          | `composite/field` |
| `Form` (+ parts)                                                 | `composite/form` |
| `InputGroup`                                                     | `composite/input-group` |
| `NativeSelect`                                                   | `composite/native-select` |
| `ToggleGroup`, `ToggleGroupItem`                                 | `composite/toggle-group` |

</details>

<details>
<summary><strong>Layout & Structure</strong></summary>

| Component                                 | Import            |
| ----------------------------------------- | ----------------- |
| `Sidebar` (+ 20 sub-parts)                | `composite/sidebar` |
| `TabBar` (+ parts)                        | `composite/tab-bar` |

</details>

<details>
<summary><strong>Overlays & Popups</strong></summary>

| Component                                                        | Import          |
| ---------------------------------------------------------------- | --------------- |
| `AlertDialog` (+ parts)                                          | `composite/alert-dialog` |
| `Menu` (+ parts)                                                 | `composite/menu` |

</details>

<details>
<summary><strong>Navigation</strong></summary>

| Component                                        | Import            |
| ------------------------------------------------ | ----------------- |
| `Pagination` (+ parts)                           | `composite/pagination` |

</details>

<details>
<summary><strong>Data & Media</strong></summary>

| Component                                 | Import          |
| ----------------------------------------- | --------------- |
| `ArticleCard` (+ parts)                   | `composite/article-card` |
| `Attachment`                              | `composite/attachment` |
| `Chart` (+ parts)                         | `composite/chart` |
| `DataTable` (+ parts)                     | `composite/data-table` |
| `Empty` (+ parts)                         | `composite/empty` |
| `Message`, `MessageBubble`                | `composite/message` |
| `MessageScroller`                         | `composite/message-scroller` |

</details>

<details>
<summary><strong>Chat & Editors</strong></summary>

| Component                            | Import               |
| ------------------------------------ | -------------------- |
| `BlockTextEditor`                    | `composite/block-text-editor` |
| `ChatInput`                          | `composite/chat-input` |
| `ChatMessage`, `ChatMessageArea`     | `composite/chat-message`, `composite/chat-message-area` |
| `Marker`                             | `composite/marker`  |
| `SelectEnvInput`                     | `composite/select-env-input` |
| `TextEditor`                         | `composite/text-editor` |

</details>

### AI Components

Deep-import from `@celestia-project/ui/components/ai/<name>`. Highlights include `PromptInput`, `Agent`, `Artifact`, `Canvas`, `ModelSelector`, `CodeBlock`, `ChatInput`, `MessageScroller`, `Toolbar`, and 45+ more chat/agent building blocks.

---

## Hooks

| Hook            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `useIsMobile()` | Returns `true` when viewport width is below the mobile breakpoint |

---

## Design Tokens

All CSS variables are defined in `globals.css`. The package ships two palettes:

### shadcn semantic palette (app shell)

Used by dashboard components, forms, and overlays. Variables like `--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, etc. Supports both light (`:root`) and dark (`.dark`) themes via oklch values.

### Celestia brand palette (landing / marketing)

A forced-dark palette with literal tokens:

| Token       | Utility             | Value                                 |
| ----------- | ------------------- | ------------------------------------- |
| `--bg`      | `bg-bg`             | `hsl(0 0% 4%)` — page background      |
| `--surface` | `bg-surface`        | `hsl(0 0% 8%)` — cards, raised panels |
| `--text`    | `text-text-primary` | `hsl(0 0% 96%)` — headings            |
| _(literal)_ | `text-fog`          | `hsl(0 0% 53%)` — muted copy          |
| `--stroke`  | `border-stroke`     | `hsl(0 0% 12%)` — borders             |

Brand accent gradient: `#89aacc → #4e85bf`.

---

## Development

This package lives at `packages/ui` inside the [celestia-starter](https://github.com/dev-celestia/celestia-starter) monorepo.

```bash
# Install all dependencies from the monorepo root
pnpm install

# Build the package
pnpm --filter @celestia-project/ui build

# Watch mode
pnpm --filter @celestia-project/ui dev

# Type-check
pnpm --filter @celestia-project/ui typecheck
```

---

## License

MIT © [dev-celestia](https://github.com/dev-celestia)
