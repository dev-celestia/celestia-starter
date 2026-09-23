import * as React from "react"

import { StatusPage } from "./status-page"

export interface NotFoundPageProps extends React.ComponentProps<"div"> {
  /** Large status code shown above the title. */
  code?: string
  title?: string
  description?: string
  /** Primary call-to-action label. */
  actionLabel?: string
  onAction?: () => void
  /** Secondary call-to-action label. */
  secondaryLabel?: string
  onSecondaryAction?: () => void
  icon?: React.ReactNode
}

/**
 * The 404 screen. A thin wrapper over `StatusPage` that supplies the copy — the
 * frame itself lives in one place so `ErrorPage` and this cannot drift apart.
 */
function NotFoundPage({
  code = "404",
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  actionLabel = "Go home",
  ...props
}: NotFoundPageProps) {
  return (
    <StatusPage
      data-slot="not-found-page"
      code={code}
      title={title}
      description={description}
      actionLabel={actionLabel}
      {...props}
    />
  )
}

export { NotFoundPage }
