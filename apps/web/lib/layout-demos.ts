export type LayoutCategoryId = "shells" | "auth" | "screens" | "system"

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
]

export function getLayoutDemoMeta(slug: string): LayoutDemoMeta | undefined {
  return LAYOUT_DEMO_META.find((demo) => demo.slug === slug)
}
