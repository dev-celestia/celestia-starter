"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CaretDownIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react"
import { Badge, Button } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

export interface NavSidebarItem {
  id: string
  title: string
  href?: string
  slug?: string
  description?: string
  badge?: string
}

export interface NavSidebarGroup {
  id: string
  name: string
  icon?: React.ComponentType<{ className?: string }>
  items: NavSidebarItem[]
}

export interface NavSidebarProps {
  groups: NavSidebarGroup[]
  activeItemId?: string
  activeGroupId?: string
  defaultFolded?: boolean
  onSelectItem?: (item: NavSidebarItem) => void
  onSelectGroup?: (groupId: string) => void
  searchPlaceholder?: string
  className?: string
  isSticky?: boolean
  stickyTopClass?: string
  maxHeightClass?: string
}

export function NavSidebar({
  groups,
  activeItemId,
  activeGroupId,
  defaultFolded = true,
  onSelectItem,
  onSelectGroup,
  searchPlaceholder = "Filter...",
  className,
  isSticky = false,
  stickyTopClass = "top-20",
  maxHeightClass = "max-h-[calc(100vh-5.5rem)]",
}: NavSidebarProps) {
  const pathname = usePathname()
  const [filter, setFilter] = React.useState("")
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({})

  // Automatically keep the group that contains the current active item or activeGroupId open
  React.useEffect(() => {
    const updated: Record<string, boolean> = {}
    groups.forEach((group) => {
      const containsActiveItem = group.items.some(
        (item) =>
          (activeItemId && item.id === activeItemId) ||
          (item.href && pathname === item.href)
      )
      if (containsActiveItem || activeGroupId === group.id) {
        updated[group.id] = true
      }
    })
    if (Object.keys(updated).length > 0) {
      setOpenGroups((prev) => ({ ...prev, ...updated }))
    }
  }, [groups, activeGroupId, activeItemId, pathname])

  const toggleGroup = (groupId: string) => {
    onSelectGroup?.(groupId)
    setOpenGroups((prev) => {
      const currentIsOpen = prev[groupId] ?? !defaultFolded
      return {
        ...prev,
        [groupId]: !currentIsOpen,
      }
    })
  }

  // Filter groups and items
  const filteredGroups = React.useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return groups

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q) ||
            (item.slug && item.slug.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q))
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, filter])

  return (
    <aside
      className={cn(
        "w-full flex flex-col min-h-0",
        isSticky && `sticky ${stickyTopClass} self-start ${maxHeightClass} overflow-hidden`,
        className
      )}
    >
      {/* Quick Search Filter */}
      <div className="pb-3 px-1 shrink-0">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-2.5 size-3.5 text-muted-foreground/70 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 w-full rounded-lg border border-border/70 bg-muted/30 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-background transition-all"
          />
          {filter && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setFilter("")}
              className="absolute right-1.5 size-5 text-muted-foreground hover:text-foreground"
              aria-label="Clear filter"
            >
              <XIcon className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Groups List */}
      <nav className="flex flex-col gap-4 overflow-y-auto flex-1 min-h-0 pr-2 pb-8 [scrollbar-width:thin]">
        {filteredGroups.map((group) => {
          // Default folded unless filtering, explicitly opened/closed, or contains active route
          const isOpen = Boolean(filter) || (openGroups[group.id] ?? !defaultFolded)
          const isCollapsed = !isOpen
          const isGroupActive = activeGroupId === group.id
          const GroupIcon = group.icon

          return (
            <div key={group.id} className="flex flex-col gap-1">
              {/* Group Accordion Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground cursor-pointer text-left group",
                  isGroupActive && "text-foreground"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {GroupIcon && (
                    <GroupIcon className={cn("size-3.5 shrink-0 text-muted-foreground/80 group-hover:text-foreground", isGroupActive && "text-primary")} />
                  )}
                  <span className="truncate text-[11px]">{group.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="secondary" className="font-mono text-[9px] px-1 py-0 h-4">
                    {group.items.length}
                  </Badge>
                  {isCollapsed ? (
                    <CaretRightIcon className="size-3 text-muted-foreground/60 group-hover:text-foreground transition-transform" />
                  ) : (
                    <CaretDownIcon className="size-3 text-muted-foreground/60 group-hover:text-foreground transition-transform" />
                  )}
                </div>
              </button>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5 ml-2 border-l border-border/50 pl-2 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {group.items.map((item) => {
                    const isItemActive = activeItemId
                      ? activeItemId === item.id
                      : item.href
                        ? pathname === item.href
                        : false

                    const content = (
                      <div
                        className={cn(
                          "relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.98] select-none",
                          isItemActive
                            ? "bg-primary/10 text-primary shadow-xs font-semibold"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                      >
                        {isItemActive && (
                          <span
                            aria-hidden
                            className="bg-primary absolute inset-y-1.5 -left-2 w-0.5 rounded-full animate-in fade-in duration-200"
                          />
                        )}
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 h-3.5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )

                    if (item.href && !item.href.startsWith("#")) {
                      return (
                        <Link
                          key={item.id || item.href}
                          href={item.href}
                          onClick={() => onSelectItem?.(item)}
                          className="block"
                        >
                          {content}
                        </Link>
                      )
                    }

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectItem?.(item)}
                        className="block w-full text-left cursor-pointer"
                      >
                        {content}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
