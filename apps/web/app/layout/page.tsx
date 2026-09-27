import type { Metadata } from "next"
import type { ComponentType } from "react"
import Link from "next/link"
import { LAYOUT_DEMO_META } from "@/lib/layout-demos"
import { SiteLayout } from "@/components/shared/site-layout"
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

export const metadata: Metadata = {
  title: "Layout & Pages — Celestia Design System",
  description:
    "Dedicated full-page demos for every layout component in @celestia-project/ui — open any shell or screen at true viewport size.",
}

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

export default function LayoutIndexPage() {
  return (
    <SiteLayout
      anchors={[]}
      cta={null}
      footerGroups={{}}
      contentMaxWidth="max-w-7xl"
      contentClassName="pb-16"
      footerMaxWidth="max-w-7xl"
    >
      <div className="flex flex-col gap-2 py-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Layout &amp; Pages</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Dedicated full-page demos for the 16 shells and screens in{" "}
          <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            @celestia-project/ui
          </code>
          . Open any component at true viewport size, or read its documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {LAYOUT_DEMO_META.map(({ slug, title, description }) => {
          const Preview = PREVIEWS[slug]
          return (
            <article
              key={slug}
              className="border-border/70 bg-card flex flex-col overflow-hidden rounded-xl border shadow-xs transition-all hover:border-border hover:shadow-md"
            >
              <div className="border-border/50 flex items-center justify-between gap-3 border-b px-4 py-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                  <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                    {description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Link
                    href={`/layout/${slug}`}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors"
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
    </SiteLayout>
  )
}
