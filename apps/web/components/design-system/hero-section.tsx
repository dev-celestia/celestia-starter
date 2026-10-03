"use client"

import { BrowsersIcon, CursorClickIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { Badge, Input, Tabs, TabsList, TabsTrigger } from "@celestia-project/ui"
import { useDesignSystem } from "./hooks/use-design-system"

export function HeroSection() {
  const { searchQuery, setSearchQuery, activeTab, setActiveTab } = useDesignSystem()

  return (
    <>
      <section className="relative flex flex-col items-start gap-3 py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          {activeTab === "components" ? "Web Components" : "Layout Templates"}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {activeTab === "components"
            ? "A production-grade, accessible UI foundation and component library engineered for modern web applications. Combining unstyled Base UI primitives with compile-time Tailwind CSS v4 tokens in the OKLCH color space for zero-runtime styling and seamless theme consistency."
            : "36 copy-ready page templates and composite shells wired to the design system — auth screens, app pages, marketing frames, and system states. Preview any screen, copy its source, paste it into your app, and make it yours."}
        </p>
      </section>

      {/* Sticky navigation & search toolbar */}
      <div className="border-border/60 bg-background/90 sticky top-0 z-30 -mx-5 px-5 py-3 shadow-xs backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "components" | "templates")}
            className="min-w-0"
          >
            <TabsList className="inline-flex h-9 p-1 gap-1">
              <TabsTrigger value="components" className="gap-2 text-xs">
                <CursorClickIcon className="size-4 shrink-0" />
                <span>Web Components</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 font-mono">
                  79+
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2 text-xs">
                <BrowsersIcon className="size-4 shrink-0" />
                <span>Layout Templates</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 font-mono">
                  36
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon
              className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type="search"
              placeholder={activeTab === "components" ? "Search components…" : "Search templates…"}
              className="h-9 ps-8 text-xs"
            />
          </div>
        </div>
      </div>
    </>
  )
}
