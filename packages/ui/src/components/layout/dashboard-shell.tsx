import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"

export interface DashboardShellProps extends React.ComponentProps<"div"> {
  /** Brand slot pinned to the top of the navigation rail. */
  brand?: React.ReactNode
  /** Primary navigation — typically a list of links. */
  nav?: React.ReactNode
  /** Slot pinned to the bottom of the navigation rail (user menu, upgrade CTA). */
  navFooter?: React.ReactNode
  /**
   * Width of the navigation rail. `md` keeps the full label rail from `md` up
   * and collapses to an icon rail below it; `sm` stays an icon rail at every
   * width. Mirrors the 56px-rail-below-`md` collapse the app hand-rolled.
   */
  navWidth?: "sm" | "md"
  /** Sticky header slot rendered above the content column. */
  header?: React.ReactNode
  /** Right-hand rail. Hidden below `xl`, where it would starve the content column. */
  aside?: React.ReactNode
  asideWidth?: "sm" | "md"
  /** Max width of the content column. */
  contentWidth?: "full" | "lg" | "xl"
  /** Content padding. Turn off when the page supplies its own scroll container. */
  padded?: boolean
}

const navWidthMap = {
  sm: "w-12",
  md: "w-14 md:w-56",
} as const

const asideWidthMap = {
  sm: "w-64",
  md: "w-80",
} as const

const contentWidthMap = {
  full: "max-w-none",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
} as const

/**
 * The frame a signed-in app lives in: a navigation rail, an optional sticky
 * header, a scrolling content column, and an optional right rail.
 *
 * Deliberately slot-based rather than opinionated about navigation. `nav` takes
 * whatever list the consumer already has (links, buttons, a `Sidebar`), so the
 * shell can back an existing route group without rewriting its navigation —
 * which is the difference between a layout you can adopt and one you can only
 * copy.
 */
function DashboardShell({
  brand,
  nav,
  navFooter,
  navWidth = "md",
  header,
  aside,
  asideWidth = "sm",
  contentWidth = "full",
  padded = true,
  className,
  children,
  ...props
}: DashboardShellProps) {
  return (
    <div
      data-slot="dashboard-shell"
      className={cn("bg-background flex min-h-svh w-full", className)}
      {...props}
    >
      {nav && (
        <aside
          data-slot="dashboard-shell-nav"
          className={cn(
            "border-border bg-muted/30 flex shrink-0 flex-col border-r",
            navWidthMap[navWidth]
          )}
        >
          {brand && (
            <div
              data-slot="dashboard-shell-brand"
              className="border-border flex h-14 shrink-0 items-center justify-center border-b px-3 md:justify-start md:px-4"
            >
              {brand}
            </div>
          )}
          <div
            data-slot="dashboard-shell-nav-body"
            className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2 md:p-3"
          >
            {nav}
          </div>
          {navFooter && (
            <div
              data-slot="dashboard-shell-nav-footer"
              className="border-border shrink-0 border-t p-2 md:p-3"
            >
              {navFooter}
            </div>
          )}
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {header && (
          <header
            data-slot="dashboard-shell-header"
            className="bg-background/80 border-border sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur md:px-6"
          >
            {header}
          </header>
        )}

        <div className="flex min-h-0 flex-1">
          <main
            data-slot="dashboard-shell-main"
            className="flex min-w-0 flex-1 flex-col"
          >
            <div
              data-slot="dashboard-shell-content"
              className={cn(
                "mx-auto flex min-h-0 w-full flex-1 flex-col",
                contentWidthMap[contentWidth],
                padded && "p-4 md:p-6 lg:p-8"
              )}
            >
              {children}
            </div>
          </main>

          {aside && (
            <aside
              data-slot="dashboard-shell-aside"
              className={cn(
                "border-border hidden shrink-0 border-l xl:block",
                asideWidthMap[asideWidth]
              )}
            >
              {/* Tracks the sticky header's 56px so the rail scrolls
                  independently instead of scrolling the whole page. */}
              <div className="sticky top-14 flex max-h-[calc(100svh-3.5rem)] flex-col gap-4 overflow-y-auto p-4">
                {aside}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

export { DashboardShell }
