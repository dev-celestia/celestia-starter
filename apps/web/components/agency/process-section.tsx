import {
  ArrowsClockwiseIcon,
  BugIcon,
  HeadsetIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react/dist/ssr"
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

import { IconTile } from "./icon-tile"
import { SectionHeading } from "./section-heading"

/**
 * Copy tightened for the five-up grid: at `lg` each column is ~180px wide, and
 * the previous three-line descriptions turned every card into a wall of text.
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

export function ProcessSection() {
  return (
    <section id="process" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="How we work"
          title="A process built on transparency"
          description="Every engagement follows a repeatable playbook refined across 120+ projects — so you always know what happens next."
        />
      </Reveal>

      <div className="reveal-stagger mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step) => (
          <Reveal key={step.number}>
            <Card className="h-full transition-colors duration-normal hover:ring-foreground/20">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  <IconTile icon={step.icon} />
                  <Badge variant="outline" mono size="sm">
                    {step.number}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold leading-snug text-foreground">
                  {step.title}
                </CardTitle>
                <CardDescription className="text-xs/relaxed">
                  {step.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
