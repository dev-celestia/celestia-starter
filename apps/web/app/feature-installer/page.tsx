import type { Metadata } from "next"

import { ArchitectureSection } from "@/components/feature-installer/architecture-section"
import { CtaSection } from "@/components/feature-installer/cta-section"
import { HeroSection } from "@/components/feature-installer/hero-section"
import { InstallSection } from "@/components/feature-installer/install-section"
import { StackSection } from "@/components/feature-installer/stack-section"
import { SiteLayout, type SiteLink } from "@/components/shared/site-layout"

import "../landing.css"

export const metadata: Metadata = {
  title: "Feature Installer — Celestia",
  description:
    "Building user interfaces should not restart every project. Next.js 16 frontend, Hono backend, Better Auth, Drizzle ORM — a decoupled full-stack starter installed in one command.",
}

/** In-page sections, in the order they appear on the page. */
const INSTALLER_ANCHORS: readonly SiteLink[] = [
  { label: "The Stack", href: "#stack" },
  { label: "Architecture", href: "#architecture" },
  { label: "Get Started", href: "#install" },
]

/** Footer nav columns mirroring this page, in the landing footer's shape. */
const INSTALLER_FOOTER_GROUPS: Record<string, readonly SiteLink[]> = {
  Product: [...INSTALLER_ANCHORS],
  "Get started": [
    { label: "Demo Template", href: "/sign-up" },
    { label: "Documentation", href: "/docs" },
    { label: "Feature Guide", href: "/docs/features" },
  ],
}

export default function FeatureInstallerPage() {
  return (
    // Same shell as the landing: shared content column (no per-section
    // containers), in-page anchors in the rail, and the site theme — the
    // old forced-dark scope is gone, so dark/light follows the customizer
    // like every other page.
    <SiteLayout
      anchors={INSTALLER_ANCHORS}
      cta={{ label: "Get Started", href: "#install" }}
      footerGroups={INSTALLER_FOOTER_GROUPS}
    >
      <HeroSection />
      <StackSection />
      <ArchitectureSection />
      <InstallSection />
      <CtaSection />
    </SiteLayout>
  )
}
