import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getNucleiRunDoc,
  getNucleiRunDocSlugs,
  getNucleiRunPagination,
} from "@/lib/nuclei-run-docs"
import { DocPageLayout } from "@/components/docs/doc-page-layout"

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const allSlugs = getNucleiRunDocSlugs()
  return allSlugs.filter((p) => p.slug.length > 0)
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const doc = getNucleiRunDoc(params.slug)
  if (!doc) notFound()

  return {
    title: `${doc.meta.title} — nuclei-run Docs`,
    description: doc.meta.description || `Documentation for ${doc.meta.title}`,
  }
}

export default async function NucleiRunSubDocPage(props: PageProps) {
  const params = await props.params
  const doc = getNucleiRunDoc(params.slug)
  if (!doc) notFound()

  const slugString = params.slug.join("/")
  const pagination = getNucleiRunPagination(slugString, "/nuclei-run")

  // Generate breadcrumb items
  const breadcrumbs = [
    { title: "Docs", href: "/docs" },
    { title: "nuclei-run", href: "/nuclei-run" },
    ...params.slug.map((segment, index) => {
      const currentSubSlugs = params.slug.slice(0, index + 1)
      const currentSubDoc = getNucleiRunDoc(currentSubSlugs)
      return {
        title:
          currentSubDoc?.meta.title ||
          segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        href: `/nuclei-run/${currentSubSlugs.join("/")}`,
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
