"use client"

import * as React from "react"

import { Button } from "../primitive/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../primitive/card"
import { Progress } from "../primitive/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../primitive/table"
import { PageShell, type PageShellProps } from "./page-shell"

export interface BillingPlan {
  name: string
  /** The figure itself — pass a string, or a node when you need a currency mark. */
  price: React.ReactNode
  /** e.g. `"per month"`. */
  interval?: string
  description?: React.ReactNode
  features?: React.ReactNode[]
  badge?: React.ReactNode
}

export interface BillingUsage {
  id: string
  label: React.ReactNode
  used: number
  limit: number
  /** Overrides the default `used / limit` caption. */
  format?: (used: number, limit: number) => React.ReactNode
}

export interface BillingInvoice {
  id: string
  date: React.ReactNode
  amount: React.ReactNode
  status?: React.ReactNode
}

export interface BillingPageProps extends Omit<PageShellProps, "children"> {
  plan?: BillingPlan
  usage?: BillingUsage[]
  paymentMethod?: React.ReactNode
  invoices?: BillingInvoice[]
  onManagePlan?: () => void
  onUpdatePayment?: () => void
  /** Replaces the invoice table's empty state. */
  empty?: React.ReactNode
}

/**
 * A dependency-free tick.
 *
 * Layout components in this package never import an icon package — icons arrive
 * as props (`icon?: React.ReactNode`) so the consumer picks the set. A plan's
 * feature list is the one place where a mark is structural rather than
 * decorative, so it is inlined here rather than pushed onto every call site.
 */
function CheckMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="text-primary mt-0.5 size-3 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The billing screen: current plan, usage against limits, payment method and
 * invoice history.
 *
 * Composed on `PageShell` like every other page. Every figure is a prop — the
 * component does not know your pricing, and it deliberately does not compute a
 * "renews on" date or a prorated amount, because getting those subtly wrong is
 * worse than not showing them.
 */
function BillingPage({
  plan,
  usage,
  paymentMethod,
  invoices,
  onManagePlan,
  onUpdatePayment,
  empty,
  ...shellProps
}: BillingPageProps) {
  return (
    <PageShell {...shellProps}>
      <div
        data-slot="billing-page"
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {plan && (
              <Card data-slot="billing-page-plan">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{plan.name}</CardTitle>
                        {plan.badge}
                      </div>
                      {plan.description && (
                        <CardDescription>{plan.description}</CardDescription>
                      )}
                    </div>
                    {onManagePlan && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onManagePlan}
                      >
                        Manage plan
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading text-foreground text-2xl font-semibold tracking-tight tabular-nums">
                      {plan.price}
                    </span>
                    {plan.interval && (
                      <span className="text-muted-foreground text-xs">
                        {plan.interval}
                      </span>
                    )}
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <ul
                      data-slot="billing-page-features"
                      className="flex flex-col gap-1.5"
                    >
                      {plan.features.map((feature, index) => (
                        // `feature` is a `ReactNode`, so it cannot serve as the
                        // key — two entries may render identically. The list is
                        // static and never reordered, so an index-derived key is
                        // stable here.
                        <li
                          // biome-ignore lint/suspicious/noArrayIndexKey: ReactNode entries cannot serve as keys, and the list is static
                          key={`billing-feature-${index}`}
                          className="flex items-start gap-2 text-xs"
                        >
                          <CheckMark />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            {usage && usage.length > 0 && (
              <Card data-slot="billing-page-usage">
                <CardHeader>
                  <CardTitle>Usage</CardTitle>
                  <CardDescription>Current billing period.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {usage.map((item) => {
                    // Clamp the bar at 100 — over-limit is worth showing in the
                    // caption but a 140%-wide bar would just overflow the track.
                    const percent =
                      item.limit > 0
                        ? Math.min(
                            100,
                            Math.round((item.used / item.limit) * 100)
                          )
                        : 0
                    return (
                      <div
                        key={item.id}
                        data-slot="billing-page-meter"
                        className="flex flex-col gap-1.5"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-medium">
                            {item.label}
                          </span>
                          <span className="text-muted-foreground text-xs tabular-nums">
                            {item.format
                              ? item.format(item.used, item.limit)
                              : `${item.used} / ${item.limit}`}
                          </span>
                        </div>
                        <Progress value={percent} />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {paymentMethod != null && (
              <Card data-slot="billing-page-payment">
                <CardHeader>
                  <CardTitle>Payment method</CardTitle>
                  <CardDescription>Used for every renewal.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {paymentMethod}
                  {onUpdatePayment && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start"
                      onClick={onUpdatePayment}
                    >
                      Update
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {invoices && (
          <Card data-slot="billing-page-invoices">
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Receipts for every payment.</CardDescription>
            </CardHeader>
            {invoices.length > 0 ? (
              // The table is a direct child of Card rather than of CardContent
              // so the row rules run edge to edge. The first and last cells then
              // take the card's own gutter (`--card-spacing`) as their padding —
              // Tailwind emits `ps-*`/`pe-*` after `px-*`, so this correctly
              // overrides TableHead's base `px-2` and the column aligns with the
              // card title above it.
              // Deliberate override: nothing in the system selects on
              // `[data-slot="table"]` (verified), and the container keeps its
              // own `table-container` slot, so the primitive loses nothing.
              <Table data-slot="billing-page-invoice-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="ps-(--card-spacing)">Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pe-(--card-spacing) text-end">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell
                        className="ps-(--card-spacing) font-mono"
                        size="sm"
                      >
                        {invoice.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground" size="sm">
                        {invoice.date}
                      </TableCell>
                      <TableCell size="sm">{invoice.status}</TableCell>
                      <TableCell
                        className="pe-(--card-spacing) text-end tabular-nums"
                        size="sm"
                      >
                        {invoice.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent>
                <div
                  data-slot="billing-page-empty"
                  className="text-muted-foreground py-8 text-center text-sm"
                >
                  {empty ?? "No invoices yet."}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </PageShell>
  )
}

export { BillingPage }
