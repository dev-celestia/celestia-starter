#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import readline from "node:readline/promises"

const DEFAULT_REPO = "https://github.com/dev-celestia/celestia-starter.git"

const isTTY = Boolean(process.stdin.isTTY && process.stdout.isTTY)
const useColor = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (code) => (text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : String(text))
const bold = paint("1")
const dim = paint("2")
const green = paint("32")
const yellow = paint("33")
const red = paint("31")

function run(cmd, args, cwd, env) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    ...(env ? { env: { ...process.env, ...env } } : {}),
  })
  if (result.status !== 0) throw new Error(`command failed: ${cmd} ${args.join(" ")}`)
}

async function ask(question, def) {
  if (!isTTY) return def
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = (await rl.question(`${question}${def ? dim(` (${def})`) : ""} `)).trim()
    return answer || def
  } finally {
    rl.close()
  }
}

async function confirm(question, def = true) {
  const answer = await ask(`${question} ${dim(def ? "[Y/n]" : "[y/N]")}`)
  // Non-TTY: ask() returns the default (boolean) unchanged.
  if (typeof answer !== "string" || !answer) return def
  return /^y(es)?$/i.test(answer)
}

/** Reads every features/<name>/feature.json manifest from the cloned template. */
function loadFeatures(root) {
  const dir = join(root, "features")
  const features = {}
  if (!existsSync(dir)) return features
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const manifestPath = join(dir, entry.name, "feature.json")
    if (!entry.isDirectory() || !existsSync(manifestPath)) continue
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"))
    features[entry.name] = {
      id: entry.name,
      description: manifest.description ?? "",
      requires: manifest.requires ?? [],
      postInstall: manifest.postInstall ?? [],
    }
  }
  return features
}

/** Dependencies first — the order in which features can be added. */
function topoSort(features) {
  const sorted = []
  const done = new Set()
  const visit = (feature, trail) => {
    if (done.has(feature.id)) return
    if (trail.has(feature.id)) throw new Error(`circular "requires" between features at ${feature.id}`)
    trail.add(feature.id)
    for (const req of feature.requires) if (features[req]) visit(features[req], trail)
    done.add(feature.id)
    sorted.push(feature)
  }
  for (const feature of Object.values(features)) visit(feature, new Set())
  return sorted
}

async function selectFeatures(features, explicit) {
  const order = topoSort(features)
  const selected = new Set()
  const select = (feature) => {
    if (selected.has(feature.id)) return
    for (const req of feature.requires) if (features[req]) select(features[req])
    selected.add(feature.id)
  }

  // Non-interactive: --features auth,blog (dependencies are pulled in automatically).
  if (explicit !== undefined) {
    for (const id of explicit.split(",").map((s) => s.trim()).filter(Boolean)) {
      if (!features[id]) throw new Error(`unknown feature "${id}" (available: ${Object.keys(features).join(", ")})`)
      select(features[id])
    }
    return selected
  }

  if (!isTTY) {
    console.log(dim("Non-interactive terminal detected — installing all features (use --features to choose)."))
    for (const feature of order) select(feature)
    return selected
  }

  console.log("\nWhich features do you need?")
  for (const feature of order) {
    const missing = feature.requires.filter((req) => !selected.has(req))
    if (missing.length) {
      console.log(`${dim("-")} ${feature.id} ${dim(`skipped (requires ${missing.join(", ")})`)}`)
      continue
    }
    if (await confirm(`Add ${bold(feature.id)}? ${dim(feature.description)}`)) select(feature)
  }
  return selected
}

async function writeEnvFiles(root, selected) {
  const apiEnv = join(root, "apps", "api", ".env")
  const webEnv = join(root, "apps", "web", ".env")
  let databaseUrl

  if (!existsSync(apiEnv)) {
    let content = "# Server\nPORT=4000\n"
    if (selected.has("auth")) {
      databaseUrl = await ask(
        `${bold("?")} DATABASE_URL`,
        "postgresql://postgres:postgres@localhost:5432/celestia",
      )
      content += `
# Better Auth (the frontend proxies /api/* to this backend, so the public url is the frontend)
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=${randomBytes(32).toString("base64")}

# Database
DATABASE_URL=${databaseUrl}

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
`
    }
    writeFileSync(apiEnv, content)
    console.log(`  ${green("+")} apps/api/.env`)
  }

  if (!existsSync(webEnv)) {
    writeFileSync(webEnv, "# Backend API url (proxied via next.config.ts)\nNEXT_PUBLIC_API_URL=http://localhost:4000\n")
    console.log(`  ${green("+")} apps/web/.env`)
  }

  return databaseUrl
}

function parseArgs(argv) {
  const flags = { repo: DEFAULT_REPO }
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--features") flags.features = argv[++i]
    else if (argv[i] === "--repo") flags.repo = argv[++i]
    else if (argv[i] === "--help" || argv[i] === "-h") flags.help = true
    else rest.push(argv[i])
  }
  flags.dir = rest[0]
  return flags
}

function printHelp() {
  console.log(`
${bold("@celestia-project/create")} — scaffold a new project

${bold("Usage:")}
  npx @celestia-project/create [dir] [options]
  npx celestia-starter [dir] [options]
  npm create celestia-project@latest [dir] [options]

${bold("Options:")}
  --features <a,b>   Comma-separated features to install (skips prompts, dependencies auto-included)
  --repo <url|path>  Template repository to clone (default: ${DEFAULT_REPO})
  -h, --help         Show this help
`)
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))
  if (flags.help) return printHelp()

  console.log(`\n${bold("✨ celestia-starter")} ${dim("— Next.js · Hono · Better Auth · Drizzle monorepo")}\n`)

  for (const tool of ["git", "pnpm"]) {
    if (spawnSync(tool, ["--version"], { stdio: "ignore" }).status !== 0) {
      console.error(red(`✗ "${tool}" is required but was not found on PATH.`))
      process.exit(1)
    }
  }

  const dir = flags.dir ?? (await ask(`${bold("?")} Project name`, "celestia-starter"))
  if (!dir) {
    console.error(red("✗ No project name given."))
    process.exit(1)
  }
  const root = resolve(dir)
  if (existsSync(root) && readdirSync(root).length > 0) {
    console.error(red(`✗ "${dir}" already exists and is not empty.`))
    process.exit(1)
  }

  console.log(`\nCloning template from ${flags.repo} ...`)
  run("git", ["clone", "--quiet", "--depth", "1", flags.repo, root])
  rmSync(join(root, ".git"), { recursive: true, force: true })

  const features = loadFeatures(root)
  const selected = Object.keys(features).length
    ? await selectFeatures(features, flags.features)
    : new Set()
  const order = topoSort(features)

  console.log("\nInstalling dependencies (pnpm install) ...")
  run("pnpm", ["install"], root)

  // Reconcile what the template ships with the user's selection,
  // reusing the template's own feature-manager scripts. Removals go in
  // reverse dependency order so nothing is removed while still required.
  const trackerPath = join(root, "features.json")
  const tracker = existsSync(trackerPath)
    ? JSON.parse(readFileSync(trackerPath, "utf-8"))
    : { features: {} }
  let changed = false
  for (const feature of [...order].reverse()) {
    if (tracker.features[feature.id] && !selected.has(feature.id)) {
      console.log(`\nRemoving feature: ${feature.id}`)
      run("pnpm", ["remove-feature", feature.id], root)
      changed = true
    }
  }
  for (const feature of order) {
    if (selected.has(feature.id) && !tracker.features[feature.id]) {
      console.log(`\nAdding feature: ${feature.id}`)
      run("pnpm", ["add-feature", feature.id], root)
      changed = true
    }
  }
  if (changed) run("pnpm", ["install"], root)

  const databaseUrl = await writeEnvFiles(root, selected)

  const postInstall = [...new Set(order.filter((f) => selected.has(f.id)).flatMap((f) => f.postInstall))]
  for (const cmd of postInstall) {
    if (await confirm(`Run ${bold(cmd)}? ${dim("(requires a running PostgreSQL)")}`)) {
      const [bin, ...args] = cmd.split(/\s+/)
      try {
        // drizzle-kit does not read apps/api/.env, so pass the url explicitly.
        run(bin, args, root, databaseUrl ? { DATABASE_URL: databaseUrl } : undefined)
      } catch {
        console.log(yellow(`⚠ "${cmd}" failed — run it later once your database is up.`))
      }
    }
  }

  if (await confirm("Initialize a git repository?")) {
    run("git", ["init", "--quiet"], root)
    run("git", ["add", "-A"], root)
    try {
      run("git", ["commit", "--quiet", "-m", "chore: scaffold celestia-starter"], root)
    } catch {
      console.log(yellow("⚠ Initial commit skipped — set git user.name/user.email and commit manually."))
    }
  }

  console.log(`
${green("✅ Ready to go!")}

  ${bold(`cd ${dir}`)}
  ${bold("pnpm dev")}

  web  ${dim("→ http://localhost:3000")}
  api  ${dim("→ http://localhost:4000")}
`)
}

main().catch((err) => {
  console.error(red(`✗ ${err.message}`))
  process.exit(1)
})
