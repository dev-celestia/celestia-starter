"use client"

import * as React from "react"
import { SonnerToaster } from "@celestia-project/ui"
import { DesignSystemProvider, useDesignSystem } from "@/components/design-system/hooks/use-design-system"
import { HeroSection } from "@/components/design-system/hero-section"
import { ShowcaseTab } from "@/components/design-system/showcase-tab"
import { TemplatesTab } from "@/components/design-system/templates-tab"
import { SiteLayout } from "@/components/shared/site-layout"

function DesignSystemContent({ sources }: { sources: Record<string, string> }) {
  const { activeTab } = useDesignSystem()
  const [hasVisitedTemplates, setHasVisitedTemplates] = React.useState(
    activeTab === "templates"
  )

  React.useEffect(() => {
    if (activeTab === "templates") {
      setHasVisitedTemplates(true)
    }
  }, [activeTab])

  return (
    <>
      <SonnerToaster position="bottom-right" />

      <main className="mx-auto max-w-7xl px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:px-8">
        <HeroSection />
        <div className={activeTab === "components" ? "block" : "hidden"}>
          <ShowcaseTab />
        </div>
        {hasVisitedTemplates && (
          <div className={activeTab === "templates" ? "block" : "hidden"}>
            <TemplatesTab sources={sources} />
          </div>
        )}
      </main>
    </>
  )
}

export function WebComponentsPageClient({
  sources,
  defaultTab = "components",
}: {
  sources: Record<string, string>
  defaultTab?: "components" | "templates"
}) {
  return (
    <DesignSystemProvider defaultTab={defaultTab}>
      <SiteLayout
        anchors={[]}
        cta={null}
        footerGroups={{}}
        className="selection:bg-primary/20"
        constrainContent={false}
        footerMaxWidth="max-w-7xl"
      >
        <DesignSystemContent sources={sources} />
      </SiteLayout>
    </DesignSystemProvider>
  )
}
