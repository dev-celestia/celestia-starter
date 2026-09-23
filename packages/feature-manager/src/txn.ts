import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { ensureDir, removeEmptyParents } from "./fsx.js"

/**
 * Best-effort file transaction.
 *
 * Every path a command is about to write is registered up front. If anything
 * throws mid-way, {@link FileTransaction.rollback} puts the working tree back
 * the way it was — so a failed install can never leave a half-applied repo that
 * the CLI can no longer clean up.
 */
export class FileTransaction {
  private files = new Map<string, { existed: boolean; data: Buffer }>()
  private trees = new Map<string, { existed: boolean; files: Map<string, Buffer> }>()
  private stopAt: string

  constructor(stopAt: string) {
    this.stopAt = stopAt
  }

  /** Register a single file path (existing content is snapshotted). */
  track(path: string): void {
    if (this.files.has(path)) return
    if (existsSync(path) && statSync(path).isFile()) {
      this.files.set(path, { existed: true, data: readFileSync(path) })
    } else {
      this.files.set(path, { existed: false, data: Buffer.alloc(0) })
    }
  }

  trackMany(paths: Iterable<string>): void {
    for (const path of paths) this.track(path)
  }

  /** Register a path that may be a file or a directory tree. */
  trackPath(path: string): void {
    if (!existsSync(path)) {
      this.files.set(path, { existed: false, data: Buffer.alloc(0) })
      return
    }
    if (statSync(path).isDirectory()) this.trackTree(path)
    else this.track(path)
  }

  /** Register an entire directory tree. */
  trackTree(path: string): void {
    if (this.trees.has(path)) return
    const existed = existsSync(path)
    const files = new Map<string, Buffer>()
    if (existed) {
      for (const file of listFiles(path)) {
        try {
          files.set(file, readFileSync(file))
        } catch {
          // ignore unreadable files
        }
      }
    }
    this.trees.set(path, { existed, files })
  }

  /** Write a file, creating parent directories as needed. */
  writeFile(path: string, content: string | Buffer): void {
    ensureDir(dirname(path))
    writeFileSync(path, content)
  }

  /** Restore every registered path to its pre-transaction state. */
  rollback(): string[] {
    const restored: string[] = []

    for (const [path, snapshot] of [...this.files.entries()].reverse()) {
      try {
        if (snapshot.existed) {
          ensureDir(dirname(path))
          writeFileSync(path, snapshot.data)
        } else if (existsSync(path)) {
          rmSync(path, { recursive: true, force: true })
        }
        restored.push(path)
      } catch {
        // best effort — keep restoring the rest
      }
    }

    for (const [path, snapshot] of [...this.trees.entries()].reverse()) {
      try {
        if (!snapshot.existed) {
          rmSync(path, { recursive: true, force: true })
          restored.push(path)
          continue
        }
        const current = new Set(listFiles(path))
        for (const file of current) {
          if (!snapshot.files.has(file)) rmSync(file, { force: true })
        }
        for (const [file, data] of snapshot.files) {
          mkdirSync(dirname(file), { recursive: true })
          writeFileSync(file, data)
        }
        restored.push(path)
      } catch {
        // best effort
      }
    }

    for (const path of this.files.keys()) removeEmptyParents(path, this.stopAt)
    for (const path of this.trees.keys()) removeEmptyParents(path, this.stopAt)

    return restored
  }
}

function listFiles(dir: string): string[] {
  const out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    let isDir = false
    try {
      isDir = statSync(full).isDirectory()
    } catch {
      continue
    }
    if (isDir) out.push(...listFiles(full))
    else out.push(full)
  }
  return out
}
