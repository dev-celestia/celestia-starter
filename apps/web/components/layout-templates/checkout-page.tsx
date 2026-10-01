"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Button } from "@celestia-project/ui/primitive/button"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export interface CheckoutStep {
  id: string
  label: string
}

export interface CheckoutSummaryRow {
  id: string
  label: string
  value: string
  /** Mutes the row — for a line that is informational rather than billed. */
  muted?: boolean
}

export interface CheckoutPageProps extends Omit<PageShellProps, "children"> {
  steps: CheckoutStep[]
  /** Id of the step in progress. Earlier steps render as complete. */
  activeStep: string
  summary: CheckoutSummaryRow[]
  total: { label: string; value: string }
  summaryTitle?: string
  /** Small print under the totals — terms, refund policy. */
  summaryNote?: React.ReactNode
  submitLabel?: string
  onSubmit?: () => void
  backLabel?: string
  onBack?: () => void
  /** The form for the current step. */
  children?: React.ReactNode
}

/**
 * The checkout screen: a stepped form beside a sticky order summary.
 *
 * Step progress is derived from the position of `activeStep` in `steps` rather
 * than tracked as a separate `completedSteps` array. Two props describing the
 * same fact would let a consumer mark step 3 active while claiming step 2 is
 * incomplete, and there is no correct rendering for that state.
 */
function CheckoutPage({
  steps,
  activeStep,
  summary,
  total,
  summaryTitle = "Order summary",
  summaryNote,
  submitLabel = "Continue",
  onSubmit,
  backLabel = "Back",
  onBack,
  children,
  ...shellProps
}: CheckoutPageProps) {
  const activeIndex = Math.max(
    steps.findIndex((step) => step.id === activeStep),
    0
  )

  return (
    <PageShell {...shellProps}>
      <div
        data-slot="checkout-page"
        className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <ol
            data-slot="checkout-page-steps"
            className="flex flex-wrap items-center gap-x-3 gap-y-2"
          >
            {steps.map((step, index) => {
              const state =
                index < activeIndex
                  ? "complete"
                  : index === activeIndex
                    ? "current"
                    : "upcoming"
              return (
                <li key={step.id} className="flex items-center gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-3xs font-medium tabular-nums",
                        state === "current" &&
                          "bg-primary text-primary-foreground",
                        state === "complete" && "bg-success/15 text-success",
                        state === "upcoming" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        state === "upcoming"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </span>
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px w-6 bg-border sm:block"
                    />
                  )}
                </li>
              )
            })}
          </ol>

          <div className="flex flex-col gap-4">{children}</div>

          {(onBack || onSubmit) && (
            <div className="flex items-center gap-2">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  {backLabel}
                </Button>
              )}
              {onSubmit && <Button onClick={onSubmit}>{submitLabel}</Button>}
            </div>
          )}
        </div>

        <aside
          data-slot="checkout-page-summary"
          className="flex w-full shrink-0 flex-col gap-4 self-start rounded-xl border border-border/70 bg-card p-5 lg:sticky lg:top-4 lg:w-80"
        >
          <span className="text-sm font-semibold text-foreground">
            {summaryTitle}
          </span>

          <div className="flex flex-col gap-2.5">
            {summary.map((row) => (
              <div
                key={row.id}
                className="flex items-baseline justify-between gap-3 text-xs"
              >
                <span
                  className={cn(
                    row.muted ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {row.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 tabular-nums",
                    row.muted
                      ? "text-muted-foreground"
                      : "font-medium text-foreground"
                  )}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-3">
            <span className="text-sm font-medium text-foreground">
              {total.label}
            </span>
            <span className="font-heading text-lg font-semibold text-foreground tabular-nums">
              {total.value}
            </span>
          </div>

          {summaryNote && (
            <p className="text-3xs leading-relaxed text-muted-foreground">
              {summaryNote}
            </p>
          )}
        </aside>
      </div>
    </PageShell>
  )
}

export { CheckoutPage }
