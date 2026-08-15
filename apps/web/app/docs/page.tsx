import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { getDocBySlug, getDocPagination } from "@/lib/docs"
import { mdxComponents } from "@/components/docs/mdx-components"
import { DocsToc } from "@/components/docs/toc"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr"

export const metadata: Metadata = {
  title: "Documentation — Celestia Starter",
  description: "A modern full-stack monorepo starter built with Next.js 16, Hono, Better Auth, and Drizzle ORM.",
}

export default async function DocsIndexPage() {
  const doc = getDocBySlug([])
  if (!doc) notFound()

  const pagination = getDocPagination("")

  return (
    <div className="flex gap-8">
      {/* Main Content Article */}
      <article className="flex-1 min-w-0 max-w-4xl">
        {/* Page Title & Header */}
        <div className="border-b border-border/60 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
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

        {/* Previous & Next Page Navigation Footer */}
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
