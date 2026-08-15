"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  CubeIcon,
  SparkleIcon,
  ArrowUDownLeftIcon,
  XIcon,
} from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

export interface SearchItem {
  title: string
  href: string
  category: string
  description?: string
}

// Pre-defined static index for fast local search
export const SEARCH_INDEX: SearchItem[] = [
  { title: "Introduction & Overview", href: "/docs", category: "Getting Started", description: "Architecture, stack overview and project structure." },
  { title: "CLI Tool", href: "/docs/cli", category: "Getting Started", description: "Scaffold a new project interactively with npx @celestia-project/create." },
  { title: "Packages Overview", href: "/docs/packages", category: "Getting Started", description: "Shared packages: @workspace/db, @celestia-project/ui, api, and feature-manager." },
  { title: "Features & Scaffolding", href: "/docs/features", category: "Getting Started", description: "Modular feature architecture and pnpm add-feature CLI." },
  { title: "Authentication", href: "/docs/authentication", category: "Features", description: "Better Auth integration, session management, and OAuth providers." },
  { title: "Backend API", href: "/docs/backend", category: "Features", description: "Standalone Hono backend, Drizzle ORM, and typed RPC client." },
  { title: "Dashboard", href: "/docs/dashboard", category: "Features", description: "Protected dashboard layout with sidebar, route guards, and user profile." },
  { title: "Blog (CRUD)", href: "/docs/blog", category: "Features", description: "Full CRUD posts management with Hono RPC." },
  { title: "Access Control & RBAC", href: "/docs/access", category: "Features", description: "Admin user management with RBAC middleware and ABAC policies." },
  { title: "Components Overview", href: "/docs/components", category: "Components", description: "Explore 70+ accessible UI components built on Base UI and Tailwind v4." },
  { title: "Button", href: "/docs/components/button", category: "Components", description: "Button primitive with variants, sizes, and loading states." },
  { title: "Button Group", href: "/docs/components/button-group", category: "Components", description: "Cohesive segmented button group container." },
  { title: "Toggle & Toggle Group", href: "/docs/components/toggle", category: "Components", description: "Two-state toggle button and multi-select toggle groups." },
  { title: "Input & Input Group", href: "/docs/components/input", category: "Components", description: "Accessible text inputs with addons, prefixes, and suffixes." },
  { title: "Dialog", href: "/docs/components/dialog", category: "Components", description: "Modal dialog overlay with accessibility and smooth focus trap." },
  { title: "Alert & Alert Dialog", href: "/docs/components/alert", category: "Components", description: "Visual alert callouts and destructive confirmation dialogs." },
  { title: "Drawer / Sheet", href: "/docs/components/drawer", category: "Components", description: "Slide-over drawer sheets for mobile menus and contextual panels." },
  { title: "Dropdown Menu", href: "/docs/components/dropdown-menu", category: "Components", description: "Contextual dropdown menus with nested submenus and shortcuts." },
  { title: "Select & Combobox", href: "/docs/components/select", category: "Components", description: "Accessible select dropdowns and searchable autocomplete comboboxes." },
  { title: "Tabs & Tab Bar", href: "/docs/components/tabs", category: "Components", description: "Segmented tab panels with keyboard navigation." },
  { title: "Table & Data Table", href: "/docs/components/table", category: "Components", description: "Data grid with sorting, pagination, and TanStack Table support." },
  { title: "Card & Article Card", href: "/docs/components/card", category: "Components", description: "Card containers with headers, content, and interactive actions." },
  { title: "Badge & Marker", href: "/docs/components/badge", category: "Components", description: "Status tags, count badges, and indicator markers." },
  { title: "Avatar", href: "/docs/components/avatar", category: "Components", description: "User avatar with fallback initials and image error handling." },
  { title: "Chart", href: "/docs/components/chart", category: "Components", description: "Responsive chart containers using Recharts." },
  { title: "Sonner Toast", href: "/docs/components/sonner", category: "Components", description: "Rich, stackable toast notifications." },
  { title: "Accordion & Collapsible", href: "/docs/components/accordion", category: "Components", description: "Vertically collapsing accordion panels." },
  { title: "Tooltip & Popover", href: "/docs/components/tooltip", category: "Components", description: "Floating tooltips and interactive popovers." },
  { title: "Command Palette", href: "/docs/components/command", category: "Components", description: "Fast, keyboard-driven command palette." },
  { title: "Navigation Menu", href: "/docs/components/navigation-menu", category: "Components", description: "Mega-menu style navigation bar with rich viewport panels." },
]

export interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter items
  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SEARCH_INDEX.slice(0, 8)
    return SEARCH_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    ).slice(0, 10)
  }, [query])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = filteredItems[selectedIndex]
      if (item) {
        onOpenChange(false)
        router.push(item.href)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl w-[92vw] p-0 overflow-hidden rounded-2xl bg-card text-card-foreground border border-border shadow-2xl top-[20%] translate-y-0"
      >
        <DialogTitle className="sr-only">Search Documentation</DialogTitle>
        <DialogDescription className="sr-only">Search guides and components</DialogDescription>

        {/* Input Bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/20">
          <MagnifyingGlassIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation, guides, components..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden sm:inline-block rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 scrollbar-none">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for &ldquo;<span className="text-foreground">{query}</span>&rdquo;
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      onOpenChange(false)
                      router.push(item.href)
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-lg shrink-0",
                          isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.category === "Components" ? (
                          <CubeIcon className="size-3.5" />
                        ) : (
                          <BookOpenIcon className="size-3.5" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 truncate">
                        <span className="text-foreground truncate">{item.title}</span>
                        {item.description && (
                          <span className="text-[11px] text-muted-foreground truncate">{item.description}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {item.category}
                      </span>
                      {isSelected && (
                        <ArrowUDownLeftIcon className="size-3 text-primary animate-in fade-in duration-100" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border/80 bg-background px-1 py-0.5 text-[9px] font-mono">↑</kbd>
              <kbd className="rounded border border-border/80 bg-background px-1 py-0.5 text-[9px] font-mono">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border/80 bg-background px-1 py-0.5 text-[9px] font-mono">↵</kbd>
              Select
            </span>
          </div>
          <span>Celestia Search</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
