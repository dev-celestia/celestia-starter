"use client"

import * as React from "react"
import Link from "next/link"
import {
  SparkleIcon,
  BookOpenIcon,
  GithubLogoIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FadersIcon,
} from "@phosphor-icons/react"
import { Button, Badge } from "@celestia-project/ui"
import { Toaster } from "sonner"
import { ComponentsHeader } from "@/components/showcase/components-header"
import { ThemeCustomizer } from "@/components/showcase/theme-customizer"
import { ComponentsSidebar, CATEGORIES } from "@/components/showcase/components-sidebar"
import { ButtonsSection } from "@/components/showcase/sections/buttons-section"
import { InputsSection } from "@/components/showcase/sections/inputs-section"
import { DataDisplaySection } from "@/components/showcase/sections/data-display-section"
import { FeedbackSection } from "@/components/showcase/sections/feedback-section"
import { NavigationSection } from "@/components/showcase/sections/navigation-section"
import { ChatAiSection } from "@/components/showcase/sections/chat-ai-section"
import { SurfacesSection } from "@/components/showcase/sections/surfaces-section"

export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("buttons")

  // Search filtering logic
  const normalizedQuery = searchQuery.trim().toLowerCase()

  // Track active category on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const categoryIds = CATEGORIES.map((c) => c.id)
      for (const id of categoryIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveCategory(id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Toaster position="top-right" richColors />
      
      {/* Top Header */}
      <ComponentsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalComponents={70}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative flex flex-col items-start gap-4 border-b border-border/60 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
              <SparkleIcon className="size-3.5 text-primary" weight="fill" />
              @celestia-project/ui
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              v0.2.1 • Base UI + Tailwind v4
            </Badge>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            UI Components Showcase
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            A comprehensive, production-grade library of 70+ beautifully styled and accessible components.
            Decoupled for Next.js 16 and Hono backends, featuring live interactive previews and copyable imports.
          </p>

          {/* Quick Stat Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-muted-foreground">
              <CheckCircleIcon className="size-3.5 text-green-500" weight="fill" />
              Base UI Primitives
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-muted-foreground">
              <CheckCircleIcon className="size-3.5 text-green-500" weight="fill" />
              Tailwind CSS v4 Tokens
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-muted-foreground">
              <CheckCircleIcon className="size-3.5 text-green-500" weight="fill" />
              Phosphor Icons React
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-muted-foreground">
              <CheckCircleIcon className="size-3.5 text-green-500" weight="fill" />
              Dark & Light Mode Ready
            </span>
          </div>

          {/* Theme & Palette Switcher Toolbar */}
          <div className="w-full pt-2">
            <ThemeCustomizer />
          </div>

          {/* Mobile Category Navigation Pills */}
          <div className="flex w-full items-center gap-1.5 overflow-x-auto pt-4 lg:hidden pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  const el = document.getElementById(cat.id)
                  if (el) el.scrollIntoView({ behavior: "smooth" })
                }}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Content Layout */}
        <div className="flex gap-8 py-6">
          {/* Sticky Left Sidebar */}
          <ComponentsSidebar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Main Showcase Feed */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">
            {/* Show sections based on search */}
            {(!normalizedQuery || "buttons button toggle ripple".includes(normalizedQuery)) && (
              <ButtonsSection />
            )}

            {(!normalizedQuery || "inputs input textarea checkbox radio switch slider select combobox otp field form url".includes(normalizedQuery)) && (
              <InputsSection />
            )}

            {(!normalizedQuery || "data display card article badge avatar table empty item marker kbd skeleton aspect ratio separator".includes(normalizedQuery)) && (
              <DataDisplaySection />
            )}

            {(!normalizedQuery || "feedback alert dialog sheet drawer popover tooltip hover card progress spinner sonner toast".includes(normalizedQuery)) && (
              <FeedbackSection />
            )}

            {(!normalizedQuery || "navigation tabs tab bar breadcrumb pagination accordion collapsible dropdown context menu menubar command".includes(normalizedQuery)) && (
              <NavigationSection />
            )}

            {(!normalizedQuery || "chat ai message bubble attachment input scroller".includes(normalizedQuery)) && (
              <ChatAiSection />
            )}

            {(!normalizedQuery || "surfaces resizable scroll area carousel text code editor chart".includes(normalizedQuery)) && (
              <SurfacesSection />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
