import type { Metadata } from "next"
import { Suspense } from "react"
import { readTemplateSources } from "@/lib/layout-sources"
import { WebComponentsPageClient } from "@/components/design-system/web-components-page-client"

export const metadata: Metadata = {
  title: "Components & Templates — Celestia Design System",
  description:
    "A production-grade, accessible UI foundation of Base UI primitives and copy-ready page templates engineered for modern web applications.",
}

export default async function WebComponentsPage() {
  const sources = await readTemplateSources()

  return (
    <Suspense>
      <WebComponentsPageClient sources={sources} />
    </Suspense>
  )
}
