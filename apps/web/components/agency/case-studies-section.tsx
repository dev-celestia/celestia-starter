"use client"

import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon, QuotesIcon } from "@phosphor-icons/react"

import { Reveal } from "@/components/feature-installer/reveal"

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

export function CaseStudiesSection() {
  const [reviewIdx, setReviewIdx] = React.useState(0)
  const review = REVIEWS[reviewIdx]

  return (
    <section id="case-studies" className="mx-auto w-full max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs text-primary uppercase tracking-widest">Case Studies</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            Results that speak for themselves
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Real challenges, real solutions, measurable outcomes.
          </p>
        </div>
      </Reveal>

      {/* Case study cards */}
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {CASE_STUDIES.map((cs) => (
          <Reveal key={cs.client}>
            <div className="flex h-full flex-col gap-5 rounded-2xl border border-border/60 bg-surface/20 p-6 transition-all hover:border-primary/20 hover:bg-surface/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{cs.client}</h3>
                  <p className="text-xs text-muted-foreground">{cs.industry}</p>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 font-mono text-[10px] text-primary">
                  {cs.tag}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 font-mono">
                    Challenge
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{cs.challenge}</p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 font-mono">
                    Solution
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{cs.solution}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-5">
                {cs.metrics.map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-[10px] text-muted-foreground/60 font-mono mb-1">{m.label}</p>
                    <p className="text-xs text-muted-foreground line-through">{m.before}</p>
                    <p className="text-sm font-bold text-primary">{m.after}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Reviews carousel */}
      <Reveal>
        <div className="mt-20 rounded-2xl border border-border/60 bg-surface/20 p-8 sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <QuotesIcon className="mx-auto mb-6 size-10 text-primary/40" weight="fill" />
            <blockquote className="text-lg leading-relaxed text-foreground sm:text-xl">
              &ldquo;{review!.quote}&rdquo;
            </blockquote>
            <div className="mt-6">
              <p className="font-semibold text-foreground">{review!.author}</p>
              <p className="text-sm text-muted-foreground">{review!.title}</p>
            </div>

            {/* Dots + arrows */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setReviewIdx((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)}
                aria-label="Previous review"
                className="flex size-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowLeftIcon className="size-4" />
              </button>
              <div className="flex gap-2">
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewIdx(i)}
                    aria-label={`Review ${i + 1}`}
                    className={`size-1.5 rounded-full transition-all cursor-pointer ${
                      i === reviewIdx ? "bg-primary w-4" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setReviewIdx((i) => (i + 1) % REVIEWS.length)}
                aria-label="Next review"
                className="flex size-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
