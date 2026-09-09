import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  PencilSimpleIcon,
  TrashIcon,
  DotsSixVerticalIcon,
} from "@phosphor-icons/react"
import { cn } from "../../../lib/utils"
import type { SortableBlockItemProps } from "./types"
import {
  getBlockIcon,
  getBlockTypeLabel,
  getBlockSummaryText,
} from "./block-icons"
import { BlockSectionRenderer } from "./sections"

/**
 * Memoized Sortable block item with native browser virtualization (content-visibility: auto)
 */
export const SortableBlockItem = React.memo(function SortableBlockItem({
  block,
  isAnyDragging,
  isJustDropped,
  onToggleTask,
  onStartEditing,
  onDeleteBlock,
  onUpdateContent,
  canEdit,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ||
      "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease",
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : "auto",
  }

  // When ANY block is being dragged (or settling into place), ALL sections minimize into full-width 1-line bars
  if (isAnyDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          // Layout & Positioning
          "flex w-full items-center justify-between select-none",

          // Sizing & Spacing
          "h-9 gap-2.5 rounded-lg border px-3",

          // Typography
          "font-mono text-xs",

          // Backgrounds & Borders
          isDragging
            ? "scale-[0.99] border-dashed border-primary bg-primary/10 text-primary ring-2 ring-primary/40"
            : "border-border bg-muted/40 text-foreground hover:border-primary/40 hover:bg-muted/70",

          // Interactive & States
          "cursor-grab transition-all duration-200 ease-out active:cursor-grabbing"
        )}
      >
        <div
          className={cn(
            // Layout & Positioning
            "flex min-w-0 flex-1 items-center",

            // Sizing & Spacing
            "gap-2"
          )}
        >
          <DotsSixVerticalIcon
            className={cn(
              // Sizing & Spacing
              "size-3.5 shrink-0",

              // Typography
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
          {getBlockIcon(block.type)}
          <span
            className={cn(
              // Sizing & Spacing
              "shrink-0 rounded px-1.5 py-0.5",

              // Typography
              "text-[10px] font-bold tracking-wider uppercase",

              // Backgrounds & Borders
              isDragging
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {getBlockTypeLabel(block.type)}
          </span>
          <span
            className={cn(
              // Typography
              "truncate text-xs text-foreground/80"
            )}
          >
            {getBlockSummaryText(block)}
          </span>
        </div>

        <span
          className={cn(
            // Sizing & Spacing
            "shrink-0",

            // Typography
            "font-mono text-[10px] text-muted-foreground"
          )}
        >
          L{block.startLine + 1}
          {block.endLine > block.startLine ? `-${block.endLine + 1}` : ""}
        </span>
      </div>
    )
  }

  // Normal full rendered view with smooth expand animation
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        // Layout & Positioning
        "group/item relative flex w-full items-start [contain-intrinsic-size:auto_50px] [content-visibility:auto]",

        // Sizing & Spacing
        "-m-1.5 rounded-lg p-1.5",

        // Interactive & States
        "transition-all duration-350 ease-out",
        canEdit && "cursor-text hover:bg-muted/20",
        isJustDropped &&
          "animate-in bg-primary/5 shadow-xs ring-2 ring-primary/50 duration-500 fade-in zoom-in-[0.98]"
      )}
      onDoubleClick={canEdit ? onStartEditing : undefined}
      title={canEdit ? "Double-click to edit this section" : undefined}
    >
      {/* Notion-style 6-Dot Drag Handle */}
      {canEdit && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            // Layout & Positioning
            "flex shrink-0 items-center justify-center",

            // Sizing & Spacing
            "me-1.5 mt-0.5 size-5 rounded",

            // Typography
            "text-muted-foreground hover:text-foreground",

            // Backgrounds & Borders
            "hover:bg-muted",

            // Interactive & States
            "cursor-grab opacity-0 transition-opacity select-none group-hover/item:opacity-100 active:cursor-grabbing"
          )}
          title="Drag to reorder section"
        >
          <DotsSixVerticalIcon className="size-4" />
        </div>
      )}

      {/* Main Segment Content View */}
      <div
        className={cn(
          // Layout & Positioning
          "w-full min-w-0 flex-1",

          // Interactive & States
          "animate-in transition-all duration-350 ease-out fade-in"
        )}
      >
        <BlockSectionRenderer
          block={block}
          onToggleTask={onToggleTask}
          onUpdateContent={onUpdateContent}
        />
      </div>

      {/* Floating Action Buttons: Absolute positioned so content takes 100% full width */}
      {canEdit && (
        <div
          className={cn(
            // Layout & Positioning
            "absolute top-1.5 right-1.5 z-10 flex items-center",

            // Sizing & Spacing
            "gap-1 rounded-md p-0.5",

            // Backgrounds & Borders
            "border bg-background/90 shadow-xs backdrop-blur-xs",

            // Interactive & States
            "opacity-0 transition-opacity duration-150 group-hover/item:opacity-100"
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onStartEditing()
            }}
            className={cn(
              // Layout & Positioning
              "flex items-center justify-center",

              // Sizing & Spacing
              "size-5 rounded p-0",

              // Typography & Colors
              "text-muted-foreground hover:text-primary",

              // Backgrounds & Borders
              "hover:bg-muted/80",

              // Interactive & States
              "cursor-pointer transition-colors"
            )}
            title="Edit section"
          >
            <PencilSimpleIcon className="size-3" />
          </button>

          {onDeleteBlock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteBlock()
              }}
              className={cn(
                // Layout & Positioning
                "flex items-center justify-center",

                // Sizing & Spacing
                "size-5 rounded p-0",

                // Typography & Colors
                "text-muted-foreground hover:text-destructive",

                // Backgrounds & Borders
                "hover:bg-destructive/10",

                // Interactive & States
                "cursor-pointer transition-colors"
              )}
              title="Delete section"
            >
              <TrashIcon className="size-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
})
