"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"

export interface InboxFolder {
  id: string
  label: string
  icon?: React.ReactNode
  /** Unread count shown at the trailing edge. `0` and `undefined` hide it. */
  count?: number
}

export interface InboxMessage {
  id: string
  from: string
  subject: string
  preview: string
  time: string
  unread?: boolean
  starred?: boolean
  avatarFallback?: string
}

export interface InboxPageProps extends React.ComponentProps<"div"> {
  folders: InboxFolder[]
  activeFolderId?: string
  onFolderChange?: (id: string) => void
  messages: InboxMessage[]
  activeMessageId?: string
  onSelectMessage?: (id: string) => void
  /** Toolbar above the message list — search, filters, compose. */
  toolbar?: React.ReactNode
  /** Header of the reading pane. */
  readingHeader?: React.ReactNode
  /** Reading pane body. */
  children?: React.ReactNode
}

/**
 * The three-pane inbox: folder rail, message list, reading pane.
 *
 * The panes collapse in order of how little they are needed — the rail goes
 * first (below `md`), the reading pane second (below `lg`, where the list is
 * already the full width and the pane would starve both). Selection is
 * controlled so the consumer can drive it from a URL.
 */
function InboxPage({
  folders,
  activeFolderId,
  onFolderChange,
  messages,
  activeMessageId,
  onSelectMessage,
  toolbar,
  readingHeader,
  children,
  className,
  ...props
}: InboxPageProps) {
  const active = messages.find((message) => message.id === activeMessageId)

  return (
    <div
      data-slot="inbox-page"
      className={cn("flex min-h-0 w-full flex-1 bg-background", className)}
      {...props}
    >
      <aside
        data-slot="inbox-page-folders"
        className="hidden w-52 shrink-0 flex-col border-e border-border bg-muted/30 p-3 md:flex"
      >
        {folders.map((folder) => {
          const isActive = folder.id === activeFolderId
          return (
            <button
              key={folder.id}
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => onFolderChange?.(folder.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              {folder.icon && (
                <span className="[&_svg]:size-3.5 [&_svg]:shrink-0">
                  {folder.icon}
                </span>
              )}
              <span className="truncate">{folder.label}</span>
              {folder.count ? (
                <span className="ms-auto rounded-full bg-primary px-1.5 text-3xs text-primary-foreground tabular-nums">
                  {folder.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </aside>

      <section
        data-slot="inbox-page-list"
        className="flex w-full min-w-0 shrink-0 flex-col border-e border-border lg:w-80"
      >
        {toolbar && (
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
            {toolbar}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {messages.map((message) => {
            const isActive = message.id === activeMessageId
            return (
              <button
                key={message.id}
                type="button"
                onClick={() => onSelectMessage?.(message.id)}
                className={cn(
                  "flex w-full flex-col gap-1 border-b border-border/60 px-3 py-3 text-start transition-colors",
                  isActive ? "bg-muted/60" : "hover:bg-muted/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-xs text-foreground",
                      message.unread ? "font-semibold" : "font-medium"
                    )}
                  >
                    {message.from}
                  </span>
                  <span className="ms-auto shrink-0 text-3xs text-muted-foreground tabular-nums">
                    {message.time}
                  </span>
                </div>
                <span
                  className={cn(
                    "truncate text-xs",
                    message.unread
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {message.subject}
                </span>
                <span className="line-clamp-1 text-3xs text-muted-foreground">
                  {message.preview}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section
        data-slot="inbox-page-reading"
        className="hidden min-w-0 flex-1 flex-col lg:flex"
      >
        {readingHeader && (
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
            {readingHeader}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {children ?? (
            <p className="text-xs text-muted-foreground">
              {active
                ? `${active.subject} — ${active.preview}`
                : "Select a message to read it."}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export { InboxPage }
