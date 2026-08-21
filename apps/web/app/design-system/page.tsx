"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  SparkleIcon,
  BookOpenIcon,
  CheckCircleIcon,
  PackageIcon,
  PaletteIcon,
  ShieldCheckIcon,
  TreeStructureIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CursorClickIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"
import { Button, Badge, SonnerToaster, ButtonGroup } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { Header } from "@/components/shared/header"
import { ThemeCustomizer } from "@/components/showcase/theme-customizer"
import { TokensViewer } from "@/components/design-system/tokens-viewer"
import { ExternalGuide } from "@/components/design-system/external-guide"
import { ComponentsSidebar, CATEGORIES } from "@/components/showcase/components-sidebar"
import { ButtonsSection } from "@/components/showcase/sections/buttons-section"
import { InputsSection } from "@/components/showcase/sections/inputs-section"
import { DataDisplaySection } from "@/components/showcase/sections/data-display-section"
import { FeedbackSection } from "@/components/showcase/sections/feedback-section"
import { NavigationSection } from "@/components/showcase/sections/navigation-section"
import { ChatAiSection } from "@/components/showcase/sections/chat-ai-section"
import { SurfacesSection } from "@/components/showcase/sections/surfaces-section"

type SectionTab = "components" | "tokens" | "guide" | "principles"

function DesignSystemContent() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as SectionTab) || "components"
  
  const [activeSection, setActiveSection] = React.useState<SectionTab>(
    ["components", "tokens", "guide", "principles"].includes(initialTab) ? initialTab : "components"
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("buttons")
  const [showBackToTop, setShowBackToTop] = React.useState(false)

  // Track window scroll for Back to Top button
  React.useEffect(() => {
    const handleWindowScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleWindowScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleWindowScroll)
  }, [])

  // Ensure clean scroll position at top on initial mount if no hash is present
  React.useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Sync tab with search param if changed externally
  React.useEffect(() => {
    const tab = searchParams.get("tab") as SectionTab
    if (tab && ["components", "tokens", "guide", "principles"].includes(tab)) {
      setActiveSection(tab)
    }
  }, [searchParams])

  // If user starts searching, automatically switch to components tab if in another tab
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (query.trim() && activeSection !== "components") {
      setActiveSection("components")
    }
  }

  // Search filtering logic for components
  const normalizedQuery = searchQuery.trim().toLowerCase()

  // Track active category on scroll when in components tab
  React.useEffect(() => {
    if (activeSection !== "components") return

    const handleScroll = () => {
      // If at or near top of the page, keep first category active
      if (window.scrollY < 350) {
        setActiveCategory("buttons")
        return
      }

      const categoryIds = CATEGORIES.map((c) => c.id)
      for (let i = categoryIds.length - 1; i >= 0; i--) {
        const id = categoryIds[i]
        if (!id) continue
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 180) {
            setActiveCategory(id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeSection])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SonnerToaster position="bottom-right" />

      {/* Navigation Header */}
      <Header
        brandTitle="Celestia"
        badgeLabel="Design System"
        badgeHref="/design-system"
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        searchPlaceholder="Search 110+ UI & AI components, tokens, guides..."
        totalComponents={110}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        {/* Hero Section */}
        <section className="relative flex flex-col items-start gap-5 border-b border-border/60 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-mono">
              <SparkleIcon className="size-3.5 text-primary" weight="fill" />
              @celestia-project/ui • v0.2.1
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              110+ Components (63 Base UI + 54 AI)
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground font-mono">
              Tailwind CSS v4 + OKLCH
            </Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Celestia Design System
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            An industry-grade, token-driven design system and component library engineered for high performance, accessibility,
            and multi-framework integration. Powered by unstyled <strong>Base UI</strong> primitives, 54 <strong>AI & agent development primitives</strong>, modern <strong>OKLCH color scales</strong>, and zero-runtime Tailwind CSS v4.
          </p>

          {/* Quick Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-1">
            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
              <ShieldCheckIcon className="size-5 text-primary shrink-0" weight="fill" />
              <div className="text-left">
                <div className="text-xs font-semibold text-foreground">WAI-ARIA 2.1 AA</div>
                <div className="text-[11px] text-muted-foreground">Accessible by default</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
              <PaletteIcon className="size-5 text-primary shrink-0" weight="fill" />
              <div className="text-left">
                <div className="text-xs font-semibold text-foreground">OKLCH Color Gamut</div>
                <div className="text-[11px] text-muted-foreground">Perceptual contrast</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
              <PackageIcon className="size-5 text-primary shrink-0" weight="fill" />
              <div className="text-left">
                <div className="text-xs font-semibold text-foreground">External Ready</div>
                <div className="text-[11px] text-muted-foreground">NPM & Monorepo use</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
              <TreeStructureIcon className="size-5 text-primary shrink-0" weight="fill" />
              <div className="text-left">
                <div className="text-xs font-semibold text-foreground">Zero Runtime CSS</div>
                <div className="text-[11px] text-muted-foreground">Tailwind v4 tokens</div>
              </div>
            </div>
          </div>

          {/* Theme & Palette Switcher Toolbar */}
          <div className="w-full pt-1">
            <ThemeCustomizer />
          </div>

          {/* Primary Tab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40 w-full">
            <ButtonGroup className="flex-wrap">
              <Button
                variant="outline"
                onClick={() => setActiveSection("components")}
                className={cn(
                  "gap-2 text-xs transition-colors hover:text-primary",
                  activeSection === "components" ? "text-primary font-medium" : "text-muted-foreground"
                )}
                data-state={activeSection === "components" ? "on" : "off"}
              >
                <CursorClickIcon className="size-4" />
                <span>1. Components Showcase (110+)</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveSection("tokens")}
                className={cn(
                  "gap-2 text-xs transition-colors hover:text-primary",
                  activeSection === "tokens" ? "text-primary font-medium" : "text-muted-foreground"
                )}
                data-state={activeSection === "tokens" ? "on" : "off"}
              >
                <PaletteIcon className="size-4" />
                <span>2. Design Tokens</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveSection("guide")}
                className={cn(
                  "gap-2 text-xs transition-colors hover:text-primary",
                  activeSection === "guide" ? "text-primary font-medium" : "text-muted-foreground"
                )}
                data-state={activeSection === "guide" ? "on" : "off"}
              >
                <PackageIcon className="size-4" />
                <span>3. External Usage Guide</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveSection("principles")}
                className={cn(
                  "gap-2 text-xs transition-colors hover:text-primary",
                  activeSection === "principles" ? "text-primary font-medium" : "text-muted-foreground"
                )}
                data-state={activeSection === "principles" ? "on" : "off"}
              >
                <ShieldCheckIcon className="size-4" />
                <span>4. Architecture & Principles</span>
              </Button>
            </ButtonGroup>

            <Link href="/docs/design-system" className="ml-auto hidden md:inline-flex">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary">
                <BookOpenIcon className="size-3.5" />
                <span>Documentation</span>
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Tab 1: Components Showcase */}
        {activeSection === "components" && (
          <div className="pt-8">
            {/* Mobile Category Navigation Pills */}
            <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-3 mb-4 lg:hidden scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id)
                    const el = document.getElementById(cat.id)
                    if (el) {
                      const yOffset = -90
                      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
                      window.scrollTo({ top: y, behavior: "smooth" })
                    }
                  }}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex gap-8">
              {/* Sticky Left Sidebar */}
              <ComponentsSidebar
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />

              {/* Main Showcase Feed */}
              <div className="flex-1 min-w-0 flex flex-col gap-10">
                {/* Search banner if searching */}
                {searchQuery && (
                  <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <MagnifyingGlassIcon className="size-4 text-primary" />
                      <span>
                        Filtering components matching: <strong className="text-foreground">"{searchQuery}"</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-primary underline hover:opacity-80"
                    >
                      Reset filter
                    </button>
                  </div>
                )}

                {/* Show sections based on search */}
                {(!normalizedQuery || "buttons button toggle ripple group".includes(normalizedQuery)) && (
                  <ButtonsSection />
                )}

                {(!normalizedQuery || "inputs input textarea checkbox radio switch slider select combobox otp field form url native-select".includes(normalizedQuery)) && (
                  <InputsSection />
                )}

                {(!normalizedQuery || "data display card article badge avatar table empty item marker kbd skeleton aspect ratio separator".includes(normalizedQuery)) && (
                  <DataDisplaySection />
                )}

                {(!normalizedQuery || "feedback alert dialog sheet drawer popover tooltip hover card progress spinner sonner toast".includes(normalizedQuery)) && (
                  <FeedbackSection />
                )}

                {(!normalizedQuery || "navigation tabs tab bar breadcrumb pagination accordion collapsible dropdown context menu menubar command".includes(normalizedQuery)) && (
                  <NavigationSection />
                )}

                {(!normalizedQuery || "chat ai message bubble attachment input prompt reasoning tool model plan task suggestion sources citation audio file-tree confirmation context scroller area".includes(normalizedQuery)) && (
                  <ChatAiSection />
                )}

                {(!normalizedQuery || "surfaces resizable scroll area carousel text code editor chart".includes(normalizedQuery)) && (
                  <SurfacesSection />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Design Tokens */}
        {activeSection === "tokens" && (
          <div className="pt-8 space-y-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Design Token System</h2>
              <p className="text-sm text-muted-foreground">
                The foundation of Celestia: atomic design variables for colors, typography, border radius, and elevation.
              </p>
            </div>
            <TokensViewer />
          </div>
        )}

        {/* Tab 3: External Usage Guide */}
        {activeSection === "guide" && (
          <div className="pt-8 space-y-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Using in External Projects</h2>
              <p className="text-sm text-muted-foreground">
                How to consume <code className="font-mono text-primary font-medium">@celestia-project/ui</code> and design tokens in external Next.js, Vite, Remix, or React repositories.
              </p>
            </div>
            <ExternalGuide />
          </div>
        )}

        {/* Tab 4: Architecture & Principles */}
        {activeSection === "principles" && (
          <div className="pt-8 space-y-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Architecture & Industry Standards</h2>
              <p className="text-sm text-muted-foreground">
                The design engineering standards powering the Celestia design system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="size-5 text-green-500" weight="fill" />
                  <h3 className="font-semibold text-foreground text-base">Unstyled Primitives (Base UI)</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rather than building from scratch, Celestia uses <strong>Base UI</strong> for complete keyboard navigation, screen reader accessibility (ARIA), focus trapping, and portal management without imposing opinionated inline styles.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="size-5 text-green-500" weight="fill" />
                  <h3 className="font-semibold text-foreground text-base">OKLCH Perceptual Color Space</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tokens are defined in OKLCH coordinates to guarantee mathematically uniform lightness and contrast ratios across both light and dark themes, preventing washed-out or illegible text states.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="size-5 text-green-500" weight="fill" />
                  <h3 className="font-semibold text-foreground text-base">Zero Runtime Styling Overhead</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Powered by Tailwind CSS v4, styling utilizes standard CSS custom properties (<code className="font-mono text-xs text-primary">var(--primary)</code>) mapped at compile time. No runtime CSS-in-JS style injection or hydration bottlenecks.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="size-5 text-green-500" weight="fill" />
                  <h3 className="font-semibold text-foreground text-base">Independent Package Distribution</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Packaged as an isolated workspace under <code className="font-mono text-xs text-primary">packages/ui</code> with strict peer dependencies (<code className="font-mono text-xs text-primary">react@^19</code>) and tree-shakeable ESM bundle exports.
                </p>
              </div>
            </div>

            {/* Documentation CTA */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground text-base">Read Detailed Technical Documentation</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Comprehensive component APIs, props tables, sub-component hierarchies, and setup recipes.
                </p>
              </div>
              <Link href="/docs/design-system">
                <Button variant="default" size="sm" className="gap-2">
                  <BookOpenIcon className="size-4" />
                  <span>View Docs</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-md transition-all hover:border-primary/50 hover:bg-muted hover:text-primary hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-3 duration-200 cursor-pointer"
        >
          <ArrowUpIcon className="size-3.5 text-primary" weight="bold" />
          <span className="hidden sm:inline">Back to top</span>
        </button>
      )}
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DesignSystemContent />
    </React.Suspense>
  )
}
