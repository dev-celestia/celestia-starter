// Page templates for the /layout gallery — each file is meant to be copied
// whole into an app and is not exported from @celestia-project/ui. The slot-only
// shells they compose on (AuthShell, PageShell, DashboardShell, MarketingShell)
// ship as package composites; this barrel exists only for the web app's own
// gallery previews.
export * from "./sign-in-page"
export * from "./sign-up-page"
export * from "./forgot-password-page"
export * from "./reset-password-page"
export * from "./two-factor-page"
export * from "./dashboard-page"
export * from "./profile-page"
export * from "./settings-page"
export * from "./list-page"
export * from "./billing-page"
export * from "./status-page"
export * from "./not-found-page"
export * from "./error-page"

// Marketing & content
export * from "./landing-page"
export * from "./pricing-page"
export * from "./blog-index-page"
export * from "./article-page"

// Collaboration
export * from "./inbox-page"
export * from "./chat-page"
export * from "./kanban-page"
export * from "./calendar-page"
export * from "./files-page"

// Data & insights
export * from "./analytics-page"
export * from "./reports-page"
export * from "./record-detail-page"
export * from "./search-page"
export * from "./audit-log-page"

// Commerce & flows
export * from "./checkout-page"
export * from "./invoice-page"
export * from "./onboarding-page"
export * from "./team-page"
export * from "./integrations-page"
