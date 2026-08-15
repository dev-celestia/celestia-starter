"use client"

import * as React from "react"
import { cn } from "@celestia-project/ui/lib/utils"

export function Steps({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "my-6 ml-4 border-l-2 border-border/80 pl-6 [counter-reset:step] space-y-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function Step({ className, title, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { title?: string }) {
  return (
    <div className={cn("relative [counter-increment:step]", className)} {...props}>
      {/* Number Badge */}
      <div className="absolute -left-[35px] top-0 flex size-6 items-center justify-center rounded-full border-2 border-background bg-primary font-mono text-[11px] font-bold text-primary-foreground shadow-xs">
        <span className="before:content-[counter(step)]" />
      </div>

      {title && (
        <h4 className="text-sm tracking-tight text-foreground mb-2">
          {title}
        </h4>
      )}

      <div className="text-xs text-muted-foreground leading-relaxed [&>p]:mb-3">
        {children}
      </div>
    </div>
  )
}
