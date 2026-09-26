import {
  CheckIcon,
  ClockCountdownIcon,
  SealCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"
import {
  Badge,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

import { Reveal } from "@/components/feature-installer/reveal"

import { IconTile } from "./icon-tile"
import { SectionHeading } from "./section-heading"

const MODELS = [
  {
    icon: UsersThreeIcon,
    title: "Dedicated Squads",
    idealFor: "Long-term roadmap execution",
    benefit:
      "Full integration with your internal workflows, daily standups, shared tooling.",
    highlights: ["Monthly retainer", "Embedded agile team", "Dedicated Slack channel"],
    featured: false,
  },
  {
    icon: ClockCountdownIcon,
    title: "Time & Materials",
    idealFor: "Iterative & evolving scope",
    benefit:
      "Pay only for hours logged. Scope evolves sprint-by-sprint with full visibility.",
    highlights: ["Weekly billing", "Flexible backlog", "Real-time burndown"],
    featured: true,
  },
  {
    icon: SealCheckIcon,
    title: "Fixed Price",
    idealFor: "Well-defined MVP / scoped projects",
    benefit:
      "Strict budget and deadline predictability with milestone-gated payments.",
    highlights: ["Milestone payments", "Locked specification", "Risk absorbed by us"],
    featured: false,
  },
]

export function DeliveryModelsSection() {
  return (
    <section id="engagement-models" className="py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Engagement models"
          title="Work the way that fits your project"
          description="Every project is different. We offer three engagement structures so the commercial model always matches how you build."
        />
      </Reveal>

      <div className="reveal-stagger mt-16 grid gap-6 lg:grid-cols-3">
        {MODELS.map((model) => (
          <Reveal key={model.title}>
            <Card
              className={cn(
                "h-full justify-between transition-colors duration-normal",
                model.featured
                  ? "bg-primary/5 ring-2 ring-primary/40"
                  : "hover:ring-foreground/20",
              )}
            >
              <CardHeader className="gap-4">
                <div className="flex items-center justify-between">
                  <IconTile icon={model.icon} size="lg" />
                  {model.featured ? (
                    <Badge variant="default" mono className="uppercase tracking-wider">
                      Most popular
                    </Badge>
                  ) : null}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {model.title}
                  </CardTitle>
                  <p className="mt-1 font-mono text-2xs uppercase tracking-wider text-muted-foreground">
                    Ideal for: {model.idealFor}
                  </p>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {model.benefit}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <ItemGroup className="w-full gap-2.5">
                  {model.highlights.map((highlight) => (
                    <Item
                      key={highlight}
                      role="listitem"
                      size="xs"
                      className="p-0"
                    >
                      <ItemMedia variant="icon" className="text-primary">
                        <CheckIcon className="size-3.5" weight="bold" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="line-clamp-none font-normal text-muted-foreground">
                          {highlight}
                        </ItemTitle>
                      </ItemContent>
                    </Item>
                  ))}
                </ItemGroup>
              </CardFooter>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
