"use client"

import { QuotesIcon } from "@phosphor-icons/react"
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

import { SectionHeading } from "./section-heading"

const CASE_STUDIES = [
  {
    client: "FinBridge",
    industry: "Fintech",
    challenge:
      "A legacy monolith processing $2M/day in transactions was hitting reliability walls — 12-hour deployments, 4 outages/month, and a team afraid to ship.",
    solution:
      "Decomposed the monolith into 8 independently deployable services, introduced a zero-downtime blue/green pipeline, and migrated 3TB of data with no downtime.",
    metrics: [
      { label: "Deployment time", before: "12 hrs", after: "8 min" },
      { label: "Monthly outages", before: "4", after: "0" },
      { label: "Team velocity", before: "baseline", after: "+320%" },
    ],
    tag: "Legacy Modernization",
  },
  {
    client: "MediCore",
    industry: "Healthcare SaaS",
    challenge:
      "A HIPAA-regulated EHR startup needed to go from wireframes to a HIPAA-compliant production platform in under 6 months with a limited budget.",
    solution:
      "Built a full-stack Next.js + Hono platform with role-based access control, end-to-end encryption, audit logging, and automated BAA-compliant infrastructure.",
    metrics: [
      { label: "Time to launch", before: "—", after: "18 weeks" },
      { label: "HIPAA controls", before: "0%", after: "100%" },
      { label: "Initial users", before: "—", after: "2,400" },
    ],
    tag: "Custom Software",
  },
  {
    client: "NexaCloud",
    industry: "Enterprise SaaS",
    challenge:
      "A B2B analytics platform struggled to scale past 50k concurrent users with their existing monolithic Node.js architecture and single Postgres instance.",
    solution:
      "Migrated to a Kubernetes-orchestrated microservices architecture with read replicas, Redis caching layers, and a CDN-backed frontend. Introduced observability with OpenTelemetry.",
    metrics: [
      { label: "Concurrent users", before: "50k", after: "1M+" },
      { label: "Uptime", before: "98.1%", after: "99.99%" },
      { label: "P99 latency", before: "2.8s", after: "120ms" },
    ],
    tag: "Cloud & DevOps",
  },
]

const REVIEWS = [
  {
    quote:
      "Celestia's team felt like they'd been on our payroll for years. They spotted architectural risks we hadn't even raised, and delivered two weeks ahead of schedule.",
    author: "Sarah Kim",
    title: "CTO, FinBridge",
  },
  {
    quote:
      "Going from wireframes to HIPAA-compliant production in 18 weeks with a 4-person squad was something I thought was impossible. They proved me wrong.",
    author: "Dr. James Okafor",
    title: "Founder & CEO, MediCore",
  },
  {
    quote:
      "The performance work they did on our platform literally unlocked a new enterprise tier we couldn't sell before. 99.99% uptime wasn't a marketing claim — it's what we now contractually guarantee customers.",
    author: "Priya Mehta",
    title: "VP Engineering, NexaCloud",
  },
]

/** "Dr. James Okafor" -> "JO"; "Priya Mehta" -> "PM". */
function initials(name: string): string {
  return name
    .replace(/^(dr|mr|ms|mrs)\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export function CaseStudiesSection() {
  return (
    <section id="case-studies" className="py-16 sm:py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Case studies"
          title="Results that speak for themselves"
          description="Real challenges, real solutions, measurable outcomes."
        />
      </Reveal>

      <div className="reveal-stagger mt-16 grid gap-6 lg:grid-cols-3">
        {CASE_STUDIES.map((study) => (
          <Reveal key={study.client}>
            <Card className="h-full justify-between transition-colors duration-normal hover:ring-foreground/20">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {study.client}
                    </CardTitle>
                    <p className="text-2xs text-muted-foreground">{study.industry}</p>
                  </div>
                  <Badge variant="outline" mono className="text-3xs">
                    {study.tag}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                <div>
                  <p className="mb-1 font-mono text-3xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Challenge
                  </p>
                  <CardDescription className="text-sm leading-relaxed">
                    {study.challenge}
                  </CardDescription>
                </div>
                <div>
                  <p className="mb-1 font-mono text-3xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Solution
                  </p>
                  <CardDescription className="text-sm leading-relaxed">
                    {study.solution}
                  </CardDescription>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/60 pt-4">
                <dl className="grid w-full grid-cols-3 gap-3">
                  {study.metrics.map((metric) => (
                    <div key={metric.label} className="flex flex-col gap-0.5 text-center">
                      <dt className="font-mono text-3xs text-muted-foreground">
                        {metric.label}
                      </dt>
                      <dd className="text-2xs text-muted-foreground line-through">
                        {metric.before}
                      </dd>
                      <dd className="text-sm font-semibold text-primary">
                        {metric.after}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardFooter>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Carousel
          opts={{ loop: true }}
          aria-label="Client testimonials"
          className="mx-auto mt-20 max-w-3xl"
        >
          <CarouselContent>
            {REVIEWS.map((review) => (
              <CarouselItem key={review.author}>
                <Card className="items-center py-10">
                  <CardContent className="flex flex-col items-center gap-6 px-6 sm:px-10">
                    <QuotesIcon className="size-8 text-primary/40" weight="fill" />
                    <blockquote className="text-balance text-center text-lg leading-relaxed text-foreground sm:text-xl">
                      &ldquo;{review.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <Avatar size="lg">
                        <AvatarFallback>{initials(review.author)}</AvatarFallback>
                      </Avatar>
                      <div className="text-start">
                        <p className="text-sm font-semibold text-foreground">
                          {review.author}
                        </p>
                        <p className="text-xs text-muted-foreground">{review.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label="Previous testimonial" />
          <CarouselNext aria-label="Next testimonial" />
        </Carousel>
      </Reveal>
    </section>
  )
}
