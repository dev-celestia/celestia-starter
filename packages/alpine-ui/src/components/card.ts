import { cn } from "../lib/utils"

export const cardClasses = {
  card: (size: "default" | "sm" = "default", className?: string) =>
    cn(
      "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-lg bg-card py-(--card-spacing) text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
      size === "sm" && "[--card-spacing:--spacing(3)]",
      className
    ),
  header: (className?: string) =>
    cn(
      "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
      className
    ),
  title: (className?: string) => cn("font-heading text-sm font-medium", className),
  description: (className?: string) =>
    cn("text-xs/relaxed text-muted-foreground", className),
  action: (className?: string) =>
    cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
  content: (className?: string) => cn("px-(--card-spacing)", className),
  footer: (className?: string) =>
    cn(
      "flex items-center rounded-b-lg px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
      className
    ),
}
