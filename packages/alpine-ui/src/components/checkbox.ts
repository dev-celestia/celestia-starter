import { cn } from "../lib/utils"

export const checkboxClasses = {
  root: (className?: string) =>
    cn(
      "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-[background-color,border-color,box-shadow,transform] duration-120 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] motion-reduce:active:scale-100 outline-none group-has-disabled/field:opacity-50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
      className
    ),
  indicator: (className?: string) =>
    cn(
      "grid place-content-center text-current transition-[transform,opacity] duration-120 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] [&>svg]:size-3.5",
      className
    ),
}
