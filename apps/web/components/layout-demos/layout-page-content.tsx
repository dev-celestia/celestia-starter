"use client"

import * as React from "react"
import Link from "next/link"
import type { ComponentType } from "react"
import { LAYOUT_DEMO_META } from "@/lib/layout-demos"
import { LayoutSidebar } from "./layout-sidebar"
import {
  AuthShellPreview,
  BillingPagePreview,
  DashboardPagePreview,
  DashboardShellPreview,
  ErrorPagePreview,
  ForgotPasswordPagePreview,
  ListPagePreview,
  NotFoundPagePreview,
  PageShellPreview,
  ProfilePagePreview,
  ResetPasswordPagePreview,
  SettingsPagePreview,
  SignInPagePreview,
  SignUpPagePreview,
  StatusPagePreview,
  TwoFactorPagePreview,
} from "@/components/docs/previews"

const PREVIEWS: Record<string, ComponentType> = {
  "auth-shell": AuthShellPreview,
  "page-shell": PageShellPreview,
  "dashboard-shell": DashboardShellPreview,
  "sign-in-page": SignInPagePreview,
  "sign-up-page": SignUpPagePreview,
  "forgot-password-page": ForgotPasswordPagePreview,
  "reset-password-page": ResetPasswordPagePreview,
  "two-factor-page": TwoFactorPagePreview,
  "dashboard-page": DashboardPagePreview,
  "profile-page": ProfilePagePreview,
  "settings-page": SettingsPagePreview,
  "list-page": ListPagePreview,
  "billing-page": BillingPagePreview,
  "status-page": StatusPagePreview,
  "not-found-page": NotFoundPagePreview,
  "error-page": ErrorPagePreview,
}

export function LayoutPageContent() {
  const [activeId, setActiveId] = React.useState<string>(LAYOUT_DEMO_META[0]?.slug ?? "")

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140
      for (let i = LAYOUT_DEMO_META.length - 1; i >= 0; i--) {
        const item = LAYOUT_DEMO_META[i]
        if (!item) continue
        const el = document.getElementById(item.slug)
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(item.slug)
          return
        }
      }
      const first = LAYOUT_DEMO_META[0]
      if (first) {
        setActiveId(first.slug)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToItem = (slug: string) => {
    const el = document.getElementById(slug)
    if (el) {
      const yOffset = -80
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
      setActiveId(slug)
    }
  }

  return (
    <div className="flex gap-8 pb-6">
      {/* Sticky Left Sidebar (Desktop) — matches docs pattern */}
      <aside className="sticky top-6 hidden w-64 shrink-0 self-start overflow-hidden pe-2 lg:flex lg:flex-col lg:h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-3rem)]">
        <LayoutSidebar activeId={activeId} onSelect={scrollToItem} />
      </aside>

      {/* Center Main Content (Single column layout demos) */}
      <main className="min-w-0 max-w-full flex-1">
        <div className="flex flex-col gap-2 pb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Layout &amp; Pages</h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Dedicated full-page demos for the 16 shells and screens in{" "}
            <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
              @celestia-project/ui
            </code>
            . Open any component at true viewport size, or read its documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {LAYOUT_DEMO_META.map(({ slug, title, description }) => {
            const Preview = PREVIEWS[slug]
            return (
              <article
                key={slug}
                id={slug}
                className="scroll-mt-20 border-border/70 bg-card flex flex-col overflow-hidden rounded-xl border shadow-xs transition-all hover:border-border hover:shadow-md"
              >
                <div className="border-border/50 flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                      href={`/layout/${slug}`}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors shadow-xs"
                    >
                      Demo
                    </Link>
                    <Link
                      href={`/docs/components/${slug}`}
                      title={`${title} documentation`}
                      className="border-border text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md border text-xs transition-colors"
                    >
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only">{title} documentation</span>
                    </Link>
                  </div>
                </div>
                <div className="bg-background/40 p-4 sm:p-6">{Preview ? <Preview /> : null}</div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
