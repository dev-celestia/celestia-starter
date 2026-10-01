"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@celestia-project/ui/primitive/avatar"
import { Badge } from "@celestia-project/ui/primitive/badge"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export type TeamMemberStatus = "active" | "invited" | "suspended"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: TeamMemberStatus
  avatarFallback?: string
}

export interface TeamPageProps extends Omit<PageShellProps, "children"> {
  members: TeamMember[]
  /** Invite card rendered in the trailing column. */
  invite?: React.ReactNode
  onMemberClick?: (id: string) => void
}

const statusMap: Record<
  TeamMemberStatus,
  { label: string; variant: "success" | "warning" | "secondary" }
> = {
  active: { label: "Active", variant: "success" },
  invited: { label: "Invited", variant: "warning" },
  suspended: { label: "Suspended", variant: "secondary" },
}

/**
 * The team directory: a roster of members beside an invite panel.
 *
 * The invite panel is a slot rather than a built-in form, because an invite is
 * where a product's rules live — seat limits, domain allow-lists, role
 * defaults. A layout that guessed at them would be a layout every consumer
 * immediately replaces.
 *
 * The roster's columns are driven by a **container** query, not `sm:`. The role
 * and status columns are fixed widths, so on a `sm:` query they key off the
 * viewport: a wide viewport hosting a narrow roster — the docs preview, or any
 * page with a rail beside it — keeps both fixed columns and collapses the
 * `1fr` member column to the avatar's width, which hides every name. Asking the
 * card how wide it actually is drops the role column instead, which is the
 * trade a reader wants.
 */
function TeamPage({
  members,
  invite,
  onMemberClick,
  ...shellProps
}: TeamPageProps) {
  return (
    <PageShell {...shellProps}>
      <div
        data-slot="team-page"
        className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row"
      >
        <div className="@container flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border/60 px-4 py-2.5 text-3xs font-medium tracking-wide text-muted-foreground uppercase @md:grid-cols-[minmax(0,1fr)_8rem_7rem]">
            <span>Member</span>
            <span className="hidden @md:block">Role</span>
            <span>Status</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onMemberClick?.(member.id)}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 px-4 py-3 text-start transition-colors last:border-b-0 hover:bg-muted/40 @md:grid-cols-[minmax(0,1fr)_8rem_7rem]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {member.avatarFallback ?? member.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-medium text-foreground">
                      {member.name}
                    </span>
                    <span className="truncate text-3xs text-muted-foreground">
                      {member.email}
                    </span>
                  </span>
                </span>

                <span className="hidden truncate text-xs text-muted-foreground @md:block">
                  {member.role}
                </span>

                <span className="flex justify-end @md:justify-start">
                  <Badge variant={statusMap[member.status].variant}>
                    {statusMap[member.status].label}
                  </Badge>
                </span>
              </button>
            ))}

            {members.length === 0 && (
              <div className="px-6 py-14 text-center text-sm text-muted-foreground">
                No members yet.
              </div>
            )}
          </div>
        </div>

        {invite && (
          <aside
            data-slot="team-page-invite"
            className="flex w-full shrink-0 flex-col gap-4 self-start rounded-xl border border-border/70 bg-card p-5 lg:w-80"
          >
            {invite}
          </aside>
        )}
      </div>
    </PageShell>
  )
}

export { TeamPage }
