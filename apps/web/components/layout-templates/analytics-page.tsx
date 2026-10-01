"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui/primitive/card"
import { Progress } from "@celestia-project/ui/primitive/progress"
import { DashboardPage, type DashboardStat } from "./dashboard-page"
import type { PageShellProps } from "@celestia-project/ui/composite/page-shell"

export interface AnalyticsBreakdownRow {
  id: string
  label: string
  /** Pre-formatted figure shown at the trailing edge. */
  value: string
  /** Percentage of the whole, `0`–`100`. Drives the bar width only. */
  share: number
}

export interface AnalyticsPageProps extends PageShellProps {
  /** Headline metrics, rendered by `DashboardPage`'s tile grid. */
  metrics?: DashboardStat[]
  chart?: React.ReactNode
  chartTitle?: string
  chartDescription?: string
  breakdown?: AnalyticsBreakdownRow[]
  breakdownTitle?: string
  breakdownDescription?: string
  /** Secondary column beside the chart and breakdown, from `xl` up. */
  aside?: React.ReactNode
}

/**
 * The analytics screen: KPI tiles over a chart and a ranked breakdown.
 *
 * Composes `DashboardPage` rather than re-implementing the shell and the tile
 * grid. The only thing this page adds is the content column — a chart card and
 * a breakdown card — so the tiles, the header and the aside slot stay the same
 * objects the dashboard already ships.
 */
function AnalyticsPage({
  metrics,
  chart,
  chartTitle = "Traffic",
  chartDescription,
  breakdown,
  breakdownTitle = "Top sources",
  breakdownDescription,
  aside,
  children,
  ...shellProps
}: AnalyticsPageProps) {
  return (
    <DashboardPage
      {...shellProps}
      stats={metrics}
      statColumns={4}
      aside={aside}
    >
      {chart && (
        <Card>
          <CardHeader>
            <CardTitle>{chartTitle}</CardTitle>
            {chartDescription && (
              <CardDescription>{chartDescription}</CardDescription>
            )}
          </CardHeader>
          <CardContent>{chart}</CardContent>
        </Card>
      )}

      {breakdown && breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{breakdownTitle}</CardTitle>
            {breakdownDescription && (
              <CardDescription>{breakdownDescription}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {breakdown.map((row) => (
              <div key={row.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {row.label}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {row.value}
                  </span>
                </div>
                <Progress
                  value={row.share}
                  aria-label={`${row.label} share`}
                  className="gap-0"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {children}
    </DashboardPage>
  )
}

export { AnalyticsPage }
