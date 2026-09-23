"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@celestia-project/ui/lib/utils"

function ScrollArea({
  className,
  children,
  fill = false,
  mono = false,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  /**
   * Stretch to fill a flex parent instead of overflowing it. Without this,
   * a ScrollArea inside a flex column grows to content height and the parent
   * scrolls instead of the area — call sites otherwise repeat `flex-1 min-h-0`.
   */
  fill?: boolean
  /**
   * Render the contents in the monospace stack. Scroll areas wrapping logs,
   * hex dumps or request bodies set this once instead of every child repeating
   * `font-mono`.
   */
  mono?: boolean
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      data-fill={fill || undefined}
      data-mono={mono || undefined}
      className={cn("relative", fill && "min-h-0 flex-1", mono && "font-mono", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-s data-[orientation=vertical]:border-s-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
