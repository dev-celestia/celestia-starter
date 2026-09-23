import { join } from "node:path"

import { writeFileAtomic } from "./fsx.js"
import type { NormalizedManifest } from "./manifest.js"
import type { InsertionReport, WarningReport } from "./types.js"

export interface PromptGenerationParams {
  manifest: NormalizedManifest
  copiedFiles: string[]
  unchangedFiles?: string[]
  appliedInsertions: InsertionReport[]
  warnings: WarningReport[]
  updatedJsonFiles: { file: string; path: string; value: string }[]
  addedDeps: Record<string, string[]>
  addedDevDeps: Record<string, string[]>
  conflicts?: { target: string; name: string; current: string; incoming: string }[]
  backups?: { path: string; backup: string }[]
  previousVersion?: string
  dryRun?: boolean
}

const WARNING_LABELS: Record<WarningReport["type"], string> = {
  missing_file: "Missing file",
  missing_marker: "Missing marker region",
  missing_json: "JSON update failed",
  missing_dependency: "Dependency target missing",
  dep_conflict: "Dependency version conflict",
  overwrite: "Existing file overwritten",
  user_modified: "File modified since install",
  skipped: "Skipped",
  other: "Note",
}

/**
 * Build the optional "AI verification" prompt: a self-contained brief a coding
 * assistant can follow to sanity-check an install against a customised repo.
 */
export function generateVerificationPrompt(params: PromptGenerationParams): string {
  const {
    manifest,
    copiedFiles,
    unchangedFiles = [],
    appliedInsertions,
    warnings,
    updatedJsonFiles,
    addedDeps,
    addedDevDeps,
    conflicts = [],
    backups = [],
    previousVersion,
    dryRun = false,
  } = params

  const lines: string[] = []

  lines.push(`# AI Feature Verification & Wiring: \`${manifest.name}\` (v${manifest.version})`)
  lines.push("")
  lines.push(`> **Feature Description**: ${manifest.description}`)
  if (previousVersion) {
    lines.push(`> **Upgraded from**: v${previousVersion}`)
  }
  lines.push("")
  lines.push(
    "This document was generated automatically by `feature-manager`. Paste it into your AI coding tool " +
      "(Cursor, Claude Code, Copilot, …) to verify that the feature was installed cleanly and integrates " +
      "well with any custom modifications in this codebase.",
  )
  if (dryRun) {
    lines.push("")
    lines.push("> ⚠️ This prompt was generated from a **dry run** — nothing has been written to disk yet.")
  }
  lines.push("")

  lines.push("## 1. Installation Overview")
  lines.push("")

  if (copiedFiles.length > 0) {
    lines.push(`### Copied Files (${copiedFiles.length})`)
    for (const file of copiedFiles) lines.push(`- \`${file}\``)
    lines.push("")
  }

  if (unchangedFiles.length > 0) {
    lines.push(`### Already Up To Date (${unchangedFiles.length})`)
    for (const file of unchangedFiles) lines.push(`- \`${file}\``)
    lines.push("")
  }

  if (appliedInsertions.length > 0) {
    lines.push("### Connected Markers (Insertions)")
    for (const insertion of appliedInsertions) {
      lines.push(`- Target: \`${insertion.file}\` (marker: \`${insertion.marker}\`)`)
    }
    lines.push("")
  }

  if (updatedJsonFiles.length > 0) {
    lines.push("### Updated JSON Files")
    for (const entry of updatedJsonFiles) {
      lines.push(`- \`${entry.file}\` (appended \`${entry.value}\` to \`${entry.path}\`)`)
    }
    lines.push("")
  }

  const depTargets = Array.from(new Set([...Object.keys(addedDeps), ...Object.keys(addedDevDeps)]))
  if (depTargets.length > 0) {
    lines.push("### Package Dependencies")
    for (const target of depTargets) {
      const deps = addedDeps[target] ?? []
      const devDeps = addedDevDeps[target] ?? []
      if (deps.length > 0) lines.push(`- \`${target}\` dependencies: ${deps.map((d) => `\`${d}\``).join(", ")}`)
      if (devDeps.length > 0) {
        lines.push(`- \`${target}\` devDependencies: ${devDeps.map((d) => `\`${d}\``).join(", ")}`)
      }
    }
    lines.push("")
  }

  if (manifest.env && Object.keys(manifest.env).length > 0) {
    lines.push("### Required Environment Variables")
    for (const [target, vars] of Object.entries(manifest.env)) {
      if (vars.length === 0) continue
      lines.push(`- \`${target}/.env\`:`)
      for (const entry of vars) lines.push(`  - \`${entry}\``)
    }
    lines.push("")
  }

  if (backups.length > 0) {
    lines.push("### Backed Up Files")
    lines.push("These files were overwritten; the previous content is stored for restoration on removal.")
    for (const backup of backups) lines.push(`- \`${backup.path}\` → \`${backup.backup}\``)
    lines.push("")
  }

  if (conflicts.length > 0) {
    lines.push("## 2. ⚠️ Dependency Version Conflicts")
    lines.push("")
    lines.push("These packages were already present at a different version and have been realigned:")
    lines.push("")
    for (const conflict of conflicts) {
      lines.push(`- \`${conflict.name}\` in \`${conflict.target}\`: \`${conflict.current}\` → \`${conflict.incoming}\``)
    }
    lines.push("")
    lines.push("Confirm the new range does not break other features that rely on the previous version.")
    lines.push("")
  }

  if (warnings.length > 0) {
    lines.push(`## ${conflicts.length > 0 ? 3 : 2}. ⚠️ Warnings / Unplaced Snippets (Attention Required)`)
    lines.push("")
    lines.push(
      "The deterministic installer could not fully apply the following entries, usually because the target " +
        "file or its marker region is missing or has been modified:",
    )
    lines.push("")
    for (const warning of warnings) {
      lines.push(`### ${WARNING_LABELS[warning.type]}: \`${warning.file}\``)
      lines.push(`- **Issue**: ${warning.message}`)
      if (warning.marker) lines.push(`- **Expected Marker**: \`${warning.marker}\``)
      if (warning.snippet) {
        lines.push("- **Snippet to integrate manually**:")
        lines.push("```tsx")
        lines.push(warning.snippet)
        lines.push("```")
      }
      lines.push("")
    }
  } else {
    lines.push(`## ${conflicts.length > 0 ? 3 : 2}. Status: Clean Deterministic Install`)
    lines.push("")
    lines.push("All files and markers were placed into their expected locations without conflicts.")
    lines.push("")
  }

  const section = conflicts.length > 0 || warnings.length > 0 ? 4 : 3

  lines.push(`## ${section}. 🛡️ Celestia Architectural Rules`)
  lines.push("When reviewing or modifying the code, ensure these boundaries stay intact:")
  lines.push(
    "1. **Frontend (`apps/web`)**: pure UI client. **Never** import database clients (`@workspace/db`), " +
      "the server auth instance (`betterAuth`), or secret environment variables here.",
  )
  lines.push(
    "2. **Backend API (`apps/api`)**: Hono server on port 4000. Owns all database access, business logic, " +
      "and the Better Auth server instance.",
  )
  lines.push("3. **Shared database (`packages/db`)**: Drizzle ORM schema + client, consumed by `apps/api`.")
  lines.push("4. **Shared UI (`packages/ui`)**: reusable component library (`@celestia-project/ui`).")
  lines.push("")

  lines.push(`## ${section + 1}. 🛠️ Action Items for the AI Coding Assistant`)
  lines.push("Please perform these verification and assembly checks:")
  lines.push("1. **Type & syntax check**: confirm every new file, component and route handler compiles and uses correct import paths.")
  lines.push("2. **Review warnings**: wire up any unplaced snippets listed above using the current codebase layout.")
  lines.push("3. **Navigation & routes**: ensure the feature's pages are reachable and linked in the UI and router.")
  lines.push("4. **Database schema**: if new tables were introduced, verify `@workspace/db` exports them correctly.")
  lines.push("5. **Summary**: report the feature status and whether any manual adjustments were needed.")
  lines.push("")

  return lines.join("\n")
}

export function saveVerificationPrompt(root: string, featureName: string, promptContent: string): string {
  const promptPath = join(root, ".prompts", `verify-${featureName}.md`)
  writeFileAtomic(promptPath, `${promptContent}\n`)
  return promptPath
}
