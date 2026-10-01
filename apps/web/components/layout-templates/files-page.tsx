"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Badge } from "@celestia-project/ui/primitive/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui/primitive/table"
import {
  PageShell,
  type PageShellProps,
} from "@celestia-project/ui/composite/page-shell"

export interface FileEntry {
  id: string
  name: string
  /** Short type label — "Folder", "Figma", "PDF". Rendered as a badge. */
  kind: string
  size: string
  modified: string
  owner?: string
}

export interface FilesPageProps extends Omit<PageShellProps, "children"> {
  /** Path segments, most-significant first. The last one renders as current. */
  breadcrumb: string[]
  folders: { id: string; name: string; count?: number }[]
  activeFolderId?: string
  onFolderChange?: (id: string) => void
  files: FileEntry[]
  /** Trailing controls above the table — view switch, upload, sort. */
  toolbar?: React.ReactNode
  onOpenFile?: (id: string) => void
}

/**
 * The file browser: a folder rail beside a table of entries.
 *
 * The rail is navigation, not content, so it collapses entirely below `lg` and
 * the breadcrumb carries the location instead — a two-column split at tablet
 * width would leave the table too narrow to read a filename and a date at once.
 */
function FilesPage({
  breadcrumb,
  folders,
  activeFolderId,
  onFolderChange,
  files,
  toolbar,
  onOpenFile,
  ...shellProps
}: FilesPageProps) {
  return (
    <PageShell {...shellProps}>
      <div data-slot="files-page" className="flex min-h-0 flex-1 gap-4">
        <aside
          data-slot="files-page-folders"
          className="hidden w-56 shrink-0 flex-col gap-1 rounded-xl border border-border/70 bg-card p-2 lg:flex"
        >
          <span className="px-2.5 py-1.5 text-3xs font-medium tracking-wide text-muted-foreground uppercase">
            Locations
          </span>
          {folders.map((folder) => {
            const isActive = folder.id === activeFolderId
            return (
              <button
                key={folder.id}
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onFolderChange?.(folder.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="truncate">{folder.name}</span>
                {folder.count != null && (
                  <span className="ms-auto text-3xs text-muted-foreground/70 tabular-nums">
                    {folder.count}
                  </span>
                )}
              </button>
            )
          })}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          >
            {breadcrumb.map((segment, index) => {
              const isLast = index === breadcrumb.length - 1
              return (
                <React.Fragment key={segment}>
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/50"
                    >
                      /
                    </span>
                  )}
                  <span
                    className={cn(
                      isLast ? "font-medium text-foreground" : undefined
                    )}
                  >
                    {segment}
                  </span>
                </React.Fragment>
              )
            })}
          </nav>

          {toolbar && (
            <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
          )}

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="text-end">Size</TableHead>
                  <TableHead className="hidden text-end sm:table-cell">
                    Modified
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    onClick={onOpenFile ? () => onOpenFile(file.id) : undefined}
                    className={cn(onOpenFile && "cursor-pointer")}
                  >
                    <TableCell className="font-medium text-foreground">
                      {file.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" size="sm">
                        {file.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {file.owner ?? "—"}
                    </TableCell>
                    <TableCell className="text-end text-muted-foreground tabular-nums">
                      {file.size}
                    </TableCell>
                    <TableCell className="hidden text-end text-muted-foreground tabular-nums sm:table-cell">
                      {file.modified}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {files.length === 0 && (
              <div className="px-6 py-14 text-center text-sm text-muted-foreground">
                This folder is empty.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

export { FilesPage }
