import * as React from "react"
import { cn } from "../../../../lib/utils"
import type { CodeSectionProps } from "./types"

export const CodeSection = React.memo(function CodeSection({
  block,
}: CodeSectionProps) {
  return (
    <div
      className={cn(
        // Layout & Positioning
        "overflow-x-auto",

        // Sizing & Spacing
        "my-2 rounded-lg border p-3",

        // Typography
        "font-mono text-xs",

        // Backgrounds & Borders
        "border-border bg-muted/40"
      )}
    >
      {block.data?.lang && (
        <div
          className={cn(
            // Sizing & Spacing
            "mb-1",

            // Typography
            "text-3xs font-semibold text-muted-foreground uppercase select-none"
          )}
        >
          {block.data.lang}
        </div>
      )}
      <pre
        className={cn(
          // Layout & Positioning
          "overflow-x-auto whitespace-pre"
        )}
      >
        {block.data?.code}
      </pre>
    </div>
  )
})
