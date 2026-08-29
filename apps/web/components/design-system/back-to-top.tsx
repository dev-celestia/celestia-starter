"use client"

import * as React from "react"
import { ArrowUpIcon } from "@phosphor-icons/react"
import { Button } from "@celestia-project/ui"

export function BackToTop() {
  const [showBackToTop, setShowBackToTop] = React.useState(false)

  React.useEffect(() => {
    const handleWindowScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleWindowScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleWindowScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!showBackToTop) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed z-50 rounded-full shadow-lg bg-background/90 backdrop-blur-md gap-1.5 active:scale-95 bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] end-[calc(1.5rem+env(safe-area-inset-right,0px))]"
    >
      <ArrowUpIcon className="size-3.5 text-primary" weight="bold" />
      <span className="hidden sm:inline">Back to top</span>
    </Button>
  )
}
