import assert from "node:assert/strict"
import { test } from "node:test"

import {
  appendToJsonArray,
  hasRegion,
  insertIntoRegion,
  insertIntoRegionDetailed,
  isValidMarker,
  listAvailableMarkers,
  listRegionFeatures,
  MarkerError,
  removeFromJsonArray,
  removeFromRegion,
  unwrapSentinel,
} from "../src/markers.js"

const TS_FILE = "apps/web/components/sidebar.tsx"
const MD_FILE = "README.md"
const MDX_FILE = "apps/web/content/docs/index.mdx"
const CSS_FILE = "apps/web/app/globals.css"
const YAML_FILE = ".github/workflows/ci.yml"
const JSON_FILE = "apps/web/content/docs/meta.json"

const tsRegion = ["// feature-manager:nav:begin", "// feature-manager:nav:end"].join("\n")

test("inserts a per-feature block inside a // region", () => {
  const result = insertIntoRegionDetailed(tsRegion, "nav", "alpha", "{ label: 'A' },", TS_FILE)
  assert.equal(result.action, "inserted")
  assert.equal(result.changed, true)
  assert.deepEqual(result.content.split("\n"), [
    "// feature-manager:nav:begin",
    "// feature-manager:nav:alpha:begin",
    "{ label: 'A' },",
    "// feature-manager:nav:alpha:end",
    "// feature-manager:nav:end",
  ])
})

test("preserves the indentation of the region's end sentinel", () => {
  const content = ["const nav = [", "  // feature-manager:nav:begin", "  // feature-manager:nav:end", "]"].join(
    "\n",
  )
  const result = insertIntoRegion(content, "nav", "alpha", "    { href: '/a' },", TS_FILE)
  assert.ok(result.includes("  // feature-manager:nav:alpha:begin"))
  assert.ok(result.includes("  // feature-manager:nav:alpha:end"))
})

test("re-inserting an identical snippet is a no-op", () => {
  const once = insertIntoRegion(tsRegion, "nav", "alpha", "{ label: 'A' },", TS_FILE)
  const twice = insertIntoRegionDetailed(once, "nav", "alpha", "{ label: 'A' },", TS_FILE)
  assert.equal(twice.changed, false)
  assert.equal(twice.action, "unchanged")
  assert.equal(twice.content, once)
})

test("re-inserting a changed snippet replaces the block instead of duplicating it", () => {
  const once = insertIntoRegion(tsRegion, "nav", "alpha", "{ label: 'A' },", TS_FILE)
  const twice = insertIntoRegionDetailed(once, "nav", "alpha", "{ label: 'B' },", TS_FILE)
  assert.equal(twice.action, "replaced")
  assert.equal(twice.content.split("feature-manager:nav:alpha:begin").length - 1, 1)
  assert.ok(twice.content.includes("{ label: 'B' },"))
  assert.ok(!twice.content.includes("{ label: 'A' },"))
})

test("keeps other features' blocks intact when inserting", () => {
  const withAlpha = insertIntoRegion(tsRegion, "nav", "alpha", "{ a: 1 },", TS_FILE)
  const withBoth = insertIntoRegion(withAlpha, "nav", "beta", "{ b: 2 },", TS_FILE)
  assert.deepEqual(listRegionFeatures(withBoth, "nav"), ["alpha", "beta"])
})

test("removes only the requested feature's block", () => {
  const withAlpha = insertIntoRegion(tsRegion, "nav", "alpha", "{ a: 1 },", TS_FILE)
  const withBoth = insertIntoRegion(withAlpha, "nav", "beta", "{ b: 2 },", TS_FILE)
  const removed = removeFromRegion(withBoth, "nav", "alpha", TS_FILE)
  assert.deepEqual(listRegionFeatures(removed, "nav"), ["beta"])
  assert.ok(hasRegion(removed, "nav"))
  assert.ok(!removed.includes("{ a: 1 },"))
})

test("removing an absent block is a no-op", () => {
  const result = removeFromRegion(tsRegion, "nav", "ghost", TS_FILE)
  assert.equal(result, tsRegion)
})

test("writes the comment style matching each file type", () => {
  const md = insertIntoRegion("<!-- feature-manager:features:begin -->\n<!-- feature-manager:features:end -->", "features", "alpha", "- alpha", MD_FILE)
  assert.ok(md.includes("<!-- feature-manager:features:alpha:begin -->"))

  const mdx = insertIntoRegion(
    "{/* feature-manager:cards:begin */}\n{/* feature-manager:cards:end */}",
    "cards",
    "alpha",
    '<Card title="A" />',
    MDX_FILE,
  )
  assert.ok(mdx.includes("{/* feature-manager:cards:alpha:begin */}"))

  const css = insertIntoRegion("/* feature-manager:theme:begin */\n/* feature-manager:theme:end */", "theme", "alpha", ".a { color: red; }", CSS_FILE)
  assert.ok(css.includes("/* feature-manager:theme:alpha:begin */"))

  const yml = insertIntoRegion("# feature-manager:steps:begin\n# feature-manager:steps:end", "steps", "alpha", "- run: echo hi", YAML_FILE)
  assert.ok(yml.includes("# feature-manager:steps:alpha:begin"))
})

test("reads a sentinel regardless of the comment wrapper used", () => {
  assert.equal(unwrapSentinel("// feature-manager:nav:begin"), "feature-manager:nav:begin")
  assert.equal(unwrapSentinel("  # feature-manager:nav:begin"), "feature-manager:nav:begin")
  assert.equal(unwrapSentinel("<!-- feature-manager:nav:begin -->"), "feature-manager:nav:begin")
  assert.equal(unwrapSentinel("{/* feature-manager:nav:begin */}"), "feature-manager:nav:begin")
  assert.equal(unwrapSentinel("/* feature-manager:nav:begin */"), "feature-manager:nav:begin")
  assert.equal(unwrapSentinel("const x = 'feature-manager:nav:begin'"), undefined)
  assert.equal(unwrapSentinel(""), undefined)
})

test("ignores sentinel-looking text inside string literals", () => {
  const content = [
    'const sentinel = "feature-manager:nav:begin"',
    "// feature-manager:nav:begin",
    "// feature-manager:nav:end",
  ].join("\n")
  const result = insertIntoRegion(content, "nav", "alpha", "{ a: 1 },", TS_FILE)
  // The literal on line 1 must be left alone and the real region used.
  assert.ok(result.startsWith('const sentinel = "feature-manager:nav:begin"'))
  assert.deepEqual(listRegionFeatures(result, "nav"), ["alpha"])
})

test("bounds the block-end search to the region (regression)", () => {
  // A stray block-end sentinel appears *after* the region's end. The old
  // substring-based, unbounded search matched it and deleted the region's own
  // end sentinel, corrupting the file.
  const content = [
    "// feature-manager:nav:begin",
    "// feature-manager:nav:alpha:begin",
    "  { stale: true },",
    "// feature-manager:nav:end",
    "// feature-manager:nav:alpha:end",
  ].join("\n")

  const result = insertIntoRegion(content, "nav", "alpha", "{ fresh: true },", TS_FILE)
  const lines = result.split("\n")

  assert.ok(hasRegion(result, "nav"), "region end sentinel must survive")
  assert.ok(lines.includes("// feature-manager:nav:end"))
  assert.ok(
    lines.indexOf("// feature-manager:nav:end") > lines.indexOf("// feature-manager:nav:alpha:end"),
    "the region end sentinel must still follow the feature block",
  )
  assert.ok(result.includes("{ fresh: true },"))
  assert.ok(!result.includes("{ stale: true },"))
  assert.deepEqual(listRegionFeatures(result, "nav"), ["alpha"])
})

test("repairs an orphan begin sentinel", () => {
  const content = [
    "// feature-manager:nav:begin",
    "// feature-manager:nav:alpha:begin",
    "  { partial: true },",
    "// feature-manager:nav:end",
  ].join("\n")

  const result = insertIntoRegionDetailed(content, "nav", "alpha", "{ complete: true },", TS_FILE)
  assert.equal(result.action, "repaired")
  assert.equal(result.content.split("feature-manager:nav:alpha:begin").length - 1, 1)
  assert.equal(result.content.split("feature-manager:nav:alpha:end").length - 1, 1)
  assert.ok(!result.content.includes("{ partial: true },"))
})

test("throws an actionable error when the region is missing", () => {
  const content = ["// feature-manager:imports:begin", "// feature-manager:imports:end"].join("\n")
  assert.throws(
    () => insertIntoRegion(content, "nav", "alpha", "x", TS_FILE),
    (err: unknown) => {
      assert.ok(err instanceof MarkerError)
      assert.match(err.message, /Marker region "nav" not found/)
      assert.match(err.message, /Markers available in this file: "imports"/)
      return true
    },
  )
})

test("refuses comment markers in JSON files and points at jsonAppends", () => {
  assert.throws(
    () => insertIntoRegion("{}", "pages", "alpha", "x", JSON_FILE),
    (err: unknown) => {
      assert.ok(err instanceof MarkerError)
      assert.match(err.message, /cannot hold comment markers/)
      assert.match(err.message, /jsonAppends/)
      return true
    },
  )
})

test("rejects invalid marker names", () => {
  assert.equal(isValidMarker("nav"), true)
  assert.equal(isValidMarker("nav-visibility"), true)
  assert.equal(isValidMarker("nav_visibility"), false)
  assert.equal(isValidMarker("-nav"), false)
  assert.equal(isValidMarker("nav:end"), false)
  assert.throws(() => insertIntoRegion(tsRegion, "bad marker", "a", "x", TS_FILE), MarkerError)
})

test("lists available markers", () => {
  const content = [
    "// feature-manager:imports:begin",
    "// feature-manager:imports:alpha:begin",
    "import x from 'x'",
    "// feature-manager:imports:alpha:end",
    "// feature-manager:imports:end",
    "// feature-manager:nav:begin",
    "// feature-manager:nav:end",
  ].join("\n")
  assert.deepEqual(listAvailableMarkers(content), ["imports", "nav"])
})

test("json array helpers are pure and report whether they changed anything", () => {
  const data = { pages: ["index"] }
  assert.equal(appendToJsonArray(data, "pages", "alpha"), true)
  assert.deepEqual(data.pages, ["index", "alpha"])
  assert.equal(appendToJsonArray(data, "pages", "alpha"), false)
  assert.equal(removeFromJsonArray(data, "pages", "alpha"), true)
  assert.equal(removeFromJsonArray(data, "pages", "alpha"), false)
  assert.deepEqual(data.pages, ["index"])
  assert.throws(() => appendToJsonArray({ pages: {} }, "pages", "x"), MarkerError)
})
