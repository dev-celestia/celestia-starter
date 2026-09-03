import { cn } from "../lib/utils"

export const tooltipClasses = {
  content: (className?: string) =>
    cn(
      "z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md transition-all duration-140 ease-out",
      className
    ),
  arrow: (className?: string) =>
    cn("z-50 size-2.5 rotate-45 rounded-[2px] bg-foreground fill-foreground", className),
}
