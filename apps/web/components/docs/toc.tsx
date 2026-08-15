"use client"

import * as React from "react"
import { ListBulletsIcon } from "@phosphor-icons/react"
import type { TocItem } from "@/lib/docs"
import { cn } from "@celestia-project/ui/lib/utils"

export interface DocsTocProps {
  toc: TocItem[]
}

export function DocsToc({ toc }: DocsTocProps) {
  const [activeId, setActiveId] = React.useState<string>("")

  React.useEffect(() => {
    if (!toc || toc.length === 0) return

    const handleScroll = () => {
      const headingElements = toc
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[]

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 140) {
            setActiveId(el.id)
            return
          }
        }
      }

      if (headingElements.length > 0 && headingElements[0]) {
        setActiveId(headingElements[0].id)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [toc])

  if (!toc || toc.length === 0) return null

  return (
    <aside className="sticky top-20 hidden w-56 shrink-0 xl:block self-start max-h-[calc(100vh-6rem)] overflow-y-auto pl-4 py-2 scrollbar-none">
      <div className="flex flex-col gap-3 border-l border-border/60 pl-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
          <ListBulletsIcon className="size-3.5" />
          <span>On this page</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {toc.map((item) => {
            const isActive = activeId === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById(item.id)
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" })
                    setActiveId(item.id)
                  }
                }}
                className={cn(
                  "text-xs transition-all duration-150 block truncate leading-snug py-0.5",
                  item.level === 3 && "pl-3 text-[11px]",
                  item.level === 4 && "pl-5 text-[11px]",
                  isActive
                    ? "text-primary font-medium translate-x-0.5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.title}
              </a>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
