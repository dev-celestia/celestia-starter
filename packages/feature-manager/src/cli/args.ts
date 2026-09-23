/**
 * Minimal, dependency-free flag parser.
 *
 * Supports `--flag`, `--flag=value`, `--flag value` and short aliases
 * (`-f`, `-n`, …). Unknown flags are reported instead of silently ignored, so a
 * typo like `--dryrun` fails loudly rather than performing a real install.
 */

export interface FlagSpec {
  /** Short aliases without dashes, e.g. ["f"]. */
  alias?: string[]
  /** When true the flag consumes the next token as its value. */
  takesValue?: boolean
  description: string
}

export const FLAGS: Record<string, FlagSpec> = {
  help: { alias: ["h"], description: "Show help" },
  "dry-run": { alias: ["n"], description: "Show what would change without writing anything" },
  force: { alias: ["f"], description: "Reinstall/upgrade, or override safety checks" },
  yes: { alias: ["y"], description: "Skip confirmation prompts" },
  json: { alias: ["j"], description: "Emit machine-readable JSON" },
  quiet: { alias: ["q"], description: "Only print warnings, errors and the final result" },
  strict: { description: "Treat warnings as errors" },
  verbose: { alias: ["v"], description: "Print every planned action" },
}

export interface ParsedArgs {
  command?: string
  positionals: string[]
  flags: Map<string, string | true>
  errors: string[]
}

const ALIAS_TO_FLAG = new Map<string, string>()
for (const [name, spec] of Object.entries(FLAGS)) {
  for (const alias of spec.alias ?? []) ALIAS_TO_FLAG.set(alias, name)
}

export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = { positionals: [], flags: new Map(), errors: [] }
  let index = 0

  while (index < argv.length) {
    const token = argv[index]
    index += 1
    if (token === undefined) break

    if (token === "--") {
      result.positionals.push(...argv.slice(index))
      break
    }

    if (token.startsWith("--")) {
      const [rawName, inlineValue] = splitFlag(token.slice(2))
      const name = rawName
      const spec = FLAGS[name]
      if (!spec) {
        result.errors.push(`Unknown option "--${name}".`)
        continue
      }
      if (spec.takesValue) {
        const value = inlineValue ?? argv[index]
        if (value === undefined) {
          result.errors.push(`Option "--${name}" requires a value.`)
        } else {
          if (inlineValue === undefined) index += 1
          result.flags.set(name, value)
        }
      } else if (inlineValue !== undefined) {
        result.errors.push(`Option "--${name}" does not take a value.`)
      } else {
        result.flags.set(name, true)
      }
      continue
    }

    if (token.startsWith("-") && token.length > 1) {
      const letters = token.slice(1)
      if (letters.length === 1) {
        const name = ALIAS_TO_FLAG.get(letters)
        if (!name) {
          result.errors.push(`Unknown option "-${letters}".`)
          continue
        }
        const spec = FLAGS[name]
        if (spec?.takesValue) {
          const value = argv[index]
          if (value === undefined) result.errors.push(`Option "-${letters}" requires a value.`)
          else {
            index += 1
            result.flags.set(name, value)
          }
        } else {
          result.flags.set(name, true)
        }
        continue
      }
      // Bundled short flags, e.g. -fn
      for (const letter of letters) {
        const name = ALIAS_TO_FLAG.get(letter)
        if (!name) result.errors.push(`Unknown option "-${letter}".`)
        else result.flags.set(name, true)
      }
      continue
    }

    if (result.command === undefined) result.command = token
    else result.positionals.push(token)
  }

  return result
}

function splitFlag(body: string): [string, string | undefined] {
  const eq = body.indexOf("=")
  if (eq === -1) return [body, undefined]
  return [body.slice(0, eq), body.slice(eq + 1)]
}

export function flagList(): string {
  return Object.entries(FLAGS)
    .map(([name, spec]) => {
      const short = spec.alias?.[0] ? `-${spec.alias[0]}, ` : "    "
      return `  ${short}--${name.padEnd(10)} ${spec.description}`
    })
    .join("\n")
}
