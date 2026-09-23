import type { Metadata } from "next"

import { AgencyFooter } from "@/components/agency/agency-footer"
import { AgencyNav } from "@/components/agency/agency-nav"
import { CaseStudiesSection } from "@/components/agency/case-studies-section"
import { ContactSection } from "@/components/agency/contact-section"
import { DeliveryModelsSection } from "@/components/agency/delivery-models-section"
import { AgencyHero } from "@/components/agency/hero-section"
import { ProcessSection } from "@/components/agency/process-section"
import { ServicesSection } from "@/components/agency/services-section"
import { TechStackSection } from "@/components/agency/tech-stack-section"

import "./landing.css"

export const metadata: Metadata = {
  title: "Celestia — Enterprise Software Development",
  description:
    "We build enterprise-grade web, mobile, and cloud software that scales with your business. Schedule a free tech strategy call with our senior engineers.",
  openGraph: {
    title: "Celestia — Enterprise Software Development",
    description:
      "Custom software development for CTOs, founders, and enterprise product teams. Web, mobile, cloud — shipped with architecture built to last.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      <AgencyNav />
      <AgencyHero />
      <ServicesSection />
      {/* Proof sits directly after the claim it supports. */}
      <CaseStudiesSection />
      <ProcessSection />
      <DeliveryModelsSection />
      <TechStackSection />
      <ContactSection />
      <AgencyFooter />
    </main>
  )
}
