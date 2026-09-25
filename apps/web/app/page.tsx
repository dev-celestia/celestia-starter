import type { Metadata } from "next"

import {
  LandingBoundaries,
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingLifecycle,
  LandingMetrics,
  LandingNav,
  LandingPackages,
  LandingTrace,
} from "@/components/landing"

import "./landing.css"

export const metadata: Metadata = {
  title: "Celestia — Decoupled Full-Stack Starter",
  description:
    "A Next.js 16 frontend that never touches the database, a Hono backend that owns it, and a typed contract between them. Auth, dashboard, blog, CMS and media install as features.",
  openGraph: {
    title: "Celestia — Decoupled Full-Stack Starter",
    description:
      "Two apps, one typed contract, zero glue code. A separated frontend/backend monorepo with installable feature packages and a shared component library.",
    type: "website",
  },
}

/**
 * Marketing home page.
 *
 * The `dark` class puts Celestia's app-shell palette into its dark mode so the
 * library's own components (Button, Badge, Progress, Kbd, Separator, Sheet …)
 * match the forced-dark brand palette that `.landing` uses for its bespoke
 * surfaces. Without it the app-shell tokens would follow the user's theme and
 * render light surfaces on a near-black page.
 */
export default function HomePage() {
  return (
    <div className="landing dark">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingTrace />
        <LandingFeatures />
        <LandingPackages />
        <LandingLifecycle />
        <LandingBoundaries />
        <LandingMetrics />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
