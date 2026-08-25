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
  CaretRightIcon,
} from "@phosphor-icons/react"
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

interface ComponentsSidebarProps {
  activeCategory: string
  onSelectCategory: (id: string) => void
}

export function ComponentsSidebar({
  activeCategory,
  onSelectCategory,
}: ComponentsSidebarProps) {
  // Track open categories with support for toggling
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({
    buttons: true,
  })

  // Sync if activeCategory changes externally
  React.useEffect(() => {
    if (activeCategory) {
      setOpenCategories((prev) => ({ ...prev, [activeCategory]: true }))
    }
  }, [activeCategory])

  const toggleCategory = (catId: string) => {
    onSelectCategory(catId)
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }))

    const element = document.getElementById(catId)
    if (element) {
      const yOffset = -90
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  const scrollToItem = (itemId: string) => {
    const element = document.getElementById(itemId)
    if (element) {
      const yOffset = -90
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <aside className="sticky top-50 hidden w-64 shrink-0 lg:block self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-3 py-2 scrollbar-none">
      <div className="flex flex-col gap-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Categories
          </div>
          <nav className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isOpen = !!openCategories[cat.id]
              const isSelected = activeCategory === cat.id

              return (
                <div key={cat.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all text-left group cursor-pointer select-none",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CaretRightIcon
                        className={cn(
                          "size-3.5 shrink-0 transition-transform duration-200 text-muted-foreground/60",
                          isOpen && "rotate-90 text-foreground"
                        )}
                      />
                      <Icon className={cn("size-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[10px] rounded-md px-1.5 py-0.5 shrink-0 ml-1.5",
                        isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cat.count}
                    </span>
                  </button>

                  {/* Sub components list */}
                  {isOpen && (
                    <div className="ml-5 mt-1 mb-1 flex flex-col gap-0.5 border-l border-border/60 pl-3.5">
                      {cat.items.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            scrollToItem(item.id)
                          }}
                          className="py-1 text-[11px] text-muted-foreground transition-colors hover:text-primary"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
