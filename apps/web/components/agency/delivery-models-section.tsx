import {
  UsersThreeIcon,
  ClockCountdownIcon,
  SealCheckIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr"
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

const MODELS = [
  {
    icon: UsersThreeIcon,
    title: "Dedicated Squads",
    idealFor: "Long-term roadmap execution",
    benefit: "Full integration with your internal workflows, daily standups, shared tooling.",
    highlights: ["Monthly retainer", "Embedded agile team", "Dedicated Slack channel"],
    featured: false,
  },
  {
    icon: ClockCountdownIcon,
    title: "Time & Materials",
    idealFor: "Iterative & evolving scope",
    benefit: "Pay only for hours logged. Scope evolves sprint-by-sprint with full visibility.",
    highlights: ["Weekly billing", "Flexible backlog", "Real-time burndown"],
    featured: true,
  },
  {
    icon: SealCheckIcon,
    title: "Fixed Price",
    idealFor: "Well-defined MVP / scoped projects",
    benefit: "Strict budget and deadline predictability with milestone-gated payments.",
    highlights: ["Milestone payments", "Locked specification", "Risk absorbed by us"],
    featured: false,
  },
]

export function DeliveryModelsSection() {
  return (
    <section id="about" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" mono className="mb-3 uppercase tracking-wider text-xs">
            Engagement Models
          </Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            Work the way that fits your project
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
            Every project is different. We offer three engagement structures so
            the commercial model always matches how you build.
          </p>
        </div>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {MODELS.map((model) => (
          <Reveal key={model.title}>
            <Card
              className={`h-full justify-between transition-all duration-200 ${
                model.featured
                  ? "ring-2 ring-primary/40 bg-primary/5 shadow-md shadow-primary/5"
                  : "hover:ring-foreground/20"
              }`}
            >
              <CardHeader className="gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <model.icon className="size-6" weight="duotone" />
                  </div>
                  {model.featured && (
                    <Badge variant="default" mono size="sm" className="uppercase tracking-wider">
                      Most popular
                    </Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {model.title}
                  </CardTitle>
                  <p className="mt-1 text-xs font-mono text-primary uppercase tracking-wider">
                    Ideal for: {model.idealFor}
                  </p>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {model.benefit}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <ul className="flex w-full flex-col gap-2.5">
                  {model.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckIcon className="size-3.5 shrink-0 text-primary" weight="bold" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </CardFooter>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
