#!/usr/bin/env node
// UI audit runner -- every static check in one pass.
//
//   contrast        token colour pairs, read out of globals.css
//   token-parity    :root vs .dark token names, font override hooks
//   compile-tokens  the real stylesheet compiles: no cycles, namespaces live
//   focus-rings     no diluted focus ring (the globals.css house rule)
//   feature-drift   no dead code written into packages/ui by a feature
//
// The runtime half of the audit (hydration mismatches, responsive overflow
// across 18 routes x 7 widths) is NOT here: it needs a booted dev server, a live
// API and a seeded user, so it runs as a separate harness -- see PLAN-ui-audit.md.
//
// Usage:  node scripts/ui-audit/run.mjs [--verbose]

import { spawnSync } from "node:child_process"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const VERBOSE = process.argv.includes("--verbose")

const CHECKS = [
  ["contrast.mjs", "token colour contrast, both themes"],
  ["token-parity.mjs", ":root vs .dark parity, font hooks"],
  ["compile-tokens.mjs", "stylesheet compiles, namespaces live"],
  ["focus-rings.mjs", "focus rings are 2px at full strength"],
  ["feature-drift.mjs", "no dead code written into packages/ui"],
]

const results = []
for (const [file, what] of CHECKS) {
  const run = spawnSync(process.execPath, [join(REPO, "scripts/ui-audit", file)], {
    cwd: REPO,
    encoding: "utf8",
  })
  const out = `${run.stdout ?? ""}${run.stderr ?? ""}`
  const status = run.status === 0 ? "PASS" : run.status === 2 ? "ERROR" : "FAIL"
  results.push({ file, what, status, out })
  if (VERBOSE || status !== "PASS") {
    console.log(`\n${"─".repeat(70)}\n${file} -- ${what}\n${"─".repeat(70)}`)
    console.log(out.trimEnd())
  }
}

console.log(`\n${"═".repeat(70)}\nUI audit -- static checks\n${"═".repeat(70)}`)
for (const r of results) {
  console.log(`  ${r.status.padEnd(5)} ${r.file.padEnd(20)} ${r.what}`)
}

const bad = results.filter((r) => r.status !== "PASS")
console.log(`\n${results.length - bad.length}/${results.length} checks passing`)
if (bad.length) {
  console.log(`\nRESULT: FAIL -- re-run a single check with:`)
  for (const r of bad) console.log(`  node scripts/ui-audit/${r.file}`)
  process.exit(1)
}
console.log("\nRESULT: PASS")
