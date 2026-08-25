# @celestia-project/ui — Documentation

Welcome to the internal documentation for `@celestia-project/ui`.

This folder contains implementation guides, import conventions, component module mappings, sub-component breakdowns, and prop specifications.

---

## Table of Contents

1. [Implementation Details](./implementation-details.md) — Comprehensive guide on imports, module structure, and key component APIs
2. [Component Mapping](./component-mapping.md) — Complete table of all 63 component modules, deep import paths, sub-components, and base primitives
3. [Props Reference](./props-reference.md) — Detailed prop definitions for layout, form, overlay, navigation, and chat primitives

---

## Quick Import Summary

### Styles

**Option A: Quickstart (Standalone apps)**
```tsx
import "@celestia-project/ui/globals.css"
```

**Option B: Existing Tailwind v4 Apps (Custom Themes)**
```css
/* In your app's globals.css */
@import "tailwindcss";
@source "../../node_modules/@celestia-project/ui";
@source "../**";
```

### Barrel Imports
```tsx
import { Button, Card, CardHeader, CardTitle, CardContent, Dialog, cn } from "@celestia-project/ui"
```

### Deep Imports
```tsx
import { Button } from "@celestia-project/ui/components/button"
import { Card, CardHeader, CardContent } from "@celestia-project/ui/components/card"
import { useIsMobile } from "@celestia-project/ui/hooks/use-mobile"
import { cn } from "@celestia-project/ui/lib/utils"
```
