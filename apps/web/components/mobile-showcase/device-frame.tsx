import type { ReactNode } from "react"
import { cn } from "@celestia-project/ui/lib/utils"

/**
 * A device frame for the `/mobile` screen gallery.
 *
 * Deliberately **not** a photoreal hardware render. A bezel wants a fixed dark
 * plastic colour, and a fixed colour is exactly what the token layer forbids —
 * it would be wrong in one of the two themes and would stop tracking the accent
 * customiser. So the frame is drawn as a screen *card* instead: a bordered,
 * elevated rounded rect with a status bar and a home indicator, all from
 * semantic tokens. It reads as a phone at a glance and is correct in light and
 * dark without a single literal.
 *
 * The one shape that needs to be opaque is the camera island. It is drawn as a
 * low-contrast cutout (`bg-foreground/10`) rather than a black pill, so it
 * suggests the cutout without asserting a colour the theme does not own.
 *
 * The corner is `rounded-3xl` — the top of the token scale — rather than a
 * literal. This is a design-system showcase, so the frame previewing the
 * system's own corner radius is the point: turn the radius down in the theme
 * customiser and the mockups follow, exactly as the screens inside them do.
 */

const SCREEN_WIDTH = "w-[268px]"

export interface DeviceFrameProps {
  /** Caption under the frame — usually the module path. */
  caption?: string
  /** Accessible name for the whole frame. */
  label: string
  children: ReactNode
  /** Status-bar clock. Fixed so server and client markup agree. */
  time?: string
  className?: string
}

/** Signal bars, Wi-Fi and battery, drawn as marks — no icon dependency. */
function StatusGlyphs() {
  return (
    <span aria-hidden className="flex items-center gap-1">
      {/* Signal */}
      <span className="flex items-end gap-[1.5px]">
        <span className="bg-foreground h-1 w-[2.5px] rounded-[1px]" />
        <span className="bg-foreground h-1.5 w-[2.5px] rounded-[1px]" />
        <span className="bg-foreground h-2 w-[2.5px] rounded-[1px]" />
        <span className="bg-foreground/35 h-2.5 w-[2.5px] rounded-[1px]" />
      </span>
      {/* Wi-Fi */}
      <svg viewBox="0 0 16 12" className="h-2.5 w-3 fill-current">
        <path d="M8 10.4 6.1 8.5a2.7 2.7 0 0 1 3.8 0L8 10.4Zm0-4.1a5.9 5.9 0 0 0-4.2 1.7L2.4 6.6a8 8 0 0 1 11.2 0l-1.4 1.4A5.9 5.9 0 0 0 8 6.3Zm0-4A9.9 9.9 0 0 0 .9 5.2L-.5 3.8a11.9 11.9 0 0 1 17 0l-1.4 1.4A9.9 9.9 0 0 0 8 2.3Z" />
      </svg>
      {/* Battery */}
      <span className="border-foreground/40 relative flex h-2.5 w-5 items-center rounded-[3px] border p-[1.5px]">
        <span className="bg-foreground h-full w-3/4 rounded-[1px]" />
        <span className="bg-foreground/40 absolute -right-[3px] h-1 w-[2px] rounded-r-[1px]" />
      </span>
    </span>
  )
}

export function DeviceFrame({
  caption,
  label,
  children,
  time = "9:41",
  className,
}: DeviceFrameProps) {
  return (
    <figure className={cn("flex flex-col items-center gap-3", className)}>
      <div
        role="img"
        aria-label={label}
        className={cn(
          "border-border bg-background shadow-3d relative overflow-hidden rounded-3xl border",
          SCREEN_WIDTH
        )}
      >
        {/* Camera island */}
        <div
          aria-hidden
          className="border-border/70 bg-foreground/10 absolute top-2 left-1/2 z-10 h-[18px] w-[74px] -translate-x-1/2 rounded-full border"
        />

        {/* Status bar — sits under the island, so the clock clears it */}
        <div className="text-foreground flex h-9 items-center justify-between px-5 pt-1 text-3xs font-semibold">
          <span className="tabular-nums">{time}</span>
          <StatusGlyphs />
        </div>

        {/* Screen body. `overflow-hidden` clips any screen that runs long. */}
        <div className="relative h-[540px] overflow-hidden">{children}</div>

        {/* Home indicator */}
        <div
          aria-hidden
          className="bg-foreground/25 mx-auto mb-2 h-1 w-24 rounded-full"
        />
      </div>

      {caption ? (
        <figcaption className="text-muted-foreground max-w-[268px] text-center font-mono text-3xs">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
