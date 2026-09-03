import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

export const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2 py-1.5 text-start text-xs/relaxed has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-1.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type AlertVariantProps = VariantProps<typeof alertVariants>

export const alertClasses = {
  root: (variant?: AlertVariantProps["variant"], className?: string) =>
    cn(alertVariants({ variant, className })),
  title: (className?: string) =>
    cn("font-medium [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", className),
  description: (className?: string) =>
    cn("text-xs/relaxed text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", className),
  action: (className?: string) =>
    cn("absolute top-1.5 end-2", className),
}
