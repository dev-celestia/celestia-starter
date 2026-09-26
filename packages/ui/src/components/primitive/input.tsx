import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"

/**
 * The base is deliberately responsive — 14px below `md`, 12px at and above it.
 * The app disagreed: 74 call sites wrote `text-xs` to pin 12px at every
 * breakpoint. Rather than change what the default renders, that preference gets
 * a name.
 *
 * The axis is `textSize`, not `size`, because `size` is already the native
 * `<input>` character-width attribute — intersecting `VariantProps` with
 * `React.ComponentProps<"input">` on that name collapses the prop to `never`.
 *
 * `xs` is spelled as the whole `text-*` token because there is no `leading-*`
 * step for the 1.3333 ratio `text-xs` resolves to (`leading-tight` is 1.25,
 * `leading-normal` 1.5). Note it does NOT undo `md:text-xs/relaxed`: an
 * unprefixed `text-xs` and a `md:`-prefixed one are different conflict groups, so
 * both survive and `xs` keeps the base's desktop leading. That is exactly what
 * those call sites already produced, which is why moving them here is
 * behaviour-preserving.
 *
 * The base string is otherwise unchanged from the literal it replaced, so an
 * input that does not ask for `xs` renders exactly as before.
 */
const inputVariants = cva(
  "h-8 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      textSize: {
        default: "",
        xs: "text-xs",
      },
      // Monospace content (ids, hashes, tokens, ports) is common enough in
      // data-dense tooling that it deserves a first-class flag rather than a
      // `font-mono` override at every call site.
      mono: {
        true: "font-mono",
        false: "",
      },
    },
    defaultVariants: { textSize: "default", mono: false },
  }
)

function Input({
  className,
  type,
  textSize = "default",
  mono = false,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-mono={mono || undefined}
      className={cn(inputVariants({ textSize, mono }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
