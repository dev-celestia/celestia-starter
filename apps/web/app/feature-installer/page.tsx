import type { Metadata } from "next"

import { ArchitectureSection } from "@/components/feature-installer/architecture-section"
import { CtaSection } from "@/components/feature-installer/cta-section"
import { Footer } from "@/components/feature-installer/footer"
import { HeroSection } from "@/components/feature-installer/hero-section"
import { InstallSection } from "@/components/feature-installer/install-section"
import { NavBar } from "@/components/feature-installer/nav-bar"
import { StackSection } from "@/components/feature-installer/stack-section"

import "../landing.css"

export const metadata: Metadata = {
  title: "Feature Installer — Celestia",
  description:
    "Next.js 16 frontend, Hono backend, Better Auth, Drizzle ORM — a decoupled full-stack starter installed in one command.",
}

export default function FeatureInstallerPage() {
  return (
    // "dark" scope forces the shadcn dark tokens for every component on
    // this page — the landing is always dark, regardless of system theme.
    <main className="dark bg-bg text-text-primary">
      <NavBar />
      <HeroSection />
      <StackSection />
      <ArchitectureSection />
      <InstallSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
