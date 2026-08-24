"use client"

import * as React from "react"
import Editor, { type OnMount, type OnChange, type Monaco } from "@monaco-editor/react"
import type * as monacoEditor from "monaco-editor"
import { cn } from "../lib/utils"

async function openExternalUrl(url: string) {
  try {
    const { openUrl } = await import("@tauri-apps/plugin-opener")
    await openUrl(url)
  } catch {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }
}

// ---------------------------------------------------------------------------
// Themes & Options
// ---------------------------------------------------------------------------

function defineMonacoThemes(monaco: Monaco) {
  monaco.editor.defineTheme("celestia-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "c678dd" },
      { token: "string", foreground: "98c379" },
      { token: "number", foreground: "d19a66" },
      { token: "comment", foreground: "7f848e", fontStyle: "italic" },
      { token: "type", foreground: "e5c07b" },
      { token: "variable", foreground: "e06c75" },
      { token: "delimiter", foreground: "abb2bf" },
      { token: "tag", foreground: "e06c75" },
      { token: "attribute.name", foreground: "d19a66" },
      { token: "attribute.value", foreground: "98c379" },
    ],
    colors: {
      "editor.background": "#18181b",
      "editor.foreground": "#f4f4f5",
      "editorGutter.background": "#18181b",
      "editorLineNumber.foreground": "#71717a",
      "editorLineNumber.activeForeground": "#a1a1aa",
      "editor.lineHighlightBackground": "#27272a40",
      "editorIndentGuide.background": "#27272a",
      "editorIndentGuide.activeBackground": "#3f3f46",
    },
  })

  monaco.editor.defineTheme("celestia-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "bf00f9" },
      { token: "string", foreground: "4fbd00" },
      { token: "number", foreground: "d19a66" },
      { token: "comment", foreground: "5c6370", fontStyle: "italic" },
      { token: "type", foreground: "f7a000" },
      { token: "variable", foreground: "95000c" },
      { token: "delimiter", foreground: "abb2bf" },
      { token: "tag", foreground: "e06c75" },
      { token: "attribute.name", foreground: "d19a66" },
      { token: "attribute.value", foreground: "53ae12" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#09090b",
      "editorGutter.background": "#f4f4f5",
      "editorLineNumber.foreground": "#a1a1aa",
      "editorLineNumber.activeForeground": "#71717a",
      "editor.lineHighlightBackground": "#f4f4f580",
      "editorIndentGuide.background": "#e4e4e7",
      "editorIndentGuide.activeBackground": "#d4d4d8",
    },
  })
}

function normalizeLanguage(lang?: string): string {
  if (!lang) return "typescript"
  const l = lang.toLowerCase().trim()
  if (l === "tsx" || l === "ts") return "typescript"
  if (l === "jsx" || l === "js") return "javascript"
  if (l === "md" || l === "mdx") return "markdown"
  return l
}

function getMonacoTheme(theme?: string): string {
  if (!theme || theme === "dark" || theme === "vs-dark") return "celestia-dark"
  if (theme === "light" || theme === "vs" || theme === "vs-light") return "celestia-light"
  return theme
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type TextEditorInstance = monacoEditor.editor.IStandaloneCodeEditor
export type MonacoInstance = Monaco
export type TextEditorOptions = monacoEditor.editor.IStandaloneEditorConstructionOptions

export interface TextEditorProps {
  value?: string
  onChange?: (value: string | undefined) => void
  onMount?: (editor: TextEditorInstance, monaco: MonacoInstance) => void
  options?: TextEditorOptions
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  path?: string
  theme?: "dark" | "light" | "vs-dark" | "vs" | "vs-light" | string
  className?: string
  language?: "javascript" | "typescript" | "tsx" | "json" | "markdown" | string
  detectLinks?: boolean
  disableValidation?: boolean
  loading?: React.ReactNode
}

export function TextEditor({
  value,
  onChange,
  onMount,
  options,
  height = "100%",
  minHeight,
  maxHeight,
  className,
  theme = "dark",
  language = "typescript",
  detectLinks = true,
  disableValidation,
  path,
  loading,
}: TextEditorProps) {
  const editorRef = React.useRef<TextEditorInstance | null>(null)
  const isLinkOpenerRegistered = React.useRef(false)

  const isValidationDisabled = disableValidation ?? (options?.readOnly === true)

  const handleBeforeMount = React.useCallback(
    (monaco: Monaco) => {
      defineMonacoThemes(monaco)

      if (isValidationDisabled) {
        monaco.languages.typescript?.typescriptDefaults?.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        })
        monaco.languages.typescript?.javascriptDefaults?.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        })
        monaco.languages.json?.jsonDefaults?.setDiagnosticsOptions({
          validate: false,
        })
      }
    },
    [isValidationDisabled]
  )

  const handleEditorDidMount: OnMount = React.useCallback(
    (editor, monacoInstance) => {
      editorRef.current = editor

      if (!isLinkOpenerRegistered.current) {
        try {
          monacoInstance.editor.registerLinkOpener({
            async open(resource: monacoEditor.Uri) {
              await openExternalUrl(resource.toString())
              return true
            },
          })
          isLinkOpenerRegistered.current = true
        } catch {
          // Opener already registered or fallback
        }
      }

      onMount?.(editor, monacoInstance)
    },
    [onMount]
  )

  const handleEditorChange: OnChange = React.useCallback(
    (val) => {
      onChange?.(val)
    },
    [onChange]
  )

  const mergedOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = React.useMemo(
    () => ({
      fontSize: 12.5,
      fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
      tabSize: 2,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
      links: detectLinks,
      renderValidationDecorations: isValidationDisabled ? "off" : (options?.renderValidationDecorations ?? "on"),
      padding: { top: 8, bottom: 8 },
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      renderLineHighlight: "line",
      lineNumbersMinChars: 3,
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        alwaysConsumeMouseWheel: false,
      },
      ...options,
    }),
    [detectLinks, isValidationDisabled, options]
  )

  return (
    <div
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
      }}
      className={cn("w-full overflow-hidden", className)}
    >
      <Editor
        value={value}
        language={normalizeLanguage(language)}
        theme={getMonacoTheme(theme)}
        path={path}
        options={mergedOptions}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        loading={
          loading ?? (
            <div className="flex h-full w-full items-center justify-center gap-2 p-4 font-mono text-xs text-muted-foreground bg-background/50">
              <div className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Loading editor...</span>
            </div>
          )
        }
      />
    </div>
  )
}

export { loader as monacoLoader } from "@monaco-editor/react"
