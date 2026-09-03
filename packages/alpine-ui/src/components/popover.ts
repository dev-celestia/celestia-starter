import { cn } from "../lib/utils"

export const popoverClasses = {
  content: (className?: string) =>
    cn(
      "z-50 flex w-72 flex-col gap-4 rounded-lg bg-popover/90 backdrop-blur-xl p-2.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none transition-all duration-150 ease-out",
      className
    ),
  header: (className?: string) => cn("flex flex-col gap-1 text-xs", className),
  title: (className?: string) => cn("text-sm font-medium", className),
  description: (className?: string) => cn("text-muted-foreground", className),
}
