import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap outline-none select-none transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-background border-primary text-primary hover:bg-primary/10 shadow-[0_2px_0_0_var(--primary)] active:translate-y-[2px] active:shadow-none active:transition-none",
        destructive:
          "bg-destructive border-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-destructive-3d active:translate-y-[2px] active:shadow-none active:transition-none",
        outline:
          "border-border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-[0_2px_0_0_rgba(0,0,0,0.15)] dark:shadow-[0_2px_0_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none active:transition-none",
        secondary:
          "bg-secondary border-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_2px_0_0_rgba(0,0,0,0.15)] dark:shadow-[0_2px_0_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none active:transition-none",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 text-xs/relaxed [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-7 gap-1 px-2.5 text-xs/relaxed [&_svg:not([class*='size-'])]:size-3",
        lg: "h-9 gap-1.5 px-3.5 text-xs/relaxed [&_svg:not([class*='size-'])]:size-4",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-9 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export function getButtonClass(
  variant?: ButtonVariantProps["variant"],
  size?: ButtonVariantProps["size"],
  className?: string
): string {
  return cn(buttonVariants({ variant, size, className }))
}
