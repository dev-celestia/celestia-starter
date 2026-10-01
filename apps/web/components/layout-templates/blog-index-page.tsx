"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Badge } from "@celestia-project/ui/primitive/badge"

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readingTime?: string
}

export interface BlogIndexPageProps extends React.ComponentProps<"div"> {
  eyebrow?: React.ReactNode
  heading: string
  description?: string
  /** Category chips. Omit to hide the filter row. */
  categories?: string[]
  /** Selected chip. Pair with `onCategoryChange` for a controlled filter. */
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  /** The lead story — rendered wide, above the grid. */
  featured?: BlogPost
  posts: BlogPost[]
  /** Fired when any card is activated. */
  onOpenPost?: (id: string) => void
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-3xs text-muted-foreground">
      <span className="font-medium text-foreground/80">{post.author}</span>
      <span aria-hidden="true">·</span>
      <span>{post.date}</span>
      {post.readingTime && (
        <>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime}</span>
        </>
      )}
    </div>
  )
}

/**
 * The blog index: category chips over a lead story and a card grid.
 *
 * Category state is controlled from above rather than held here, because the
 * filtered list is the consumer's — it may come from a router search param, a
 * CMS query, or a static array. The component only draws the chips and reports
 * which one was pressed.
 */
function BlogIndexPage({
  eyebrow,
  heading,
  description,
  categories,
  activeCategory,
  onCategoryChange,
  featured,
  posts,
  onOpenPost,
  className,
  children,
  ...props
}: BlogIndexPageProps) {
  return (
    <div
      data-slot="blog-index-page"
      className={cn("mx-auto w-full max-w-6xl px-6 py-16", className)}
      {...props}
    >
      <div className="flex flex-col gap-3">
        {eyebrow && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-3xs font-medium text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {heading}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {categories && categories.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const active = category === activeCategory
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange?.(category)}
                className={cn(
                  "h-7 rounded-full border px-3 text-xs font-medium transition-colors",
                  active
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {category}
              </button>
            )
          })}
        </div>
      )}

      {featured && (
        <button
          type="button"
          onClick={() => onOpenPost?.(featured.id)}
          className="mt-8 grid w-full gap-6 overflow-hidden rounded-2xl border border-border/70 bg-card p-6 text-start transition-colors hover:border-border lg:grid-cols-2"
        >
          <div
            aria-hidden="true"
            className="flex min-h-40 items-end rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4"
          >
            <Badge variant="secondary">{featured.category}</Badge>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <span className="text-3xs font-medium tracking-wide text-primary uppercase">
              Featured
            </span>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-balance text-foreground">
              {featured.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {featured.excerpt}
            </p>
            <PostMeta post={featured} />
          </div>
        </button>
      )}

      <div
        data-slot="blog-index-page-grid"
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => onOpenPost?.(post.id)}
            className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-5 text-start transition-colors hover:border-border"
          >
            <Badge variant="secondary" className="w-fit">
              {post.category}
            </Badge>
            <h3 className="line-clamp-2 text-sm leading-snug font-medium text-foreground">
              {post.title}
            </h3>
            <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <PostMeta post={post} />
          </button>
        ))}
      </div>

      {children}
    </div>
  )
}

export { BlogIndexPage }
