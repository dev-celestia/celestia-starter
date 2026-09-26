import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { after, test } from "node:test"

import { discoverFeatures, normalizeManifest, validateManifest } from "../src/manifest.js"
import type { FeatureManifest } from "../src/types.js"

const roots: string[] = []

after(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

function write(root: string, rel: string, content: string): void {
  const abs = join(root, rel)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content)
}

/** A minimal valid repo to validate manifests against. */
function createRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "fm-manifest-"))
  roots.push(root)
  write(root, "features.json", '{\n  "features": {}\n}\n')
  write(root, "apps/web/package.json", '{ "name": "web" }\n')
  write(root, "apps/web/content/docs/meta.json", '{ "pages": ["index"] }\n')
  write(root, "apps/web/components/sidebar.tsx", "// feature-manager:nav:begin\n// feature-manager:nav:end\n")
  write(root, "packages/feature-manager/features/alpha/feature.json", '{ "name": "alpha", "version": "1.0.0", "description": "A" }\n')
  write(root, "packages/feature-manager/features/alpha/template.ts", "export const a = 1\n")
  write(root, "packages/feature-manager/features/alpha/snippet.ts", "// snippet\n")
  return root
}

function validate(root: string, raw: FeatureManifest, featureDir = join(root, "packages/feature-manager/features/alpha")) {
  return validateManifest(raw, normalizeManifest(raw), {
    root,
    featureDir,
    // "alpha" and "beta" exist as features; only "beta" is installed.
    available: new Set(["alpha", "beta", "gamma"]),
    installed: new Set(["beta"]),
  })
}

test("normalizes the legacy web-relative files map into copies", () => {
  const manifest = normalizeManifest({
    name: "alpha",
    version: "1.0.0",
    description: "A",
    files: { "web/components/x.tsx": "components/x.tsx" },
  })
  assert.deepEqual(manifest.copies, [
    { from: "web/components/x.tsx", to: "apps/web/components/x.tsx" },
  ])
})

test("normalizes legacy flat dependencies and env onto apps/web", () => {
  const manifest = normalizeManifest({
    name: "alpha",
    version: "1.0.0",
    description: "A",
    dependencies: { react: "^19.0.0" },
    devDependencies: { vitest: "^3.0.0" },
    env: ["ALPHA_KEY=change-me"],
  })
  assert.deepEqual(manifest.dependencies, { "apps/web": { react: "^19.0.0" } })
  assert.deepEqual(manifest.devDependencies, { "apps/web": { vitest: "^3.0.0" } })
  assert.deepEqual(manifest.env, { "apps/web": ["ALPHA_KEY=change-me"] })
})

test("keeps target-keyed dependency and env maps as written", () => {
  const manifest = normalizeManifest({
    name: "alpha",
    version: "1.0.0",
    description: "A",
    dependencies: { "apps/api": { hono: "^4.0.0" } },
    env: { "apps/api": ["PORT=4000"] },
  })
  assert.deepEqual(manifest.dependencies, { "apps/api": { hono: "^4.0.0" } })
  assert.deepEqual(manifest.env, { "apps/api": ["PORT=4000"] })
})

test("normalizes repo-relative paths to forward slashes", () => {
  const manifest = normalizeManifest({
    name: "alpha",
    version: "1.0.0",
    description: "A",
    copies: [{ from: "./template.ts", to: "./apps/web/x.ts/" }],
    insertions: [{ file: "./apps/web/y.ts", marker: " nav ", snippet: "./snippet.ts" }],
  })
  assert.deepEqual(manifest.copies, [{ from: "template.ts", to: "apps/web/x.ts" }])
  assert.equal(manifest.insertions[0]?.file, "apps/web/y.ts")
  assert.equal(manifest.insertions[0]?.marker, "nav")
})

test("merges legacy files with modern copies", () => {
  const manifest = normalizeManifest({
    name: "alpha",
    version: "1.0.0",
    description: "A",
    copies: [{ from: "a.ts", to: "apps/api/a.ts" }],
    files: { "b.ts": "b.ts" },
  })
  assert.deepEqual(manifest.copies, [
    { from: "a.ts", to: "apps/api/a.ts" },
    { from: "b.ts", to: "apps/web/b.ts" },
  ])
})

test("accepts a well-formed manifest", () => {
  const root = createRepo()
  const raw: FeatureManifest = {
    name: "alpha",
    version: "1.0.0",
    description: "Alpha",
    requires: ["beta"],
    copies: [{ from: "template.ts", to: "apps/web/components/alpha.ts" }],
    insertions: [{ file: "apps/web/components/sidebar.tsx", marker: "nav", snippet: "snippet.ts" }],
    jsonAppends: [{ file: "apps/web/content/docs/meta.json", path: "pages", value: "alpha" }],
    dependencies: { "apps/web": { "alpha-lib": "^1.0.0" } },
    env: { "apps/web": ["ALPHA_KEY=change-me"] },
  }
  const result = validate(root, raw)
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.warnings, [])
})

test("rejects a copy target that escapes the repository", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    copies: [{ from: "template.ts", to: "../evil.ts" }],
  })
  assert.equal(result.errors.length, 1)
  assert.match(result.errors[0] ?? "", /escapes its root/)
})

test("rejects absolute paths", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    copies: [{ from: "template.ts", to: "/tmp/evil.ts" }],
  })
  assert.match(result.errors.join("\n"), /must be relative/)
})

test("rejects an insertion target outside the repo", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    insertions: [{ file: "../../.bashrc", marker: "nav", snippet: "snippet.ts" }],
  })
  assert.match(result.errors.join("\n"), /escapes its root/)
})

test("rejects an invalid marker name", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    insertions: [{ file: "apps/web/components/sidebar.tsx", marker: "nav/../x", snippet: "snippet.ts" }],
  })
  assert.match(result.errors.join("\n"), /Invalid marker/)
})

test("rejects duplicate copy targets and duplicate insertions", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    copies: [
      { from: "template.ts", to: "apps/web/components/alpha.ts" },
      { from: "template.ts", to: "apps/web/components/alpha.ts" },
    ],
    insertions: [
      { file: "apps/web/components/sidebar.tsx", marker: "nav", snippet: "snippet.ts" },
      { file: "apps/web/components/sidebar.tsx", marker: "nav", snippet: "snippet.ts" },
    ],
  })
  assert.match(result.errors.join("\n"), /Duplicate copy target/)
  assert.match(result.errors.join("\n"), /Duplicate insertion/)
})

test("rejects a self-referencing requires entry", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    requires: ["alpha"],
  })
  assert.match(result.errors.join("\n"), /cannot list itself/)
})

test("rejects a prerequisite that is not a feature at all", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    requires: ["nope"],
  })
  assert.match(result.errors.join("\n"), /not a feature in packages\/feature-manager\/features\//)
})

test("warns (but does not fail) on a prerequisite that is merely not installed", () => {
  const root = createRepo()
  // "gamma" exists in features dir but is not installed.
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    requires: ["gamma"],
  })
  assert.deepEqual(result.errors, [])
  assert.match(result.warnings.join("\n"), /Requires "gamma", which is not installed yet/)
})

test("warns about missing template files instead of failing", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    copies: [{ from: "does-not-exist.ts", to: "apps/web/components/x.ts" }],
  })
  assert.deepEqual(result.errors, [])
  assert.match(result.warnings.join("\n"), /Template file not found/)
})

test("leaves marker-region presence to the installer, so validation stays silent", () => {
  // The installer turns a missing region into a warning (and an AI prompt) at
  // plan time; validation deliberately does not duplicate that check.
  const root = createRepo()
  write(root, "apps/web/components/plain.tsx", "export const x = 1\n")
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    insertions: [{ file: "apps/web/components/plain.tsx", marker: "nav", snippet: "snippet.ts" }],
  })
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.warnings, [])
})

test("warns when a jsonAppends path is not an array", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    jsonAppends: [{ file: "apps/web/content/docs/meta.json", path: "nope", value: "alpha" }],
  })
  assert.deepEqual(result.errors, [])
  assert.match(result.warnings.join("\n"), /is not an array/)
})

test("warns about unknown manifest keys and non-semver versions", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "next",
    description: "A",
    copys: [],
  } as unknown as FeatureManifest)
  assert.match(result.warnings.join("\n"), /Unknown manifest key "copys"/)
  assert.match(result.warnings.join("\n"), /does not look like semver/)
})

test("warns when a dependency target has no package.json", () => {
  const root = createRepo()
  const result = validate(root, {
    name: "alpha",
    version: "1.0.0",
    description: "A",
    dependencies: { "apps/ghost": { x: "^1.0.0" } },
  })
  assert.deepEqual(result.errors, [])
  assert.match(result.warnings.join("\n"), /has no package.json/)
})

test("discovers features and reports unreadable manifests without throwing", () => {
  const root = createRepo()
  write(root, "packages/feature-manager/features/broken/feature.json", "{ not json")
  write(root, "packages/feature-manager/features/empty/README.md", "no manifest here")

  const discovered = discoverFeatures(join(root, "packages/feature-manager/features"))
  assert.deepEqual(
    discovered.map((feature) => feature.name),
    ["alpha", "broken"],
  )
  const broken = discovered.find((feature) => feature.name === "broken")
  assert.ok(broken?.error)
  assert.match(broken.error, /not valid JSON/)
})
