import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"

export interface MarketingShellProps extends React.ComponentProps<"div"> {
  /** Slim strip above the navigation — releases, promos, status notices. */
  announcement?: React.ReactNode
  /** Wordmark rendered at the start of the navigation bar. */
  logo?: React.ReactNode
  /** Primary navigation links. Hidden below `md`, where the rail has no room. */
  nav?: React.ReactNode
  /** Trailing actions — a sign-in link, the primary call to action. */
  actions?: React.ReactNode
  /** Footer columns, rendered inside the site-wide footer band. */
  footer?: React.ReactNode
  /** Pin the navigation to the top of the viewport while the page scrolls. */
  stickyNav?: boolean
  /** Max width of the navigation and footer bands. */
  width?: "md" | "lg" | "xl"
}

const widthMap = {
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
} as const

/**
 * The frame every public page lives in: an optional announcement strip, a
 * navigation bar, the page body, and a footer band.
 *
 * Kept separate from `PageShell` on purpose. `PageShell` is the signed-in
 * frame — it owns a title block and assumes the app chrome sits outside it.
 * A marketing page has no title block (the hero *is* the title) and owns its
 * own chrome, so folding the two together would leave both with a prop the
 * other never passes.
 */
function MarketingShell({
  announcement,
  logo,
  nav,
  actions,
  footer,
  stickyNav = false,
  width = "lg",
  className,
  children,
  ...props
}: MarketingShellProps) {
  const hasNav = logo != null || nav != null || actions != null

  return (
    <div
      data-slot="marketing-shell"
      className={cn("flex min-h-svh flex-col bg-background", className)}
      {...props}
    >
      {announcement && (
        <div
          data-slot="marketing-shell-announcement"
          className="bg-primary px-4 py-1.5 text-center text-3xs font-medium text-primary-foreground"
        >
          {announcement}
        </div>
      )}

      {hasNav && (
        <header
          data-slot="marketing-shell-nav"
          className={cn(
            "z-30 border-b border-border bg-background/80 backdrop-blur",
            stickyNav && "sticky top-0"
          )}
        >
          <div
            className={cn(
              "mx-auto flex h-14 w-full items-center gap-6 px-6",
              widthMap[width]
            )}
          >
            {logo}
            {nav && (
              <nav className="hidden items-center gap-1 text-xs font-medium text-muted-foreground md:flex">
                {nav}
              </nav>
            )}
            {actions && (
              <div className="ms-auto flex shrink-0 items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </header>
      )}

      <main
        data-slot="marketing-shell-main"
        className="flex min-h-0 flex-1 flex-col"
      >
        {children}
      </main>

      {footer && (
        <footer
          data-slot="marketing-shell-footer"
          className="mt-auto border-t border-border bg-muted/40"
        >
          <div className={cn("mx-auto w-full px-6 py-10", widthMap[width])}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  )
}

export { MarketingShell }
