import * as React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { getAllDocSlugs, getDocBySlug, getDocPagination } from "@/lib/docs"
import { mdxComponents } from "@/components/docs/mdx-components"
import { DocsToc } from "@/components/docs/toc"
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretRightIcon as BreadcrumbSeparatorIcon,
  HouseIcon,
} from "@phosphor-icons/react/dist/ssr"

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const allSlugs = getAllDocSlugs()
  return allSlugs.filter((p) => p.slug.length > 0)
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const doc = getDocBySlug(params.slug)
  if (!doc) notFound()

  return {
    title: `${doc.meta.title} — Celestia Docs`,
    description: doc.meta.description || `Documentation for ${doc.meta.title}`,
  }
}

export default async function DocSubPage(props: PageProps) {
  const params = await props.params
  const doc = getDocBySlug(params.slug)
  if (!doc) notFound()

  const slugString = params.slug.join("/")
  const pagination = getDocPagination(slugString)

  // Generate breadcrumb items
  const breadcrumbs = [
    { title: "Docs", href: "/docs" },
    ...params.slug.map((segment, index) => {
      const currentSubSlugs = params.slug.slice(0, index + 1)
      const currentSubDoc = getDocBySlug(currentSubSlugs)
      return {
        title: currentSubDoc?.meta.title || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: `/docs/${currentSubSlugs.join("/")}`,
      }
    }),
  ]

  return (
    <div className="flex gap-8">
      {/* Main Content Area */}
      <article className="flex-1 min-w-0 max-w-4xl">
        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/docs" className="hover:text-foreground transition-colors flex items-center gap-1">
            <HouseIcon className="size-3.5" />
            <span>Docs</span>
          </Link>
          {breadcrumbs.slice(1).map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 2
            return (
              <React.Fragment key={crumb.href}>
                <BreadcrumbSeparatorIcon className="size-3 text-muted-foreground/50" />
                {isLast ? (
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {crumb.title}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                    {crumb.title}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </nav>

        {/* Page Header */}
        <div className="border-b border-border/60 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {doc.meta.title}
          </h1>
          {doc.meta.description && (
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {doc.meta.description}
            </p>
          )}
        </div>

        {/* MDX Body */}
        <div className="prose-content">
          <MDXRemote
            source={doc.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug],
              },
            }}
          />
        </div>

        {/* Prev / Next Pagination */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
          {pagination.prev ? (
            <Link
              href={pagination.prev.href}
              className="flex items-center gap-2 rounded-xl border border-border/70 p-3.5 text-xs transition-all hover:border-primary/40 hover:bg-muted/40 active:scale-[0.98]"
            >
              <CaretLeftIcon className="size-4 text-muted-foreground" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Previous</span>
                <span className="font-semibold text-foreground">{pagination.prev.title}</span>
              </div>
            </Link>
          ) : <div />}

          {pagination.next && (
            <Link
              href={pagination.next.href}
              className="flex items-center gap-2 rounded-xl border border-border/70 p-3.5 text-xs transition-all hover:border-primary/40 hover:bg-muted/40 active:scale-[0.98] ml-auto"
            >
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Next</span>
                <span className="font-semibold text-foreground">{pagination.next.title}</span>
              </div>
              <CaretRightIcon className="size-4 text-muted-foreground" />
            </Link>
          )}
        </div>
      </article>

      {/* Right Rail Table of Contents */}
      <DocsToc toc={doc.toc} />
    </div>
  )
}
