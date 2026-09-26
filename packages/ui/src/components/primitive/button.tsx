import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap outline-none select-none transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // ponytail: Clean 3D style using vertical translation and box shadows to represent physical depth without layout shift.
        // The `shadow-3d-*` tokens own the edge colour so light/dark are
        // handled in globals.css rather than duplicated per variant.
        default:
          "bg-background border-primary text-primary hover:bg-primary/10 shadow-3d-primary active:translate-y-[2px] active:shadow-none active:transition-none",
        // No `dark:bg-destructive/60` fade: `--destructive` is a light red
        // (#ff6467) in dark mode, so the surface stays solid and the paired
        // `--destructive-foreground` token supplies a compliant text colour
        // (6.21:1 dark / 4.77:1 light, hover included).
        destructive:
          "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive-3d active:translate-y-[2px] active:shadow-none active:transition-none",
        outline:
          "border-border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-3d active:translate-y-[2px] active:shadow-none active:transition-none",
        secondary:
          "bg-secondary border-secondary text-secondary-foreground hover:bg-secondary/80 shadow-3d active:translate-y-[2px] active:shadow-none active:transition-none",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        // Ghost's chrome with a de-emphasised label. The app hand-wrote exactly
        // this pair — `text-muted-foreground hover:text-foreground` on top of
        // `variant="ghost"` — at 54 call sites, because `ghost` has no resting
        // colour of its own and `muted-foreground` is what a quiet row action
        // wants until you point at it.
        //
        // Ghost's `hover:text-accent-foreground` is deliberately NOT carried
        // over: `hover:text-foreground` follows it and wins, so restating it
        // would be a dead declaration dressing up the variant. The hover
        // surface (`hover:bg-accent`) and its dark step are carried over
        // verbatim, which is what keeps a ghost -> quiet swap CSS-preserving.
        quiet:
          "text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 text-xs/relaxed has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-3xs has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        // `default` (h-8) is the uniform control height across this package —
        // `input`, `select`, `native-select`, `toggle`, `input-group`,
        // `tabs` list and `tab-bar` items all sit at h-8 so controls line up in
        // form rows and toolbars. `md` (h-7) is the compact step below it,
        // matching menu/option rows (`min-h-7`) and `sidebar` sm. `md` is `sm`
        // with one more step of height and nothing else changed, which is why
        // moving a site from `sm` to `md` cannot alter anything but the height.
        md: "h-7 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-9 gap-1.5 px-3.5 text-xs/relaxed has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-9 [&_svg:not([class*='size-'])]:size-4",
      },
      // Monospace labels (ids, hashes, tokens) are common in data-dense tooling.
      mono: {
        true: "font-mono",
        false: "",
      },
      // Leading, as a first-class choice. Every size above carries its text step
      // with *relaxed* leading (`text-xs/relaxed` = 12px/19.5px), but the app
      // wrote `text-xs` at 152 call sites to get the same 12px on its default
      // 16px leading — the size never changed, only the leading. That is a real
      // preference, not drift, so it gets a name instead of a `className`.
      //
      // `tight` is spelled as the whole `text-*` token because there is no
      // `leading-*` step for the 1.3333 ratio: `leading-tight` is 1.25 and
      // `leading-normal` is 1.5, neither of which is what `text-xs` resolves to.
      // On `size="xs"` (which carries `text-3xs`) `tight` therefore also steps
      // the size up to 12px — which is exactly what those call sites already did
      // by hand, so moving them here is behaviour-preserving either way.
      leading: {
        relaxed: "",
        tight: "text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      mono: false,
      leading: "relaxed",
    },
  }
)

export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>

function Button({
  className,
  variant = "default",
  size = "default",
  mono = false,
  leading = "relaxed",
  nativeButton,
  render,
  ...props
}: ButtonProps) {
  const isNative =
    nativeButton ??
    (React.isValidElement(render) && render.type !== "button"
      ? false
      : undefined)

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, mono, leading, className }))}
      nativeButton={isNative}
      render={render}
      {...props}
    />
  )
}

export { Button, buttonVariants }
