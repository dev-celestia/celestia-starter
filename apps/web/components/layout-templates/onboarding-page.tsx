"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export interface OnboardingStep {
  id: string
  label: string
  description?: string
}

export interface OnboardingPageProps extends Omit<PageShellProps, "children"> {
  steps: OnboardingStep[]
  /** Id of the step in progress. */
  activeStep: string
  /** Makes the rail clickable. Omit to render it as read-only progress. */
  onStepChange?: (id: string) => void
  /** The step's form. */
  children?: React.ReactNode
}

/**
 * The onboarding wizard: a step rail beside the active step's panel.
 *
 * The rail doubles as progress and as navigation, so `onStepChange` is optional
 * rather than required — a linear flow that must not be skipped simply does not
 * pass it, and the rail falls back to a non-interactive list instead of a set
 * of buttons that would need disabling one by one.
 */
function OnboardingPage({
  steps,
  activeStep,
  onStepChange,
  children,
  ...shellProps
}: OnboardingPageProps) {
  const activeIndex = Math.max(
    steps.findIndex((step) => step.id === activeStep),
    0
  )
  const progress = ((activeIndex + 1) / Math.max(steps.length, 1)) * 100

  return (
    <PageShell {...shellProps}>
      <div
        data-slot="onboarding-page"
        className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row"
      >
        <aside
          data-slot="onboarding-page-rail"
          className="flex w-full shrink-0 flex-col gap-4 lg:w-64"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-3xs font-medium tracking-wide text-muted-foreground uppercase">
              Step {activeIndex + 1} of {steps.length}
            </span>
            <div
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ol className="flex flex-col gap-1">
            {steps.map((step, index) => {
              const state =
                index < activeIndex
                  ? "complete"
                  : index === activeIndex
                    ? "current"
                    : "upcoming"
              const interactive = onStepChange != null

              return (
                <li key={step.id}>
                  <button
                    type="button"
                    disabled={!interactive}
                    aria-current={state === "current" ? "step" : undefined}
                    onClick={() => onStepChange?.(step.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg p-2.5 text-start transition-colors",
                      interactive
                        ? "cursor-pointer hover:bg-muted/60"
                        : "cursor-default",
                      state === "current" && "bg-muted/60"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-3xs font-medium tabular-nums",
                        state === "current" &&
                          "bg-primary text-primary-foreground",
                        state === "complete" && "bg-success/15 text-success",
                        state === "upcoming" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
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
                      {step.description && (
                        <span className="text-3xs leading-relaxed text-muted-foreground">
                          {step.description}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        <div
          data-slot="onboarding-page-panel"
          className="flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-border/70 bg-card p-6"
        >
          {children}
        </div>
      </div>
    </PageShell>
  )
}

export { OnboardingPage }
