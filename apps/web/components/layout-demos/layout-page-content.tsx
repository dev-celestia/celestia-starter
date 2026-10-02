"use client"

import * as React from "react"
import Link from "next/link"
import type { ComponentType } from "react"
import { CodeIcon, CornersOutIcon, EyeIcon } from "@phosphor-icons/react"
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui"
import { LAYOUT_DEMO_META, PACKAGE_COMPOSITE_SLUGS } from "@/lib/layout-demos"
import { CodeBlock } from "@/components/shared/code-block"
import { CopyTemplateButton } from "./copy-template-button"
import { LayoutSidebar } from "./layout-sidebar"
import {
  AnalyticsPagePreview,
  ArticlePagePreview,
  AuditLogPagePreview,
  AuthShellPreview,
  BillingPagePreview,
  BlogIndexPagePreview,
  CalendarPagePreview,
  ChatPagePreview,
  CheckoutPagePreview,
  DashboardPagePreview,
  DashboardShellPreview,
  ErrorPagePreview,
  FilesPagePreview,
  ForgotPasswordPagePreview,
  InboxPagePreview,
  IntegrationsPagePreview,
  InvoicePagePreview,
  KanbanPagePreview,
  LandingPagePreview,
  ListPagePreview,
  MarketingShellPreview,
  NotFoundPagePreview,
  OnboardingPagePreview,
  PageShellPreview,
  PricingPagePreview,
  ProfilePagePreview,
  RecordDetailPagePreview,
  ReportsPagePreview,
  ResetPasswordPagePreview,
  SearchPagePreview,
  SettingsPagePreview,
  SignInPagePreview,
  SignUpPagePreview,
  StatusPagePreview,
  TeamPagePreview,
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
  "marketing-shell": MarketingShellPreview,
  "landing-page": LandingPagePreview,
  "pricing-page": PricingPagePreview,
  "blog-index-page": BlogIndexPagePreview,
  "article-page": ArticlePagePreview,
  "inbox-page": InboxPagePreview,
  "chat-page": ChatPagePreview,
  "kanban-page": KanbanPagePreview,
  "calendar-page": CalendarPagePreview,
  "files-page": FilesPagePreview,
  "analytics-page": AnalyticsPagePreview,
  "reports-page": ReportsPagePreview,
  "record-detail-page": RecordDetailPagePreview,
  "search-page": SearchPagePreview,
  "audit-log-page": AuditLogPagePreview,
  "checkout-page": CheckoutPagePreview,
  "invoice-page": InvoicePagePreview,
  "onboarding-page": OnboardingPagePreview,
  "team-page": TeamPagePreview,
  "integrations-page": IntegrationsPagePreview,
}

/**
 * One gallery card, mirroring the /design-system ShowcaseCard idiom: a
 * View/Code tab pair in the header, the live template preview under View and
 * the full source file under Code.
 */
function LayoutTemplateCard({
  slug,
  title,
  description,
  preview: Preview,
  source,
}: {
  slug: string
  title: string
  description: string
  preview?: ComponentType
  source: string
}) {
  const [tab, setTab] = React.useState("view")
  const isTemplate = !PACKAGE_COMPOSITE_SLUGS.has(slug)

  return (
    <article
      id={slug}
      className="flex scroll-mt-20 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:border-border hover:shadow-md"
    >
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <TabsList className="h-8">
              <TabsTrigger value="view" className="gap-1.5 text-xs">
                <EyeIcon className="size-3.5" />
                <span>View</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1.5 text-xs">
                <CodeIcon className="size-3.5" />
                <span>Code</span>
              </TabsTrigger>
            </TabsList>
            {isTemplate ? (
              <CopyTemplateButton text={source} title={title} />
            ) : (
              <span
                title="Package composite — import from @celestia-project/ui"
                className="inline-flex h-[26px] items-center rounded-md border border-dashed border-border/70 px-3 text-xs font-medium text-muted-foreground"
              >
                Composite
              </span>
            )}
            <Button
              variant="outline"
              render={<Link href={`/layout/${slug}`} />}
              title={`View ${title} fullscreen`}
            >
              <CornersOutIcon className="size-3.5" />
              Fullscreen view
            </Button>
          </div>
        </div>
        <TabsContent value="view" className="bg-background/40 p-4 sm:p-6">
          {Preview ? <Preview /> : null}
        </TabsContent>
        <TabsContent
          value="code"
          className="relative flex flex-col overflow-hidden rounded-b-xl bg-background"
        >
          <CodeBlock
            code={source}
            language="tsx"
            title={`${slug}.tsx`}
            badge={isTemplate ? "Copy template" : "Package composite"}
            showCopy={false}
            height={280}
            className="my-0 rounded-none border-0 bg-transparent shadow-none"
            preClassName="bg-background/70"
          />
        </TabsContent>
      </Tabs>
    </article>
  )
}

export function LayoutPageContent({
  sources,
}: {
  sources: Record<string, string>
}) {
  const [activeId, setActiveId] = React.useState<string>(
    LAYOUT_DEMO_META[0]?.slug ?? ""
  )

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
    <div className="pb-6">
      {/* Hero — mirrors the /design-system hero section */}
      <section className="relative flex flex-col items-start gap-3 py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          Layout Templates
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {LAYOUT_DEMO_META.length} page templates wired to the design system —
          auth screens, app pages, marketing frames and system states. Preview
          one, hit{" "}
          <span className="font-medium text-foreground">Copy code</span>, paste
          the file into your app and make it yours. The pages are plain source
          files under{" "}
          <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            apps/web/components/layout-templates
          </code>
          , not package exports — so nothing blocks a prototype. The four
          slot-only shells they compose on (Auth Shell, Page Shell, Dashboard
          Shell, Marketing Shell) ship as package composites, so a copied page
          never needs a second file for its frame.
        </p>
      </section>

      <div className="flex gap-8">
        {/* Sticky Left Sidebar (Desktop) — matches docs pattern */}
        <aside className="sticky top-6 hidden w-64 shrink-0 self-start overflow-hidden pe-2 lg:flex lg:h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-3rem)] lg:flex-col">
          <LayoutSidebar activeId={activeId} onSelect={scrollToItem} />
        </aside>

        {/* Center Main Content (Single column layout demos) */}
        <main className="max-w-full min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-8">
            {LAYOUT_DEMO_META.map(({ slug, title, description }) => {
              const Preview = PREVIEWS[slug]
              const source = sources[slug] ?? ""
              return (
                <LayoutTemplateCard
                  key={slug}
                  slug={slug}
                  title={title}
                  description={description}
                  preview={Preview}
                  source={source}
                />
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
