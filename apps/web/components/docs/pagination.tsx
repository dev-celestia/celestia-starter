import * as React from "react"
import Link from "next/link"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr"

export interface PaginationItem {
  title: string
  href: string
}

export interface DocsPaginationProps {
  prev?: PaginationItem | null
  next?: PaginationItem | null
  className?: string
}

export function DocsPagination({ prev, next, className = "" }: DocsPaginationProps) {
  if (!prev && !next) return null

  return (
    <div className={`mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6 ${className}`}>
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 rounded-xl border border-border/70 p-3.5 text-xs transition-all hover:border-primary/40 hover:bg-muted/40 active:scale-[0.98]"
        >
          <CaretLeftIcon className="size-4 text-muted-foreground" />
          <div className="flex flex-col text-start">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Previous</span>
            <span className="text-foreground font-medium">{prev.title}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next && (
        <Link
          href={next.href}
          className="flex items-center gap-2 rounded-xl border border-border/70 p-3.5 text-xs transition-all hover:border-primary/40 hover:bg-muted/40 active:scale-[0.98] ms-auto"
        >
          <div className="flex flex-col text-end">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">Next</span>
            <span className="text-foreground font-medium">{next.title}</span>
          </div>
          <CaretRightIcon className="size-4 text-muted-foreground" />
        </Link>
      )}
    </div>
  )
}
