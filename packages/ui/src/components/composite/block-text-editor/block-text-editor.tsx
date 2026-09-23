import * as React from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DropAnimation,
  type Modifier,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../composite/alert-dialog"
import { Button } from "../../primitive/button"
import { ScrollArea } from "../../primitive/scroll-area"
import {
  CheckIcon,
  XIcon,
  UploadSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { cn } from "../../../lib/utils"
import { readFileAsBase64, formatMarkdownImage } from "./image-utils"
import type {
  BlockTextEditorProps,
  ParsedBlock,
  SectionTemplateItem,
} from "./types"
import { parseMarkdownToBlocks } from "./markdown-parser"
import { MinimizedDragPill } from "./minimized-drag-pill"
import { SortableBlockItem } from "./sortable-block-item"
import { getBlockTypeLabel, getBlockSummaryText } from "./block-icons"
import { AddSectionMenu, DEFAULT_SECTION_TEMPLATES } from "./add-section-menu"
import { AddSectionDivider } from "./add-section-divider"

/**
 * Custom modifier to anchor the floating drag pill directly under the cursor
 * Eliminates distance gap when transitioning from full card to minimized 1-line pill
 */
const snapToCursorAnchor: Modifier = ({
  activatorEvent,
  activeNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (!activatorEvent || !activeNodeRect) {
    return transform
  }

  const pointerEvent = activatorEvent as MouseEvent | TouchEvent | PointerEvent
  let clientX = 0
  let clientY = 0

  if ("clientX" in pointerEvent && typeof pointerEvent.clientX === "number") {
    clientX = pointerEvent.clientX
    clientY = pointerEvent.clientY
  } else if ("touches" in pointerEvent && pointerEvent.touches.length > 0) {
    clientX = pointerEvent.touches[0]?.clientX ?? 0
    clientY = pointerEvent.touches[0]?.clientY ?? 0
  } else {
    return transform
  }

  // Calculate grab offset relative to the original element
  const grabOffsetX = clientX - activeNodeRect.left
  const grabOffsetY = clientY - activeNodeRect.top

  // Desired anchor position inside the 36px drag capsule:
  // Horizontally: near the 6-dot drag handle (20px from left)
  // Vertically: center of the capsule (height / 2 ≈ 18px)
  const targetAnchorX = 20
  const targetAnchorY = overlayNodeRect ? overlayNodeRect.height / 2 : 18

  return {
    ...transform,
    x: transform.x + (grabOffsetX - targetAnchorX),
    y: transform.y + (grabOffsetY - targetAnchorY),
  }
}

// Smooth physical spring-like drop animation configuration
const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
  duration: 280,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
}

const DEFAULT_EMPTY_STATE_COPY = {
  title: "Empty Canvas",
  description:
    "Add content sections or drop images from your computer to get started.",
}

const DEFAULT_DROP_HINT = "Drop image here to embed"

/**
 * Notion-style block text editor: renders markdown content as draggable,
 * inline-editable sections with insert menus, task toggles, and image drop support.
 */
export function BlockTextEditor({
  content,
  onUpdateContent,
  className,
  sectionTemplates = DEFAULT_SECTION_TEMPLATES,
  emptyStateCopy = DEFAULT_EMPTY_STATE_COPY,
  onFilesDrop,
  dropHint = DEFAULT_DROP_HINT,
}: BlockTextEditorProps) {
  const [editingBlockId, setEditingBlockId] = React.useState<string | null>(
    null
  )
  const [editingDraftText, setEditingDraftText] = React.useState("")
  const [deletingBlock, setDeletingBlock] = React.useState<ParsedBlock | null>(
    null
  )
  const [isDraggingFile, setIsDraggingFile] = React.useState(false)
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null)
  const [isDropLanding, setIsDropLanding] = React.useState(false)
  const [justDroppedId, setJustDroppedId] = React.useState<string | null>(null)

  // Fast memoized block parsing
  const blocks = React.useMemo(() => {
    return parseMarkdownToBlocks(content)
  }, [content])

  const activeBlock = React.useMemo(() => {
    return blocks.find((b) => b.id === activeDragId) || null
  }, [blocks, activeDragId])

  // Configure DnD Sensors with distance activation to allow click & double-click without triggering drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
    setIsDropLanding(false)
  }, [])

  // Reorder blocks on drag end with delay and smooth wait-then-expand animation
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveDragId(null)

      if (!over || !onUpdateContent) {
        setIsDropLanding(false)
        return
      }

      const activeIdStr = String(active.id)
      setJustDroppedId(activeIdStr)

      // Keep minimized state during drop landing animation (260ms), then smoothly expand
      setIsDropLanding(true)
      setTimeout(() => {
        setIsDropLanding(false)
      }, 260)

      setTimeout(() => {
        setJustDroppedId((curr) => (curr === activeIdStr ? null : curr))
      }, 650)

      if (active.id === over.id) return

      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(blocks, oldIndex, newIndex)
        const newMarkdown = reordered
          .map((b) => b.rawText.trim())
          .filter(Boolean)
          .join("\n\n")
        onUpdateContent(newMarkdown)
        toast.success("Section reordered")
      }
    },
    [blocks, onUpdateContent]
  )

  const handleDragCancel = React.useCallback(() => {
    setActiveDragId(null)
    setIsDropLanding(false)
  }, [])

  // Direct checkbox toggle
  const handleToggleTask = React.useCallback(
    (lineIndex: number) => {
      if (!onUpdateContent) return
      const lines = content.split("\n")
      const targetLine = lines[lineIndex]
      if (!targetLine) return

      if (/^-\s*\[\s*\]\s+/.test(targetLine)) {
        lines[lineIndex] = targetLine.replace(/^-\s*\[\s*\]\s+/, "- [x] ")
      } else if (/^-\s*\[[xX]\]\s+/.test(targetLine)) {
        lines[lineIndex] = targetLine.replace(/^-\s*\[[xX]\]\s+/, "- [ ] ")
      }
      onUpdateContent(lines.join("\n"))
    },
    [content, onUpdateContent]
  )

  // Start editing a block inline
  const handleStartEditing = React.useCallback(
    (block: ParsedBlock) => {
      if (!onUpdateContent) return
      setEditingBlockId(block.id)
      setEditingDraftText(block.rawText)
    },
    [onUpdateContent]
  )

  // Commit inline edit
  const handleSaveEdit = React.useCallback(
    (block: ParsedBlock) => {
      if (!onUpdateContent) return
      const lines = content.split("\n")
      const newBlockLines = editingDraftText.split("\n")

      lines.splice(
        block.startLine,
        block.endLine - block.startLine + 1,
        ...newBlockLines
      )
      onUpdateContent(lines.join("\n"))
      setEditingBlockId(null)
    },
    [content, editingDraftText, onUpdateContent]
  )

  const handleCancelEdit = React.useCallback(() => {
    setEditingBlockId(null)
  }, [])

  // Delete section with modal confirmation
  const handleConfirmDelete = React.useCallback(() => {
    if (!deletingBlock || !onUpdateContent) return
    const lines = content.split("\n")
    lines.splice(
      deletingBlock.startLine,
      deletingBlock.endLine - deletingBlock.startLine + 1
    )
    const cleanedMarkdown = lines.join("\n")
    onUpdateContent(cleanedMarkdown)
    setDeletingBlock(null)
    toast.success("Section deleted")
  }, [deletingBlock, content, onUpdateContent])

  // Insert a new content section template at line offset
  const handleInsertSection = React.useCallback(
    (insertLineIndex: number, template: SectionTemplateItem) => {
      if (template.action) {
        template.action()
        return
      }

      if (!template.templateMarkdown || !onUpdateContent) return

      if (content.trim() === "") {
        onUpdateContent(template.templateMarkdown)
        setEditingBlockId("block-0")
        setEditingDraftText(template.templateMarkdown)
        toast.success(`Added ${template.label}`)
        return
      }

      const lines = content.split("\n")
      const insertAt = Math.min(Math.max(0, insertLineIndex), lines.length)
      const templateLines = template.templateMarkdown.split("\n")

      // Insert template with appropriate line breaks
      lines.splice(insertAt, 0, ...templateLines, "")
      const newContent = lines.join("\n")
      onUpdateContent(newContent)

      // Auto-open inline editor on the newly created block
      setEditingBlockId(`block-${insertAt}`)
      setEditingDraftText(template.templateMarkdown)
      toast.success(`Added ${template.label}`)
    },
    [content, onUpdateContent]
  )

  // Embed dropped image files as base64 markdown images
  const embedDroppedImages = React.useCallback(
    async (files: File[]) => {
      if (!onUpdateContent) return

      try {
        let appendedImages = ""
        for (const file of files) {
          const base64 = await readFileAsBase64(file)
          appendedImages += formatMarkdownImage(file.name, base64)
        }
        onUpdateContent((content ? `${content}\n` : "") + appendedImages)
        toast.success(
          `${files.length === 1 ? "Image" : `${files.length} images`} embedded!`
        )
      } catch {
        toast.error("Failed to embed dropped image")
      }
    },
    [content, onUpdateContent]
  )

  // Handle external file drop onto the editor pane
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(false)

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    )
    if (files.length === 0) return

    if (onFilesDrop) {
      await onFilesDrop(files)
      return
    }

    await embedDroppedImages(files)
  }

  const isAnyDragging = Boolean(activeDragId) || isDropLanding
  const canEdit = Boolean(onUpdateContent)

  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault()
          setIsDraggingFile(true)
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        setIsDraggingFile(false)
      }}
      onDrop={handleFileDrop}
      className={cn(
        // Layout & Positioning
        "relative flex h-full min-h-0 flex-1 flex-col",

        // Backgrounds & Borders
        "bg-background",

        className
      )}
    >
      {/* Visual File Drop Overlay */}
      {isDraggingFile && (
        <div
          className={cn(
            // Layout & Positioning
            "pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center",

            // Sizing & Spacing
            "m-3 gap-3 rounded-xl border-2 border-dashed p-6",

            // Typography
            "text-primary",

            // Backgrounds & Borders
            "border-primary bg-primary/10 backdrop-blur-xs"
          )}
        >
          <UploadSimpleIcon
            className={cn(
              // Sizing & Spacing
              "size-10",

              // Interactive & States
              "animate-bounce"
            )}
          />
          <p className="text-sm font-semibold">{dropHint}</p>
        </div>
      )}

      <ScrollArea className="h-full min-h-0 flex-1">
        <div
          className={cn(
            // Layout & Positioning
            "mx-auto flex h-full w-full max-w-4xl flex-col",

            // Sizing & Spacing
            "gap-1 p-6",

            // Typography
            "text-sm leading-relaxed text-foreground"
          )}
        >
          {content.trim() === "" ? (
            <div
              className={cn(
                // Layout & Positioning
                "flex h-full flex-col items-center justify-center text-center",

                // Sizing & Spacing
                "gap-3 py-16",

                // Typography
                "text-muted-foreground"
              )}
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {emptyStateCopy.title}
                </p>
                <p className="max-w-sm text-xs">{emptyStateCopy.description}</p>
              </div>

              {canEdit && (
                <AddSectionMenu
                  templates={sectionTemplates}
                  onSelectTemplate={(template) =>
                    handleInsertSection(0, template)
                  }
                  trigger={
                    <Button
                      size="sm"
                      variant="default"
                      className="mt-2 cursor-pointer gap-1.5"
                    >
                      <PlusIcon className="size-3.5" />
                      Add First Section
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => {
                  const isEditing = editingBlockId === block.id

                  if (isEditing) {
                    return (
                      <React.Fragment key={block.id}>
                        <div
                          className={cn(
                            // Layout & Positioning
                            "my-1 flex w-full flex-col shadow-md",

                            // Sizing & Spacing
                            "gap-2 rounded-lg border p-2.5",

                            // Backgrounds & Borders
                            "border-primary/50 bg-card ring-1 ring-primary/20"
                          )}
                        >
                          <textarea
                            autoFocus
                            value={editingDraftText}
                            onChange={(e) =>
                              setEditingDraftText(e.target.value)
                            }
                            rows={Math.max(
                              2,
                              editingDraftText.split("\n").length
                            )}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                (e.metaKey || e.ctrlKey)
                              ) {
                                e.preventDefault()
                                handleSaveEdit(block)
                              } else if (e.key === "Escape") {
                                handleCancelEdit()
                              }
                            }}
                            className={cn(
                              // Sizing & Spacing
                              "min-h-[60px] w-full rounded-md p-2",

                              // Typography
                              "font-mono text-xs text-foreground",

                              // Backgrounds & Borders
                              "border bg-muted/30",

                              // Interactive & States
                              "resize-y outline-hidden"
                            )}
                            placeholder="Edit markdown..."
                          />

                          <div
                            className={cn(
                              // Layout & Positioning
                              "flex items-center justify-between border-t pt-1"
                            )}
                          >
                            <span className="font-mono text-3xs text-muted-foreground">
                              Press{" "}
                              <kbd className="font-semibold text-foreground">
                                Cmd+Enter
                              </kbd>{" "}
                              to save,{" "}
                              <kbd className="font-semibold text-foreground">
                                Esc
                              </kbd>{" "}
                              to cancel
                            </span>

                            <div
                              className={cn(
                                // Layout & Positioning
                                "flex items-center",

                                // Sizing & Spacing
                                "gap-1.5"
                              )}
                            >
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className={cn(
                                  // Sizing & Spacing
                                  "h-6 px-2",

                                  // Typography
                                  "cursor-pointer text-xs"
                                )}
                              >
                                <XIcon className="me-1 size-3" />
                                Cancel
                              </Button>

                              <Button
                                size="xs"
                                variant="default"
                                onClick={() => handleSaveEdit(block)}
                                className={cn(
                                  // Sizing & Spacing
                                  "h-6 px-2.5",

                                  // Typography
                                  "cursor-pointer text-xs font-medium"
                                )}
                              >
                                <CheckIcon className="me-1 size-3" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* In-between section insert divider */}
                        {canEdit &&
                          !isAnyDragging &&
                          index < blocks.length - 1 && (
                            <AddSectionDivider
                              templates={sectionTemplates}
                              onSelectTemplate={(template) =>
                                handleInsertSection(block.endLine + 1, template)
                              }
                            />
                          )}
                      </React.Fragment>
                    )
                  }

                  return (
                    <React.Fragment key={block.id}>
                      <SortableBlockItem
                        block={block}
                        isAnyDragging={isAnyDragging}
                        isJustDropped={justDroppedId === block.id}
                        onToggleTask={handleToggleTask}
                        onStartEditing={() => handleStartEditing(block)}
                        onDeleteBlock={() => setDeletingBlock(block)}
                        onUpdateContent={onUpdateContent}
                        canEdit={canEdit}
                      />

                      {/* In-between section hover insert divider */}
                      {canEdit &&
                        !isAnyDragging &&
                        index < blocks.length - 1 && (
                          <AddSectionDivider
                            templates={sectionTemplates}
                            onSelectTemplate={(template) =>
                              handleInsertSection(block.endLine + 1, template)
                            }
                          />
                        )}
                    </React.Fragment>
                  )
                })}
              </SortableContext>

              {/* Minimized Full-Width 1-Line Drag Overlay Capsule with smooth drop animation and anchor alignment */}
              <DragOverlay
                dropAnimation={dropAnimationConfig}
                modifiers={[snapToCursorAnchor]}
              >
                {activeBlock ? <MinimizedDragPill block={activeBlock} /> : null}
              </DragOverlay>
            </DndContext>
          )}

          {/* Bottom "+ Add Section" Footer Button */}
          {content.trim() !== "" && canEdit && !isAnyDragging && (
            <div className="flex w-full flex-col items-center gap-1.5 pt-3">
              <AddSectionDivider
                templates={sectionTemplates}
                onSelectTemplate={(template) =>
                  handleInsertSection(content.split("\n").length, template)
                }
              />

              <AddSectionMenu
                templates={sectionTemplates}
                onSelectTemplate={(template) =>
                  handleInsertSection(content.split("\n").length, template)
                }
                trigger={
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-8 w-full max-w-sm cursor-pointer gap-1.5 rounded-lg border border-dashed border-border/80 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/60 hover:text-foreground"
                  >
                    <PlusIcon className="size-3.5" />
                    Add Section
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Modal Dialog */}
      <AlertDialog
        open={deletingBlock !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingBlock(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{" "}
              {deletingBlock
                ? getBlockTypeLabel(deletingBlock.type).toLowerCase()
                : "section"}
              ?
              {deletingBlock && (
                <span className="mt-2 block truncate rounded border bg-muted/50 p-2 font-mono text-xs text-foreground/80">
                  {getBlockSummaryText(deletingBlock)}
                </span>
              )}
              <span className="mt-2 block text-xs text-muted-foreground">
                This will remove the section from your content. You can undo
                this anytime using{" "}
                <kbd className="font-semibold text-foreground">Cmd+Z</kbd> in
                the editor.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBlock(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
