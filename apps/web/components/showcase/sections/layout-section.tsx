"use client"

import * as React from "react"
import {
  MoonStarsIcon,
  GoogleLogoIcon,
  GithubLogoIcon,
  HouseIcon,
  ChartLineUpIcon,
  GearSixIcon,
  UsersThreeIcon,
  BellIcon,
  MagnifyingGlassIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  LinkSimpleIcon,
  CalendarBlankIcon,
  TrendDownIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  SignOutIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SquaresFourIcon,
  FunnelSimpleIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react"
import {
  AuthShell,
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  TwoFactorPage,
  PageShell,
  NotFoundPage,
  DashboardShell,
  DashboardPage,
  ProfilePage,
  SettingsPage,
  ListPage,
  BillingPage,
  StatusPage,
  ErrorPage,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Switch,
} from "@celestia-project/ui"
import type {
  DashboardStat,
  ProfileMetaItem,
  ProfileStat,
  ProfileTab,
  SettingsSection,
  ListColumn,
  BillingPlan,
  BillingUsage,
  BillingInvoice,
} from "@celestia-project/ui"
import { ShowcaseCard } from "../showcase-card"
import { cn } from "@celestia-project/ui/lib/utils"

const noop = () => undefined

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", icon: <GoogleLogoIcon className="size-4" /> },
  { id: "github", label: "GitHub", icon: <GithubLogoIcon className="size-4" /> },
]

const PROJECT_ROWS = [
  { name: "Atlas API", meta: "Deployed 12 minutes ago", status: "Live" },
  { name: "Nebula Web", meta: "Build queued", status: "Building" },
  { name: "Comet CLI", meta: "Last release v2.4.1", status: "Stable" },
  { name: "Orbit Mobile", meta: "Review pending", status: "Draft" },
]

function BrandMark() {
  return (
    <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
      <MoonStarsIcon className="size-5" weight="fill" />
    </div>
  )
}

const AUTH_SHELL_CODE = `import * as React from "react"
import { AuthShell, Button } from "@celestia-project/ui"

export function AuthShellDemo() {
  return (
    <AuthShell
      variant="split"
      maxWidth="md"
      logo={<BrandMark />}
      heading="Welcome back"
      subheading="Sign in to your account to continue"
      aside={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">Google</Button>
          <Button variant="outline" className="w-full">GitHub</Button>
        </div>
      }
      sidePanel={
        <div className="flex h-full flex-col justify-end p-10">
          <blockquote className="text-lg font-medium leading-snug">
            Ship faster with a system that already agrees.
          </blockquote>
        </div>
      }
      footer={
        <>
          Don't have an account?{" "}
          <a href="/sign-up" className="text-primary font-medium hover:underline">
            Sign up
          </a>
        </>
      }
    >
      <form>{/* email + password fields */}</form>
    </AuthShell>
  )
}`

const SIGN_IN_CODE = `import * as React from "react"
import { SignInPage } from "@celestia-project/ui"

export function SignInDemo() {
  return (
    <SignInPage
      socialProviders={[
        { id: "google", label: "Google" },
        { id: "github", label: "GitHub" },
      ]}
      onSocialProviderClick={(provider) => {
        // route to your Better Auth social sign-in
        console.log(provider.id)
      }}
      onForgotPassword={() => {
        // router.push("/forgot-password")
      }}
      onSignUp={() => {
        // router.push("/sign-up")
      }}
      onSubmit={({ email, password, remember }) => {
        // auth.signIn.email({ email, password, rememberMe: remember })
      }}
      loading={false}
      error={undefined}
    />
  )
}`

const SIGN_UP_CODE = `import * as React from "react"
import { SignUpPage } from "@celestia-project/ui"

export function SignUpDemo() {
  return (
    <SignUpPage
      termsLabel="I agree to the terms and privacy policy"
      onSignIn={() => {
        // router.push("/sign-in")
      }}
      onSubmit={({ name, email, password }) => {
        // auth.signUp.email({ name, email, password })
      }}
    />
  )
}`

const FORGOT_CODE = `import * as React from "react"
import { ForgotPasswordPage } from "@celestia-project/ui"

export function ForgotPasswordDemo() {
  const [sent, setSent] = React.useState(false)

  return (
    <ForgotPasswordPage
      sent={sent}
      onSubmit={({ email }) => {
        // auth.forgetPassword({ email })
        setSent(true)
      }}
      onBack={() => setSent(false)}
    />
  )
}`

const RESET_CODE = `import * as React from "react"
import { ResetPasswordPage } from "@celestia-project/ui"

export function ResetPasswordDemo() {
  return (
    <ResetPasswordPage
      onSubmit={({ password }) => {
        // auth.resetPassword({ password, token })
      }}
      loading={false}
    />
  )
}`

const TWO_FACTOR_CODE = `import * as React from "react"
import { TwoFactorPage } from "@celestia-project/ui"

export function TwoFactorDemo() {
  return (
    <TwoFactorPage
      length={6}
      onBack={() => {
        // router.push("/sign-in")
      }}
      onResend={() => {
        // auth.sendTwoFactorCode()
      }}
      onSubmit={({ code }) => {
        // auth.verifyTwoFactor({ code })
      }}
    />
  )
}`

const PAGE_SHELL_CODE = `import * as React from "react"
import { PageShell, Button } from "@celestia-project/ui"

export function PageShellDemo() {
  return (
    <PageShell
      title="Projects"
      description="Everything your team is building this quarter."
      width="lg"
      stickyHeader
      actions={
        <>
          <Button variant="outline">Import</Button>
          <Button>New project</Button>
        </>
      }
    >
      {/* scrollable page content */}
    </PageShell>
  )
}`

const NOT_FOUND_CODE = `import * as React from "react"
import { NotFoundPage } from "@celestia-project/ui"

export function NotFoundDemo() {
  return (
    <NotFoundPage
      code="404"
      title="Page not found"
      actionLabel="Go home"
      onAction={() => {
        // router.push("/")
      }}
      secondaryLabel="Contact support"
      onSecondaryAction={() => {
        // router.push("/support")
      }}
    />
  )
}`

const DASHBOARD_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: HouseIcon, active: true },
  { id: "analytics", label: "Analytics", icon: ChartLineUpIcon, active: false },
  { id: "projects", label: "Projects", icon: SquaresFourIcon, active: false },
  { id: "team", label: "Team", icon: UsersThreeIcon, active: false },
  { id: "settings", label: "Settings", icon: GearSixIcon, active: false },
]

const DASHBOARD_STATS: DashboardStat[] = [
  {
    id: "mrr",
    label: "Monthly revenue",
    value: "$48,290",
    delta: "+12.4%",
    trend: "up",
    hint: "vs. last month",
    icon: <ChartLineUpIcon />,
  },
  {
    id: "users",
    label: "Active users",
    value: "12,847",
    delta: "+3.1%",
    trend: "up",
    hint: "vs. last month",
    icon: <UsersThreeIcon />,
  },
  {
    id: "churn",
    label: "Churn",
    value: "1.8%",
    delta: "-0.4%",
    trend: "down",
    hint: "vs. last month",
    icon: <TrendDownIcon />,
  },
  {
    id: "uptime",
    label: "Uptime",
    value: "99.98%",
    delta: "0.0%",
    trend: "flat",
    hint: "last 30 days",
    icon: <ShieldCheckIcon />,
  },
]

const DASHBOARD_ACTIVITY = [
  { id: "1", who: "Nadia", what: "deployed Atlas API", when: "12m" },
  { id: "2", who: "Sam", what: "opened a pull request", when: "48m" },
  { id: "3", who: "Ravi", what: "invited 3 teammates", when: "2h" },
  { id: "4", who: "Ada", what: "changed the billing plan", when: "5h" },
]

const PROFILE_META: ProfileMetaItem[] = [
  { id: "email", icon: <EnvelopeSimpleIcon />, label: "ada@northwind.dev" },
  { id: "location", icon: <MapPinIcon />, label: "Lisbon, Portugal" },
  { id: "site", icon: <LinkSimpleIcon />, label: "ada.northwind.dev" },
  { id: "joined", icon: <CalendarBlankIcon />, label: "Joined March 2023" },
]

const PROFILE_STATS: ProfileStat[] = [
  { id: "posts", value: "128", label: "posts" },
  { id: "followers", value: "4.2k", label: "followers" },
  { id: "projects", value: "17", label: "projects" },
]

const PROFILE_TABS: ProfileTab[] = [
  { id: "overview", label: "Overview", icon: <SquaresFourIcon /> },
  { id: "activity", label: "Activity", icon: <ChartLineUpIcon />, count: 24 },
  { id: "settings", label: "Preferences", icon: <GearSixIcon /> },
]

function DashboardNav() {
  return (
    <nav className="flex flex-col gap-1">
      {DASHBOARD_NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.label}
          title={item.label}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:justify-start",
            item.active
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
          )}
        >
          <item.icon className="size-4 shrink-0" />
          <span className="hidden md:inline">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-border/70 bg-card flex items-start justify-between gap-6 rounded-lg border p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-medium">{label}</span>
        {description && (
          <span className="text-muted-foreground text-xs">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "general",
    label: "General",
    description: "Workspace identity and defaults.",
    icon: <GearSixIcon />,
    content: (
      <div className="flex flex-col gap-3">
        <SettingRow label="Workspace name" description="Shown to every member.">
          <Input defaultValue="Northwind" className="w-44" />
        </SettingRow>
        <SettingRow
          label="Product updates"
          description="A monthly digest of what shipped."
        >
          <Switch defaultChecked />
        </SettingRow>
        <SettingRow
          label="Public profile"
          description="Let anyone see your project list."
        >
          <Switch />
        </SettingRow>
      </div>
    ),
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plan, seats and invoices.",
    icon: <CreditCardIcon />,
    content: (
      <div className="flex flex-col gap-3">
        <SettingRow label="Plan" description="Renews on 1 October.">
          <Badge variant="secondary">Team · 12 seats</Badge>
        </SettingRow>
        <SettingRow label="Payment method" description="Visa ending 4242.">
          <Button variant="outline" size="sm">
            Update
          </Button>
        </SettingRow>
      </div>
    ),
  },
  {
    id: "security",
    label: "Security",
    description: "Sign-in and session policy.",
    icon: <ShieldCheckIcon />,
    content: (
      <div className="flex flex-col gap-3">
        <SettingRow
          label="Two-factor authentication"
          description="Require a code at every sign-in."
        >
          <Switch defaultChecked />
        </SettingRow>
        <SettingRow
          label="Active sessions"
          description="3 devices signed in."
        >
          <Button variant="outline" size="sm">
            <SignOutIcon />
            Sign out all
          </Button>
        </SettingRow>
      </div>
    ),
  },
  {
    id: "danger",
    label: "Danger zone",
    description: "Irreversible actions.",
    icon: <TrashIcon />,
    danger: true,
    content: (
      <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-destructive text-xs font-medium">
            Delete this workspace
          </span>
          <span className="text-muted-foreground text-xs">
            Every project, post and member will be removed. This cannot be
            undone.
          </span>
        </div>
        <Button variant="destructive" size="sm" className="self-start">
          <TrashIcon />
          Delete workspace
        </Button>
      </div>
    ),
  },
]

const LIST_ROWS = [
  {
    id: "prj_01",
    name: "Atlas API",
    owner: "Nadia Okonkwo",
    status: "Live",
    updated: "12 minutes ago",
  },
  {
    id: "prj_02",
    name: "Nebula Web",
    owner: "Sam Iversen",
    status: "Building",
    updated: "48 minutes ago",
  },
  {
    id: "prj_03",
    name: "Comet CLI",
    owner: "Ravi Shah",
    status: "Stable",
    updated: "2 hours ago",
  },
  {
    id: "prj_04",
    name: "Orbit Mobile",
    owner: "Ada Lin",
    status: "Draft",
    updated: "5 hours ago",
  },
  {
    id: "prj_05",
    name: "Pulsar Worker",
    owner: "Mira Chen",
    status: "Live",
    updated: "Yesterday",
  },
  {
    id: "prj_06",
    name: "Vega Docs",
    owner: "Tom Ríos",
    status: "Stable",
    updated: "3 days ago",
  },
]

type ListRow = (typeof LIST_ROWS)[number]

const LIST_COLUMNS: ListColumn<ListRow>[] = [
  {
    id: "name",
    header: "Project",
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.name}</span>
        <span className="text-muted-foreground font-mono text-3xs">
          {row.id}
        </span>
      </div>
    ),
  },
  {
    id: "owner",
    header: "Owner",
    cell: (row) => <span className="text-muted-foreground">{row.owner}</span>,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <Badge variant="secondary">{row.status}</Badge>,
  },
  {
    id: "updated",
    header: "Updated",
    align: "end",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">{row.updated}</span>
    ),
  },
]

const BILLING_PLAN: BillingPlan = {
  name: "Team",
  badge: <Badge variant="secondary">Current plan</Badge>,
  price: "$96",
  interval: "per month, billed annually",
  description: "12 seats, unlimited projects, 90-day history.",
  features: [
    "Unlimited projects and environments",
    "SSO and SCIM provisioning",
    "Priority support with a 4-hour response",
    "90-day deploy history",
  ],
}

const BILLING_USAGE: BillingUsage[] = [
  { id: "seats", label: "Seats", used: 9, limit: 12 },
  {
    id: "builds",
    label: "Build minutes",
    used: 1840,
    limit: 2000,
    format: (used, limit) =>
      `${used.toLocaleString()} / ${limit.toLocaleString()}`,
  },
  {
    id: "storage",
    label: "Artifact storage",
    used: 78,
    limit: 100,
    format: (used, limit) => `${used} GB / ${limit} GB`,
  },
]

const BILLING_INVOICES: BillingInvoice[] = [
  {
    id: "INV-0091",
    date: "1 Sep 2026",
    amount: "$96.00",
    status: <Badge variant="success">Paid</Badge>,
  },
  {
    id: "INV-0084",
    date: "1 Aug 2026",
    amount: "$96.00",
    status: <Badge variant="success">Paid</Badge>,
  },
  {
    id: "INV-0077",
    date: "1 Jul 2026",
    amount: "$72.00",
    status: <Badge variant="secondary">Refunded</Badge>,
  },
]

/**
 * The list demo owns its own search/selection/page state, because `ListPage`
 * deliberately does not filter, sort or paginate for you.
 */
function ListPageDemo() {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<string[]>(["prj_02"])
  const [page, setPage] = React.useState(1)

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return LIST_ROWS
    return LIST_ROWS.filter((row) =>
      [row.name, row.owner, row.status].some((field) =>
        field.toLowerCase().includes(q)
      )
    )
  }, [query])

  return (
    <ListPage
      title="Projects"
      description="Every project in the Northwind workspace."
      width="xl"
      columns={LIST_COLUMNS}
      rows={rows}
      rowKey={(row) => row.id}
      search={{
        value: query,
        onValueChange: setQuery,
        placeholder: "Search projects…",
      }}
      filters={
        <Button variant="outline" size="sm">
          <FunnelSimpleIcon />
          Status
        </Button>
      }
      toolbar={
        <Button size="sm">
          <PlusIcon />
          New project
        </Button>
      }
      selectable
      selectedIds={selected}
      onSelectedIdsChange={setSelected}
      page={page}
      pageCount={3}
      onPageChange={setPage}
      totalLabel={`${rows.length} of ${LIST_ROWS.length} projects${
        selected.length > 0 ? ` · ${selected.length} selected` : ""
      }`}
      empty="No projects match that search."
    />
  )
}

function BillingPageDemo() {
  return (
    <BillingPage
      title="Billing"
      description="Plan, usage and invoices for the Northwind workspace."
      width="xl"
      plan={BILLING_PLAN}
      usage={BILLING_USAGE}
      invoices={BILLING_INVOICES}
      onManagePlan={noop}
      onUpdatePayment={noop}
      actions={
        <Button variant="outline" size="sm">
          <DownloadSimpleIcon />
          Export
        </Button>
      }
      paymentMethod={
        <div className="flex items-center gap-3">
          <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
            <CreditCardIcon className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-xs font-medium">Visa ending 4242</span>
            <span className="text-muted-foreground text-xs">
              Expires 04 / 2029
            </span>
          </span>
        </div>
      }
    />
  )
}

const DASHBOARD_SHELL_CODE = `import * as React from "react"
import { DashboardShell, Button } from "@celestia-project/ui"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      brand={<LogoMark />}
      nav={<AppNav />}
      navFooter={<UserMenu />}
      header={
        <>
          <span className="text-sm font-medium">Overview</span>
          <Button variant="ghost" size="icon-sm"><BellIcon /></Button>
        </>
      }
      aside={<ActivityFeed />}
      contentWidth="xl"
    >
      {children}
    </DashboardShell>
  )
}`

const DASHBOARD_PAGE_CODE = `import * as React from "react"
import { DashboardPage, Card, CardHeader, CardTitle } from "@celestia-project/ui"

export function OverviewPage() {
  return (
    <DashboardPage
      title="Overview"
      description="Everything happening across your workspace."
      width="xl"
      stickyHeader
      statColumns={4}
      actions={<Button size="sm">New project</Button>}
      stats={[
        { id: "mrr", label: "Monthly revenue", value: "$48,290", delta: "+12.4%", trend: "up" },
        { id: "users", label: "Active users", value: "12,847", delta: "+3.1%", trend: "up" },
        { id: "churn", label: "Churn", value: "1.8%", delta: "-0.4%", trend: "down" },
      ]}
      aside={<ActivityFeed />}
    >
      <Card>
        <CardHeader>
          <CardTitle>Traffic</CardTitle>
        </CardHeader>
      </Card>
    </DashboardPage>
  )
}`

const PROFILE_CODE = `import * as React from "react"
import { ProfilePage, Badge, Button } from "@celestia-project/ui"

export function ProfileScreen() {
  return (
    <ProfilePage
      name="Ada Lin"
      handle="@ada"
      headline="Head of Product"
      bio="Building the design system that ships itself."
      avatarFallback="AL"
      badge={<Badge variant="secondary">Pro</Badge>}
      meta={[{ id: "email", label: "ada@northwind.dev", icon: <EnvelopeSimpleIcon /> }]}
      stats={[{ id: "posts", value: "128", label: "posts" }]}
      actions={<Button size="sm">Edit profile</Button>}
      tabs={[
        { id: "overview", label: "Overview" },
        { id: "activity", label: "Activity", count: 24 },
      ]}
    >
      {/* active tab content */}
    </ProfilePage>
  )
}`

const SETTINGS_CODE = `import * as React from "react"
import { SettingsPage } from "@celestia-project/ui"

export function SettingsScreen() {
  return (
    <SettingsPage
      title="Settings"
      description="Manage your workspace."
      sections={[
        {
          id: "general",
          label: "General",
          description: "Workspace identity and defaults.",
          icon: <GearSixIcon />,
          content: <GeneralForm />,
        },
        {
          id: "billing",
          label: "Billing",
          icon: <CreditCardIcon />,
          content: <BillingPanel />,
        },
        {
          id: "danger",
          label: "Danger zone",
          icon: <TrashIcon />,
          danger: true,
          content: <DeleteWorkspace />,
        },
      ]}
    />
  )
}`

const LIST_CODE = `import * as React from "react"
import { ListPage, Button, Badge } from "@celestia-project/ui"
import type { ListColumn } from "@celestia-project/ui"

type Project = { id: string; name: string; owner: string; status: string }

const columns: ListColumn<Project>[] = [
  { id: "name", header: "Project", cell: (row) => row.name },
  { id: "owner", header: "Owner", cell: (row) => row.owner },
  { id: "status", header: "Status", cell: (row) => <Badge>{row.status}</Badge> },
  { id: "updated", header: "Updated", align: "end", cell: (row) => row.updated },
]

export function ProjectsPage() {
  // ListPage does not filter, sort or paginate for you — that stays with
  // whoever owns the data, so there is only one source of truth per page.
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<string[]>([])
  const [page, setPage] = React.useState(1)

  return (
    <ListPage
      title="Projects"
      description="Every project in the workspace."
      width="xl"
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      search={{ value: query, onValueChange: setQuery }}
      toolbar={<Button size="sm">New project</Button>}
      selectable
      selectedIds={selected}
      onSelectedIdsChange={setSelected}
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
      totalLabel="128 projects"
      empty="No projects match that search."
    />
  )
}`

const BILLING_CODE = `import * as React from "react"
import { BillingPage, Badge } from "@celestia-project/ui"
import type { BillingPlan, BillingUsage } from "@celestia-project/ui"

const plan: BillingPlan = {
  name: "Team",
  badge: <Badge variant="secondary">Current plan</Badge>,
  price: "$96",
  interval: "per month, billed annually",
  description: "12 seats, unlimited projects.",
  features: ["Unlimited projects", "SSO and SCIM", "Priority support"],
}

const usage: BillingUsage[] = [
  { id: "seats", label: "Seats", used: 9, limit: 12 },
  {
    id: "builds",
    label: "Build minutes",
    used: 1840,
    limit: 2000,
    format: (used, limit) => used.toLocaleString() + " / " + limit.toLocaleString(),
  },
]

export function BillingScreen() {
  return (
    <BillingPage
      title="Billing"
      description="Plan, usage and invoices."
      width="xl"
      plan={plan}
      usage={usage}
      invoices={invoices}
      onManagePlan={() => router.push("/pricing")}
      onUpdatePayment={() => setPaymentOpen(true)}
      paymentMethod={<PaymentMethodCard />}
    />
  )
}`

const STATUS_CODE = `import * as React from "react"
import { ErrorPage, NotFoundPage, StatusPage } from "@celestia-project/ui"

// A 500, with the digest a support ticket actually needs. Omit \`detail\`
// and the technical block does not render at all.
export function ServerError() {
  return (
    <ErrorPage
      detail="digest_8f3a91c2"
      onAction={() => window.location.reload()}
      secondaryLabel="Contact support"
      onSecondaryAction={() => router.push("/support")}
    />
  )
}

// The same frame, for a status the two defaults do not cover.
export function Forbidden() {
  return (
    <StatusPage
      code="403"
      title="You do not have access"
      description="Ask a workspace admin to invite you."
      actionLabel="Back to dashboard"
      onAction={() => router.push("/")}
    />
  )
}

// NotFoundPage is the 404 default, on that same shell.
export function Missing() {
  return <NotFoundPage onAction={() => router.push("/")} />
}`

export function LayoutSection() {
  const [authVariant, setAuthVariant] = React.useState<"centered" | "split">("centered")
  const [signInLoading, setSignInLoading] = React.useState(false)
  const [resetSent, setResetSent] = React.useState(false)

  const handleSignIn = () => {
    setSignInLoading(true)
    window.setTimeout(() => setSignInLoading(false), 1200)
  }

  return (
    <div id="layout" className="flex flex-col gap-6 pt-6 pb-16">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Layout & Pages
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          16 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Auth Shell */}
        <ShowcaseCard
          id="auth-shell"
          docsSlug="auth-shell"
          title="Auth Shell"
          category="Layout"
          description="Authentication page frame with logo, heading, provider aside, footer, and centered or split-screen variants."
          importSnippet={`import { AuthShell } from "@celestia-project/ui"`}
          codeExample={AUTH_SHELL_CODE}
          className="md:col-span-2"
        >
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center gap-1 self-center">
              <Button
                variant={authVariant === "centered" ? "secondary" : "ghost"}
                size="xs"
                className="h-6 text-[11px]"
                onClick={() => setAuthVariant("centered")}
              >
                Centered
              </Button>
              <Button
                variant={authVariant === "split" ? "secondary" : "ghost"}
                size="xs"
                className="h-6 text-[11px]"
                onClick={() => setAuthVariant("split")}
              >
                Split
              </Button>
            </div>
            <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
              <AuthShell
                className="h-full min-h-0"
                variant={authVariant}
                maxWidth="sm"
                logo={<BrandMark />}
                heading="Celestia"
                subheading="The design system that ships itself."
                aside={
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                      <GoogleLogoIcon className="size-4" />
                      Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      <GithubLogoIcon className="size-4" />
                      GitHub
                    </Button>
                  </div>
                }
                sidePanel={
                  <div className="flex h-full flex-col justify-end gap-3 p-10">
                    <blockquote className="text-foreground text-lg font-medium leading-snug tracking-tight">
                      “Celestia cut our design-to-ship time in half.”
                    </blockquote>
                    <p className="text-muted-foreground text-sm">
                      Ada Lin — Head of Product, Northwind
                    </p>
                  </div>
                }
                footer={
                  <>
                    By continuing you agree to our{" "}
                    <span className="text-foreground font-medium">Terms of Service</span>
                  </>
                }
              >
                <Button className="w-full">Continue with email</Button>
              </AuthShell>
            </div>
          </div>
        </ShowcaseCard>

        {/* 2. Sign In Page */}
        <ShowcaseCard
          id="sign-in-page"
          docsSlug="sign-in-page"
          title="Sign In Page"
          category="Layout"
          description="Ready-made credential sign-in with social providers, remember-me, error and loading states."
          importSnippet={`import { SignInPage } from "@celestia-project/ui"`}
          codeExample={SIGN_IN_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <SignInPage
              className="h-full min-h-0"
              socialProviders={SOCIAL_PROVIDERS}
              onSocialProviderClick={noop}
              onForgotPassword={noop}
              onSignUp={noop}
              onSubmit={handleSignIn}
              loading={signInLoading}
            />
          </div>
        </ShowcaseCard>

        {/* 3. Sign Up Page */}
        <ShowcaseCard
          id="sign-up-page"
          docsSlug="sign-up-page"
          title="Sign Up Page"
          category="Layout"
          description="Registration screen with name, email, password confirmation, terms gate and mismatch validation."
          importSnippet={`import { SignUpPage } from "@celestia-project/ui"`}
          codeExample={SIGN_UP_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <SignUpPage
              className="h-full min-h-0"
              termsLabel="I agree to the terms and privacy policy"
              onSignIn={noop}
              onSubmit={noop}
            />
          </div>
        </ShowcaseCard>

        {/* 4. Forgot Password Page */}
        <ShowcaseCard
          id="forgot-password-page"
          docsSlug="forgot-password-page"
          title="Forgot Password Page"
          category="Layout"
          description="Email recovery request that swaps to a confirmation state once the reset link has been sent."
          importSnippet={`import { ForgotPasswordPage } from "@celestia-project/ui"`}
          codeExample={FORGOT_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <ForgotPasswordPage
              className="h-full min-h-0"
              sent={resetSent}
              onSubmit={() => setResetSent(true)}
              onBack={() => setResetSent(false)}
            />
          </div>
        </ShowcaseCard>

        {/* 5. Reset Password Page */}
        <ShowcaseCard
          id="reset-password-page"
          docsSlug="reset-password-page"
          title="Reset Password Page"
          category="Layout"
          description="New-password form with live confirmation matching and a disabled submit until the pair agrees."
          importSnippet={`import { ResetPasswordPage } from "@celestia-project/ui"`}
          codeExample={RESET_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <ResetPasswordPage className="h-full min-h-0" onSubmit={noop} />
          </div>
        </ShowcaseCard>

        {/* 6. Two-Factor Page */}
        <ShowcaseCard
          id="two-factor-page"
          docsSlug="two-factor-page"
          title="Two-Factor Page"
          category="Layout"
          description="OTP challenge built on InputOTP with configurable length, resend link and back navigation."
          importSnippet={`import { TwoFactorPage } from "@celestia-project/ui"`}
          codeExample={TWO_FACTOR_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <TwoFactorPage
              className="h-full min-h-0"
              onBack={noop}
              onResend={noop}
              onSubmit={noop}
            />
          </div>
        </ShowcaseCard>

        {/* 7. Page Shell */}
        <ShowcaseCard
          id="page-shell"
          docsSlug="page-shell"
          title="Page Shell"
          category="Layout"
          description="App page frame with blurred sticky header, title, description, trailing actions and width presets."
          importSnippet={`import { PageShell } from "@celestia-project/ui"`}
          codeExample={PAGE_SHELL_CODE}
          className="md:col-span-2"
        >
          <div className="h-80 w-full overflow-hidden rounded-lg border border-border bg-background">
            <PageShell
              className="h-full"
              title="Projects"
              description="Everything your team is building this quarter."
              width="lg"
              actions={
                <>
                  <Button variant="outline" size="sm">
                    Import
                  </Button>
                  <Button size="sm">New project</Button>
                </>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {PROJECT_ROWS.map((row) => (
                  <div
                    key={row.name}
                    className="rounded-lg border border-border/70 bg-card p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {row.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                        {row.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{row.meta}</p>
                  </div>
                ))}
              </div>
            </PageShell>
          </div>
        </ShowcaseCard>

        {/* 8. Not Found Page */}
        <ShowcaseCard
          id="not-found-page"
          docsSlug="not-found-page"
          title="Not Found Page"
          category="Layout"
          description="404 state with oversized status code, optional icon slot, and primary and secondary calls to action."
          importSnippet={`import { NotFoundPage } from "@celestia-project/ui"`}
          codeExample={NOT_FOUND_CODE}
        >
          <div className="h-72 w-full overflow-hidden rounded-lg border border-border">
            <NotFoundPage
              className="h-full min-h-0"
              onAction={noop}
              onSecondaryAction={noop}
              secondaryLabel="Contact support"
            />
          </div>
        </ShowcaseCard>

        {/* 9. Dashboard Shell */}
        <ShowcaseCard
          id="dashboard-shell"
          docsSlug="dashboard-shell"
          title="Dashboard Shell"
          category="Layout"
          description="Signed-in app frame: navigation rail with brand and footer slots, sticky header, scrolling content column and an optional right rail."
          importSnippet={`import { DashboardShell } from "@celestia-project/ui"`}
          codeExample={DASHBOARD_SHELL_CODE}
          className="md:col-span-2"
        >
          <div className="h-[32rem] w-full overflow-hidden rounded-lg border border-border">
            <DashboardShell
              className="h-full min-h-0"
              contentWidth="xl"
              brand={
                <span className="flex items-center gap-2 font-semibold">
                  <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
                    <MoonStarsIcon className="size-4" weight="fill" />
                  </span>
                  <span className="hidden text-sm md:inline">Celestia</span>
                </span>
              }
              nav={<DashboardNav />}
              navFooter={
                <div className="flex items-center justify-center gap-2 md:justify-start">
                  <Avatar>
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <span className="hidden min-w-0 flex-col md:flex">
                    <span className="truncate text-xs font-medium">Ada Lin</span>
                    <span className="text-muted-foreground truncate text-3xs">
                      ada@northwind.dev
                    </span>
                  </span>
                </div>
              }
              header={
                <>
                  <span className="text-sm font-medium">Overview</span>
                  <div className="ms-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" title="Search">
                      <MagnifyingGlassIcon />
                    </Button>
                    <Button variant="ghost" size="icon-sm" title="Notifications">
                      <BellIcon />
                    </Button>
                  </div>
                </>
              }
              aside={
                <>
                  <span className="text-xs font-medium">Activity</span>
                  <div className="flex flex-col gap-3">
                    {DASHBOARD_ACTIVITY.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-2">
                        <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-3xs font-medium">
                          {entry.who.slice(0, 1)}
                        </span>
                        <span className="min-w-0 flex-1 text-xs">
                          <span className="font-medium">{entry.who}</span>{" "}
                          <span className="text-muted-foreground">
                            {entry.what}
                          </span>
                        </span>
                        <span className="text-muted-foreground shrink-0 text-3xs tabular-nums">
                          {entry.when}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {PROJECT_ROWS.map((row) => (
                  <Card key={row.name} size="sm">
                    <CardContent className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">{row.name}</span>
                        <Badge variant="secondary">{row.status}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">{row.meta}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DashboardShell>
          </div>
        </ShowcaseCard>

        {/* 10. Dashboard Page */}
        <ShowcaseCard
          id="dashboard-page"
          docsSlug="dashboard-page"
          title="Dashboard Page"
          category="Layout"
          description="Overview page with a metric tile grid, loading skeletons, empty slot and a secondary column — composed on top of PageShell."
          importSnippet={`import { DashboardPage } from "@celestia-project/ui"`}
          codeExample={DASHBOARD_PAGE_CODE}
          className="md:col-span-2"
        >
          <div className="h-[32rem] w-full overflow-y-auto rounded-lg border border-border bg-background">
            <DashboardPage
              className="h-full"
              title="Overview"
              description="Everything happening across your workspace."
              width="xl"
              statColumns={4}
              stats={DASHBOARD_STATS}
              actions={
                <>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                  <Button size="sm">
                    <PlusIcon />
                    New project
                  </Button>
                </>
              }
              aside={
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Activity</CardTitle>
                    <CardDescription>Last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {DASHBOARD_ACTIVITY.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-2">
                        <span className="bg-muted size-1.5 shrink-0 rounded-full" />
                        <span className="min-w-0 flex-1 truncate text-xs">
                          <span className="font-medium">{entry.who}</span>{" "}
                          <span className="text-muted-foreground">
                            {entry.what}
                          </span>
                        </span>
                        <span className="text-muted-foreground shrink-0 text-3xs tabular-nums">
                          {entry.when}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>
                    Everything your team is building this quarter.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {PROJECT_ROWS.map((row) => (
                    <div
                      key={row.name}
                      className="border-border/70 rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">{row.name}</span>
                        <Badge variant="secondary">{row.status}</Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {row.meta}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </DashboardPage>
          </div>
        </ShowcaseCard>

        {/* 11. Profile Page */}
        <ShowcaseCard
          id="profile-page"
          docsSlug="profile-page"
          title="Profile Page"
          category="Layout"
          description="Banner, overlapping avatar, identity block, metadata and headline numbers, with a sliding line-variant tab bar over the content."
          importSnippet={`import { ProfilePage } from "@celestia-project/ui"`}
          codeExample={PROFILE_CODE}
          className="md:col-span-2"
        >
          <div className="h-[32rem] w-full overflow-y-auto rounded-lg border border-border bg-background">
            <ProfilePage
              name="Ada Lin"
              handle="@ada · ada@northwind.dev"
              headline="Head of Product"
              bio="Building the design system that ships itself. Previously platform at Northwind — now making sure the next team does not have to rewrite the button."
              avatarFallback="AL"
              badge={<Badge variant="secondary">Pro</Badge>}
              meta={PROFILE_META}
              stats={PROFILE_STATS}
              actions={
                <>
                  <Button variant="outline" size="sm">
                    <LinkSimpleIcon />
                    Copy link
                  </Button>
                  <Button size="sm">
                    <PencilSimpleIcon />
                    Edit profile
                  </Button>
                </>
              }
              tabs={PROFILE_TABS}
              defaultValue="overview"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {PROJECT_ROWS.map((row) => (
                  <Card key={row.name} size="sm">
                    <CardContent className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">{row.name}</span>
                        <Badge variant="secondary">{row.status}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">{row.meta}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ProfilePage>
          </div>
        </ShowcaseCard>

        {/* 12. Settings Page */}
        <ShowcaseCard
          id="settings-page"
          docsSlug="settings-page"
          title="Settings Page"
          category="Layout"
          description="Section navigation beside stacked panels. Inactive panels stay mounted, so half-typed input survives a section switch."
          importSnippet={`import { SettingsPage } from "@celestia-project/ui"`}
          codeExample={SETTINGS_CODE}
          className="md:col-span-2"
        >
          <div className="h-[32rem] w-full overflow-y-auto rounded-lg border border-border bg-background">
            <SettingsPage
              title="Settings"
              description="Manage your workspace, plan and security policy."
              sections={SETTINGS_SECTIONS}
              actions={<Button size="sm">Save changes</Button>}
            />
          </div>
        </ShowcaseCard>

        {/* 13. List Page */}
        <ShowcaseCard
          id="list-page"
          docsSlug="list-page"
          title="List Page"
          category="Layout"
          description="The table-driven index screen: toolbar with search and filters, optional row selection with a select-all, loading skeletons, an empty state and pagination."
          importSnippet={`import { ListPage } from "@celestia-project/ui"`}
          codeExample={LIST_CODE}
          className="md:col-span-2"
        >
          <div className="h-[34rem] w-full overflow-y-auto rounded-lg border border-border bg-background">
            <ListPageDemo />
          </div>
        </ShowcaseCard>

        {/* 14. Billing Page */}
        <ShowcaseCard
          id="billing-page"
          docsSlug="billing-page"
          title="Billing Page"
          category="Layout"
          description="Current plan, usage meters against their limits, payment method and invoice history. Every figure is a prop — it never computes a prorated amount or a renewal date."
          importSnippet={`import { BillingPage } from "@celestia-project/ui"`}
          codeExample={BILLING_CODE}
          className="md:col-span-2"
        >
          <div className="h-[38rem] w-full overflow-y-auto rounded-lg border border-border bg-background">
            <BillingPageDemo />
          </div>
        </ShowcaseCard>

        {/* 15. Status & Error Pages */}
        <ShowcaseCard
          id="status-page"
          docsSlug="status-page"
          title="Status & Error Pages"
          category="Layout"
          description="One full-viewport frame behind every not-the-page-you-asked-for state. NotFoundPage and ErrorPage are thin wrappers over StatusPage; what separates them is whether a technical digest is surfaced."
          importSnippet={`import { StatusPage, ErrorPage, NotFoundPage } from "@celestia-project/ui"`}
          codeExample={STATUS_CODE}
          className="md:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-72 w-full overflow-hidden rounded-lg border border-border">
              <ErrorPage
                className="h-full min-h-0"
                detail="digest_8f3a91c2"
                onAction={noop}
                onSecondaryAction={noop}
                secondaryLabel="Contact support"
              />
            </div>
            <div className="h-72 w-full overflow-hidden rounded-lg border border-border">
              <StatusPage
                className="h-full min-h-0"
                code="403"
                title="You do not have access"
                description="Ask a workspace admin to invite you."
                actionLabel="Back to dashboard"
                onAction={noop}
              />
            </div>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}