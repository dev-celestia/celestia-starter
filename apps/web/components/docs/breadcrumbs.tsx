import * as React from "react"
import Link from "next/link"
import {
  HouseIcon,
  CaretRightIcon as BreadcrumbSeparatorIcon,
} from "@phosphor-icons/react/dist/ssr"

export interface BreadcrumbItem {
  title: string
  href: string
}

export interface DocsBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function DocsBreadcrumbs({ items, className = "" }: DocsBreadcrumbsProps) {
  if (!items || items.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-muted-foreground mb-4 ${className}`}>
      <Link href="/docs" className="hover:text-foreground transition-colors flex items-center gap-1">
        <HouseIcon className="size-3.5" />
        <span>Docs</span>
      </Link>
      {items.slice(1).map((crumb, idx) => {
        const isLast = idx === items.length - 2
        return (
          <React.Fragment key={crumb.href}>
            <BreadcrumbSeparatorIcon className="size-3 text-muted-foreground/50" />
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {crumb.title}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {crumb.title}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
