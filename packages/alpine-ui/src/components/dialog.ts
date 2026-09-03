import { cn } from "../lib/utils"

export const dialogClasses = {
  overlay: (className?: string) =>
    cn(
      "fixed inset-0 isolate z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:duration-100",
      className
    ),
  content: (className?: string) =>
    cn(
      "fixed top-1/2 start-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-xs/relaxed text-popover-foreground ring-1 ring-foreground/10 transition-all duration-200 ease-out outline-none sm:max-w-sm motion-reduce:duration-100",
      className
    ),
  header: (className?: string) => cn("flex flex-col gap-1", className),
  footer: (className?: string) =>
    cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
  title: (className?: string) =>
    cn("font-heading text-sm font-medium", className),
  description: (className?: string) =>
    cn(
      "text-xs/relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
      className
    ),
}
