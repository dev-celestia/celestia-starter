import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { FeatureCopy, FeatureInsertion, FeatureJsonAppend, FeatureManifest } from "./types.js"

export interface InsertionReport {
  file: string
  marker: string
  snippetFile: string
}

export interface WarningReport {
  type: "missing_file" | "missing_marker" | "missing_json" | "other"
  file: string
  marker?: string
  snippet?: string
  message: string
}

export interface PromptGenerationParams {
  manifest: FeatureManifest & {
    copies?: FeatureCopy[]
    insertions?: FeatureInsertion[]
    jsonAppends?: FeatureJsonAppend[]
    dependencies?: Record<string, Record<string, string>>
    devDependencies?: Record<string, Record<string, string>>
    env?: Record<string, string[]>
    postInstall?: string[]
    notes?: string
  }
  copiedFiles: string[]
  appliedInsertions: InsertionReport[]
  warnings: WarningReport[]
  updatedJsonFiles: { file: string; path: string; value: string }[]
  addedDeps: Record<string, string[]>
  addedDevDeps: Record<string, string[]>
}

export function generateVerificationPrompt(params: PromptGenerationParams): string {
  const {
    manifest,
    copiedFiles,
    appliedInsertions,
    warnings,
    updatedJsonFiles,
    addedDeps,
    addedDevDeps,
  } = params

  const lines: string[] = []

  lines.push(`# AI Feature Verification & Wiring: \`${manifest.name}\` (v${manifest.version})`)
  lines.push("")
  lines.push(`> **Feature Description**: ${manifest.description}`)
  lines.push("")
  lines.push("This document was generated automatically by `feature-manager`. You can paste this entire prompt into your AI coding tool (e.g. Antigravity, Cursor, Claude Code, Copilot) to optionally verify that the feature was installed cleanly and integrates well with any custom modifications in this codebase.")
  lines.push("")

  lines.push("## 1. Installation Overview")
  lines.push("")

  if (copiedFiles.length > 0) {
    lines.push("### Copied Files")
    for (const f of copiedFiles) {
      lines.push(`- \`${f}\``)
    }
    lines.push("")
  }

  if (appliedInsertions.length > 0) {
    lines.push("### Connected Markers (Insertions)")
    for (const ins of appliedInsertions) {
      lines.push(`- Target: \`${ins.file}\` (marker: \`${ins.marker}\`)`)
    }
    lines.push("")
  }

  if (updatedJsonFiles.length > 0) {
    lines.push("### Updated JSON Files")
    for (const j of updatedJsonFiles) {
      lines.push(`- \`${j.file}\` (appended \`${j.value}\` to \`${j.path}\`)`)
    }
    lines.push("")
  }

  const allDepTargets = Array.from(
    new Set([...Object.keys(addedDeps), ...Object.keys(addedDevDeps)]),
  )
  if (allDepTargets.length > 0) {
    lines.push("### Package Dependencies")
    for (const target of allDepTargets) {
      const deps = addedDeps[target] ?? []
      const devDeps = addedDevDeps[target] ?? []
      if (deps.length > 0) {
        lines.push(`- \`${target}\` dependencies: ${deps.map((d) => `\`${d}\``).join(", ")}`)
      }
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
      for (const v of vars) {
        lines.push(`  - \`${v}\``)
      }
    }
    lines.push("")
  }

  if (warnings.length > 0) {
    lines.push("## 2. ⚠️ Warnings / Unplaced Snippets (Attention Required)")
    lines.push("")
    lines.push("The deterministic installer could not automatically inject the following snippets due to missing or modified markers in the current codebase:")
    lines.push("")
    for (const w of warnings) {
      lines.push(`### Warning on \`${w.file}\``)
      lines.push(`- **Issue**: ${w.message}`)
      if (w.marker) {
        lines.push(`- **Expected Marker**: \`${w.marker}\``)
      }
      if (w.snippet) {
        lines.push("- **Snippet to manually integrate**:")
        lines.push("```tsx")
        lines.push(w.snippet)
        lines.push("```")
      }
      lines.push("")
    }
  } else {
    lines.push("## 2. Status: Clean Deterministic Install")
    lines.push("")
    lines.push("All files and markers were placed into their expected locations without conflicts.")
    lines.push("")
  }

  lines.push("## 3. 🛡️ Celestia Architectural Rules")
  lines.push("When reviewing or modifying the code, ensure these architectural boundaries are strictly maintained:")
  lines.push("1. **Frontend (`apps/web`)**: Pure UI client using Next.js. **Never** import database clients (`@workspace/db`), server-only auth (`betterAuth`), or secret environment variables here.")
  lines.push("2. **Backend API (`apps/api`)**: Hono backend running on port 4000. Handles all database access, business logic, and Better Auth server instance.")
  lines.push("3. **Shared Database (`packages/db`)**: Drizzle ORM schema + client. Shared by `apps/api`.")
  lines.push("4. **Shared UI (`packages/ui`)**: Reusable UI component library (`@celestia-project/ui`).")
  lines.push("")

  lines.push("## 4. 🛠️ Action Items for AI Coding Assistant")
  lines.push("Please perform the following verification and assembly checks:")
  lines.push("1. **Type & Syntax Check**: Check if all newly added files, components, and route handlers compile cleanly and have correct import paths.")
  lines.push("2. **Review Warnings & Integration Points**: If there are any unplaced snippets above, wire them into the appropriate components or routes according to the current codebase layout.")
  lines.push("3. **Sidebar Navigation & Routes**: Ensure the new feature's pages are accessible and appropriately linked in the UI and router.")
  lines.push("4. **Database Schemas**: If new tables were introduced, verify that `@workspace/db` exports them correctly.")
  lines.push("5. **Summary**: Provide a quick summary of the feature status and confirm whether any manual adjustments were needed.")
  lines.push("")

  return lines.join("\n")
}

export function saveVerificationPrompt(
  root: string,
  featureName: string,
  promptContent: string,
): string {
  const promptsDir = join(root, ".prompts")
  if (!existsSync(promptsDir)) {
    mkdirSync(promptsDir, { recursive: true })
  }
  const promptPath = join(promptsDir, `verify-${featureName}.md`)
  writeFileSync(promptPath, `${promptContent}\n`, "utf-8")
  return promptPath
}
