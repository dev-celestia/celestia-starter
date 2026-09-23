import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../primitive/avatar"
import { Tabs, TabsList, TabsTrigger } from "../primitive/tabs"

export interface ProfileMetaItem {
  id: string
  icon?: React.ReactNode
  label: React.ReactNode
}

export interface ProfileStat {
  id: string
  label: React.ReactNode
  value: React.ReactNode
}

export interface ProfileTab {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  /** Optional trailing count — posts, followers, open items. */
  count?: number
}

export interface ProfilePageProps extends React.ComponentProps<"div"> {
  name: string
  /** Secondary line under the name — handle, email or id. */
  handle?: React.ReactNode
  /**
   * Role or job title. Named `headline` rather than `title` on purpose: `title`
   * is a real DOM attribute on `<div>` and re-declaring it as `ReactNode`
   * collides with `string` (TS2430). Avoiding the name beats `Omit`-ing the
   * attribute and silently losing the tooltip.
   */
  headline?: React.ReactNode
  bio?: React.ReactNode
  avatarSrc?: string
  avatarFallback?: string
  /** Banner slot behind the avatar. A token gradient stands in when omitted. */
  cover?: React.ReactNode
  /** Badge beside the name — plan tier, role, verification. */
  badge?: React.ReactNode
  meta?: ProfileMetaItem[]
  stats?: ProfileStat[]
  /** Trailing actions in the header. */
  actions?: React.ReactNode
  tabs?: ProfileTab[]
  /** Active tab, when controlled. */
  value?: string
  /** Active tab, when uncontrolled. Defaults to the first tab. */
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Slot under the identity block — a divider, a notice, an inline form. */
  footer?: React.ReactNode
}

/** Two-letter fallback derived from the display name. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/**
 * A profile page: banner, identity block, metadata, headline numbers and an
 * optional tab bar over the content.
 *
 * The tab bar is a real `Tabs` list rather than a row of styled buttons, so
 * arrow-key navigation and the sliding indicator come for free. Content is a
 * sibling of the tab list rather than a `TabsContent` panel — the consumer owns
 * routing between sections, and a panel wrapper would only add a layer that
 * fights their own layout.
 */
function ProfilePage({
  name,
  handle,
  headline,
  bio,
  avatarSrc,
  avatarFallback,
  cover,
  badge,
  meta,
  stats,
  actions,
  tabs,
  value,
  defaultValue,
  onValueChange,
  footer,
  className,
  children,
  ...props
}: ProfilePageProps) {
  return (
    <div
      data-slot="profile-page"
      className={cn("bg-background flex flex-col", className)}
      {...props}
    >
      <div
        data-slot="profile-page-cover"
        className={cn(
          "bg-muted/40 relative h-32 shrink-0 overflow-hidden sm:h-40",
          !cover && "from-primary/15 via-muted/40 to-muted/10 bg-gradient-to-br"
        )}
      >
        {cover}
      </div>

      <div
        data-slot="profile-page-header"
        className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 pb-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div
            data-slot="profile-page-identity"
            className="flex min-w-0 items-end gap-4"
          >
            {/* Sized by class rather than `size="lg"`: Avatar's
                `data-[size=lg]:size-10` carries attribute-selector specificity,
                so it would beat a plain `size-20` and pin the avatar at 40px. */}
            <Avatar className="-mt-8 size-16 shrink-0 ring-4 ring-background sm:-mt-10 sm:size-20">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
              <AvatarFallback>
                {avatarFallback ?? initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-0.5 pb-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="font-heading text-foreground truncate text-lg font-semibold tracking-tight">
                  {name}
                </h1>
                {badge}
              </div>
              {headline && (
                <p className="text-muted-foreground text-xs">{headline}</p>
              )}
              {handle && (
                <p className="text-muted-foreground truncate text-xs">
                  {handle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>

        {bio && (
          <p className="text-muted-foreground max-w-2xl text-xs/relaxed">
            {bio}
          </p>
        )}

        {meta && meta.length > 0 && (
          <div
            data-slot="profile-page-meta"
            className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs"
          >
            {meta.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1.5">
                {item.icon && <span className="[&_svg]:size-3.5">{item.icon}</span>}
                {item.label}
              </span>
            ))}
          </div>
        )}

        {stats && stats.length > 0 && (
          <div
            data-slot="profile-page-stats"
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {stats.map((stat) => (
              <div key={stat.id} className="flex items-baseline gap-1.5">
                <span className="font-heading text-foreground text-sm font-semibold tabular-nums">
                  {stat.value}
                </span>
                <span className="text-muted-foreground text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {footer}
      </div>

      {tabs && tabs.length > 0 && (
        <Tabs
          data-slot="profile-page-tabs"
          value={value}
          defaultValue={defaultValue ?? tabs[0]?.id}
          onValueChange={(next) => onValueChange?.(String(next))}
          className="gap-0"
        >
          <div className="px-6">
            <div className="mx-auto w-full max-w-5xl">
              {/* `line` draws its own bottom rule, so the divider spans the
                  content column instead of the viewport.

                  No height here on purpose. `TabsList` sets its horizontal
                  height with `group-data-[orientation=horizontal]/tabs:h-8`,
                  and a plain `h-*` utility cannot override that: tailwind-merge
                  will not dedupe across variant scopes, and the variant
                  selector (two class selectors) outranks a single class. A
                  `h-9` here compiles to a dead rule. The bar is 32px, which is
                  the package's standard tab height — matching it is the point. */}
              <TabsList variant="line" className="w-full justify-start">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-none gap-1.5 px-3"
                  >
                    {tab.icon}
                    {tab.label}
                    {typeof tab.count === "number" && (
                      <span className="text-muted-foreground tabular-nums">
                        {tab.count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </Tabs>
      )}

      <div
        data-slot="profile-page-content"
        className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-6 py-5"
      >
        {children}
      </div>
    </div>
  )
}

export { ProfilePage }
