import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge, Button } from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

/**
 * Credibility strip under the fold-line. An agency landing page asks for a
 * meeting before it has shown a single number; these four are the shortest
 * honest version of "we have done this before", and they agree with the
 * figures quoted in the process and case-study sections.
 */
const STATS = [
  { value: "120+", label: "Projects delivered" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "12 yrs", label: "Avg. engineer experience" },
  { value: "4.9/5", label: "Average client rating" },
]

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
          From concept to production, we deliver full-stack web, mobile, and
          cloud solutions backed by rigorous engineering standards — on time,
          on budget, with the architecture built to last.
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

        <ul className="mt-16 flex max-w-3xl flex-wrap items-start gap-x-10 gap-y-6 border-t border-border pt-8">
          {STATS.map((stat) => (
            <li key={stat.label} className="flex flex-col gap-0.5">
              <span className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
