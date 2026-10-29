import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge, Button } from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

/**
 * Left-aligned hero in the rail layout. The headline starts on the same
 * edge as every section heading below it, so the page reads as one column
 * of work rather than a sequence of centered posters.
 */
export function AgencyHero() {
  return (
    <section id="hero" className="pt-12 pb-16 sm:pt-20 sm:pb-20">
      <Reveal>
        <Badge
          variant="outline"
          mono
          className="gap-2 border-primary/25 bg-primary/5 text-xs uppercase tracking-wider text-primary"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Enterprise Software Development
        </Badge>

        <h1 className="mt-8 max-w-[700px] text-[clamp(2.625rem,6vw,3.75rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-foreground">
          {/* Non-breaking hyphen: the compound must not split after the dash
              on narrow viewports. */}
          Enterprise&#x2011;grade software that scales with your business.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
          From concept to production, we deliver full-stack web and mobile
          solutions backed by rigorous engineering standards — on time, on
          budget, with the architecture built to last.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="gap-2"
            render={<Link href="#contact" />}
          >
            Book a Free Strategy Call
            <ArrowRightIcon className="size-4" aria-hidden />
          </Button>
          <Button variant="secondary" size="lg" render={<Link href="#services" />}>
            Explore Services
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
