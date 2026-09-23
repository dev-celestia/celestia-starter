import { readFileSync, writeFileSync } from "node:fs"
import { extname } from "node:path"

/**
 * Managed marker regions let features insert/remove snippets inside shared files
 * without overwriting them. A target file contains an empty region delimited by
 * sentinels:
 *
 *   // feature-manager:<marker>:begin
 *   // feature-manager:<marker>:end
 *
 * Installing a feature places its snippet inside that region, wrapped in its own
 * per-feature block so it can be removed cleanly later:
 *
 *   // feature-manager:<marker>:begin
 *   // feature-manager:<marker>:<feature>:begin
 *   ...snippet...
 *   // feature-manager:<marker>:<feature>:end
 *   // feature-manager:<marker>:end
 *
 * The comment syntax is chosen by file extension so the sentinels stay valid in
 * .ts/.tsx (`//`), .md (`<!-- -->`), .mdx (`{/* *\/}`), .css (`/* *\/`) and
 * #-comment files (.yml/.toml/.sh/.py).
 */

type CommentStyle = "line" | "hash" | "html" | "jsx" | "block"

const SENTINEL_PREFIX = "feature-manager"

const STYLE_BY_EXTENSION: Record<string, CommentStyle> = {
  // line comments
  ".ts": "line",
  ".tsx": "line",
  ".js": "line",
  ".jsx": "line",
  ".mjs": "line",
  ".cjs": "line",
  ".mts": "line",
  ".cts": "line",
  ".go": "line",
  ".rs": "line",
  ".java": "line",
  ".kt": "line",
  ".swift": "line",
  ".dart": "line",
  ".c": "line",
  ".h": "line",
  ".cpp": "line",
  ".cs": "line",
  ".php": "line",
  // hash comments
  ".yml": "hash",
  ".yaml": "hash",
  ".toml": "hash",
  ".py": "hash",
  ".sh": "hash",
  ".bash": "hash",
  ".zsh": "hash",
  ".rb": "hash",
  ".env": "hash",
  // html comments
  ".md": "html",
  ".html": "html",
  ".htm": "html",
  ".vue": "html",
  ".svelte": "html",
  // jsx comments
  ".mdx": "jsx",
  // block comments
  ".css": "block",
  ".scss": "block",
  ".less": "block",
}

/** Extensions that cannot hold comments at all. */
const COMMENT_HOSTILE_EXTENSIONS = new Set([".json", ".jsonc", ".lock", ".csv", ".svg"])

export class MarkerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "MarkerError"
  }
}

const MARKER_PATTERN = /^[a-z0-9][a-z0-9-]*$/i

export function isValidMarker(marker: string): boolean {
  return MARKER_PATTERN.test(marker)
}

export function assertValidMarker(marker: string): void {
  if (!isValidMarker(marker)) {
    throw new MarkerError(
      `Invalid marker "${marker}". Markers must match /^[a-z0-9][a-z0-9-]*$/i ` +
        `(letters, digits and hyphens; e.g. "imports", "nav", "nav-visibility").`,
    )
  }
}

export function commentStyleFor(file: string): CommentStyle {
  const ext = extname(file).toLowerCase()
  const style = STYLE_BY_EXTENSION[ext]
  if (style) return style
  return "line"
}

/** Refuse to write comment markers into files whose format has no comments. */
function assertMarkerCapable(file: string): void {
  const ext = extname(file).toLowerCase()
  if (COMMENT_HOSTILE_EXTENSIONS.has(ext)) {
    throw new MarkerError(
      `${file} cannot hold comment markers (${ext} has no comment syntax).\n` +
        `Use "jsonAppends" in the manifest instead of an "insertions" entry.`,
    )
  }
}

function wrapSentinel(sentinel: string, style: CommentStyle): string {
  switch (style) {
    case "hash":
      return `# ${sentinel}`
    case "html":
      return `<!-- ${sentinel} -->`
    case "jsx":
      return `{/* ${sentinel} */}`
    case "block":
      return `/* ${sentinel} */`
    default:
      return `// ${sentinel}`
  }
}

const regionBegin = (marker: string) => `${SENTINEL_PREFIX}:${marker}:begin`
const regionEnd = (marker: string) => `${SENTINEL_PREFIX}:${marker}:end`
const blockBegin = (marker: string, feature: string) =>
  `${SENTINEL_PREFIX}:${marker}:${feature}:begin`
const blockEnd = (marker: string, feature: string) =>
  `${SENTINEL_PREFIX}:${marker}:${feature}:end`

/**
 * Strip the comment wrapper from a line and return the raw sentinel text, or
 * `undefined` when the line is not a comment carrying a sentinel.
 *
 * Reading is deliberately lenient about the wrapper (`//`, `#`, `<!-- -->`,
 * `{/* *\/}`, `/* *\/`) so a marker keeps working if a file's comment style is
 * changed; writing still uses the extension's canonical style.
 */
export function unwrapSentinel(line: string): string | undefined {
  const trimmed = line.trim()
  const patterns: RegExp[] = [
    /^\/\/\s*(.*)$/,
    /^#\s*(.*)$/,
    /^<!--\s*(.*?)\s*-->$/,
    /^\{\/\*\s*(.*?)\s*\*\/\}$/,
    /^\/\*\s*(.*?)\s*\*\/$/,
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1] !== undefined) return match[1]
  }
  return undefined
}

/**
 * Exact-match a sentinel. Matching on the whole unwrapped line (instead of a
 * substring) prevents a marker from accidentally matching inside a longer
 * sentinel or a string literal.
 */
function isSentinel(line: string, sentinel: string): boolean {
  return unwrapSentinel(line) === sentinel
}

function leadingWhitespace(line: string): string {
  return line.match(/^\s*/)?.[0] ?? ""
}

interface Region {
  beginIdx: number
  endIdx: number
}

/** First `<marker>` region in `lines`, or `undefined` when absent/incomplete. */
function findRegion(lines: string[], marker: string): Region | undefined {
  const beginIdx = lines.findIndex((line) => isSentinel(line, regionBegin(marker)))
  if (beginIdx === -1) return undefined
  const endIdx = lines.findIndex((line, i) => i > beginIdx && isSentinel(line, regionEnd(marker)))
  if (endIdx === -1) return undefined
  return { beginIdx, endIdx }
}

interface Block {
  beginIdx: number
  endIdx: number
  /** True when the begin sentinel exists but its matching end sentinel does not. */
  orphan: boolean
}

/**
 * The `<feature>` block inside a region. `region` bounds the search so a stray
 * end sentinel elsewhere in the file can never be matched by mistake.
 */
function findBlock(
  lines: string[],
  marker: string,
  feature: string,
  region?: Region,
): Block | undefined {
  const lower = region ? region.beginIdx : -1
  const upper = region ? region.endIdx : lines.length
  const beginIdx = lines.findIndex(
    (line, i) => i > lower && i < upper && isSentinel(line, blockBegin(marker, feature)),
  )
  if (beginIdx === -1) return undefined
  const endIdx = lines.findIndex(
    (line, i) => i > beginIdx && i < upper && isSentinel(line, blockEnd(marker, feature)),
  )
  if (endIdx === -1) return { beginIdx, endIdx: beginIdx, orphan: true }
  return { beginIdx, endIdx, orphan: false }
}

/** Marker ids that have a region in `content`. */
export function listAvailableMarkers(content: string): string[] {
  const found = new Set<string>()
  for (const line of content.split("\n")) {
    const sentinel = unwrapSentinel(line)
    if (!sentinel) continue
    const match = sentinel.match(new RegExp(`^${SENTINEL_PREFIX}:([A-Za-z0-9-]+):begin$`))
    if (match?.[1]) found.add(match[1])
  }
  return [...found].sort()
}

export function hasRegion(content: string, marker: string): boolean {
  return findRegion(content.split("\n"), marker) !== undefined
}

/** Feature names that currently have a block inside the `<marker>` region. */
export function listRegionFeatures(content: string, marker: string): string[] {
  const lines = content.split("\n")
  const region = findRegion(lines, marker)
  if (!region) return []
  const found = new Set<string>()
  for (let i = region.beginIdx + 1; i < region.endIdx; i += 1) {
    const sentinel = unwrapSentinel(lines[i] ?? "")
    if (!sentinel) continue
    const match = sentinel.match(new RegExp(`^${SENTINEL_PREFIX}:${marker}:([A-Za-z0-9-]+):begin$`))
    if (match?.[1]) found.add(match[1])
  }
  return [...found]
}

function missingRegionError(content: string, marker: string, file: string, style: CommentStyle): string {
  const available = listAvailableMarkers(content)
  const hint =
    available.length > 0
      ? `\n  Markers available in this file: ${available.map((m) => `"${m}"`).join(", ")}`
      : `\n  This file contains no feature-manager marker regions at all.`
  return (
    `Marker region "${marker}" not found in ${file}.\n` +
    `  Expected sentinels: "${wrapSentinel(regionBegin(marker), style)}" ... "${wrapSentinel(regionEnd(marker), style)}"` +
    hint
  )
}

function normalizeSnippet(snippet: string): string[] {
  const cleaned = snippet.replace(/\r\n/g, "\n").replace(/\n+$/, "")
  return cleaned === "" ? [] : cleaned.split("\n")
}

export interface InsertResult {
  content: string
  changed: boolean
  /** `unchanged` = snippet already identical; `replaced` = updated in place. */
  action: "inserted" | "replaced" | "repaired" | "unchanged"
}

/**
 * Insert `snippet` into the `<marker>` region of `content`, wrapped in a
 * per-feature block. Idempotent: an existing block for the feature is replaced
 * in place, an orphan begin sentinel is repaired, and an identical block is
 * left untouched (so re-installs produce no diff).
 */
export function insertIntoRegionDetailed(
  content: string,
  marker: string,
  feature: string,
  snippet: string,
  file: string,
): InsertResult {
  assertValidMarker(marker)
  assertMarkerCapable(file)

  const style = commentStyleFor(file)
  const lines = content.split("\n")
  const region = findRegion(lines, marker)
  if (!region) throw new MarkerError(missingRegionError(content, marker, file, style))

  const indent = leadingWhitespace(lines[region.endIdx] ?? "")
  const block = [
    indent + wrapSentinel(blockBegin(marker, feature), style),
    ...normalizeSnippet(snippet),
    indent + wrapSentinel(blockEnd(marker, feature), style),
  ]

  const existing = findBlock(lines, marker, feature, region)
  if (existing) {
    if (!existing.orphan) {
      const current = lines.slice(existing.beginIdx, existing.endIdx + 1).join("\n")
      if (current === block.join("\n")) {
        return { content, changed: false, action: "unchanged" }
      }
      lines.splice(existing.beginIdx, existing.endIdx - existing.beginIdx + 1, ...block)
      return { content: lines.join("\n"), changed: true, action: "replaced" }
    }
    // Orphan begin sentinel (e.g. an interrupted install): everything between it
    // and the region's end sentinel is the incomplete block — replace it whole.
    lines.splice(existing.beginIdx, region.endIdx - existing.beginIdx, ...block)
    return { content: lines.join("\n"), changed: true, action: "repaired" }
  }

  const freshRegion = findRegion(lines, marker)
  if (!freshRegion) throw new MarkerError(missingRegionError(content, marker, file, style))
  lines.splice(freshRegion.endIdx, 0, ...block)
  return { content: lines.join("\n"), changed: true, action: "inserted" }
}

/** @see insertIntoRegionDetailed */
export function insertIntoRegion(
  content: string,
  marker: string,
  feature: string,
  snippet: string,
  file: string,
): string {
  return insertIntoRegionDetailed(content, marker, feature, snippet, file).content
}

export interface RemoveResult {
  content: string
  changed: boolean
}

/**
 * Remove the `<feature>` block from the `<marker>` region of `content`. The
 * region itself is left in place (empty). No-op if the block is absent.
 */
export function removeFromRegionDetailed(
  content: string,
  marker: string,
  feature: string,
  file: string,
): RemoveResult {
  assertValidMarker(marker)
  const lines = content.split("\n")
  const region = findRegion(lines, marker)
  const block = findBlock(lines, marker, feature, region)
  if (!block) return { content, changed: false }

  lines.splice(block.beginIdx, block.endIdx - block.beginIdx + 1)
  return { content: lines.join("\n"), changed: true }
}

/** @see removeFromRegionDetailed */
export function removeFromRegion(
  content: string,
  marker: string,
  feature: string,
  file: string,
): string {
  return removeFromRegionDetailed(content, marker, feature, file).content
}

// ── JSON array helpers ───────────────────────────────────────────────────────

export function getAtPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      obj,
    )
}

/** Append `value` to the array at `path`. Returns true when it changed. */
export function appendToJsonArray(data: unknown, path: string, value: string): boolean {
  const arr = getAtPath(data, path)
  if (!Array.isArray(arr)) {
    throw new MarkerError(`JSON path "${path}" is not an array.`)
  }
  if (arr.includes(value)) return false
  arr.push(value)
  return true
}

/** Remove `value` from the array at `path`. Returns true when it changed. */
export function removeFromJsonArray(data: unknown, path: string, value: string): boolean {
  const arr = getAtPath(data, path)
  if (!Array.isArray(arr)) return false
  const idx = arr.indexOf(value)
  if (idx === -1) return false
  arr.splice(idx, 1)
  return true
}

function serializeJson(data: unknown, original: string): string {
  const body = JSON.stringify(data, null, 2)
  return original.endsWith("\n") || !original ? `${body}\n` : body
}

/** Append `value` to the JSON array at `path` in `file` (deduped). */
export function jsonAppend(file: string, path: string, value: string): boolean {
  const original = readFileSync(file, "utf-8")
  const data = JSON.parse(original) as Record<string, unknown>
  const changed = appendToJsonArray(data, path, value)
  if (changed) writeFileSync(file, serializeJson(data, original))
  return changed
}

/** Remove `value` from the JSON array at `path` in `file`. No-op if absent. */
export function jsonRemove(file: string, path: string, value: string): boolean {
  const original = readFileSync(file, "utf-8")
  const data = JSON.parse(original) as Record<string, unknown>
  const changed = removeFromJsonArray(data, path, value)
  if (changed) writeFileSync(file, serializeJson(data, original))
  return changed
}
