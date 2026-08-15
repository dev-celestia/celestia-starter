# Celestia Starter

> A production-ready, full-stack monorepo starter built with **Next.js 15**, **Hono**, **Better Auth**, **Drizzle ORM**, **Base UI**, and **Tailwind CSS v4**.

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

- **Web App & Docs** → [http://localhost:3000](http://localhost:3000) (Docs at [/docs](http://localhost:3000/docs))
- **API Server (Backend)** → [http://localhost:4000](http://localhost:4000)

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
- **Frontend (`apps/web`)**: Next.js 15 App Router (port 3000). Pure UI layer with zero direct database access and no server-side auth secrets. Houses landing pages, interactive component showcase, and full documentation. Proxies `/api/*` to the backend.
- **Shared DB (`packages/db`)**: Drizzle ORM schema and PostgreSQL client (`@workspace/db`).
- **Shared UI (`packages/ui`)**: `@celestia-project/ui` component library built on Base UI and Tailwind CSS v4.

---

## 📁 Repository Structure

```
celestia-starter/
├── apps/
│   ├── api/                # Standalone Hono backend (owns DB, auth, RPC routes)
│   └── web/                # Next.js 15 frontend (pure UI, landing, docs, showcase)
├── packages/
│   ├── ui/                 # @celestia-project/ui component library (Base UI + Tailwind v4)
│   ├── db/                 # @workspace/db (Drizzle schema & PostgreSQL client)
│   ├── cli/                # @celestia-project/create CLI package
│   ├── feature-manager/    # @workspace/feature-manager CLI & installer engine
│   ├── eslint-config/      # Shared ESLint flat-config presets
│   └── typescript-config/  # Shared TypeScript config presets
├── features/               # Modular, installable features (manifests + code)
└── scripts/
    └── publish.sh          # Automated npm publishing script
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
<!-- feature-manager:features:end -->

---

## 🛠 Feature Manager CLI

You can install or remove feature modules cleanly without manually editing code files:

```bash
# List available and installed features
pnpm list-features

# Add a feature to the monorepo
pnpm add-feature <name>

# Remove a feature from the monorepo
pnpm remove-feature <name>
```

---

## 📜 Workspace Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development servers for web and api in parallel |
| `pnpm build` | Build all applications and workspace packages via Turborepo |
| `pnpm lint` | Run ESLint checks across all apps and packages |
| `pnpm typecheck` | Run `tsc --noEmit` across all workspace targets |
| `pnpm format` | Prettify code using Prettier and Tailwind plugin |
| `pnpm publish:packages` | Build and publish `@celestia-project/ui` & `@celestia-project/create` to npm |
| `pnpm publish:dry-run` | Preview npm publish tarballs without uploading |
| `pnpm publish:ui` | Publish only the `@celestia-project/ui` package |
| `pnpm publish:cli` | Publish only the `@celestia-project/create` CLI package |

---

## 📦 Published Packages

- **[@celestia-project/create](https://www.npmjs.com/package/@celestia-project/create)** — Interactive CLI tool for scaffolding new Celestia Starter projects (`npx @celestia-project/create`).
- **[@celestia-project/ui](https://www.npmjs.com/package/@celestia-project/ui)** — 60+ accessible React UI primitives built on Base UI & Tailwind CSS v4.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
