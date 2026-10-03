import {
  createHighlighter,
  bundledLanguages,
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  type ThemedToken,
} from "shiki"

// Same theme pair as the @celestia-project/ui code blocks so docs and
// component previews highlight identically in light and dark mode.
const THEMES = {
  light: "github-light",
  dark: "github-dark",
} satisfies { light: BundledTheme; dark: BundledTheme }

const PLAIN_TEXT = "text" as BundledLanguage

const ALIAS_MAP: Record<string, BundledLanguage> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  jsonc: "json",
}

export function normalizeServerLanguage(lang?: string): BundledLanguage {
  if (!lang) return PLAIN_TEXT
  const l = lang.toLowerCase().trim()
  if (l in bundledLanguages) return l as BundledLanguage
  return ALIAS_MAP[l] ?? PLAIN_TEXT
}

export interface ServerTokenized {
  fg: string
  fgDark?: string
  tokens: ThemedToken[][]
}

// Single shared highlighter; grammars are loaded incrementally because each
// createHighlighter instance carries its own WASM engine.
let highlighterPromise: Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> | null = null
const loadedLanguages = new Set<BundledLanguage>()
const failedLanguages = new Set<BundledLanguage>()
let loadChain: Promise<unknown> = Promise.resolve()

async function getHighlighter(lang: BundledLanguage) {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      langs: [],
      themes: [THEMES.light, THEMES.dark],
    })
  }
  const highlighter = await highlighterPromise
  if (
    lang !== PLAIN_TEXT &&
    !loadedLanguages.has(lang) &&
    !failedLanguages.has(lang)
  ) {
    // Serialize grammar loads: doc pages render concurrently at build time.
    const load = loadChain.then(async () => {
      try {
        await highlighter.loadLanguage(lang)
        loadedLanguages.add(lang)
      } catch (error) {
        failedLanguages.add(lang)
        console.error(`Failed to load shiki grammar for "${lang}":`, error)
      }
    })
    loadChain = load
    await load
  }
  return highlighter
}

// shiki dual-theme fg/bg arrive as "<light>;--shiki-dark:<dark>"
function splitDualTheme(value: string | undefined): {
  light?: string
  dark?: string
} {
  if (!value) return {}
  const marker = ";--shiki-dark:"
  const idx = value.indexOf(marker)
  if (idx === -1) return { light: value }
  return {
    light: value.slice(0, idx),
    dark: value.slice(idx + marker.length),
  }
}

export async function highlightServerCode(
  code: string,
  language?: string
): Promise<ServerTokenized | null> {
  if (!code) return null
  try {
    const safeLang = normalizeServerLanguage(language)
    const highlighter = await getHighlighter(safeLang)
    const langToUse = loadedLanguages.has(safeLang) ? safeLang : PLAIN_TEXT
    const result = highlighter.codeToTokens(code, {
      lang: langToUse,
      themes: THEMES,
    })
    const fg = splitDualTheme(result.fg)
    return { fg: fg.light ?? "inherit", fgDark: fg.dark, tokens: result.tokens }
  } catch (error) {
    console.error("Server-side code highlighting failed:", error)
    return null
  }
}
