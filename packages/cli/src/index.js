#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { basename, join, resolve } from "node:path"
import readline from "node:readline/promises"

const DEFAULT_REPO = "https://github.com/dev-celestia/celestia-starter.git"
const TEMPLATES = ["web", "desktop"]

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
    const manifestPath = join(root, "features", entry.name, "feature.json")
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

function toKebab(name) {
  const kebab = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return kebab || "celestia-app"
}

function toSnake(name) {
  return toKebab(name).replace(/-/g, "_")
}

function parseArgs(argv) {
  const flags = { repo: DEFAULT_REPO }
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--features") flags.features = argv[++i]
    else if (argv[i] === "--repo") flags.repo = argv[++i]
    else if (argv[i] === "--template" || argv[i] === "-t") flags.template = argv[++i]
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
  -t, --template <name>  ${TEMPLATES.join(" | ")} (default: prompt, or web when non-interactive)
  --features <a,b>       Web only — features to install (skips prompts, deps auto-included)
  --repo <url|path>      Template repository to clone (default: ${DEFAULT_REPO})
  -h, --help             Show this help

${bold("Examples:")}
  npx @celestia-project/create my-app
  npx @celestia-project/create my-app --template web --features auth,dashboard
  npx @celestia-project/create my-desktop --template desktop
`)
}

async function pickTemplate(explicit) {
  if (explicit) {
    const name = explicit.toLowerCase()
    if (!TEMPLATES.includes(name)) {
      throw new Error(`unknown template "${explicit}" (available: ${TEMPLATES.join(", ")})`)
    }
    return name
  }
  if (!isTTY) return "web"

  console.log("\nWhich template?")
  console.log(`  ${bold("1.")} web     ${dim("Next.js · Hono · Better Auth · Drizzle monorepo")}`)
  console.log(`  ${bold("2.")} desktop ${dim("Native GPUI app from celestia-ui starter")}`)
  const answer = await ask(`${bold("?")} Template`, "1")
  if (answer === "2" || /^desktop$/i.test(answer)) return "desktop"
  if (answer === "1" || /^web$/i.test(answer)) return "web"
  throw new Error(`unknown template "${answer}" (pick 1/web or 2/desktop)`)
}

function requireTools(tools) {
  for (const tool of tools) {
    if (spawnSync(tool, ["--version"], { stdio: "ignore" }).status !== 0) {
      console.error(red(`✗ "${tool}" is required but was not found on PATH.`))
      process.exit(1)
    }
  }
}

async function resolveProjectDir(flags, fallback) {
  const dir = flags.dir ?? (await ask(`${bold("?")} Project name`, fallback))
  if (!dir) {
    console.error(red("✗ No project name given."))
    process.exit(1)
  }
  const root = resolve(dir)
  if (existsSync(root) && readdirSync(root).length > 0) {
    console.error(red(`✗ "${dir}" already exists and is not empty.`))
    process.exit(1)
  }
  return { dir, root }
}

async function maybeInitGit(root, message) {
  if (!(await confirm("Initialize a git repository?"))) return
  run("git", ["init", "--quiet"], root)
  run("git", ["add", "-A"], root)
  try {
    run("git", ["commit", "--quiet", "-m", message], root)
  } catch {
    console.log(yellow("⚠ Initial commit skipped — set git user.name/user.email and commit manually."))
  }
}

/** Remote URL → shallow clone. Local path → copy working tree (so uncommitted template edits are usable). */
function materializeTemplate(repo, dest) {
  const local = resolve(repo)
  if (existsSync(local) && readdirSync(local).length > 0) {
    console.log(`\nCopying template from ${local} ...`)
    mkdirSync(dest, { recursive: true })
    for (const entry of readdirSync(local, { withFileTypes: true })) {
      if ([".git", "node_modules", "target", ".turbo", "dist", ".next"].includes(entry.name)) {
        continue
      }
      // Desktop Cargo build artifacts sit under packages/desktop/target.
      if (entry.name === "packages") {
        mkdirSync(join(dest, "packages"), { recursive: true })
        for (const pkg of readdirSync(join(local, "packages"), { withFileTypes: true })) {
          if (pkg.name === "desktop") {
            // Skip packages/desktop/target — copied crate-by-crate below would still pick it up;
            // copy the desktop tree with target filtered.
            copyDesktopTree(join(local, "packages", "desktop"), join(dest, "packages", "desktop"))
            continue
          }
          cpSync(join(local, "packages", pkg.name), join(dest, "packages", pkg.name), {
            recursive: true,
            filter: (src) => !src.includes(`${join("node_modules")}`) && !src.includes(`${join(".next")}`),
          })
        }
        continue
      }
      cpSync(join(local, entry.name), join(dest, entry.name), { recursive: true })
    }
    return
  }

  console.log(`\nCloning template from ${repo} ...`)
  run("git", ["clone", "--quiet", "--depth", "1", repo, dest])
  rmSync(join(dest, ".git"), { recursive: true, force: true })
}

function copyDesktopTree(from, to) {
  mkdirSync(to, { recursive: true })
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (entry.name === "target") continue
    cpSync(join(from, entry.name), join(to, entry.name), { recursive: true })
  }
}

/** Scaffold the full web monorepo (existing behaviour). */
async function scaffoldWeb(root, dir, flags) {
  requireTools(["git", "pnpm"])
  materializeTemplate(flags.repo, root)

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

  await maybeInitGit(root, "chore: scaffold celestia-starter")

  console.log(`
${green("✅ Ready to go!")}

  ${bold(`cd ${dir}`)}
  ${bold("pnpm dev")}

  web  ${dim("→ http://localhost:3000")}
  api  ${dim("→ http://localhost:4000")}
`)
}

/**
 * Scaffold a standalone Celestia Desktop (GPUI) Cargo workspace from
 * packages/desktop — keeps celestia-ui + the starter app, drops the gallery.
 */
async function scaffoldDesktop(root, dir, flags) {
  requireTools(["git"])

  const projectName = basename(dir)
  const pkg = toKebab(projectName)
  const snake = toSnake(projectName)
  const title = projectName
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const tmp = `${root}.__celestia_tmp`
  if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true })

  try {
    const local = resolve(flags.repo)
    let desktopSrc
    if (existsSync(local) && existsSync(join(local, "packages", "desktop"))) {
      // Fast path: copy only packages/desktop from a local checkout (working tree).
      console.log(`\nCopying desktop template from ${local}/packages/desktop ...`)
      desktopSrc = join(tmp, "packages", "desktop")
      copyDesktopTree(join(local, "packages", "desktop"), desktopSrc)
    } else {
      materializeTemplate(flags.repo, tmp)
      desktopSrc = join(tmp, "packages", "desktop")
    }

    if (!existsSync(desktopSrc)) {
      throw new Error(`template has no packages/desktop — is --repo pointing at celestia-starter?`)
    }

    mkdirSync(root, { recursive: true })
    for (const entry of readdirSync(desktopSrc)) {
      if (entry === "target") continue
      cpSync(join(desktopSrc, entry), join(root, entry), { recursive: true })
    }

    // Drop the component gallery — starters only need the library + app binary.
    const showcase = join(root, "crates", "showcase")
    if (existsSync(showcase)) rmSync(showcase, { recursive: true, force: true })

    const starterDir = join(root, "crates", "starter")
    const appDir = join(root, "crates", "app")
    if (!existsSync(starterDir)) {
      throw new Error("packages/desktop/crates/starter is missing from the template")
    }
    renameSync(starterDir, appDir)

    // Workspace members: ui + app only.
    const workspaceToml = join(root, "Cargo.toml")
    let workspace = readFileSync(workspaceToml, "utf-8")
    workspace = workspace.replace(
      /members\s*=\s*\[[^\]]*\]/,
      'members = ["crates/ui", "crates/app"]',
    )
    writeFileSync(workspaceToml, workspace)

    // Rename the app package / binary.
    const appTomlPath = join(appDir, "Cargo.toml")
    let appToml = readFileSync(appTomlPath, "utf-8")
    appToml = appToml
      .replace(/name = "celestia-desktop-starter"/g, `name = "${pkg}"`)
      .replace(
        /description = "[^"]*"/,
        `description = "${title} — Celestia Desktop (GPUI) app"`,
      )
    writeFileSync(appTomlPath, appToml)

    // Patch bootstrap + UI copy so the scaffolded app feels owned.
    const replaceIn = (rel, pairs) => {
      const path = join(appDir, rel)
      let src = readFileSync(path, "utf-8")
      for (const [from, to] of pairs) src = src.split(from).join(to)
      writeFileSync(path, src)
    }

    replaceIn("src/actions.rs", [["celestia_desktop_starter", snake]])
    replaceIn("src/main.rs", [
      ["celestia-desktop-starter", pkg],
      ["Celestia Starter", title],
      ["pnpm desktop:starter", `cargo run -p ${pkg}`],
      [
        "cargo run --manifest-path packages/desktop/Cargo.toml -p " + pkg,
        `cargo run -p ${pkg}`,
      ],
    ])
    replaceIn("src/app.rs", [
      ["celestia-desktop-starter", pkg],
      ["Celestia Starter", title],
      ['child("My App")', `child("${title}")`],
    ])

    writeFileSync(
      join(root, "README.md"),
      `# ${title}

Native desktop app scaffolded with [\`@celestia-project/create\`](https://www.npmjs.com/package/@celestia-project/create) (\`--template desktop\`).

Built on [GPUI](https://gpui.rs) + \`celestia-ui\` (Celestia tokens and components).

## Requirements

- Rust ≥ 1.97 (edition 2024)
- macOS: no extra toolchain
- Linux: Vulkan + Wayland/X11/fontconfig headers
- Windows: MSVC

## Run

\`\`\`bash
cargo run -p ${pkg}
\`\`\`

⌘D / Ctrl+D toggles light ↔ dark.

## Layout

\`\`\`
crates/
├─ ui   # celestia-ui — reusable GPUI components + theme
└─ app  # your window (edit src/app.rs)
\`\`\`

Keep the bootstrap order in \`crates/app/src/main.rs\` (\`CelestiaAssets\` → \`celestia_ui::init\` → \`Root\`). Replace the Home / About pages in \`app.rs\` with your screens.
`,
    )

    // Drop monorepo-oriented desktop README if present — replaced above.
    // (We already wrote root README.md.)
  } finally {
    if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true })
  }

  if (spawnSync("cargo", ["--version"], { stdio: "ignore" }).status === 0) {
    console.log("\nFetching Rust dependencies (cargo check) ...")
    try {
      run("cargo", ["check", "-p", pkg], root)
    } catch {
      console.log(yellow("⚠ cargo check failed — run it once Rust ≥ 1.97 is installed."))
    }
  } else {
    console.log(yellow("\n⚠ cargo not found on PATH — install Rust ≥ 1.97, then run cargo check."))
  }

  await maybeInitGit(root, `chore: scaffold ${pkg}`)

  console.log(`
${green("✅ Ready to go!")}

  ${bold(`cd ${dir}`)}
  ${bold(`cargo run -p ${pkg}`)}

  Edit ${dim("crates/app/src/app.rs")} to build your UI.
`)
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))
  if (flags.help) return printHelp()

  console.log(`\n${bold("✨ celestia-starter")} ${dim("— scaffold a Celestia project")}\n`)

  const template = await pickTemplate(flags.template)
  const fallback = template === "desktop" ? "celestia-desktop" : "celestia-starter"
  const { dir, root } = await resolveProjectDir(flags, fallback)

  if (template === "desktop") {
    if (flags.features !== undefined) {
      console.log(yellow("⚠ --features is web-only; ignoring for the desktop template."))
    }
    await scaffoldDesktop(root, dir, flags)
    return
  }

  await scaffoldWeb(root, dir, flags)
}

main().catch((err) => {
  console.error(red(`✗ ${err.message}`))
  process.exit(1)
})
