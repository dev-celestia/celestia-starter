import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"

/**
 * Leading, as a first-class choice — the same axis Button, Label and the Select
 * parts carry.
 *
 * This base is responsive: `text-sm` below `md`, then `md:text-xs/relaxed`
 * (12px/19.5px). The app writes `text-xs` at these call sites, which below `md`
 * steps the size down to 12px at default leading and above `md` is already dead
 * behind the breakpoint variant. Naming it keeps the call sites honest about
 * which of the two they meant, and is behaviour-preserving at every one of them.
 *
 * `tight` is spelled as the whole `text-*` token because Tailwind has no
 * `leading-*` step for the 1.3333 ratio `text-xs` resolves to.
 *
 * The base string is unchanged from the literal it replaced; only the axis was
 * extracted, so an element that does not ask for `tight` renders exactly as before.
 */
const textareaVariants = cva(
  "min-h-16 w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30",
  {
    variants: {
      leading: {
        relaxed: "",
        tight: "text-xs",
      },
    },
    defaultVariants: { leading: "relaxed" },
  }
)

function Textarea({
  className,
  mono = false,
  leading = "relaxed",
  ...props
}: React.ComponentProps<"textarea"> & {
  /** Render the value in the monospace stack — for payloads, headers, code. */
  mono?: boolean
} & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-mono={mono || undefined}
      className={cn(textareaVariants({ leading }), mono && "font-mono", className)}
      {...props}
    />
  )
}

export { Textarea }
