import * as React from "react"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { mdxComponents } from "@/components/docs/mdx-components"

export interface DocRendererProps {
  content: string
  className?: string
}

export function DocRenderer({ content, className = "prose-content" }: DocRendererProps) {
  return (
    <div className={className}>
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </div>
  )
}
