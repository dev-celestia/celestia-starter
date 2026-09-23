import { findRepoRoot } from "../paths.js"
import { Ui } from "./ui.js"

export interface CliContext {
  root: string
  ui: Ui
  flags: Map<string, string | true>
}

export function createContext(flags: Map<string, string | true>): CliContext {
  return {
    root: findRepoRoot(),
    ui: new Ui({ quiet: flags.has("quiet"), json: flags.has("json") }),
    flags,
  }
}

export function flag(ctx: CliContext, name: string): boolean {
  return ctx.flags.has(name)
}

export function flagValue(ctx: CliContext, name: string): string | undefined {
  const value = ctx.flags.get(name)
  return typeof value === "string" ? value : undefined
}
