"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export type CalendarTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive"

export interface CalendarEvent {
  id: string
  title: string
  tone?: CalendarTone
}

export interface CalendarDay {
  id: string
  /** Day-of-month figure printed in the corner of the cell. */
  date: number
  /** Greyed out for the leading / trailing days of an adjacent month. */
  outside?: boolean
  today?: boolean
  events?: CalendarEvent[]
}

export interface CalendarAgendaItem {
  id: string
  /** Pre-formatted time — the component never parses or formats a date. */
  time: string
  title: string
  meta?: string
  tone?: CalendarTone
}

export interface CalendarPageProps extends Omit<PageShellProps, "children"> {
  /** Already-formatted month, e.g. "October 2026". */
  monthLabel: string
  weekdays: string[]
  /** Grid cells in reading order. A multiple of seven, starting on the week's first day. */
  days: CalendarDay[]
  /** The selected day's schedule, shown in the trailing rail. */
  agenda?: CalendarAgendaItem[]
  selectedDayId?: string
  onSelectDay?: (id: string) => void
}

const toneChip: Record<CalendarTone, string> = {
  default: "bg-muted text-muted-foreground",
  info: "bg-info/12 text-info",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/12 text-destructive",
}

const toneDot: Record<CalendarTone, string> = {
  default: "bg-muted-foreground/50",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
}

/**
 * The month calendar: a seven-column grid with a day-detail rail.
 *
 * Every date value arrives pre-computed — `monthLabel`, each day's `date`, and
 * the agenda's `time` are all strings or plain numbers. Building the grid here
 * would mean owning a calendar library's locale, week-start and timezone rules,
 * and the consumer almost always already has a date library for exactly that.
 */
function CalendarPage({
  monthLabel,
  weekdays,
  days,
  agenda,
  selectedDayId,
  onSelectDay,
  ...shellProps
}: CalendarPageProps) {
  return (
    <PageShell {...shellProps}>
      <div
        data-slot="calendar-page"
        className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              {monthLabel}
            </span>
          </div>

          <div className="grid grid-cols-7 border-b border-border/60">
            {weekdays.map((weekday) => (
              <div
                key={weekday}
                className="px-2 py-2 text-center text-3xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-[repeat(auto-fill,minmax(5rem,1fr))]">
            {days.map((day) => {
              const isSelected = day.id === selectedDayId
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => onSelectDay?.(day.id)}
                  aria-current={day.today ? "date" : undefined}
                  className={cn(
                    "flex min-h-20 flex-col gap-1 border-e border-b border-border/50 p-1.5 text-start transition-colors last:border-e-0",
                    isSelected ? "bg-muted/70" : "hover:bg-muted/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-3xs tabular-nums",
                      day.today
                        ? "bg-primary font-semibold text-primary-foreground"
                        : day.outside
                          ? "text-muted-foreground/50"
                          : "text-foreground"
                    )}
                  >
                    {day.date}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    {day.events?.slice(0, 2).map((event) => (
                      <span
                        key={event.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-4xs font-medium",
                          toneChip[event.tone ?? "default"]
                        )}
                      >
                        {event.title}
                      </span>
                    ))}
                    {(day.events?.length ?? 0) > 2 && (
                      <span className="truncate px-1 text-4xs text-muted-foreground">
                        +{(day.events?.length ?? 0) - 2} more
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <aside
          data-slot="calendar-page-agenda"
          className="flex w-full shrink-0 flex-col rounded-xl border border-border/70 bg-card xl:w-72"
        >
          <div className="border-b border-border/60 px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              Agenda
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 p-3">
            {agenda?.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <span className="w-12 shrink-0 pt-0.5 text-3xs text-muted-foreground tabular-nums">
                  {item.time}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 size-1.5 shrink-0 rounded-full",
                    toneDot[item.tone ?? "default"]
                  )}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs font-medium text-foreground">
                    {item.title}
                  </span>
                  {item.meta && (
                    <span className="text-3xs text-muted-foreground">
                      {item.meta}
                    </span>
                  )}
                </span>
              </div>
            ))}
            {(!agenda || agenda.length === 0) && (
              <p className="p-2 text-3xs text-muted-foreground">
                Nothing scheduled.
              </p>
            )}
          </div>
        </aside>
      </div>
    </PageShell>
  )
}

export { CalendarPage }
