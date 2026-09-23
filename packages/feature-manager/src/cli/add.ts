import { executeInstall, planInstall, describePlan } from "../installer.js"
import { discoverFeatures } from "../manifest.js"
import { repoContext } from "../paths.js"
import { generateVerificationPrompt, saveVerificationPrompt } from "../prompt.js"
import { readTracker } from "../state.js"
import { flag, type CliContext } from "./context.js"

function printAvailable(ctx: CliContext): void {
  const ctxRepo = repoContext(ctx.root)
  const features = discoverFeatures(ctxRepo.featuresDir)
  if (features.length === 0) {
    ctx.ui.out("No features available.")
    return
  }
  let tracker
  try {
    tracker = readTracker(ctx.root)
  } catch {
    tracker = { features: {} }
  }
  ctx.ui.out("\nAvailable features:")
  for (const feature of features) {
    if (feature.error) {
      ctx.ui.out(`  - ${feature.name}: (unreadable manifest — ${feature.error})`)
      continue
    }
    const installed = tracker.features[feature.name]
    const status = installed ? ` ✓ installed v${installed.version}` : ""
    ctx.ui.out(`  - ${feature.name}: ${feature.manifest?.description ?? ""}${status}`)
  }
}

export function addCommand(ctx: CliContext, name: string | undefined): number {
  const { ui } = ctx
  const json = flag(ctx, "json")
  const dryRun = flag(ctx, "dry-run")

  if (!name) {
    ui.error("Usage: feature-manager add <name>")
    printAvailable(ctx)
    return 2
  }

  const planned = planInstall({
    root: ctx.root,
    name,
    force: flag(ctx, "force"),
    strict: flag(ctx, "strict"),
  })

  if (!planned.ok) {
    if (json) ui.emitJson({ ok: false, feature: name, errors: planned.errors })
    else {
      for (const error of planned.errors) ui.error(error)
      if (planned.errors.some((e) => e.includes("not found in features/"))) printAvailable(ctx)
    }
    return 1
  }

  const plan = planned.plan

  if (dryRun) {
    ui.heading(`Dry run — ${plan.feature} (v${plan.manifest.version})`)
    ui.out(`   ${plan.manifest.description}`)
    ui.out("")
    for (const line of describePlan(plan)) ui.out(`  ${line}`)
    for (const warning of plan.warnings) ui.warn(`${warning.file}: ${warning.message}`)
    ui.out("")
    ui.result(`Would copy ${plan.copies.filter((c) => c.action === "create" || c.action === "overwrite").length} file(s), update ${plan.insertions.filter((i) => i.action !== "skip" && i.action !== "unchanged").length} marker region(s). No files were written.`)
    if (json) {
      ui.emitJson({
        ok: true,
        dryRun: true,
        feature: plan.feature,
        version: plan.manifest.version,
        upgrade: plan.upgrade,
        previousVersion: plan.previousVersion ?? null,
        actions: describePlan(plan),
        warnings: plan.warnings,
      })
    }
    return 0
  }

  if (plan.upgrade) {
    ui.out(
      `\n${ui.paint("bold", "⚡ Reinstalling feature")}: ${plan.feature} ` +
        `(v${plan.previousVersion} → v${plan.manifest.version})`,
    )
  } else {
    ui.out(`\n${ui.paint("bold", "⚡ Installing feature")}: ${plan.feature} (v${plan.manifest.version})`)
  }
  ui.out(`   ${plan.manifest.description}\n`)

  let report
  try {
    report = executeInstall(plan)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (json) ui.emitJson({ ok: false, feature: plan.feature, errors: [message] })
    else ui.error(message)
    return 1
  }

  // ── Human-readable summary ──
  const created = plan.copies.filter((c) => c.action === "create")
  const overwritten = plan.copies.filter((c) => c.action === "overwrite")
  if (created.length || overwritten.length) {
    ui.out("  Files:")
    for (const copy of created) ui.detail(`+ ${copy.to}`)
    for (const copy of overwritten) {
      ui.detail(`~ ${copy.to}${copy.previousOwner ? ` (was provided by "${copy.previousOwner}")` : ""}`)
    }
  }
  if (report.unchangedFiles.length) {
    ui.out(`  Already up to date: ${report.unchangedFiles.length} file(s)`)
  }
  if (plan.insertions.some((i) => i.action !== "skip" && i.action !== "unchanged")) {
    ui.out("  Markers:")
    for (const insertion of plan.insertions) {
      if (insertion.action === "skip" || insertion.action === "unchanged") continue
      ui.detail(`~ ${insertion.file} [${insertion.marker}] (${insertion.action})`)
    }
  }
  if (report.updatedJsonFiles.length) {
    ui.out("  JSON:")
    for (const entry of report.updatedJsonFiles) ui.detail(`~ ${entry.file} [+${entry.path}: ${entry.value}]`)
  }
  for (const [target, names] of Object.entries(report.addedDeps)) {
    ui.out(`  ${target} dependencies:`)
    for (const dep of names) ui.detail(`+ ${dep}`)
  }
  for (const [target, names] of Object.entries(report.addedDevDeps)) {
    ui.out(`  ${target} devDependencies:`)
    for (const dep of names) ui.detail(`+ ${dep}`)
  }

  for (const conflict of report.conflicts) {
    ui.warn(
      `Version conflict: "${conflict.name}" in ${conflict.target} ` +
        `(${conflict.current} → ${conflict.incoming})`,
    )
  }
  for (const warning of report.warnings) {
    ui.warn(`${warning.file}: ${warning.message}`)
  }

  // ── Verification prompt ──
  const promptContent = generateVerificationPrompt({
    manifest: plan.manifest,
    copiedFiles: report.copiedFiles,
    unchangedFiles: report.unchangedFiles,
    appliedInsertions: report.appliedInsertions,
    warnings: report.warnings,
    updatedJsonFiles: report.updatedJsonFiles,
    addedDeps: report.addedDeps,
    addedDevDeps: report.addedDevDeps,
    conflicts: report.conflicts,
    backups: report.backups,
    ...(report.previousVersion ? { previousVersion: report.previousVersion } : {}),
  })
  saveVerificationPrompt(ctx.root, plan.feature, promptContent)

  if (json) {
    ui.emitJson({ ...report, ok: true })
    return 0
  }

  ui.result(`\n✅ Feature "${plan.feature}" installed.\n`)
  ui.out("  Next steps:")

  let step = 1
  ui.out(`    ${step++}. Run: pnpm install`)
  for (const [target, vars] of Object.entries(plan.manifest.env)) {
    if (!vars.length) continue
    ui.out(`    ${step++}. Add env vars to ${target}/.env:`)
    for (const entry of vars) ui.out(`       ${entry}`)
  }
  if (plan.manifest.postInstall.length) {
    ui.out(`    ${step++}. Run post-install commands:`)
    for (const command of plan.manifest.postInstall) ui.out(`       ${command}`)
  }
  if (plan.manifest.notes) ui.out(`\n  📝 ${plan.manifest.notes}`)

  ui.out("\n────────────────────────────────────────────────────────────────────────")
  ui.out("🤖 (Optional) AI verification prompt:")
  ui.out(`   Saved to: .prompts/verify-${plan.feature}.md`)
  ui.out("   Paste it into your AI assistant to sanity-check this install against")
  ui.out("   any customisations you have made.")
  ui.out("────────────────────────────────────────────────────────────────────────\n")

  return 0
}
