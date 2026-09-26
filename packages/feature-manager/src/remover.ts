import { existsSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"

import { removeBackups, removeEmptyParents, sha256File } from "./fsx.js"
import { removeFromJsonArray, removeFromRegionDetailed } from "./markers.js"
import { discoverFeatures, loadManifest, type NormalizedManifest } from "./manifest.js"
import { repoContext, repoPath } from "./paths.js"
import { currentOwner, previousOwner, readTracker, writeTracker } from "./state.js"
import { FileTransaction } from "./txn.js"
import type { WarningReport } from "./types.js"
import type { PlanResult } from "./installer.js"

export interface RemoveOptions {
  root: string
  name: string
  /** Delete files even when they were modified after install. */
  force?: boolean
  strict?: boolean
}

export interface FileRemovalPlan {
  to: string
  absPath: string
  action: "delete" | "restore-owner" | "restore-backup" | "keep" | "absent"
  /** For `restore-owner`: the feature whose template is re-copied. */
  restoreFrom?: string
  backupRel?: string
  note?: string
}

export interface InsertionRemovalPlan {
  file: string
  marker: string
  absFile: string
  action: "removed" | "absent" | "skip"
  note?: string
}

export interface JsonRemovalPlan {
  file: string
  path: string
  value: string
  absFile: string
  action: "removed" | "absent" | "skip"
  note?: string
}

export interface DepRemovalPlan {
  target: string
  field: "dependencies" | "devDependencies"
  pkgFile: string
  /** Dependencies to delete — they did not exist before the install. */
  remove: string[]
  /** Dependencies to restore to an earlier range: name → range. */
  restore: Record<string, string>
  /** Left in place because another installed feature still needs them. */
  keep: { name: string; requiredBy: string }[]
  skip?: string
}

export interface RemovePlan {
  root: string
  feature: string
  featureDir: string
  manifest: NormalizedManifest
  version: string
  files: FileRemovalPlan[]
  insertions: InsertionRemovalPlan[]
  jsonAppends: JsonRemovalPlan[]
  deps: DepRemovalPlan[]
  errors: string[]
  warnings: WarningReport[]
}

export interface RemoveReport {
  feature: string
  version: string
  dryRun: boolean
  deletedFiles: string[]
  restoredFiles: { path: string; from: string }[]
  keptFiles: { path: string; reason: string }[]
  revertedInsertions: { file: string; marker: string }[]
  revertedJsonFiles: { file: string; path: string; value: string }[]
  removedDeps: Record<string, string[]>
  removedDevDeps: Record<string, string[]>
  restoredDeps: { target: string; field: "dependencies" | "devDependencies"; name: string; range: string }[]
  keptDeps: { target: string; name: string; requiredBy: string }[]
  warnings: WarningReport[]
}

/** Find the template file another feature uses to provide `rel`. */
function templateFor(
  featuresDir: string,
  feature: string,
  rel: string,
): { sourceAbs: string; featureDir: string } | undefined {
  const featureDir = join(featuresDir, feature)
  try {
    const { manifest } = loadManifest(featureDir)
    const copy = manifest.copies.find((entry) => entry.to === rel)
    if (!copy) return undefined
    const sourceAbs = join(featureDir, copy.from)
    return existsSync(sourceAbs) ? { sourceAbs, featureDir } : undefined
  } catch {
    return undefined
  }
}

/** Features (other than `except`) that declare `dep` in `target`/`field`. */
function otherConsumers(
  featuresDir: string,
  installed: string[],
  except: string,
  target: string,
  field: "dependencies" | "devDependencies",
  dep: string,
): string | undefined {
  for (const name of installed) {
    if (name === except) continue
    try {
      const { manifest } = loadManifest(join(featuresDir, name))
      if (manifest[field][target]?.[dep] !== undefined) return name
    } catch {
      // unreadable manifest — assume it does not consume the dep
    }
  }
  return undefined
}

export function planRemove(options: RemoveOptions): PlanResult<RemovePlan> {
  const { root, name, force = false, strict = false } = options
  const ctx = repoContext(root)
  const tracker = readTracker(root)
  const record = tracker.features[name]

  if (!record) {
    return {
      ok: false,
      errors: [
        `Feature "${name}" is not installed.`,
        `Installed features: ${Object.keys(tracker.features).join(", ") || "(none)"}`,
      ],
    }
  }

  const discovered = discoverFeatures(ctx.featuresDir)
  const found = discovered.find((feature) => feature.name === name)
  if (!found || !found.manifest) {
    return {
      ok: false,
      errors: [
        `No readable manifest for "${name}" in packages/feature-manager/features/ — cannot determine what to revert.`,
        found?.error ?? "",
      ].filter(Boolean),
    }
  }

  const errors: string[] = []
  const warnings: WarningReport[] = []
  const manifest = found.manifest

  // Refuse while another installed feature depends on this one.
  for (const other of Object.keys(tracker.features)) {
    if (other === name) continue
    try {
      const otherManifest = loadManifest(join(ctx.featuresDir, other)).manifest
      if (otherManifest.requires.includes(name)) {
        errors.push(
          `Cannot remove "${name}": installed feature "${other}" requires it.\n` +
            `  Remove "${other}" first: pnpm remove-feature ${other}`,
        )
      }
    } catch {
      // ignore unreadable manifests here; `verify` reports them
    }
  }
  if (errors.length > 0) return { ok: false, errors }

  // ── Files ──
  const owned = new Set<string>(Object.keys(record.files ?? {}))
  if (owned.size === 0) {
    // Legacy tracker entry without a file record — fall back to the manifest.
    for (const copy of manifest.copies) owned.add(copy.to)
    if (manifest.copies.length > 0) {
      warnings.push({
        type: "other",
        file: "features.json",
        message:
          `"${name}" was installed by an older feature-manager and has no file record. ` +
          `Falling back to the manifest; modified-file detection is unavailable.`,
      })
    }
  }

  const files: FileRemovalPlan[] = []
  for (const to of [...owned].sort()) {
    const absPath = repoPath(root, to, `copied path "${to}"`)
    const base: FileRemovalPlan = { to, absPath, action: "absent" }

    if (!existsSync(absPath)) {
      files.push({ ...base, note: "already missing" })
      continue
    }

    const owner = currentOwner(tracker, to)
    if (owner && owner !== name) {
      files.push({ ...base, action: "keep", note: `currently provided by "${owner}"` })
      continue
    }

    const expected = record.files?.[to]
    const actual = sha256File(absPath)
    const modified = Boolean(expected && actual && actual !== expected)

    const prev = previousOwner(tracker, to, name)
    const backupRel = record.backups?.[to]
    const backupAbs = backupRel ? join(root, backupRel) : undefined

    // Decide what should happen to the file, then apply the "user edited it"
    // guard uniformly — every action except `keep` discards the current content.
    const prevTemplate = prev ? templateFor(ctx.featuresDir, prev, to) : undefined
    if (prev && !prevTemplate) {
      warnings.push({
        type: "other",
        file: to,
        message: `Could not restore "${prev}"'s version of ${to} (template missing); falling back.`,
      })
    }

    let action: FileRemovalPlan["action"] = "delete"
    let restoreFrom: string | undefined
    let note: string | undefined

    if (prev && prevTemplate) {
      action = "restore-owner"
      restoreFrom = prev
      note = `restores "${prev}"'s version`
    } else if (backupAbs && existsSync(backupAbs)) {
      action = "restore-backup"
      note = "restores the pre-install file"
    }

    if (modified && !force) {
      files.push({
        ...base,
        action: "keep",
        note:
          action === "delete"
            ? "modified since install (use --force to delete)"
            : `modified since install; would be replaced (use --force)`,
      })
      warnings.push({
        type: "user_modified",
        file: to,
        message: `${to} was modified after install — keeping it. Re-run with --force to replace it anyway.`,
      })
      continue
    }

    files.push({
      ...base,
      action,
      ...(restoreFrom ? { restoreFrom } : {}),
      ...(action === "restore-backup" && backupRel ? { backupRel } : {}),
      ...(note ? { note } : {}),
    })
  }

  // ── Insertions ──
  const insertions: InsertionRemovalPlan[] = manifest.insertions.map((insertion) => {
    const absFile = repoPath(root, insertion.file, `insertions[].file "${insertion.file}"`)
    if (!existsSync(absFile)) {
      return { file: insertion.file, marker: insertion.marker, absFile, action: "skip" as const, note: "target missing" }
    }
    const result = removeFromRegionDetailed(
      readFileSync(absFile, "utf-8"),
      insertion.marker,
      name,
      insertion.file,
    )
    return {
      file: insertion.file,
      marker: insertion.marker,
      absFile,
      action: result.changed ? ("removed" as const) : ("absent" as const),
    }
  })

  // ── JSON appends ──
  const jsonAppends: JsonRemovalPlan[] = manifest.jsonAppends.map((entry) => {
    const absFile = repoPath(root, entry.file, `jsonAppends[].file "${entry.file}"`)
    if (!existsSync(absFile)) {
      return {
        file: entry.file,
        path: entry.path,
        value: entry.value,
        absFile,
        action: "skip" as const,
        note: "target missing",
      }
    }
    try {
      const data = JSON.parse(readFileSync(absFile, "utf-8")) as unknown
      const changed = removeFromJsonArray(structuredClone(data), entry.path, entry.value)
      return {
        file: entry.file,
        path: entry.path,
        value: entry.value,
        absFile,
        action: changed ? ("removed" as const) : ("absent" as const),
      }
    } catch (err) {
      return {
        file: entry.file,
        path: entry.path,
        value: entry.value,
        absFile,
        action: "skip" as const,
        note: err instanceof Error ? err.message : String(err),
      }
    }
  })

  // ── Dependencies ──
  const installedNames = Object.keys(tracker.features).filter((other) => other !== name)
  const deps: DepRemovalPlan[] = []

  if (record.dependencies && record.dependencies.length > 0) {
    // Precise mode: undo exactly what this install changed.
    const groups = new Map<string, { target: string; field: "dependencies" | "devDependencies" }>()
    for (const entry of record.dependencies) {
      groups.set(`${entry.target}\u0000${entry.field}`, { target: entry.target, field: entry.field })
    }
    for (const { target, field } of groups.values()) {
      const pkgFile = repoPath(root, join(target, "package.json"), `${field} target "${target}"`)
      const plan: DepRemovalPlan = { target, field, pkgFile, remove: [], restore: {}, keep: [] }
      if (!existsSync(pkgFile)) {
        plan.skip = `${target}/package.json not found`
        deps.push(plan)
        continue
      }
      for (const entry of record.dependencies) {
        if (entry.target !== target || entry.field !== field) continue
        if (entry.added) {
          const consumer = otherConsumers(ctx.featuresDir, installedNames, name, target, field, entry.name)
          if (consumer) plan.keep.push({ name: entry.name, requiredBy: consumer })
          else plan.remove.push(entry.name)
        } else if (entry.previous) {
          plan.restore[entry.name] = entry.previous
        }
      }
      deps.push(plan)
    }
  } else if (Object.keys(manifest.dependencies).length || Object.keys(manifest.devDependencies).length) {
    // Legacy record: best effort from the manifest.
    warnings.push({
      type: "other",
      file: "features.json",
      message:
        `"${name}" has no dependency record. Falling back to the manifest, which may remove ` +
        `packages that pre-existed the install.`,
    })
    for (const [field, groups] of [
      ["dependencies", manifest.dependencies],
      ["devDependencies", manifest.devDependencies],
    ] as const) {
      for (const [target, group] of Object.entries(groups)) {
        const pkgFile = repoPath(root, join(target, "package.json"), `${field} target "${target}"`)
        const plan: DepRemovalPlan = { target, field, pkgFile, remove: [], restore: {}, keep: [] }
        if (!existsSync(pkgFile)) {
          plan.skip = `${target}/package.json not found`
          deps.push(plan)
          continue
        }
        for (const dep of Object.keys(group)) {
          const consumer = otherConsumers(ctx.featuresDir, installedNames, name, target, field, dep)
          if (consumer) plan.keep.push({ name: dep, requiredBy: consumer })
          else plan.remove.push(dep)
        }
        deps.push(plan)
      }
    }
  }

  if (strict && warnings.length > 0) {
    return { ok: false, errors: warnings.map((w) => `${w.message} [${w.file}]`) }
  }

  return {
    ok: true,
    plan: {
      root,
      feature: name,
      featureDir: found.dir,
      manifest,
      version: record.version,
      files,
      insertions,
      jsonAppends,
      deps,
      errors: [],
      warnings,
    },
  }
}

export function executeRemove(plan: RemovePlan, options: { dryRun?: boolean } = {}): RemoveReport {
  const dryRun = options.dryRun ?? false
  const { root } = plan
  const ctx = repoContext(root)
  const tracker = readTracker(root)

  const report: RemoveReport = {
    feature: plan.feature,
    version: plan.version,
    dryRun,
    deletedFiles: [],
    restoredFiles: [],
    keptFiles: [],
    revertedInsertions: [],
    revertedJsonFiles: [],
    removedDeps: {},
    removedDevDeps: {},
    restoredDeps: [],
    keptDeps: plan.deps.flatMap((dep) =>
      dep.keep.map((entry) => ({ target: dep.target, name: entry.name, requiredBy: entry.requiredBy })),
    ),
    warnings: [...plan.warnings],
  }

  for (const file of plan.files) {
    if (file.action === "delete") report.deletedFiles.push(file.to)
    else if (file.action === "restore-owner" && file.restoreFrom) {
      report.restoredFiles.push({ path: file.to, from: `feature:${file.restoreFrom}` })
    } else if (file.action === "restore-backup") {
      report.restoredFiles.push({ path: file.to, from: "backup" })
    } else if (file.action === "keep") {
      report.keptFiles.push({ path: file.to, reason: file.note ?? "kept" })
    }
  }
  for (const insertion of plan.insertions) {
    if (insertion.action === "removed") {
      report.revertedInsertions.push({ file: insertion.file, marker: insertion.marker })
    }
  }
  for (const json of plan.jsonAppends) {
    if (json.action === "removed") {
      report.revertedJsonFiles.push({ file: json.file, path: json.path, value: json.value })
    }
  }
  for (const dep of plan.deps) {
    if (dep.remove.length) {
      if (dep.field === "dependencies") report.removedDeps[dep.target] = dep.remove
      else report.removedDevDeps[dep.target] = dep.remove
    }
    for (const [depName, range] of Object.entries(dep.restore)) {
      report.restoredDeps.push({ target: dep.target, field: dep.field, name: depName, range })
    }
  }

  if (dryRun) return report

  const txn = new FileTransaction(root)
  for (const file of plan.files) {
    if (file.action !== "absent" && file.action !== "keep") txn.track(file.absPath)
  }
  for (const insertion of plan.insertions) {
    if (insertion.action === "removed") txn.track(insertion.absFile)
  }
  for (const json of plan.jsonAppends) {
    if (json.action === "removed") txn.track(json.absFile)
  }
  for (const dep of plan.deps) {
    if (!dep.remove.length && Object.keys(dep.restore).length === 0) continue
    txn.track(dep.pkgFile)
  }
  txn.track(ctx.trackerFile)

  try {
    for (const file of plan.files) {
      if (file.action === "delete") {
        rmSync(file.absPath, { force: true })
        removeEmptyParents(file.absPath, root)
      } else if (file.action === "restore-owner" && file.restoreFrom) {
        const template = templateFor(ctx.featuresDir, file.restoreFrom, file.to)
        if (template) {
          txn.writeFile(file.absPath, readFileSync(template.sourceAbs))
        } else {
          report.warnings.push({
            type: "other",
            file: file.to,
            message: `Could not restore "${file.restoreFrom}"'s version of ${file.to} during execution.`,
          })
        }
      } else if (file.action === "restore-backup" && file.backupRel) {
        const backupAbs = join(root, file.backupRel)
        if (existsSync(backupAbs)) {
          txn.writeFile(file.absPath, readFileSync(backupAbs))
        } else {
          rmSync(file.absPath, { force: true })
          removeEmptyParents(file.absPath, root)
        }
      }
    }

    for (const insertion of plan.insertions) {
      if (insertion.action !== "removed") continue
      const result = removeFromRegionDetailed(
        readFileSync(insertion.absFile, "utf-8"),
        insertion.marker,
        plan.feature,
        insertion.file,
      )
      if (result.changed) txn.writeFile(insertion.absFile, result.content)
    }

    for (const json of plan.jsonAppends) {
      if (json.action !== "removed") continue
      const data = JSON.parse(readFileSync(json.absFile, "utf-8")) as Record<string, unknown>
      if (removeFromJsonArray(data, json.path, json.value)) {
        txn.writeFile(json.absFile, `${JSON.stringify(data, null, 2)}\n`)
      }
    }

    for (const dep of plan.deps) {
      if (!dep.remove.length && Object.keys(dep.restore).length === 0) continue
      const pkg = JSON.parse(readFileSync(dep.pkgFile, "utf-8")) as Record<string, unknown>
      const group = pkg[dep.field] as Record<string, string> | undefined
      if (group) {
        for (const name of dep.remove) delete group[name]
        for (const [name, range] of Object.entries(dep.restore)) group[name] = range
        txn.writeFile(dep.pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)
      }
    }

    delete tracker.features[plan.feature]
    writeTracker(root, tracker)
  } catch (err) {
    const restored = txn.rollback()
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Removal of "${plan.feature}" failed and was rolled back (${restored.length} path(s) restored).\n` +
        `  Cause: ${message}`,
    )
  }

  removeBackups(root, plan.feature)
  return report
}

export function removeFeature(
  options: RemoveOptions & { dryRun?: boolean },
): PlanResult<RemoveReport> {
  const planned = planRemove(options)
  if (!planned.ok) return planned
  if (planned.plan.errors.length > 0) return { ok: false, errors: planned.plan.errors }
  return { ok: true, plan: executeRemove(planned.plan, { dryRun: options.dryRun }) }
}
