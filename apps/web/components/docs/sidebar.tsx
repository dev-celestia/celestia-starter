"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CaretDownIcon,
  CaretRightIcon,
  BookOpenIcon,
  CubeIcon,
  SparkleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"
import type { NavGroup } from "@/lib/docs"
import { cn } from "@celestia-project/ui/lib/utils"

export interface DocsSidebarProps {
  groups: NavGroup[]
  onSelect?: () => void
}

export function DocsSidebar({ groups, onSelect }: DocsSidebarProps) {
  const pathname = usePathname()
  const [filter, setFilter] = React.useState("")
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({})

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  // Filter items based on local search input
  const filteredGroups = React.useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return groups

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.title.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, filter])

  return (
    <aside className="w-full h-full flex flex-col min-h-0">
      {/* Quick Filter Search */}
      <div className="pb-3 px-1 shrink-0">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-2.5 size-3.5 text-muted-foreground/70 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter pages..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 w-full rounded-lg border border-border/70 bg-muted/30 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-hidden focus:border-primary/50 focus:bg-background transition-all"
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="absolute right-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Nav Groups List */}
      <nav className="flex flex-col gap-5 overflow-y-auto flex-1 min-h-0 pr-2 pb-8 [scrollbar-width:thin]">
        {filteredGroups.map((group) => {
          const isCollapsed = Boolean(collapsedGroups[group.name]) && !filter

          return (
            <div key={group.name} className="flex flex-col gap-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors cursor-pointer text-left"
              >
                <span>{group.name}</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[9px] rounded-md bg-muted px-1.5 py-0.2 text-muted-foreground">
                    {group.items.length}
                  </span>
                  {isCollapsed ? (
                    <CaretRightIcon className="size-3" />
                  ) : (
                    <CaretDownIcon className="size-3" />
                  )}
                </div>
              </button>

              {/* Items in Group */}
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onSelect}
                        className={cn(
                          "relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.98]",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="bg-primary absolute inset-y-1.5 left-0.5 w-1 rounded-full animate-in fade-in duration-200"
                          />
                        )}
                        <span className="truncate pl-1.5">{item.title}</span>
                      </Link>
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
