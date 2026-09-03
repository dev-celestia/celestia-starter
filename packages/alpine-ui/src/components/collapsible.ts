import { cn } from "../lib/utils"

export const collapsibleClasses = {
  root: (className?: string) => cn("w-full", className),
  trigger: (className?: string) => cn("cursor-pointer select-none", className),
  content: (className?: string) =>
    cn("overflow-hidden transition-all duration-200", className),
}
