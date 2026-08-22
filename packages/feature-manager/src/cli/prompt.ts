import { existsSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import {
  generateVerificationPrompt,
  saveVerificationPrompt,
  type InsertionReport,
  type WarningReport,
} from "../prompt.js"
import type { FeatureManifest } from "../types.js"
import { normalizeManifest } from "./add.js"

export function promptFeature(name: string | undefined): void {
  const root = resolve(process.cwd())
  const featuresDir = join(root, "features")

  if (!name) {
    console.error("Usage: feature-manager prompt <name>\n")
    process.exit(1)
  }

  const featureDir = join(featuresDir, name)

  if (!existsSync(featureDir)) {
    console.error(`✗ Feature "${name}" not found in features/\n`)
    process.exit(1)
  }

  const manifest = normalizeManifest(
    JSON.parse(readFileSync(join(featureDir, "feature.json"), "utf-8")) as FeatureManifest,
  )

  const copiedFiles: string[] = manifest.copies.map((c) => c.to)
  const appliedInsertions: InsertionReport[] = []
  const warnings: WarningReport[] = []

  for (const ins of manifest.insertions) {
    const targetPath = join(root, ins.file)
    const snippetPath = join(featureDir, ins.snippet)

    if (!existsSync(targetPath)) {
      warnings.push({
        type: "missing_file",
        file: ins.file,
        marker: ins.marker,
        message: `Target file not found at ${ins.file}`,
        snippet: existsSync(snippetPath) ? readFileSync(snippetPath, "utf-8") : undefined,
      })
      continue
    }

    const targetContent = readFileSync(targetPath, "utf-8")
    if (!targetContent.includes(`:${ins.marker}:begin`)) {
      warnings.push({
        type: "missing_marker",
        file: ins.file,
        marker: ins.marker,
        message: `Marker region "${ins.marker}" not found in ${ins.file}`,
        snippet: existsSync(snippetPath) ? readFileSync(snippetPath, "utf-8") : undefined,
      })
      continue
    }

    appliedInsertions.push({
      file: ins.file,
      marker: ins.marker,
      snippetFile: ins.snippet,
    })
  }

  const updatedJsonFiles = manifest.jsonAppends.map((ja) => ({
    file: ja.file,
    path: ja.path,
    value: ja.value,
  }))

  const addedDeps: Record<string, string[]> = {}
  for (const [target, deps] of Object.entries(manifest.dependencies)) {
    addedDeps[target] = Object.keys(deps)
  }

  const addedDevDeps: Record<string, string[]> = {}
  for (const [target, deps] of Object.entries(manifest.devDependencies)) {
    addedDevDeps[target] = Object.keys(deps)
  }

  const promptContent = generateVerificationPrompt({
    manifest,
    copiedFiles,
    appliedInsertions,
    warnings,
    updatedJsonFiles,
    addedDeps,
    addedDevDeps,
  })

  const promptPath = saveVerificationPrompt(root, name, promptContent)

  console.log(`\n✨ Generated AI verification prompt for "${name}":`)
  console.log(`   📄 .prompts/verify-${name}.md`)
  console.log("\n💡 (Optional) If you want to verify or adapt this feature to any custom changes:")
  console.log(`   👉 Copy the contents of .prompts/verify-${name}.md and paste them into your AI coding tool (Antigravity, Cursor, Claude Code, etc.).\n`)
}
