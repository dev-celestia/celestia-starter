import * as React from "react"
import { getDocsNavigation } from "@/lib/docs"
import { DocsHeader } from "@/components/docs/header"
import { DocsSidebar } from "@/components/docs/sidebar"
import { Sheet, SheetContent, SheetTitle } from "@celestia-project/ui"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const groups = getDocsNavigation()

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Translucent Glass Header */}
      <DocsHeader />

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex gap-8 py-6">
          {/* Sticky Left Sidebar (Desktop) */}
          <aside className="sticky top-20 hidden w-64 shrink-0 lg:flex lg:flex-col self-start h-[calc(100vh-5.5rem)] max-h-[calc(100vh-5.5rem)] overflow-hidden pe-2">
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
