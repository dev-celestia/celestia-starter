"use client"

import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Row density, as a first-class choice.
 *
 * The base sets `p-2` — 8px on both axes. Dense data tables want 6px of vertical
 * padding while keeping the 8px horizontal, and the app wrote `py-1.5` at 31 of
 * its 48 cells to get it. That is a majority but not a mandate: the other 17 are
 * happy at `p-2`, so this is a step and not a correction to the base.
 *
 * Only the vertical axis moves. `p-2` already supplies the horizontal, so `sm` is
 * a height step and nothing else — the same shape as Badge's `size="sm"` (`h-4`)
 * and Button's `md` (one height step over `sm`).
 *
 * The base string is unchanged from the literal it replaced; only the axis was
 * extracted, so a cell that does not ask for `sm` renders exactly as before.
 */
const tableCellVariants = cva(
  "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0",
  {
    variants: {
      size: {
        default: "",
        sm: "py-1.5",
      },
    },
    defaultVariants: { size: "default" },
  }
)

function TableCell({
  className,
  mono = false,
  size = "default",
  ...props
}: React.ComponentProps<"td"> & {
  /** Render the cell in the monospace stack — for ids, hashes, tokens, ports. */
  mono?: boolean
} & VariantProps<typeof tableCellVariants>) {
  return (
    <td
      data-slot="table-cell"
      data-mono={mono || undefined}
      className={cn(tableCellVariants({ size }), mono && "font-mono", className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
