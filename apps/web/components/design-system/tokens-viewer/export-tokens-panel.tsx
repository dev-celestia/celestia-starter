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
  Tabs,
  TabsList,
  TabsTrigger,
  TextEditor,
} from "@celestia-project/ui"
import { useTheme } from "next-themes"
import type { ExportFormat } from "./types"
import { EXPORT_TAILWIND_V4, EXPORT_CSS_VARS, EXPORT_JSON } from "./constants"

export function ExportTokensPanel() {
  const { resolvedTheme } = useTheme()
  const editorTheme = resolvedTheme === "light" ? "light" : "dark"

  const [exportFormat, setExportFormat] = React.useState<ExportFormat>("tailwind-v4")
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getExportCode = () => {
    if (exportFormat === "tailwind-v4") return EXPORT_TAILWIND_V4
    if (exportFormat === "css-vars") return EXPORT_CSS_VARS
    return EXPORT_JSON
  }

  return (
    <div className="space-y-5 pt-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Export Design Tokens</CardTitle>
            <CardDescription className="text-sm">
              Copy and integrate these tokens into any external project instantly.
            </CardDescription>
          </div>

          <Tabs value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
            <TabsList>
              <TabsTrigger value="tailwind-v4">Tailwind v4</TabsTrigger>
              <TabsTrigger value="css-vars">CSS Variables</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="relative rounded-lg border border-border/80 overflow-hidden bg-background">
            <TextEditor
              value={getExportCode()}
              language={exportFormat === "json" ? "json" : "css"}
              theme={editorTheme}
              height={320}
              disableValidation
              options={{
                readOnly: true,
                lineNumbers: "on",
                lineNumbersMinChars: 3,
                folding: false,
                padding: { top: 12, bottom: 12 },
              }}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => copyToClipboard(getExportCode(), "export-all")}
              className="absolute end-2 top-2 z-10 bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground"
            >
              {copiedKey === "export-all" ? (
                <CheckIcon className="size-3.5 text-green-500" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
