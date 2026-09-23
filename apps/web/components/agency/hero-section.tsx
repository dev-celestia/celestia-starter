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

export function AgencyHero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background pt-16"
    >
      {/* Decorative wash. Purely ornamental, so it is hidden from AT. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="size-[640px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 py-20 text-center sm:px-8">
        <Reveal>
          <div className="flex justify-center">
            <Badge
              variant="outline"
              mono
              className="gap-2 border-primary/25 bg-primary/5 text-xs uppercase tracking-wider text-primary"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Enterprise Software Development
            </Badge>
          </div>

          <h1 className="mt-8 text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance text-foreground">
            We Build Enterprise-Grade{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Software
            </span>{" "}
            That Scales With Your Business
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            From concept to production, we deliver full-stack web, mobile, and
            cloud solutions backed by rigorous engineering standards — on time,
            on budget, with the architecture built to last.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-full gap-2 shadow-md shadow-primary/10 sm:w-auto"
              render={<Link href="#contact" />}
            >
              Schedule Free Tech Strategy Call
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              render={<Link href="#services" />}
            >
              Explore Services
            </Button>
          </div>

          <ul className="mx-auto mt-16 flex max-w-3xl flex-wrap items-start justify-center gap-x-10 gap-y-6 border-t border-border/60 pt-8">
            {STATS.map((stat) => (
              <li key={stat.label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
