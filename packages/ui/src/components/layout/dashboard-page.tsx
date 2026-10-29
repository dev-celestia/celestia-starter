import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Card, CardContent } from "../primitive/card"
import { Skeleton } from "../primitive/skeleton"
import { PageShell, type PageShellProps } from "./page-shell"

export interface DashboardStat {
  /** Stable key for the tile. Also emitted as `data-stat-id`. */
  id: string
  label: React.ReactNode
  value: React.ReactNode
  /** Supporting line under the value — a period, a comparison, a scope. */
  hint?: React.ReactNode
  /** Pre-formatted change, e.g. `"+12.4%"`. Formatting belongs at the call site. */
  delta?: string
  /** How the delta should read. `flat` is the default and is deliberately neutral. */
  trend?: "up" | "down" | "flat"
  icon?: React.ReactNode
}

export interface DashboardPageProps extends PageShellProps {
  /** Headline metrics rendered as a tile grid under the header. */
  stats?: DashboardStat[]
  /** Column count of the tile grid from `sm` up. */
  statColumns?: 2 | 3 | 4
  /** Swap the tile grid for skeletons while metrics load. */
  loading?: boolean
  /** Replaces the tile grid when it has no items. */
  empty?: React.ReactNode
  /** Secondary column, rendered beside the content from `xl` up. */
  aside?: React.ReactNode
}

const statColumnMap = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const

// Colour carries the direction, but never alone: the delta text states the
// change, so the tile still reads correctly without colour vision.
const trendMap = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
} as const

/**
 * The overview page for a dashboard: header, headline metrics, main content,
 * optional secondary column.
 *
 * Composes `PageShell` rather than re-implementing the header, so a dashboard
 * page gets the same sticky/blurred header, width presets and `actions` slot as
 * any other page — and a consumer can drop down to `PageShell` and still be in
 * the same visual system.
 */
function DashboardPage({
  stats,
  statColumns = 4,
  loading = false,
  empty,
  aside,
  children,
  ...shellProps
}: DashboardPageProps) {
  // Phrased as a narrowing alias rather than `(stats?.length ?? 0) > 0`. The
  // `??` form collapses to a number and severs the link to the array, so
  // TypeScript cannot narrow `stats` at the call site and a non-null assertion
  // becomes the only way through. This form narrows the array itself.
  const hasStats = stats !== undefined && stats.length > 0
  // Keep the grid shape stable across the load by sizing skeletons from the
  // data when it is already known, and from the column count when it is not.
  const skeletonCount = stats?.length || statColumns

  const statTiles = loading ? (
    // Skeletons have no identity to key on: the list is generated from a count,
    // is never reordered, and never swaps out for a different set. The index is
    // the only stable thing available, so the key is derived from it.
    Array.from({ length: skeletonCount }, (_, index) => (
      <Skeleton
        // biome-ignore lint/suspicious/noArrayIndexKey: generated from a count and never reordered, so the index is the only stable identity
        key={`dashboard-stat-skeleton-${index}`}
        className="h-[5.25rem] w-full rounded-lg"
      />
    ))
  ) : hasStats ? (
    stats.map((stat) => (
      <Card
        key={stat.id}
        size="sm"
        // Deliberate override: the tile is this component's element, so it gets
        // this component's slot name. Nothing in the system selects on
        // `[data-slot="card"]`; Card's own behaviour keys off `data-size` and
        // descendant slots, both of which survive.
        data-slot="dashboard-stat"
        data-stat-id={stat.id}
      >
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-3xs text-muted-foreground font-medium tracking-wide uppercase">
              {stat.label}
            </span>
            {stat.icon && (
              <span className="text-muted-foreground [&_svg]:size-3.5">
                {stat.icon}
              </span>
            )}
          </div>
          <div className="font-heading text-foreground text-xl font-semibold tracking-tight tabular-nums">
            {stat.value}
          </div>
          {(stat.delta || stat.hint) && (
            <div className="flex items-center gap-1.5 text-3xs">
              {stat.delta && (
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    trendMap[stat.trend ?? "flat"]
                  )}
                >
                  {stat.delta}
                </span>
              )}
              {stat.hint && (
                <span className="text-muted-foreground min-w-0 truncate">
                  {stat.hint}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    ))
  ) : empty != null ? (
    <div data-slot="dashboard-page-empty" className="sm:col-span-full">
      {empty}
    </div>
  ) : null

  return (
    <PageShell {...shellProps}>
      <div
        data-slot="dashboard-page"
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        {statTiles && (
          <div
            data-slot="dashboard-page-stats"
            className={cn(
              "grid shrink-0 gap-3",
              statColumnMap[statColumns]
            )}
          >
            {statTiles}
          </div>
        )}

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-4",
            aside && "xl:flex-row"
          )}
        >
          <div
            data-slot="dashboard-page-content"
            className="flex min-w-0 flex-1 flex-col gap-4"
          >
            {children}
          </div>
          {aside && (
            <aside
              data-slot="dashboard-page-aside"
              className="flex w-full shrink-0 flex-col gap-4 xl:w-72"
            >
              {aside}
            </aside>
          )}
        </div>
      </div>
    </PageShell>
  )
}

export { DashboardPage }
