# @celestia-project/alpine-ui

> Component primitives built on **Alpine.js** and **Tailwind CSS v4** — referenced and cloned from `@celestia-project/ui`.

[![npm version](https://img.shields.io/npm/v/@celestia-project/alpine-ui)](https://www.npmjs.com/package/@celestia-project/alpine-ui)
[![license](https://img.shields.io/npm/l/@celestia-project/alpine-ui)](./LICENSE)

---

## Features

- **Alpine.js Primitives**: Interactive UI primitives powered by Alpine data stores (`Alpine.data(...)`)
- **Tailwind CSS v4 Styled**: Styled with the exact same design tokens, animations, and dark mode palette as `@celestia-project/ui`
- **Zero Framework Lock-in**: Perfect for HTML, Laravel Blade, Vite, Next.js static exports, or standalone Alpine.js web apps
- **Full TypeScript Support**: Exported class utilities, variant helpers (`buttonVariants`, `cn`), and plugin types

---

## Installation

```bash
pnpm add @celestia-project/alpine-ui alpinejs
# or
npm install @celestia-project/alpine-ui alpinejs
```

---

## Setup

### 1. Register Alpine UI Plugin

In your main JavaScript entry file (e.g. `main.js`, `app.js`, or layout inline script):

```typescript
import Alpine from "alpinejs"
import { alpineUI } from "@celestia-project/alpine-ui"

// Register Alpine UI plugin
Alpine.plugin(alpineUI)

window.Alpine = Alpine
Alpine.start()
```

### 2. Include Styles

Import the global stylesheet or point Tailwind CSS v4 to scan `@celestia-project/alpine-ui`:

```css
@import "tailwindcss";
@import "@celestia-project/alpine-ui/globals.css";
```

Or add the `@source` directive in your main Tailwind CSS file:

```css
@import "tailwindcss";
@source "../../node_modules/@celestia-project/alpine-ui";
```

---

## Primitive Component Reference & Markup Examples

### Button

```html
<!-- Default Button -->
<button class="group/button inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-primary bg-background px-3 text-xs/relaxed font-medium text-primary shadow-[0_2px_0_0_var(--primary)] transition-all hover:bg-primary/10 active:translate-y-[2px] active:shadow-none">
  Click me
</button>

<!-- Destructive Button -->
<button class="group/button inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-destructive bg-destructive px-3 text-xs/relaxed font-medium text-white shadow-destructive-3d transition-all hover:bg-destructive/90 active:translate-y-[2px] active:shadow-none">
  Delete
</button>
```

### Accordion

```html
<div x-data="accordion" class="flex w-full flex-col overflow-hidden rounded-md border">
  <div class="border-b" :class="{ 'bg-muted/50': isOpen('item-1') }">
    <button
      type="button"
      @click="toggle('item-1')"
      class="flex w-full items-center justify-between p-2 text-start text-xs font-medium"
    >
      <span>Is it accessible?</span>
      <span x-text="isOpen('item-1') ? '▲' : '▼'" class="text-muted-foreground text-xs"></span>
    </button>
    <div x-show="isOpen('item-1')" x-collapse class="px-2 pb-4 text-xs text-muted-foreground">
      Yes. It adheres to WAI-ARIA standards and Alpine.js reactivity.
    </div>
  </div>
</div>
```

### Dialog / Modal

```html
<div x-data="dialog">
  <!-- Trigger -->
  <button @click="show()" class="rounded-sm border border-primary px-3 py-1.5 text-xs font-medium text-primary">
    Open Modal
  </button>

  <!-- Backdrop & Dialog -->
  <template x-teleport="body">
    <div
      x-show="open"
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @keydown.escape.window="close()"
    >
      <div
        @click.outside="close()"
        class="w-full max-w-sm rounded-xl bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10"
      >
        <div class="flex flex-col gap-1">
          <h3 class="font-heading text-sm font-medium">Modal Title</h3>
          <p class="text-xs text-muted-foreground">Are you sure you want to proceed?</p>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="close()" class="px-3 py-1 text-xs border rounded-sm">Cancel</button>
          <button @click="close()" class="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-sm">Confirm</button>
        </div>
      </div>
    </div>
  </template>
</div>
```

### Dropdown Menu

```html
<div x-data="dropdown" class="relative inline-block text-left">
  <button @click="toggle()" class="px-3 py-1.5 text-xs font-medium border rounded-md">
    Options
  </button>

  <div
    x-show="open"
    @click.outside="close()"
    x-transition
    class="absolute left-0 mt-1 z-50 min-w-32 rounded-lg bg-popover/90 p-1 text-xs shadow-lg ring-1 ring-foreground/10 backdrop-blur-xl"
  >
    <a href="#" class="block px-2 py-1 hover:bg-accent rounded-md">Profile</a>
    <a href="#" class="block px-2 py-1 hover:bg-accent rounded-md">Settings</a>
    <div class="-mx-1 my-1 h-px bg-border"></div>
    <button @click="close()" class="w-full text-left px-2 py-1 text-destructive hover:bg-destructive/10 rounded-md">
      Log out
    </button>
  </div>
</div>
```

### Switch Toggle

```html
<div x-data="switch({ checked: false })" class="flex items-center gap-2">
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    @click="toggle()"
    class="relative inline-flex h-[16.6px] w-[28px] shrink-0 items-center rounded-full border border-transparent transition-colors duration-160"
    :class="checked ? 'bg-primary' : 'bg-input'"
  >
    <span
      class="inline-block size-3.5 rounded-full bg-background transition-transform duration-160"
      :class="checked ? 'translate-x-[calc(100%-2px)]' : 'translate-x-0'"
    ></span>
  </button>
  <span class="text-xs font-medium">Notifications</span>
</div>
```

---

## License

MIT © Celestia
