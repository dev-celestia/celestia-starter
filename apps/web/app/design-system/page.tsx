"use client"

import * as React from "react"
import { SonnerToaster } from "@celestia-project/ui"
import { DesignSystemProvider, useDesignSystem } from "@/components/design-system/hooks/use-design-system"
import { HeroSection } from "@/components/design-system/hero-section"
import { ShowcaseTab } from "@/components/design-system/showcase-tab"
import { TokensTab } from "@/components/design-system/tokens-tab"
import { GuideTab } from "@/components/design-system/guide-tab"
import { PrinciplesTab } from "@/components/design-system/principles-tab"
import { BackToTop } from "@/components/design-system/back-to-top"
import { SiteLayout } from "@/components/shared/site-layout"

function DesignSystemContent() {
  const { activeSection } = useDesignSystem()

  return (
    <>
      <SonnerToaster position="bottom-right" />

      <main className="mx-auto max-w-7xl px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:px-8">
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
    </>
  )
}

export default function DesignSystemPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DesignSystemProvider>
        <SiteLayout
          anchors={[]}
          cta={null}
          footerGroups={{}}
          className="selection:bg-primary/20"
          constrainContent={false}
          footerMaxWidth="max-w-7xl"
        >
          <DesignSystemContent />
        </SiteLayout>
      </DesignSystemProvider>
    </React.Suspense>
  )
}
