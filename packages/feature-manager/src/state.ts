import { existsSync, readFileSync } from "node:fs"

import { writeJson } from "./fsx.js"
import { repoContext } from "./paths.js"
import type { FeatureTracker, InstalledFeature } from "./types.js"

export const TRACKER_FILE = "features.json"

/**
 * Tracker (`features.json`) access.
 *
 * The on-disk shape is intentionally backward compatible: v1 wrote
 * `{ features: { <name>: { version, installedAt } } }` and everything added
 * since (`seq`, `files`, `backups`) is optional. Records written by an older
 * version simply fall back to the legacy behaviour.
 */

export function readTracker(root: string): FeatureTracker {
  const { trackerFile } = repoContext(root)
  if (!existsSync(trackerFile)) return { features: {} }

  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(trackerFile, "utf-8"))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`${TRACKER_FILE} is not valid JSON: ${message}`)
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`${TRACKER_FILE} must contain a JSON object with a "features" key.`)
  }

  const features = (raw as { features?: unknown }).features
  if (features === undefined) return { features: {} }
  if (!features || typeof features !== "object" || Array.isArray(features)) {
    throw new Error(`${TRACKER_FILE}: "features" must be an object keyed by feature name.`)
  }

  const seq = (raw as { seq?: unknown }).seq
  return {
    features: features as Record<string, InstalledFeature>,
    ...(typeof seq === "number" ? { seq } : {}),
  }
}

export function writeTracker(root: string, tracker: FeatureTracker): void {
  writeJson(repoContext(root).trackerFile, tracker)
}

/** Reserve the next install sequence number. */
export function allocateSeq(tracker: FeatureTracker): number {
  const used = Object.values(tracker.features).map((f) => f.seq ?? 0)
  const next = Math.max(tracker.seq ?? 0, ...used, 0) + 1
  tracker.seq = next
  return next
}

/**
 * Installed feature names, oldest first. Falls back to `installedAt` and then
 * to the key order in `features.json` so legacy trackers still resolve a
 * sensible ownership order.
 */
export function installOrder(tracker: FeatureTracker): string[] {
  const names = Object.keys(tracker.features)
  return names
    .map((name, index) => {
      const record = tracker.features[name]
      return { name, index, seq: record?.seq, at: record?.installedAt ?? "" }
    })
    .sort((a, b) => {
      if (a.seq !== undefined && b.seq !== undefined && a.seq !== b.seq) return a.seq - b.seq
      if (a.seq !== undefined && b.seq === undefined) return -1
      if (a.seq === undefined && b.seq !== undefined) return 1
      if (a.at !== b.at) return a.at < b.at ? -1 : 1
      return a.index - b.index
    })
    .map((entry) => entry.name)
}

/**
 * Which installed feature currently owns `rel` — i.e. the most recently
 * installed one that lists the path in its `files` record.
 */
export function currentOwner(tracker: FeatureTracker, rel: string): string | undefined {
  const order = installOrder(tracker)
  for (let i = order.length - 1; i >= 0; i -= 1) {
    const name = order[i]
    if (name === undefined) continue
    const record = tracker.features[name]
    if (record?.files && Object.hasOwn(record.files, rel)) return name
  }
  return undefined
}

/** The owner that would take over `rel` once `feature` is removed. */
export function previousOwner(
  tracker: FeatureTracker,
  rel: string,
  feature: string,
): string | undefined {
  const order = installOrder(tracker).filter((name) => name !== feature)
  for (let i = order.length - 1; i >= 0; i -= 1) {
    const name = order[i]
    if (name === undefined) continue
    const record = tracker.features[name]
    if (record?.files && Object.hasOwn(record.files, rel)) return name
  }
  return undefined
}

/** Every installed feature whose `files` record claims `rel`, newest first. */
export function claimers(tracker: FeatureTracker, rel: string): string[] {
  return installOrder(tracker)
    .filter((name) => {
      const record = tracker.features[name]
      return Boolean(record?.files && Object.hasOwn(record.files, rel))
    })
    .reverse()
}
