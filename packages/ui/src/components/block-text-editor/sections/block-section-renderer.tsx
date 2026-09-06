import * as React from "react"
import type { BlockSectionRendererProps } from "./types"
import { HeadingSection } from "./heading-section"
import { ParagraphSection } from "./paragraph-section"
import { QuoteSection } from "./quote-section"
import { TaskListSection } from "./task-list-section"
import { ListSection } from "./list-section"
import { ImageSection } from "./image-section"
import { CodeSection } from "./code-section"

/**
 * Dispatches parsed markdown blocks to their dedicated presentational & interactive section renderers.
 */
export const BlockSectionRenderer = React.memo(function BlockSectionRenderer({
  block,
  onToggleTask,
  onUpdateContent,
}: BlockSectionRendererProps) {
  switch (block.type) {
    case "h1":
    case "h2":
    case "h3":
      return (
        <HeadingSection
          block={block}
          level={block.type}
          onUpdateContent={onUpdateContent}
        />
      )

    case "quote":
      return <QuoteSection block={block} onUpdateContent={onUpdateContent} />

    case "task":
      return (
        <TaskListSection
          block={block}
          onToggleTask={onToggleTask}
          onUpdateContent={onUpdateContent}
        />
      )

    case "ul":
      return (
        <ListSection
          block={block}
          ordered={false}
          onUpdateContent={onUpdateContent}
        />
      )

    case "ol":
      return (
        <ListSection
          block={block}
          ordered={true}
          onUpdateContent={onUpdateContent}
        />
      )

    case "image":
      return <ImageSection block={block} onUpdateContent={onUpdateContent} />

    case "code":
      return <CodeSection block={block} onUpdateContent={onUpdateContent} />

    case "p":
    default:
      return (
        <ParagraphSection block={block} onUpdateContent={onUpdateContent} />
      )
  }
})
