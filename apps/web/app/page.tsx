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
  title: "Celestia — Software Engineering & Development",
  description:
    "We build modern web and mobile software that scales with your business. Schedule a free tech strategy call with our senior engineers at hello@devcelestia.com.",
  openGraph: {
    title: "Celestia — Software Engineering & Development",
    description:
      "Custom software development for founders, product leaders, and ambitious engineering teams. Web and mobile — shipped with architecture built to last.",
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
