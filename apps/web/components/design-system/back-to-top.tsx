"use client"

import * as React from "react"
import { ArrowUpIcon } from "@phosphor-icons/react"

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
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-md transition-all hover:border-primary/50 hover:bg-muted hover:text-primary hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-3 duration-200 cursor-pointer"
    >
      <ArrowUpIcon className="size-3.5 text-primary" weight="bold" />
      <span className="hidden sm:inline">Back to top</span>
    </button>
  )
}
