#!/usr/bin/env tsx

import { addCommand } from "./add.js"
import { FLAGS, flagList, parseArgs } from "./args.js"
import { createContext, flag, type CliContext } from "./context.js"
import { listCommand } from "./list.js"
import { promptCommand } from "./prompt.js"
import { removeCommand } from "./remove.js"
import { verifyCommand } from "./verify.js"

const USAGE = `feature-manager — plugin system for celestia-starter

Usage:
  feature-manager add <name>       Install (or --force reinstall/upgrade) a feature
  feature-manager remove <name>    Uninstall a feature, restoring shared files
  feature-manager list             List available and installed features
  feature-manager verify [name]    Check installed features for drift or breakage
  feature-manager prompt <name>    Generate the AI verification prompt for a feature
  feature-manager help [command]   Show help for a command

Options:
${flagList()}

Exit codes:
  0  success
  1  the operation failed (validation error, missing feature, verify found problems)
  2  usage error (unknown command, unknown option, missing argument)

Examples:
  pnpm add-feature blog --dry-run       Preview an install without writing anything
  pnpm add-feature blog                 Install packages/feature-manager/features/blog
  pnpm add-feature blog --force         Reinstall or upgrade an installed feature
  pnpm remove-feature blog              Uninstall and restore shared files
  pnpm list-features                    Show the feature table
  pnpm verify-features                  Verify every installed feature
`

const COMMAND_HELP: Record<string, string> = {
  add: `feature-manager add <name>

Install packages/feature-manager/features/<name> into the workspace: copies files, inserts
snippet blocks into marker regions, appends JSON entries and merges dependencies.

Every path the command will touch is snapshotted first, so a failure rolls the
repository back instead of leaving a half-installed state.

Files that another feature already provides are backed up before being
overwritten; removing this feature later restores the previous version.

Options:
  -n, --dry-run   Show every planned action without writing anything
  -f, --force     Reinstall or upgrade an already-installed feature
      --strict    Treat warnings (missing markers, version conflicts) as errors
  -q, --quiet     Only print warnings, errors and the final result
  -j, --json      Emit a machine-readable JSON report
`,
  remove: `feature-manager remove <name>

Uninstall a feature: removes its marker blocks, JSON entries and dependencies,
and restores or deletes its copied files.

Files still provided by another installed feature are restored to that feature's
version rather than deleted. Files you edited after installing are kept unless
--force is given.

Options:
  -n, --dry-run   Show every planned action without writing anything
  -f, --force     Delete files even if they were modified after install
      --strict    Treat warnings as errors
  -q, --quiet     Only print warnings, errors and the final result
  -j, --json      Emit a machine-readable JSON report
`,
  list: `feature-manager list

List the features found in packages/feature-manager/features/ with their install status,
installed vs available version, and prerequisites.

Options:
  -j, --json      Emit the table as JSON
  -q, --quiet     Only print errors
`,
  verify: `feature-manager verify [name]

Check that installed features still match what they installed: copied files
present and unmodified, marker blocks wired up, JSON entries and dependencies in
place, and environment variables documented. Read-only.

Exits non-zero when any error-level problem is found.

Options:
  -j, --json      Emit the report as JSON
  -q, --quiet     Only print errors
`,
  prompt: `feature-manager prompt <name>

Generate .prompts/verify-<name>.md — a self-contained brief you can paste into an
AI coding tool to verify the feature against a customised repository. Does not
modify the repository.

Options:
  -j, --json      Emit a machine-readable result
`,
}

function printHelp(command?: string): void {
  const specific = command ? COMMAND_HELP[command] : undefined
  process.stdout.write(`${specific ?? USAGE}\n`)
}

function run(ctx: CliContext, command: string, positionals: string[]): number {
  const name = positionals[0]

  switch (command) {
    case "add":
      return addCommand(ctx, name)
    case "remove":
      return removeCommand(ctx, name)
    case "list":
      return listCommand(ctx)
    case "verify":
      return verifyCommand(ctx, name)
    case "prompt":
      return promptCommand(ctx, name)
    default:
      ctx.ui.error(`Unknown command "${command}".`)
      printHelp()
      return 2
  }
}

function main(argv: string[]): number {
  const parsed = parseArgs(argv)

  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) process.stderr.write(`✗ ${error}\n`)
    process.stderr.write("\nRun `feature-manager help` for usage.\n")
    return 2
  }

  if (parsed.command === "help" || parsed.flags.has("help")) {
    const topic = parsed.command === "help" ? parsed.positionals[0] : parsed.command
    printHelp(topic && topic !== "help" ? topic : undefined)
    return 0
  }

  if (parsed.command === undefined) {
    printHelp()
    return 1
  }

  let ctx: CliContext
  try {
    ctx = createContext(parsed.flags)
  } catch (err) {
    process.stderr.write(`✗ ${err instanceof Error ? err.message : String(err)}\n`)
    return 1
  }

  try {
    return run(ctx, parsed.command, parsed.positionals)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (parsed.flags.has("json")) {
      process.stdout.write(`${JSON.stringify({ ok: false, errors: [message] }, null, 2)}\n`)
    } else {
      process.stderr.write(`✗ ${message}\n`)
    }
    return 1
  }
}

process.exitCode = main(process.argv.slice(2))
