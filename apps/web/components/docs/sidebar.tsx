"use client"

import * as React from "react"
import { BookOpenIcon, SparkleIcon, StackIcon } from "@phosphor-icons/react"
import type { NavGroup } from "@/lib/docs"
import { NavSidebar, type NavSidebarGroup } from "@/components/shared/nav-sidebar"

export interface DocsSidebarProps {
  groups: NavGroup[]
  onSelect?: () => void
}

function getGroupIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes("component") || n.includes("ai")) return SparkleIcon
  if (n.includes("package") || n.includes("architecture")) return StackIcon
  return BookOpenIcon
}

export function DocsSidebar({ groups, onSelect }: DocsSidebarProps) {
  const sidebarGroups: NavSidebarGroup[] = React.useMemo(() => {
    return groups.map((g) => ({
      id: g.name.toLowerCase().replace(/\s+/g, "-"),
      name: g.name,
      icon: getGroupIcon(g.name),
      items: g.items.map((item) => ({
        id: item.slug || item.href,
        title: item.title,
        href: item.href,
        slug: item.slug,
        description: item.description,
      })),
    }))
  }, [groups])

  return (
    <NavSidebar
      groups={sidebarGroups}
      searchPlaceholder="Filter docs pages..."
      onSelectItem={() => onSelect?.()}
    />
  )
}
