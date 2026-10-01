"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Avatar, AvatarFallback } from "@celestia-project/ui/primitive/avatar"

export interface ChatChannel {
  id: string
  label: string
  icon?: React.ReactNode
  unread?: number
}

/**
 * Named `ChatThreadMessage` rather than `ChatMessage` — the barrel already
 * exports a `ChatMessage` from the `chat-message` composite, and two unrelated
 * types under one name would be ambiguous to import.
 */
export interface ChatThreadMessage {
  id: string
  author: string
  time: string
  body: React.ReactNode
  avatarFallback?: string
  /** Renders the bubble on the trailing edge in the primary tone. */
  own?: boolean
}

export interface ChatMember {
  id: string
  name: string
  role?: string
  avatarFallback?: string
  online?: boolean
}

export interface ChatPageProps extends React.ComponentProps<"div"> {
  channels: ChatChannel[]
  activeChannelId?: string
  onChannelChange?: (id: string) => void
  messages: ChatThreadMessage[]
  /** Channel header — name, topic, member count. */
  header?: React.ReactNode
  /** Composer pinned to the bottom of the thread. */
  composer?: React.ReactNode
  /** Member rail. Hidden below `xl`, where it would crowd the thread. */
  members?: ChatMember[]
}

/**
 * The messaging layout: channel rail, scrolling thread, optional member rail.
 *
 * Messages are passed in already ordered; the component never sorts or groups
 * them. `own` is a flag on the message rather than a comparison against a
 * "current user" prop, because the consumer already knows whose message it is
 * and a second source of truth here would only drift.
 */
function ChatPage({
  channels,
  activeChannelId,
  onChannelChange,
  messages,
  header,
  composer,
  members,
  className,
  ...props
}: ChatPageProps) {
  return (
    <div
      data-slot="chat-page"
      className={cn("flex min-h-0 w-full flex-1 bg-background", className)}
      {...props}
    >
      <aside
        data-slot="chat-page-channels"
        className="hidden w-56 shrink-0 flex-col border-e border-border bg-muted/30 p-3 md:flex"
      >
        <span className="px-2.5 pb-2 text-3xs font-medium tracking-wide text-muted-foreground uppercase">
          Channels
        </span>
        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId
          return (
            <button
              key={channel.id}
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => onChannelChange?.(channel.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              {channel.icon ? (
                <span className="[&_svg]:size-3.5 [&_svg]:shrink-0">
                  {channel.icon}
                </span>
              ) : (
                <span className="text-muted-foreground/70">#</span>
              )}
              <span className="truncate">{channel.label}</span>
              {channel.unread ? (
                <span className="ms-auto rounded-full bg-primary px-1.5 text-3xs text-primary-foreground tabular-nums">
                  {channel.unread}
                </span>
              ) : null}
            </button>
          )
        })}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        {header && (
          <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
            {header}
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              data-own={message.own ? "" : undefined}
              className={cn(
                "flex items-start gap-2.5",
                message.own && "flex-row-reverse"
              )}
            >
              <Avatar size="sm" className="mt-0.5">
                <AvatarFallback>
                  {message.avatarFallback ?? message.author.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "flex max-w-[80%] min-w-0 flex-col gap-1",
                  message.own && "items-end"
                )}
              >
                <span className="flex items-center gap-2 text-3xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {message.author}
                  </span>
                  {message.time}
                </span>
                <div
                  className={cn(
                    "rounded-xl px-3 py-2 text-xs leading-relaxed",
                    message.own
                      ? "rounded-ee-sm bg-primary text-primary-foreground"
                      : "rounded-es-sm bg-muted text-foreground"
                  )}
                >
                  {message.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        {composer && (
          <div className="shrink-0 border-t border-border p-3">{composer}</div>
        )}
      </section>

      {members && members.length > 0 && (
        <aside
          data-slot="chat-page-members"
          className="hidden w-56 shrink-0 flex-col gap-3 border-s border-border p-3 xl:flex"
        >
          <span className="text-3xs font-medium tracking-wide text-muted-foreground uppercase">
            Members
          </span>
          <div className="flex flex-col gap-2.5">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <span className="relative">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {member.avatarFallback ?? member.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  {member.online && (
                    <span className="absolute end-0 bottom-0 size-2 rounded-full border border-background bg-success" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-medium text-foreground">
                    {member.name}
                  </span>
                  {member.role && (
                    <span className="truncate text-3xs text-muted-foreground">
                      {member.role}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}

export { ChatPage }
