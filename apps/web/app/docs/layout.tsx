import * as React from "react"
import { getDocsNavigation } from "@/lib/docs"
import { SiteLayout } from "@/components/shared/site-layout"
import { DocsSidebar } from "@/components/docs/sidebar"
import { DocsSearchTrigger } from "@/components/docs/docs-search-trigger"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const groups = getDocsNavigation()

  return (
    <SiteLayout
      anchors={[]}
      cta={null}
      footerGroups={{}}
      className="selection:bg-primary/20"
      constrainContent={false}
      footerMaxWidth="max-w-7xl"
    >
      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:px-8">
        <div className="flex justify-end pt-5">
          <DocsSearchTrigger />
        </div>

        <div className="flex gap-8 pb-6">
          {/* Sticky Left Sidebar (Desktop) */}
          <aside className="sticky top-6 hidden w-64 shrink-0 self-start overflow-hidden pe-2 lg:flex lg:flex-col lg:h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-3rem)]">
            <DocsSidebar groups={groups} />
          </aside>

          {/* Center Main Content & Right TOC */}
          <main className="min-w-0 max-w-full flex-1">{children}</main>
        </div>
      </div>
    </SiteLayout>
  )
}
