#!/usr/bin/env node
// Feature-template guard.
//
// Two earlier versions of this guard were wrong, and both failures are worth
// recording because they are the reason the rule is now this narrow.
//
//   v1  failed on ANY difference between a template and an existing target.
//       It reported 13 violations across 4 features. All 13 were legitimate:
//       after a feature is installed the app keeps evolving while the template
//       stays at the generation that was installed. Divergence is the expected
//       steady state, and `add-feature --force` exists to overwrite it.
//
//   v2  added a basename-collision rule, which flagged `types.ts` in the cms and
//       media-r2 features -- a generic filename that will always collide with
//       something. Two more false positives.
//
// The genuinely wrong shape is exactly one, and it is what the `blog` feature
// shipped:
//
//     { "from": "ui/components/textarea.tsx",
//       "to":   "packages/ui/src/components/textarea.tsx" }
//
// `packages/ui/src/index.ts` exports Textarea from `primitive/textarea`, so the
// target path is NOT on the barrel. The file did not exist, and the feature had
// no insertion into the barrel, so the install would CREATE a second,
// unreferenced textarea inside a published package -- an older generation
// carrying a diluted focus ring, while the canonical primitive had already
// gained a `leading` variant axis and a `mono` prop. Nothing typechecks or
// builds differently, so no existing gate could see it.
//
// THE RULE: a copy that writes a NEW file under `packages/ui/` is dead code
// unless the same feature also inserts an export into `packages/ui/src/index.ts`.
//
// Template/target divergence is reported only under `--drift`, as information.
//
// Usage:  node scripts/ui-audit/feature-drift.mjs [--drift]

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const FEATURES = join(REPO, "packages/feature-manager/features")
const UI_BARREL = "packages/ui/src/index.ts"
const SHOW_DRIFT = process.argv.includes("--drift")

const problems = []
const drift = []
let checked = 0
let newInUi = 0

const featureDirs = readdirSync(FEATURES).filter((n) => statSync(join(FEATURES, n)).isDirectory())

for (const name of featureDirs) {
  const manifestPath = join(FEATURES, name, "feature.json")
  if (!existsSync(manifestPath)) {
    problems.push(`[${name}] no feature.json`)
    continue
  }

  let manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  } catch (err) {
    problems.push(`[${name}] feature.json is not valid JSON -- ${err.message}`)
    continue
  }

  const insertions = manifest.insertions ?? []
  const exportsFromBarrel = insertions.some((i) => i && i.file === UI_BARREL)

  for (const entry of manifest.copies ?? []) {
    if (!entry || typeof entry.from !== "string" || typeof entry.to !== "string") {
      problems.push(`[${name}] malformed copies entry: ${JSON.stringify(entry)}`)
      continue
    }
    checked++

    const fromAbs = join(FEATURES, name, entry.from)
    const toAbs = join(REPO, entry.to)

    if (!existsSync(fromAbs)) {
      problems.push(`[${name}] missing source template: packages/feature-manager/features/${name}/${entry.from}`)
      continue
    }

    const writesNewFileIntoUi = entry.to.startsWith("packages/ui/") && !existsSync(toAbs)

    if (writesNewFileIntoUi) {
      newInUi++
      if (!exportsFromBarrel) {
        problems.push(
          `[${name}] DEAD CODE IN PUBLISHED PACKAGE\n` +
            `        copy: ${entry.from}  ->  ${entry.to}\n` +
            `        The target does not exist, so this CREATES a new file inside\n` +
            `        packages/ui/, but the feature declares no insertion into\n` +
            `        ${UI_BARREL}.\n` +
            `        Nothing would import it. Either drop the copy and import the\n` +
            `        existing component, or add a barrel insertion.`
        )
      }
    }

    if (SHOW_DRIFT && existsSync(toAbs)) {
      const a = readFileSync(fromAbs)
      const b = readFileSync(toAbs)
      if (!a.equals(b)) {
        drift.push(`[${name}] ${entry.to}  template ${a.length}b / target ${b.length}b`)
      }
    }
  }
}

console.log(`feature template guard -- ${featureDirs.length} features, ${checked} copies entries`)
console.log(`new files written into packages/ui/: ${newInUi}`)

if (SHOW_DRIFT) {
  console.log(`\ntemplate/target divergence (informational -- normal after install):`)
  for (const d of drift) console.log(`  ${d}`)
  if (!drift.length) console.log("  none")
}

if (problems.length) {
  console.log(`\nRESULT: FAIL -- ${problems.length} problem(s)`)
  for (const p of problems) console.log(`\n  ${p}`)
  process.exit(1)
}
console.log("\nRESULT: PASS -- no dead code written into packages/ui/")
