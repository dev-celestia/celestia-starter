import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge, Button } from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

export function AgencyHero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background pt-16"
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="size-[640px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          {/* Eyebrow badge */}
          <div className="flex justify-center">
            <Badge
              variant="outline"
              size="default"
              mono
              className="gap-2 px-3 py-1 text-xs text-primary border-primary/25 bg-primary/5 uppercase tracking-wider"
            >
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Enterprise Software Development
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance text-foreground">
            We Build Enterprise-Grade{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Software
            </span>{" "}
            That Scales With Your Business
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg text-pretty">
            From concept to production, we deliver full-stack web, mobile, and cloud
            solutions backed by rigorous engineering standards — on time, on budget,
            with the architecture built to last.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#contact">
              <Button size="lg" className="gap-2 cursor-pointer shadow-md shadow-primary/10 active:scale-[0.98] transition-transform">
                Schedule Free Tech Strategy Call
                <ArrowRightIcon className="size-4" />
              </Button>
            </Link>
            <Link href="#services">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 cursor-pointer active:scale-[0.98] transition-transform"
              >
                Explore Services
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
