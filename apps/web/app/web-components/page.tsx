"use client"

import { SonnerToaster } from "@celestia-project/ui"
import { DesignSystemProvider } from "@/components/design-system/hooks/use-design-system"
import { HeroSection } from "@/components/design-system/hero-section"
import { ShowcaseTab } from "@/components/design-system/showcase-tab"
import { SiteLayout } from "@/components/shared/site-layout"

function DesignSystemContent() {
  return (
    <>
      <SonnerToaster position="bottom-right" />

      <main className="mx-auto max-w-7xl px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:px-8">
        <HeroSection />
        <ShowcaseTab />
      </main>
    </>
  )
}

export default function DesignSystemPage() {
  return (
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
  )
}
