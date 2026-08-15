"use client"

import * as React from "react"
import { CopyIcon, CheckIcon } from "@phosphor-icons/react"
import { Button, Badge } from "@celestia-project/ui"
import { toast } from "sonner"
import { cn } from "@celestia-project/ui/lib/utils"

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  "data-language"?: string
  title?: string
}

export function CodeBlock({
  children,
  className,
  title,
  "data-language": language,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)

  const handleCopy = () => {
    if (!preRef.current) return
    const text = preRef.current.innerText || preRef.current.textContent || ""
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  // Derive language from className (e.g. language-bash -> bash)
  const langMatch = className?.match(/language-(\w+)/)
  const lang = language || (langMatch ? langMatch[1] : "")

  return (
    <div className="group relative my-5 overflow-hidden rounded-xl border border-border/70 bg-muted/40 shadow-xs backdrop-blur-sm transition-all hover:border-border">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/60 px-4 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          {title ? (
            <span className="font-mono text-xs font-medium text-foreground">{title}</span>
          ) : lang ? (
            <span className="font-mono text-[11px] text-muted-foreground uppercase">{lang}</span>
          ) : (
            <span className="font-mono text-[11px] text-muted-foreground">Code</span>
          )}
        </div>

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
      </div>

      {/* Code Content */}
      <pre
        ref={preRef}
        className={cn(
          "overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground scrollbar-thin",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
