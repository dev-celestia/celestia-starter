"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"

const labelVariants = cva(
  "flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      // The base carries `text-xs/relaxed` for the 12px step. Dense inspector
      // panels label their rows one step down, at `--text-2xs` (11px) — which is
      // the only step in the sub-`xs` scale that is a single pixel off the base
      // rather than a jump, and is the one the app hand-wrote at 20 sites.
      size: {
        default: "",
        "2xs": "text-2xs",
      },
      // The base pairs 12px with `leading-none`, so `text-xs` — the same 12px at
      // its own 1.3333 leading — is a leading change, not a size change. Same
      // axis, same spelling, and same reasoning as Button's `leading`.
      leading: {
        relaxed: "",
        tight: "text-xs",
      },
    },
    defaultVariants: {
      size: "default",
      leading: "relaxed",
    },
  }
)

function Label({
  className,
  size = "default",
  leading = "relaxed",
  ...props
}: React.ComponentProps<"label"> & VariantProps<typeof labelVariants>) {
  return (
    <label
      data-slot="label"
      className={cn(labelVariants({ size, leading }), className)}
      {...props}
    />
  )
}

export { Label, labelVariants }
