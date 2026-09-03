import { cn } from "../lib/utils"

export const accordionClasses = {
  root: (className?: string) =>
    cn("flex w-full flex-col overflow-hidden rounded-md border", className),
  item: (className?: string) =>
    cn("not-last:border-b data-[open]:bg-muted/50", className),
  trigger: (className?: string) =>
    cn(
      "group/accordion-trigger relative flex flex-1 items-start justify-between gap-6 border border-transparent p-2 text-start text-xs/relaxed font-medium transition-all outline-none hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50",
      className
    ),
  content: (className?: string) =>
    cn("overflow-hidden px-2 text-xs/relaxed transition-all duration-200", className),
  panel: (className?: string) =>
    cn("pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4", className),
}
