# Celestia Starter

> A production-ready, full-stack monorepo starter built with **Next.js 15**, **Hono**, **Better Auth**, **Drizzle ORM**, **Base UI**, **Tailwind CSS v4**, and **Expo / React Native**.

[![npm @celestia-project/create](https://img.shields.io/npm/v/@celestia-project/create?label=%40celestia-project%2Fcreate)](https://www.npmjs.com/package/@celestia-project/create)
[![npm @celestia-project/ui](https://img.shields.io/npm/v/@celestia-project/ui?label=%40celestia-project%2Fui)](https://www.npmjs.com/package/@celestia-project/ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-v10-orange.svg)](https://pnpm.io)

---

## 🚀 Quick Start

Scaffold a new project in seconds using the interactive CLI:

```bash
npx @celestia-project/create my-app
```

Or pass flags to skip prompts:

```bash
npx @celestia-project/create my-app --features auth,dashboard,blog
```

### Local Development (in this repository)

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables for the API backend
# Copy apps/api/.env.example to apps/api/.env (or create it with PORT=4000, DATABASE_URL, BETTER_AUTH_SECRET)

# 3. Push database schema to PostgreSQL
pnpm --filter @workspace/db db:push

# 4. Start all applications (Next.js web & documentation, Hono API)
pnpm dev
```

- **Web App & Docs** → [http://localhost:1212](http://localhost:1212) (Docs at [/docs](http://localhost:1212/docs))
- **API Server (Backend)** → [http://localhost:4000](http://localhost:4000)
- **Mobile App (Expo)** → not started by `pnpm dev`; run `pnpm mobile` in a second terminal (Metro bundler, then press `i` / `a` for a simulator)

---

## 🏗 Architecture

Celestia Starter enforces a strict **separated architecture** between frontend and backend:

```
┌────────────────────────────────┐       /api/* (proxy)       ┌────────────────────────────────┐
│         apps/web (UI)          │  ───────────────────────▶  │        apps/api (Hono)         │
│  Next.js 15 App Router · Pure  │  same-origin via rewrites  │  Backend API · Better Auth     │
└────────────────────────────────┘                            └───────────────┬────────────────┘
                                                                              │ Drizzle ORM
                                                                      ┌───────▼────────┐
                                                                      │   PostgreSQL   │
                                                                      └────────────────┘
```

- **Backend API (`apps/api`)**: Powered by Hono running on Node.js (port 4000). Owns the database connection, business logic, authentication server instance, and CRUD endpoints. Exposes end-to-end typed contracts via Hono RPC.
- **Frontend (`apps/web`)**: Next.js 15 App Router (port 1212). Pure UI layer with zero direct database access and no server-side auth secrets. Houses landing pages, interactive component showcase, and full documentation. Proxies `/api/*` to the backend.
- **Mobile App (`apps/mobile`)**: Expo (React Native) client that consumes `@celestia-project/mobile` **from source** — there is no build step, Metro compiles the package's `.ts`/`.tsx` directly. It is not part of the `pnpm dev` pipeline; start it with `pnpm mobile`.
- **Shared DB (`packages/db`)**: Drizzle ORM schema and PostgreSQL client (`@workspace/db`).
- **Shared UI (`packages/ui`)**: `@celestia-project/ui` component library built on Base UI and Tailwind CSS v4.
- **Shared Mobile UI (`packages/mobile`)**: `@celestia-project/mobile` — native iOS/Android components built on `@expo/ui` (real SwiftUI & Jetpack Compose), organised with the same `primitive` / `composite` / `layout` taxonomy as the web library. **Workspace-only** — not published to npm.

---

## 📁 Repository Structure

```
celestia-starter/
├── apps/
│   ├── api/                # Standalone Hono backend (owns DB, auth, RPC routes)
│   ├── mobile/             # Expo (React Native) showcase app for @celestia-project/mobile
│   └── web/                # Next.js 15 frontend (pure UI, landing, docs, showcase)
├── packages/
│   ├── ui/                 # @celestia-project/ui component library (Base UI + Tailwind v4)
│   ├── mobile/             # @celestia-project/mobile native components (workspace-only)
│   ├── db/                 # @workspace/db (Drizzle schema & PostgreSQL client)
│   ├── cli/                # @celestia-project/create CLI package
│   ├── feature-manager/    # @workspace/feature-manager CLI & installer engine
│   ├── eslint-config/      # Shared ESLint flat-config presets
│   └── typescript-config/  # Shared TypeScript config presets
├── features/               # Modular, installable features (manifests + code)
└── scripts/
    ├── publish.sh          # Automated npm publishing script (ui + cli only)
    └── ui-audit/           # Static UI audit checks, run via `pnpm audit:ui`
```

---

## 🧩 Installed Features

The project includes modular features installed via `@workspace/feature-manager`:

<!-- feature-manager:features:begin -->
<!-- feature-manager:features:auth:begin -->
- **auth** — Email/password + OAuth authentication with Better Auth (server in `apps/api`, client in `apps/web`)
<!-- feature-manager:features:auth:end -->
<!-- feature-manager:features:dashboard:begin -->
- **dashboard** — Protected dashboard UI with sidebar navigation and typed RPC data-fetching
<!-- feature-manager:features:dashboard:end -->
<!-- feature-manager:features:blog:begin -->
- **blog** — Full CRUD blog (backend endpoints in `apps/api`, dashboard UI in `apps/web`) over the typed Hono RPC client
<!-- feature-manager:features:blog:end -->
<!-- feature-manager:features:access:begin -->
- **access** — User management (roles, ban, delete) with RBAC route guards and ABAC policies over the Better Auth admin plugin
<!-- feature-manager:features:access:end -->
<!-- feature-manager:features:cms:begin -->
- **cms** — Blog post management for the Celestia app: editorial workflow (draft → review → scheduled → published → archived), markdown block editor integration, auto-save, revisions with diff/rollback, categories/tags, SEO & Open Graph controls, image uploads (WebP), soft-locking, and a public blog at `/blog`.
<!-- feature-manager:features:cms:end -->
<!-- feature-manager:features:media-r2:begin -->
- **media-r2** — Cloudflare R2 media storage with BYOK for the CMS: admins connect their own R2 bucket from the Media page; uploads go to R2 (S3 API), stream through `/api/media/f/<key>` when no public domain is configured, and local disk stays as the fallback.
<!-- feature-manager:features:media-r2:end -->
<!-- feature-manager:features:unsplash:begin -->
- **unsplash** — Unsplash stock-photo search for the CMS media picker: a server-side proxy route (`/api/cms/unsplash`) keeps the access key out of the browser, and the media dialog gains an Unsplash tab where writers search, browse, and insert photos with attribution.
<!-- feature-manager:features:unsplash:end -->
<!-- feature-manager:features:end -->

---

## 🛠 Feature Manager CLI

You can install or remove feature modules cleanly without manually editing code files:

```bash
# List available and installed features
pnpm list-features

# Add a feature to the monorepo
pnpm add-feature <name>

# Preview exactly what an install would do (writes nothing)
pnpm add-feature <name> --dry-run

# Upgrade / reinstall an already-installed feature
pnpm add-feature <name> --force

# Remove a feature from the monorepo (restores files shared with other features)
pnpm remove-feature <name>

# Check installed features for drift or breakage (read-only, non-zero exit on errors)
pnpm verify-features
```

Installs are transactional: every path is snapshotted first, so a failure rolls the
repository back instead of leaving a half-applied state. When two features provide the
same file the newest install wins and the previous content is backed up under
`.feature-manager/backups/`, so removing a feature restores the other one's version
rather than deleting a file it still needs.

---

## 📜 Workspace Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development servers for web and api in parallel |
| `pnpm mobile` | Start the Expo dev server (Metro) for `apps/mobile` |
| `pnpm build` | Build all applications and workspace packages via Turborepo |
| `pnpm lint` | Verify lint coverage across the workspace, then run ESLint in the packages that declare it |
| `pnpm typecheck` | Run `tsc --noEmit` across all workspace targets |
| `pnpm test` | Run the feature-manager test suite (marker engine, manifests, install/remove lifecycle) |
| `pnpm audit:ui` | Run the static UI audit: token contrast, theme parity, stylesheet compile, focus rings, feature templates |
| `pnpm list-features` | List available and installed features |
| `pnpm add-feature <name>` | Install a feature (add `--dry-run` to preview, `--force` to upgrade) |
| `pnpm remove-feature <name>` | Uninstall a feature, restoring files shared with other features |
| `pnpm verify-features` | Verify installed features are intact; non-zero exit on problems |
| `pnpm format` | Prettify code using Prettier and Tailwind plugin |
| `pnpm publish:packages` | Build and publish `@celestia-project/ui` & `@celestia-project/create` to npm |
| `pnpm publish:dry-run` | Preview npm publish tarballs without uploading |
| `pnpm publish:ui` | Publish only the `@celestia-project/ui` package |
| `pnpm publish:cli` | Publish only the `@celestia-project/create` CLI package |

---

## 📦 Published Packages

- **[@celestia-project/create](https://www.npmjs.com/package/@celestia-project/create)** — Interactive CLI tool for scaffolding new Celestia Starter projects (`npx @celestia-project/create`).
- **[@celestia-project/ui](https://www.npmjs.com/package/@celestia-project/ui)** — 60+ accessible React UI primitives built on Base UI & Tailwind CSS v4.

> **`@celestia-project/mobile` is not published.** Although it carries the `@celestia-project` scope, `scripts/publish.sh` only knows about `ui` and `cli`, so there is no `pnpm publish:mobile`. Add it to a workspace with `"@celestia-project/mobile": "workspace:*"` and import it from source. Its documentation lives in `apps/web/content/docs/mobile.mdx` (published at `/docs/mobile`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
