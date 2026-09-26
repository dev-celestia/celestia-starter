import Link from "next/link"
import {
  ArrowsClockwiseIcon,
  BugIcon,
  HeadsetIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Button } from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

import { IconTile } from "./icon-tile"
import { SectionHeading } from "./section-heading"

/**
 * Copy tightened for the two-up grid: at ~430px per column the descriptions
 * hold three lines at most, which keeps the five steps scannable as a list.
 */
const STEPS = [
  {
    number: "01",
    icon: MagnifyingGlassIcon,
    title: "Discovery & Architecture",
    description:
      "Stakeholder workshops, requirements mapping, system design, and a technical blueprint before a line of code is written.",
  },
  {
    number: "02",
    icon: ArrowsClockwiseIcon,
    title: "Agile Development",
    description:
      "Two-week sprints with demo check-ins and a living backlog you own. Scope can evolve without the chaos.",
  },
  {
    number: "03",
    icon: BugIcon,
    title: "Quality Assurance",
    description:
      "Automated unit, integration, and E2E coverage. Security, performance, and accessibility gates on every release.",
  },
  {
    number: "04",
    icon: RocketLaunchIcon,
    title: "Deployment & DevOps",
    description:
      "Infrastructure as code, blue/green releases, and runbooks handed over so your team is never in the dark.",
  },
  {
    number: "05",
    icon: HeadsetIcon,
    title: "Maintenance & Support",
    description:
      "SLA-backed monitoring, incident response, dependency upgrades, and a direct channel to your engineering lead.",
  },
]

/**
 * Same hairline-rule grid as the services section — one structural idiom for
 * "a list of comparable things" across the page. Step numbers ride the cell's
 * top row in mono; a sixth cell closes the grid with the section's ask.
 */
export function ProcessSection() {
  return (
    <section id="process" className="py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="How we work"
          title="A process built on transparency"
          description="Every engagement follows a repeatable playbook refined across 120+ projects — so you always know what happens next."
        />
      </Reveal>

      <div className="reveal-stagger mt-10 grid gap-x-12 sm:grid-cols-2">
        {STEPS.map((step) => (
          <Reveal key={step.number} className="border-t border-border py-7">
            <div className="flex items-center justify-between">
              <IconTile icon={step.icon} />
              <span className="font-mono text-xs text-muted-foreground" aria-hidden>
                {step.number}
              </span>
            </div>
            <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </Reveal>
        ))}

        <Reveal className="border-t border-border py-7">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Ready when you are
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Step 01 starts with a conversation, not a contract. Bring your
            roadmap — we&apos;ll bring the blueprint.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-6 gap-2"
            render={<Link href="#contact" />}
          >
            Book a Free Strategy Call
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
