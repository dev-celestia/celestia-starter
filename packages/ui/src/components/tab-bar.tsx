"use client"

import * as React from "react"
import { XIcon, PlusIcon } from "@phosphor-icons/react"
import { cn } from "../lib/utils"
import { Button } from "./button"

export interface TabItem {
  id: string
  /** Primary label text or node for the tab */
  label?: React.ReactNode
  /** Backward-compatible alias for label */
  name?: string
  /** Optional icon rendered before the label */
  icon?: React.ReactNode
  /** Optional HTTP method or custom protocol badge (e.g. GET, POST, WS, GQL) */
  method?: string
  /** Optional badge or counter (e.g. count, status tag) */
  badge?: React.ReactNode
  /** Indicates unsaved/modified state (shows a dot indicator that reveals close icon on hover) */
  isDirty?: boolean
  /** Whether this specific tab is disabled */
  disabled?: boolean
  /** Explicitly allow or disallow closing this tab */
  closable?: boolean
  /** Native tooltip or title attribute */
  title?: string
  /** Custom class for this individual tab */
  className?: string
  /** Arbitrary metadata */
  data?: Record<string, unknown>
}

export type TabBarVariant = "default" | "chrome" | "pills" | "underline" | "ghost"
export type TabBarSize = "sm" | "default" | "lg"

export interface TabBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Array of tab items */
  tabs: TabItem[]
  /** ID of the currently active tab */
  activeTabId: string | null
  /** Callback fired when a tab is selected */
  onSelectTab: (tabId: string) => void
  /** Callback fired when a tab's close button is clicked */
  onRemoveTab?: (tabId: string) => void
  /** Callback fired when the new tab button is clicked */
  onAddTab?: () => void
  /** Label for the add tab button (accessible / optional visible) */
  addTabLabel?: string
  /** Custom icon for the add tab button */
  addTabIcon?: React.ReactNode
  /** Explicitly show or hide the add tab button */
  showAddTab?: boolean
  /** Visual style variant */
  variant?: TabBarVariant
  /** Size variant */
  size?: TabBarSize
  /** Global override for whether tabs can be closed */
  canClose?: boolean
  /** Custom content rendered before the tabs (e.g. workspace selector, back button) */
  leadingContent?: React.ReactNode
  /** Custom content rendered after the tabs (e.g. actions, view switcher, options) */
  trailingContent?: React.ReactNode
  /** Maximum width for tab labels before truncating */
  maxTabWidth?: number | string
  /** Additional classes for all tab items */
  tabClassName?: string
  /** Additional classes for the active tab item */
  activeTabClassName?: string
}

const METHOD_COLOR_MAP: Record<string, { badge: string; text: string }> = {
  GET: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  POST: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  PUT: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  PATCH: {
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  DELETE: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  OPTIONS: {
    badge: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    text: "text-teal-600 dark:text-teal-400",
  },
  HEAD: {
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  WS: {
    badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  GQL: {
    badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    text: "text-pink-600 dark:text-pink-400",
  },
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onRemoveTab,
  onAddTab,
  addTabLabel = "New tab",
  addTabIcon,
  showAddTab,
  variant = "default",
  size = "default",
  canClose,
  leadingContent,
  trailingContent,
  maxTabWidth = 180,
  className,
  tabClassName,
  activeTabClassName,
  ...props
}: Readonly<TabBarProps>) {
  const shouldShowAdd = showAddTab ?? Boolean(onAddTab)

  const containerVariantClasses: Record<TabBarVariant, string> = {
    default: "bg-muted/30 border-b border-border/70 p-1 gap-1",
    chrome: "bg-muted/50 border-b border-border/70 pt-1 px-1 gap-0.5",
    pills: "bg-muted/40 p-1 rounded-xl border border-border/50 gap-1",
    underline: "border-b border-border gap-2 px-1",
    ghost: "p-0.5 gap-1",
  }

  const scrollRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "group/tabbar flex items-center w-full min-w-0 select-none",
        containerVariantClasses[variant],
        className
      )}
      {...props}
    >
      {/* Leading extra content */}
      {leadingContent && (
        <div className="flex items-center shrink-0 mr-1">{leadingContent}</div>
      )}

      {/* Tabs scroll area */}
      <div
        ref={scrollRef}
        className="flex items-center flex-1 min-w-0 overflow-x-auto no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id
            const isTabClosable =
              tab.closable ??
              (canClose !== undefined ? canClose : Boolean(onRemoveTab) && tabs.length > 1)

            return (
              <TabBarItem
                key={tab.id}
                tab={tab}
                isActive={isActive}
                variant={variant}
                size={size}
                canClose={isTabClosable}
                maxTabWidth={maxTabWidth}
                className={cn(tabClassName, isActive && activeTabClassName, tab.className)}
                onClick={() => !tab.disabled && onSelectTab(tab.id)}
                onClose={
                  onRemoveTab
                    ? (e) => {
                        e.stopPropagation()
                        onRemoveTab(tab.id)
                      }
                    : undefined
                }
              />
            )
          })}
        </div>

        {/* Add Tab Button */}
        {shouldShowAdd && onAddTab && (
          <div className="flex items-center shrink-0 ml-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onAddTab}
              title={addTabLabel}
              aria-label={addTabLabel}
              className={cn(
                "h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors shrink-0",
                size === "sm" && "h-5 w-5",
                size === "lg" && "h-7 w-7"
              )}
            >
              {addTabIcon ?? <PlusIcon className="size-3.5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Trailing extra content */}
      {trailingContent && (
        <div className="flex items-center shrink-0 ml-1.5 pl-1 border-l border-border/40">
          {trailingContent}
        </div>
      )}
    </div>
  )
}

export interface TabBarItemProps {
  tab: TabItem
  isActive: boolean
  variant?: TabBarVariant
  size?: TabBarSize
  canClose?: boolean
  maxTabWidth?: number | string
  className?: string
  onClick: () => void
  onClose?: (e: React.MouseEvent) => void
}

export function TabBarItem({
  tab,
  isActive,
  variant = "default",
  size = "default",
  canClose = true,
  maxTabWidth = 180,
  className,
  onClick,
  onClose,
}: Readonly<TabBarItemProps>) {
  const methodUpper = tab.method?.toUpperCase()
  const methodInfo = methodUpper ? METHOD_COLOR_MAP[methodUpper] : undefined
  const displayLabel = tab.label ?? tab.name ?? tab.id

  // Handle middle click (auxclick) to close tab if supported
  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button === 1 && canClose && onClose && !tab.disabled) {
      e.preventDefault()
      e.stopPropagation()
      onClose(e)
    }
  }

  // Handle keyboard activation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !tab.disabled) {
      e.preventDefault()
      onClick()
    }
  }

  // Size specific styling
  const sizeClasses: Record<TabBarSize, { item: string; text: string; icon: string; close: string }> = {
    sm: {
      item: "h-6 px-2 py-0 text-xs gap-1.5",
      text: "text-[11px]",
      icon: "size-3",
      close: "size-3",
    },
    default: {
      item: "h-7.5 px-2.5 py-1 text-xs gap-2",
      text: "text-xs",
      icon: "size-3.5",
      close: "size-3.5",
    },
    lg: {
      item: "h-9 px-3 py-1.5 text-sm gap-2.5",
      text: "text-sm",
      icon: "size-4",
      close: "size-4",
    },
  }

  // Variant specific item styling
  const variantItemClasses: Record<TabBarVariant, string> = {
    default: cn(
      "rounded-lg border transition-all duration-150",
      isActive
        ? "bg-background text-foreground border-border/80 shadow-xs font-medium"
        : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    ),
    chrome: cn(
      "rounded-t-lg border-t border-x transition-all duration-150 relative",
      isActive
        ? "bg-background text-foreground border-border/80 shadow-xs font-medium -mb-px z-10 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary before:rounded-t"
        : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    ),
    pills: cn(
      "rounded-lg transition-all duration-150",
      isActive
        ? "bg-background text-foreground shadow-xs font-medium"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    ),
    underline: cn(
      "rounded-none border-b-2 transition-all duration-150 pb-1.5 pt-1",
      isActive
        ? "border-primary text-foreground font-medium"
        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
    ),
    ghost: cn(
      "rounded-md transition-all duration-150",
      isActive
        ? "bg-accent text-accent-foreground font-medium"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    ),
  }

  return (
    <div
      role="tab"
      aria-selected={isActive}
      aria-disabled={tab.disabled}
      tabIndex={tab.disabled ? -1 : isActive ? 0 : -1}
      title={tab.title ?? (typeof displayLabel === "string" ? displayLabel : undefined)}
      onClick={tab.disabled ? undefined : onClick}
      onAuxClick={handleAuxClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group/tab flex items-center justify-between shrink-0 cursor-pointer min-w-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
        sizeClasses[size].item,
        variantItemClasses[variant],
        tab.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
        {/* Leading Icon */}
        {tab.icon && (
          <span className={cn("shrink-0 flex items-center justify-center", sizeClasses[size].icon)}>
            {tab.icon}
          </span>
        )}

        {/* Method Badge (e.g. GET, POST, or custom) */}
        {tab.method && (
          <span
            className={cn(
              "font-mono font-semibold uppercase shrink-0 px-1 py-0.2 rounded text-[9px] leading-tight border",
              methodInfo
                ? methodInfo.badge
                : "bg-muted text-muted-foreground border-border/50"
            )}
          >
            {tab.method}
          </span>
        )}

        {/* Label */}
        <span
          className={cn("truncate font-medium", sizeClasses[size].text)}
          style={{ maxWidth: typeof maxTabWidth === "number" ? `${maxTabWidth}px` : maxTabWidth }}
        >
          {displayLabel}
        </span>

        {/* Optional Badge / Counter */}
        {tab.badge && (
          <span className="shrink-0 inline-flex items-center justify-center">
            {tab.badge}
          </span>
        )}
      </div>

      {/* Dirty indicator or Close button */}
      {(canClose && onClose) || tab.isDirty ? (
        <div className="shrink-0 flex items-center ml-1">
          {tab.isDirty && (
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-primary shrink-0 transition-opacity",
                canClose && onClose && "group-hover/tab:hidden"
              )}
            />
          )}

          {canClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close tab"
              aria-label="Close tab"
              className={cn(
                "rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                tab.isDirty ? "hidden group-hover/tab:inline-flex" : "inline-flex opacity-70 group-hover/tab:opacity-100"
              )}
            >
              <XIcon className={sizeClasses[size].close} />
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
