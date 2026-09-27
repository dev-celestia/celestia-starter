import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LAYOUT_DEMO_META, getLayoutDemoMeta } from "@/lib/layout-demos"
import { LayoutDemoStage } from "@/components/layout-demos/layout-demo-stage"

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return LAYOUT_DEMO_META.map((demo) => ({ slug: demo.slug }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params
  const demo = getLayoutDemoMeta(slug)
  if (!demo) notFound()

  return {
    title: `${demo.title} — Celestia Layout`,
    description: demo.description,
  }
}

export default async function LayoutDemoPage(props: PageProps) {
  const { slug } = await props.params
  const demo = getLayoutDemoMeta(slug)
  if (!demo) notFound()

  return <LayoutDemoStage slug={slug} />
}
