"use client"

import * as React from "react"
import {
  BrowsersIcon,
  ChartBarIcon,
  ChatsCircleIcon,
  LockKeyIcon,
  MegaphoneIcon,
  ShoppingCartIcon,
  SquaresFourIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import { NavSidebar, type NavSidebarGroup } from "@/components/shared/nav-sidebar"
import { LAYOUT_CATEGORIES, LAYOUT_DEMO_META, type LayoutCategoryId } from "@/lib/layout-demos"
import { cn } from "@celestia-project/ui/lib/utils"

const CATEGORY_ICONS: Record<LayoutCategoryId, React.ComponentType<{ className?: string }>> = {
  shells: BrowsersIcon,
  auth: LockKeyIcon,
  screens: SquaresFourIcon,
  system: WarningCircleIcon,
  marketing: MegaphoneIcon,
  collab: ChatsCircleIcon,
  data: ChartBarIcon,
  flows: ShoppingCartIcon,
}

export interface LayoutSidebarProps {
  activeId?: string
  activeCategory?: string
  onSelect?: (id: string) => void
  onSelectCategory?: (id: string) => void
  allowedSlugs?: Set<string>
  className?: string
}

export function LayoutSidebar({
  activeId,
  activeCategory,
  onSelect,
  onSelectCategory,
  allowedSlugs,
  className,
}: LayoutSidebarProps) {
  const sidebarGroups: NavSidebarGroup[] = React.useMemo(() => {
    return LAYOUT_CATEGORIES.map((cat) => {
      const items = LAYOUT_DEMO_META.filter((d) => {
        if (d.category !== cat.id) return false
        if (allowedSlugs && !allowedSlugs.has(d.slug)) return false
        return true
      }).map((demo) => ({
        id: demo.slug,
        title: demo.title,
        href: `#${demo.slug}`,
        description: demo.description,
      }))

      return {
        id: cat.id,
        name: cat.name,
        icon: CATEGORY_ICONS[cat.id],
        items,
      }
    }).filter((g) => g.items.length > 0)
  }, [allowedSlugs])

  return (
    <NavSidebar
      groups={sidebarGroups}
      activeItemId={activeId}
      activeGroupId={activeCategory}
      defaultFolded={false}
      onSelectItem={(item) => onSelect?.(item.id)}
      onSelectGroup={(groupId) => onSelectCategory?.(groupId)}
      showMobileSubnav={true}
      isSticky
      stickyTopClass="top-20"
      maxHeightClass="max-h-[calc(100vh-7rem)]"
      className={cn("w-64 shrink-0", className)}
    />
  )
}
