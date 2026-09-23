"use client"

import * as React from "react"
import { cn } from "@celestia-project/ui/lib/utils"

/**
 * Scroll-reveal wrapper. Content is fully visible by default; the
 * hidden starting state is only applied here (client-side, motion
 * allowed, IntersectionObserver present) so nothing ever ships blank.
 * Stagger between siblings is handled by the .reveal-stagger CSS class
 * on the parent — no props, no inline styles.
 */
export function Reveal({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (typeof IntersectionObserver === "undefined") return

    node.dataset.reveal = ""

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add("is-revealed")
            observer.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(node)

    // Failsafe: never leave content hidden if the observer misfires.
    const failsafe = window.setTimeout(() => {
      node.classList.add("is-revealed")
    }, 2500)

    return () => {
      observer.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
