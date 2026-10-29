import { planInstall } from "../installer.js"
import { generateVerificationPrompt, saveVerificationPrompt } from "../prompt.js"
import { flag, type CliContext } from "./context.js"

/**
 * Generate the AI verification prompt for a feature without touching the repo.
 * Works whether or not the feature is currently installed.
 */
export function promptCommand(ctx: CliContext, name: string | undefined): number {
  const { ui } = ctx
  const json = flag(ctx, "json")

  if (!name) {
    ui.error("Usage: feature-manager prompt <name>")
    return 2
  }

  const planned = planInstall({ root: ctx.root, name, force: true })
  if (!planned.ok) {
    if (json) ui.emitJson({ ok: false, feature: name, errors: planned.errors })
    else for (const error of planned.errors) ui.error(error)
    return 1
  }

  const plan = planned.plan
  const promptContent = generateVerificationPrompt({
    manifest: plan.manifest,
    copiedFiles: plan.copies
      .filter((copy) => copy.action === "create" || copy.action === "overwrite")
      .map((copy) => copy.to),
    unchangedFiles: plan.copies.filter((copy) => copy.action === "identical").map((copy) => copy.to),
    appliedInsertions: plan.insertions
      .filter((insertion) => insertion.action !== "skip")
      .map((insertion) => ({
        file: insertion.file,
        marker: insertion.marker,
        snippetFile: insertion.snippetFile,
      })),
    warnings: plan.warnings,
    updatedJsonFiles: plan.jsonAppends
      .filter((entry) => entry.action === "append")
      .map((entry) => ({ file: entry.file, path: entry.path, value: entry.value })),
    addedDeps: Object.fromEntries(
      Object.entries(plan.manifest.dependencies).map(([target, deps]) => [target, Object.keys(deps)]),
    ),
    addedDevDeps: Object.fromEntries(
      Object.entries(plan.manifest.devDependencies).map(([target, deps]) => [target, Object.keys(deps)]),
    ),
    conflicts: plan.deps.flatMap((dep) =>
      dep.conflicts.map((conflict) => ({ target: `${dep.target} (${dep.field})`, ...conflict })),
    ),
    ...(plan.previousVersion ? { previousVersion: plan.previousVersion } : {}),
  })

  const promptPath = saveVerificationPrompt(ctx.root, name, promptContent)

  if (json) {
    ui.emitJson({ ok: true, feature: name, path: `.prompts/verify-${name}.md`, warnings: plan.warnings })
    return 0
  }

  ui.out(`\n✨ Generated AI verification prompt for "${name}":`)
  ui.out(`   📄 .prompts/verify-${name}.md`)
  ui.out("\n💡 Copy that file into your AI coding tool (Cursor, Claude Code, Copilot, …)")
  ui.out("   to verify or adapt this feature to any custom changes in your repo.\n")
  return 0
}
