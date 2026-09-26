#!/usr/bin/env node
// Token-layer compile gate.
//
// Compiles packages/ui/src/styles/globals.css with the real Tailwind v4 CLI and
// asserts three things that NO other gate can see:
//
//   1. no custom-property CYCLES -- Tailwind v4 does not error on them. A
//      `--x: var(--x)` resolves to nothing, so the utility silently has no
//      value, and the build stays green.
//   2. every token NAMESPACE actually generates its utility. This is the
//      highest-value check here: a whole group can be dead because the name
//      lives in the wrong namespace (`--duration-*` instead of
//      `--transition-duration-*`) or in `:root` instead of `@theme`. Both fail
//      silently and neither shows up in a diff.
//   3. a CONTROL class that must be ABSENT is absent. Without it, a detector
//      that matches too loosely would pass every assertion above and prove
//      nothing.
//
// It compiles the REAL stylesheet rather than stubs: `packages/ui/node_modules`
// already carries `tw-animate-css` and `shadcn`, so `@import "tw-animate-css"`
// and `@import "shadcn/tailwind.css"` resolve for real. Only the CLI binary
// comes from the managed workspace.
//
// The probe uses `@source inline(...)` (Tailwind v4.1+) to force the utilities
// to be emitted. `@apply` would NOT work here -- it inlines the declarations
// into the probe rule instead of emitting `.bg-brand { ... }`, so an emission
// check would fail for a healthy theme.
//
// Usage:  node scripts/ui-audit/compile-tokens.mjs

import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const UI = join(REPO, "packages/ui")
const WRAPPER = join(UI, ".ui-audit-in.css")
const OUT = join(REPO, ".ui-audit-out.css")

// The CLI is not a dependency of the repo, so it comes from the managed
// workspace. Resolve the version rather than pinning it -- a pinned patch
// version rots and the command then fails with "no such file".
function findCli() {
  const roots = [
    "/Users/870041/.workbuddy-ai/binaries/node/workspace/node_modules",
    join(UI, "node_modules"),
    join(REPO, "node_modules"),
  ]
  for (const root of roots) {
    const direct = join(root, ".bin/tailwindcss")
    if (existsSync(direct)) return direct
  }
  const versions = "/Users/870041/.workbuddy-ai/binaries/node/versions"
  if (existsSync(versions)) {
    for (const v of readdirSync(versions)) {
      const bin = join(versions, v, "bin/npm")
      if (existsSync(bin)) {
        const candidate = join(versions, v, "../../workspace/node_modules/.bin/tailwindcss")
        if (existsSync(candidate)) return resolve(candidate)
      }
    }
  }
  return null
}

const cli = findCli()
if (!cli) {
  console.log("SKIP: the Tailwind v4 CLI is not available in this environment.")
  console.log("      Install it with: npm i -D tailwindcss@4 @tailwindcss/cli@4")
  process.exit(0)
}

// Every utility asserted below must be listed here so `@source inline` forces
// it to be generated even when no source file references it.
const EXPECTED = [
  ["bg-brand", "brand colour (--color-brand)"],
  ["text-brand", "brand text role"],
  ["bg-overlay", "the single scrim (--color-overlay)"],
  ["text-destructive-foreground", "paired destructive foreground"],
  ["bg-success", "status surface"],
  ["text-warning", "status text role"],
  ["shadow-3d", "hard-edged lift (--shadow-3d)"],
  ["rounded-xs", "radius scale bottom (--radius-xs)"],
  ["duration-fast", "--transition-duration-fast namespace"],
  ["duration-slower", "--transition-duration-slower namespace"],
  ["ease-out", "--ease-out namespace"],
  ["text-2xs", "sub-xs type step (--text-2xs)"],
  ["text-4xs", "sub-xs type step (--text-4xs)"],
  ["border-stroke", "landing hairline (--color-stroke)"],
  ["text-fog", "landing muted copy (--color-fog)"],
  ["bg-surface", "landing raised surface (--color-surface)"],
]
const CONTROL = "zzz-not-a-real-class"

const wrapper = [
  '@import "./src/styles/globals.css";',
  '@source "./src";',
  '@source "../apps/web";',
  `@source inline("${[...EXPECTED.map((e) => e[0]), CONTROL].join(" ")}");`,
  "",
].join("\n")

let css
try {
  writeFileSync(WRAPPER, wrapper)
  execFileSync(cli, ["-i", WRAPPER, "-o", OUT], { cwd: UI, stdio: "pipe" })
  css = readFileSync(OUT, "utf8")
} catch (err) {
  console.log("RESULT: FAIL -- the stylesheet did not compile")
  console.log(err.stdout?.toString() || err.message)
  process.exit(1)
} finally {
  rmSync(WRAPPER, { force: true })
  rmSync(OUT, { force: true })
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
// Utilities are emitted INDENTED, inside `@layer utilities { ... }`, so an
// unanchored substring test is always false and reports every utility missing.
const emitted = (name) => new RegExp(`^[ \\t]*\\.${escape(name)}[ \\t]*\\{`, "m").test(css)

// ── 1. cycles ───────────────────────────────────────────────────────────────
// The trailing `[,)]` is essential: `--font-sans: var(--font-sans-family, …)`
// is NOT a cycle, but a naive \b-anchored regex reports it as one.
const cycles = [...css.matchAll(/--([a-z0-9-]+)\s*:\s*var\(\s*--([a-z0-9-]+)\s*[,)]/g)]
  .filter((m) => m[1] === m[2])
  .map((m) => m[1])

// ── 2. emitted utilities ────────────────────────────────────────────────────
const missing = EXPECTED.filter(([name]) => !emitted(name))

// ── 3. control ──────────────────────────────────────────────────────────────
const controlLeaked = emitted(CONTROL)

console.log(`token compile gate -- ${css.length} bytes of CSS from the real stylesheet`)
console.log(`\ncycle check        ${cycles.length ? "FAIL" : "ok"}${cycles.length ? ` -- ${cycles.join(", ")}` : " -- no self-references"}`)
console.log(`emitted utilities  ${missing.length ? "FAIL" : "ok"} -- ${EXPECTED.length - missing.length}/${EXPECTED.length}`)
for (const [name, why] of missing) console.log(`    MISSING  .${name}  (${why})`)
console.log(`detector control   ${controlLeaked ? "FAIL -- the detector matches too loosely" : "ok"} -- .${CONTROL} correctly absent`)

if (cycles.length || missing.length || controlLeaked) {
  console.log("\nRESULT: FAIL")
  process.exit(1)
}
console.log("\nRESULT: PASS")
