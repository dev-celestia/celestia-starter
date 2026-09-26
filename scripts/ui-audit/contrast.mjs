#!/usr/bin/env node
// Token-layer contrast gate.
//
// Reads the tokens OUT OF packages/ui/src/styles/globals.css rather than
// duplicating them, so the gate cannot drift from the source it checks.
//
// Every threshold below is one the design system already documents in its own
// comments. This gate exists so those comments cannot silently become false:
// the file records measured ratios for --muted-foreground, --ring and
// --elevation-edge, and a future edit could regress any of them with no build
// error and no visible diff.
//
// TWO DISCIPLINES BAKED IN, both learned the hard way:
//
//   1. A KNOWN-GOOD CONTROL runs first. An earlier version of this script
//      compared a ratio against the string '3:1' -- i.e. `4.88 >= NaN` -- and
//      printed FAIL on every row, including pairs that are provably fine. A
//      gate that can report a uniform verdict is broken, not decisive.
//   2. Translucent tokens are composited over the surface they are actually
//      drawn on. Comparing a page-composited border against a card under-reports
//      and can invent a bug that isn't there.
//
// Usage:  node scripts/ui-audit/contrast.mjs

import { readFileSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

// Usage:  node scripts/ui-audit/contrast.mjs [path/to/globals.css]
// The optional path exists so the gate can be proved non-vacuous against a
// deliberately mutated copy, without touching the real stylesheet.
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const CSS_PATH = process.argv[2]
  ? resolve(process.argv[2])
  : join(REPO, "packages/ui/src/styles/globals.css")
const css = readFileSync(CSS_PATH, "utf8")

// ── colour maths ────────────────────────────────────────────────────────────
function oklchToRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h), b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
  const f = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ].map((x) => Math.round(Math.min(1, Math.max(0, f(x))) * 255))
}
function hslToRgb(h, s, l) {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map((x) => Math.round(x * 255))
}
const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const cr = (A, B) => {
  const a = lum(A), b = lum(B)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
const over = (fg, alpha, bg) => fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)))
const hex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("")
const r2 = (x) => x.toFixed(2)

// ── parse the stylesheet ────────────────────────────────────────────────────
function extractBlock(header) {
  const lines = css.split("\n")
  const start = lines.findIndex((l) => l.trim() === header)
  if (start === -1) throw new Error(`block not found in globals.css: ${header}`)
  let depth = 0
  for (let i = start; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") depth++
      else if (ch === "}") { depth--; if (depth === 0) return lines.slice(start, i + 1).join("\n") }
    }
  }
  throw new Error(`unbalanced block: ${header}`)
}

/** token name -> raw value string, for `--name: value;` at any indent. */
function parseTokens(block) {
  const out = new Map()
  const re = /^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim
  let m
  while ((m = re.exec(block))) out.set(m[1], m[2].trim())
  return out
}

/** value string -> { rgb, alpha } or null when it is not a colour. */
function toColor(value) {
  let m
  if ((m = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)%)?\s*\)$/i))) {
    return { rgb: oklchToRgb(+m[1], +m[2], +m[3]), alpha: m[4] ? +m[4] / 100 : 1 }
  }
  if ((m = value.match(/^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)%)?\s*\)$/i))) {
    return { rgb: [+m[1], +m[2], +m[3]], alpha: m[4] ? +m[4] / 100 : 1 }
  }
  // a bare HSL triplet, e.g. `0 0% 4%` -- hsl() is applied in @theme
  if ((m = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/))) {
    return { rgb: hslToRgb(+m[1], +m[2], +m[3]), alpha: 1 }
  }
  return null
}

const root = parseTokens(extractBlock(":root {"))
const dark = parseTokens(extractBlock(".dark {"))

/** Resolve a token for a theme, compositing its alpha over `backdrop`. */
function tok(name, theme, backdrop) {
  const c = tokColor(name, theme)
  return c.alpha === 1 || !backdrop ? c.rgb : over(c.rgb, c.alpha, backdrop)
}

/** Resolve a token to { rgb, alpha } WITHOUT compositing, for callers that need
 *  to composite explicitly. */
function tokColor(name, theme) {
  const raw = theme.get(name) ?? root.get(name)
  if (raw === undefined) throw new Error(`token not found: ${name}`)
  const c = toColor(raw)
  if (!c) throw new Error(`token is not a colour: ${name} = ${raw}`)
  return c
}

// ── checks ──────────────────────────────────────────────────────────────────
const rows = []
// `info: true` marks a REFERENCE row -- it shows what a forbidden value measures,
// to justify the rule. It is not an assertion and must not fail the gate.
const add = (group, label, actual, threshold, note = "", info = false) =>
  rows.push({ group, label, actual, threshold, ok: info ? true : actual >= threshold, note, info })

const LIGHT = "light", DARK = "dark"

// CONTROL -- if this fails the harness is broken, not the design system.
const control = cr(tok("--foreground", root, null), tok("--background", root, null))
if (control < 15) {
  console.log(`HARNESS ERROR: the known-good control failed (foreground/background = ${r2(control)}:1).`)
  console.log("A ~19:1 pair measuring this low means the parser or the colour maths is wrong.")
  console.log("Do not read any other result from this run.")
  process.exit(2)
}
console.log(`control ok -- foreground/background = ${r2(control)}:1 (expected ~19.8)\n`)

for (const [themeName, theme] of [["light", root], ["dark", dark]]) {
  const bg = tok("--background", theme, null)
  const card = tok("--card", theme, null)
  const muted = tok("--muted", theme, null)
  const secondary = tok("--secondary", theme, null)
  const fg = tok("--foreground", theme, null)
  const mutedFg = tok("--muted-foreground", theme, null)
  const ring = tok("--ring", theme, null)
  const destructive = tok("--destructive", theme, null)
  // --elevation-edge is translucent (rgb(... / 15%)). Its RENDERED colour is the
  // band composited over the page it is drawn on; that rendered colour is then
  // flanked by the page behind it and the control face above it, and the worse
  // of the two binds. Compositing the band over the *face* instead reports a
  // flattering 1.79:1 and hides the documented 1.25:1.
  const edgeC = tokColor("--elevation-edge", theme)
  const edgeOnPage = over(edgeC.rgb, edgeC.alpha, bg)

  // dark ramp must rise
  if (themeName === "dark") {
    add("ramp", "background < card < muted", 1, 1,
      `${hex(bg)} < ${hex(card)} < ${hex(muted)}`)
    rows[rows.length - 1].ok = lum(bg) < lum(card) && lum(card) < lum(muted)
  }

  add(themeName, "ring (full) vs background", cr(ring, bg), 3, hex(ring))
  add(themeName, "ring (full) vs card", cr(ring, card), 3)
  add(themeName, "ring (full) vs muted", cr(ring, muted), 3)
  // Reference only: these document WHY the house rule forbids diluting a ring.
  // The rule itself is enforced against the class strings by focus-rings.mjs.
  add(themeName, "ring/30 vs background", cr(over(ring, 0.3, bg), bg), 3, "reference -- forbidden", true)
  add(themeName, "ring/50 vs background", cr(over(ring, 0.5, bg), bg), 3, "reference -- forbidden", true)
  add(themeName, "destructive/20 vs background", cr(over(destructive, 0.2, bg), bg), 3, "reference -- border carries it", true)

  add(themeName, "muted-foreground vs muted", cr(mutedFg, muted), 4.5)
  add(themeName, "muted-foreground vs secondary", cr(mutedFg, secondary), 4.5)
  add(themeName, "muted-foreground vs background", cr(mutedFg, bg), 4.5)
  add(themeName, "foreground vs background", cr(fg, bg), 4.5)
  for (const s of ["--success", "--warning", "--info"]) {
    add(themeName, `${s} vs background`, cr(tok(s, theme, null), bg), 4.5)
    add(themeName, `${s} vs muted`, cr(tok(s, theme, null), muted), 4.5)
  }

  // the elevation band is flanked by the page AND the control face; the face binds
  add(themeName, "elevation edge vs page", cr(edgeOnPage, bg), 1.2, hex(edgeOnPage))
  add(themeName, "elevation edge vs face", cr(edgeOnPage, secondary), 1.2, "binding")
}

// ── landing palette (forced dark, :root only) ───────────────────────────────
{
  const bg = tok("--bg", root, null)
  const surface = tok("--surface", root, null)
  const text = tok("--text", root, null)
  const fog = tok("--fog", root, null)
  const stroke = tok("--stroke", root, null)
  const brand = tok("--brand", root, null)
  const brandFg = tok("--brand-foreground", root, null)

  add("landing", "text vs bg", cr(text, bg), 4.5)
  add("landing", "text vs surface", cr(text, surface), 4.5)
  add("landing", "fog vs bg", cr(fog, bg), 4.5)
  add("landing", "fog vs surface", cr(fog, surface), 4.5, "lede/body copy")
  add("landing", "stroke vs bg", cr(stroke, bg), 1.2, hex(stroke))
  add("landing", "stroke vs surface", cr(stroke, surface), 1.2, "binding -- card borders")
  add("landing", "brand vs bg", cr(brand, bg), 3)
  add("landing", "brand-foreground on brand", cr(brandFg, brand), 4.5)
  add("landing", "app-shell and landing share a base", 1, 1,
    `${hex(bg)} vs ${hex(tok("--background", dark, null))}`)
  rows[rows.length - 1].ok = hex(bg) === hex(tok("--background", dark, null))
}

// ── report ──────────────────────────────────────────────────────────────────
let group = ""
let failures = 0
let references = 0
console.log("  pair                                       ratio   need   result")
console.log("  ------------------------------------------ ------- ------ --------")
for (const row of rows) {
  if (row.group !== group) { group = row.group; console.log(` ${group}`) }
  if (row.info) references++
  else if (!row.ok) failures++
  const ratio = row.threshold === 1 ? "  --  " : `${r2(row.actual)}:1`.padStart(6)
  const need = row.threshold === 1 ? " --  " : `${row.threshold}`.padStart(5)
  const result = row.info ? " ref" : row.ok ? "PASS" : "FAIL"
  console.log(
    `  ${row.label.padEnd(42)} ${ratio}  ${need}  ${result}${row.note ? `   ${row.note}` : ""}`
  )
}

const asserted = rows.length - references
console.log(`\n${asserted} assertions, ${failures} failing  (${references} reference rows, not asserted)`)
if (failures) {
  console.log("\nRESULT: FAIL")
  process.exit(1)
}
console.log("RESULT: PASS")
