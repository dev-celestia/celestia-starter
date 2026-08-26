"use client"

import * as React from "react"
import {
  CursorClickIcon,
  TextboxIcon,
  TableIcon,
  ChatCircleDotsIcon,
  BellSimpleRingingIcon,
  CompassIcon,
  StackIcon,
} from "@phosphor-icons/react"
import { NavSidebar, type NavSidebarGroup } from "@/components/shared/nav-sidebar"
import { cn } from "@celestia-project/ui/lib/utils"

export interface CategoryItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  count: number
  items: { id: string; name: string }[]
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: "buttons",
    name: "Buttons & Actions",
    icon: CursorClickIcon,
    count: 5,
    items: [
      { id: "button", name: "Button" },
      { id: "button-group", name: "Button Group" },
      { id: "toggle", name: "Toggle" },
      { id: "toggle-group", name: "Toggle Group" },
      { id: "ripple", name: "Ripple Effect" },
    ],
  },
  {
    id: "inputs",
    name: "Inputs & Forms",
    icon: TextboxIcon,
    count: 13,
    items: [
      { id: "input", name: "Input" },
      { id: "input-group", name: "Input Group" },
      { id: "textarea", name: "Textarea" },
      { id: "checkbox", name: "Checkbox" },
      { id: "radio-group", name: "Radio Group" },
      { id: "switch", name: "Switch" },
      { id: "slider", name: "Slider" },
      { id: "native-select", name: "Native Select" },
      { id: "select", name: "Select" },
      { id: "combobox", name: "Combobox" },
      { id: "input-otp", name: "Input OTP" },
      { id: "colorized-url-input", name: "Colorized URL Input" },
      { id: "field", name: "Field & Form" },
    ],
  },
  {
    id: "data-display",
    name: "Data Display",
    icon: TableIcon,
    count: 13,
    items: [
      { id: "card", name: "Card" },
      { id: "article-card", name: "Article Card" },
      { id: "badge", name: "Badge" },
      { id: "avatar", name: "Avatar" },
      { id: "table", name: "Table" },
      { id: "data-table", name: "Data Table" },
      { id: "empty", name: "Empty State" },
      { id: "item", name: "Item & Item Group" },
      { id: "marker", name: "Marker" },
      { id: "kbd", name: "Kbd (Keyboard)" },
      { id: "skeleton", name: "Skeleton" },
      { id: "aspect-ratio", name: "Aspect Ratio" },
      { id: "separator", name: "Separator" },
    ],
  },
  {
    id: "feedback",
    name: "Feedback & Overlays",
    icon: BellSimpleRingingIcon,
    count: 10,
    items: [
      { id: "alert", name: "Alert" },
      { id: "alert-dialog", name: "Alert Dialog" },
      { id: "dialog", name: "Dialog" },
      { id: "drawer", name: "Drawer / Sheet" },
      { id: "popover", name: "Popover" },
      { id: "tooltip", name: "Tooltip" },
      { id: "hover-card", name: "Hover Card" },
      { id: "progress", name: "Progress" },
      { id: "spinner", name: "Spinner" },
      { id: "sonner", name: "Sonner Toast" },
    ],
  },
  {
    id: "navigation",
    name: "Navigation & Menus",
    icon: CompassIcon,
    count: 11,
    items: [
      { id: "tabs", name: "Tabs" },
      { id: "tab-bar", name: "Tab Bar" },
      { id: "breadcrumb", name: "Breadcrumb" },
      { id: "pagination", name: "Pagination" },
      { id: "accordion", name: "Accordion" },
      { id: "collapsible", name: "Collapsible" },
      { id: "dropdown-menu", name: "Dropdown Menu" },
      { id: "context-menu", name: "Context Menu" },
      { id: "menubar", name: "Menubar" },
      { id: "command", name: "Command Palette" },
      { id: "navigation-menu", name: "Navigation Menu" },
    ],
  },
  {
    id: "chat-ai",
    name: "AI Components",
    icon: ChatCircleDotsIcon,
    count: 14,
    items: [
      { id: "prompt-input", name: "Prompt Input" },
      { id: "reasoning", name: "Model Reasoning" },
      { id: "tool", name: "Agent Tools" },
      { id: "model-selector", name: "Model Selector" },
      { id: "plan-task", name: "Agent Plan & Tasks" },
      { id: "suggestion", name: "Prompt Suggestions" },
      { id: "sources", name: "Sources & Citations" },
      { id: "audio-player", name: "AI Audio Player" },
      { id: "file-tree", name: "Workspace File Tree" },
      { id: "confirmation", name: "Action Approval" },
      { id: "context", name: "Token & Context" },
      { id: "chat-message", name: "Chat Message" },
      { id: "bubble", name: "Bubble & Reactions" },
      { id: "attachment", name: "Attachment" },
    ],
  },
  {
    id: "surfaces",
    name: "Surfaces & Rich Media",
    icon: StackIcon,
    count: 5,
    items: [
      { id: "resizable", name: "Resizable Panels" },
      { id: "scroll-area", name: "Scroll Area" },
      { id: "carousel", name: "Carousel" },
      { id: "text-editor", name: "Text & Code Editor" },
      { id: "chart", name: "Chart Container" },
    ],
  },
]

export interface ComponentsSidebarProps {
  activeCategory: string
  onSelectCategory: (id: string) => void
  className?: string
}

export function ComponentsSidebar({
  activeCategory,
  onSelectCategory,
  className,
}: ComponentsSidebarProps) {
  const scrollToItem = React.useCallback((itemId: string) => {
    const element = document.getElementById(itemId)
    if (element) {
      const yOffset = -120
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }, [])

  const handleSelectGroup = React.useCallback(
    (groupId: string) => {
      onSelectCategory(groupId)
      const element = document.getElementById(groupId)
      if (element) {
        const yOffset = -120
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    },
    [onSelectCategory]
  )

  const sidebarGroups: NavSidebarGroup[] = React.useMemo(() => {
    return CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      items: cat.items.map((item) => ({
        id: item.id,
        title: item.name,
      })),
    }))
  }, [])

  return (
    <NavSidebar
      groups={sidebarGroups}
      activeGroupId={activeCategory}
      onSelectGroup={handleSelectGroup}
      onSelectItem={(item) => scrollToItem(item.id)}
      isSticky
      stickyTopClass="top-24"
      maxHeightClass="max-h-[calc(100vh-7rem)]"
      className={cn("hidden w-64 shrink-0 lg:flex lg:flex-col", className)}
    />
  )
}
