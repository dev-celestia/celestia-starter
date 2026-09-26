import { existsSync } from "node:fs"
import { dirname, isAbsolute, join, relative, resolve } from "node:path"

/**
 * Path resolution + containment helpers.
 *
 * Every path that comes from a feature manifest (`copies[].to`,
 * `insertions[].file`, `jsonAppends[].file`, dependency targets, …) is
 * attacker/typo controlled: a manifest could contain `../../.ssh/config` and
 * happily write outside the repository. All such paths must go through
 * {@link resolveInside} so that escapes fail loudly instead of silently
 * touching the user's machine.
 */

export class PathEscapeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PathEscapeError"
  }
}

export interface RepoContext {
  /** Absolute repo root. */
  root: string
  /** Absolute path to the features/ directory. */
  featuresDir: string
  /** Absolute path to features.json. */
  trackerFile: string
}

/**
 * Walk up from `start` until a directory containing `features.json` is found.
 * Lets the CLI run from any subdirectory instead of only the repo root.
 */
export function findRepoRoot(start: string = process.cwd()): string {
  let dir = resolve(start)
  for (;;) {
    if (existsSync(join(dir, "features.json"))) return dir
    const parent = dirname(dir)
    if (parent === dir) {
      throw new Error(
        `Could not locate the repository root: no "features.json" found in ${resolve(start)} or any parent directory.\n` +
          `Run this command from inside the celestia-starter repository.`,
      )
    }
    dir = parent
  }
}

/** Feature templates live inside the feature-manager package, not at the repo root. */
const FEATURES_SUBPATH = join("packages", "feature-manager", "features")

/** Repo-root-relative path of a feature's manifest, for user-facing messages. */
export const manifestDisplayPath = (name: string) => `${FEATURES_SUBPATH}/${name}/feature.json`

export function repoContext(root: string): RepoContext {
  const abs = resolve(root)
  return {
    root: abs,
    featuresDir: join(abs, FEATURES_SUBPATH),
    trackerFile: join(abs, "features.json"),
  }
}

/** True when `child` is `base` itself or nested inside it. */
export function isInside(base: string, child: string): boolean {
  const rel = relative(resolve(base), resolve(child))
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))
}

/**
 * Resolve `rel` against `base`, refusing absolute paths and anything that
 * escapes `base`. `label` is used to produce an actionable error message.
 */
export function resolveInside(base: string, rel: string, label: string): string {
  if (typeof rel !== "string" || rel.length === 0) {
    throw new PathEscapeError(`${label} must be a non-empty relative path.`)
  }
  if (isAbsolute(rel)) {
    throw new PathEscapeError(`${label} must be relative to the repository root, got absolute path "${rel}".`)
  }
  const abs = resolve(base, rel)
  if (!isInside(base, abs)) {
    throw new PathEscapeError(
      `${label} escapes its root: "${rel}" resolves outside ${base}.\n` +
        `Feature manifests may only reference paths inside the repository.`,
    )
  }
  return abs
}

/** Resolve a repo-root-relative path, refusing traversal outside the repo. */
export function repoPath(root: string, rel: string, label: string): string {
  return resolveInside(root, rel, label)
}

/** Resolve a feature-dir-relative path, refusing traversal outside the feature. */
export function featurePath(featureDir: string, rel: string, label: string): string {
  return resolveInside(featureDir, rel, label)
}

/** Render `abs` relative to the repo root for display, falling back to `abs`. */
export function displayPath(root: string, abs: string): string {
  return isInside(root, abs) ? relative(root, abs) || "." : abs
}
