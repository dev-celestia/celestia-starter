import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDocBySlug, getDocPagination } from "@/lib/docs"
import { DocPageLayout } from "@/components/docs/doc-page-layout"

export const metadata: Metadata = {
  title: "Documentation — Celestia Starter",
  description: "A modern full-stack monorepo starter built with Next.js 16, Hono, Better Auth, and Drizzle ORM.",
}

export default async function DocsIndexPage() {
  const doc = getDocBySlug([])
  if (!doc) notFound()

  const pagination = getDocPagination("")

  return <DocPageLayout doc={doc} pagination={pagination} />
}
