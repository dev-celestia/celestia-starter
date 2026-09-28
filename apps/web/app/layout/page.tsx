import type { Metadata } from "next"
import { SiteLayout } from "@/components/shared/site-layout"
import { LayoutPageContent } from "@/components/layout-demos/layout-page-content"

export const metadata: Metadata = {
  title: "Layout & Pages — Celestia Design System",
  description:
    "Dedicated full-page demos for every layout component in @celestia-project/ui — open any shell or screen at true viewport size.",
}

export default function LayoutIndexPage() {
  return (
    <SiteLayout
      anchors={[]}
      cta={null}
      footerGroups={{}}
      className="selection:bg-primary/20"
      constrainContent={false}
      footerMaxWidth="max-w-7xl"
    >
      <div className="mx-auto max-w-7xl px-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:px-8 pt-5">
        <LayoutPageContent />
      </div>
    </SiteLayout>
  )
}
