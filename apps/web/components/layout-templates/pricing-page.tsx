"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Badge } from "@celestia-project/ui/primitive/badge"

export interface PricingPlan {
  id: string
  name: string
  /** Headline figure, already formatted — the component never does arithmetic. */
  price: string
  /** Price shown when the annual toggle is active. Falls back to `price`. */
  annualPrice?: string
  /** Small print under the figure — "per month, billed annually". */
  interval?: string
  description?: string
  features: string[]
  /** Rendered at the bottom of the card. Pass a `<Button>` from the consumer. */
  action?: React.ReactNode
  /** Lifts the card with a primary ring — use for the recommended plan. */
  highlighted?: boolean
  badge?: React.ReactNode
}

export interface PricingPageProps extends React.ComponentProps<"div"> {
  eyebrow?: React.ReactNode
  heading: string
  description?: string
  plans: PricingPlan[]
  /** Enables the monthly / annual segmented control. */
  billingToggle?: boolean
  defaultBilling?: "monthly" | "annual"
  /** Note under the grid — tax, currency, or a money-back line. */
  note?: React.ReactNode
}

/**
 * The pricing screen: a billing-period toggle above a row of plan cards.
 *
 * The toggle is local state rather than a controlled prop because it only
 * changes which *string* a card shows — the consumer hands over both figures
 * and never needs to know which one is on screen. Anything that would need the
 * value (analytics, a checkout URL) belongs in the plan's `action`.
 */
function PricingPage({
  eyebrow,
  heading,
  description,
  plans,
  billingToggle = true,
  defaultBilling = "annual",
  note,
  className,
  children,
  ...props
}: PricingPageProps) {
  const [billing, setBilling] = React.useState<"monthly" | "annual">(
    defaultBilling
  )

  return (
    <div
      data-slot="pricing-page"
      className={cn("mx-auto w-full max-w-6xl px-6 py-16", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1 text-3xs font-medium text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {heading}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-balance text-muted-foreground">
            {description}
          </p>
        )}
        {billingToggle && (
          <div
            role="group"
            aria-label="Billing period"
            className="mt-2 inline-flex items-center rounded-lg bg-muted p-[3px]"
          >
            {(["monthly", "annual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={billing === option}
                onClick={() => setBilling(option)}
                className={cn(
                  "h-7 rounded-md px-3 text-xs font-medium transition-colors",
                  billing === option
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option === "monthly" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        data-slot="pricing-page-plans"
        className="mt-10 grid gap-4 lg:grid-cols-3"
      >
        {plans.map((plan) => {
          const price =
            billing === "annual" && plan.annualPrice
              ? plan.annualPrice
              : plan.price

          return (
            <div
              key={plan.id}
              data-highlighted={plan.highlighted ? "" : undefined}
              className={cn(
                "flex flex-col gap-5 rounded-2xl border bg-card p-6",
                plan.highlighted
                  ? "border-primary/60 shadow-md ring-1 ring-primary/20"
                  : "border-border/70"
              )}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {plan.name}
                  </span>
                  {plan.badge && (
                    <Badge variant="secondary">{plan.badge}</Badge>
                  )}
                </div>
                {plan.description && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                  {price}
                </span>
                {plan.interval && (
                  <span className="text-3xs text-muted-foreground">
                    {plan.interval}
                  </span>
                )}
              </div>

              <ul className="flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/15 text-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.action}
            </div>
          )
        })}
      </div>

      {note && (
        <p className="mt-8 text-center text-xs text-muted-foreground">{note}</p>
      )}
      {children}
    </div>
  )
}

export { PricingPage }
