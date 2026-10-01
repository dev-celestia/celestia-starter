"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Badge } from "@celestia-project/ui/primitive/badge"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export type BoardTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive"

export interface KanbanCard {
  id: string
  title: string
  /** Supporting line under the title — a ticket id, a due date, a customer. */
  meta?: string
  tags?: string[]
  assignee?: string
  /** Renders a priority pip on the card. */
  tone?: BoardTone
}

export interface KanbanColumn {
  id: string
  title: string
  /** Tints the column's status dot. */
  tone?: BoardTone
  cards: KanbanCard[]
}

export interface KanbanPageProps extends Omit<PageShellProps, "children"> {
  columns: KanbanColumn[]
  /** Fired when a card is activated. */
  onOpenCard?: (id: string) => void
  /** Fired when a column's add button is pressed. */
  onAddCard?: (columnId: string) => void
}

const toneDot: Record<BoardTone, string> = {
  default: "bg-muted-foreground/50",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
}

const toneRail: Record<BoardTone, string> = {
  default: "bg-border",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
}

/**
 * The kanban board: one horizontal track of fixed-width columns.
 *
 * Columns scroll as a single track rather than wrapping, because a board whose
 * columns reflow into rows stops reading as a board — the eye loses the
 * left-to-right progression that makes the stages legible. Each column owns its
 * own vertical scroll so a long "In progress" list cannot stretch the page.
 */
function KanbanPage({
  columns,
  onOpenCard,
  onAddCard,
  ...shellProps
}: KanbanPageProps) {
  return (
    <PageShell {...shellProps}>
      <div
        data-slot="kanban-page"
        className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2"
      >
        {columns.map((column) => (
          <section
            key={column.id}
            data-slot="kanban-page-column"
            className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-muted/40 p-3"
          >
            <header className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  toneDot[column.tone ?? "default"]
                )}
              />
              <span className="text-xs font-semibold text-foreground">
                {column.title}
              </span>
              <span className="rounded-full bg-muted px-1.5 text-3xs text-muted-foreground tabular-nums">
                {column.cards.length}
              </span>
              <button
                type="button"
                aria-label={`Add card to ${column.title}`}
                onClick={() => onAddCard?.(column.id)}
                className="ms-auto flex size-6 items-center justify-center rounded-md text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                +
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {column.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onOpenCard?.(card.id)}
                  className="relative flex flex-col gap-2 overflow-hidden rounded-lg border border-border/70 bg-card p-3 text-start transition-colors hover:border-border"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-0 start-0 w-0.5",
                      toneRail[card.tone ?? "default"]
                    )}
                  />
                  <span className="text-xs leading-snug font-medium text-foreground">
                    {card.title}
                  </span>
                  {card.meta && (
                    <span className="text-3xs text-muted-foreground">
                      {card.meta}
                    </span>
                  )}
                  {(card.tags?.length || card.assignee) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {card.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {card.assignee && (
                        <span className="ms-auto flex size-5 items-center justify-center rounded-full bg-muted text-3xs font-medium text-muted-foreground">
                          {card.assignee.slice(0, 1)}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}

              {column.cards.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-3xs text-muted-foreground">
                  Nothing here yet
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  )
}

export { KanbanPage }
