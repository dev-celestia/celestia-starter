"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { Input } from "@celestia-project/ui"
import { useDesignSystem } from "./hooks/use-design-system"

export function HeroSection() {
  const { searchQuery, setSearchQuery } = useDesignSystem()

  return (
    <>
      <section className="relative flex flex-col items-start gap-3 py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          Web Components
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          A production-grade, accessible UI foundation and component library engineered for modern web applications.
          Combining unstyled Base UI primitives with compile-time Tailwind CSS v4 tokens in the OKLCH color space for zero-runtime styling and seamless theme consistency.
        </p>
      </section>

      {/* Sticky search — top-0: the site rail replaced the old fixed navbar,
          so there is no bar to offset. */}
      <div className="border-border/60 bg-background/90 sticky top-0 z-30 -mx-5 px-5 py-3 shadow-xs backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl justify-end">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon
              className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type="search"
              placeholder="Search components…"
              className="h-9 ps-8 text-xs"
            />
          </div>
        </div>
      </div>
    </>
  )
}
