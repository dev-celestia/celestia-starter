import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-3xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-2.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive dark:bg-destructive/20 [a]:hover:bg-destructive/20",
        success:
          "bg-success/10 text-success dark:bg-success/20 [a]:hover:bg-success/20",
        warning:
          "bg-warning/10 text-warning dark:bg-warning/20 [a]:hover:bg-warning/20",
        info: "bg-info/10 text-info dark:bg-info/20 [a]:hover:bg-info/20",
        outline:
          "border-border bg-input/20 text-foreground dark:bg-input/30 [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Badge's scale is a single step (h-5). Dense tables — where badges
      // actually live — want one step shorter, and hand-wrote `h-4` at 43 call
      // sites while changing nothing else: not the padding, not the text size.
      // So this is a HEIGHT step and nothing more, the same shape as Button's
      // `md` (which is `sm` plus one height step).
      //
      // Scored against the data rather than designed by taste: `h-4` alone
      // captures 43 sites with ZERO over-claimed. Widening it to `h-4 px-1.5`
      // raises the raw token count to 69 but leaves a supplied token dead at 17
      // of those 43 sites — they agree about the height and disagree about
      // everything else (`px-1`, `px-1.5`, `text-4xs`, `py-0`), so the extra
      // tokens would be decoration the call site overrides.
      size: {
        default: "",
        sm: "h-4",
      },
      // Monospace content (ids, hashes, tokens) is common enough in data-dense
      // tooling that it deserves a first-class flag rather than a `font-mono`
      // override at every call site.
      mono: {
        true: "font-mono",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      mono: false,
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  mono = false,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size, mono }), className),
      },
      props
    ),
    render,
    // `size` is deliberately absent. Every key here becomes a DOM attribute —
    // base-ui's `getStateAttributesProps` emits `data-<key>` for any truthy
    // value — so adding it would put `data-size="default"` on all 167 badges.
    // No library CSS targets `data-size` on a badge, so that would not change
    // the rendering, but it IS a DOM change and it is one the class-level
    // equivalence audit cannot see. Zero-change tranches only: the class is
    // what this axis owns.
    state: {
      slot: "badge",
      variant,
      mono,
    },
  })
}

export { Badge, badgeVariants }
