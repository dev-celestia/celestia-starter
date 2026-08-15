"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRightIcon } from "@phosphor-icons/react"
import { cn } from "@celestia-project/ui/lib/utils"

export interface CardsProps extends React.HTMLAttributes<HTMLDivElement> {
  num?: number
}

export function Cards({ className, num = 2, children, ...props }: CardsProps) {
  return (
    <div
      className={cn(
        "my-6 grid gap-4",
        num === 1 && "grid-cols-1",
        num === 2 && "grid-cols-1 sm:grid-cols-2",
        num === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        num === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  href: string
  external?: boolean
}

export function Card({
  title,
  description,
  icon,
  href,
  external,
  className,
  children,
  ...props
}: CardProps) {
  const isExternal = external || href.startsWith("http")
  const Comp = isExternal ? "a" : Link

  return (
    <Comp
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer noopener" : undefined}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/90 hover:shadow-lg active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                {icon}
              </div>
            )}
            <h4 className="text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {title}
            </h4>
          </div>
          <ArrowUpRightIcon className="size-4 text-muted-foreground/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </div>

        {description && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        {children && <div className="mt-3 text-xs text-muted-foreground">{children}</div>}
      </div>
    </Comp>
  )
}
