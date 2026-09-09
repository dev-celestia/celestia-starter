import * as React from "react"
import { PlusIcon } from "@phosphor-icons/react"
import { cn } from "../../../lib/utils"
import { AddSectionMenu } from "./add-section-menu"
import type { SectionTemplateItem } from "./types"

interface AddSectionDividerProps {
  templates?: SectionTemplateItem[]
  onSelectTemplate: (template: SectionTemplateItem) => void
  className?: string
}

export function AddSectionDivider({
  templates,
  onSelectTemplate,
  className,
}: AddSectionDividerProps) {
  return (
    <div
      className={cn(
        // Layout & Positioning
        "group/divider relative z-20 my-0.5 flex items-center justify-center",

        // Sizing & Spacing
        "h-3 w-full",

        className
      )}
    >
      {/* Subtle Divider Line shown on hover */}
      <div
        className={cn(
          // Layout & Positioning
          "absolute inset-x-0 h-px transition-opacity duration-150",

          // Backgrounds & Borders
          "bg-primary/30 opacity-0 group-hover/divider:opacity-100"
        )}
      />

      {/* Floating Centered Plus Button */}
      <AddSectionMenu
        templates={templates}
        onSelectTemplate={onSelectTemplate}
        trigger={
          <button
            type="button"
            className={cn(
              // Layout & Positioning
              "relative z-10 flex items-center justify-center transition-all duration-150",

              // Sizing & Spacing
              "size-4 rounded-full border shadow-2xs",

              // Backgrounds & Borders
              "bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted hover:text-primary",

              // Interactive & States
              "cursor-pointer opacity-0 group-hover/divider:scale-110 group-hover/divider:opacity-100"
            )}
            title="Insert section here"
          >
            <PlusIcon className="size-2.5 stroke-[3]" />
          </button>
        }
      />
    </div>
  )
}
