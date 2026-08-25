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
import { Button, Badge, Card, CardContent, Tabs, TabsList, TabsTrigger } from "@celestia-project/ui"
import { ThemeCustomizer } from "@/components/showcase/theme-customizer"
import { useDesignSystem } from "./hooks/use-design-system"

const PILLARS = [
  {
    icon: ShieldCheckIcon,
    title: "WAI-ARIA 2.1 AA",
    description: "Accessible by default",
  },
  {
    icon: PaletteIcon,
    title: "OKLCH Color Gamut",
    description: "Perceptual contrast",
  },
  {
    icon: PackageIcon,
    title: "External Ready",
    description: "NPM & Monorepo use",
  },
  {
    icon: TreeStructureIcon,
    title: "Zero Runtime CSS",
    description: "Tailwind v4 tokens",
  },
]

export function HeroSection() {
  const { activeSection, setActiveSection } = useDesignSystem()

  return (
    <>
      <section className="relative flex flex-col items-start gap-5 py-10 sm:py-14">
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

        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          An industry-grade, token-driven design system and component library engineered for high performance, accessibility,
          and multi-framework integration. Powered by unstyled <strong>Base UI</strong> primitives, 54 <strong>AI & agent development primitives</strong>, modern <strong>OKLCH color scales</strong>, and zero-runtime Tailwind CSS v4.
        </p>

        {/* Quick Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-1">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <Card key={pillar.title} className="p-3 shadow-xs">
                <CardContent className="p-0 flex items-center gap-2.5">
                  <Icon className="size-5 text-primary shrink-0" weight="fill" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-foreground">{pillar.title}</div>
                    <div className="text-[11px] text-muted-foreground">{pillar.description}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Sticky Controls & Tab Navigation Toolbar */}
      <div className="sticky top-14 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border/60 bg-background/90 backdrop-blur-xl py-3 shadow-xs space-y-2.5">
        <div className="mx-auto max-w-7xl">
          <ThemeCustomizer />
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Tabs
            value={activeSection}
            onValueChange={(val) =>
              setActiveSection(
                val as "components" | "tokens" | "guide" | "principles"
              )
            }
          >
            <TabsList className="flex-wrap h-auto p-1 gap-1">
              <TabsTrigger value="components" className="gap-2 text-xs">
                <CursorClickIcon className="size-4" />
                <span>1. Components Showcase (110+)</span>
              </TabsTrigger>
              <TabsTrigger value="tokens" className="gap-2 text-xs">
                <PaletteIcon className="size-4" />
                <span>2. Design Tokens</span>
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-2 text-xs">
                <PackageIcon className="size-4" />
                <span>3. External Usage Guide</span>
              </TabsTrigger>
              <TabsTrigger value="principles" className="gap-2 text-xs">
                <ShieldCheckIcon className="size-4" />
                <span>4. Architecture & Principles</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Link href="/docs/design-system" className="ml-auto hidden md:inline-flex">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary">
              <BookOpenIcon className="size-3.5" />
              <span>Documentation</span>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
