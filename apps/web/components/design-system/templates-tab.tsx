"use client"

import * as React from "react"
import Link from "next/link"
import type { ComponentType } from "react"
import {
  CodeIcon,
  CornersOutIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react"
import {
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui"
import { LAYOUT_DEMO_META, PACKAGE_COMPOSITE_SLUGS } from "@/lib/layout-demos"
import { CodeBlock } from "@/components/shared/code-block"
import { CopyTemplateButton } from "@/components/layout-demos/copy-template-button"
import { LayoutSidebar } from "@/components/layout-demos/layout-sidebar"
import { useDesignSystem } from "./hooks/use-design-system"
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
      className="flex scroll-mt-24 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:border-border hover:shadow-md"
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

export function TemplatesTab({
  sources,
}: {
  sources: Record<string, string>
}) {
  const { searchQuery, resetSearch, normalizedQuery } = useDesignSystem()
  const [activeId, setActiveId] = React.useState<string>(
    LAYOUT_DEMO_META[0]?.slug ?? ""
  )

  const filteredDemos = React.useMemo(() => {
    if (!normalizedQuery) return LAYOUT_DEMO_META
    return LAYOUT_DEMO_META.filter((demo) => {
      return (
        demo.title.toLowerCase().includes(normalizedQuery) ||
        demo.description.toLowerCase().includes(normalizedQuery) ||
        demo.slug.toLowerCase().includes(normalizedQuery) ||
        demo.category.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [normalizedQuery])

  const allowedSlugs = React.useMemo(() => {
    if (!normalizedQuery) return undefined
    return new Set(filteredDemos.map((d) => d.slug))
  }, [normalizedQuery, filteredDemos])

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140
      for (let i = filteredDemos.length - 1; i >= 0; i--) {
        const item = filteredDemos[i]
        if (!item) continue
        const el = document.getElementById(item.slug)
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(item.slug)
          return
        }
      }
      const first = filteredDemos[0]
      if (first) {
        setActiveId(first.slug)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [filteredDemos])

  const scrollToItem = (slug: string) => {
    const el = document.getElementById(slug)
    if (el) {
      const yOffset = -90
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
      setActiveId(slug)
    }
  }

  return (
    <div className="pt-4 lg:pt-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sticky Left Sidebar */}
        <LayoutSidebar
          activeId={activeId}
          onSelect={scrollToItem}
          allowedSlugs={allowedSlugs}
        />

        {/* Main Templates Feed */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          {/* Search banner if searching */}
          {searchQuery && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center justify-between p-3.5 text-xs">
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="size-4 text-primary" />
                  <span>
                    Filtering templates matching: <strong className="text-foreground">&quot;{searchQuery}&quot;</strong> ({filteredDemos.length} found)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={resetSearch}
                  className="gap-1 text-primary hover:text-primary/80"
                >
                  <XIcon className="size-3" />
                  <span>Reset filter</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty state if search returned no templates */}
          {filteredDemos.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <MagnifyingGlassIcon className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">No templates found</h3>
                  <p className="text-xs text-muted-foreground">
                    We couldn&apos;t find any layout templates matching &quot;{searchQuery}&quot;.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetSearch}>
                  Clear search
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {filteredDemos.map(({ slug, title, description }) => {
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
          )}
        </div>
      </div>
    </div>
  )
}
