import * as React from "react"
import Link from "next/link"
import { BookOpenIcon, CheckCircleIcon } from "@phosphor-icons/react"
import { Button } from "@celestia-project/ui"

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
  )
}
