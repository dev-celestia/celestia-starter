import { cpSync, existsSync, readFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"

import { backupPathFor, backupRelativePath, ensureDir, readJson, sha256File, stringifyJson } from "./fsx.js"
import { appendToJsonArray, insertIntoRegionDetailed } from "./markers.js"
import {
  availableFeatureNames,
  discoverFeatures,
  validateManifest,
  type NormalizedManifest,
} from "./manifest.js"
import { featurePath, repoContext, repoPath } from "./paths.js"
import { allocateSeq, currentOwner, readTracker, writeTracker } from "./state.js"
import { FileTransaction } from "./txn.js"
import type { InsertionReport, WarningReport } from "./types.js"

export interface InstallOptions {
  root: string
  name: string
  /** Reinstall/upgrade an already-installed feature. */
  force?: boolean
  /** Escalate every warning into a blocking error. */
  strict?: boolean
}

export interface CopyPlan {
  from: string
  to: string
  sourceAbs: string
  destAbs: string
  action: "create" | "overwrite" | "identical" | "skip"
  /** Installed feature that currently provides this path, if any. */
  previousOwner?: string
  /** Repo-relative backup path holding the content being overwritten. */
  backupRel?: string
  hash?: string
  isDirectory: boolean
  note?: string
}

export interface InsertionPlan {
  file: string
  marker: string
  snippetFile: string
  snippet: string
  absFile: string
  action: "inserted" | "replaced" | "repaired" | "unchanged" | "skip"
  note?: string
}

export interface JsonPlan {
  file: string
  path: string
  value: string
  absFile: string
  action: "append" | "present" | "skip"
  note?: string
}

export interface DepPlan {
  target: string
  field: "dependencies" | "devDependencies"
  pkgFile: string
  /** Dependencies that need writing: name → range. */
  additions: Record<string, string>
  /** Names that did not exist in the package before this install. */
  created: string[]
  /** Names whose range changes: name → the range that was there before. */
  changed: Record<string, string>
  conflicts: { name: string; current: string; incoming: string }[]
  skip?: string
}

export interface InstallPlan {
  root: string
  feature: string
  featureDir: string
  manifest: NormalizedManifest
  previousVersion?: string
  upgrade: boolean
  copies: CopyPlan[]
  insertions: InsertionPlan[]
  jsonAppends: JsonPlan[]
  deps: DepPlan[]
  errors: string[]
  warnings: WarningReport[]
}

export interface InstallReport {
  feature: string
  version: string
  previousVersion?: string
  dryRun: boolean
  copiedFiles: string[]
  unchangedFiles: string[]
  appliedInsertions: InsertionReport[]
  updatedJsonFiles: { file: string; path: string; value: string }[]
  addedDeps: Record<string, string[]>
  addedDevDeps: Record<string, string[]>
  skipped: { file: string; reason: string }[]
  conflicts: { target: string; name: string; current: string; incoming: string }[]
  backups: { path: string; backup: string }[]
  warnings: WarningReport[]
}

export type PlanResult<T> = { ok: true; plan: T } | { ok: false; errors: string[] }

/**
 * Work out everything an install would do, without touching the filesystem.
 * The same plan drives `--dry-run` output and the real execution, so what you
 * preview is exactly what gets applied.
 */
export function planInstall(options: InstallOptions): PlanResult<InstallPlan> {
  const { root, name, force = false, strict = false } = options
  const ctx = repoContext(root)
  const tracker = readTracker(root)
  const discovered = discoverFeatures(ctx.featuresDir)
  const found = discovered.find((feature) => feature.name === name)

  if (!found) {
    const available = discovered.map((f) => f.name)
    return {
      ok: false,
      errors: [
        `Feature "${name}" not found in features/.`,
        available.length ? `Available features: ${available.join(", ")}` : "No features are available.",
      ],
    }
  }

  if (found.error || !found.raw || !found.manifest) {
    return {
      ok: false,
      errors: [`Cannot read features/${name}/feature.json: ${found.error ?? "unknown error"}`],
    }
  }

  const manifest = found.manifest
  const featureDir = found.dir
  const existing = tracker.features[name]

  if (existing && !force) {
    return {
      ok: false,
      errors: [
        `Feature "${name}" is already installed (v${existing.version}).`,
        `Reinstall or upgrade it with: pnpm add-feature ${name} --force`,
      ],
    }
  }

  const errors: string[] = []
  for (const required of manifest.requires) {
    if (!tracker.features[required]) {
      errors.push(
        `Feature "${name}" requires "${required}", which is not installed.\n  Run: pnpm add-feature ${required}`,
      )
    }
  }

  const validation = validateManifest(found.raw, manifest, {
    root,
    featureDir,
    available: availableFeatureNames(ctx.featuresDir),
    installed: new Set(Object.keys(tracker.features)),
  })
  errors.push(...validation.errors)

  // Structural problems (path escapes, malformed fields, missing prerequisites)
  // make planning unsafe — bail out before resolving any more paths.
  if (errors.length > 0) return { ok: false, errors }

  const warnings: WarningReport[] = validation.warnings.map((message) => ({
    type: "other" as const,
    file: `features/${name}/feature.json`,
    message,
  }))

  const copies = manifest.copies.map((copy) =>
    planCopy(root, featureDir, name, tracker, copy, warnings),
  )
  const insertions = manifest.insertions.map((insertion) =>
    planInsertion(root, featureDir, name, insertion, warnings),
  )
  const jsonAppends = manifest.jsonAppends.map((entry) => planJsonAppend(root, entry, warnings))

  const deps: DepPlan[] = []
  for (const [target, group] of Object.entries(manifest.dependencies)) {
    deps.push(planDeps(root, target, "dependencies", group, warnings))
  }
  for (const [target, group] of Object.entries(manifest.devDependencies)) {
    deps.push(planDeps(root, target, "devDependencies", group, warnings))
  }

  if (strict && warnings.length > 0) {
    return { ok: false, errors: warnings.map((w) => `${w.message} [${w.file}]`) }
  }

  return {
    ok: true,
    plan: {
      root,
      feature: name,
      featureDir,
      manifest,
      ...(existing ? { previousVersion: existing.version } : {}),
      upgrade: Boolean(existing),
      copies,
      insertions,
      jsonAppends,
      deps,
      errors: [],
      warnings,
    },
  }
}

function planCopy(
  root: string,
  featureDir: string,
  feature: string,
  tracker: ReturnType<typeof readTracker>,
  copy: { from: string; to: string },
  warnings: WarningReport[],
): CopyPlan {
  const sourceAbs = featurePath(featureDir, copy.from, `copies[].from "${copy.from}"`)
  const destAbs = repoPath(root, copy.to, `copies[].to "${copy.to}"`)
  const base: CopyPlan = {
    from: copy.from,
    to: copy.to,
    sourceAbs,
    destAbs,
    action: "skip",
    isDirectory: false,
  }

  if (!existsSync(sourceAbs)) {
    warnings.push({
      type: "missing_file",
      file: copy.from,
      message: `Template file not found: ${copy.from}`,
    })
    return { ...base, note: "template file missing" }
  }

  if (statSync(sourceAbs).isDirectory()) {
    return { ...base, isDirectory: true, action: existsSync(destAbs) ? "overwrite" : "create" }
  }

  const hash = sha256File(sourceAbs)
  const owner = currentOwner(tracker, copy.to)
  const owned = owner ? { previousOwner: owner } : {}

  if (!existsSync(destAbs)) {
    return { ...base, action: "create", ...(hash ? { hash } : {}) }
  }

  if (hash && sha256File(destAbs) === hash) {
    return { ...base, action: "identical", ...(hash ? { hash } : {}), ...owned }
  }

  // Overwriting content that came from somewhere else: stash it so removal can
  // restore the previous owner's version instead of deleting a shared file.
  const plan: CopyPlan = {
    ...base,
    action: "overwrite",
    ...(hash ? { hash } : {}),
    ...owned,
  }
  if (owner !== feature) {
    plan.backupRel = backupRelativePath(feature, copy.to)
    if (!existsSync(backupPathFor(root, feature, copy.to))) {
      plan.note = owner
        ? `overwrites a file provided by "${owner}" (backed up)`
        : "overwrites an existing file (backed up)"
    }
    if (!owner) {
      // Nobody installed this file, so it is a starter/user file: replacing it
      // is legitimate but worth surfacing (and gating behind --strict).
      warnings.push({
        type: "overwrite",
        file: copy.to,
        message:
          `${copy.to} already exists and is not owned by an installed feature — ` +
          `it will be overwritten (previous content backed up to ${plan.backupRel}).`,
      })
    }
  }
  return plan
}

function planInsertion(
  root: string,
  featureDir: string,
  feature: string,
  insertion: { file: string; marker: string; snippet: string },
  warnings: WarningReport[],
): InsertionPlan {
  const absFile = repoPath(root, insertion.file, `insertions[].file "${insertion.file}"`)
  const snippetAbs = featurePath(
    featureDir,
    insertion.snippet,
    `insertions[].snippet "${insertion.snippet}"`,
  )
  const base: InsertionPlan = {
    file: insertion.file,
    marker: insertion.marker,
    snippetFile: insertion.snippet,
    snippet: "",
    absFile,
    action: "skip",
  }

  if (!existsSync(absFile)) {
    const message = `Target file not found: ${insertion.file}`
    warnings.push({
      type: "missing_file",
      file: insertion.file,
      marker: insertion.marker,
      message,
      ...(existsSync(snippetAbs) ? { snippet: readFileSync(snippetAbs, "utf-8") } : {}),
    })
    return { ...base, note: message }
  }
  if (!existsSync(snippetAbs)) {
    const message = `Snippet not found: ${insertion.snippet}`
    warnings.push({ type: "missing_file", file: insertion.snippet, marker: insertion.marker, message })
    return { ...base, note: message }
  }

  const snippet = readFileSync(snippetAbs, "utf-8").replace(/\r\n/g, "\n").replace(/\n+$/, "")
  try {
    const result = insertIntoRegionDetailed(
      readFileSync(absFile, "utf-8"),
      insertion.marker,
      feature,
      snippet,
      insertion.file,
    )
    return { ...base, snippet, action: result.action }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    warnings.push({
      type: "missing_marker",
      file: insertion.file,
      marker: insertion.marker,
      message,
      snippet,
    })
    return { ...base, snippet, note: message }
  }
}

function planJsonAppend(
  root: string,
  entry: { file: string; path: string; value: string },
  warnings: WarningReport[],
): JsonPlan {
  const absFile = repoPath(root, entry.file, `jsonAppends[].file "${entry.file}"`)
  const base: JsonPlan = {
    file: entry.file,
    path: entry.path,
    value: entry.value,
    absFile,
    action: "skip",
  }
  if (!existsSync(absFile)) {
    const message = `JSON file not found: ${entry.file}`
    warnings.push({ type: "missing_json", file: entry.file, message })
    return { ...base, note: message }
  }
  try {
    const data = readJson<unknown>(absFile)
    const changed = appendToJsonArray(structuredClone(data), entry.path, entry.value)
    return { ...base, action: changed ? "append" : "present" }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    warnings.push({ type: "missing_json", file: entry.file, message })
    return { ...base, note: message }
  }
}

function planDeps(
  root: string,
  target: string,
  field: "dependencies" | "devDependencies",
  group: Record<string, string>,
  warnings: WarningReport[],
): DepPlan {
  const pkgFile = repoPath(root, join(target, "package.json"), `${field} target "${target}"`)
  const plan: DepPlan = { target, field, pkgFile, additions: {}, created: [], changed: {}, conflicts: [] }

  if (!existsSync(pkgFile)) {
    plan.skip = `${target}/package.json not found`
    warnings.push({
      type: "missing_dependency",
      file: `${target}/package.json`,
      message: `Cannot add ${field}: ${target}/package.json not found`,
    })
    return plan
  }

  const pkg = readJson<Record<string, unknown>>(pkgFile)
  const existing = (pkg[field] as Record<string, string> | undefined) ?? {}

  for (const [dep, range] of Object.entries(group)) {
    const current = existing[dep]
    if (current === undefined) {
      plan.additions[dep] = range
      plan.created.push(dep)
      continue
    }
    if (current === range) continue

    plan.conflicts.push({ name: dep, current, incoming: range })
    plan.changed[dep] = current
    plan.additions[dep] = range
    warnings.push({
      type: "dep_conflict",
      file: `${target}/package.json`,
      message:
        `Version conflict for "${dep}" in ${target}: ` +
        `installed "${current}" will be replaced with "${range}" required by this feature.`,
    })
  }

  return plan
}

/** Human-readable one-line summary of each plan step, used by `--dry-run`. */
export function describePlan(plan: InstallPlan): string[] {
  const lines: string[] = []
  for (const copy of plan.copies) {
    lines.push(`${copy.action.padEnd(9)} ${copy.to}${copy.note ? `  (${copy.note})` : ""}`)
  }
  for (const insertion of plan.insertions) {
    lines.push(
      `${insertion.action.padEnd(9)} ${insertion.file} [${insertion.marker}]${insertion.note ? `  (${insertion.note})` : ""}`,
    )
  }
  for (const json of plan.jsonAppends) {
    lines.push(`${json.action.padEnd(9)} ${json.file} [+${json.path}: ${json.value}]`)
  }
  for (const dep of plan.deps) {
    const names = Object.keys(dep.additions)
    if (dep.skip) lines.push(`skip      ${dep.target} (${dep.skip})`)
    else if (names.length) lines.push(`deps      ${dep.target}: ${names.join(", ")}`)
  }
  return lines
}

/**
 * Apply an install plan. All touched paths are registered with a
 * {@link FileTransaction} first, so any failure rolls the working tree back to
 * its previous state instead of leaving a half-installed repo behind.
 */
export function executeInstall(plan: InstallPlan, options: { dryRun?: boolean } = {}): InstallReport {
  const dryRun = options.dryRun ?? false
  const { root } = plan
  const tracker = readTracker(root)

  const report: InstallReport = {
    feature: plan.feature,
    version: plan.manifest.version,
    ...(plan.previousVersion ? { previousVersion: plan.previousVersion } : {}),
    dryRun,
    copiedFiles: [],
    unchangedFiles: [],
    appliedInsertions: [],
    updatedJsonFiles: [],
    addedDeps: {},
    addedDevDeps: {},
    skipped: [],
    conflicts: plan.deps.flatMap((dep) =>
      dep.conflicts.map((conflict) => ({ target: `${dep.target} (${dep.field})`, ...conflict })),
    ),
    backups: [],
    warnings: [...plan.warnings],
  }

  for (const copy of plan.copies) {
    if (copy.action === "skip") {
      report.skipped.push({ file: copy.to, reason: copy.note ?? "skipped" })
    } else if (copy.action === "identical") {
      report.unchangedFiles.push(copy.to)
    } else {
      report.copiedFiles.push(copy.to)
      if (copy.backupRel) report.backups.push({ path: copy.to, backup: copy.backupRel })
    }
  }
  for (const insertion of plan.insertions) {
    if (insertion.action === "skip") {
      report.skipped.push({ file: insertion.file, reason: insertion.note ?? "skipped" })
    } else if (insertion.action !== "unchanged") {
      report.appliedInsertions.push({
        file: insertion.file,
        marker: insertion.marker,
        snippetFile: insertion.snippetFile,
      })
    }
  }
  for (const json of plan.jsonAppends) {
    if (json.action === "append") {
      report.updatedJsonFiles.push({ file: json.file, path: json.path, value: json.value })
    }
  }
  for (const dep of plan.deps) {
    const names = Object.keys(dep.additions)
    if (!names.length) continue
    if (dep.field === "dependencies") report.addedDeps[dep.target] = names
    else report.addedDevDeps[dep.target] = names
  }

  if (dryRun) return report

  // ── Register everything we are about to touch ──
  const txn = new FileTransaction(root)
  const filesRecord: Record<string, string> = { ...(tracker.features[plan.feature]?.files ?? {}) }
  const backupsRecord: Record<string, string> = {
    ...(tracker.features[plan.feature]?.backups ?? {}),
  }
  const previousRecord = tracker.features[plan.feature]?.dependencies ?? []
  const depRecords = previousRecord.filter(
    (entry) => !plan.deps.some((dep) => dep.target === entry.target && dep.field === entry.field),
  )
  for (const dep of plan.deps) {
    for (const name of dep.created) {
      depRecords.push({ target: dep.target, field: dep.field, name, added: true })
    }
    for (const [name, previous] of Object.entries(dep.changed)) {
      depRecords.push({ target: dep.target, field: dep.field, name, added: false, previous })
    }
  }

  for (const copy of plan.copies) {
    if (copy.action === "skip" || copy.action === "identical") continue
    txn.trackPath(copy.destAbs)
    if (copy.backupRel) txn.track(backupPathFor(root, plan.feature, copy.to))
  }
  for (const insertion of plan.insertions) {
    if (insertion.action === "skip" || insertion.action === "unchanged") continue
    txn.track(insertion.absFile)
  }
  for (const json of plan.jsonAppends) {
    if (json.action !== "append") continue
    txn.track(json.absFile)
  }
  for (const dep of plan.deps) {
    if (Object.keys(dep.additions).length === 0) continue
    txn.track(dep.pkgFile)
  }
  txn.track(repoContext(root).trackerFile)

  try {
    // 1. Copies (+ a backup of anything we overwrite).
    for (const copy of plan.copies) {
      if (copy.action === "skip") continue
      if (copy.action === "identical") {
        if (copy.hash) filesRecord[copy.to] = copy.hash
        continue
      }

      if (copy.backupRel) {
        const backupAbs = backupPathFor(root, plan.feature, copy.to)
        // Never clobber an earlier backup: it holds the content that was there
        // before this feature first touched the path.
        if (!existsSync(backupAbs) && existsSync(copy.destAbs)) {
          txn.writeFile(backupAbs, readFileSync(copy.destAbs))
          backupsRecord[copy.to] = copy.backupRel
        }
      }

      ensureDir(dirname(copy.destAbs))
      cpSync(copy.sourceAbs, copy.destAbs, { recursive: true, force: true })
      if (!copy.isDirectory && copy.hash) filesRecord[copy.to] = copy.hash
    }

    // 2. Insertions.
    for (const insertion of plan.insertions) {
      if (insertion.action === "skip" || insertion.action === "unchanged") continue
      const result = insertIntoRegionDetailed(
        readFileSync(insertion.absFile, "utf-8"),
        insertion.marker,
        plan.feature,
        insertion.snippet,
        insertion.file,
      )
      if (result.changed) txn.writeFile(insertion.absFile, result.content)
    }

    // 3. JSON array appends.
    for (const json of plan.jsonAppends) {
      if (json.action !== "append") continue
      const data = readJson<Record<string, unknown>>(json.absFile)
      if (appendToJsonArray(data, json.path, json.value)) {
        txn.writeFile(json.absFile, stringifyJson(data))
      }
    }

    // 4. Dependencies.
    for (const dep of plan.deps) {
      if (Object.keys(dep.additions).length === 0) continue
      const pkg = readJson<Record<string, unknown>>(dep.pkgFile)
      const existing = (pkg[dep.field] as Record<string, string> | undefined) ?? {}
      pkg[dep.field] = { ...existing, ...dep.additions }
      txn.writeFile(dep.pkgFile, stringifyJson(pkg))
    }

    // 5. Tracker (last, so a crash above leaves the feature unregistered).
    tracker.features[plan.feature] = {
      version: plan.manifest.version,
      installedAt: new Date().toISOString(),
      seq: allocateSeq(tracker),
      files: filesRecord,
      ...(Object.keys(backupsRecord).length ? { backups: backupsRecord } : {}),
      ...(depRecords.length ? { dependencies: depRecords } : {}),
    }
    writeTracker(root, tracker)
  } catch (err) {
    const restored = txn.rollback()
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(
      `Install of "${plan.feature}" failed and was rolled back (${restored.length} path(s) restored).\n` +
        `  Cause: ${message}`,
    )
  }

  return report
}

/** Convenience wrapper used by the CLI and tests. */
export function installFeature(
  options: InstallOptions & { dryRun?: boolean },
): PlanResult<InstallReport> {
  const planned = planInstall(options)
  if (!planned.ok) return planned
  if (planned.plan.errors.length > 0) return { ok: false, errors: planned.plan.errors }
  return { ok: true, plan: executeInstall(planned.plan, { dryRun: options.dryRun }) }
}
