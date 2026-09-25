/* --------------------------------------------------------------------------
   Home page content.

   Kept apart from the components so copy can be edited without touching markup —
   the same split the feature docs use. Every number quoted here is a real count
   taken from this repository, so the page cannot drift into marketing fiction:
   see the comment above each one.
   -------------------------------------------------------------------------- */

export interface NavLink {
  label: string
  href: string
}

/** In-page sections, in the order they appear. */
export const NAV_LINKS: NavLink[] = [
  { label: "Architecture", href: "#architecture" },
  { label: "Features", href: "#features" },
  { label: "Packages", href: "#packages" },
  { label: "Boundaries", href: "#boundaries" },
  { label: "Why Celestia", href: "#metrics" },
]

/**
 * The hero command bar demonstrates the CLI the way the product actually uses
 * it. The placeholder cycles through these so the bar shows its range before
 * anyone types, and `COMMAND_CHIPS` gives one-click versions of the same idea.
 */
export const SAMPLE_COMMANDS: string[] = [
  "npx @celestia-project/create my-app",
  "pnpm add-feature cms",
  "pnpm add-feature cms --dry-run",
  "pnpm verify-features",
]

export interface CommandChip {
  /** Short label for the chip row, so it stays on one line. */
  label: string
  /** The command the chip actually puts on the clipboard. */
  command: string
}

export const COMMAND_CHIPS: CommandChip[] = [
  {
    label: "Scaffold a project",
    command: "npx @celestia-project/create my-app",
  },
  { label: "Add the CMS", command: "pnpm add-feature cms" },
  { label: "Preview an install", command: "pnpm add-feature cms --dry-run" },
  { label: "Verify installs", command: "pnpm verify-features" },
  { label: "Start the stack", command: "pnpm dev" },
]

export interface TrustItem {
  name: string
  kind: string
}

/** The five things the stack is actually assembled from. */
export const TRUST_ITEMS: TrustItem[] = [
  { name: "Next.js 16", kind: "App Router UI" },
  { name: "Hono", kind: "Typed RPC API" },
  { name: "Better Auth", kind: "Sessions & OAuth" },
  { name: "Drizzle ORM", kind: "Schema & migrations" },
  { name: "PostgreSQL", kind: "Primary datastore" },
]

export interface Feature {
  icon: string
  title: string
  body: string
}

export const FEATURES: Feature[] = [
  {
    icon: "PlugsConnected",
    title: "Types, not a fetch wrapper",
    body: "The web app calls the API through a Hono RPC client whose signature is inferred from the server route tree. Rename a field in apps/api and the call site fails to compile — there is no codegen step to forget and no hand-written wrapper to drift.",
  },
  {
    icon: "ShieldCheck",
    title: "A boundary the tooling enforces",
    body: "apps/web cannot open a database connection, construct an auth server, or read a secret. That is not a convention written in a README — it is a rule that fails the build, which is the only kind that survives a deadline.",
  },
  {
    icon: "Cube",
    title: "Features that install themselves",
    body: "Every feature ships as a package under features/ with a manifest describing the files it copies and the markers it edits. pnpm add-feature applies it transactionally and can roll the whole thing back.",
  },
  {
    icon: "Key",
    title: "Auth already wired on both sides",
    body: "Better Auth runs its server instance in apps/api and hands the web app a React client. Email/password, OAuth, sessions, route protection and the admin plugin are plumbed and typed out of the box.",
  },
  {
    icon: "Database",
    title: "One schema, one connection",
    body: "packages/db owns the Drizzle schema and the PostgreSQL pool. Both apps import the same types from @workspace/db, and neither one grows a local client of its own.",
  },
  {
    icon: "Scroll",
    title: "Docs that build with the code",
    body: "The documentation site lives in the same repo as the code it describes and is served at /docs. When a feature changes, its page changes in the same commit — the rule is written down and reviewed like any other.",
  },
]

export interface PackageCard {
  icon: string
  name: string
  body: string
  /** Mono readout on the left of the card footer — a real property, not a stat. */
  detail: string
  /** Right-hand footer label: how the package stays current. */
  cadence: string
}

export const PACKAGE_CARDS: PackageCard[] = [
  {
    icon: "DesktopTower",
    name: "apps/web",
    body: "The Next.js App Router frontend and nothing else: pages, the component showcase, the docs site, and every dashboard screen. No database handle, no secret, no auth server.",
    detail: "port 3000",
    cadence: "Fast refresh",
  },
  {
    icon: "Terminal",
    name: "apps/api",
    body: "The Hono backend on Node. It owns the database pool, the Better Auth server, the business logic and every CRUD route, and publishes all of it as one end-to-end typed contract.",
    detail: "port 4000",
    cadence: "Hot reload",
  },
  {
    icon: "Stack",
    name: "packages/ui",
    body: "The component library published as @celestia-project/ui — Base UI primitives and composed patterns on Tailwind v4, shared by the web app and by every feature that installs one.",
    detail: "88 components",
    cadence: "Versioned on npm",
  },
  {
    icon: "Database",
    name: "packages/db",
    body: "The single Drizzle schema and PostgreSQL client. Migrations and db:push run from here, so there is exactly one place where the shape of the data is decided.",
    detail: "@workspace/db",
    cadence: "Migrations on demand",
  },
  {
    icon: "GitBranch",
    name: "packages/feature-manager",
    body: "The engine behind pnpm add-feature. It snapshots every path before it writes, so a failure rolls the repository back instead of leaving half a feature applied.",
    detail: "transactional",
    cadence: "Per command",
  },
  {
    icon: "Lightning",
    name: "packages/cli",
    body: "The @celestia-project/create scaffolder. One command stands a project up from this template with the features you pick already installed and wired into the docs.",
    detail: "npx one-liner",
    cadence: "Published to npm",
  },
]

export interface LifecycleStep {
  index: string
  title: string
  body: string
}

export const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    index: "01",
    title: "Browse what exists",
    body: "pnpm list-features prints every feature available in the monorepo alongside the ones already installed in yours, so you are never guessing at what is on the shelf.",
  },
  {
    index: "02",
    title: "Preview the change",
    body: "pnpm add-feature cms --dry-run lists every file it would create, every marker it would edit and every dependency it would add — and writes nothing at all.",
  },
  {
    index: "03",
    title: "Install transactionally",
    body: "A real install snapshots each path before touching it. If any step fails, the whole install rolls back rather than leaving the repository in a half-applied state.",
  },
  {
    index: "04",
    title: "Verify or remove",
    body: "pnpm verify-features reports drift and breakage read-only. pnpm remove-feature uninstalls cleanly, restoring any file that another installed feature still needs.",
  },
]

export interface LedgerEntry {
  name: string
  version: string
  installedAt: string
}

/** A slice of the real ledger in features.json. */
export const LEDGER_ENTRIES: LedgerEntry[] = [
  { name: "cms", version: "v1.0.0", installedAt: "2026-09-06" },
  { name: "media-r2", version: "v1.0.0", installedAt: "2026-09-06" },
  { name: "unsplash", version: "v1.0.0", installedAt: "2026-09-06" },
]

export interface BoundaryRule {
  icon: string
  title: string
  body: string
}

export const BOUNDARY_RULES: BoundaryRule[] = [
  {
    icon: "Database",
    title: "No database in the UI",
    body: "apps/web never opens a connection. Every read and write crosses /api/* through the rewrite proxy, so the browser can only ask for what the API is willing to answer.",
  },
  {
    icon: "Lock",
    title: "No auth server in the UI",
    body: "betterAuth() is constructed exactly once, in apps/api/src/auth.ts. The web app imports the React client and nothing else — there is no second session store to disagree with.",
  },
  {
    icon: "Fingerprint",
    title: "Secrets stay in one file",
    body: "DATABASE_URL, BETTER_AUTH_SECRET and every OAuth credential live in apps/api/.env. The web bundle has no import path that could reach them.",
  },
  {
    icon: "Scales",
    title: "One source of truth per concern",
    body: "Schema belongs to packages/db, components belong to packages/ui. An app that needs either imports it; an app that copies it is the bug.",
  },
  {
    icon: "PlugsConnected",
    title: "Contracts, not hand-written fetch",
    body: "The RPC client is inferred from the server routes, so a breaking change surfaces as a type error in the editor instead of a 500 in production.",
  },
  {
    icon: "ShieldCheck",
    title: "Docs are part of the deliverable",
    body: "A feature is not finished until its .mdx page exists and is listed in the sidebar. Reviewing a feature means reviewing its documentation in the same pull request.",
  },
]

export interface BoundaryCheck {
  rule: string
  subject: string
  actor: string
  scope: string
  outcome: "PASS" | "BLOCKED"
}

/**
 * The boundary check is real — the rules above are the ones it enforces. The
 * last row is the shape of a violation: a client module reaching for the shared
 * database package, which compiles and then quietly loses every server type.
 */
export const BOUNDARY_CHECKS: BoundaryCheck[] = [
  {
    rule: "no-db-in-web",
    subject: "apps/web/app/(dashboard)/dashboard/page.tsx",
    actor: "client component",
    scope: "web",
    outcome: "PASS",
  },
  {
    rule: "no-auth-server-in-web",
    subject: "apps/web/lib/auth-client.ts",
    actor: "client module",
    scope: "web",
    outcome: "PASS",
  },
  {
    rule: "no-secret-env-in-web",
    subject: "apps/web/next.config.ts",
    actor: "build config",
    scope: "web",
    outcome: "PASS",
  },
  {
    rule: "no-cross-app-import",
    subject: "apps/web/components/cms/media-picker.tsx",
    actor: "attempted @workspace/db",
    scope: "web → packages/db",
    outcome: "BLOCKED",
  },
]

export interface Metric {
  value: string
  label: string
}

/**
 * Counted from the repository, not estimated:
 *   88   — packages/ui primitives + composites + layouts
 *   7    — directories under features/
 *   163  — .mdx pages under apps/web/content/docs
 *   0    — secret env reads reachable from apps/web (that is the point)
 */
export const METRICS: Metric[] = [
  { value: "88", label: "Components in the shared UI library" },
  { value: "7", label: "Features installable in one command" },
  { value: "163", label: "Documentation pages in the repo" },
  { value: "0", label: "Secrets readable from the web app" },
]

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Architecture",
    links: [
      { label: "apps/web — Next.js UI", href: "/docs/backend" },
      { label: "apps/api — Hono backend", href: "/docs/backend" },
      { label: "packages/db — Drizzle", href: "/docs/packages" },
      { label: "packages/ui — Components", href: "/docs/design-system" },
      { label: "Typed RPC contract", href: "/docs/backend" },
    ],
  },
  {
    heading: "Features",
    links: [
      { label: "Auth", href: "/docs/authentication" },
      { label: "Dashboard", href: "/docs/dashboard" },
      { label: "Blog", href: "/docs/blog" },
      { label: "Access & RBAC", href: "/docs/access" },
      { label: "CMS", href: "/docs/cms" },
      { label: "Media (R2)", href: "/docs/media-r2" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "Getting started", href: "/docs" },
      { label: "Feature manager CLI", href: "/docs/features" },
      { label: "Scaffold a project", href: "/docs/cli" },
      { label: "Design system", href: "/docs/design-system" },
      { label: "Component gallery", href: "/components" },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "Feature installer", href: "/feature-installer" },
      { label: "Documentation", href: "/docs" },
      { label: "MIT licensed", href: "/docs" },
      { label: "npm — @celestia-project/ui", href: "/docs/packages" },
      { label: "npm — @celestia-project/create", href: "/docs/cli" },
    ],
  },
]
