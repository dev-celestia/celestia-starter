import type { Metadata } from "next"

import { ContactSection } from "@/components/agency/contact-section"
import { DeliveryModelsSection } from "@/components/agency/delivery-models-section"
import { AgencyHero } from "@/components/agency/hero-section"
import { OpenSourceSection } from "@/components/agency/open-source-section"
import { ProcessSection } from "@/components/agency/process-section"
import { RecentProjectsSection } from "@/components/agency/recent-projects-section"
import { ServicesSection } from "@/components/agency/services-section"
import { SiteLayout } from "@/components/shared/site-layout"

import "./landing.css"

export const metadata: Metadata = {
  title: "Celestia — Enterprise Software Development",
  description:
    "We build enterprise-grade web and mobile software that scales with your business. Schedule a free tech strategy call with our senior engineers.",
  openGraph: {
    title: "Celestia — Enterprise Software Development",
    description:
      "Custom software development for CTOs, founders, and enterprise product teams. Web and mobile — shipped with architecture built to last.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <SiteLayout>
      <AgencyHero />
      <ServicesSection />
      <RecentProjectsSection />
      <OpenSourceSection />
      <ProcessSection />
      <DeliveryModelsSection />
      <ContactSection />
    </SiteLayout>
  )
}
