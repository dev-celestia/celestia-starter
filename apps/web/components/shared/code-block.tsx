"use client"

import * as React from "react"
import { CopyIcon, CheckIcon } from "@phosphor-icons/react"
import { Button, Badge } from "@celestia-project/ui"
import { toast } from "sonner"
import { cn } from "@celestia-project/ui/lib/utils"

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
  maxHeight?: number | string
  preClassName?: string
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
  maxHeight,
  preClassName,
  style,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)

  const content = code ?? value ?? (typeof children === "string" ? children : undefined)

  // Derive language from prop, data attribute, or className (e.g. language-bash -> bash)
  const langMatch = className?.match(/language-(\w+)/)
  const lang = language || dataLanguage || (langMatch ? langMatch[1] : "")

  const handleCopy = () => {
    const text =
      content ??
      (preRef.current ? preRef.current.innerText || preRef.current.textContent || "" : "")

    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(copyLabel ? `Copied ${copyLabel}` : "Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedLang =
    lang && (lang.toLowerCase() === "tsx" || lang.toLowerCase() === "typescript")
      ? "TypeScript / JSX"
      : lang || ""

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
            ) : lang ? (
              <span className="font-mono text-[11px] text-muted-foreground uppercase">{lang}</span>
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

      {/* Code Content */}
      <pre
        ref={preRef}
        style={{
          height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
          maxHeight: maxHeight !== undefined ? (typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight) : undefined,
        }}
        className={cn(
          "overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground scrollbar-thin select-text",
          preClassName
        )}
      >
        {content !== undefined ? (
          <code className={lang ? `language-${lang}` : undefined}>{content}</code>
        ) : (
          children
        )}
      </pre>
    </div>
  )
}
