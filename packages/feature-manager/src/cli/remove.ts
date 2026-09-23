import { executeRemove, planRemove, type RemovePlan } from "../remover.js"
import { flag, type CliContext } from "./context.js"

function describeRemovePlan(plan: RemovePlan): string[] {
  const lines: string[] = []
  for (const file of plan.files) {
    lines.push(`${file.action.padEnd(15)} ${file.to}${file.note ? `  (${file.note})` : ""}`)
  }
  for (const insertion of plan.insertions) {
    lines.push(`${insertion.action.padEnd(15)} ${insertion.file} [${insertion.marker}]`)
  }
  for (const json of plan.jsonAppends) {
    lines.push(`${json.action.padEnd(15)} ${json.file} [-${json.path}: ${json.value}]`)
  }
  for (const dep of plan.deps) {
    if (dep.skip) lines.push(`skip            ${dep.target} (${dep.skip})`)
    if (dep.remove.length) lines.push(`deps            ${dep.target}: -${dep.remove.join(", -")}`)
    for (const [name, range] of Object.entries(dep.restore)) {
      lines.push(`restore-dep     ${dep.target}: ${name} → ${range}`)
    }
    for (const keep of dep.keep) {
      lines.push(`keep-dep        ${dep.target}: ${keep.name} (still used by "${keep.requiredBy}")`)
    }
  }
  return lines
}

export function removeCommand(ctx: CliContext, name: string | undefined): number {
  const { ui } = ctx
  const json = flag(ctx, "json")
  const dryRun = flag(ctx, "dry-run")

  if (!name) {
    ui.error("Usage: feature-manager remove <name>")
    return 2
  }

  const planned = planRemove({
    root: ctx.root,
    name,
    force: flag(ctx, "force"),
    strict: flag(ctx, "strict"),
  })

  if (!planned.ok) {
    if (json) ui.emitJson({ ok: false, feature: name, errors: planned.errors })
    else for (const error of planned.errors) ui.error(error)
    return 1
  }

  const plan = planned.plan

  if (dryRun) {
    ui.heading(`Dry run — removing ${plan.feature} (v${plan.version})`)
    ui.out("")
    for (const line of describeRemovePlan(plan)) ui.out(`  ${line}`)
    for (const warning of plan.warnings) ui.warn(`${warning.file}: ${warning.message}`)
    ui.out("")
    ui.result(`Would delete ${plan.files.filter((f) => f.action === "delete").length} file(s) and restore ${plan.files.filter((f) => f.action.startsWith("restore")).length}. No files were written.`)
    if (json) {
      ui.emitJson({
        ok: true,
        dryRun: true,
        feature: plan.feature,
        version: plan.version,
        actions: describeRemovePlan(plan),
        warnings: plan.warnings,
      })
    }
    return 0
  }

  ui.out(`\n${ui.paint("bold", "🗑  Removing feature")}: ${plan.feature} (v${plan.version})\n`)

  let report
  try {
    report = executeRemove(plan)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (json) ui.emitJson({ ok: false, feature: plan.feature, errors: [message] })
    else ui.error(message)
    return 1
  }

  if (report.deletedFiles.length) {
    ui.out("  Deleted:")
    for (const file of report.deletedFiles) ui.detail(`- ${file}`)
  }
  if (report.restoredFiles.length) {
    ui.out("  Restored:")
    for (const file of report.restoredFiles) ui.detail(`↺ ${file.path} (${file.from})`)
  }
  if (report.keptFiles.length) {
    ui.out("  Kept:")
    for (const file of report.keptFiles) ui.detail(`= ${file.path} (${file.reason})`)
  }
  if (report.revertedInsertions.length) {
    ui.out("  Markers:")
    for (const insertion of report.revertedInsertions) {
      ui.detail(`- ${insertion.file} [${insertion.marker}]`)
    }
  }
  if (report.revertedJsonFiles.length) {
    ui.out("  JSON:")
    for (const entry of report.revertedJsonFiles) ui.detail(`- ${entry.file} [${entry.path}: ${entry.value}]`)
  }
  for (const [target, names] of Object.entries(report.removedDeps)) {
    ui.out(`  ${target} dependencies:`)
    for (const dep of names) ui.detail(`- ${dep}`)
  }
  for (const [target, names] of Object.entries(report.removedDevDeps)) {
    ui.out(`  ${target} devDependencies:`)
    for (const dep of names) ui.detail(`- ${dep}`)
  }
  if (report.restoredDeps.length) {
    ui.out("  Restored dependency ranges:")
    for (const dep of report.restoredDeps) {
      ui.detail(`↺ ${dep.name} in ${dep.target} → ${dep.range}`)
    }
  }
  for (const kept of report.keptDeps) {
    ui.out(`  Kept dependency ${kept.name} in ${kept.target} (still used by "${kept.requiredBy}")`)
  }
  for (const warning of report.warnings) ui.warn(`${warning.file}: ${warning.message}`)

  if (json) {
    ui.emitJson({ ...report, ok: true })
    return 0
  }

  ui.result(`\n✅ Feature "${plan.feature}" removed.\n`)
  ui.out("  Next steps:")
  ui.out("    1. Run: pnpm install")
  if (plan.manifest.postInstall.length) {
    ui.out("    2. Revert any data/schema changes if they are no longer needed:")
    for (const command of plan.manifest.postInstall) ui.out(`       ${command}`)
  }
  ui.out("")
  return 0
}
