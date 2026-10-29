import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Button } from "../primitive/button"

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
        "bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="text-muted-foreground">{icon}</div>
      ) : code != null ? (
        <span className="font-heading text-muted-foreground/40 text-6xl font-bold tracking-tight">
          {code}
        </span>
      ) : null}
      <div className="flex flex-col gap-2">
        {title && (
          <h1 className="font-heading text-foreground text-xl font-semibold tracking-tight">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
        )}
      </div>
      {detail != null && (
        <div
          data-slot="status-page-detail"
          className="border-border bg-muted/40 w-full max-w-md rounded-lg border p-3 text-start"
        >
          {detailLabel && (
            <div className="text-muted-foreground pb-1 text-3xs font-medium tracking-wide uppercase">
              {detailLabel}
            </div>
          )}
          <div className="text-muted-foreground font-mono text-3xs break-all">
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
