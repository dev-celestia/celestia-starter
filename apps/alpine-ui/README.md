# Alpine UI Showcase

A minimalist docs + showcase app for the **`@celestia-project/alpine-ui`** component library, built with **Vite + Alpine.js + Tailwind CSS v4**. It runs entirely in the browser — no framework lock-in — demonstrating every primitive as a live, interactive demo with copyable markup.

## Run

```bash
pnpm alpine-ui        # dev server on http://localhost:4321
# or
cd apps/alpine-ui && pnpm dev
```

Other scripts: `pnpm build`, `pnpm preview`, `pnpm typecheck`, `pnpm lint`.

## What's inside

- **`index.html`** — app shell: sticky header, sidebar nav (desktop) + select (mobile), and an overview hero with quick-start snippet.
- **`src/main.ts`** — bootstraps Alpine with `@alpinejs/collapse` and the `alpineUI` plugin, registers the `app` store (section nav) and `themeCustomizer` store, and starts Alpine.
- **`src/data.ts`** — the component registry: groups, pillars, and per-component `demo` markup strings rendered both as a live demo and (toggled) as code.
- **`src/theme.ts`** — the shadcn-style theme system: accent palettes, interface mode (light/dark/system), and corner-radius selection applied as CSS variables on `:root`/`.dark`.
- **`src/style.css`** — imports `@celestia-project/alpine-ui/globals.css` and defines the Celestia OKLCH tokens for both light and dark themes.

## Adding a component demo

1. Add a `ComponentItem` to the appropriate `groups[].items` in `src/data.ts` with `name`, `description`, and a `demo` markup string (using `x-data` stores from the plugin, e.g. `accordion`, `dialog`, `tabs`).
2. It appears automatically in the sidebar and content sections — no other wiring needed.

## Design

- **Theme customizer** in the header: pick an accent color (8 palettes), interface mode (light / dark / system), and corner radius — applied via CSS variables and persisted in `localStorage`.
- **Dark default** with system-aware mode switching (respects `prefers-color-scheme` when set to System).
- Uses the same OKLCH tokens and motion as `@celestia-project/ui`.
- Reduced-motion respected via `prefers-reduced-motion` guards in `src/style.css`.
