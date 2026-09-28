"use client"

import * as React from "react"
import {
  BrowsersIcon,
  LockKeyIcon,
  SquaresFourIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import { NavSidebar, type NavSidebarGroup } from "@/components/shared/nav-sidebar"
import { LAYOUT_CATEGORIES, LAYOUT_DEMO_META, type LayoutCategoryId } from "@/lib/layout-demos"

const CATEGORY_ICONS: Record<LayoutCategoryId, React.ComponentType<{ className?: string }>> = {
  shells: BrowsersIcon,
  auth: LockKeyIcon,
  screens: SquaresFourIcon,
  system: WarningCircleIcon,
}

export interface LayoutSidebarProps {
  activeId?: string
  onSelect?: (id: string) => void
}

export function LayoutSidebar({ activeId, onSelect }: LayoutSidebarProps) {
  const sidebarGroups: NavSidebarGroup[] = React.useMemo(() => {
    return LAYOUT_CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: CATEGORY_ICONS[cat.id],
      items: LAYOUT_DEMO_META.filter((d) => d.category === cat.id).map((demo) => ({
        id: demo.slug,
        title: demo.title,
        href: `#${demo.slug}`,
        description: demo.description,
      })),
    }))
  }, [])

  return (
    <NavSidebar
      groups={sidebarGroups}
      activeItemId={activeId}
      defaultFolded={false}
      onSelectItem={(item) => onSelect?.(item.id)}
      showMobileSubnav={true}
    />
  )
}
