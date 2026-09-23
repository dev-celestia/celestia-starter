"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Button } from "../primitive/button"
import { Checkbox } from "../primitive/checkbox"
import { Input } from "../primitive/input"
import { Skeleton } from "../primitive/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../primitive/table"
import { PageShell, type PageShellProps } from "./page-shell"

export interface ListColumn<T> {
  /** Stable id — used as the React key for the head and every body cell. */
  id: string
  header: React.ReactNode
  cell: (row: T, index: number) => React.ReactNode
  /** Trailing-align the column. Wins over `TableHead`'s own `text-start`. */
  align?: "start" | "end"
  /** Extra classes applied to both the head and the body cells. */
  className?: string
}

export interface ListPageProps<T> extends Omit<PageShellProps, "children"> {
  columns: ListColumn<T>[]
  rows: T[]
  /**
   * Stable identity for a row. Required rather than optional because selection
   * is keyed on it — deriving a key from the index would silently move the
   * selection when the list re-sorts.
   */
  rowKey: (row: T, index: number) => string
  /** Controlled search box. Omit to hide it. */
  search?: {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
  }
  /** Filter controls rendered beside the search box. */
  filters?: React.ReactNode
  /** Trailing toolbar actions, pushed to the end of the row. */
  toolbar?: React.ReactNode
  /** Render a leading checkbox column and a select-all in the header. */
  selectable?: boolean
  /** Controlled selection. Pair with `onSelectedIdsChange`. */
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  onRowClick?: (row: T) => void
  loading?: boolean
  skeletonRows?: number
  /** Replaces the table body when `rows` is empty and not loading. */
  empty?: React.ReactNode
  page?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  /** Caption on the left of the pagination bar. */
  totalLabel?: React.ReactNode
}

/**
 * The table-driven index page — the CRUD "list" screen.
 *
 * Composed on `PageShell` so the header, width and padding come from the same
 * place every other page gets them. The component owns layout and state
 * plumbing only: it never filters, sorts or paginates `rows` itself. The
 * consumer already has that logic (or a server), and re-implementing it here
 * would mean two sources of truth for what page 2 contains.
 */
function ListPage<T>({
  columns,
  rows,
  rowKey,
  search,
  filters,
  toolbar,
  selectable = false,
  selectedIds,
  onSelectedIdsChange,
  onRowClick,
  loading = false,
  skeletonRows = 5,
  empty,
  page = 1,
  pageCount = 1,
  onPageChange,
  totalLabel,
  ...shellProps
}: ListPageProps<T>) {
  const selected = React.useMemo(
    () => new Set(selectedIds ?? []),
    [selectedIds]
  )
  const keys = rows.map((row, index) => rowKey(row, index))
  const allSelected = keys.length > 0 && keys.every((key) => selected.has(key))
  const someSelected = keys.some((key) => selected.has(key))
  const hasToolbar = search != null || filters != null || toolbar != null
  const showEmpty = !loading && rows.length === 0

  const commit = (next: Set<string>) => onSelectedIdsChange?.(Array.from(next))

  const toggleAll = (checked: boolean) => {
    const next = new Set(selected)
    for (const key of keys) {
      if (checked) next.add(key)
      else next.delete(key)
    }
    commit(next)
  }

  const toggleOne = (key: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(key)
    else next.delete(key)
    commit(next)
  }

  return (
    <PageShell {...shellProps}>
      <div data-slot="list-page" className="flex min-h-0 flex-1 flex-col">
        {hasToolbar && (
          <div
            data-slot="list-page-toolbar"
            className="flex flex-wrap items-center gap-2 pb-4"
          >
            {search && (
              <Input
                type="search"
                value={search.value}
                onChange={(event) => search.onValueChange(event.target.value)}
                placeholder={search.placeholder ?? "Search…"}
                className="w-full sm:w-56"
              />
            )}
            {filters}
            {toolbar && (
              <div className="ms-auto flex items-center gap-2">{toolbar}</div>
            )}
          </div>
        )}

        <div
          data-slot="list-page-table"
          className="border-border bg-card overflow-hidden rounded-lg border"
        >
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-9">
                    <Checkbox
                      aria-label="Select all rows"
                      checked={allSelected}
                      // Only meaningful while the selection is partial: a
                      // checked box that is also indeterminate would show the
                      // dash and the tick at once.
                      indeterminate={!allSelected && someSelected}
                      onCheckedChange={(checked) =>
                        toggleAll(checked === true)
                      }
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      column.align === "end" && "text-end",
                      column.className
                    )}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: skeletonRows }, (_, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are generated from a count and never reordered
                    <TableRow key={`skeleton-${index}`}>
                      {selectable && (
                        <TableCell>
                          <Skeleton className="size-4 rounded-[4px]" />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.id}>
                          <Skeleton className="h-3 w-full max-w-32" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : rows.map((row, index) => {
                    const key = rowKey(row, index)
                    const isSelected = selected.has(key)
                    return (
                      <TableRow
                        key={key}
                        data-state={isSelected ? "selected" : undefined}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        className={cn(onRowClick && "cursor-pointer")}
                      >
                        {selectable && (
                          <TableCell
                            // The checkbox is its own target — without this the
                            // click would also fire the row's onClick and
                            // navigate away while you were only selecting.
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Checkbox
                              aria-label="Select row"
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                toggleOne(key, checked === true)
                              }
                            />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            className={cn(
                              column.align === "end" && "text-end",
                              column.className
                            )}
                          >
                            {column.cell(row, index)}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
            </TableBody>
          </Table>

          {showEmpty && (
            <div
              data-slot="list-page-empty"
              className="text-muted-foreground flex flex-col items-center justify-center gap-1 px-6 py-14 text-center text-sm"
            >
              {empty ?? "Nothing to show yet."}
            </div>
          )}
        </div>

        {(totalLabel != null || onPageChange) && (
          <div
            data-slot="list-page-pagination"
            className="flex flex-wrap items-center justify-between gap-2 pt-3"
          >
            <span className="text-muted-foreground text-xs">{totalLabel}</span>
            {onPageChange && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {page} / {Math.max(pageCount, 1)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  )
}

export { ListPage }
