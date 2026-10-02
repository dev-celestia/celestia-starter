import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "drizzle-kit"

/**
 * The API owns DATABASE_URL in apps/api/.env. Fall back to it so commands run
 * from a clean shell (e.g. `pnpm --filter @workspace/db db:push`, or the
 * feature manager's postInstall step) work without exporting the variable.
 * drizzle-kit may bundle this config to a temp directory, so resolve the env
 * file from both the working directory and this file's location.
 */
function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const here = dirname(fileURLToPath(import.meta.url))
  for (const base of [process.cwd(), here]) {
    // apps/api/.env relative to the repo root (base = repo root) or to a
    // package directory two levels below it (base = e.g. packages/db).
    for (const candidate of [join(base, "apps", "api", ".env"), join(base, "..", "..", "apps", "api", ".env")]) {
      if (!existsSync(candidate)) continue
      const line = readFileSync(candidate, "utf-8")
        .split("\n")
        .find((l) => /^DATABASE_URL=/.test(l))
      if (line) return line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "")
    }
  }
  return ""
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl(),
  },
})
