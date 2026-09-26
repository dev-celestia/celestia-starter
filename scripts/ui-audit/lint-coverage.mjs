#!/usr/bin/env node
// Lint coverage guard.
//
// `pnpm lint` -> `turbo lint`, and turbo only runs the task in workspaces that
// DECLARE a `lint` script. A workspace without one is skipped silently and the
// turbo run still exits 0.
//
// Measured before this guard existed: 3 of 10 workspaces had a lint script, and
// `.github/workflows/ci.yml` runs `pnpm lint` as a gate. So CI printed a green
// lint step while 7 projects -- including apps/api, the backend -- were never
// linted. Nothing anywhere reported the skip.
//
// This guard does not add linting to those packages; that needs dependencies
// this repo cannot install here (see PLAN-ui-audit.md §8). What it does is make
// the gap EXPLICIT: a workspace must either declare `lint`, or appear in
// EXEMPT below with a reason. A new package that forgets `lint` now fails loudly
// instead of passing green.
//
// Usage:  node scripts/ui-audit/lint-coverage.mjs

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

// A workspace without a `lint` script must be listed here with a reason.
// Removing an entry is the signal that the package has been wired up.
const EXEMPT = {
  "@workspace/api": "no eslint dependency; add eslint + @workspace/eslint-config and an eslint.config.js",
  mobile: "no eslint dependency and no node_modules (install blocked); see PLAN-ui-audit.md §8",
  "@celestia-project/mobile": "no eslint dependency and no node_modules (install blocked)",
  "@workspace/db": "no eslint dependency; add eslint + @workspace/eslint-config and an eslint.config.js",
  "@celestia-project/create": "CLI package; no eslint dependency",
  "@workspace/eslint-config": "config-only package -- nothing to lint",
  "@workspace/typescript-config": "config-only package -- nothing to lint",
}

const workspaces = []
for (const group of ["apps", "packages"]) {
  const base = join(REPO, group)
  if (!existsSync(base)) continue
  for (const name of readdirSync(base)) {
    const pkgPath = join(base, name, "package.json")
    if (!existsSync(join(base, name)) || !statSync(join(base, name)).isDirectory()) continue
    if (!existsSync(pkgPath)) continue
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
    workspaces.push({ dir: `${group}/${name}`, name: pkg.name, scripts: pkg.scripts ?? {} })
  }
}

const linted = workspaces.filter((w) => w.scripts.lint)
const missing = workspaces.filter((w) => !w.scripts.lint)

console.log(`lint coverage guard -- ${workspaces.length} workspaces\n`)
console.log(`  with a lint script   ${linted.length}`)
for (const w of linted) console.log(`    ok   ${w.name.padEnd(28)} ${w.dir}`)
console.log(`\n  without a lint script ${missing.length}`)
for (const w of missing) {
  const reason = EXEMPT[w.name]
  console.log(`    ${reason ? "exempt" : "NEW   "} ${w.name.padEnd(28)} ${w.dir}`)
  if (reason) console.log(`           ${reason}`)
}

const undocumented = missing.filter((w) => !EXEMPT[w.name])
const stale = Object.keys(EXEMPT).filter(
  (name) => !missing.some((w) => w.name === name)
)

const pct = Math.round((linted.length / workspaces.length) * 100)
console.log(`\n  coverage ${pct}%  (${linted.length}/${workspaces.length})`)

if (undocumented.length) {
  console.log(`\nRESULT: FAIL -- ${undocumented.length} workspace(s) neither lint nor documented`)
  for (const w of undocumented) {
    console.log(`\n  ${w.name}  (${w.dir})`)
    console.log(`        Add a \`lint\` script, or add an entry to EXEMPT with a reason.`)
  }
  process.exit(1)
}

if (stale.length) {
  console.log(`\nnote: EXEMPT lists ${stale.length} name(s) that no longer exist or now lint:`)
  for (const n of stale) console.log(`    ${n}`)
}

console.log("\nRESULT: PASS -- every workspace either lints or is documented as exempt")
