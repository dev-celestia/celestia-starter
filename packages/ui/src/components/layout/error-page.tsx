import * as React from "react"

import { StatusPage } from "./status-page"

export interface ErrorPageProps extends React.ComponentProps<"div"> {
  /** Status code shown above the title. */
  code?: string
  title?: string
  description?: string
  /** Replaces the status code with a mark. */
  icon?: React.ReactNode
  /** Caption above the technical block. */
  detailLabel?: string
  /**
   * The technical detail a support ticket needs — an error digest, trace id or
   * request id. Omit it and no technical block renders at all, which is the
   * right default for a page a customer might screenshot.
   */
  detail?: React.ReactNode
  /** Primary call-to-action label — normally a retry. */
  actionLabel?: string
  onAction?: () => void
  /** Secondary call-to-action label. */
  secondaryLabel?: string
  onSecondaryAction?: () => void
}

/**
 * The 5xx / unexpected-failure screen.
 *
 * A sibling of `NotFoundPage` on the same `StatusPage` frame. What separates
 * them is `detail`: a 404 is fully explained by its own copy, whereas a server
 * error is the one case where showing the reader an opaque digest actually
 * helps, because it is the thing they will paste into a bug report.
 */
function ErrorPage({
  code = "500",
  title = "Something went wrong",
  description = "An unexpected error occurred on our side. The team has been notified.",
  actionLabel = "Try again",
  detailLabel = "Error details",
  ...props
}: ErrorPageProps) {
  return (
    <StatusPage
      data-slot="error-page"
      code={code}
      title={title}
      description={description}
      actionLabel={actionLabel}
      detailLabel={detailLabel}
      {...props}
    />
  )
}

export { ErrorPage }
