"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { cn } from "@celestia-project/ui/lib/utils"
import { DragHandle } from "@celestia-project/ui/primitive/drag-handle"
import { DropIndicator } from "@celestia-project/ui/primitive/drop-indicator"

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "1" } },
  }),
}

type SortableItemData = {
  id: UniqueIdentifier
  label: string
}

function SortableRow({
  item,
  disabled,
  children,
}: {
  item: SortableItemData
  disabled?: boolean
  children?: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: item.id, disabled })

  const style: React.CSSProperties = {
    transition,
  }

  return (
    <div className="flex w-full flex-col">
      <DropIndicator visible={isOver && !isDragging} />
      <div
        ref={setNodeRef}
        style={style}
        data-slot="sortable-item"
        data-dragging={isDragging || undefined}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border border-border bg-popover px-2.5 py-2 transition-[border-color,background-color] duration-200 ease-out",
          !disabled && "hover:bg-muted/45",
          isOver && !isDragging && "border-primary bg-primary/20"
        )}
      >
        <DragHandle disabled={disabled} {...attributes} {...listeners} />
        <div className="min-w-0 flex-1 text-sm text-foreground">
          {children ?? item.label}
        </div>
      </div>
    </div>
  )
}

function SortableList({
  className,
  items,
  onReorder,
  disabled,
  renderItem,
}: {
  className?: string
  items: SortableItemData[]
  onReorder?: (items: SortableItemData[]) => void
  disabled?: boolean
  renderItem?: (item: SortableItemData) => React.ReactNode
}) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const active = items.find((item) => item.id === activeId) ?? null

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const from = items.findIndex((item) => item.id === active.id)
    const to = items.findIndex((item) => item.id === over.id)
    if (from < 0 || to < 0) return
    onReorder?.(arrayMove(items, from, to))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          data-slot="sortable-list"
          className={cn(
            "flex w-full flex-col gap-1",
            disabled && "opacity-55",
            className
          )}
        >
          {items.map((item) => (
            <SortableRow key={item.id} item={item} disabled={disabled}>
              {renderItem?.(item)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {active ? (
          <div className="flex w-full items-center gap-2 rounded-md border border-border bg-popover px-2.5 py-2 shadow-md">
            <DragHandle />
            <div className="min-w-0 flex-1 text-sm text-foreground">
              {active.label}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export { SortableList, type SortableItemData }
