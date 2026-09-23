import assert from "node:assert/strict"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative } from "node:path"
import { after, test } from "node:test"

import { installFeature, planInstall } from "../src/installer.js"
import { removeFeature } from "../src/remover.js"
import { verify } from "../src/verifier.js"
import type { FeatureTracker } from "../src/types.js"

const roots: string[] = []

after(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

// ── Fixture ──────────────────────────────────────────────────────────────────

function write(root: string, rel: string, content: string): void {
  const abs = join(root, rel)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content)
}

const ALPHA_SHARED = "export const shared = 'alpha'\n"
const BETA_SHARED = "export const shared = 'beta'\n"

/**
 * A miniature repo with two cooperating features plus one designed to fail
 * half-way through, used to exercise the full install/remove lifecycle.
 */
function createFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "fm-e2e-"))
  roots.push(root)

  write(root, "features.json", '{ "features": {} }\n')
  write(root, "README.md", "# Fixture\n\n<!-- feature-manager:features:begin -->\n<!-- feature-manager:features:end -->\n")
  write(root, "apps/web/package.json", `${JSON.stringify({ name: "web", dependencies: { react: "^19.0.0" } }, null, 2)}\n`)
  write(root, "apps/web/components/existing.tsx", "ORIGINAL\n")
  // A plain file where a directory is expected — forces a mid-install failure.
  write(root, "apps/web/components/blocker", "not a directory\n")
  write(
    root,
    "apps/web/components/sidebar.tsx",
    [
      "// feature-manager:imports:begin",
      "// feature-manager:imports:end",
      "",
      "const nav = [",
      "  // feature-manager:nav:begin",
      "  // feature-manager:nav:end",
      "]",
      "",
    ].join("\n"),
  )
  write(root, "apps/web/content/docs/index.mdx", "# Docs\n\n{/* feature-manager:cards:begin */}\n{/* feature-manager:cards:end */}\n")
  write(root, "apps/web/content/docs/meta.json", '{ "pages": ["index"] }\n')

  // ── alpha ──
  write(
    root,
    "features/alpha/feature.json",
    `${JSON.stringify(
      {
        name: "alpha",
        version: "1.0.0",
        description: "Alpha feature",
        copies: [
          { from: "web/components/alpha.tsx", to: "apps/web/components/alpha.tsx" },
          { from: "web/components/shared.tsx", to: "apps/web/components/shared.tsx" },
          { from: "docs/alpha.mdx", to: "apps/web/content/docs/alpha.mdx" },
        ],
        insertions: [
          { file: "apps/web/components/sidebar.tsx", marker: "imports", snippet: "snippets/imports.ts" },
          { file: "apps/web/components/sidebar.tsx", marker: "nav", snippet: "snippets/nav.ts" },
          { file: "apps/web/content/docs/index.mdx", marker: "cards", snippet: "snippets/card.mdx" },
          { file: "README.md", marker: "features", snippet: "snippets/readme.md" },
        ],
        jsonAppends: [{ file: "apps/web/content/docs/meta.json", path: "pages", value: "alpha" }],
        dependencies: { "apps/web": { "alpha-lib": "^1.0.0" } },
        env: { "apps/web": ["ALPHA_KEY=change-me"] },
        notes: "Alpha notes",
      },
      null,
      2,
    )}\n`,
  )
  write(root, "features/alpha/web/components/alpha.tsx", "export const alpha = 1\n")
  write(root, "features/alpha/web/components/shared.tsx", ALPHA_SHARED)
  write(root, "features/alpha/docs/alpha.mdx", "# Alpha\n")
  write(root, "features/alpha/snippets/imports.ts", "import { alpha } from './alpha'")
  write(root, "features/alpha/snippets/nav.ts", "  { label: 'Alpha', href: '/alpha' },")
  write(root, "features/alpha/snippets/card.mdx", '<Card title="Alpha" href="/docs/alpha" />')
  write(root, "features/alpha/snippets/readme.md", "- **alpha** — Alpha feature")

  // ── beta (requires alpha, shares a file, conflicts on react) ──
  write(
    root,
    "features/beta/feature.json",
    `${JSON.stringify(
      {
        name: "beta",
        version: "1.0.0",
        description: "Beta feature",
        requires: ["alpha"],
        copies: [
          { from: "web/components/shared.tsx", to: "apps/web/components/shared.tsx" },
          { from: "web/components/beta.tsx", to: "apps/web/components/beta.tsx" },
        ],
        insertions: [
          { file: "apps/web/components/sidebar.tsx", marker: "nav", snippet: "snippets/nav.ts" },
        ],
        dependencies: { "apps/web": { react: "^20.0.0" } },
      },
      null,
      2,
    )}\n`,
  )
  write(root, "features/beta/web/components/shared.tsx", BETA_SHARED)
  write(root, "features/beta/web/components/beta.tsx", "export const beta = 1\n")
  write(root, "features/beta/snippets/nav.ts", "  { label: 'Beta', href: '/beta' },")

  // ── delta (overwrites a pre-existing, unowned file) ──
  write(
    root,
    "features/delta/feature.json",
    `${JSON.stringify(
      {
        name: "delta",
        version: "1.0.0",
        description: "Delta overwrites a starter file",
        copies: [{ from: "web/existing.tsx", to: "apps/web/components/existing.tsx" }],
      },
      null,
      2,
    )}\n`,
  )
  write(root, "features/delta/web/existing.tsx", "DELTA\n")

  // ── gamma (fails part-way through the copy phase) ──
  write(
    root,
    "features/gamma/feature.json",
    `${JSON.stringify(
      {
        name: "gamma",
        version: "1.0.0",
        description: "Gamma feature that cannot install cleanly",
        copies: [
          { from: "web/existing.tsx", to: "apps/web/components/existing.tsx" },
          { from: "web/gamma-new.tsx", to: "apps/web/components/gamma-new.tsx" },
          { from: "web/broken.tsx", to: "apps/web/components/blocker/nested/broken.tsx" },
        ],
        insertions: [{ file: "README.md", marker: "features", snippet: "snippets/readme.md" }],
      },
      null,
      2,
    )}\n`,
  )
  write(root, "features/gamma/web/existing.tsx", "REPLACED\n")
  write(root, "features/gamma/web/gamma-new.tsx", "export const gamma = 1\n")
  write(root, "features/gamma/web/broken.tsx", "export const broken = 1\n")
  write(root, "features/gamma/snippets/readme.md", "- **gamma** — Gamma")

  return root
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function read(root: string, rel: string): string {
  return readFileSync(join(root, rel), "utf-8")
}

function tracker(root: string): FeatureTracker {
  return JSON.parse(read(root, "features.json")) as FeatureTracker
}

function pkg(root: string, rel = "apps/web/package.json"): Record<string, unknown> {
  return JSON.parse(read(root, rel)) as Record<string, unknown>
}

/** Every file in the tree with its content, for before/after comparison. */
function snapshot(root: string): Map<string, string> {
  const files = new Map<string, string>()
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry)
      if (statSync(abs).isDirectory()) walk(abs)
      else files.set(relative(root, abs), readFileSync(abs, "utf-8"))
    }
  }
  walk(root)
  return files
}

function install(root: string, name: string, options: { force?: boolean; dryRun?: boolean } = {}) {
  const result = installFeature({ root, name, ...options })
  assert.equal(result.ok, true, `expected ${name} to install: ${JSON.stringify(result)}`)
  return result.ok ? result.plan : undefined
}

function remove(root: string, name: string, options: { force?: boolean } = {}) {
  const result = removeFeature({ root, name, ...options })
  assert.equal(result.ok, true, `expected ${name} to be removed: ${JSON.stringify(result)}`)
  return result.ok ? result.plan : undefined
}

// ── Tests ────────────────────────────────────────────────────────────────────

test("install copies files, wires markers, appends JSON and merges dependencies", () => {
  const root = createFixture()
  const report = install(root, "alpha")
  assert.ok(report)

  assert.ok(existsSync(join(root, "apps/web/components/alpha.tsx")))
  assert.ok(existsSync(join(root, "apps/web/components/shared.tsx")))
  assert.ok(existsSync(join(root, "apps/web/content/docs/alpha.mdx")))

  const sidebar = read(root, "apps/web/components/sidebar.tsx")
  assert.match(sidebar, /feature-manager:imports:alpha:begin/)
  assert.match(sidebar, /feature-manager:nav:alpha:begin/)
  assert.match(sidebar, /label: 'Alpha'/)

  assert.match(read(root, "apps/web/content/docs/index.mdx"), /cards:alpha:begin/)
  assert.match(read(root, "README.md"), /\*\*alpha\*\*/)
  assert.deepEqual(JSON.parse(read(root, "apps/web/content/docs/meta.json")).pages, ["index", "alpha"])

  const webPkg = pkg(root).dependencies as Record<string, string>
  assert.equal(webPkg["alpha-lib"], "^1.0.0")
  assert.equal(webPkg.react, "^19.0.0", "pre-existing dependencies must be left alone")

  const record = tracker(root).features.alpha
  assert.ok(record)
  assert.equal(record.version, "1.0.0")
  assert.equal(typeof record.seq, "number")
  assert.match(record.files?.["apps/web/components/alpha.tsx"] ?? "", /^[0-9a-f]{64}$/)
  assert.equal(record.backups, undefined, "no backup is needed for files this feature creates")
  assert.deepEqual(record.dependencies, [
    { target: "apps/web", field: "dependencies", name: "alpha-lib", added: true },
  ])

  assert.equal(verify(root).ok, true)
})

test("refuses to install an already-installed feature without --force", () => {
  const root = createFixture()
  install(root, "alpha")

  const again = installFeature({ root, name: "alpha" })
  assert.equal(again.ok, false)
  assert.match(again.ok === false ? again.errors.join("\n") : "", /already installed/)
  assert.match(again.ok === false ? again.errors.join("\n") : "", /--force/)
})

test("dry-run reports the plan without writing anything", () => {
  const root = createFixture()
  const before = snapshot(root)

  const planned = planInstall({ root, name: "alpha" })
  assert.equal(planned.ok, true)
  const report = install(root, "alpha", { dryRun: true })
  assert.equal(report?.dryRun, true)

  assert.deepEqual(snapshot(root), before, "dry-run must not touch the working tree")
})

test("refuses to install a feature whose prerequisites are missing", () => {
  const root = createFixture()
  const result = installFeature({ root, name: "beta" })
  assert.equal(result.ok, false)
  assert.match(result.ok === false ? result.errors.join("\n") : "", /requires "alpha"/)
})

test("overwriting a file another feature provides records a backup and a dependency conflict", () => {
  const root = createFixture()
  install(root, "alpha")
  const report = install(root, "beta")

  assert.equal(read(root, "apps/web/components/shared.tsx"), BETA_SHARED)
  assert.deepEqual(report?.conflicts, [
    { target: "apps/web (dependencies)", name: "react", current: "^19.0.0", incoming: "^20.0.0" },
  ])
  assert.deepEqual(report?.backups, [
    {
      path: "apps/web/components/shared.tsx",
      backup: ".feature-manager/backups/beta/apps/web/components/shared.tsx",
    },
  ])

  const record = tracker(root).features.beta
  assert.deepEqual(record?.backups, {
    "apps/web/components/shared.tsx": ".feature-manager/backups/beta/apps/web/components/shared.tsx",
  })
  assert.deepEqual(record?.dependencies, [
    { target: "apps/web", field: "dependencies", name: "react", added: false, previous: "^19.0.0" },
  ])
  // The previous owner's content is preserved for restoration.
  assert.equal(
    read(root, ".feature-manager/backups/beta/apps/web/components/shared.tsx"),
    ALPHA_SHARED,
  )
})

test("verify reports a shadowed shared file as informational, not an error", () => {
  const root = createFixture()
  install(root, "alpha")
  install(root, "beta")

  const report = verify(root)
  assert.equal(report.ok, true)

  const alpha = report.features.find((feature) => feature.name === "alpha")
  const shadowed = alpha?.issues.find((issue) => issue.code === "shadowed_file")
  assert.ok(shadowed, "alpha should report its shared file as shadowed")
  assert.equal(shadowed.severity, "info")
  assert.match(shadowed.message, /provided by "beta"/)
})

test("removing a feature restores the previous owner's version of a shared file", () => {
  const root = createFixture()
  install(root, "alpha")
  install(root, "beta")

  const report = remove(root, "beta")

  assert.equal(read(root, "apps/web/components/shared.tsx"), ALPHA_SHARED)
  assert.ok(report?.restoredFiles.some((file) => file.path === "apps/web/components/shared.tsx"))
  assert.ok(!existsSync(join(root, "apps/web/components/beta.tsx")))
  // alpha's own files survive untouched
  assert.ok(existsSync(join(root, "apps/web/components/alpha.tsx")))
  assert.equal(tracker(root).features.beta, undefined)

  // The react range beta bumped is restored, not deleted.
  const deps = pkg(root).dependencies as Record<string, string>
  assert.equal(deps.react, "^19.0.0")
  assert.deepEqual(report?.restoredDeps, [
    { target: "apps/web", field: "dependencies", name: "react", range: "^19.0.0" },
  ])

  // beta's marker block is gone but alpha's remains.
  const sidebar = read(root, "apps/web/components/sidebar.tsx")
  assert.ok(!sidebar.includes("nav:beta:begin"))
  assert.ok(sidebar.includes("nav:alpha:begin"))
})

test("removing a feature restores a pre-existing file from its backup", () => {
  const root = createFixture()
  install(root, "delta")
  assert.equal(read(root, "apps/web/components/existing.tsx"), "DELTA\n")
  assert.deepEqual(tracker(root).features.delta?.backups, {
    "apps/web/components/existing.tsx": ".feature-manager/backups/delta/apps/web/components/existing.tsx",
  })

  const report = remove(root, "delta")

  assert.equal(read(root, "apps/web/components/existing.tsx"), "ORIGINAL\n")
  assert.deepEqual(report?.restoredFiles, [
    { path: "apps/web/components/existing.tsx", from: "backup" },
  ])
  assert.ok(!existsSync(join(root, ".feature-manager")))
})

test("warns when an install overwrites a file no installed feature owns", () => {
  const root = createFixture()
  const result = installFeature({ root, name: "delta" })
  assert.equal(result.ok, true)

  const warning = (result.ok ? result.plan.warnings : []).find((w) => w.type === "overwrite")
  assert.ok(warning, "overwriting a starter file should be surfaced")
  assert.match(warning.message, /not owned by an installed feature/)
  assert.match(warning.message, /backed up/)
})

test("--strict blocks an install that would overwrite an unowned file", () => {
  const root = createFixture()
  const strict = installFeature({ root, name: "delta", strict: true })

  assert.equal(strict.ok, false)
  assert.match(strict.ok === false ? strict.errors.join("\n") : "", /not owned by an installed feature/)
  assert.equal(read(root, "apps/web/components/existing.tsx"), "ORIGINAL\n")
  assert.equal(tracker(root).features.delta, undefined)
})

test("removing the last owner deletes the file and cleans up empty directories", () => {
  const root = createFixture()
  install(root, "alpha")
  install(root, "beta")
  remove(root, "beta")

  const report = remove(root, "alpha")

  assert.ok(report?.deletedFiles.includes("apps/web/components/alpha.tsx"))
  assert.ok(!existsSync(join(root, "apps/web/components/alpha.tsx")))
  assert.ok(!existsSync(join(root, "apps/web/components/shared.tsx")))
  assert.ok(!existsSync(join(root, "apps/web/content/docs/alpha.mdx")))

  // Nothing removed the pre-existing fixture files.
  assert.equal(read(root, "apps/web/components/existing.tsx"), "ORIGINAL\n")
  assert.ok(existsSync(join(root, "apps/web/content/docs/index.mdx")))

  const deps = pkg(root).dependencies as Record<string, string>
  assert.equal(deps["alpha-lib"], undefined)
  assert.equal(deps.react, "^19.0.0")

  assert.deepEqual(JSON.parse(read(root, "apps/web/content/docs/meta.json")).pages, ["index"])
  assert.ok(!read(root, "README.md").includes("**alpha**"))
  assert.equal(tracker(root).features.alpha, undefined)
  assert.ok(!existsSync(join(root, ".feature-manager")), "backup scratch space is cleaned up")
})

test("a failing install rolls the working tree back completely", () => {
  const root = createFixture()
  const before = snapshot(root)

  assert.throws(
    () => installFeature({ root, name: "gamma" }),
    (err: unknown) => {
      assert.ok(err instanceof Error)
      assert.match(err.message, /rolled back/)
      return true
    },
  )

  assert.deepEqual(snapshot(root), before, "every touched path must be restored")
  assert.equal(read(root, "apps/web/components/existing.tsx"), "ORIGINAL\n")
  assert.ok(!existsSync(join(root, "apps/web/components/gamma-new.tsx")))
  assert.equal(tracker(root).features.gamma, undefined)
})

test("rejects manifests that try to write outside the repository", () => {
  const root = createFixture()
  write(
    root,
    "features/evil/feature.json",
    `${JSON.stringify(
      {
        name: "evil",
        version: "1.0.0",
        description: "Escape attempt",
        copies: [{ from: "payload.ts", to: "../escaped.ts" }],
      },
      null,
      2,
    )}\n`,
  )
  write(root, "features/evil/payload.ts", "export const evil = 1\n")

  const result = installFeature({ root, name: "evil" })
  assert.equal(result.ok, false)
  assert.match(result.ok === false ? result.errors.join("\n") : "", /escapes its root/)
  assert.ok(!existsSync(join(root, "..", "escaped.ts")))
})

test("--force upgrades an installed feature and clears the version drift", () => {
  const root = createFixture()
  install(root, "alpha")

  write(
    root,
    "features/alpha/feature.json",
    read(root, "features/alpha/feature.json").replace('"version": "1.0.0"', '"version": "2.0.0"'),
  )

  const drifted = verify(root)
  const alpha = drifted.features.find((feature) => feature.name === "alpha")
  assert.ok(alpha?.upgradeAvailable)
  assert.ok(alpha?.issues.some((issue) => issue.code === "version_drift"))

  install(root, "alpha", { force: true })
  assert.equal(tracker(root).features.alpha?.version, "2.0.0")
  assert.equal(verify(root).features.find((feature) => feature.name === "alpha")?.upgradeAvailable, false)
})

test("keeps user-modified files on removal unless --force is given", () => {
  const root = createFixture()
  install(root, "alpha")

  write(root, "apps/web/components/alpha.tsx", "export const alpha = 'hand edited'\n")

  const report = remove(root, "alpha")
  assert.ok(existsSync(join(root, "apps/web/components/alpha.tsx")))
  assert.equal(read(root, "apps/web/components/alpha.tsx"), "export const alpha = 'hand edited'\n")
  assert.ok(report?.keptFiles.some((file) => file.path === "apps/web/components/alpha.tsx"))
  assert.ok(report?.warnings.some((warning) => warning.type === "user_modified"))
})

test("--force deletes a user-modified file that the feature created", () => {
  const root = createFixture()
  install(root, "alpha")
  write(root, "apps/web/components/alpha.tsx", "export const alpha = 'hand edited'\n")

  remove(root, "alpha", { force: true })

  assert.ok(!existsSync(join(root, "apps/web/components/alpha.tsx")))
  assert.equal(tracker(root).features.alpha, undefined)
})

test("refuses to remove a feature another installed feature depends on", () => {
  const root = createFixture()
  install(root, "alpha")
  install(root, "beta")

  const result = removeFeature({ root, name: "alpha" })
  assert.equal(result.ok, false)
  assert.match(result.ok === false ? result.errors.join("\n") : "", /"beta" requires it/)
})

test("refuses to remove a feature that is not installed", () => {
  const root = createFixture()
  const result = removeFeature({ root, name: "alpha" })
  assert.equal(result.ok, false)
  assert.match(result.ok === false ? result.errors.join("\n") : "", /is not installed/)
})

test("a feature whose marker region is missing installs with a warning instead of failing", () => {
  const root = createFixture()
  write(root, "apps/web/components/plain.tsx", "export const plain = 1\n")
  write(
    root,
    "features/partial/feature.json",
    `${JSON.stringify(
      {
        name: "partial",
        version: "1.0.0",
        description: "Partially installable",
        copies: [{ from: "plain.tsx", to: "apps/web/components/partial.tsx" }],
        insertions: [
          { file: "apps/web/components/plain.tsx", marker: "nav", snippet: "snippet.ts" },
        ],
      },
      null,
      2,
    )}\n`,
  )
  write(root, "features/partial/plain.tsx", "export const partial = 1\n")
  write(root, "features/partial/snippet.ts", "// snippet")

  const result = installFeature({ root, name: "partial" })
  assert.equal(result.ok, true)
  const report = result.ok ? result.plan : undefined

  assert.ok(existsSync(join(root, "apps/web/components/partial.tsx")))
  assert.equal(read(root, "apps/web/components/plain.tsx"), "export const plain = 1\n")
  assert.ok(report?.warnings.some((warning) => warning.type === "missing_marker"))
  assert.ok(tracker(root).features.partial, "the feature is still recorded as installed")
})

test("--strict escalates warnings into a blocking error", () => {
  const root = createFixture()
  write(root, "apps/web/components/plain.tsx", "export const plain = 1\n")
  write(
    root,
    "features/partial/feature.json",
    `${JSON.stringify(
      {
        name: "partial",
        version: "1.0.0",
        description: "Partially installable",
        insertions: [
          { file: "apps/web/components/plain.tsx", marker: "nav", snippet: "snippet.ts" },
        ],
      },
      null,
      2,
    )}\n`,
  )
  write(root, "features/partial/snippet.ts", "// snippet")

  const result = installFeature({ root, name: "partial", strict: true })
  assert.equal(result.ok, false)
  assert.match(result.ok === false ? result.errors.join("\n") : "", /Marker region "nav" not found/)
})

test("reinstalling with --force is idempotent for files and marker blocks", () => {
  const root = createFixture()
  install(root, "alpha")
  const first = snapshot(root)

  install(root, "alpha", { force: true })
  const second = snapshot(root)

  for (const [file, content] of first) {
    if (file === "features.json") continue
    assert.equal(second.get(file), content, `${file} changed on reinstall`)
  }
  const sidebar = second.get("apps/web/components/sidebar.tsx") ?? ""
  assert.equal(sidebar.split("feature-manager:nav:alpha:begin").length - 1, 1, "no duplicate blocks")
})

test("the backup scratch directory is never left behind when unused", () => {
  const root = createFixture()
  install(root, "alpha")
  assert.ok(!existsSync(join(root, ".feature-manager")))
})
