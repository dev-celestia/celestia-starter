"use client"

import * as React from "react"
import { DotsSixVerticalIcon } from "@phosphor-icons/react"

import { cn } from "@celestia-project/ui/lib/utils"

function DragHandle({
  className,
  disabled,
  ...props
}: React.ComponentProps<"button"> & { disabled?: boolean }) {
  return (
    <button
      type="button"
      data-slot="drag-handle"
      aria-label={props["aria-label"] ?? "Drag to reorder"}
      disabled={disabled}
      className={cn(
        "inline-flex size-5 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground transition-colors select-none",
        "hover:bg-muted hover:text-foreground active:cursor-grabbing",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      <DotsSixVerticalIcon className="size-3.5" weight="bold" />
    </button>
  )
}

export { DragHandle }
