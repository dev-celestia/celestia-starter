import * as React from "react"
import { getNucleiRunNavigation } from "@/lib/nuclei-run-docs"
import { DocsHeader } from "@/components/docs/header"
import { DocsSidebar } from "@/components/docs/sidebar"

export default function NucleiRunDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const groups = getNucleiRunNavigation("/nuclei-run")

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Translucent Glass Header */}
      <DocsHeader
        brandTitle="nuclei-run"
        badgeLabel="v0.1.0"
        badgeHref="https://github.com/dev-celestia/nuclei-run"
      />

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-6">
          {/* Sticky Left Sidebar (Desktop) */}
          <aside className="sticky top-20 hidden w-64 shrink-0 lg:flex lg:flex-col self-start h-[calc(100vh-5.5rem)] max-h-[calc(100vh-5.5rem)] overflow-hidden pr-2">
            <DocsSidebar groups={groups} />
          </aside>

          {/* Center Main Content & Right TOC */}
          <main className="flex-1 min-w-0 max-w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
