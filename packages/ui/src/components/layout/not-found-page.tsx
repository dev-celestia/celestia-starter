import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Button } from "../primitive/button"

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

function NotFoundPage({
  code = "404",
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  actionLabel = "Go home",
  onAction,
  secondaryLabel,
  onSecondaryAction,
  icon,
  className,
  ...props
}: NotFoundPageProps) {
  return (
    <div
      data-slot="not-found-page"
      className={cn(
        "bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="text-muted-foreground">{icon}</div>
      ) : (
        <span className="font-heading text-muted-foreground/40 text-6xl font-bold tracking-tight">
          {code}
        </span>
      )}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-foreground text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
        )}
      </div>
      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-3 pt-2">
          {onAction && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
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

export { NotFoundPage }