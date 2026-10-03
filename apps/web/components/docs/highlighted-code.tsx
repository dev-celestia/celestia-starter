import type { CSSProperties } from "react"
import type { ThemedToken } from "shiki"
import { cn } from "@celestia-project/ui/lib/utils"
import type { ServerTokenized } from "@/lib/shiki-server"

// Shiki uses bitflags for font styles: 1=italic, 2=bold, 4=underline
const isItalic = (fontStyle: number | undefined) =>
  fontStyle !== undefined && fontStyle % 2 === 1
const isBold = (fontStyle: number | undefined) =>
  fontStyle !== undefined && Math.floor(fontStyle / 2) % 2 === 1
const isUnderline = (fontStyle: number | undefined) =>
  fontStyle !== undefined && Math.floor(fontStyle / 4) % 2 === 1

interface KeyedToken {
  token: ThemedToken
  key: string
}
interface KeyedLine {
  tokens: KeyedToken[]
  key: string
}

const addKeysToTokens = (lines: ThemedToken[][]): KeyedLine[] =>
  lines.map((line, lineIdx) => ({
    key: `line-${lineIdx}`,
    tokens: line.map((token, tokenIdx) => ({
      key: `line-${lineIdx}-${tokenIdx}`,
      token,
    })),
  }))

// Mirrors TokenSpan in @celestia-project/ui: light colors inline, dark theme
// swaps via the --shiki-dark custom property under the .dark class.
function TokenSpan({ token }: { token: ThemedToken }) {
  const htmlStyle = (token.htmlStyle ?? {}) as Record<string, string>
  return (
    <span
      className={cn(
        htmlStyle["--shiki-dark"] && "dark:!text-[var(--shiki-dark)]",
        (token.bgColor || htmlStyle["--shiki-dark-bg"]) &&
          "dark:!bg-[var(--shiki-dark-bg)]"
      )}
      style={
        {
          backgroundColor: token.bgColor,
          color: token.color,
          fontStyle: isItalic(token.fontStyle) ? "italic" : undefined,
          fontWeight: isBold(token.fontStyle) ? "bold" : undefined,
          textDecoration: isUnderline(token.fontStyle)
            ? "underline"
            : undefined,
          ...htmlStyle,
        } as CSSProperties
      }
    >
      {token.content}
    </span>
  )
}

export function HighlightedTokens({
  tokenized,
}: {
  tokenized: ServerTokenized
}) {
  const keyedLines = addKeysToTokens(tokenized.tokens)
  return (
    <pre
      className={cn(
        tokenized.fgDark && "dark:!text-[var(--shiki-dark)]",
        "scrollbar-thin m-0 p-4 font-mono text-xs leading-relaxed select-text"
      )}
      style={
        {
          backgroundColor: "transparent",
          color: tokenized.fg,
          ...(tokenized.fgDark ? { "--shiki-dark": tokenized.fgDark } : null),
        } as CSSProperties
      }
    >
      <code className="font-mono text-inherit">
        {keyedLines.map((keyedLine) => (
          <span key={keyedLine.key} className="block min-h-[1.5em]">
            {keyedLine.tokens.length === 0
              ? "\n"
              : keyedLine.tokens.map(({ token, key }) => (
                  <TokenSpan key={key} token={token} />
                ))}
          </span>
        ))}
      </code>
    </pre>
  )
}
