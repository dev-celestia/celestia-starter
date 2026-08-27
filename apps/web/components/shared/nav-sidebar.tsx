"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CaretDownIcon,
  CaretRightIcon,
  ListIcon,
  XIcon,
} from "@phosphor-icons/react"
import { Badge } from "@celestia-project/ui"
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
  showMobileSubnav?: boolean
}

export function MobileNavSidebar({
  groups,
  activeItemId,
  activeGroupId,
  onSelectItem,
  onSelectGroup,
  className,
  stickyTopClass = "top-14",
}: {
  groups: NavSidebarGroup[]
  activeItemId?: string
  activeGroupId?: string
  onSelectItem?: (item: NavSidebarItem) => void
  onSelectGroup?: (groupId: string) => void
  className?: string
  stickyTopClass?: string
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <div
      className={cn(
        "sticky z-20 w-full border-b border-border/60 bg-background/95 backdrop-blur-md px-4 py-2 flex flex-col shadow-xs lg:hidden",
        stickyTopClass,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Horizontal Category Scroll List */}
        <div className="flex-1 min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex items-center gap-1.5 py-0.5">
          {groups.map((group) => {
            const isGroupActive = activeGroupId === group.id
            const GroupIcon = group.icon
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  onSelectGroup?.(group.id)
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium shrink-0 whitespace-nowrap transition-all cursor-pointer select-none",
                  isGroupActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {GroupIcon && <GroupIcon className="size-3.5 shrink-0" />}
                <span>{group.name}</span>
              </button>
            )
          })}
        </div>

        {/* Menu Drawer Toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer active:scale-95 transition-all"
          aria-label="Toggle navigation list"
        >
          {menuOpen ? <XIcon className="size-4 text-primary" /> : <ListIcon className="size-4" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {menuOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-border/60 max-h-[60vh] overflow-y-auto space-y-3 pb-3 animate-in fade-in-0 duration-200">
          {groups.map((group) => {
            const GroupIcon = group.icon
            return (
              <div key={group.id} className="space-y-1">
                <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {GroupIcon && <GroupIcon className="size-3.5 text-primary" />}
                    <span>{group.name}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[9px] px-1 py-0 h-3.5">
                    {group.items.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {group.items.map((item) => {
                    const isItemActive = activeItemId
                      ? activeItemId === item.id
                      : item.href
                        ? pathname === item.href
                        : false

                    const handleItemClick = () => {
                      onSelectItem?.(item)
                      setMenuOpen(false)
                    }

                    if (item.href && !item.href.startsWith("#")) {
                      return (
                        <Link
                          key={item.id || item.href}
                          href={item.href}
                          onClick={handleItemClick}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                            isItemActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 h-3.5">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      )
                    }

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={handleItemClick}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left w-full cursor-pointer",
                          isItemActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 h-3.5">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function NavSidebar({
  groups,
  activeItemId,
  activeGroupId,
  defaultFolded = true,
  onSelectItem,
  onSelectGroup,
  className,
  isSticky = false,
  stickyTopClass = "top-20",
  maxHeightClass = "max-h-[calc(100vh-5.5rem)]",
  showMobileSubnav = true,
}: NavSidebarProps) {
  const pathname = usePathname()
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

  return (
    <>
      {/* Mobile Version Below Main Navbar */}
      {showMobileSubnav && (
        <MobileNavSidebar
          groups={groups}
          activeItemId={activeItemId}
          activeGroupId={activeGroupId}
          onSelectItem={onSelectItem}
          onSelectGroup={onSelectGroup}
          stickyTopClass="top-14"
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "w-full flex-col min-h-0 hidden lg:flex",
          isSticky && `sticky ${stickyTopClass} self-start ${maxHeightClass} overflow-hidden`,
          className
        )}
      >
        {/* Navigation Groups List */}
        <nav className="flex flex-col gap-4 overflow-y-auto flex-1 min-h-0 pr-2 pb-8 [scrollbar-width:thin]">
          {groups.map((group) => {
            // Default folded unless explicitly opened/closed, or contains active route
            const isOpen = openGroups[group.id] ?? !defaultFolded
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
    </>
  )
}
