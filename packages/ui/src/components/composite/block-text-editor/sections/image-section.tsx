import * as React from "react"
import { cn } from "../../../../lib/utils"
import type { ImageSectionProps } from "./types"

export const ImageSection = React.memo(function ImageSection({
  block,
}: ImageSectionProps) {
  return (
    <div
      className={cn(
        // Layout & Positioning
        "group/img relative flex flex-col items-center",

        // Sizing & Spacing
        "my-3"
      )}
    >
      <img
        src={block.data?.src}
        loading="lazy"
        alt={block.data?.alt || "Embedded Image"}
        className={cn(
          // Sizing & Spacing
          "max-h-[500px] max-w-full rounded-lg border object-contain shadow-sm",

          // Backgrounds & Borders
          "bg-card"
        )}
      />
      {block.data?.alt && (
        <span
          className={cn(
            // Sizing & Spacing
            "mt-1",

            // Typography
            "text-center text-2xs text-muted-foreground italic"
          )}
        >
          {block.data.alt}
        </span>
      )}
    </div>
  )
})
