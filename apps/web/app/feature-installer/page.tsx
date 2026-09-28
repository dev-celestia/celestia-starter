import type { Metadata } from "next"

import { ArchitectureSection } from "@/components/feature-installer/architecture-section"
import { CtaSection } from "@/components/feature-installer/cta-section"
import { HeroSection } from "@/components/feature-installer/hero-section"
import { InstallSection } from "@/components/feature-installer/install-section"
import { StackSection } from "@/components/feature-installer/stack-section"
import { SiteLayout } from "@/components/shared/site-layout"
import { TriangleDashedIcon } from "@phosphor-icons/react/dist/ssr"

import "../landing.css"

export const metadata: Metadata = {
  title: "Feature Installer — Celestia",
  description:
    "Next.js 16 frontend, Hono backend, Better Auth, Drizzle ORM — a decoupled full-stack starter installed in one command.",
}

export default function FeatureInstallerPage() {
  return (
    // "dark" scope forces the shadcn dark tokens for every component on
    // this page — like the landing, it stays dark regardless of system
    // theme. The sections manage their own containers, so the layout does
    // not constrain them.
    <SiteLayout
      className="dark bg-bg text-text-primary"
      anchors={[]}
      cta={null}
      footerGroups={{}}
      constrainContent={false}
    >
      <div className="border-border/70 bg-muted/40 text-muted-foreground border-b">
        <div className="mx-auto flex w-full max-w-6xl items-start gap-2 px-5 py-2.5 text-xs sm:items-center sm:px-8">
          <TriangleDashedIcon className="size-4 shrink-0" weight="fill" aria-hidden />
          <span className="text-pretty">
            <strong className="text-foreground font-medium">
              Under Active Development:
            </strong>{" "}
            Features are undergoing testing and refinement.
          </span>
        </div>
      </div>
      <HeroSection />
      <StackSection />
      <ArchitectureSection />
      <InstallSection />
      <CtaSection />
    </SiteLayout>
  )
}
