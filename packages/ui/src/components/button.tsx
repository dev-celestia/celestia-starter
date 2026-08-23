import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150 ease-out active:scale-[0.97] active:duration-75 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-background border-primary text-primary hover:bg-primary/10 shadow-[0_3.5px_0_0_var(--primary)] active:shadow-none",
        destructive:
          "bg-destructive border-destructive text-white hover:bg-destructive/90 shadow-[0_3.5px_0_0_color-mix(in_oklch,var(--destructive),black_30%)] active:shadow-none focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-[0_3.5px_0_0_rgba(0,0,0,0.15)] dark:shadow-[0_3.5px_0_0_rgba(0,0,0,0.5)] active:shadow-none dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary border-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_3.5px_0_0_rgba(0,0,0,0.15)] dark:shadow-[0_3.5px_0_0_rgba(0,0,0,0.5)] active:shadow-none",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 text-xs/relaxed has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-7 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-9 gap-1.5 px-3.5 text-xs/relaxed has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5 [&_svg:not([class*='size-'])]:size-4",
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

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  render,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const isNative =
    nativeButton ??
    (React.isValidElement(render) && render.type !== "button"
      ? false
      : undefined)

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      nativeButton={isNative}
      render={render}
      {...props}
    />
  )
}

export { Button, buttonVariants }
