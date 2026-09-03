import { cn } from "../lib/utils"

export const dropdownClasses = {
  content: (className?: string) =>
    cn(
      "z-50 min-w-32 rounded-lg p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none bg-popover/85 backdrop-blur-xl transition-all duration-150 ease-out",
      className
    ),
  item: (variant: "default" | "destructive" = "default", className?: string) =>
    cn(
      "relative flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
      variant === "destructive" &&
        "text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20",
      className
    ),
  label: (className?: string) =>
    cn("px-2 py-1.5 text-xs text-muted-foreground font-medium", className),
  separator: (className?: string) =>
    cn("-mx-1 my-1 h-px bg-border", className),
}
