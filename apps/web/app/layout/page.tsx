import type { Metadata } from "next"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { SiteLayout } from "@/components/shared/site-layout"
import { LayoutPageContent } from "@/components/layout-demos/layout-page-content"
import { SonnerToaster } from "@celestia-project/ui"
import { LAYOUT_DEMO_META } from "@/lib/layout-demos"

export const metadata: Metadata = {
  title: "Layout Templates — Celestia Design System",
  description:
    "Copy-ready page templates — preview any shell or screen, copy its source, paste it into your app.",
}

async function readTemplateSources(): Promise<Record<string, string>> {
  const entries = await Promise.all(
    LAYOUT_DEMO_META.map(async ({ slug }) => {
      try {
        const source = await readFile(
          join(process.cwd(), "components", "layout-templates", `${slug}.tsx`),
          "utf8"
        )
        return [slug, source] as const
      } catch {
        return [slug, ""] as const
      }
    })
  )
  return Object.fromEntries(entries)
}

export default async function LayoutIndexPage() {
  const sources = await readTemplateSources()

  return (
    <SiteLayout
      anchors={[]}
      cta={null}
      footerGroups={{}}
      className="selection:bg-primary/20"
      constrainContent={false}
      footerMaxWidth="max-w-7xl"
    >
      <div className="mx-auto max-w-7xl px-5 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:px-8">
        <LayoutPageContent sources={sources} />
      </div>
      <SonnerToaster position="bottom-right" />
    </SiteLayout>
  )
}
