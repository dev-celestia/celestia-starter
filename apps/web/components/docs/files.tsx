"use client"

import * as React from "react"
import { FolderIcon, FileIcon, FileCodeIcon, FolderOpenIcon } from "@phosphor-icons/react"
import { cn } from "@celestia-project/ui/lib/utils"

export function Files({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "my-5 rounded-xl border border-border/70 bg-muted/20 p-3 font-mono text-xs shadow-xs",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

export interface FolderProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  defaultOpen?: boolean
}

export function Folder({ name, defaultOpen = true, children, className, ...props }: FolderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-left font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
      >
        {isOpen ? (
          <FolderOpenIcon className="size-4 text-primary shrink-0" weight="fill" />
        ) : (
          <FolderIcon className="size-4 text-primary shrink-0" weight="fill" />
        )}
        <span>{name}</span>
      </button>
      {isOpen && (
        <div className="ml-4 flex flex-col border-l border-border/60 pl-2 pt-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

export interface FileProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  icon?: React.ReactNode
}

export function File({ name, icon, className, ...props }: FileProps) {
  const isCode = name.endsWith(".ts") || name.endsWith(".tsx") || name.endsWith(".js") || name.endsWith(".json") || name.endsWith(".mdx")

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      {...props}
    >
      {icon || (isCode ? (
        <FileCodeIcon className="size-4 text-muted-foreground shrink-0" />
      ) : (
        <FileIcon className="size-4 text-muted-foreground shrink-0" />
      ))}
      <span>{name}</span>
    </div>
  )
}
