"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"

export interface LandingFeature {
  id: string
  /** Small mark above the title — an icon at `size-4`. */
  icon?: React.ReactNode
  title: string
  description: string
}

export interface LandingMetric {
  id: string
  value: string
  label: string
}

export interface LandingPageProps extends React.ComponentProps<"div"> {
  /** Pill above the heading — a release tag, a category, a proof point. */
  eyebrow?: React.ReactNode
  heading: string
  subheading?: string
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  /** Feature cards. Rendered as a responsive three-up grid. */
  features?: LandingFeature[]
  featuresHeading?: string
  /** Numbers band. Omit to skip the band entirely. */
  metrics?: LandingMetric[]
  /** Closing call-to-action band. */
  cta?: { title: string; description?: string; action?: React.ReactNode }
  /** Extra sections appended after the CTA — logos, FAQ, anything bespoke. */
  footerSlot?: React.ReactNode
}

/**
 * The marketing home page: hero, feature grid, numbers band, closing CTA.
 *
 * Renders into `MarketingShell` rather than owning its own chrome, so the
 * navigation and footer stay identical across every public page. The bands are
 * driven by arrays rather than children so a consumer can reorder or drop a
 * section without re-writing markup.
 */
function LandingPage({
  eyebrow,
  heading,
  subheading,
  primaryAction,
  secondaryAction,
  features,
  featuresHeading = "Everything you need",
  metrics,
  cta,
  footerSlot,
  className,
  children,
  ...props
}: LandingPageProps) {
  return (
    <div
      data-slot="landing-page"
      className={cn("flex w-full flex-col", className)}
      {...props}
    >
      <section
        data-slot="landing-page-hero"
        className="relative overflow-hidden border-b border-border/60"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-6 py-20 text-center sm:py-28">
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-3xs font-medium text-muted-foreground">
              {eyebrow}
            </span>
          )}
          <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            {heading}
          </h1>
          {subheading && (
            <p className="max-w-2xl text-sm leading-relaxed text-balance text-muted-foreground sm:text-base">
              {subheading}
            </p>
          )}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
      </section>

      {features && features.length > 0 && (
        <section
          data-slot="landing-page-features"
          className="mx-auto w-full max-w-6xl px-6 py-16"
        >
          <h2 className="text-center font-heading text-xl font-semibold tracking-tight text-foreground">
            {featuresHeading}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-5"
              >
                {feature.icon && (
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
                    {feature.icon}
                  </span>
                )}
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {metrics && metrics.length > 0 && (
        <section
          data-slot="landing-page-metrics"
          className="border-y border-border/60 bg-muted/30"
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 py-10 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex flex-col gap-0.5">
                <span className="font-heading text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  {metric.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {cta && (
        <section
          data-slot="landing-page-cta"
          className="mx-auto w-full max-w-6xl px-6 py-16"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-card px-6 py-12 text-center">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance text-foreground">
              {cta.title}
            </h2>
            {cta.description && (
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {cta.description}
              </p>
            )}
            {cta.action}
          </div>
        </section>
      )}

      {children}
      {footerSlot}
    </div>
  )
}

export { LandingPage }
