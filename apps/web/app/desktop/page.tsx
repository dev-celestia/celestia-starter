import type { Metadata } from "next"
import { SiteLayout } from "@/components/shared/site-layout"
import { DesktopPageContent } from "@/components/desktop-showcase/desktop-page-content"

export const metadata: Metadata = {
  title: "Desktop — Celestia Design System",
  description:
    "Native Rust desktop components on GPUI Kit — celestia-ui re-exports the gpui-component library under the Celestia tokens, with the gallery-window run instructions.",
}

export default function DesktopIndexPage() {
  return (
    <SiteLayout
      anchors={[]}
      cta={null}
      footerGroups={{}}
      className="selection:bg-primary/20"
      constrainContent={false}
      footerMaxWidth="max-w-5xl"
    >
      <DesktopPageContent />
    </SiteLayout>
  )
}
