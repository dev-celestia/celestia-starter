import * as React from "react"
import { Popover, PopoverTrigger, PopoverContent } from "../../primitive/popover"
import {
  TextHOneIcon,
  TextHTwoIcon,
  TextHThreeIcon,
  TextAlignLeftIcon,
  CheckSquareIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  CodeIcon,
  QuotesIcon,
  MinusIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"
import { cn } from "../../../lib/utils"
import type { SectionTemplateItem } from "./types"

export const DEFAULT_SECTION_TEMPLATES: SectionTemplateItem[] = [
  {
    id: "h1",
    category: "Typography",
    label: "Heading 1",
    description: "Large page heading",
    icon: <TextHOneIcon className="size-4 shrink-0 text-primary" />,
    templateMarkdown: "# New Heading",
  },
  {
    id: "h2",
    category: "Typography",
    label: "Heading 2",
    description: "Medium section header",
    icon: <TextHTwoIcon className="size-4 shrink-0 text-primary" />,
    templateMarkdown: "## Section Title",
  },
  {
    id: "h3",
    category: "Typography",
    label: "Heading 3",
    description: "Small subsection header",
    icon: <TextHThreeIcon className="size-4 shrink-0 text-primary" />,
    templateMarkdown: "### Subsection Title",
  },
  {
    id: "p",
    category: "Typography",
    label: "Paragraph",
    description: "Standard text block",
    icon: (
      <TextAlignLeftIcon className="size-4 shrink-0 text-muted-foreground" />
    ),
    templateMarkdown: "Enter your paragraph text here...",
  },
  {
    id: "task",
    category: "Lists",
    label: "To-Do Checklist",
    description: "Interactive checkbox list",
    icon: <CheckSquareIcon className="size-4 shrink-0 text-emerald-500" />,
    templateMarkdown: "- [ ] First task item\n- [ ] Second task item",
  },
  {
    id: "ul",
    category: "Lists",
    label: "Bullet List",
    description: "Unordered bullet points",
    icon: <ListBulletsIcon className="size-4 shrink-0 text-sky-500" />,
    templateMarkdown: "- First point\n- Second point",
  },
  {
    id: "ol",
    category: "Lists",
    label: "Numbered List",
    description: "Sequential ordered steps",
    icon: <ListNumbersIcon className="size-4 shrink-0 text-sky-500" />,
    templateMarkdown: "1. First step\n2. Second step",
  },
  {
    id: "code",
    category: "Formatting",
    label: "Code Block",
    description: "Syntax-highlighted code",
    icon: <CodeIcon className="size-4 shrink-0 text-purple-500" />,
    templateMarkdown:
      '```typescript\nfunction example() {\n  console.log("Hello!");\n}\n```',
  },
  {
    id: "quote",
    category: "Formatting",
    label: "Quote / Callout",
    description: "Indented highlighted quote",
    icon: <QuotesIcon className="size-4 shrink-0 text-amber-500" />,
    templateMarkdown: "> Important key insight or highlighted note",
  },
  {
    id: "divider",
    category: "Formatting",
    label: "Divider Line",
    description: "Horizontal separator rule",
    icon: <MinusIcon className="size-4 shrink-0 text-muted-foreground" />,
    templateMarkdown: "---",
  },
]

interface AddSectionMenuProps {
  trigger: React.ReactElement
  templates?: SectionTemplateItem[]
  onSelectTemplate: (template: SectionTemplateItem) => void
  align?: "start" | "center" | "end"
}

export function AddSectionMenu({
  trigger,
  templates = DEFAULT_SECTION_TEMPLATES,
  onSelectTemplate,
  align = "center",
}: AddSectionMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredTemplates = React.useMemo(() => {
    if (!search.trim()) return templates
    const query = search.toLowerCase().trim()
    return templates.filter(
      (t) =>
        t.label.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    )
  }, [templates, search])

  const categories = React.useMemo(() => {
    const list: Array<{ name: string; items: SectionTemplateItem[] }> = []
    const catMap = new Map<string, SectionTemplateItem[]>()

    filteredTemplates.forEach((item) => {
      if (!catMap.has(item.category)) {
        catMap.set(item.category, [])
      }
      catMap.get(item.category)!.push(item)
    })

    catMap.forEach((items, name) => {
      list.push({ name, items })
    })

    return list
  }, [filteredTemplates])

  const handleSelect = (template: SectionTemplateItem) => {
    setOpen(false)
    setSearch("")
    onSelectTemplate(template)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        align={align}
        sideOffset={6}
        className={cn(
          // Layout & Positioning
          "z-50 flex flex-col overflow-hidden",

          // Sizing & Spacing
          "max-h-96 w-72 rounded-xl border p-0 shadow-xl",

          // Backgrounds & Borders
          "bg-popover text-popover-foreground backdrop-blur-md"
        )}
      >
        {/* Search header */}
        <div
          className={cn(
            // Layout & Positioning
            "flex shrink-0 items-center border-b px-3 py-2",

            // Sizing & Spacing
            "gap-2",

            // Backgrounds & Borders
            "bg-muted/30"
          )}
        >
          <MagnifyingGlassIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter section types..."
            autoFocus
            className={cn(
              // Layout & Positioning
              "flex-1 bg-transparent outline-hidden",

              // Typography
              "font-mono text-xs text-foreground placeholder:text-muted-foreground"
            )}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Template List Items */}
        <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1.5">
          {categories.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No matching section types
            </div>
          ) : (
            categories.map((group) => (
              <div key={group.name} className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    // Sizing & Spacing
                    "px-2 py-1",

                    // Typography
                    "text-[10px] font-semibold tracking-wider text-muted-foreground uppercase select-none"
                  )}
                >
                  {group.name}
                </span>

                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      // Layout & Positioning
                      "flex w-full items-center rounded-lg text-left transition-colors",

                      // Sizing & Spacing
                      "gap-2.5 px-2 py-1.5",

                      // Interactive & States
                      "group cursor-pointer hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        // Layout & Positioning
                        "flex shrink-0 items-center justify-center",

                        // Sizing & Spacing
                        "size-7 rounded-md border shadow-2xs",

                        // Backgrounds & Borders
                        "bg-background/80 group-hover:border-primary/40 group-hover:bg-background"
                      )}
                    >
                      {item.icon}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-xs leading-tight font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
