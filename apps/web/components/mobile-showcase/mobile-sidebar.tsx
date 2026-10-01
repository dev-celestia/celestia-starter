"use client"

import type { ComponentType } from "react"
import { BookOpenIcon, SquaresFourIcon } from "@phosphor-icons/react"
import {
  NavSidebar,
  type NavSidebarGroup,
} from "@/components/shared/nav-sidebar"
import { MOBILE_SECTIONS } from "@/lib/mobile-showcase"

const GROUP_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "Get started": BookOpenIcon,
}

/** Group order in the rail. Mirrors the reading order of the page. */
const GROUP_ORDER = ["Get started"]

/**
 * Static, so it needs no hook — which matters: the page renders this in two
 * places (the mobile switcher and the desktop rail) and both must agree on
 * identity for the active item to highlight in both.
 */
export const MOBILE_SIDEBAR_GROUPS: NavSidebarGroup[] = GROUP_ORDER.map(
  (name) => ({
    id: name,
    name,
    icon: GROUP_ICONS[name] ?? SquaresFourIcon,
    items: MOBILE_SECTIONS.filter((section) => section.group === name).map(
      (section) => ({
        id: section.id,
        title: section.title,
      })
    ),
  })
)

export interface MobileSidebarProps {
  activeId?: string
  onSelect?: (id: string) => void
}

/**
 * The desktop rail only. `showMobileSubnav` is off because the page renders the
 * mobile switcher as a sibling of the content column instead — a sticky element
 * nested inside the `hidden lg:flex` rail would never be sticky *or* visible
 * below `lg`, which is how the `/layout` surface loses its mobile navigation.
 */
export function MobileSidebar({ activeId, onSelect }: MobileSidebarProps) {
  return (
    <NavSidebar
      groups={MOBILE_SIDEBAR_GROUPS}
      activeItemId={activeId}
      defaultFolded={false}
      onSelectItem={(item) => onSelect?.(item.id)}
      showMobileSubnav={false}
    />
  )
}
