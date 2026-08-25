# @celestia-project/ui

> Shadcn-style React component primitives built on **Base UI** and **Tailwind CSS v4** — part of the [Celestia Starter](https://github.com/dev-celestia/celestia-starter) monorepo.

[![npm version](https://img.shields.io/npm/v/@celestia-project/ui)](https://www.npmjs.com/package/@celestia-project/ui)
[![license](https://img.shields.io/npm/l/@celestia-project/ui)](./LICENSE)

> 📘 **Full Documentation**: Detailed implementation info (import options, component mappings, sub-components, and props reference) is located in [packages/ui/docs](./docs/implementation-details.md) and on the docs site at [`/docs/components/implementation-details`](file:///Users/arham/Desktop/project/celestia-starter/apps/web/content/docs/components/implementation-details.mdx).

---

## Features

- **63 components** — forms, navigation, overlays, data display, and more
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
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

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

```tsx
import { Button } from "@celestia-project/ui/components/button";
import { cn } from "@celestia-project/ui/lib/utils";
import { useIsMobile } from "@celestia-project/ui/hooks/use-mobile";
```

### `cn` utility

```tsx
import { cn } from "@celestia-project/ui";

<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## Component Reference

<details>
<summary><strong>Layout & Structure</strong></summary>

| Component                                                                         | Import         |
| --------------------------------------------------------------------------------- | -------------- |
| `AspectRatio`                                                                     | `aspect-ratio` |
| `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription` | `card`         |
| `Resizable`, `ResizablePanel`, `ResizablePanelGroup`, `ResizableHandle`           | `resizable`    |
| `Separator`                                                                       | `separator`    |
| `Sidebar` (+ 20 sub-parts)                                                        | `sidebar`      |

</details>

<details>
<summary><strong>Typography & Display</strong></summary>

| Component                                 | Import       |
| ----------------------------------------- | ------------ |
| `Alert`, `AlertTitle`, `AlertDescription` | `alert`      |
| `Badge`                                   | `badge`      |
| `Breadcrumb` (+ parts)                    | `breadcrumb` |
| `Empty`                                   | `empty`      |
| `Item`                                    | `item`       |
| `Kbd`                                     | `kbd`        |
| `Marker`                                  | `marker`     |
| `Message`, `MessageBubble`                | `message`    |
| `Skeleton`                                | `skeleton`   |
| `Table` (+ parts)                         | `table`      |

</details>

<details>
<summary><strong>Forms & Inputs</strong></summary>

| Component                                                        | Import          |
| ---------------------------------------------------------------- | --------------- |
| `Button`                                                         | `button`        |
| `ButtonGroup`                                                    | `button-group`  |
| `Checkbox`                                                       | `checkbox`      |
| `Combobox`                                                       | `combobox`      |
| `Field`, `FieldLabel`, `FieldDescription`, `FieldError`          | `field`         |
| `Input`                                                          | `input`         |
| `InputGroup`                                                     | `input-group`   |
| `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` | `input-otp`     |
| `Label`                                                          | `label`         |
| `NativeSelect`                                                   | `native-select` |
| `RadioGroup`, `RadioGroupItem`                                   | `radio-group`   |
| `Select` (+ parts)                                               | `select`        |
| `Slider`                                                         | `slider`        |
| `Switch`                                                         | `switch`        |
| `Textarea`                                                       | `textarea`      |
| `Toggle`                                                         | `toggle`        |
| `ToggleGroup`, `ToggleGroupItem`                                 | `toggle-group`  |

</details>

<details>
<summary><strong>Overlays & Popups</strong></summary>

| Component                                                        | Import          |
| ---------------------------------------------------------------- | --------------- |
| `AlertDialog` (+ parts)                                          | `alert-dialog`  |
| `ContextMenu` (+ parts)                                          | `context-menu`  |
| `Dialog` (+ parts)                                               | `dialog`        |
| `Drawer` (+ parts)                                               | `drawer`        |
| `DropdownMenu` (+ parts)                                         | `dropdown-menu` |
| `HoverCard`, `HoverCardTrigger`, `HoverCardContent`              | `hover-card`    |
| `Popover`, `PopoverTrigger`, `PopoverContent`                    | `popover`       |
| `Sheet` (+ parts)                                                | `sheet`         |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `tooltip`       |

</details>

<details>
<summary><strong>Navigation</strong></summary>

| Component                                        | Import            |
| ------------------------------------------------ | ----------------- |
| `Menubar` (+ parts)                              | `menubar`         |
| `Menu` (+ parts)                                 | `menu`            |
| `NavigationMenu` (+ parts)                       | `navigation-menu` |
| `Pagination` (+ parts)                           | `pagination`      |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `tabs`            |

</details>

<details>
<summary><strong>Data & Media</strong></summary>

| Component                                 | Import        |
| ----------------------------------------- | ------------- |
| `Attachment`                              | `attachment`  |
| `Avatar`, `AvatarImage`, `AvatarFallback` | `avatar`      |
| `Bubble`                                  | `bubble`      |
| `Calendar`                                | `calendar`    |
| `Carousel` (+ parts)                      | `carousel`    |
| `Chart` (+ parts)                         | `chart`       |
| `Progress`                                | `progress`    |
| `ScrollArea`                              | `scroll-area` |

</details>

<details>
<summary><strong>Feedback & Utilities</strong></summary>

| Component                                                            | Import             |
| -------------------------------------------------------------------- | ------------------ |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | `accordion`        |
| `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`            | `collapsible`      |
| `Command` (+ parts)                                                  | `command`          |
| `Direction`                                                          | `direction`        |
| `MessageScroller`                                                    | `message-scroller` |
| `Spinner`                                                            | `spinner`          |
| `SonnerToaster` (re-exported as to avoid collision with `Toaster`)   | barrel `index`     |
| `Toast`, `Toaster` (+ parts)                                         | `toast`            |

</details>

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
