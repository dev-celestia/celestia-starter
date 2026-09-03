import { cn } from "../lib/utils"

export const switchClasses = {
  root: (size: "sm" | "default" = "default", className?: string) =>
    cn(
      "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-[background-color,border-color,box-shadow] duration-160 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50",
      size === "default" ? "h-[16.6px] w-[28px]" : "h-[14px] w-[24px]",
      className
    ),
  thumb: (size: "sm" | "default" = "default", checked: boolean = false, className?: string) =>
    cn(
      "pointer-events-none block rounded-full bg-background ring-0 transition-[transform,width] duration-160 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] dark:data-unchecked:bg-foreground motion-reduce:transition-none",
      size === "default" ? "size-3.5" : "size-3",
      checked
        ? size === "default"
          ? "translate-x-[calc(100%-2px)] dark:bg-primary-foreground"
          : "translate-x-[calc(100%-2px)] dark:bg-primary-foreground"
        : "translate-x-0 bg-background dark:bg-foreground",
      className
    ),
}
