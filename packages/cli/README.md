# @celestia-project/create

Interactive CLI that scaffolds a Celestia project — either the **web monorepo**
(Next.js + Hono + Better Auth + Drizzle) or a **native desktop (GPUI)** app from
`celestia-ui`.

## Usage

```bash
npx @celestia-project/create my-app
# or pick a template up front:
npx @celestia-project/create my-app --template web
npx @celestia-project/create my-desktop --template desktop
```

### Web template

1. Ask which features you want (`auth`, `dashboard`, `blog`, `access`) — dependencies are resolved automatically
2. Clone the template and run `pnpm install`
3. Add/remove features through the feature manager (`features.json` stays in sync)
4. Write `apps/api/.env` and `apps/web/.env`, including a generated `BETTER_AUTH_SECRET`
5. Optionally push the database schema and initialize git

### Desktop template

1. Clone the template and extract `packages/desktop`
2. Keep `celestia-ui` + the starter app (drops the component gallery)
3. Rename the app crate to your project name
4. Optionally run `cargo check` and initialize git

## Non-interactive

```bash
npx @celestia-project/create my-app --template web --features auth,dashboard
npx @celestia-project/create my-desktop --template desktop
```

| Flag | Description |
| --- | --- |
| `-t`, `--template <name>` | `web` or `desktop` (default: prompt; `web` when non-interactive) |
| `--features <a,b>` | Web only — features to install; `requires` are added automatically |
| `--repo <url\|path>` | Template repository to clone (also accepts a local git path) |
| `-h`, `--help` | Show help |

## Requirements

- Node.js ≥ 20 and `git` on your PATH
- **Web:** `pnpm`; a running PostgreSQL if you let the installer push the schema
- **Desktop:** Rust ≥ 1.97 (`cargo`) to build and run

## Related

- [`@celestia-project/ui`](https://www.npmjs.com/package/@celestia-project/ui) — the shadcn-style web component primitives
- Desktop docs — `/docs/desktop` in the monorepo docs site
