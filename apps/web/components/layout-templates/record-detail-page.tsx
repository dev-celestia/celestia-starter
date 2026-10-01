"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@celestia-project/ui/primitive/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui/primitive/tabs"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export interface RecordDetailTab {
  id: string
  label: string
  count?: number
}

export interface RecordDetailMeta {
  id: string
  label: string
  value: React.ReactNode
}

export interface RecordDetailPageProps extends Omit<
  PageShellProps,
  "children" | "title" | "description"
> {
  /** Primary identifier — a person, an order, an issue. */
  name: string
  /** Supporting line under the name. */
  subtitle?: React.ReactNode
  /** Status badge, rendered beside the name. */
  status?: React.ReactNode
  avatarFallback?: string
  /** Replace the default letter avatar with a mark. */
  avatar?: React.ReactNode
  /** Trailing header actions. */
  actions?: React.ReactNode
  tabs?: RecordDetailTab[]
  defaultTab?: string
  /** Metadata rail shown beside the body from `lg` up. */
  metadata?: RecordDetailMeta[]
  /** Body of the first tab. */
  children?: React.ReactNode
}

/**
 * The record detail screen: an identity header over a tabbed body with a
 * metadata rail.
 *
 * The header is hand-rolled instead of delegated to `PageShell`'s `title` slot
 * because a record header carries three things a page title does not — an
 * avatar, a status badge and a subtitle that is itself markup. Forcing that
 * through `title`/`description` would mean either stringifying the badge or
 * teaching `PageShell` about records.
 */
function RecordDetailPage({
  name,
  subtitle,
  status,
  avatarFallback,
  avatar,
  actions,
  tabs,
  defaultTab,
  metadata,
  children,
  ...shellProps
}: RecordDetailPageProps) {
  const firstTab = tabs?.[0]?.id
  const [activeTab, setActiveTab] = React.useState(defaultTab ?? firstTab ?? "")

  return (
    <PageShell {...shellProps}>
      <div
        data-slot="record-detail-page"
        className="flex min-h-0 flex-1 flex-col gap-5"
      >
        <header className="flex flex-wrap items-start gap-4">
          {avatar ?? (
            <Avatar size="lg" className="size-12">
              <AvatarFallback>
                {avatarFallback ?? name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground">
                {name}
              </h1>
              {status}
            </div>
            {subtitle && (
              <div className="text-xs text-muted-foreground">{subtitle}</div>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>

        {tabs && tabs.length > 0 && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="min-h-0 flex-1"
          >
            <TabsList variant="line" className="shrink-0">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                  {tab.count != null && (
                    <span className="text-muted-foreground tabular-nums">
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="min-h-0">
              <div className="flex flex-col gap-5 pt-4 lg:flex-row">
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  {children}
                </div>
                {metadata && metadata.length > 0 && (
                  <aside className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 lg:w-64">
                    {metadata.map((item) => (
                      <div key={item.id} className="flex flex-col gap-0.5">
                        <span className="text-3xs font-medium tracking-wide text-muted-foreground uppercase">
                          {item.label}
                        </span>
                        <span className="text-xs break-words text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </aside>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {(!tabs || tabs.length === 0) && (
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
            {metadata && metadata.length > 0 && (
              <aside className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 lg:w-64">
                {metadata.map((item) => (
                  <div key={item.id} className="flex flex-col gap-0.5">
                    <span className="text-3xs font-medium tracking-wide text-muted-foreground uppercase">
                      {item.label}
                    </span>
                    <span className="text-xs break-words text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </aside>
            )}
          </div>
        )}
      </div>
    </PageShell>
  )
}

export { RecordDetailPage }
