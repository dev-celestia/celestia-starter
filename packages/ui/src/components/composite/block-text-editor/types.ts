import * as React from "react"

export interface BlockTaskItem {
  lineIndex: number
  isChecked: boolean
  text: string
}

export interface ParsedBlock {
  id: string
  startLine: number
  endLine: number
  type:
    | "h1"
    | "h2"
    | "h3"
    | "quote"
    | "task"
    | "ul"
    | "ol"
    | "image"
    | "code"
    | "p"
  rawText: string
  data?: {
    text?: string
    code?: string
    lang?: string
    alt?: string
    src?: string
    tasks?: BlockTaskItem[]
    items?: string[]
  }
}

/**
 * A insertable section template offered by the Add Section menu.
 * Templates with `templateMarkdown` insert markdown content;
 * templates with `action` invoke a custom side effect instead.
 */
export interface SectionTemplateItem {
  id: string
  category: string
  label: string
  description: string
  icon: React.ReactNode
  templateMarkdown?: string
  action?: () => void
}

export interface BlockTextEditorProps {
  content: string
  onUpdateContent?: (newContent: string) => void
  className?: string
  /** Section templates offered in the Add Section menus. Defaults to DEFAULT_SECTION_TEMPLATES. */
  sectionTemplates?: SectionTemplateItem[]
  /** Overrides the default empty-state title/description copy. */
  emptyStateCopy?: { title: string; description: string }
  /** Called with image files dropped onto the editor. Defaults to embedding them as base64 markdown images. */
  onFilesDrop?: (files: File[]) => void | Promise<void>
  /** Copy for the file drag overlay. */
  dropHint?: string
}

export interface SortableBlockItemProps {
  block: ParsedBlock
  isAnyDragging: boolean
  isJustDropped?: boolean
  onToggleTask: (lineIndex: number) => void
  onStartEditing: () => void
  onDeleteBlock?: () => void
  onUpdateContent?: (content: string) => void
  canEdit: boolean
}
