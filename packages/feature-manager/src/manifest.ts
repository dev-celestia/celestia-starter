import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, posix } from "node:path"

import { readJson } from "./fsx.js"
import { PathEscapeError, featurePath, repoPath } from "./paths.js"
import type {
  FeatureCopy,
  FeatureInsertion,
  FeatureJsonAppend,
  FeatureManifest,
} from "./types.js"
import { isValidMarker } from "./markers.js"

const WEB = posix.join("apps", "web")

/** A manifest normalized to the current schema (legacy fields folded in). */
export interface NormalizedManifest {
  name: string
  version: string
  description: string
  requires: string[]
  copies: FeatureCopy[]
  insertions: FeatureInsertion[]
  jsonAppends: FeatureJsonAppend[]
  dependencies: Record<string, Record<string, string>>
  devDependencies: Record<string, Record<string, string>>
  env: Record<string, string[]>
  postInstall: string[]
  notes?: string
}

export interface DiscoveredFeature {
  name: string
  dir: string
  raw?: FeatureManifest
  manifest?: NormalizedManifest
  /** Set when feature.json is missing or unparseable. */
  error?: string
}

export interface ManifestValidation {
  /** Blocking problems: malformed manifest, path escapes, invalid markers. */
  errors: string[]
  /** Environmental problems the installer tolerates (missing files, drift). */
  warnings: string[]
}

export interface ValidateOptions {
  root: string
  featureDir: string
  /** Names of features that exist under features/ (for `requires`). */
  available: Set<string>
  /** Names of features recorded as installed (for `requires`). */
  installed: Set<string>
}

const KNOWN_MANIFEST_KEYS = new Set([
  "name",
  "version",
  "description",
  "requires",
  "copies",
  "insertions",
  "jsonAppends",
  "dependencies",
  "devDependencies",
  "env",
  "postInstall",
  "notes",
  "files",
])

/** Normalize repo-relative paths so tracker keys are stable across platforms. */
export function normalizeRel(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "")
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isFlatDepMap(value: Record<string, unknown>): boolean {
  const entries = Object.entries(value)
  return entries.length > 0 && entries.every(([, v]) => typeof v === "string")
}

function normalizeDeps(
  deps: Record<string, Record<string, string>> | Record<string, string> | undefined,
): Record<string, Record<string, string>> {
  if (!isPlainObject(deps)) return {}
  // Legacy flat form ({ "pkg": "version" }) implicitly targeted apps/web.
  if (isFlatDepMap(deps)) return { [WEB]: deps as Record<string, string> }
  const out: Record<string, Record<string, string>> = {}
  for (const [target, value] of Object.entries(deps)) {
    if (!isPlainObject(value)) continue
    const entries = Object.entries(value).filter(([, v]) => typeof v === "string") as [
      string,
      string,
    ][]
    out[normalizeRel(target)] = Object.fromEntries(entries)
  }
  return out
}

function normalizeEnv(
  env: Record<string, string[]> | string[] | undefined,
): Record<string, string[]> {
  if (Array.isArray(env)) return { [WEB]: env.filter((v): v is string => typeof v === "string") }
  if (!isPlainObject(env)) return {}
  const out: Record<string, string[]> = {}
  for (const [target, value] of Object.entries(env)) {
    if (!Array.isArray(value)) continue
    out[normalizeRel(target)] = value.filter((v): v is string => typeof v === "string")
  }
  return out
}

export function normalizeManifest(manifest: FeatureManifest): NormalizedManifest {
  const copies: FeatureCopy[] = []
  if (Array.isArray(manifest.copies)) {
    for (const copy of manifest.copies) {
      if (!isPlainObject(copy)) continue
      if (typeof copy.from !== "string" || typeof copy.to !== "string") continue
      copies.push({ from: normalizeRel(copy.from), to: normalizeRel(copy.to) })
    }
  }
  // Legacy `files` map is web-relative: { "<src>": "<dest in apps/web>" }.
  if (isPlainObject(manifest.files)) {
    for (const [from, to] of Object.entries(manifest.files)) {
      if (typeof to !== "string") continue
      copies.push({ from: normalizeRel(from), to: normalizeRel(posix.join(WEB, to)) })
    }
  }

  const insertions: FeatureInsertion[] = []
  if (Array.isArray(manifest.insertions)) {
    for (const insertion of manifest.insertions) {
      if (!isPlainObject(insertion)) continue
      if (
        typeof insertion.file !== "string" ||
        typeof insertion.marker !== "string" ||
        typeof insertion.snippet !== "string"
      ) {
        continue
      }
      insertions.push({
        file: normalizeRel(insertion.file),
        marker: insertion.marker.trim(),
        snippet: normalizeRel(insertion.snippet),
      })
    }
  }

  const jsonAppends: FeatureJsonAppend[] = []
  if (Array.isArray(manifest.jsonAppends)) {
    for (const entry of manifest.jsonAppends) {
      if (!isPlainObject(entry)) continue
      if (
        typeof entry.file !== "string" ||
        typeof entry.path !== "string" ||
        typeof entry.value !== "string"
      ) {
        continue
      }
      jsonAppends.push({
        file: normalizeRel(entry.file),
        path: entry.path.trim(),
        value: entry.value,
      })
    }
  }

  return {
    name: typeof manifest.name === "string" ? manifest.name.trim() : "",
    version: typeof manifest.version === "string" ? manifest.version.trim() : "",
    description: typeof manifest.description === "string" ? manifest.description : "",
    requires: Array.isArray(manifest.requires)
      ? manifest.requires.filter((r): r is string => typeof r === "string")
      : [],
    copies,
    insertions,
    jsonAppends,
    dependencies: normalizeDeps(manifest.dependencies),
    devDependencies: normalizeDeps(manifest.devDependencies),
    env: normalizeEnv(manifest.env),
    postInstall: Array.isArray(manifest.postInstall)
      ? manifest.postInstall.filter((c): c is string => typeof c === "string")
      : [],
    ...(typeof manifest.notes === "string" ? { notes: manifest.notes } : {}),
  }
}

function getAtPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
      obj,
    )
}

/**
 * Validate a manifest before installing. `errors` block the install; `warnings`
 * are reported and (with `--strict`) can be escalated by the CLI.
 */
export function validateManifest(
  raw: FeatureManifest,
  manifest: NormalizedManifest,
  options: ValidateOptions,
): ManifestValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const { root, featureDir, available, installed } = options

  if (!manifest.name) errors.push(`"name" is required and must be a non-empty string.`)
  if (!manifest.version) errors.push(`"version" is required and must be a non-empty string.`)
  else if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
    warnings.push(`"version" ("${manifest.version}") does not look like semver (e.g. 1.0.0).`)
  }
  if (!manifest.description) warnings.push(`"description" is empty — it is shown by \`list\`.`)

  const dirName = featureDir.split(/[\\/]/).pop() ?? ""
  if (manifest.name && dirName && manifest.name !== dirName) {
    warnings.push(`"name" ("${manifest.name}") does not match its directory ("${dirName}").`)
  }

  for (const key of Object.keys(raw)) {
    if (!KNOWN_MANIFEST_KEYS.has(key)) {
      warnings.push(`Unknown manifest key "${key}" is ignored (typo?).`)
    }
  }

  // ── requires ──
  for (const dep of manifest.requires) {
    if (dep === manifest.name) errors.push(`"requires" cannot list itself.`)
    else if (!available.has(dep)) errors.push(`"requires" lists "${dep}", which is not a feature in features/.`)
    else if (!installed.has(dep)) warnings.push(`Requires "${dep}", which is not installed yet.`)
  }

  // ── copies ──
  const seenTargets = new Map<string, string>()
  for (const copy of manifest.copies) {
    const label = `copies[].to "${copy.to}"`
    try {
      repoPath(root, copy.to, label)
    } catch (err) {
      errors.push(err instanceof PathEscapeError ? err.message : String(err))
      continue
    }
    try {
      const src = featurePath(featureDir, copy.from, `copies[].from "${copy.from}"`)
      if (!existsSync(src)) warnings.push(`Template file not found: ${copy.from}`)
    } catch (err) {
      errors.push(err instanceof PathEscapeError ? err.message : String(err))
    }

    const previous = seenTargets.get(copy.to)
    if (previous) errors.push(`Duplicate copy target "${copy.to}" (also from "${previous}").`)
    else seenTargets.set(copy.to, copy.from)
  }

  // ── insertions ──
  const seenInsertions = new Set<string>()
  for (const insertion of manifest.insertions) {
    const key = `${insertion.file}#${insertion.marker}`
    if (seenInsertions.has(key)) {
      errors.push(`Duplicate insertion for "${insertion.file}" marker "${insertion.marker}".`)
    }
    seenInsertions.add(key)

    if (!isValidMarker(insertion.marker)) {
      errors.push(
        `Invalid marker "${insertion.marker}" for ${insertion.file}. ` +
          `Markers must match /^[a-z0-9][a-z0-9-]*$/i.`,
      )
    }

    try {
      repoPath(root, insertion.file, `insertions[].file "${insertion.file}"`)
    } catch (err) {
      errors.push(err instanceof PathEscapeError ? err.message : String(err))
    }
    try {
      const snippet = featurePath(featureDir, insertion.snippet, `insertions[].snippet "${insertion.snippet}"`)
      if (!existsSync(snippet)) warnings.push(`Snippet not found: ${insertion.snippet}`)
    } catch (err) {
      errors.push(err instanceof PathEscapeError ? err.message : String(err))
    }
  }

  // ── jsonAppends ──
  const seenJson = new Set<string>()
  for (const entry of manifest.jsonAppends) {
    const label = `jsonAppends[].file "${entry.file}"`
    let abs: string | undefined
    try {
      abs = repoPath(root, entry.file, label)
    } catch (err) {
      errors.push(err instanceof PathEscapeError ? err.message : String(err))
    }
    if (!entry.path) errors.push(`${label}: "path" is required.`)
    if (!entry.value) errors.push(`${label}: "value" is required.`)

    const key = `${entry.file}#${entry.path}#${entry.value}`
    if (seenJson.has(key)) warnings.push(`Duplicate jsonAppends entry for ${entry.file} (${entry.path}).`)
    seenJson.add(key)

    if (abs) {
      if (!existsSync(abs)) {
        warnings.push(`JSON file not found: ${entry.file}`)
      } else if (entry.path) {
        try {
          const data = readJson<unknown>(abs)
          if (!Array.isArray(getAtPath(data, entry.path))) {
            warnings.push(`JSON path "${entry.path}" in ${entry.file} is not an array.`)
          }
        } catch {
          warnings.push(`JSON file is not parseable: ${entry.file}`)
        }
      }
    }
  }

  // ── dependencies ──
  for (const [field, groups] of [
    ["dependencies", manifest.dependencies],
    ["devDependencies", manifest.devDependencies],
  ] as const) {
    for (const [target, deps] of Object.entries(groups)) {
      let abs: string
      try {
        abs = repoPath(root, target, `${field} target "${target}"`)
      } catch (err) {
        errors.push(err instanceof PathEscapeError ? err.message : String(err))
        continue
      }
      if (!existsSync(join(abs, "package.json"))) {
        warnings.push(`${field} target "${target}" has no package.json.`)
      }
      for (const [dep, range] of Object.entries(deps)) {
        if (!dep.trim()) errors.push(`${field}["${target}"] contains an empty package name.`)
        if (!range.trim()) errors.push(`${field}["${target}"]["${dep}"] has an empty version range.`)
        else if (range === "latest" || range === "*") {
          warnings.push(`${field}["${target}"]["${dep}"] uses the unpinned range "${range}".`)
        }
      }
    }
  }

  // ── env ──
  for (const [target, vars] of Object.entries(manifest.env)) {
    try {
      repoPath(root, target, `env target "${target}"`)
    } catch (err) {
      errors.push(err instanceof PathEscapeError ? err.message : String(err))
    }
    for (const entry of vars) {
      if (!entry.includes("=")) warnings.push(`env entry "${entry}" for ${target} has no "=" (expected KEY=value).`)
    }
  }

  return { errors, warnings }
}

export function loadManifest(featureDir: string): { raw: FeatureManifest; manifest: NormalizedManifest } {
  const manifestPath = join(featureDir, "feature.json")
  if (!existsSync(manifestPath)) {
    throw new Error(`No feature.json found in ${featureDir}.`)
  }
  let raw: unknown
  try {
    raw = readJson<unknown>(manifestPath)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`feature.json is not valid JSON (${manifestPath}): ${message}`)
  }
  if (!isPlainObject(raw)) throw new Error(`feature.json must contain a JSON object (${manifestPath}).`)
  const typed = raw as unknown as FeatureManifest
  return { raw: typed, manifest: normalizeManifest(typed) }
}

/** Enumerate `features/<name>/` directories that contain a feature.json. */
export function discoverFeatures(featuresDir: string): DiscoveredFeature[] {
  if (!existsSync(featuresDir)) return []
  return readdirSync(featuresDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .flatMap((name): DiscoveredFeature[] => {
      const dir = join(featuresDir, name)
      const manifestPath = join(dir, "feature.json")
      if (!existsSync(manifestPath)) return []
      try {
        const { raw, manifest } = loadManifest(dir)
        return [{ name, dir, raw, manifest }]
      } catch (err) {
        return [{ name, dir, error: err instanceof Error ? err.message : String(err) }]
      }
    })
}

/** All feature names that have a readable manifest (used for `requires` checks). */
export function availableFeatureNames(featuresDir: string): Set<string> {
  return new Set(discoverFeatures(featuresDir).map((f) => f.name))
}

/** True when the path exists and is a directory. */
export function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

export function readFileText(file: string): string {
  return readFileSync(file, "utf-8")
}
