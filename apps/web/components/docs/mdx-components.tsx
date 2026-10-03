import * as React from "react"
import Link from "next/link"
import { Card, Cards } from "./card"
import { Callout } from "./callout"
import { Tabs, Tab } from "./tabs"
import { Steps, Step } from "./steps"
import { Files, Folder, File } from "./files"
import { CodeBlock } from "@/components/shared/code-block"
import { extractText, looksLikeFileTree } from "@/lib/code-block-text"
import { HighlightedTokens } from "./highlighted-code"
import { highlightServerCode } from "@/lib/shiki-server"
import * as Previews from "./previews"
import { cn } from "@celestia-project/ui/lib/utils"

export const mdxComponents = {
  // Custom Docs Components
  Card,
  Cards,
  Callout,
  Tabs,
  Tab,
  Steps,
  Step,
  Files,
  Folder,
  File,

  // Component Previews
  ...Previews,

  // Typography & HTML Elements with Apple Design Foundations
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "mt-2 mb-4 scroll-m-20 text-3xl tracking-tight text-foreground sm:text-4xl",
        className
      )}
      {...props}
    />
  ),
  h2: ({
    className,
    id,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={id}
      className={cn(
        "mt-10 mb-4 scroll-m-20 border-b border-border/60 pb-2 text-xl font-bold tracking-tight text-foreground first:mt-0 sm:text-2xl",
        className
      )}
      {...props}
    />
  ),
  h3: ({
    className,
    id,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={id}
      className={cn(
        "mt-8 mb-3 scroll-m-20 text-lg tracking-tight text-foreground sm:text-xl",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "mt-6 mb-2 scroll-m-20 text-base tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        "mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base [&:not(:first-child)]:mt-2",
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        "my-4 ms-6 list-disc space-y-2 text-sm text-muted-foreground sm:text-base",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn(
        "my-4 ms-6 list-decimal space-y-2 text-sm text-muted-foreground sm:text-base",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
  blockquote: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "my-4 border-s-2 border-primary/50 ps-4 text-muted-foreground italic",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className={cn("my-8 border-border/60", className)} {...props} />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-border/70 shadow-xs">
      <table
        className={cn("w-full border-collapse text-xs sm:text-sm", className)}
        {...props}
      />
    </div>
  ),
  thead: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead
      className={cn("border-b border-border/70 bg-muted/40", className)}
      {...props}
    />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn(
        "border-b border-border/40 transition-colors last:border-0 hover:bg-muted/20",
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "px-4 py-3 text-start font-medium text-foreground",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn("px-4 py-3 text-muted-foreground", className)}
      {...props}
    />
  ),
  a: ({
    className,
    href = "",
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href.startsWith("http")
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary",
            className
          )}
          {...props}
        />
      )
    }
    return (
      <Link
        href={href}
        className={cn(
          "font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary",
          className
        )}
        {...props}
      />
    )
  },
  // Async server component: highlight code blocks at render time so the HTML
  // ships colored on the first paint (no client-side Shiki flash/mismatch).
  pre: async ({
    children,
    className,
    ...props
  }: React.ComponentProps<"pre">) => {
    let language: string | undefined
    let title: string | undefined
    let rawCode = ""
    if (React.isValidElement(children)) {
      const childProps = children.props as {
        className?: string
        children?: React.ReactNode
        metastring?: string
        title?: string
        [key: string]: unknown
      }
      const match = childProps?.className?.match(/language-([\w-]+)/)
      if (match) {
        language = match[1]
      }
      const meta =
        typeof childProps?.metastring === "string"
          ? childProps.metastring
          : typeof childProps?.["data-meta"] === "string"
            ? childProps["data-meta"]
            : ""
      const titleMatch =
        meta.match(/title="([^"]+)"/) || meta.match(/title=([^\s]+)/)
      if (titleMatch?.[1]) {
        title = titleMatch[1]
      } else if (typeof childProps?.title === "string") {
        title = childProps.title
      }
      if (childProps?.children !== undefined) {
        rawCode = extractText(childProps.children).replace(/\n$/, "")
      }
    }

    // File trees keep the dedicated client rendering (badge, monochrome glyphs)
    let highlighted: React.ReactNode
    if (rawCode && !looksLikeFileTree(rawCode)) {
      const tokenized = await highlightServerCode(rawCode, language)
      if (tokenized) {
        highlighted = <HighlightedTokens tokenized={tokenized} />
      }
    }

    return (
      <CodeBlock
        className={className}
        language={language}
        title={title}
        code={rawCode || undefined}
        highlighted={highlighted}
        {...(props as unknown as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </CodeBlock>
    )
  },
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    if (className?.includes("language-")) {
      return <code className={className} {...props} />
    }
    return (
      <code
        className={cn(
          "rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground sm:text-xs",
          className
        )}
        {...props}
      />
    )
  },
}

export function getCustomMdxComponents() {
  return mdxComponents
}
