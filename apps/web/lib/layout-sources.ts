import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { LAYOUT_DEMO_META, PACKAGE_COMPOSITE_SLUGS } from "@/lib/layout-demos"

export async function readTemplateSources(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    LAYOUT_DEMO_META.map(async ({ slug }) => {
      const filePath = PACKAGE_COMPOSITE_SLUGS.has(slug)
        ? join(
            process.cwd(),
            "..",
            "..",
            "packages",
            "ui",
            "src",
            "components",
            "composite",
            `${slug}.tsx`
          )
        : join(process.cwd(), "components", "layout-templates", `${slug}.tsx`)
      try {
        const source = await readFile(filePath, "utf8")
        return [slug, source] as const
      } catch {
        return [slug, ""] as const
      }
    })
  )
  return Object.fromEntries(entries)
}
