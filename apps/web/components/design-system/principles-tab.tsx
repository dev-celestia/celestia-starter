"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpenIcon, CheckCircleIcon } from "@phosphor-icons/react"
import { Button, Card, CardHeader, CardTitle, CardContent } from "@celestia-project/ui"

const PRINCIPLES = [
  {
    title: "Unstyled Primitives (Base UI)",
    description:
      "Rather than building from scratch, Celestia uses Base UI for complete keyboard navigation, screen reader accessibility (ARIA), focus trapping, and portal management without imposing opinionated inline styles.",
  },
  {
    title: "OKLCH Perceptual Color Space",
    description:
      "Tokens are defined in OKLCH coordinates to guarantee mathematically uniform lightness and contrast ratios across both light and dark themes, preventing washed-out or illegible text states.",
  },
  {
    title: "Zero Runtime Styling Overhead",
    description:
      "Powered by Tailwind CSS v4, styling utilizes standard CSS custom properties (var(--primary)) mapped at compile time. No runtime CSS-in-JS style injection or hydration bottlenecks.",
  },
  {
    title: "Independent Package Distribution",
    description:
      "Packaged as an isolated workspace under packages/ui with strict peer dependencies (react@^19) and tree-shakeable ESM bundle exports.",
  },
]

export function PrinciplesTab() {
  return (
    <div className="pt-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Architecture & Industry Standards</h2>
        <p className="text-sm text-muted-foreground">
          The design engineering standards powering the Celestia design system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRINCIPLES.map((item) => (
          <Card key={item.title}>
            <CardHeader className="gap-2">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="size-5 text-green-500 shrink-0" weight="fill" />
                <CardTitle className="text-base">{item.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documentation CTA */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div className="space-y-1">
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
        </CardContent>
      </Card>
    </div>
  )
}
