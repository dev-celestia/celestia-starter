"use client"

import {
  MagnifyingGlassIcon,
  PackageIcon,
  PaletteIcon,
  ShieldCheckIcon,
  CursorClickIcon,
} from "@phosphor-icons/react"
import { Input, Tabs, TabsList, TabsTrigger } from "@celestia-project/ui"
import { useDesignSystem } from "./hooks/use-design-system"

export function HeroSection() {
  const { activeSection, setActiveSection, searchQuery, handleSearchChange } =
    useDesignSystem()

  return (
    <>
      <section className="relative flex flex-col items-start gap-5 py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          Design System
        </h1>
      </section>

      {/* Sticky Controls & Tab Navigation Toolbar — top-0: the site rail
          replaced the old fixed navbar, so there is no bar to offset. */}
      <div className="border-border/60 bg-background/90 sticky top-0 z-30 -mx-5 px-5 py-3 shadow-xs backdrop-blur-xl sm:-mx-8 sm:px-8 space-y-2.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Tabs
            value={activeSection}
            onValueChange={(val) =>
              setActiveSection(
                val as "components" | "tokens" | "guide" | "principles"
              )
            }
            className="min-w-0 max-w-full flex-1 overflow-hidden"
          >
            <div className="w-full max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
              <TabsList className="inline-flex w-max flex-nowrap h-9 p-1 gap-1">
                <TabsTrigger value="components" className="gap-2 text-xs shrink-0 whitespace-nowrap">
                  <CursorClickIcon className="size-4 shrink-0" />
                  <span>1. Components Showcase</span>
                </TabsTrigger>
                <TabsTrigger value="tokens" className="gap-2 text-xs shrink-0 whitespace-nowrap">
                  <PaletteIcon className="size-4 shrink-0" />
                  <span>2. Design Tokens</span>
                </TabsTrigger>
                <TabsTrigger value="guide" className="gap-2 text-xs shrink-0 whitespace-nowrap">
                  <PackageIcon className="size-4 shrink-0" />
                  <span>3. External Usage Guide</span>
                </TabsTrigger>
                <TabsTrigger value="principles" className="gap-2 text-xs shrink-0 whitespace-nowrap">
                  <ShieldCheckIcon className="size-4 shrink-0" />
                  <span>4. Architecture & Principles</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {/* Live search — relocated here from the old top navbar. */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon
              className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              type="search"
              placeholder="Search components, tokens…"
              className="h-9 ps-8 text-xs"
            />
          </div>
        </div>
      </div>
    </>
  )
}
