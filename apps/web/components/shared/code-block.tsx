"use client"

import * as React from "react"
import { CopyIcon, CheckIcon } from "@phosphor-icons/react"
import { Button, Badge, TextEditor } from "@celestia-project/ui"
import { toast } from "@celestia-project/ui/components/sonner"
import { cn } from "@celestia-project/ui/lib/utils"
import { useTheme } from "next-themes"

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
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return props.children ? extractText(props.children) : ""
  }
  return ""
}

function mapLanguage(lang?: string): "javascript" | "typescript" | "tsx" | "json" | "markdown" {
  if (!lang) return "tsx"
  const normalized = lang.toLowerCase().trim()
  if (["tsx", "jsx"].includes(normalized)) return "tsx"
  if (["ts", "typescript"].includes(normalized)) return "typescript"
  if (["js", "javascript", "mjs", "cjs"].includes(normalized)) return "javascript"
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
  style,
  ...props
}: Readonly<CodeBlockProps>) {
  const [copied, setCopied] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Derive language from prop, data attribute, or className (e.g. language-bash -> bash)
  const langMatch = className?.match(/language-([\w-]+)/)
  const derivedLang = language || dataLanguage || (langMatch ? langMatch[1] : "")

  const rawCode =
    code ??
    value ??
    (children !== undefined ? extractText(children) : "")

  const editorLang = mapLanguage(derivedLang)

  const handleCopy = () => {
    if (!rawCode) return
    navigator.clipboard.writeText(rawCode)
    setCopied(true)
    toast.success(copyLabel ? `Copied ${copyLabel}` : "Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedLang =
    derivedLang && (derivedLang.toLowerCase() === "tsx" || derivedLang.toLowerCase() === "typescript")
      ? "TypeScript / JSX"
      : derivedLang || ""

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
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/60 px-4 py-1.5 text-xs shrink-0">
          <div className="flex items-center gap-2">
            {title ? (
              <span className="font-mono text-xs font-medium text-foreground">{title}</span>
            ) : derivedLang ? (
              <span className="font-mono text-[11px] text-muted-foreground uppercase">{derivedLang}</span>
            ) : (
              <span className="font-mono text-[11px] text-muted-foreground">Code</span>
            )}

            {badge && (
              <Badge variant="outline" className="font-mono text-[9px] uppercase px-1.5 py-0">
                {badge}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!title && formattedLang && (
              <Badge variant="outline" className="hidden sm:inline-flex font-mono text-[10px] text-muted-foreground px-1.5 py-0">
                {formattedLang}
              </Badge>
            )}

            {showCopy && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCopy}
                className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                title="Copy code"
              >
                {copied ? (
                  <>
                    <CheckIcon className="size-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied</span>
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

      {/* Code Content using Monaco TextEditor */}
      {mounted ? (
        <TextEditor
          value={rawCode}
          language={editorLang}
          theme={resolvedTheme === "light" ? "light" : "dark"}
          options={{ readOnly: true, renderValidationDecorations: "off" }}
          disableValidation
          height={height}
          minHeight={minHeight}
          maxHeight={maxHeight}
          detectLinks={true}
          className={cn("w-full overflow-hidden text-xs", preClassName)}
        />
      ) : (
        <pre
          style={{
            height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
            minHeight: minHeight !== undefined ? (typeof minHeight === "number" ? `${minHeight}px` : minHeight) : undefined,
            maxHeight: maxHeight !== undefined ? (typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight) : undefined,
          }}
          className={cn(
            "overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground scrollbar-thin select-text",
            preClassName
          )}
        >
          <code>{rawCode}</code>
        </pre>
      )}
    </div>
  )
}
