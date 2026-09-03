import { cn } from "../lib/utils"

export const progressClasses = {
  root: (className?: string) => cn("flex flex-wrap gap-3 w-full", className),
  track: (className?: string) =>
    cn("relative flex h-1 w-full items-center overflow-x-hidden rounded-md bg-muted", className),
  indicator: (progress: number = 0, className?: string) =>
    cn("h-full bg-primary transition-all duration-200", className),
  label: (className?: string) => cn("text-xs/relaxed font-medium", className),
  value: (className?: string) =>
    cn("ms-auto text-xs/relaxed text-muted-foreground tabular-nums", className),
}
