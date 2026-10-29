import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"

import { MANAGER_DIR } from "./types.js"
import { isInside } from "./paths.js"

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

export function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex")
}

/** sha256 of a file, or `undefined` when it does not exist. */
export function sha256File(file: string): string | undefined {
  if (!existsSync(file)) return undefined
  return sha256(readFileSync(file))
}

/**
 * Write a file atomically (temp file in the same directory, then rename) so an
 * interrupted run can never leave a half-written file behind.
 */
export function writeFileAtomic(file: string, content: string): void {
  ensureDir(dirname(file))
  const tmp = `${file}.fm-${process.pid.toString(36)}-${Date.now().toString(36)}.tmp`
  writeFileSync(tmp, content)
  try {
    renameSync(tmp, file)
  } catch (err) {
    rmSync(tmp, { force: true })
    throw err
  }
}

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf-8")) as T
}

/** Serialize with the repo's 2-space convention plus a trailing newline. */
export function stringifyJson(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`
}

export function writeJson(file: string, data: unknown): void {
  writeFileAtomic(file, stringifyJson(data))
}

export function removeFile(file: string): void {
  rmSync(file, { force: true })
}

/** Remove `file`'s parent directories while they are empty, stopping at `stopAt`. */
export function removeEmptyParents(file: string, stopAt: string): void {
  let dir = dirname(file)
  while (dir !== stopAt && isInside(stopAt, dir)) {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    if (entries.length > 0) return
    try {
      rmSync(dir, { recursive: false })
    } catch {
      return
    }
    dir = dirname(dir)
  }
}

// ── Backups ──────────────────────────────────────────────────────────────────

/** `.feature-manager/backups/<feature>` — git-ignored scratch space. */
export function backupRoot(root: string, feature: string): string {
  return join(root, MANAGER_DIR, "backups", feature)
}

/** Repo-relative path where the pre-install content of `rel` is stashed. */
export function backupRelativePath(feature: string, rel: string): string {
  return join(MANAGER_DIR, "backups", feature, rel)
}

/** Absolute path where the pre-install content of `rel` is stashed. */
export function backupPathFor(root: string, feature: string, rel: string): string {
  return join(root, backupRelativePath(feature, rel))
}

export function removeBackups(root: string, feature: string): void {
  rmSync(backupRoot(root, feature), { recursive: true, force: true })
  pruneEmptyManagerDir(root)
}

/** Drop `.feature-manager` itself once no feature keeps backups anymore. */
export function pruneEmptyManagerDir(root: string): void {
  const backups = join(root, MANAGER_DIR, "backups")
  try {
    if (existsSync(backups) && readdirSync(backups).length === 0) {
      rmSync(backups, { recursive: true, force: true })
    }
    const managerDir = join(root, MANAGER_DIR)
    if (existsSync(managerDir) && readdirSync(managerDir).length === 0) {
      rmSync(managerDir, { recursive: true, force: true })
    }
  } catch {
    // best effort — leftovers are harmless and git-ignored
  }
}
