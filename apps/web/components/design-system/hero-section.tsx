"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpenIcon,
  PackageIcon,
  PaletteIcon,
  ShieldCheckIcon,
  TreeStructureIcon,
  ArrowRightIcon,
  CursorClickIcon,
} from "@phosphor-icons/react"
import { Button, Badge, ButtonGroup } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { ThemeCustomizer } from "@/components/showcase/theme-customizer"
import { useDesignSystem } from "./hooks/use-design-system"

export function HeroSection() {
  const { activeSection, setActiveSection } = useDesignSystem()

  return (
    <section className="relative flex flex-col items-start gap-5 border-b border-border/60 py-10 sm:py-14">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono text-xs">
          110+ Components (63 Base UI + 54 AI)
        </Badge>
        <Badge variant="outline" className="text-xs text-muted-foreground font-mono">
          Tailwind CSS v4 + OKLCH
        </Badge>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
        Celestia Design System
      </h1>

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-md">
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
  )
}
