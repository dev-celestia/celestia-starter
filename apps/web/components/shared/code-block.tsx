"use client"

import * as React from "react"
import { CopyIcon, CheckIcon } from "@phosphor-icons/react"
import {
  Button,
  Badge,
  TextEditor,
  CodeBlockContent,
} from "@celestia-project/ui"
import { toast } from "@celestia-project/ui/primitive/sonner"
import { cn } from "@celestia-project/ui/lib/utils"
import { useTheme } from "@/lib/theme"
import { extractText, looksLikeFileTree } from "@/lib/code-block-text"

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code?: string
  value?: string
  language?: string
  "data-language"?: string
  title?: string
  badge?: string
  showHeader?: boolean
  showCopy?: boolean
  copyLabel?: string
  height?: number | string
  minHeight?: number | string
  maxHeight?: number | string
  preClassName?: string
  showLineNumbers?: boolean
  editor?: boolean
  /** Pre-highlighted content rendered as-is; skips client-side Shiki highlighting */
  highlighted?: React.ReactNode
}

function mapLanguage(
  lang?: string
): "javascript" | "typescript" | "tsx" | "json" | "markdown" {
  if (!lang) return "tsx"
  const normalized = lang.toLowerCase().trim()
  if (["tsx", "jsx"].includes(normalized)) return "tsx"
  if (["ts", "typescript"].includes(normalized)) return "typescript"
  if (["js", "javascript", "mjs", "cjs"].includes(normalized))
    return "javascript"
  if (["json"].includes(normalized)) return "json"
  if (["md", "markdown", "mdx"].includes(normalized)) return "markdown"
  return "tsx"
}

export function CodeBlock({
  children,
  className,
  code,
  value,
  language,
  "data-language": dataLanguage,
  title,
  badge,
  showHeader = true,
  showCopy = true,
  copyLabel,
  height,
  minHeight,
  maxHeight,
  preClassName,
  showLineNumbers = false,
  editor = false,
  highlighted,
  style,
  ...props
}: Readonly<CodeBlockProps>) {
  const [copied, setCopied] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Derive language and code from props, data attribute, className, or child code element
  let childLang = ""
  let childCode: string | undefined

  if (React.isValidElement(children)) {
    const childProps = children.props as {
      className?: string
      children?: React.ReactNode
    }
    if (childProps?.className) {
      const match = childProps.className.match(/language-([\w-]+)/)
      if (match?.[1]) {
        childLang = match[1] ?? ""
      }
    }
    if (childProps?.children !== undefined) {
      childCode = extractText(childProps.children)
    }
  }

  const langMatch = className?.match(/language-([\w-]+)/)
  const derivedLang = language || dataLanguage || langMatch?.[1] || childLang

  const rawCode = (
    code ??
    value ??
    childCode ??
    (children !== undefined ? extractText(children) : "")
  ).replace(/\n$/, "")

  const isTree = looksLikeFileTree(rawCode)

  const lines = React.useMemo(() => rawCode.split("\n"), [rawCode])

  const autoTitle = React.useMemo(() => {
    if (title) return title
    if (isTree) {
      const first = lines[0]?.trim()
      if (first && (first.endsWith("/") || first.includes("/"))) {
        return first
      }
      return "File Overview"
    }
    return undefined
  }, [title, isTree, lines])

  const autoBadge = React.useMemo(() => {
    if (badge) return badge
    if (isTree) return "Directory Structure"
    return undefined
  }, [badge, isTree])

  const effectiveLang = derivedLang || (isTree ? "tree" : "")

  const editorLang = mapLanguage(effectiveLang)

  const handleCopy = () => {
    if (!rawCode) return
    navigator.clipboard.writeText(rawCode)
    setCopied(true)
    toast.success(
      copyLabel ? `Copied ${copyLabel}` : "Code copied to clipboard"
    )
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedLang = React.useMemo(() => {
    if (!effectiveLang) return ""
    const l = effectiveLang.toLowerCase()
    if (l === "tsx" || l === "jsx") return "React / JSX"
    if (l === "ts" || l === "typescript") return "TypeScript"
    if (l === "js" || l === "javascript") return "JavaScript"
    if (l === "bash" || l === "sh" || l === "shell" || l === "zsh")
      return "Terminal"
    if (l === "json") return "JSON"
    if (l === "html") return "HTML"
    if (l === "css") return "CSS"
    if (l === "sql") return "SQL"
    if (l === "yaml" || l === "yml") return "YAML"
    if (l === "md" || l === "markdown" || l === "mdx") return "Markdown"
    if (l === "tree" || l === "files") return "File Tree"
    if (l === "txt" || l === "text") return "Plain Text"
    return effectiveLang.toUpperCase()
  }, [effectiveLang])

  return (
    <div
      className={cn(
        "group relative my-5 overflow-hidden rounded-xl border border-border/70 bg-muted/40 shadow-xs backdrop-blur-sm transition-all hover:border-border",
        className
      )}
      style={style}
      {...props}
    >
      {/* Code Header Bar */}
      {showHeader && (
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 bg-muted/60 px-4 py-1.5 text-xs">
          <div className="flex items-center gap-2">
            {autoTitle ? (
              <span className="font-mono text-xs font-medium text-foreground">
                {autoTitle}
              </span>
            ) : effectiveLang ? (
              <span className="font-mono text-[11px] text-muted-foreground uppercase">
                {effectiveLang}
              </span>
            ) : (
              <span className="font-mono text-[11px] text-muted-foreground">
                Code
              </span>
            )}

            {autoBadge && (
              <Badge
                variant="outline"
                className="px-1.5 py-0 font-mono text-[9px] uppercase"
              >
                {autoBadge}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!autoTitle &&
              formattedLang &&
              formattedLang.toLowerCase() !== effectiveLang.toLowerCase() && (
                <Badge
                  variant="outline"
                  className="hidden px-1.5 py-0 font-mono text-[10px] text-muted-foreground sm:inline-flex"
                >
                  {formattedLang}
                </Badge>
              )}

            {showCopy && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCopy}
                className="h-6 gap-1 px-2 text-[11px] text-muted-foreground transition-transform hover:text-foreground active:scale-95"
                title="Copy code"
              >
                {copied ? (
                  <>
                    <CheckIcon className="size-3.5 text-success" />
                    <span className="font-medium text-success">Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="size-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Code Content */}
      {highlighted !== undefined ? (
        <div
          className="relative overflow-auto"
          style={{
            height:
              height !== undefined
                ? typeof height === "number"
                  ? `${height}px`
                  : height
                : undefined,
            minHeight:
              minHeight !== undefined
                ? typeof minHeight === "number"
                  ? `${minHeight}px`
                  : minHeight
                : undefined,
            maxHeight:
              maxHeight !== undefined
                ? typeof maxHeight === "number"
                  ? `${maxHeight}px`
                  : maxHeight
                : undefined,
          }}
        >
          {highlighted}
        </div>
      ) : editor && mounted ? (
        <TextEditor
          value={rawCode}
          language={editorLang}
          theme={resolvedTheme === "light" ? "light" : "dark"}
          options={{ readOnly: true, renderValidationDecorations: "off" }}
          disableValidation
          height={height ?? 200}
          minHeight={minHeight}
          maxHeight={maxHeight}
          detectLinks={true}
          className={cn("w-full overflow-hidden text-xs", preClassName)}
        />
      ) : isTree ? (
        <pre
          style={{
            height:
              height !== undefined
                ? typeof height === "number"
                  ? `${height}px`
                  : height
                : undefined,
            minHeight:
              minHeight !== undefined
                ? typeof minHeight === "number"
                  ? `${minHeight}px`
                  : minHeight
                : undefined,
            maxHeight:
              maxHeight !== undefined
                ? typeof maxHeight === "number"
                  ? `${maxHeight}px`
                  : maxHeight
                : undefined,
          }}
          className={cn(
            "scrollbar-thin overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground select-text",
            preClassName
          )}
        >
          <code>{rawCode}</code>
        </pre>
      ) : (
        <CodeBlockContent
          code={rawCode}
          language={derivedLang || "tsx"}
          showLineNumbers={showLineNumbers}
          style={{
            height:
              height !== undefined
                ? typeof height === "number"
                  ? `${height}px`
                  : height
                : undefined,
            minHeight:
              minHeight !== undefined
                ? typeof minHeight === "number"
                  ? `${minHeight}px`
                  : minHeight
                : undefined,
            maxHeight:
              maxHeight !== undefined
                ? typeof maxHeight === "number"
                  ? `${maxHeight}px`
                  : maxHeight
                : undefined,
          }}
          className={cn(
            "scrollbar-thin p-4 font-mono text-xs leading-relaxed select-text",
            preClassName
          )}
          transparent
        />
      )}
    </div>
  )
}
