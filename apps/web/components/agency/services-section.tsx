import Link from "next/link"
import {
  ArrowRightIcon,
  CloudIcon,
  CodeIcon,
  DeviceMobileIcon,
  UsersThreeIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr"
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui"

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

export function ServicesSection() {
  return (
    <section id="services" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="Services"
          title="Everything you need to ship great software"
          description="From greenfield builds to enterprise transformations, our engineering practice covers every layer of the modern software stack."
        />
      </Reveal>

      <div className="reveal-stagger mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <Reveal key={service.title}>
            <Card className="h-full justify-between transition-colors duration-normal hover:ring-foreground/20">
              <CardHeader className="gap-3">
                <IconTile icon={service.icon} />
                <CardTitle className="text-base font-semibold text-foreground">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex-wrap gap-1.5 pt-2">
                {service.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm" mono className="text-3xs">
                    {tag}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          </Reveal>
        ))}

        {/* The one card that asks for something, so it leads the eye. */}
        <Reveal>
          <Card className="h-full justify-between bg-primary/5 ring-primary/20 sm:col-span-2 lg:col-span-1">
            <CardHeader className="gap-3">
              <Badge variant="default" mono className="w-fit uppercase tracking-wider">
                Free review
              </Badge>
              <CardTitle className="text-base font-semibold text-foreground">
                Architecture Review
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Talk to a senior engineer. No pitch, no commitment — just a
                candid technical evaluation of your current architecture and
                roadmap.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button size="sm" className="w-full gap-2" render={<Link href="#contact" />}>
                Book 30-min Review
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
