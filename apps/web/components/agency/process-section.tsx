import {
  MagnifyingGlassIcon,
  ArrowsClockwiseIcon,
  BugIcon,
  RocketLaunchIcon,
  HeadsetIcon,
} from "@phosphor-icons/react/dist/ssr"
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

const STEPS = [
  {
    number: "01",
    icon: MagnifyingGlassIcon,
    title: "Discovery & Architecture",
    description:
      "We immerse in your domain: stakeholder workshops, requirements mapping, system design, and a detailed technical blueprint before a single line of code is written.",
  },
  {
    number: "02",
    icon: ArrowsClockwiseIcon,
    title: "Agile Development",
    description:
      "Two-week sprints with demo check-ins, continuous integration, and a living backlog you own. Scope can evolve — our process absorbs change without chaos.",
  },
  {
    number: "03",
    icon: BugIcon,
    title: "Quality Assurance",
    description:
      "Automated unit, integration, and E2E test coverage. Security audits, performance profiling, and accessibility review built into every release gate.",
  },
  {
    number: "04",
    icon: RocketLaunchIcon,
    title: "Deployment & DevOps",
    description:
      "Infrastructure-as-code provisioning, blue/green deployments, and zero-downtime releases. We hand over runbooks so your team is never left in the dark.",
  },
  {
    number: "05",
    icon: HeadsetIcon,
    title: "Maintenance & Support",
    description:
      "SLA-backed monitoring, incident response, dependency upgrades, and a dedicated channel to your engineering lead — long after go-live.",
  },
]

export function ProcessSection() {
  return (
    <section id="process" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" mono className="mb-3 uppercase tracking-wider text-xs">
            How We Work
          </Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            A process built on transparency
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
            Every engagement follows a repeatable playbook refined across 120+ projects —
            so you always know what happens next.
          </p>
        </div>
      </Reveal>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step) => (
          <Reveal key={step.number}>
            <Card className="h-full transition-all duration-200 hover:ring-foreground/20">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <step.icon className="size-5" weight="duotone" />
                  </div>
                  <Badge variant="outline" mono size="sm" className="font-bold">
                    {step.number}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold text-foreground leading-snug">
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
