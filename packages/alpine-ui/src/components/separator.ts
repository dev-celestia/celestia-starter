import { cn } from "../lib/utils"

export function getSeparatorClass(
  orientation: "horizontal" | "vertical" = "horizontal",
  className?: string
): string {
  return cn(
    "shrink-0 bg-border",
    orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch h-full",
    className
  )
}
