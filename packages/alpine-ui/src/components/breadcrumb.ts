import { cn } from "../lib/utils"

export const breadcrumbClasses = {
  nav: (className?: string) => cn("", className),
  list: (className?: string) =>
    cn("flex flex-wrap items-center gap-1.5 text-xs/relaxed wrap-break-word text-muted-foreground", className),
  item: (className?: string) =>
    cn("inline-flex items-center gap-1", className),
  link: (className?: string) =>
    cn("transition-colors hover:text-foreground", className),
  page: (className?: string) =>
    cn("font-normal text-foreground", className),
  separator: (className?: string) =>
    cn("[&>svg]:size-3.5", className),
  ellipsis: (className?: string) =>
    cn("flex size-4 items-center justify-center [&>svg]:size-3.5", className),
}
