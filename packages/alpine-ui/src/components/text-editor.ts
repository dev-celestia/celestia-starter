import type { Alpine } from "alpinejs"
import type * as monaco from "monaco-editor"

// ---------------------------------------------------------------------------
// Lazy Monaco loader (CDN, mirrors @monaco-editor/react default behavior)
// ---------------------------------------------------------------------------

const MONACO_VERSION = "0.56.0"
const VS_CDN = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`

let monacoPromise: Promise<typeof monaco> | null = null

type MonacoWindow = Window & {
  monaco?: typeof monaco
  require?: {
    config: (opts: Record<string, unknown>) => void
    (deps: string[], cb: () => void): void
  }
}

function loadMonaco(): Promise<typeof monaco> {
  if (monacoPromise) return monacoPromise
  const win = window as unknown as MonacoWindow
  if (win.monaco) {
    monacoPromise = Promise.resolve(win.monaco)
    return monacoPromise
  }

  monacoPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `${VS_CDN}/loader.js`
    script.async = true
    script.onload = () => {
      if (!win.require) {
        reject(new Error("Monaco AMD loader failed to initialize"))
        return
      }
      win.require.config({ paths: { vs: VS_CDN } })
      win.require(["vs/editor/editor.main"], () => {
        if (win.monaco) resolve(win.monaco)
        else reject(new Error("Monaco failed to load"))
      })
    }
    script.onerror = () => reject(new Error("Failed to load Monaco from CDN"))
    document.head.appendChild(script)
  })
  return monacoPromise
}

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

function defineThemes(m: typeof monaco) {
  m.editor.defineTheme("celestia-dark", {
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

  m.editor.defineTheme("celestia-light", {
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function toCssSize(v: string | number | undefined): string | undefined {
  if (v === undefined) return undefined
  return typeof v === "number" ? `${v}px` : v
}

function defaultOptions(readOnly: boolean): Record<string, unknown> {
  return {
    fontSize: 12.5,
    fontFamily:
      "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
    tabSize: 2,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: "on",
    automaticLayout: true,
    links: true,
    renderValidationDecorations: readOnly ? "off" : "on",
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
  }
}

export interface TextEditorConfig {
  value?: string
  language?: string
  theme?: string
  readOnly?: boolean
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  path?: string
  options?: Record<string, unknown>
  detectLinks?: boolean
  disableValidation?: boolean
  onChange?: (value: string) => void
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) => void
}

export interface TextEditorStore {
  value: string
  language: string
  theme: string
  readOnly: boolean
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  path?: string
  options?: Record<string, unknown>
  detectLinks: boolean
  disableValidation: boolean
  loading: boolean
  containerStyle: Record<string, string | undefined>
  onChange?: (value: string) => void
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) => void
  $refs?: Record<string, HTMLElement>
  editor: monaco.editor.IStandaloneCodeEditor | null
  init(this: TextEditorStore): void
  setValue(this: TextEditorStore, value: string): void
  getValue(this: TextEditorStore): string
  focus(this: TextEditorStore): void
  dispose(this: TextEditorStore): void
}

export function textEditor(config: TextEditorConfig = {}): TextEditorStore {
  return {
    value: config.value ?? "",
    language: config.language ?? "typescript",
    theme: config.theme ?? "dark",
    readOnly: config.readOnly ?? false,
    height: config.height,
    minHeight: config.minHeight,
    maxHeight: config.maxHeight,
    path: config.path,
    options: config.options,
    detectLinks: config.detectLinks ?? true,
    disableValidation: config.disableValidation ?? false,
    loading: true,
    onChange: config.onChange,
    onMount: config.onMount,
    editor: null,

    get containerStyle() {
      return {
        height: toCssSize(this.height),
        minHeight: toCssSize(this.minHeight),
        maxHeight: toCssSize(this.maxHeight),
      }
    },

    setValue(value: string) {
      if (this.editor) {
        this.editor.setValue(value)
      }
      this.value = value
    },

    getValue() {
      return this.editor ? this.editor.getValue() : this.value
    },

    focus() {
      this.editor?.focus()
    },

    dispose() {
      this.editor?.dispose()
      this.editor = null
    },

    init() {
      const el = this.$refs?.editor as HTMLElement | undefined
      if (!el) return

      loadMonaco()
        .then((monaco) => {
          defineThemes(monaco)

          const readOnly =
            this.readOnly ?? Boolean((this.options as { readOnly?: boolean } | undefined)?.readOnly)
          const disableValidation = this.disableValidation ?? readOnly

          if (disableValidation) {
            const ts = monaco.languages.typescript as unknown as {
              typescriptDefaults?: { setDiagnosticsOptions(o: Record<string, unknown>): void }
              javascriptDefaults?: { setDiagnosticsOptions(o: Record<string, unknown>): void }
            }
            const json = monaco.languages.json as unknown as {
              jsonDefaults?: { setDiagnosticsOptions(o: Record<string, unknown>): void }
            }
            ts.typescriptDefaults?.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
            })
            ts.javascriptDefaults?.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
            })
            json.jsonDefaults?.setDiagnosticsOptions({ validate: false })
          }

          const editor = monaco.editor.create(el, {
            value: this.value,
            language: normalizeLanguage(this.language),
            theme: getMonacoTheme(this.theme),
            ...defaultOptions(readOnly),
            ...(this.options ?? {}),
          })

          editor.onDidChangeModelContent(() => {
            const next = editor.getValue()
            this.value = next
            this.onChange?.(next)
          })

          this.editor = editor
          this.loading = false
          this.onMount?.(editor, monaco)
        })
        .catch(() => {
          this.loading = false
        })
    },
  }
}

export default textEditor
