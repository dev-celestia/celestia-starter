import * as React from "react"
import Link from "next/link"
import { Card, Cards } from "./card"
import { Callout } from "./callout"
import { Tabs, Tab } from "./tabs"
import { Steps, Step } from "./steps"
import { Files, Folder, File } from "./files"
import { CodeBlock } from "./code-block"
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
        "mt-2 mb-4 scroll-m-20 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={id}
      className={cn(
        "mt-10 mb-4 scroll-m-20 border-b border-border/60 pb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl first:mt-0",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={id}
      className={cn(
        "mt-8 mb-3 scroll-m-20 text-lg font-semibold tracking-tight text-foreground sm:text-xl",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "mt-6 mb-2 scroll-m-20 text-base font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        "text-sm sm:text-base leading-relaxed text-muted-foreground mb-4 [&:not(:first-child)]:mt-2",
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-4 ml-6 list-disc space-y-2 text-sm sm:text-base text-muted-foreground", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("my-4 ml-6 list-decimal space-y-2 text-sm sm:text-base text-muted-foreground", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "my-4 border-l-2 border-primary/50 pl-4 italic text-muted-foreground",
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
      <table className={cn("w-full border-collapse text-xs sm:text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn("border-b border-border/70 bg-muted/40", className)} {...props} />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn("border-b border-border/40 last:border-0 transition-colors hover:bg-muted/20", className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn("px-4 py-3 text-left font-semibold text-foreground", className)} {...props} />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("px-4 py-3 text-muted-foreground", className)} {...props} />
  ),
  a: ({ className, href = "", ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href.startsWith("http")
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "font-medium text-primary underline underline-offset-4 decoration-primary/40 transition-colors hover:decoration-primary",
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
          "font-medium text-primary underline underline-offset-4 decoration-primary/40 transition-colors hover:decoration-primary",
          className
        )}
        {...props}
      />
    )
  },
  pre: CodeBlock,
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    if (className?.includes("language-")) {
      return <code className={className} {...props} />
    }
    return (
      <code
        className={cn(
          "rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] sm:text-xs text-foreground",
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
