import * as React from "react"
import { cn } from "../../../lib/utils"
import { renderInlineFormatting } from "../inline-formatter"
import type { QuoteSectionProps } from "./types"

export const QuoteSection = React.memo(function QuoteSection({
  block,
}: QuoteSectionProps) {
  return (
    <blockquote
      className={cn(
        // Sizing & Spacing
        "my-1 border-s-2 py-1 ps-3",

        // Typography
        "text-xs text-muted-foreground italic sm:text-sm",

        // Backgrounds & Borders
        "rounded-e border-primary bg-primary/5"
      )}
    >
      {renderInlineFormatting(block.data?.text || "")}
    </blockquote>
  )
})
