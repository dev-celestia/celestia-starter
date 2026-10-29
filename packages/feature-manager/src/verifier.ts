import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { sha256File } from "./fsx.js"
import { getAtPath } from "./markers.js"
import { discoverFeatures, loadManifest, type NormalizedManifest } from "./manifest.js"
import { repoContext } from "./paths.js"
import { claimers, currentOwner, readTracker } from "./state.js"
import type { FeatureTracker } from "./types.js"

export type IssueCode =
  | "missing_manifest"
  | "unreadable_manifest"
  | "unknown_feature"
  | "version_drift"
  | "missing_prerequisite"
  | "missing_file"
  | "modified_file"
  | "shadowed_file"
  | "missing_marker"
  | "missing_insertion"
  | "missing_json_entry"
  | "missing_dependency"
  | "dependency_version"
  | "missing_env"
  | "shared_target"
  | "duplicate_json_append"
  | "legacy_record"

export interface VerifyIssue {
  code: IssueCode
  severity: "error" | "warning" | "info"
  feature: string
  file?: string
  message: string
  hint?: string
}

export interface FeatureVerification {
  name: string
  installed: boolean
  installedVersion?: string
  manifestVersion?: string
  upgradeAvailable: boolean
  issues: VerifyIssue[]
}

export interface VerifyReport {
  root: string
  features: FeatureVerification[]
  globalIssues: VerifyIssue[]
  counts: { errors: number; warnings: number; infos: number }
  ok: boolean
}

function readEnvKeys(file: string): Set<string> | undefined {
  if (!existsSync(file)) return undefined
  const keys = new Set<string>()
  for (const line of readFileSync(file, "utf-8").split("\n")) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)
    if (match?.[1]) keys.add(match[1])
  }
  return keys
}

function envKeyOf(entry: string): string | undefined {
  return entry.split("=")[0]?.trim() || undefined
}

/**
 * Check that an installed feature still matches what it installed: files
 * present and unmodified, marker blocks still wired up, JSON entries and
 * dependencies still in place. Read-only — never writes.
 */
export function verify(root: string, only?: string): VerifyReport {
  const ctx = repoContext(root)
  const tracker: FeatureTracker = readTracker(root)
  const discovered = discoverFeatures(ctx.featuresDir)
  const byName = new Map(discovered.map((feature) => [feature.name, feature]))
  const installedNames = Object.keys(tracker.features)

  const targets = only ? installedNames.filter((name) => name === only) : installedNames
  const globalIssues: VerifyIssue[] = []

  if (only && !tracker.features[only]) {
    globalIssues.push({
      code: "unknown_feature",
      severity: "error",
      feature: only,
      message: `"${only}" is not installed.`,
      hint: `Installed features: ${installedNames.join(", ") || "(none)"}`,
    })
  }

  // Tracker entries whose feature directory disappeared.
  for (const name of installedNames) {
    if (!byName.has(name)) {
      globalIssues.push({
        code: "missing_manifest",
        severity: "error",
        feature: name,
        file: `features/${name}/feature.json`,
        message: `"${name}" is recorded as installed but features/${name}/feature.json is gone.`,
        hint: `Re-create the feature directory, or drop the entry from features.json.`,
      })
    }
  }

  // Shared copy targets between installed features — the newest install wins.
  const targetOwners = new Map<string, string[]>()
  for (const name of installedNames) {
    const found = byName.get(name)
    if (!found?.manifest) continue
    for (const copy of found.manifest.copies) {
      const owners = targetOwners.get(copy.to) ?? []
      owners.push(name)
      targetOwners.set(copy.to, owners)
    }
  }
  for (const [target, owners] of targetOwners) {
    if (owners.length < 2) continue
    const winner = currentOwner(tracker, target) ?? owners[owners.length - 1]
    globalIssues.push({
      code: "shared_target",
      severity: "info",
      feature: owners.join(", "),
      file: target,
      message: `${target} is provided by ${owners.length} installed features (${owners.join(", ")}); "${winner}" currently wins.`,
      hint: `Removing a feature restores the previous owner's version automatically.`,
    })
  }

  // Duplicate JSON appends across installed features.
  const jsonAppends = new Map<string, string[]>()
  for (const name of installedNames) {
    const found = byName.get(name)
    if (!found?.manifest) continue
    for (const entry of found.manifest.jsonAppends) {
      const key = `${entry.file}#${entry.path}#${entry.value}`
      jsonAppends.set(key, [...(jsonAppends.get(key) ?? []), name])
    }
  }
  for (const [key, owners] of jsonAppends) {
    if (owners.length < 2) continue
    globalIssues.push({
      code: "duplicate_json_append",
      severity: "warning",
      feature: owners.join(", "),
      message: `${owners.join(" and ")} both append "${key.split("#").slice(1).join("#")}".`,
      hint: `Removing one of them will drop the entry the other still needs.`,
    })
  }

  const results: FeatureVerification[] = []
  for (const name of targets) {
    const record = tracker.features[name]
    if (!record) continue
    const found = byName.get(name)
    const issues: VerifyIssue[] = []

    if (!found?.manifest) {
      issues.push({
        code: "unreadable_manifest",
        severity: "error",
        feature: name,
        file: `features/${name}/feature.json`,
        message: found?.error ?? `features/${name}/feature.json could not be read.`,
      })
      results.push({
        name,
        installed: true,
        installedVersion: record.version,
        upgradeAvailable: false,
        issues,
      })
      continue
    }

    const manifest: NormalizedManifest = found.manifest
    const featureDir = found.dir

    if (!record.files) {
      issues.push({
        code: "legacy_record",
        severity: "info",
        feature: name,
        message: `Installed by an older feature-manager: no per-file record, so modified-file detection is unavailable.`,
        hint: `Reinstall with --force to upgrade the record: pnpm add-feature ${name} --force`,
      })
    }

    const upgradeAvailable = manifest.version !== record.version
    if (upgradeAvailable) {
      issues.push({
        code: "version_drift",
        severity: "warning",
        feature: name,
        message: `Installed v${record.version} but features/${name} is v${manifest.version}.`,
        hint: `Upgrade with: pnpm add-feature ${name} --force`,
      })
    }

    for (const required of manifest.requires) {
      if (!tracker.features[required]) {
        issues.push({
          code: "missing_prerequisite",
          severity: "error",
          feature: name,
          message: `Requires "${required}", which is not installed.`,
          hint: `Run: pnpm add-feature ${required}`,
        })
      }
    }

    // ── Copied files ──
    for (const copy of manifest.copies) {
      const abs = join(root, copy.to)
      const owner = currentOwner(tracker, copy.to)
      const claimersList = claimers(tracker, copy.to)

      if (!existsSync(abs)) {
        if (owner && owner !== name) {
          issues.push({
            code: "shadowed_file",
            severity: "warning",
            feature: name,
            file: copy.to,
            message: `${copy.to} is missing (claimed by "${owner}").`,
          })
        } else {
          issues.push({
            code: "missing_file",
            severity: "error",
            feature: name,
            file: copy.to,
            message: `Expected file is missing: ${copy.to}`,
            hint: `Reinstall with: pnpm add-feature ${name} --force`,
          })
        }
        continue
      }

      if (owner && owner !== name) {
        issues.push({
          code: "shadowed_file",
          severity: "info",
          feature: name,
          file: copy.to,
          message: `${copy.to} is currently provided by "${owner}" (installed later).`,
          hint: `Removing "${owner}" restores this feature's version.`,
        })
        continue
      }

      const expected = record.files?.[copy.to]
      const actual = sha256File(abs)
      if (expected && actual && actual !== expected) {
        issues.push({
          code: "modified_file",
          severity: "warning",
          feature: name,
          file: copy.to,
          message: `${copy.to} was modified after install.`,
          hint:
            claimersList.length > 1
              ? `Also claimed by: ${claimersList.filter((c) => c !== name).join(", ")}.`
              : `Reinstall with --force to overwrite, or keep your changes.`,
        })
      }
    }

    // ── Insertions ──
    for (const insertion of manifest.insertions) {
      const abs = join(root, insertion.file)
      if (!existsSync(abs)) {
        issues.push({
          code: "missing_marker",
          severity: "warning",
          feature: name,
          file: insertion.file,
          message: `Insertion target is missing: ${insertion.file} (marker "${insertion.marker}").`,
          hint: `The snippet for marker "${insertion.marker}" was never placed.`,
        })
        continue
      }
      const content = readFileSync(abs, "utf-8")
      const sentinel = `feature-manager:${insertion.marker}`
      if (!content.includes(`${sentinel}:begin`)) {
        issues.push({
          code: "missing_marker",
          severity: "warning",
          feature: name,
          file: insertion.file,
          message: `Marker region "${insertion.marker}" is missing from ${insertion.file}.`,
          hint: `The snippet needs to be wired in manually.`,
        })
        continue
      }
      if (!content.includes(`feature-manager:${insertion.marker}:${name}:begin`)) {
        issues.push({
          code: "missing_insertion",
          severity: "warning",
          feature: name,
          file: insertion.file,
          message: `Snippet for marker "${insertion.marker}" is not present in ${insertion.file}.`,
          hint: `Reinstall with: pnpm add-feature ${name} --force`,
        })
      }
    }

    // ── JSON appends ──
    for (const entry of manifest.jsonAppends) {
      const abs = join(root, entry.file)
      if (!existsSync(abs)) {
        issues.push({
          code: "missing_json_entry",
          severity: "warning",
          feature: name,
          file: entry.file,
          message: `JSON file is missing: ${entry.file}.`,
        })
        continue
      }
      try {
        const data = JSON.parse(readFileSync(abs, "utf-8")) as unknown
        const arr = getAtPath(data, entry.path)
        if (!Array.isArray(arr) || !arr.includes(entry.value)) {
          issues.push({
            code: "missing_json_entry",
            severity: "warning",
            feature: name,
            file: entry.file,
            message: `"${entry.value}" is not present in ${entry.file} at ${entry.path}.`,
            hint: `Reinstall with: pnpm add-feature ${name} --force`,
          })
        }
      } catch {
        issues.push({
          code: "missing_json_entry",
          severity: "warning",
          feature: name,
          file: entry.file,
          message: `${entry.file} is not valid JSON.`,
        })
      }
    }

    // ── Dependencies ──
    for (const [field, groups] of [
      ["dependencies", manifest.dependencies],
      ["devDependencies", manifest.devDependencies],
    ] as const) {
      for (const [target, group] of Object.entries(groups)) {
        const pkgFile = join(root, target, "package.json")
        if (!existsSync(pkgFile)) {
          issues.push({
            code: "missing_dependency",
            severity: "warning",
            feature: name,
            file: `${target}/package.json`,
            message: `${target}/package.json is missing; cannot verify ${field}.`,
          })
          continue
        }
        let pkg: Record<string, unknown>
        try {
          pkg = JSON.parse(readFileSync(pkgFile, "utf-8")) as Record<string, unknown>
        } catch {
          issues.push({
            code: "missing_dependency",
            severity: "warning",
            feature: name,
            file: `${target}/package.json`,
            message: `${target}/package.json is not valid JSON.`,
          })
          continue
        }
        const declared = (pkg[field] as Record<string, string> | undefined) ?? {}
        for (const [dep, range] of Object.entries(group)) {
          const current = declared[dep]
          if (current === undefined) {
            issues.push({
              code: "missing_dependency",
              severity: "warning",
              feature: name,
              file: `${target}/package.json`,
              message: `"${dep}" (${field}) is not declared in ${target}.`,
              hint: `Run: pnpm install — or reinstall with --force.`,
            })
          } else if (current !== range) {
            issues.push({
              code: "dependency_version",
              severity: "info",
              feature: name,
              file: `${target}/package.json`,
              message: `"${dep}" is "${current}" but this feature expects "${range}".`,
              hint: `Another feature may have pinned a different range.`,
            })
          }
        }
      }
    }

    // ── Env vars ──
    for (const [target, vars] of Object.entries(manifest.env)) {
      if (!vars.length) continue
      const envPath = join(root, target, ".env")
      const examplePath = join(root, target, ".env.example")
      const envKeys = readEnvKeys(envPath)
      const exampleKeys = readEnvKeys(examplePath)
      const missing = vars
        .map(envKeyOf)
        .filter((key): key is string => Boolean(key))
        .filter((key) => !(envKeys?.has(key) ?? false) && !(exampleKeys?.has(key) ?? false))
      if (missing.length === 0) continue
      const anyFile = Boolean(envKeys || exampleKeys)
      issues.push({
        code: "missing_env",
        severity: anyFile ? "warning" : "info",
        feature: name,
        file: `${target}/.env`,
        message: `Env var${missing.length > 1 ? "s" : ""} not documented: ${missing.join(", ")}.`,
        hint: `Add ${missing.join(", ")} to ${target}/.env.`,
      })
    }

    void featureDir
    results.push({
      name,
      installed: true,
      installedVersion: record.version,
      manifestVersion: manifest.version,
      upgradeAvailable,
      issues,
    })
  }

  // Available but not installed.
  const notInstalled = discovered
    .map((feature) => feature.name)
    .filter((name) => !tracker.features[name])
  if (notInstalled.length > 0 && !only) {
    globalIssues.push({
      code: "unknown_feature",
      severity: "info",
      feature: notInstalled.join(", "),
      message: `${notInstalled.length} feature(s) available but not installed: ${notInstalled.join(", ")}.`,
      hint: `Install with: pnpm add-feature <name>`,
    })
  }

  const all = [...results.flatMap((result) => result.issues), ...globalIssues]
  const counts = {
    errors: all.filter((issue) => issue.severity === "error").length,
    warnings: all.filter((issue) => issue.severity === "warning").length,
    infos: all.filter((issue) => issue.severity === "info").length,
  }

  return {
    root,
    features: results,
    globalIssues,
    counts,
    ok: counts.errors === 0,
  }
}
