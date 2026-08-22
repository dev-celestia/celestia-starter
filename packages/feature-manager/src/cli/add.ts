import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

import { insertIntoRegion, jsonAppend } from "../markers.js"
import {
  generateVerificationPrompt,
  saveVerificationPrompt,
  type InsertionReport,
  type WarningReport,
} from "../prompt.js"
import type {
  FeatureCopy,
  FeatureInsertion,
  FeatureJsonAppend,
  FeatureManifest,
  FeatureTracker,
} from "../types.js"

const WEB = join("apps", "web")

/** A manifest normalized to the current schema (legacy fields folded in). */
export interface NormalizedManifest {
  name: string
  version: string
  description: string
  requires: string[]
  copies: FeatureCopy[]
  insertions: FeatureInsertion[]
  jsonAppends: FeatureJsonAppend[]
  dependencies: Record<string, Record<string, string>>
  devDependencies: Record<string, Record<string, string>>
  env: Record<string, string[]>
  postInstall: string[]
  notes?: string
}

function normalizeDeps(
  deps: Record<string, Record<string, string>> | Record<string, string> | undefined,
): Record<string, Record<string, string>> {
  if (!deps) return {}
  const values = Object.values(deps)
  if (values.length === 0) return {}
  // Legacy flat form ({ "pkg": "version" }) targeted apps/web.
  if (typeof values[0] === "string") {
    return { [WEB]: deps as Record<string, string> }
  }
  return deps as Record<string, Record<string, string>>
}

function normalizeEnv(env: Record<string, string[]> | string[] | undefined): Record<string, string[]> {
  if (!env) return {}
  if (Array.isArray(env)) return { [WEB]: env }
  return env
}

export function normalizeManifest(manifest: FeatureManifest): NormalizedManifest {
  const copies: FeatureCopy[] = [...(manifest.copies ?? [])]
  // Legacy `files` map is web-relative: { "<src>": "<dest in apps/web>" }.
  if (manifest.files) {
    for (const [from, to] of Object.entries(manifest.files)) {
      copies.push({ from, to: join(WEB, to) })
    }
  }

  return {
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    requires: manifest.requires ?? [],
    copies,
    insertions: manifest.insertions ?? [],
    jsonAppends: manifest.jsonAppends ?? [],
    dependencies: normalizeDeps(manifest.dependencies),
    devDependencies: normalizeDeps(manifest.devDependencies),
    env: normalizeEnv(manifest.env),
    postInstall: manifest.postInstall ?? [],
    notes: manifest.notes,
  }
}

function mergeDeps(
  pkgPath: string,
  field: "dependencies" | "devDependencies",
  deps: Record<string, string>,
): void {
  if (!existsSync(pkgPath)) {
    console.warn(`  ⚠ Cannot add ${field}: ${pkgPath} not found`)
    return
  }
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as Record<string, unknown>
  const existing = (pkg[field] as Record<string, string> | undefined) ?? {}
  pkg[field] = { ...existing, ...deps }
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  for (const dep of Object.keys(deps)) {
    console.log(`    + ${dep}`)
  }
}

export function addFeature(name: string | undefined) {
  const root = resolve(process.cwd())
  const featuresDir = join(root, "features")
  const trackerPath = join(root, "features.json")

  if (!name) {
    console.error("Usage: feature-manager add <name>\n")
    printAvailable(featuresDir, trackerPath)
    process.exit(1)
  }

  const featureDir = join(featuresDir, name)

  if (!existsSync(featureDir)) {
    console.error(`✗ Feature "${name}" not found in features/\n`)
    printAvailable(featuresDir, trackerPath)
    process.exit(1)
  }

  const manifest = normalizeManifest(
    JSON.parse(readFileSync(join(featureDir, "feature.json"), "utf-8")) as FeatureManifest,
  )

  const tracker: FeatureTracker = JSON.parse(readFileSync(trackerPath, "utf-8"))

  if (tracker.features[name]) {
    console.error(`✗ Feature "${name}" is already installed (v${tracker.features[name]?.version})`)
    process.exit(1)
  }

  // Check prerequisites.
  for (const dep of manifest.requires) {
    if (!tracker.features[dep]) {
      console.error(`✗ Feature "${name}" requires "${dep}" to be installed first.`)
      console.error(`  Run: pnpm add-feature ${dep}`)
      process.exit(1)
    }
  }

  console.log(`\n⚡ Installing feature: ${manifest.name} (v${manifest.version})`)
  console.log(`   ${manifest.description}\n`)

  const copiedFiles: string[] = []
  const appliedInsertions: InsertionReport[] = []
  const warnings: WarningReport[] = []
  const updatedJsonFiles: { file: string; path: string; value: string }[] = []
  const addedDeps: Record<string, string[]> = {}
  const addedDevDeps: Record<string, string[]> = {}

  // 1. Copy files (multi-target).
  if (manifest.copies.length) {
    console.log("  Copying files...")
    for (const { from, to } of manifest.copies) {
      const srcPath = join(featureDir, from)
      const destPath = join(root, to)

      if (!existsSync(srcPath)) {
        const msg = `Template file not found: ${from}`
        console.warn(`  ⚠ ${msg}`)
        warnings.push({ type: "missing_file", file: from, message: msg })
        continue
      }

      mkdirSync(dirname(destPath), { recursive: true })
      cpSync(srcPath, destPath, { recursive: true })
      copiedFiles.push(to)
      console.log(`    + ${to}`)
    }
  }

  // 2. Insert snippets into managed marker regions.
  if (manifest.insertions.length) {
    console.log("\n  Applying insertions...")
    for (const ins of manifest.insertions) {
      const targetPath = join(root, ins.file)
      const snippetPath = join(featureDir, ins.snippet)

      if (!existsSync(targetPath)) {
        const msg = `Target file not found: ${ins.file}`
        console.warn(`  ⚠ ${msg}`)
        warnings.push({
          type: "missing_file",
          file: ins.file,
          marker: ins.marker,
          message: msg,
          snippet: existsSync(snippetPath) ? readFileSync(snippetPath, "utf-8") : undefined,
        })
        continue
      }
      if (!existsSync(snippetPath)) {
        const msg = `Snippet not found: ${ins.snippet}`
        console.warn(`  ⚠ ${msg}`)
        warnings.push({
          type: "missing_file",
          file: ins.snippet,
          marker: ins.marker,
          message: msg,
        })
        continue
      }

      const snippet = readFileSync(snippetPath, "utf-8").replace(/\n$/, "")
      try {
        const updated = insertIntoRegion(
          readFileSync(targetPath, "utf-8"),
          ins.marker,
          name,
          snippet,
          ins.file,
        )
        writeFileSync(targetPath, updated)
        appliedInsertions.push({
          file: ins.file,
          marker: ins.marker,
          snippetFile: ins.snippet,
        })
        console.log(`    ~ ${ins.file} [${ins.marker}]`)
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.warn(`  ⚠ Insertion warning on ${ins.file} [${ins.marker}]: ${errMsg}`)
        warnings.push({
          type: "missing_marker",
          file: ins.file,
          marker: ins.marker,
          message: errMsg,
          snippet,
        })
      }
    }
  }

  // 3. Append values to JSON arrays.
  if (manifest.jsonAppends.length) {
    console.log("\n  Updating JSON files...")
    for (const ja of manifest.jsonAppends) {
      const targetPath = join(root, ja.file)
      if (!existsSync(targetPath)) {
        const msg = `JSON file not found: ${ja.file}`
        console.warn(`  ⚠ ${msg}`)
        warnings.push({ type: "missing_json", file: ja.file, message: msg })
        continue
      }
      try {
        jsonAppend(targetPath, ja.path, ja.value)
        updatedJsonFiles.push({ file: ja.file, path: ja.path, value: ja.value })
        console.log(`    ~ ${ja.file} [+${ja.path}: ${ja.value}]`)
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.warn(`  ⚠ JSON update error on ${ja.file}: ${errMsg}`)
        warnings.push({ type: "missing_json", file: ja.file, message: errMsg })
      }
    }
  }

  // 4. Add dependencies to each target package.
  const depTargets = Object.keys(manifest.dependencies)
  const devDepTargets = Object.keys(manifest.devDependencies)
  if (depTargets.length || devDepTargets.length) {
    console.log("\n  Adding dependencies...")
    for (const target of depTargets) {
      console.log(`  ${target}:`)
      mergeDeps(join(root, target, "package.json"), "dependencies", manifest.dependencies[target]!)
      addedDeps[target] = Object.keys(manifest.dependencies[target]!)
    }
    for (const target of devDepTargets) {
      console.log(`  ${target}:`)
      mergeDeps(join(root, target, "package.json"), "devDependencies", manifest.devDependencies[target]!)
      addedDevDeps[target] = Object.keys(manifest.devDependencies[target]!)
    }
  }

  // 5. Update tracker.
  tracker.features[name] = {
    version: manifest.version,
    installedAt: new Date().toISOString(),
  }
  writeFileSync(trackerPath, `${JSON.stringify(tracker, null, 2)}\n`)

  // 6. Generate AI verification prompt.
  const promptContent = generateVerificationPrompt({
    manifest,
    copiedFiles,
    appliedInsertions,
    warnings,
    updatedJsonFiles,
    addedDeps,
    addedDevDeps,
  })
  saveVerificationPrompt(root, name, promptContent)

  // 7. Print next steps.
  console.log("\n✅ Feature installed!\n")
  console.log("  Next steps:")

  let step = 1
  console.log(`    ${step++}. Run: pnpm install`)

  for (const [target, vars] of Object.entries(manifest.env)) {
    if (!vars.length) continue
    console.log(`    ${step++}. Add env vars to ${target}/.env:`)
    for (const env of vars) {
      console.log(`       ${env}`)
    }
  }

  if (manifest.postInstall.length) {
    console.log(`    ${step++}. Run post-install commands:`)
    for (const cmd of manifest.postInstall) {
      console.log(`       ${cmd}`)
    }
  }

  if (manifest.notes) {
    console.log(`\n  📝 ${manifest.notes}`)
  }

  // Polite optional AI verification notice
  console.log("\n────────────────────────────────────────────────────────────────────────")
  console.log(`🤖 (Optional) AI Verification Prompt:`)
  console.log(`   Saved to: .prompts/verify-${name}.md`)
  console.log("")
  console.log(`   If you would like to sanity check this installation or if you have`)
  console.log(`   customized files, please feel free to copy the prompt from:`)
  console.log(`     .prompts/verify-${name}.md`)
  console.log(`   and paste it into your AI assistant (e.g. Antigravity, Cursor, etc.)`)
  console.log(`   to verify that everything fits cleanly into your project.`)
  console.log("────────────────────────────────────────────────────────────────────────\n")
}

function printAvailable(featuresDir: string, trackerPath: string) {
  const tracker: FeatureTracker = existsSync(trackerPath)
    ? (JSON.parse(readFileSync(trackerPath, "utf-8")) as FeatureTracker)
    : { features: {} }

  if (!existsSync(featuresDir)) {
    console.error("No features/ directory found.")
    return
  }

  const dirs = readdirSync(featuresDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const available = dirs.flatMap((dir) => {
    const p = join(featuresDir, dir, "feature.json")
    if (!existsSync(p)) return []
    const m = JSON.parse(readFileSync(p, "utf-8")) as FeatureManifest
    return [{ name: dir, description: m.description }]
  })

  if (available.length === 0) {
    console.error("No features available.")
    return
  }

  console.error("Available features:")
  for (const f of available) {
    const installed = tracker.features[f.name] ? " ✓ installed" : ""
    console.error(`  - ${f.name}: ${f.description}${installed}`)
  }
}
