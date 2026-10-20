import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"

function DropIndicator({
  className,
  orientation = "horizontal",
  visible = true,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  visible?: boolean
}) {
  return (
    <div
      data-slot="drop-indicator"
      role="presentation"
      className={cn(
        "overflow-hidden rounded-full bg-primary transition-[height,width,margin] duration-200 ease-out",
        orientation === "horizontal"
          ? visible
            ? "my-1 h-1.5 w-full"
            : "my-0 h-0 w-full"
          : visible
            ? "mx-1 h-full w-1.5"
            : "mx-0 h-full w-0",
        className
      )}
      {...props}
    />
  )
}

export { DropIndicator }
