"use client"

import * as React from "react"
import { SonnerToaster } from "@celestia-project/ui"
import { DesignSystemProvider, useDesignSystem } from "@/components/design-system/hooks/use-design-system"
import { DesignSystemHeader } from "@/components/design-system/design-system-header"
import { HeroSection } from "@/components/design-system/hero-section"
import { ShowcaseTab } from "@/components/design-system/showcase-tab"
import { TokensTab } from "@/components/design-system/tokens-tab"
import { GuideTab } from "@/components/design-system/guide-tab"
import { PrinciplesTab } from "@/components/design-system/principles-tab"
import { BackToTop } from "@/components/design-system/back-to-top"

function DesignSystemContent() {
  const { activeSection } = useDesignSystem()

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SonnerToaster position="bottom-right" />

      {/* Navigation Header */}
      <DesignSystemHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        {/* Hero & Navigation Section */}
        <HeroSection />

        {/* Tab Content */}
        {activeSection === "components" && <ShowcaseTab />}
        {activeSection === "tokens" && <TokensTab />}
        {activeSection === "guide" && <GuideTab />}
        {activeSection === "principles" && <PrinciplesTab />}
      </main>

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DesignSystemProvider>
        <DesignSystemContent />
      </DesignSystemProvider>
    </React.Suspense>
  )
}
