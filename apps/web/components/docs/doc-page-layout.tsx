import * as React from "react"
import type { DocPage } from "@/lib/docs"
import { DocsBreadcrumbs, type BreadcrumbItem } from "@/components/docs/breadcrumbs"
import { DocsPagination, type PaginationItem } from "@/components/docs/pagination"
import { DocRenderer } from "@/components/docs/doc-renderer"
import { DocsToc } from "@/components/docs/toc"

export interface DocPageLayoutProps {
  doc: DocPage
  breadcrumbs?: BreadcrumbItem[]
  pagination?: {
    prev: PaginationItem | null
    next: PaginationItem | null
  }
}

export function DocPageLayout({
  doc,
  breadcrumbs,
  pagination,
}: DocPageLayoutProps) {
  return (
    <div className="flex gap-8">
      {/* Main Content Article */}
      <article className="flex-1 min-w-0 max-w-4xl">
        {/* Breadcrumb Trail */}
        {breadcrumbs && breadcrumbs.length > 1 && (
          <DocsBreadcrumbs items={breadcrumbs} />
        )}

        {/* Page Header */}
        <div className="border-b border-border/60 pb-6 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {doc.meta.title}
          </h1>
          {doc.meta.description && (
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {doc.meta.description}
            </p>
          )}
        </div>

        {/* MDX Body Content */}
        <DocRenderer content={doc.content} />

        {/* Previous & Next Page Pagination */}
        {pagination && (
          <DocsPagination prev={pagination.prev} next={pagination.next} />
        )}
      </article>

      {/* Right Rail Table of Contents */}
      <DocsToc toc={doc.toc} />
    </div>
  )
}
