"use client"

import { Check, Copy } from "@phosphor-icons/react"
import * as React from "react"
import { Button } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

/**
 * Copyable install command — the product's real entry point, shown as
 * a first-class CTA.
 */
export function CopyCommand({ className }: Readonly<{ className?: string }>) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText("npx @celestia-project/create my-app")
      setCopied(true)
    } catch {
      // Clipboard unavailable (permissions / older browsers) — no-op,
      // the command stays visible and selectable.
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-lg border border-stroke bg-surface p-1 pl-4 font-mono text-sm",
        "transition-[border-color,box-shadow] duration-200 hover:border-[#4e85bf66] motion-reduce:transition-none",
        className,
      )}
    >
      <span className="select-none text-fog">$</span>
      <code className="px-2 text-text-primary">
        npx @celestia-project/create my-app
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="shrink-0 text-fog hover:text-text-primary active:scale-90 motion-reduce:active:scale-100"
      >
        {copied ? (
          <Check size={15} weight="bold" className="text-[#89aacc] animate-in fade-in-0 zoom-in-75 duration-150" />
        ) : (
          <Copy size={15} className="transition-transform duration-150" />
        )}
      </Button>
    </div>
  )
}
