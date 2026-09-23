import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"

export interface PageShellProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Page title rendered in the header. */
  title?: React.ReactNode
  /** Supporting description under the title. */
  description?: React.ReactNode
  /** Actions rendered on the trailing edge of the header. */
  actions?: React.ReactNode
  /** Sticky header behaviour. */
  stickyHeader?: boolean
  /** Max content width. */
  width?: "full" | "md" | "lg" | "xl"
  /** Content padding. */
  padded?: boolean
}

const widthMap = {
  full: "max-w-none",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
} as const

function PageShell({
  title,
  description,
  actions,
  stickyHeader = false,
  width = "full",
  padded = true,
  className,
  children,
  ...props
}: PageShellProps) {
  const hasHeader = title != null || description != null || actions != null

  return (
    <div
      data-slot="page-shell"
      className={cn("bg-background flex min-h-0 flex-1 flex-col", className)}
      {...props}
    >
      {hasHeader && (
        <header
          data-slot="page-shell-header"
          className={cn(
            "bg-background/80 border-border z-10 border-b backdrop-blur",
            stickyHeader && "sticky top-0"
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-full flex-col gap-1 px-6 py-4",
              widthMap[width]
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                {title && (
                  <h1 className="font-heading text-foreground text-lg font-semibold tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-muted-foreground text-sm">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex shrink-0 items-center gap-2">{actions}</div>
              )}
            </div>
          </div>
        </header>
      )}
      <div
        data-slot="page-shell-content"
        className={cn(
          "mx-auto flex w-full min-h-0 flex-1 flex-col",
          widthMap[width],
          padded && "px-6 py-5"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { PageShell }