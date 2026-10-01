"use client"

import * as React from "react"

import { Badge } from "@celestia-project/ui/primitive/badge"
import { Button } from "@celestia-project/ui/primitive/button"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export type ReportStatus = "ready" | "running" | "failed" | "draft"

export interface ReportEntry {
  id: string
  name: string
  description?: string
  /** Human cadence — "Every Monday, 09:00". Never a cron expression. */
  schedule?: string
  status: ReportStatus
  /** When the report last produced a result. */
  lastRun?: string
  owner?: string
}

export interface ReportsPageProps extends Omit<PageShellProps, "children"> {
  reports: ReportEntry[]
  onRun?: (id: string) => void
  onOpen?: (id: string) => void
}

const statusMap: Record<
  ReportStatus,
  { label: string; variant: "success" | "info" | "destructive" | "secondary" }
> = {
  ready: { label: "Ready", variant: "success" },
  running: { label: "Running", variant: "info" },
  failed: { label: "Failed", variant: "destructive" },
  draft: { label: "Draft", variant: "secondary" },
}

/**
 * The report library: a list of saved reports with their schedule and state.
 *
 * Status is a closed union rather than a free string so the badge tone can be
 * decided here once, instead of every call site re-deciding what "failed"
 * looks like. A new state is a deliberate addition to the union.
 */
function ReportsPage({
  reports,
  onRun,
  onOpen,
  ...shellProps
}: ReportsPageProps) {
  return (
    <PageShell {...shellProps}>
      <div
        data-slot="reports-page"
        className="shrink-0 overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-border/60 px-4 py-2.5 text-3xs font-medium tracking-wide text-muted-foreground uppercase sm:grid-cols-[1fr_10rem_7rem_auto]">
          <span>Report</span>
          <span className="hidden sm:block">Schedule</span>
          <span className="hidden sm:block">Status</span>
          <span className="text-end">Action</span>
        </div>

        <div className="flex flex-col">
          {reports.map((report) => {
            const status = statusMap[report.status]
            return (
              <div
                key={report.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40 sm:grid-cols-[1fr_10rem_7rem_auto]"
              >
                <button
                  type="button"
                  onClick={() => onOpen?.(report.id)}
                  className="flex min-w-0 flex-col gap-0.5 text-start"
                >
                  <span className="truncate text-xs font-medium text-foreground">
                    {report.name}
                  </span>
                  <span className="truncate text-3xs text-muted-foreground">
                    {[
                      report.description,
                      report.lastRun && `Last run ${report.lastRun}`,
                      report.owner,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </button>

                <span className="hidden truncate text-xs text-muted-foreground sm:block">
                  {report.schedule ?? "Manual"}
                </span>

                <span className="hidden sm:block">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </span>

                <div className="flex items-center justify-end gap-2">
                  <Badge variant={status.variant} className="sm:hidden">
                    {status.label}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={report.status === "running"}
                    onClick={() => onRun?.(report.id)}
                  >
                    Run
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {reports.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-muted-foreground">
            No reports yet.
          </div>
        )}
      </div>
    </PageShell>
  )
}

export { ReportsPage }
