#!/usr/bin/env node
// Focus-ring guard -- enforces the house rule stated in
// packages/ui/src/styles/globals.css:
//
//   "Every focus ring is `focus-visible:ring-2 focus-visible:ring-ring`
//    (2px, full strength). Diluted rings (`ring-ring/30`) fail WCAG 2.4.11."
//
// Why this exists as a separate check rather than a note in the docs: the rule
// was written, applied to the primitives it was written for, and then five other
// components kept the diluted form. A full-strength ring measures 4.88:1 (light)
// / 4.18:1 (dark); at /30 it measures 1.48:1 / 1.38:1 -- below the 3:1 floor, in
// both themes. Nothing typechecks or builds differently either way.
//
// CLASSIFICATION, because not every ring is a focus ring:
//
//   focus-visible / focus-within / data-[active] / data-[focused] / has-[…focus-visible]
//       -> the ring IS the focus indicator  -> diluted = FAIL, wrong width = FAIL
//   aria-invalid
//       -> the same class lists also set a full-strength `border-destructive`,
//          so the border carries the signal and the ring is decoration
//                                          -> diluted = WARN, not FAIL
//
// Width: `ring-0` is legitimate (an input deferring to the group that owns the
// ring) and `ring-2` is the standard. Any other width in a focus context fails.
//
// Usage:  node scripts/ui-audit/focus-rings.mjs

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, resolve, dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

const SCAN_DIRS = [
  "packages/ui/src",
  "packages/mobile/src",
  "apps/web",
  "apps/api/src",
  "apps/mobile/src",
  "features",
]
const SKIP = new Set(["node_modules", ".next", "dist", ".turbo", ".git", "build"])

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    if (SKIP.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(full)
  }
  return out
}

const FOCUS_VARIANT = /focus-visible|focus-within|data-\[active|data-\[focused|focused=true|:focus\b/
const INVALID_VARIANT = /aria-invalid|data-\[invalid|\[aria-invalid/

const failures = []
const warnings = []
let files = 0
let ringTokens = 0

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(REPO, dir))) {
    const text = readFileSync(file, "utf8")
    files++
    const rel = relative(REPO, file)

    text.split("\n").forEach((line, i) => {
      for (const token of line.match(/[^\s"'`]+/g) ?? []) {
        if (!token.includes("ring-")) continue
        const parts = token.split(":")
        const util = parts.pop()
        const variant = parts.join(":")

        // ring-offset-* and ring-inset are not colour/width rings
        if (/^ring-(offset|inset)/.test(util)) continue

        const alpha = util.match(/^ring-([a-z][a-z0-9-]*)\/(\d+)$/)
        const width = util.match(/^ring-(\d+|\[[^\]]+\])$/)
        if (!alpha && !width) continue
        ringTokens++

        const isFocus = FOCUS_VARIANT.test(variant)
        const isInvalid = INVALID_VARIANT.test(variant)
        const where = `${rel}:${i + 1}`

        if (alpha) {
          const pct = +alpha[2]
          if (pct >= 100) continue
          // aria-invalid is checked FIRST. A variant chain can carry both, e.g.
          // `data-[active=true]:aria-invalid:ring-destructive/20` on the OTP cell:
          // `data-[active]` is the focus trigger, but the ring colour is the
          // invalid one, and that class list also sets a full-strength
          // border-destructive. Classifying it as a focus ring would report a
          // false failure.
          if (isInvalid) {
            warnings.push(
              `${where}  diluted invalid ring  \`${token}\`\n` +
                `        Decorative -- the same class list sets a full-strength border-destructive.`
            )
          } else if (isFocus) {
            failures.push(
              `${where}  diluted focus ring  \`${token}\`\n` +
                `        ${alpha[1]} at ${pct}% measures ~1.48:1 (light) / 1.38:1 (dark); the floor is 3:1.\n` +
                `        Use \`${variant ? variant + ":" : ""}ring-${alpha[1]}\` at full strength.`
            )
          } else {
            warnings.push(`${where}  diluted ring outside a focus context  \`${token}\``)
          }
        } else if (width && isFocus) {
          const w = width[1]
          if (w === "2" || w === "0") continue
          failures.push(
            `${where}  wrong focus ring width  \`${token}\`\n` +
              `        The house rule is 2px (\`ring-2\`); \`ring-0\` is allowed when an\n` +
              `        ancestor owns the ring.`
          )
        }
      }
    })
  }
}

console.log(`focus ring guard -- ${files} files scanned, ${ringTokens} ring utilities found`)
console.log(`\nfailures: ${failures.length}   warnings: ${warnings.length}`)

for (const f of failures) console.log(`\n  FAIL  ${f}`)
for (const w of warnings) console.log(`\n  warn  ${w}`)

if (failures.length) {
  console.log("\nRESULT: FAIL")
  process.exit(1)
}
console.log("\nRESULT: PASS -- every focus ring is 2px at full strength")
