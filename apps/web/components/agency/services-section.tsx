import Link from "next/link"
import {
  ArrowRightIcon,
  CloudIcon,
  CodeIcon,
  DeviceMobileIcon,
  UsersThreeIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Badge, Button } from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

import { IconTile } from "./icon-tile"
import { SectionHeading } from "./section-heading"

const SERVICES = [
  {
    icon: CodeIcon,
    title: "Custom Software Development",
    description:
      "End-to-end full-stack web and desktop applications built to your exact specifications. We own the full lifecycle — architecture, development, and delivery.",
    tags: ["Next.js", "Node.js", "Go", "PostgreSQL"],
  },
  {
    icon: DeviceMobileIcon,
    title: "Mobile App Engineering",
    description:
      "iOS, Android, and cross-platform mobile experiences. Native performance with Flutter and React Native, shipped with automated CI/CD pipelines.",
    tags: ["Flutter", "React Native", "Swift", "Kotlin"],
  },
  {
    icon: CloudIcon,
    title: "Cloud & DevOps Transformation",
    description:
      "AWS, GCP, and Azure migrations with zero-downtime deployment strategies, containerized microservices, and fully automated CI/CD infrastructure.",
    tags: ["AWS", "Kubernetes", "Terraform", "Docker"],
  },
  {
    icon: WrenchIcon,
    title: "Legacy Modernization",
    description:
      "Systematic refactoring of aging monoliths into clean, API-first architectures. Database migrations, service decomposition, and incremental delivery.",
    tags: ["Refactoring", "API Design", "DB Migration"],
  },
  {
    icon: UsersThreeIcon,
    title: "Dedicated Engineering Teams",
    description:
      "Fully embedded agile squads that integrate with your workflows, attend your standups, and ship as an extension of your in-house team.",
    tags: ["Agile", "Team Augmentation", "Sprint Planning"],
  },
]

/**
 * Hairline-rule grid instead of cards: each cell opens with a top border and
 * the row gap is carried entirely by the cells' own vertical padding, so the
 * section reads as an index of services rather than a tray of boxes. The one
 * cell that asks for something keeps a filled action.
 */
export function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Services"
          title="Everything you need to ship great software"
          description="From greenfield builds to enterprise transformations, our engineering practice covers every layer of the modern software stack."
        />
      </Reveal>

      <div className="reveal-stagger mt-10 grid gap-x-12 sm:grid-cols-2">
        {SERVICES.map((service) => (
          <Reveal key={service.title} className="border-t border-border py-7">
            <IconTile icon={service.icon} />
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              {service.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {service.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="secondary" size="sm" mono className="text-3xs">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}

        {/* The one cell that asks for something, so it leads the eye. */}
        <Reveal className="border-t border-border py-7">
          <Badge variant="default" mono className="uppercase tracking-wider">
            Free review
          </Badge>
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
            Architecture Review
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            Talk to a senior engineer. No pitch, no commitment — just a candid
            technical evaluation of your current architecture and roadmap.
          </p>
          <Button size="sm" className="mt-6 gap-2" render={<Link href="#contact" />}>
            Book 30-min Review
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
