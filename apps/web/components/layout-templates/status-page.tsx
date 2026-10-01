"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Button } from "@celestia-project/ui/primitive/button"

export interface StatusPageProps extends React.ComponentProps<"div"> {
  /** Large status code shown above the title. Omit when passing `icon`. */
  code?: React.ReactNode
  title?: string
  description?: string
  /** Replaces the status code with a mark. */
  icon?: React.ReactNode
  /** Caption above the technical block. */
  detailLabel?: string
  /**
   * Technical detail — an error digest, trace id or request id. Rendered in a
   * monospace block, so keep it to something a person can read out loud.
   */
  detail?: React.ReactNode
  /** Primary call-to-action label. */
  actionLabel?: string
  onAction?: () => void
  /** Secondary call-to-action label. */
  secondaryLabel?: string
  onSecondaryAction?: () => void
}

/**
 * The full-viewport status screen — the frame shared by every "this page is not
 * the page you asked for" state (404, 403, 500, 503, maintenance).
 *
 * It exists so `NotFoundPage` and `ErrorPage` are thin wrappers that differ only
 * in defaults and in whether they surface a technical detail, rather than two
 * copies of the same centering, spacing and action-row markup.
 */
function StatusPage({
  code,
  title,
  description,
  icon,
  detailLabel,
  detail,
  actionLabel = "Go back",
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className,
  ...props
}: StatusPageProps) {
  return (
    <div
      data-slot="status-page"
      className={cn(
        "flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="text-muted-foreground">{icon}</div>
      ) : code != null ? (
        <span className="font-heading text-6xl font-bold tracking-tight text-muted-foreground/40">
          {code}
        </span>
      ) : null}
      <div className="flex flex-col gap-2">
        {title && (
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        )}
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {detail != null && (
        <div
          data-slot="status-page-detail"
          className="w-full max-w-md rounded-lg border border-border bg-muted/40 p-3 text-start"
        >
          {detailLabel && (
            <div className="pb-1 text-3xs font-medium tracking-wide text-muted-foreground uppercase">
              {detailLabel}
            </div>
          )}
          <div className="font-mono text-3xs break-all text-muted-foreground">
            {detail}
          </div>
        </div>
      )}
      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-3 pt-2">
          {onAction && <Button onClick={onAction}>{actionLabel}</Button>}
          {onSecondaryAction && secondaryLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { StatusPage }
