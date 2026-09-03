import { cn } from "../lib/utils"

export const kbdClasses = {
  kbd: (className?: string) =>
    cn(
      "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-xs bg-muted px-1 font-sans text-[0.625rem] font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3",
      className
    ),
  group: (className?: string) =>
    cn("inline-flex items-center gap-1", className),
}
