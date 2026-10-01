"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui/primitive/table"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export interface InvoiceParty {
  name: string
  /** Address and contact lines, rendered one per line. */
  lines: string[]
}

export interface InvoiceLineItem {
  id: string
  description: string
  /** Supporting line under the description. */
  detail?: string
  quantity: string
  rate: string
  amount: string
}

export interface InvoiceTotal {
  label: string
  value: string
  muted?: boolean
  /** Renders the row as the payable total. */
  strong?: boolean
}

export interface InvoicePageProps extends Omit<PageShellProps, "children"> {
  /** Invoice number, printed in the document header. */
  number: string
  status?: React.ReactNode
  issuedAt: string
  dueAt: string
  from: InvoiceParty
  to: InvoiceParty
  lineItems: InvoiceLineItem[]
  totals: InvoiceTotal[]
  notes?: React.ReactNode
}

/**
 * The invoice document: parties, line items, and totals.
 *
 * Every figure is a pre-formatted string. The component deliberately cannot add
 * up a column — currency, rounding and tax rules belong to the system that
 * issued the invoice, and a layout that recomputes a total is a layout that can
 * disagree with the PDF.
 */
function InvoicePage({
  number,
  status,
  issuedAt,
  dueAt,
  from,
  to,
  lineItems,
  totals,
  notes,
  ...shellProps
}: InvoicePageProps) {
  return (
    <PageShell {...shellProps}>
      <div
        data-slot="invoice-page"
        className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card"
      >
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 p-6">
          <div className="flex flex-col gap-1">
            <span className="text-3xs font-medium tracking-wide text-muted-foreground uppercase">
              Invoice
            </span>
            <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
              {number}
            </span>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            {status}
            <span className="text-3xs text-muted-foreground">
              Issued {issuedAt}
            </span>
            <span className="text-xs font-medium text-foreground">
              Due {dueAt}
            </span>
          </div>
        </header>

        <div className="grid gap-6 border-b border-border/60 p-6 sm:grid-cols-2">
          {[
            { id: "from", label: "From", party: from },
            { id: "to", label: "Billed to", party: to },
          ].map(({ id, label, party }) => (
            <div key={id} className="flex flex-col gap-1.5">
              <span className="text-3xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
              </span>
              <span className="text-xs font-medium text-foreground">
                {party.name}
              </span>
              <div className="flex flex-col text-3xs leading-relaxed text-muted-foreground">
                {party.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Natural height rather than `flex-1`: a document that flexes to fill
            the viewport pushes its totals block up under an overflowing table,
            so the two paint on top of each other. The invoice grows and the
            page scrolls, which is how a document should behave. */}
        <div className="shrink-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="hidden text-end sm:table-cell">
                  Qty
                </TableHead>
                <TableHead className="hidden text-end sm:table-cell">
                  Rate
                </TableHead>
                <TableHead className="text-end">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        {item.description}
                      </span>
                      {item.detail && (
                        <span className="text-3xs text-muted-foreground">
                          {item.detail}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-end text-muted-foreground tabular-nums sm:table-cell">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="hidden text-end text-muted-foreground tabular-nums sm:table-cell">
                    {item.rate}
                  </TableCell>
                  <TableCell className="text-end text-foreground tabular-nums">
                    {item.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end border-t border-border/60 p-6">
          <div className="flex w-full max-w-xs flex-col gap-2">
            {totals.map((total) => (
              <div
                key={total.label}
                className={cn(
                  "flex items-baseline justify-between gap-3",
                  total.strong && "mt-1 border-t border-border/60 pt-2 text-sm"
                )}
              >
                <span
                  className={cn(
                    total.strong
                      ? "font-medium text-foreground"
                      : total.muted
                        ? "text-xs text-muted-foreground"
                        : "text-xs text-foreground"
                  )}
                >
                  {total.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 tabular-nums",
                    total.strong
                      ? "font-heading text-lg font-semibold text-foreground"
                      : total.muted
                        ? "text-xs text-muted-foreground"
                        : "text-xs font-medium text-foreground"
                  )}
                >
                  {total.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {notes && (
          <div className="border-t border-border/60 bg-muted/30 px-6 py-4">
            <span className="text-3xs font-medium tracking-wide text-muted-foreground uppercase">
              Notes
            </span>
            <div className="pt-1 text-xs leading-relaxed text-muted-foreground">
              {notes}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}

export { InvoicePage }
