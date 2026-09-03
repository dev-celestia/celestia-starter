import { cn } from "../lib/utils"

export const tabsClasses = {
  root: (className?: string) => cn("flex w-full flex-col gap-2", className),
  list: (variant: "default" | "line" = "default", className?: string) =>
    cn(
      "relative inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground h-8",
      variant === "default" && "bg-muted",
      variant === "line" && "gap-1 bg-transparent border-b border-border/50",
      className
    ),
  trigger: (active: boolean = false, className?: string) =>
    cn(
      "relative z-10 inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground select-none outline-none transition-colors duration-150 ease-out hover:text-foreground active:scale-[0.97] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
      active && "bg-background text-foreground shadow-xs dark:bg-input/30 dark:border-input/40",
      className
    ),
  content: (className?: string) =>
    cn("flex-1 text-xs/relaxed outline-none transition-all duration-200", className),
}
