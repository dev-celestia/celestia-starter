"use client"

import * as React from "react"
import { CopyIcon, CheckIcon } from "@phosphor-icons/react"
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@celestia-project/ui"
import { COLOR_TOKENS } from "./constants"

export function ColorTokensPanel() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Semantic Color Palette</h3>
        <p className="text-sm text-muted-foreground">
          All colors use the high-gamut <strong>OKLCH</strong> color space for uniform lightness and contrast parity across dark and light modes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLOR_TOKENS.map((c) => (
          <Card key={c.cssVar} className="group relative flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-2">
              <div>
                <CardTitle className="text-sm font-semibold">{c.name}</CardTitle>
                <CardDescription className="font-mono text-xs">{c.token}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => copyToClipboard(`var(${c.cssVar})`, c.cssVar)}
                title="Copy CSS variable"
              >
                {copiedKey === c.cssVar ? (
                  <CheckIcon className="size-3.5 text-green-500" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
              </Button>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              {/* Swatch Previews */}
              <div className="my-2 grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Light</span>
                  <div
                    className="h-10 w-full rounded-lg border border-border/40 shadow-inner flex items-center justify-center font-mono text-[10px] text-muted-foreground/80"
                    style={{ backgroundColor: c.lightVal }}
                  >
                    preview
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground truncate">{c.lightVal}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dark</span>
                  <div
                    className="h-10 w-full rounded-lg border border-border/40 shadow-inner flex items-center justify-center font-mono text-[10px] text-muted-foreground/80"
                    style={{ backgroundColor: c.darkVal }}
                  >
                    preview
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground truncate">{c.darkVal}</span>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground border-t border-border/50 pt-2.5">
                {c.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
