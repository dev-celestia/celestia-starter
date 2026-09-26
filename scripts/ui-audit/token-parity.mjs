#!/usr/bin/env node
// Token parity guard -- :root vs .dark.
//
// A token declared in `:root` but absent from `.dark` silently inherits the
// LIGHT value. That is invisible in a diff and shows up only as one wrong colour
// in one theme, which is exactly the class of bug nobody notices until a
// screenshot comparison.
//
// The check is on token NAMES, not values. But most unpaired names are
// deliberate, so this guard does not simply fail on them -- it fails on an
// unpaired name that is not on the documented allowlist. Adding a token to the
// allowlist is a one-line, reviewable act; silently adding an unpaired token is
// not.
//
// It also checks the font override hooks. `@theme inline { --font-sans:
// var(--font-sans) }` is a genuine self-reference (`@theme inline` DOES emit the
// variable into `:root`), and it "works" only in an app that sets the variable
// from next/font -- it breaks for every other consumer. The hooks here are
// deliberately named `--font-*-family` instead.
//
// Usage:  node scripts/ui-audit/token-parity.mjs

import { readFileSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const CSS_PATH = join(REPO, "packages/ui/src/styles/globals.css")
const css = readFileSync(CSS_PATH, "utf8")

// Tokens that are intentionally declared in only one place.
const ALLOWLIST = {
  "--bg": "landing palette: forced dark, not theme-switchable",
  "--surface": "landing palette: forced dark",
  "--text": "landing palette: forced dark",
  "--fog": "landing palette: forced dark",
  "--stroke": "landing palette: forced dark",
  "--brand": "brand accent: one value for both themes",
  "--brand-deep": "brand accent: one value for both themes",
  "--brand-foreground": "brand accent: one value for both themes",
  "--overlay": "one scrim, per the 'One overlay' house rule",
  "--radius": "geometry, not colour -- theme-invariant",
  "--selection-bg": "declared in both, listed here for clarity",
  "--elevation-edge": "declared in both, listed here for clarity",
}

function extractBlock(header) {
  const lines = css.split("\n")
  const start = lines.findIndex((l) => l.trim() === header)
  if (start === -1) throw new Error(`block not found: ${header}`)
  let depth = 0
  for (let i = start; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") depth++
      else if (ch === "}") { depth--; if (depth === 0) return lines.slice(start, i + 1).join("\n") }
    }
  }
  throw new Error(`unbalanced block: ${header}`)
}

const names = (block) => {
  const out = new Set()
  const re = /^\s*(--[a-z0-9-]+)\s*:/gim
  let m
  while ((m = re.exec(stripComments(block)))) out.add(m[1])
  return out
}

// Comments MUST be stripped before any pattern matching on CSS. The `@theme`
// block carries a comment explaining the `--font-sans: var(--font-sans)` trap by
// writing it out verbatim -- so a naive match reads the warning as the bug and
// reports a self-reference that does not exist. (Verified: that is exactly what
// the first version of this script did.)
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "")

const rootNames = names(extractBlock(":root {"))
const darkNames = names(extractBlock(".dark {"))

// The `@theme` blocks declare the `--color-*` / `--radius-*` / `--text-*`
// namespace mappings, which are not theme-paired by design.
const themeBlock = extractBlock("@theme inline {")
const themeNames = names(themeBlock)

const inRootOnly = [...rootNames].filter((n) => !darkNames.has(n))
const inDarkOnly = [...darkNames].filter((n) => !rootNames.has(n))

const undocumented = inRootOnly.filter((n) => !(n in ALLOWLIST))

// ── font override hooks ─────────────────────────────────────────────────────
const hooks = []
const themeDeclarations = stripComments(themeBlock)
for (const name of ["--font-sans", "--font-mono", "--font-heading"]) {
  const m = themeDeclarations.match(new RegExp(`${name}\\s*:\\s*var\\(\\s*(--[a-z0-9-]+)`))
  if (m) hooks.push({ name, ref: m[1], selfRef: m[1] === name })
}

console.log("token parity guard -- :root vs .dark\n")
console.log(`  :root-only   ${inRootOnly.length}  (${inRootOnly.filter((n) => n in ALLOWLIST).length} documented)`)
console.log(`  .dark-only   ${inDarkOnly.length}`)
console.log(`  @theme names ${themeNames.size}`)

if (inRootOnly.length) {
  console.log("\n  :root-only tokens")
  for (const n of inRootOnly) {
    const ok = n in ALLOWLIST
    console.log(`    ${ok ? "ok  " : "NEW "} ${n.padEnd(22)} ${ALLOWLIST[n] ?? "NOT DOCUMENTED"}`)
  }
}
if (inDarkOnly.length) {
  console.log("\n  .dark-only tokens")
  for (const n of inDarkOnly) console.log(`    NEW  ${n}`)
}

console.log("\n  font override hooks")
for (const h of hooks) {
  console.log(`    ${h.selfRef ? "FAIL" : "ok  "} ${h.name} -> ${h.ref}`)
}

const problems = []
if (undocumented.length) {
  problems.push(
    `${undocumented.length} token(s) declared in :root but not .dark, and not documented:\n` +
      undocumented.map((n) => `        ${n}`).join("\n") +
      `\n      Add a matching declaration in .dark, or add it to ALLOWLIST with a reason.`
  )
}
if (inDarkOnly.length) {
  problems.push(`.dark declares token(s) that :root does not:\n` + inDarkOnly.map((n) => `        ${n}`).join("\n"))
}
for (const h of hooks) {
  if (h.selfRef) {
    problems.push(
      `${h.name} references itself. \`@theme inline\` emits the variable into :root,\n` +
        `      so this is a real cycle and the utility resolves to nothing for any\n` +
        `      consumer that does not set it. Rename the override hook.`
    )
  }
}

if (problems.length) {
  console.log(`\nRESULT: FAIL -- ${problems.length} problem(s)`)
  for (const p of problems) console.log(`\n  ${p}`)
  process.exit(1)
}
console.log("\nRESULT: PASS -- every unpaired token is documented, no self-references")
