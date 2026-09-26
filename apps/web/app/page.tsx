import type { Metadata } from "next"

import { AgencyFooter } from "@/components/agency/agency-footer"
import { LandingNav } from "@/components/shared/landing-nav"
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
    <main className="min-h-screen bg-background text-foreground">
      <LandingNav />
      {/* Below lg the nav is a static top bar, so nothing offsets; from lg the
          rail is fixed and the page content cedes its 20rem. The column caps
          at 60rem so the measure stays readable next to the rail. */}
      <div className="lg:ml-80">
        <div className="mx-auto w-full max-w-[960px] px-5 sm:px-8">
          <AgencyHero />
          <ServicesSection />
          {/* Proof sits directly after the claim it supports. */}
          <CaseStudiesSection />
          <ProcessSection />
          <DeliveryModelsSection />
          <TechStackSection />
          <ContactSection />
        </div>
        <AgencyFooter />
      </div>
    </main>
  )
}
