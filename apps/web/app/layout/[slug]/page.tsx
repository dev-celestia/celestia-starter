import type { Metadata } from "next"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { notFound } from "next/navigation"
import { LAYOUT_DEMO_META, getLayoutDemoMeta } from "@/lib/layout-demos"
import { LayoutDemoStage } from "@/components/layout-demos/layout-demo-stage"
import { SonnerToaster } from "@celestia-project/ui"

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
    title: `${demo.title} — Celestia Layout Templates`,
    description: demo.description,
  }
}

export default async function LayoutDemoPage(props: PageProps) {
  const { slug } = await props.params
  const demo = getLayoutDemoMeta(slug)
  if (!demo) notFound()

  let source = ""
  try {
    source = await readFile(
      join(process.cwd(), "components", "layout-templates", `${slug}.tsx`),
      "utf8"
    )
  } catch {
    source = ""
  }

  return (
    <>
      <LayoutDemoStage slug={slug} source={source} />
      <SonnerToaster position="bottom-right" />
    </>
  )
}
