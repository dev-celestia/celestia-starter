"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Switch } from "@celestia-project/ui/primitive/switch"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export interface Integration {
  id: string
  name: string
  description: string
  category: string
  /** Whether the integration is currently installed. */
  connected?: boolean
  /** Brand mark, rendered at `size-5`. */
  icon?: React.ReactNode
}

export interface IntegrationsPageProps extends Omit<
  PageShellProps,
  "children"
> {
  /** Category chips. Omit to hide the filter row. */
  categories?: string[]
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  integrations: Integration[]
  /**
   * Fired with the integration id and its next state. Named
   * `onConnectionChange` rather than `onToggle` because `React.ComponentProps<"div">`
   * already declares an `onToggle` DOM handler, and the two signatures clash.
   */
  onConnectionChange?: (id: string, connected: boolean) => void
}

/**
 * The integrations directory: category chips over a grid of connectable apps.
 *
 * Toggling is uncontrolled by default — each card keeps its own optimistic
 * state and reports the change upward. Wiring the switch to a controlled prop
 * would make every toggle wait on a round trip, and the connection state here
 * is the *last known* one, not the authoritative one.
 */
function IntegrationsPage({
  categories,
  activeCategory,
  onCategoryChange,
  integrations,
  onConnectionChange,
  ...shellProps
}: IntegrationsPageProps) {
  const [pending, setPending] = React.useState<Record<string, boolean>>({})

  const isConnected = (integration: Integration) =>
    pending[integration.id] ?? integration.connected ?? false

  const handleToggle = (integration: Integration, next: boolean) => {
    setPending((current) => ({ ...current, [integration.id]: next }))
    onConnectionChange?.(integration.id, next)
  }

  return (
    <PageShell {...shellProps}>
      <div
        data-slot="integrations-page"
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => {
              const active = category === activeCategory
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onCategoryChange?.(category)}
                  className={cn(
                    "h-7 rounded-full border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {category}
                </button>
              )
            })}
          </div>
        )}

        <div
          data-slot="integrations-page-grid"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {integrations.map((integration) => {
            const connected = isConnected(integration)
            return (
              <div
                key={integration.id}
                className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
                    {integration.icon ?? integration.name.slice(0, 1)}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-xs font-medium text-foreground">
                      {integration.name}
                    </span>
                    <span className="text-3xs text-muted-foreground">
                      {integration.category}
                    </span>
                  </div>
                  <Switch
                    checked={connected}
                    onCheckedChange={(checked) =>
                      handleToggle(integration, checked)
                    }
                    aria-label={`${connected ? "Disconnect" : "Connect"} ${integration.name}`}
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}

export { IntegrationsPage }
