import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge, Button } from "@celestia-project/ui"

import { CopyCommand } from "./copy-command"
import { Reveal } from "./reveal"

/**
 * Left-aligned hero in the shared rail layout — the same shape as the
 * landing's hero: eyebrow badge, headline starting on the content column's
 * left edge, lede, then actions. The install command rides below the
 * buttons because it is the page's real entry point.
 */
export function HeroSection() {
  return (
    <section id="hero" className="pt-12 pb-16 sm:pt-20 sm:pb-20">
      <Reveal>
        <Badge
          variant="outline"
          mono
          className="gap-2 border-primary/25 bg-primary/5 text-xs uppercase tracking-wider text-primary"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Open-source starter
        </Badge>

        <h1 className="mt-8 max-w-[700px] text-[clamp(2.625rem,6vw,3.75rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-foreground">
          The production stack, installed in one command.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
          Building user interfaces should not restart every project. Celestia is
          a full-stack monorepo starter with a real architecture: a Next.js 16
          frontend that stays pure UI, a Hono backend that owns auth and data,
          and a feature installer so you only carry what you use.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button className="gap-2" render={<Link href="/sign-up" />}>
            Demo Template
            <ArrowRightIcon className="size-4" aria-hidden />
          </Button>
          <Button variant="secondary" render={<Link href="/docs" />}>
            Documentation
          </Button>
        </div>

        <div className="mt-6 max-w-md">
          <CopyCommand />
        </div>
      </Reveal>
    </section>
  )
}
