import { cn } from "../lib/utils"

export const sheetClasses = {
  overlay: (className?: string) =>
    cn(
      "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-280",
      className
    ),
  content: (side: "top" | "right" | "bottom" | "left" = "right", className?: string) =>
    cn(
      "fixed z-50 flex flex-col bg-popover bg-clip-padding text-xs/relaxed text-popover-foreground shadow-2xl transition-all duration-280",
      side === "right" && "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-s",
      side === "left" && "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-e",
      side === "top" && "inset-x-0 top-0 h-auto border-b",
      side === "bottom" && "inset-x-0 bottom-0 h-auto border-t",
      className
    ),
  header: (className?: string) => cn("flex flex-col gap-1.5 p-6", className),
  footer: (className?: string) => cn("mt-auto flex flex-col gap-2 p-6", className),
  title: (className?: string) =>
    cn("font-heading text-sm font-medium text-foreground", className),
  description: (className?: string) =>
    cn("text-xs/relaxed text-muted-foreground", className),
}
