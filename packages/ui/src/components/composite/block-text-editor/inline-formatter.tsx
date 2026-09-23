import * as React from "react"
import { cn } from "../../../lib/utils"

/**
 * Inline markdown formatting parser
 */
export function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(
    /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g
  )

  return parts.map((part, idx) => {
    if (!part) return null

    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code
          key={idx}
          className={cn(
            // Sizing & Spacing
            "rounded px-1.5 py-0.5 font-mono text-2xs sm:text-xs",

            // Backgrounds & Borders
            "border bg-muted text-primary"
          )}
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }

    const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      return (
        <img
          key={idx}
          src={imgMatch[2]}
          loading="lazy"
          alt={imgMatch[1] || "Embedded Diagram"}
          className={cn(
            // Layout & Positioning
            "my-1 inline-block align-middle",

            // Sizing & Spacing
            "max-h-48 rounded border"
          )}
        />
      )
    }

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/)
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            // Typography
            "text-primary underline",

            // Interactive & States
            "transition-colors hover:text-primary/80"
          )}
        >
          {linkMatch[1]}
        </a>
      )
    }

    return part
  })
}
