import type { Metadata } from "next"
import { SiteLayout, type SiteLink } from "@/components/shared/site-layout"
import { DesktopPageContent } from "@/components/desktop-showcase/desktop-page-content"

const DESKTOP_ANCHORS: readonly SiteLink[] = [
  { label: "Overview", href: "#overview" },
  { label: "Gallery", href: "#run" },
  { label: "Components", href: "#families" },
  { label: "Usage guide", href: "#usage" },
  { label: "Tokens", href: "#tokens" },
  { label: "Custom themes", href: "#theming" },
  { label: "Bootstrap", href: "#bootstrap" },
]

export const metadata: Metadata = {
  title: "Desktop — Celestia Design System",
  description:
    "Native Rust desktop components on GPUI Kit — celestia-ui re-exports the gpui-component library under the Celestia tokens, with a project usage guide and the gallery-window run instructions.",
}

export default function DesktopIndexPage() {
  return (
    <SiteLayout
      anchors={DESKTOP_ANCHORS}
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
