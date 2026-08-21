import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllDocSlugs, getDocBySlug, getDocPagination } from "@/lib/docs"
import { DocPageLayout } from "@/components/docs/doc-page-layout"

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const allSlugs = getAllDocSlugs()
  return allSlugs.filter((p) => p.slug.length > 0)
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const doc = getDocBySlug(params.slug)
  if (!doc) notFound()

  return {
    title: `${doc.meta.title} — Celestia Docs`,
    description: doc.meta.description || `Documentation for ${doc.meta.title}`,
  }
}

export default async function DocSubPage(props: PageProps) {
  const params = await props.params
  const doc = getDocBySlug(params.slug)
  if (!doc) notFound()

  const slugString = params.slug.join("/")
  const pagination = getDocPagination(slugString)

  // Generate breadcrumb items
  const breadcrumbs = [
    { title: "Docs", href: "/docs" },
    ...params.slug.map((segment, index) => {
      const currentSubSlugs = params.slug.slice(0, index + 1)
      const currentSubDoc = getDocBySlug(currentSubSlugs)
      return {
        title: currentSubDoc?.meta.title || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: `/docs/${currentSubSlugs.join("/")}`,
      }
    }),
  ]

  return (
    <DocPageLayout
      doc={doc}
      breadcrumbs={breadcrumbs}
      pagination={pagination}
    />
  )
}
