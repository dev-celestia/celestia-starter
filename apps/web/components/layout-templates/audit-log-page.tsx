"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export type AuditTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive"

export interface AuditEvent {
  id: string
  /** Who did it — a person, a service account, "System". */
  actor: string
  /** What they did, in the past tense. */
  action: string
  /** What it was done to. */
  target?: string
  time: string
  /** Source address, rendered in monospace. */
  ip?: string
  tone?: AuditTone
}

export interface AuditLogPageProps extends Omit<PageShellProps, "children"> {
  events: AuditEvent[]
  /** Filter controls above the timeline. */
  filters?: React.ReactNode
}

const toneDot: Record<AuditTone, string> = {
  default: "bg-muted-foreground/40",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
}

/**
 * The audit log: a vertical timeline of who did what, to what, and when.
 *
 * The rail is drawn per row with `before:` rather than as one absolutely
 * positioned line, so the connector survives rows of different heights — which
 * is the normal case once a target or an address wraps onto a second line.
 */
function AuditLogPage({ events, filters, ...shellProps }: AuditLogPageProps) {
  return (
    <PageShell {...shellProps}>
      <div
        data-slot="audit-log-page"
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        {filters && (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-border/70 bg-card p-5">
          <ol className="flex flex-col">
            {events.map((event, index) => (
              <li
                key={event.id}
                className={cn(
                  "relative flex gap-4 pb-6 last:pb-0",
                  // The connector belongs to every row but the last — a line
                  // below the final dot would trail off into nothing.
                  index < events.length - 1 &&
                    "before:absolute before:start-[3px] before:top-3 before:bottom-0 before:w-px before:bg-border"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative z-10 mt-1 size-[7px] shrink-0 rounded-full ring-4 ring-card",
                    toneDot[event.tone ?? "default"]
                  )}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-xs leading-relaxed">
                    <span className="font-medium text-foreground">
                      {event.actor}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {event.action}
                    </span>
                    {event.target && (
                      <>
                        {" "}
                        <span className="font-medium text-foreground">
                          {event.target}
                        </span>
                      </>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-3xs text-muted-foreground">
                    <span className="tabular-nums">{event.time}</span>
                    {event.ip && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{event.ip}</span>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {events.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No activity recorded.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  )
}

export { AuditLogPage }
