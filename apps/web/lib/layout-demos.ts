export type LayoutCategoryId =
  | "shells"
  | "auth"
  | "screens"
  | "system"
  | "marketing"
  | "collab"
  | "data"
  | "flows"

export interface LayoutCategory {
  id: LayoutCategoryId
  name: string
  description?: string
  slugs: string[]
}

export const LAYOUT_CATEGORIES: LayoutCategory[] = [
  {
    id: "shells",
    name: "Shells & Frames",
    description: "Full-page frames and architectural structures",
    slugs: ["auth-shell", "page-shell", "dashboard-shell"],
  },
  {
    id: "auth",
    name: "Authentication",
    description: "Account creation, login, and identity verification screens",
    slugs: [
      "sign-in-page",
      "sign-up-page",
      "forgot-password-page",
      "reset-password-page",
      "two-factor-page",
    ],
  },
  {
    id: "screens",
    name: "App Screens",
    description: "Core productivity, overview, and management views",
    slugs: [
      "dashboard-page",
      "profile-page",
      "settings-page",
      "list-page",
      "billing-page",
    ],
  },
  {
    id: "system",
    name: "System & Feedback",
    description: "Status, 404, and failure recovery states",
    slugs: ["status-page", "not-found-page", "error-page"],
  },
  {
    id: "marketing",
    name: "Marketing & Content",
    description: "Public-facing frames, pricing, and editorial pages",
    slugs: [
      "marketing-shell",
      "landing-page",
      "pricing-page",
      "blog-index-page",
      "article-page",
    ],
  },
  {
    id: "collab",
    name: "Collaboration",
    description: "Messaging, boards, scheduling, and shared files",
    slugs: [
      "inbox-page",
      "chat-page",
      "kanban-page",
      "calendar-page",
      "files-page",
    ],
  },
  {
    id: "data",
    name: "Data & Insights",
    description: "Analytics, reporting, records, and search",
    slugs: [
      "analytics-page",
      "reports-page",
      "record-detail-page",
      "search-page",
      "audit-log-page",
    ],
  },
  {
    id: "flows",
    name: "Commerce & Flows",
    description: "Checkout, invoicing, onboarding, and administration",
    slugs: [
      "checkout-page",
      "invoice-page",
      "onboarding-page",
      "team-page",
      "integrations-page",
    ],
  },
]

export interface LayoutDemoMeta {
  slug: string
  title: string
  description: string
  category: LayoutCategoryId
}

/**
 * The layout family that gets dedicated full-page demos at `/layout`.
 * Order mirrors the docs sidebar group in `content/docs/components/meta.json`.
 */
export const LAYOUT_DEMO_META: LayoutDemoMeta[] = [
  {
    slug: "auth-shell",
    title: "Auth Shell",
    category: "shells",
    description:
      "Authentication page frame with logo, heading, provider aside, footer, and centered or split-screen variants.",
  },
  {
    slug: "page-shell",
    title: "Page Shell",
    category: "shells",
    description:
      "App page frame with blurred sticky header, title, description, trailing actions and width presets.",
  },
  {
    slug: "dashboard-shell",
    title: "Dashboard Shell",
    category: "shells",
    description:
      "Signed-in app frame: navigation rail with brand and footer slots, sticky header, scrolling content column and an optional right rail.",
  },
  {
    slug: "sign-in-page",
    title: "Sign In Page",
    category: "auth",
    description:
      "Ready-made credential sign-in with social providers, remember-me, error and loading states.",
  },
  {
    slug: "sign-up-page",
    title: "Sign Up Page",
    category: "auth",
    description:
      "Registration screen with name, email, password confirmation, terms gate and mismatch validation.",
  },
  {
    slug: "forgot-password-page",
    title: "Forgot Password Page",
    category: "auth",
    description:
      "Email recovery request that swaps to a confirmation state once the reset link has been sent.",
  },
  {
    slug: "reset-password-page",
    title: "Reset Password Page",
    category: "auth",
    description:
      "New-password form with live confirmation matching and a disabled submit until the pair agrees.",
  },
  {
    slug: "two-factor-page",
    title: "Two-Factor Page",
    category: "auth",
    description:
      "OTP challenge built on InputOTP with configurable length, resend link and back navigation.",
  },
  {
    slug: "dashboard-page",
    title: "Dashboard Page",
    category: "screens",
    description:
      "Overview page with a metric tile grid, loading skeletons, empty slot and a secondary column — composed on top of PageShell.",
  },
  {
    slug: "profile-page",
    title: "Profile Page",
    category: "screens",
    description:
      "Banner, overlapping avatar, identity block, metadata and headline numbers, with a sliding line-variant tab bar over the content.",
  },
  {
    slug: "settings-page",
    title: "Settings Page",
    category: "screens",
    description:
      "Section navigation beside stacked panels. Inactive panels stay mounted, so half-typed input survives a section switch.",
  },
  {
    slug: "list-page",
    title: "List Page",
    category: "screens",
    description:
      "The table-driven index screen: toolbar with search and filters, optional row selection with a select-all, loading skeletons, an empty state and pagination.",
  },
  {
    slug: "billing-page",
    title: "Billing Page",
    category: "screens",
    description:
      "Current plan, usage meters against their limits, payment method and invoice history. Every figure is a prop — it never computes a prorated amount or a renewal date.",
  },
  {
    slug: "status-page",
    title: "Status Page",
    category: "system",
    description:
      "One full-viewport frame behind every not-the-page-you-asked-for state — 404, 403, 500, 503, maintenance.",
  },
  {
    slug: "not-found-page",
    title: "Not Found Page",
    category: "system",
    description:
      "404 state with oversized status code, optional icon slot, and primary and secondary calls to action.",
  },
  {
    slug: "error-page",
    title: "Error Page",
    category: "system",
    description:
      "5xx screen with the technical digest a support ticket actually needs.",
  },
  {
    slug: "marketing-shell",
    title: "Marketing Shell",
    category: "marketing",
    description:
      "Public-page frame: announcement strip, navigation bar, body and footer band. Slotted so every marketing page shares one set of chrome.",
  },
  {
    slug: "landing-page",
    title: "Landing Page",
    category: "marketing",
    description:
      "Home page with a hero, a three-up feature grid, a numbers band and a closing call to action. Each band is array-driven, so one can be dropped without touching markup.",
  },
  {
    slug: "pricing-page",
    title: "Pricing Page",
    category: "marketing",
    description:
      "Plan cards under a monthly / annual toggle. Both figures are props — the toggle only swaps which string a card shows.",
  },
  {
    slug: "blog-index-page",
    title: "Blog Index Page",
    category: "marketing",
    description:
      "Category chips over a wide lead story and a card grid. The active chip is controlled, because the filtered list belongs to the router or the CMS.",
  },
  {
    slug: "article-page",
    title: "Article Page",
    category: "marketing",
    description:
      "Long-form reading frame with a sticky contents rail beside the prose, an author block and a related-posts row.",
  },
  {
    slug: "inbox-page",
    title: "Inbox Page",
    category: "collab",
    description:
      "Three-pane mail layout: folder rail, message list, reading pane. Panes collapse in order of least need as the viewport narrows.",
  },
  {
    slug: "chat-page",
    title: "Chat Page",
    category: "collab",
    description:
      "Channel rail, scrolling thread with own / other bubbles, a pinned composer and an optional member rail.",
  },
  {
    slug: "kanban-page",
    title: "Kanban Page",
    category: "collab",
    description:
      "Board of fixed-width columns on a single horizontal track, each with its own vertical scroll and a tone-coded status dot.",
  },
  {
    slug: "calendar-page",
    title: "Calendar Page",
    category: "collab",
    description:
      "Month grid with event chips per day beside an agenda rail. Every date arrives pre-computed — the component owns no calendar library.",
  },
  {
    slug: "files-page",
    title: "Files Page",
    category: "collab",
    description:
      "Folder rail beside a table of entries, with a breadcrumb that carries the location once the rail collapses on narrow screens.",
  },
  {
    slug: "analytics-page",
    title: "Analytics Page",
    category: "data",
    description:
      "KPI tiles over a chart card and a ranked breakdown with share bars. Composed on DashboardPage so the tiles stay the same object the dashboard ships.",
  },
  {
    slug: "reports-page",
    title: "Reports Page",
    category: "data",
    description:
      "Saved-report library with cadence, last run and a status badge. Status is a closed union, so the badge tone is decided once.",
  },
  {
    slug: "record-detail-page",
    title: "Record Detail Page",
    category: "data",
    description:
      "Identity header over a tabbed body with a metadata rail. The header carries an avatar, a status badge and markup subtitle a page title cannot.",
  },
  {
    slug: "search-page",
    title: "Search Page",
    category: "data",
    description:
      "Query bar, facet rail and result list. Query and facets are controlled, because search state is what a shareable URL carries.",
  },
  {
    slug: "audit-log-page",
    title: "Audit Log Page",
    category: "data",
    description:
      "Vertical timeline of who did what, to what, and when, with a per-row connector that survives wrapping rows.",
  },
  {
    slug: "checkout-page",
    title: "Checkout Page",
    category: "flows",
    description:
      "Stepped form beside a sticky order summary. Step progress is derived from the active id, so it cannot contradict itself.",
  },
  {
    slug: "invoice-page",
    title: "Invoice Page",
    category: "flows",
    description:
      "Invoice document with parties, line items and totals. Every figure is a string — a layout that recomputes a total can disagree with the PDF.",
  },
  {
    slug: "onboarding-page",
    title: "Onboarding Page",
    category: "flows",
    description:
      "Wizard with a progress rail that doubles as navigation when a change handler is supplied, and reads as plain progress when it is not.",
  },
  {
    slug: "team-page",
    title: "Team Page",
    category: "flows",
    description:
      "Member roster with roles and status beside an invite panel. The invite is a slot, because seat rules are the product's, not the layout's.",
  },
  {
    slug: "integrations-page",
    title: "Integrations Page",
    category: "flows",
    description:
      "Directory of connectable apps with category chips and per-card toggles that stay optimistic until the server confirms.",
  },
]

export function getLayoutDemoMeta(slug: string): LayoutDemoMeta | undefined {
  return LAYOUT_DEMO_META.find((demo) => demo.slug === slug)
}
