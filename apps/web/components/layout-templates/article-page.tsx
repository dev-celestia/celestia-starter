"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Avatar, AvatarFallback } from "@celestia-project/ui/primitive/avatar"
import { Badge } from "@celestia-project/ui/primitive/badge"
import { Separator } from "@celestia-project/ui/primitive/separator"

export interface ArticleTocItem {
  id: string
  label: string
  /** `2` indents the entry one step under a `1`. */
  level?: 1 | 2
}

export interface ArticleAuthor {
  name: string
  role?: string
  avatarFallback?: string
}

export interface RelatedArticle {
  id: string
  title: string
  category: string
  readingTime?: string
}

export interface ArticlePageProps extends React.ComponentProps<"div"> {
  category?: string
  title: string
  description?: string
  author: ArticleAuthor
  publishedAt: string
  readingTime?: string
  /** Hero image slot. A placeholder band renders when omitted. */
  cover?: React.ReactNode
  /** Table of contents. Renders a sticky rail beside the body from `lg` up. */
  toc?: ArticleTocItem[]
  related?: RelatedArticle[]
}

/**
 * The long-form reading layout: a centered measure with a sticky contents rail.
 *
 * The body is `children` rather than a markdown string — the consumer already
 * owns its renderer, and this component's job is the *frame*: measure, rhythm,
 * and where the rail sits relative to the prose.
 */
function ArticlePage({
  category,
  title,
  description,
  author,
  publishedAt,
  readingTime,
  cover,
  toc,
  related,
  className,
  children,
  ...props
}: ArticlePageProps) {
  const hasToc = toc != null && toc.length > 0

  return (
    <div
      data-slot="article-page"
      className={cn("mx-auto w-full max-w-6xl px-6 py-14", className)}
      {...props}
    >
      <header className="mx-auto flex max-w-3xl flex-col gap-4">
        {category && (
          <Badge variant="secondary" className="w-fit">
            {category}
          </Badge>
        )}
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-balance text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
        <div className="flex items-center gap-3 pt-1">
          <Avatar>
            <AvatarFallback>{author.avatarFallback ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-medium text-foreground">
              {author.name}
            </span>
            <span className="text-3xs text-muted-foreground">
              {[author.role, publishedAt, readingTime]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        className="mx-auto mt-8 flex h-56 w-full max-w-4xl items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/12 via-transparent to-transparent sm:h-72"
      >
        {cover}
      </div>

      <div
        className={cn(
          "mx-auto mt-12 gap-10",
          hasToc ? "grid max-w-5xl lg:grid-cols-[1fr_14rem]" : "max-w-3xl"
        )}
      >
        <article className="flex min-w-0 flex-col gap-6">{children}</article>

        {hasToc && (
          <aside className="hidden lg:block">
            <nav className="sticky top-8 flex flex-col gap-2 border-s border-border/70 ps-5">
              <span className="text-3xs font-medium tracking-wide text-foreground uppercase">
                On this page
              </span>
              {toc?.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    "text-xs leading-relaxed text-muted-foreground transition-colors hover:text-foreground",
                    item.level === 2 && "ps-3"
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>

      {related && related.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl">
          <Separator />
          <h2 className="pt-8 font-heading text-sm font-semibold tracking-tight text-foreground">
            Keep reading
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-4"
              >
                <Badge variant="secondary" className="w-fit">
                  {item.category}
                </Badge>
                <span className="line-clamp-2 text-xs leading-snug font-medium text-foreground">
                  {item.title}
                </span>
                {item.readingTime && (
                  <span className="text-3xs text-muted-foreground">
                    {item.readingTime}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export { ArticlePage }
