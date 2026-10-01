#!/usr/bin/env node
// Mobile design-system contrast gate.
//
// The web token layer has had a contrast gate for a while (`contrast.mjs`); the
// mobile package -- 157 modules, its own hand-written ramp -- had none until
// this. It runs as part of `pnpm audit:ui`.
//
// Three disciplines, copied from `contrast.mjs`:
//
//   1. It reads `lightColors` / `darkColors` OUT OF `tokens.ts`. The values are
//      never duplicated here, so the gate cannot drift from the source.
//   2. It runs a known-good control FIRST and refuses to report if it fails. An
//      earlier web helper compared a ratio against the string '3:1'
//      (`4.88 >= NaN`), so EVERY row printed FAIL including provably-fine pairs.
//      A gate that can emit a uniform verdict is broken, not decisive.
//   3. Assertions and reference rows are separated. The reference rows document
//      house-wide conventions this gate deliberately does not enforce; they are
//      printed for the reader and excluded from the exit code.
//
// It asserts the COMPONENT RENDER CONTRACTS, not just abstract token pairs,
// because reachability is what makes a finding actionable. Each contract names
// the component that creates it.
//
// Usage:  node scripts/ui-audit/mobile-contrast.mjs [--all]

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const TOKENS = join(REPO, "packages/mobile/src/tokens.ts")
const COMPONENTS = join(REPO, "packages/mobile/src/components")
const ALL = process.argv.includes("--all")

/* ------------------------------------------------------------------ colour */

function parseHex(hex) {
  let h = hex.replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  }
}

function relLum({ r, g, b }) {
  const f = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Composite a possibly-translucent colour over an opaque one. */
function over(src, dst) {
  const a = src.a
  return {
    r: src.r * a + dst.r * (1 - a),
    g: src.g * a + dst.g * (1 - a),
    b: src.b * a + dst.b * (1 - a),
    a: 1,
  }
}

function contrast(c1, c2) {
  const x = relLum(c1)
  const y = relLum(c2)
  const [hi, lo] = x > y ? [x, y] : [y, x]
  return (hi + 0.05) / (lo + 0.05)
}

const H = parseHex
const ratio = (a, b) => contrast(parseHex(a), parseHex(b))

/** `hex` at `alpha` over an opaque `backdrop` — how `MobileAlert` builds its tint. */
const tintOver = (hex, alpha, backdrop) =>
  over({ ...parseHex(hex), a: alpha }, parseHex(backdrop))

/**
 * CSS `color-mix(in oklch, <hex>, black <p>)`, which is how the web token layer
 * derives `--shadow-destructive-3d` and therefore how `destructiveEdge` is
 * derived here. Reproduced numerically so the gate can assert the relationship
 * rather than two literals that only happen to agree today.
 */
function mixBlack(hex, p) {
  const { r, g, b } = parseHex(hex)
  const lin = (c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const R = lin(r)
  const G = lin(g)
  const B = lin(b)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const k = 1 - p
  const l3 = (L * k + 0.3963377774 * A * k + 0.2158037573 * Bb * k) ** 3
  const m3 = (L * k - 0.1055613458 * A * k - 0.0638541728 * Bb * k) ** 3
  const s3 = (L * k - 0.0894841775 * A * k - 1.291485548 * Bb * k) ** 3
  const enc = (c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
    return Math.max(0, Math.min(255, Math.round(v * 255)))
  }
  const x = (n) => n.toString(16).padStart(2, "0")
  return `#${x(enc(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3))}${x(
    enc(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3)
  )}${x(enc(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3))}`
}

/* ------------------------------------------------------------- read tokens */

function readRamp(src, name) {
  const start = src.indexOf(`export const ${name}`)
  if (start < 0) throw new Error(`ramp ${name} not found in tokens.ts`)
  const body = src.slice(src.indexOf("{", start), src.indexOf("\n}", start))
  const out = {}
  for (const m of body.matchAll(/^\s{2}([A-Za-z0-9_]+):\s*"([^"]+)"/gm)) {
    out[m[1]] = m[2]
  }
  return out
}

const tokensSrc = readFileSync(TOKENS, "utf8")
const RAMPS = {
  light: readRamp(tokensSrc, "lightColors"),
  dark: readRamp(tokensSrc, "darkColors"),
}

const STATUS = ["success", "warning", "info", "destructive"]

/* ----------------------------------------------------------------- control */

// Runs BEFORE anything is reported, and is wired to the exit code. If the ramp
// it is reading is not the ramp this gate was written against, every row below
// is meaningless -- so refuse to report rather than print a confident verdict.
{
  let broken = false
  for (const [theme, t] of Object.entries(RAMPS)) {
    const c = ratio(t.foreground, t.background)
    const ok = c > 15
    console.log(`control foreground/background (${theme}) ........ ${c.toFixed(2)}:1  ${ok ? "OK" : "HARNESS ERROR"}`)
    if (!ok) broken = true
  }
  if (broken) {
    console.log("\nHARNESS ERROR -- the known-good control pair failed. Refusing to report.")
    process.exit(2)
  }
}

/* --------------------------------------------------------------- hue maths */

/** OKLCH hue angle of a hex colour, in degrees. */
function hueOf(hex) {
  const { r, g, b } = parseHex(hex)
  const R = srgbLin(r)
  const G = srgbLin(g)
  const B = srgbLin(b)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
}

function srgbLin(c) {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/** Smallest angle between two hues, in degrees. */
function deltaHue(a, b) {
  const d = Math.abs(hueOf(a) - hueOf(b))
  return Math.min(d, 360 - d)
}

/* ------------------------------------------------------------- assertions */

const rows = []
const derivedViolations = []
const assert = (theme, label, fg, bg, need, site) =>
  rows.push({ theme, label, r: contrast(fg, bg), need, site, kind: "assert", pass: contrast(fg, bg) >= need })
const ref = (theme, label, fg, bg, need, note) =>
  rows.push({ theme, label, r: contrast(fg, bg), need, note, kind: "ref", pass: contrast(fg, bg) >= need })

for (const [theme, t] of Object.entries(RAMPS)) {
  const bg = H(t.background)
  const card = H(t.card)
  const surface = H(t.surface)
  const mutedBg = H(t.mutedBackground)
  const track = mutedBg

  // Base ink — also the control, so a broken harness cannot look decisive.
  assert(theme, "foreground on background", H(t.foreground), bg, 4.5, "text.tsx")
  assert(theme, "foreground on card", H(t.foreground), card, 4.5, "card.tsx")
  assert(theme, "foreground on surface", H(t.foreground), surface, 4.5, "surface.tsx")

  // Muted ink on every backdrop it lands on.
  assert(theme, "muted on background", H(t.muted), bg, 4.5, "text.tsx")
  assert(theme, "muted on card", H(t.muted), card, 4.5, "text.tsx")
  assert(theme, "muted on surface", H(t.muted), surface, 4.5, "input.tsx placeholder")
  assert(theme, "muted on mutedBackground", H(t.muted), mutedBg, 4.5, "segmented-control.tsx:161, avatar-group.tsx")

  for (const role of STATUS) {
    // The hue as TEXT on the plain surfaces.
    assert(theme, `${role} text on card`, H(t[role]), card, 4.5, "form-field.tsx:126, copy-button.tsx:106, stat-card.tsx:81")
    assert(theme, `${role} text on surface`, H(t[role]), surface, 4.5, "ai-error-card.tsx:130")
    // The hue as TEXT on its own 10% self-tint over card (MobileAlert's title).
    assert(theme, `${role} title on 10% self-tint`, H(t[role]), tintOver(t[role], 0.1, t.card), 4.5, "alert.tsx:126+135")
    // Ink on a solid status FILL.
    assert(theme, `${role}Foreground on ${role} fill`, H(t[`${role}Foreground`]), H(t[role]), 4.5, "badge.tsx, tag.tsx, button.tsx:180")
    // The hue as a non-text indicator against its track.
    assert(theme, `${role} fill vs track`, H(t[role]), track, 3.0, "progress.tsx:138+146")
  }

  assert(theme, "primaryForeground on primary fill", H(t.primaryForeground), H(t.primary), 4.5, "button.tsx, badge.tsx")
  assert(theme, "primary as text on background", H(t.primary), bg, 4.5, "link.tsx, model-selector.tsx:151")
  assert(theme, "secondaryForeground on secondary", H(t.secondaryForeground), H(t.secondary), 4.5, "button.tsx:192")
  assert(theme, "accentForeground on accent", H(t.accentForeground), H(t.accent), 4.5, "menu.tsx")

  for (let i = 1; i <= 5; i++) {
    assert(theme, `chart${i} on card`, H(t[`chart${i}`]), card, 3.0, "chart-*.tsx series dot / legend swatch")
  }

  // --- the escalating gauge -------------------------------------------------
  // MobileTokenMeter walks muted -> warning -> destructive on a 4pt bar, so
  // adjacent steps must be *perceptibly* different on at least one axis. A pair
  // can be far apart in hue and identical in lightness (which reads as the same
  // colour on a thin bar) or vice versa, so neither axis alone is the test.
  //
  // This is not hypothetical. Both status hues are pinned under the 4.5:1
  // luminance ceiling in §"house rules", so converging them on the sibling
  // package's values put warning and destructive at OKLCH L 0.5063 and 0.5054 —
  // dL 0.0009, contrast 1.06:1. The gauge's top two steps became one colour.
  // Web's own warning/destructive step measures 1.278:1, so 1.25 is the floor.
  {
    const steps = [
      ["muted", "warning"],
      ["warning", "destructive"],
    ]
    for (const [a, b] of steps) {
      const c = contrast(H(t[a]), H(t[b]))
      const dh = deltaHue(t[a], t[b])
      const pass = c >= 1.25 || dh >= 40
      rows.push({
        theme,
        label: `gauge step ${a} -> ${b}`,
        r: c,
        need: 1.25,
        kind: "assert",
        pass,
        site: `contrast ${c.toFixed(2)}:1 / dH ${dh.toFixed(1)}deg (one of the two must clear)`,
      })
    }
  }

  // Reference rows — house-wide conventions this gate does NOT enforce.
  ref(theme, "cardBorder vs card", H(t.cardBorder), card, 1.2, "decorative hairline")
  ref(theme, "mutedBackground vs card", mutedBg, card, 1.2, "borderless fill; web's is 1.13:1")
  ref(theme, "inputBorder vs surface", H(t.inputBorder), surface, 3.0, "WCAG 1.4.11 -- house-wide, see below")
}

/* -------------------------------------------------- derived-value contract */

// `destructiveEdge` is not an independent choice: it is
// `color-mix(in oklch, destructive, black 30%)`, the sRGB bake of the web
// token layer's `--shadow-destructive-3d`. Asserting the relationship catches
// the failure mode where `destructive` moves and the edge is left behind --
// which silently flattens the button's 2px bottom edge.
{
  const derived = []
  for (const [theme, t] of Object.entries(RAMPS)) {
    const expected = mixBlack(t.destructive, 0.3)
    const actual = t.destructiveEdge
    const e = parseHex(expected)
    const a = parseHex(actual)
    const ok = Math.abs(e.r - a.r) <= 1 && Math.abs(e.g - a.g) <= 1 && Math.abs(e.b - a.b) <= 1
    derived.push({ theme, ok, expected, actual, sep: ratio(expected, t.destructive) })
  }
  const bad = derived.filter((d) => !d.ok)
  console.log("derived-token contract -- destructiveEdge == color-mix(oklch, destructive, black 30%)")
  for (const d of derived) {
    console.log(
      `  ${d.ok ? "  ok" : "FAIL"} ${d.theme.padEnd(6)} expected ${d.expected}  actual ${d.actual}  ` +
        `(edge/face separation ${d.sep.toFixed(2)}:1)`
    )
  }
  if (bad.length) {
    console.log(`\n  ${bad.length} ramp(s) carry a stale destructiveEdge -- the edge no longer tracks the face.`)
  }
  // Wired into the exit code. A check that prints FAIL but exits 0 is decoration,
  // and this one caught exactly that in its own first non-vacuity run.
  for (const d of bad) derivedViolations.push(d)
}

/* --------------------------------------------------- spacing-scale census */

// Not an assertion. The component layer predates the `spacing` export and several
// of its literals (6, 10, 14, 20, 24, 48) are not on the scale. Snapping them is
// a visible redesign across 157 modules, so the migration is incremental and this
// census keeps the remaining debt visible rather than silently frozen. It prints
// on every run and never affects the exit code -- the moment it becomes an
// assertion, it either blocks unrelated work or gets deleted.
{
  const spacingSrc = tokensSrc.slice(tokensSrc.indexOf("export const spacing"))
  const scale = {}
  for (const m of spacingSrc.slice(0, spacingSrc.indexOf("\n}")).matchAll(/([a-zA-Z]+):\s*(\d+)/g)) {
    scale[m[1]] = Number(m[2])
  }
  const onScale = new Set(Object.values(scale))

  const files = []
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if (p.endsWith(".tsx")) files.push(p)
    }
  }
  walk(COMPONENTS)

  const RE = {
    padding: /^\s*padding(?:Top|Bottom|Left|Right|Horizontal|Vertical)?:\s*([\d.]+)/gm,
    gap: /^\s*(?:gap|rowGap|columnGap):\s*([\d.]+)/gm,
    margin: /^\s*margin(?:Top|Bottom|Left|Right|Horizontal|Vertical)?:\s*([\d.]+)/gm,
  }
  const offScale = {}
  const counts = {}
  for (const [kind, re] of Object.entries(RE)) {
    const values = new Set()
    const off = new Set()
    for (const f of files) {
      for (const m of readFileSync(f, "utf8").matchAll(re)) {
        const v = Number(m[1])
        values.add(v)
        if (!onScale.has(v)) off.add(v)
      }
    }
    counts[kind] = values.size
    offScale[kind] = [...off].sort((a, b) => a - b)
  }

  console.log(`spacing census -- ${files.length} component modules`)
  console.log(
    `  scale (${Object.entries(scale).map(([k, v]) => `${k} ${v}`).join(", ")}) ` +
      `-- exported as \`spacing\` from tokens.ts`
  )
  for (const kind of Object.keys(RE)) {
    console.log(
      `  ${kind.padEnd(8)} ${String(counts[kind]).padStart(2)} distinct literal values, ` +
        `off-scale: ${offScale[kind].length ? offScale[kind].join(", ") : "none"}`
    )
  }
}


console.log(`\n${"═".repeat(84)}`)
console.log("MOBILE DESIGN-SYSTEM CONTRAST -- reachable component pairings")
console.log(`${"═".repeat(84)}`)

let failing = 0
for (const theme of ["light", "dark"]) {
  const rs = rows.filter((r) => r.theme === theme)
  const as = rs.filter((r) => r.kind === "assert")
  const fails = as.filter((r) => !r.pass)
  failing += fails.length
  console.log(`\n── ${theme} ── ${as.length - fails.length}/${as.length} assertions pass`)
  for (const r of rs) {
    if (r.kind === "ref") {
      if (ALL || !r.pass) console.log(`  ref  ${r.label.padEnd(40)} ${r.r.toFixed(2).padStart(6)}:1   ${r.note ?? ""}`)
      continue
    }
    if (r.pass && !ALL) continue
    console.log(
      `  ${r.pass ? "  ok" : "FAIL"} ${r.label.padEnd(40)} ${r.r.toFixed(2).padStart(6)}:1  need ${r.need}   ${r.site ?? ""}`
    )
  }
}

console.log(`\n${"═".repeat(84)}`)
const total = failing + derivedViolations.length
if (total === 0) {
  console.log("RESULT: PASS -- 0 failing assertions")
  process.exit(0)
}
console.log(
  `RESULT: FAIL -- ${failing} failing contrast assertion(s)` +
    (derivedViolations.length ? ` + ${derivedViolations.length} stale derived token(s)` : "")
)
console.log("\nEvery assertion above names the component that creates the pairing. Fix the")
console.log("token, not the component: the ramps in `packages/mobile/src/tokens.ts` are")
console.log("the only place a colour literal belongs.")
process.exit(1)
