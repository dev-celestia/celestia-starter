import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getNucleiRunDoc, getNucleiRunPagination } from "@/lib/nuclei-run-docs"
import { DocPageLayout } from "@/components/docs/doc-page-layout"

export const metadata: Metadata = {
  title: "nuclei-run Documentation — High-Performance Vulnerability Scanner",
  description: "Official documentation, guides, and protocol references for nuclei-run in Rust.",
}

export default function NucleiRunIndexPage() {
  const doc = getNucleiRunDoc([])
  if (!doc) notFound()

  const pagination = getNucleiRunPagination("", "/nuclei-run")

  const breadcrumbs = [
    { title: "Docs", href: "/docs" },
    { title: "nuclei-run", href: "/nuclei-run" },
  ]

  return (
    <DocPageLayout
      doc={doc}
      breadcrumbs={breadcrumbs}
      pagination={pagination}
    />
  )
}
