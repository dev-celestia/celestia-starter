# @celestia-project/ui

> Shadcn-style React component primitives built on **Base UI** and **Tailwind CSS v4** — part of the [Celestia Starter](https://github.com/celestia-realm/celestia-starter) monorepo.

[![npm version](https://img.shields.io/npm/v/@celestia-project/ui)](https://www.npmjs.com/package/@celestia-project/ui)
[![license](https://img.shields.io/npm/l/@celestia-project/ui)](./LICENSE)

> 📘 **Full Documentation**: Detailed implementation info (import options, component mappings, sub-components, and props reference) is located in [packages/ui/docs](./docs/implementation-details.md) and on the docs site at [`/docs/components/implementation-details`](file:///Users/arham/Desktop/project/celestia-starter/apps/docs/content/docs/components/implementation-details.mdx).

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

### 1. Import the global stylesheet

In your app entry point (e.g. `app/layout.tsx` for Next.js):

```tsx
import "@celestia-project/ui/globals.css";
```

This imports Tailwind CSS v4, `tw-animate-css`, the shadcn base styles, and all CSS design tokens (light + dark themes).

### 2. Configure PostCSS (if needed)

If your app doesn't already have a PostCSS config, you can re-export the one bundled with this package:

```js
// postcss.config.mjs
export { default } from "@celestia-project/ui/postcss.config";
```

### 3. Configure the dark mode class (optional)

The dark theme activates on `.dark` class. Use [next-themes](https://github.com/pacocoursey/next-themes) or set the class manually:

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

| Component | Import |
|-----------|--------|
| `AspectRatio` | `aspect-ratio` |
| `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription` | `card` |
| `Resizable`, `ResizablePanel`, `ResizablePanelGroup`, `ResizableHandle` | `resizable` |
| `Separator` | `separator` |
| `Sidebar` (+ 20 sub-parts) | `sidebar` |

</details>

<details>
<summary><strong>Typography & Display</strong></summary>

| Component | Import |
|-----------|--------|
| `Alert`, `AlertTitle`, `AlertDescription` | `alert` |
| `Badge` | `badge` |
| `Breadcrumb` (+ parts) | `breadcrumb` |
| `Empty` | `empty` |
| `Item` | `item` |
| `Kbd` | `kbd` |
| `Marker` | `marker` |
| `Message`, `MessageBubble` | `message` |
| `Skeleton` | `skeleton` |
| `Table` (+ parts) | `table` |

</details>

<details>
<summary><strong>Forms & Inputs</strong></summary>

| Component | Import |
|-----------|--------|
| `Button` | `button` |
| `ButtonGroup` | `button-group` |
| `Checkbox` | `checkbox` |
| `Combobox` | `combobox` |
| `Field`, `FieldLabel`, `FieldDescription`, `FieldError` | `field` |
| `Input` | `input` |
| `InputGroup` | `input-group` |
| `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` | `input-otp` |
| `Label` | `label` |
| `NativeSelect` | `native-select` |
| `RadioGroup`, `RadioGroupItem` | `radio-group` |
| `Select` (+ parts) | `select` |
| `Slider` | `slider` |
| `Switch` | `switch` |
| `Textarea` | `textarea` |
| `Toggle` | `toggle` |
| `ToggleGroup`, `ToggleGroupItem` | `toggle-group` |

</details>

<details>
<summary><strong>Overlays & Popups</strong></summary>

| Component | Import |
|-----------|--------|
| `AlertDialog` (+ parts) | `alert-dialog` |
| `ContextMenu` (+ parts) | `context-menu` |
| `Dialog` (+ parts) | `dialog` |
| `Drawer` (+ parts) | `drawer` |
| `DropdownMenu` (+ parts) | `dropdown-menu` |
| `HoverCard`, `HoverCardTrigger`, `HoverCardContent` | `hover-card` |
| `Popover`, `PopoverTrigger`, `PopoverContent` | `popover` |
| `Sheet` (+ parts) | `sheet` |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `tooltip` |

</details>

<details>
<summary><strong>Navigation</strong></summary>

| Component | Import |
|-----------|--------|
| `Menubar` (+ parts) | `menubar` |
| `Menu` (+ parts) | `menu` |
| `NavigationMenu` (+ parts) | `navigation-menu` |
| `Pagination` (+ parts) | `pagination` |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `tabs` |

</details>

<details>
<summary><strong>Data & Media</strong></summary>

| Component | Import |
|-----------|--------|
| `Attachment` | `attachment` |
| `Avatar`, `AvatarImage`, `AvatarFallback` | `avatar` |
| `Bubble` | `bubble` |
| `Calendar` | `calendar` |
| `Carousel` (+ parts) | `carousel` |
| `Chart` (+ parts) | `chart` |
| `Progress` | `progress` |
| `ScrollArea` | `scroll-area` |

</details>

<details>
<summary><strong>Feedback & Utilities</strong></summary>

| Component | Import |
|-----------|--------|
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | `accordion` |
| `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | `collapsible` |
| `Command` (+ parts) | `command` |
| `Direction` | `direction` |
| `MessageScroller` | `message-scroller` |
| `Spinner` | `spinner` |
| `SonnerToaster` (re-exported as to avoid collision with `Toaster`) | barrel `index` |
| `Toast`, `Toaster` (+ parts) | `toast` |

</details>

---

## Hooks

| Hook | Description |
|------|-------------|
| `useIsMobile()` | Returns `true` when viewport width is below the mobile breakpoint |

---

## Design Tokens

All CSS variables are defined in `globals.css`. The package ships two palettes:

### shadcn semantic palette (app shell)

Used by dashboard components, forms, and overlays. Variables like `--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, etc. Supports both light (`:root`) and dark (`.dark`) themes via oklch values.

### Celestia brand palette (landing / marketing)

A forced-dark palette with literal tokens:

| Token | Utility | Value |
|-------|---------|-------|
| `--bg` | `bg-bg` | `hsl(0 0% 4%)` — page background |
| `--surface` | `bg-surface` | `hsl(0 0% 8%)` — cards, raised panels |
| `--text` | `text-text-primary` | `hsl(0 0% 96%)` — headings |
| *(literal)* | `text-fog` | `hsl(0 0% 53%)` — muted copy |
| `--stroke` | `border-stroke` | `hsl(0 0% 12%)` — borders |

Brand accent gradient: `#89aacc → #4e85bf`.

---

## Development

This package lives at `packages/ui` inside the [celestia-starter](https://github.com/celestia-realm/celestia-starter) monorepo.

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

MIT © [celestia-realm](https://github.com/celestia-realm)
