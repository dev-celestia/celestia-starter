import { cn } from "../lib/utils"

export const avatarClasses = {
  root: (size: "default" | "sm" | "lg" = "default", className?: string) =>
    cn(
      "relative flex shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border",
      size === "default" && "size-8",
      size === "sm" && "size-6",
      size === "lg" && "size-10",
      className
    ),
  image: (className?: string) =>
    cn("aspect-square size-full rounded-full object-cover", className),
  fallback: (className?: string) =>
    cn("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground", className),
  badge: (className?: string) =>
    cn("absolute end-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground size-2.5 ring-2 ring-background", className),
  group: (className?: string) =>
    cn("flex -space-x-2", className),
}
