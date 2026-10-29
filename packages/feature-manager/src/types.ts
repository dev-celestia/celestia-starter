export interface FeatureNavItem {
  label: string
  href: string
  icon?: string
}

export interface Feature {
  id: string
  name: string
  version: string
  description?: string
  navItems?: FeatureNavItem[]
  settingsRoutes?: string[]
}

/** A file copied from the feature directory into the repository. */
export interface FeatureCopy {
  /** Path relative to the feature directory. */
  from: string
  /** Path relative to the repo root, e.g. "apps/web/...", "apps/api/...", "packages/db/...". */
  to: string
}

/** A snippet inserted into a managed marker region of a target file. */
export interface FeatureInsertion {
  /** Target file relative to the repo root. */
  file: string
  /** Marker id; the target file must already contain an empty region for it. */
  marker: string
  /** Snippet file (relative to the feature directory) whose content is inserted. */
  snippet: string
}

/** Appends a value to a JSON array — for files that cannot hold comment markers (e.g. meta.json). */
export interface FeatureJsonAppend {
  /** Target JSON file relative to the repo root. */
  file: string
  /** Dot path to the array, e.g. "pages". */
  path: string
  /** Value to append. */
  value: string
}

export interface FeatureManifest {
  name: string
  version: string
  description: string
  requires?: string[]
  /** Files copied into the repo (multi-target). */
  copies?: FeatureCopy[]
  /** Snippets inserted into managed marker regions. */
  insertions?: FeatureInsertion[]
  /** Values appended to JSON arrays. */
  jsonAppends?: FeatureJsonAppend[]
  /** Dependencies keyed by target package dir, e.g. { "apps/api": { "drizzle-orm": "^0.45.2" } }. */
  dependencies?: Record<string, Record<string, string>>
  /** Dev dependencies keyed by target package dir. */
  devDependencies?: Record<string, Record<string, string>>
  /** Env vars keyed by target dir containing .env, e.g. { "apps/api": ["FOO=bar"] }. */
  env?: Record<string, string[]>
  postInstall?: string[]
  notes?: string

  // ── Legacy (v1) fields — normalized at runtime for backward compatibility ──
  /** @deprecated use `copies`. Web-relative file map: { "<src>": "<dest in apps/web>" }. */
  files?: Record<string, string>
}

/** One dependency a feature touched, so removal can undo it precisely. */
export interface InstalledDependency {
  target: string
  field: "dependencies" | "devDependencies"
  name: string
  /** True when the dependency did not exist before the install. */
  added: boolean
  /** The range that was in place before the install, when it changed. */
  previous?: string
}

/**
 * A record of one installed feature.
 *
 * `version` and `installedAt` are the original (v1) fields. Everything else is
 * additive metadata written by newer versions of feature-manager; older
 * trackers simply lack it and are handled gracefully.
 */
export interface InstalledFeature {
  version: string
  installedAt: string
  /** Monotonic install order. Higher = installed more recently. */
  seq?: number
  /**
   * Repo-relative paths this feature copied, mapped to the sha256 of the content
   * it wrote. Used to detect user edits and to resolve which feature currently
   * owns a shared path.
   */
  files?: Record<string, string>
  /**
   * Repo-relative path → backup path (relative to `.feature-manager/backups/<name>/`)
   * holding the content that was overwritten on install, so removal can restore it.
   */
  backups?: Record<string, string>
  /** Dependencies this install added or re-ranged, so removal can undo them. */
  dependencies?: InstalledDependency[]
}

export interface FeatureTracker {
  features: Record<string, InstalledFeature>
  /** Next install sequence number. */
  seq?: number
}

/** Where the manager keeps its own bookkeeping (backups, etc.). Git-ignored. */
export const MANAGER_DIR = ".feature-manager"

// ── Reporting ────────────────────────────────────────────────────────────────

export interface InsertionReport {
  file: string
  marker: string
  snippetFile: string
}

export type WarningType =
  | "missing_file"
  | "missing_marker"
  | "missing_json"
  | "missing_dependency"
  | "dep_conflict"
  | "overwrite"
  | "user_modified"
  | "skipped"
  | "other"

export interface WarningReport {
  type: WarningType
  file: string
  marker?: string
  snippet?: string
  message: string
}
