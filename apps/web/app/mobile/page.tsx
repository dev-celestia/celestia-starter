import type { Metadata } from "next"
import { SiteLayout } from "@/components/shared/site-layout"
import { MobilePageContent } from "@/components/mobile-showcase/mobile-page-content"

export const metadata: Metadata = {
  title: "Mobile — Celestia Design System",
  description:
    "Native iOS, Android and web components built on @expo/ui — 44 modules across primitives, composites and full-screen layout shells, with the token ramp and the screen gallery.",
}

export default function MobileIndexPage() {
  return (
    <SiteLayout
      anchors={[]}
      cta={null}
      footerGroups={{}}
      className="selection:bg-primary/20"
      constrainContent={false}
      footerMaxWidth="max-w-7xl"
    >
      {/* `constrainContent={false}`: the content component owns its container,
          because the mobile section switcher has to sit outside it to stay
          full-bleed and sticky. */}
      <MobilePageContent />
    </SiteLayout>
  )
}
