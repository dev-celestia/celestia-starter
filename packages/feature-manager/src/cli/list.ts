import { discoverFeatures } from "../manifest.js"
import { repoContext } from "../paths.js"
import { readTracker } from "../state.js"
import { flag, type CliContext } from "./context.js"

export function listCommand(ctx: CliContext): number {
  const { ui } = ctx
  const json = flag(ctx, "json")
  const repo = repoContext(ctx.root)
  const features = discoverFeatures(repo.featuresDir)
  const tracker = readTracker(ctx.root)

  if (features.length === 0) {
    if (json) ui.emitJson({ ok: true, features: [] })
    else ui.out("No features available.")
    return 0
  }

  const rows = features.map((feature) => {
    const installed = tracker.features[feature.name]
    const installedVersion = installed?.version
    const availableVersion = feature.manifest?.version
    const upgrade = Boolean(installed && availableVersion && availableVersion !== installedVersion)
    return {
      name: feature.name,
      status: feature.error ? "broken" : installed ? "installed" : "available",
      installedVersion: installedVersion ?? null,
      availableVersion: availableVersion ?? null,
      upgrade,
      requires: feature.manifest?.requires ?? [],
      description: feature.manifest?.description ?? "",
      error: feature.error ?? null,
    }
  })

  if (json) {
    ui.emitJson({ ok: true, features: rows })
    return rows.some((row) => row.status === "broken") ? 1 : 0
  }

  const nameWidth = Math.max(7, ...rows.map((row) => row.name.length))
  const statusWidth = 9

  ui.out("")
  ui.out(
    `  ${"Feature".padEnd(nameWidth)}  ${"Status".padEnd(statusWidth)}  ${"Installed".padEnd(9)}  ${"Available".padEnd(11)}  Requires`,
  )
  ui.out(`  ${"─".repeat(nameWidth + statusWidth + 40)}`)

  for (const row of rows) {
    const label =
      row.status === "installed" ? "installed" : row.status === "broken" ? "broken" : "available"
    const color = row.status === "installed" ? "green" : row.status === "broken" ? "red" : "gray"
    const statusCell =
      ui.paint(color, label) + " ".repeat(Math.max(0, statusWidth - label.length))

    const availableLabel = row.availableVersion ?? "-"
    const availableText = row.upgrade ? `${availableLabel} ↑` : availableLabel
    const availableCell = row.upgrade
      ? ui.paint("yellow", availableText.padEnd(11))
      : availableText.padEnd(11)

    ui.out(
      `  ${row.name.padEnd(nameWidth)}  ${statusCell}  ` +
        `${(row.installedVersion ?? "-").padEnd(9)}  ${availableCell}  ${row.requires.join(", ") || "-"}`,
    )
  }

  const upgradable = rows.filter((row) => row.upgrade)
  if (upgradable.length > 0) {
    ui.out("")
    ui.out(`  ${ui.paint("yellow", "↑")} upgrade available — run: pnpm add-feature <name> --force`)
  }
  const broken = rows.filter((row) => row.status === "broken")
  if (broken.length > 0) {
    ui.out("")
    for (const row of broken) ui.error(`${row.name}: ${row.error}`)
  }
  ui.out("")

  return broken.length > 0 ? 1 : 0
}
