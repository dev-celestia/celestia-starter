import { verify, type VerifyIssue, type VerifyReport } from "../verifier.js"
import { flag, type CliContext } from "./context.js"

const SEVERITY_ORDER: Record<VerifyIssue["severity"], number> = { error: 0, warning: 1, info: 2 }

function paintIssue(ui: CliContext["ui"], issue: VerifyIssue): string {
  const icon = issue.severity === "error" ? ui.paint("red", "✗") : issue.severity === "warning" ? ui.paint("yellow", "⚠") : ui.paint("gray", "·")
  return `${icon} ${issue.message}${issue.hint ? `\n      ${ui.paint("gray", issue.hint)}` : ""}`
}

export function printVerifyReport(ctx: CliContext, report: VerifyReport): void {
  const { ui } = ctx

  if (report.features.length === 0) {
    ui.out("\nNo features are installed.")
  }

  for (const feature of report.features) {
    const version = feature.installedVersion ? `v${feature.installedVersion}` : ""
    const drift =
      feature.upgradeAvailable && feature.manifestVersion
        ? ` ${ui.paint("yellow", `→ v${feature.manifestVersion} available`)}`
        : ""
    ui.out(`\n${ui.paint("bold", feature.name)} ${version}${drift}`)

    const issues = [...feature.issues].sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    )
    if (issues.length === 0) {
      ui.out(`  ${ui.paint("green", "✓")} clean`)
      continue
    }
    for (const issue of issues) ui.out(`  ${paintIssue(ui, issue)}`)
  }

  const globals = [...report.globalIssues].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  )
  if (globals.length > 0) {
    ui.out(`\n${ui.paint("bold", "Repository")}`)
    for (const issue of globals) ui.out(`  ${paintIssue(ui, issue)}`)
  }

  const { errors, warnings, infos } = report.counts
  ui.out("")
  ui.result(
    report.ok
      ? `${ui.paint("green", "✓")} Verified — ${errors} error(s), ${warnings} warning(s), ${infos} note(s).`
      : `${ui.paint("red", "✗")} ${errors} error(s), ${warnings} warning(s), ${infos} note(s).`,
  )
  ui.out("")
}

export function verifyCommand(ctx: CliContext, name: string | undefined): number {
  const { ui } = ctx
  const json = flag(ctx, "json")
  const report = verify(ctx.root, name)

  if (json) {
    ui.emitJson({ ...report, ok: report.ok })
    return report.ok ? 0 : 1
  }

  printVerifyReport(ctx, report)
  return report.ok ? 0 : 1
}
