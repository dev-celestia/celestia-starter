"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BellIcon,
  CalendarBlankIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  CodeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  FigmaLogoIcon,
  FolderIcon,
  FunnelSimpleIcon,
  GearSixIcon,
  GithubLogoIcon,
  GlobeIcon,
  GoogleLogoIcon,
  HashIcon,
  HouseIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MegaphoneIcon,
  MoonStarsIcon,
  NotionLogoIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
  PlusIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SlackLogoIcon,
  SparkleIcon,
  SquaresFourIcon,
  StarIcon,
  StripeLogoIcon,
  TrendDownIcon,
  TrashIcon,
  TrayIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import {
  AnalyticsPage,
  ArticlePage,
  AuditLogPage,
  BillingPage,
  BlogIndexPage,
  CalendarPage,
  ChatPage,
  CheckoutPage,
  DashboardPage,
  ErrorPage,
  FilesPage,
  ForgotPasswordPage,
  InboxPage,
  IntegrationsPage,
  InvoicePage,
  KanbanPage,
  LandingPage,
  ListPage,
  NotFoundPage,
  OnboardingPage,
  PricingPage,
  ProfilePage,
  RecordDetailPage,
  ReportsPage,
  ResetPasswordPage,
  SearchPage,
  SettingsPage,
  SignInPage,
  SignUpPage,
  StatusPage,
  TeamPage,
  TwoFactorPage,
} from "@/components/layout-templates"
import {
  AuthShell,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartArea,
  DashboardShell,
  Input,
  Label,
  MarketingShell,
  PageShell,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui"
import type {
  AnalyticsBreakdownRow,
  AuditEvent,
  BillingInvoice,
  BillingPlan,
  BillingUsage,
  BlogPost,
  CalendarAgendaItem,
  CalendarDay,
  ChatChannel,
  ChatMember,
  ChatThreadMessage,
  CheckoutSummaryRow,
  DashboardStat,
  FileEntry,
  InboxFolder,
  InboxMessage,
  Integration,
  InvoiceLineItem,
  InvoiceTotal,
  KanbanColumn,
  LandingFeature,
  LandingMetric,
  ListColumn,
  OnboardingStep,
  PricingPlan,
  ProfileMetaItem,
  ProfileStat,
  ProfileTab,
  ReportEntry,
  SearchFacet,
  SearchResult,
  SettingsSection,
  TeamMember,
} from "@/components/layout-templates"
import { cn } from "@celestia-project/ui/lib/utils"
import { getLayoutDemoMeta, PACKAGE_COMPOSITE_SLUGS } from "@/lib/layout-demos"
import { CodeBlock } from "@/components/shared/code-block"
import { CopyTemplateButton } from "./copy-template-button"

const noop = () => undefined

// Full-page demos: every component renders at true viewport size under the
// stage bar. Components built on PageShell (min-h-0 flex-1) sit inside a
// flex column wrapper; shells that own min-h-svh get h-full min-h-0 instead.

function BrandMark() {
  return (
    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <MoonStarsIcon className="size-5" weight="fill" />
    </div>
  )
}

function ShellColumn({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full min-h-0 flex-col">{children}</div>
}

const PROJECT_ROWS = [
  {
    id: "prj_01",
    name: "Atlas API",
    meta: "Deployed 12 minutes ago",
    status: "Live",
  },
  {
    id: "prj_02",
    name: "Nebula Web",
    meta: "Build queued",
    status: "Building",
  },
  {
    id: "prj_03",
    name: "Comet CLI",
    meta: "Last release v2.4.1",
    status: "Stable",
  },
  {
    id: "prj_04",
    name: "Orbit Mobile",
    meta: "Review pending",
    status: "Draft",
  },
]

function ProjectCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROJECT_ROWS.map((row) => (
        <div
          key={row.id}
          className="rounded-lg border border-border/70 bg-card p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">{row.name}</span>
            <Badge variant="secondary">{row.status}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{row.meta}</p>
        </div>
      ))}
    </div>
  )
}

const SOCIAL_PROVIDERS = [
  {
    id: "google",
    label: "Google",
    icon: <GoogleLogoIcon className="size-4" />,
  },
  {
    id: "github",
    label: "GitHub",
    icon: <GithubLogoIcon className="size-4" />,
  },
]

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: HouseIcon, active: true },
  { id: "analytics", label: "Analytics", icon: ChartLineUpIcon, active: false },
  { id: "projects", label: "Projects", icon: SquaresFourIcon, active: false },
  { id: "team", label: "Team", icon: UsersThreeIcon, active: false },
  { id: "settings", label: "Settings", icon: GearSixIcon, active: false },
]

function DashboardNav() {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
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

const ACTIVITY = [
  { id: "1", who: "Nadia", what: "deployed Atlas API", when: "12m" },
  { id: "2", who: "Sam", what: "opened a pull request", when: "48m" },
  { id: "3", who: "Ravi", what: "invited 3 teammates", when: "2h" },
  { id: "4", who: "Ada", what: "changed the billing plan", when: "5h" },
]

function ActivityList() {
  return (
    <div className="flex flex-col gap-3">
      {ACTIVITY.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-3xs font-medium text-muted-foreground">
            {entry.who.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 text-xs">
            <span className="font-medium">{entry.who}</span>{" "}
            <span className="text-muted-foreground">{entry.what}</span>
          </span>
          <span className="shrink-0 text-3xs text-muted-foreground tabular-nums">
            {entry.when}
          </span>
        </div>
      ))}
    </div>
  )
}

const STATS: DashboardStat[] = [
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
    <div className="flex items-start justify-between gap-6 rounded-lg border border-border/70 bg-card p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-medium">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const SETTING_SECTIONS: SettingsSection[] = [
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
        <SettingRow label="Active sessions" description="3 devices signed in.">
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
      <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-destructive">
            Delete this workspace
          </span>
          <span className="text-xs text-muted-foreground">
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
        <span className="font-mono text-3xs text-muted-foreground">
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

function AuthShellDemo() {
  return (
    <AuthShell
      className="h-full min-h-0"
      maxWidth="md"
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
      footer={
        <>
          By continuing you agree to our{" "}
          <span className="font-medium text-foreground">Terms of Service</span>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-shell-demo-email">Email</Label>
          <Input
            id="auth-shell-demo-email"
            type="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-shell-demo-password">Password</Label>
          <Input
            id="auth-shell-demo-password"
            type="password"
            placeholder="Enter your password"
          />
        </div>
        <Button type="button" className="w-full">
          Continue with email
        </Button>
      </form>
    </AuthShell>
  )
}

function SignInPageDemo() {
  const [loading, setLoading] = React.useState(false)

  return (
    <SignInPage
      className="h-full min-h-0"
      socialProviders={SOCIAL_PROVIDERS}
      onSocialProviderClick={noop}
      onForgotPassword={noop}
      onSignUp={noop}
      onSubmit={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 1200)
      }}
      loading={loading}
    />
  )
}

function SignUpPageDemo() {
  return (
    <SignUpPage
      className="h-full min-h-0"
      termsLabel="I agree to the terms and privacy policy"
      onSignIn={noop}
      onSubmit={noop}
    />
  )
}

function ForgotPasswordPageDemo() {
  const [sent, setSent] = React.useState(false)

  return (
    <ForgotPasswordPage
      className="h-full min-h-0"
      sent={sent}
      onSubmit={() => setSent(true)}
      onBack={() => setSent(false)}
    />
  )
}

function PageShellDemo() {
  return (
    <ShellColumn>
      <PageShell
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
        <ProjectCards />
      </PageShell>
    </ShellColumn>
  )
}

function DashboardShellDemo() {
  return (
    <DashboardShell
      className="h-full min-h-0"
      contentWidth="xl"
      brand={
        <span className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
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
            <span className="truncate text-3xs text-muted-foreground">
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
          <ActivityList />
        </>
      }
    >
      <ProjectCards />
    </DashboardShell>
  )
}

function DashboardPageDemo() {
  return (
    <ShellColumn>
      <DashboardPage
        title="Overview"
        description="Everything happening across your workspace."
        width="xl"
        statColumns={4}
        stats={STATS}
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
            <CardContent>
              <ActivityList />
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
          <CardContent>
            <ProjectCards />
          </CardContent>
        </Card>
      </DashboardPage>
    </ShellColumn>
  )
}

function ProfilePageDemo() {
  return (
    <ProfilePage
      className="h-full min-h-0"
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
      <ProjectCards />
    </ProfilePage>
  )
}

function SettingsPageDemo() {
  return (
    <ShellColumn>
      <SettingsPage
        title="Settings"
        description="Manage your workspace, plan and security policy."
        sections={SETTING_SECTIONS}
        actions={<Button size="sm">Save changes</Button>}
      />
    </ShellColumn>
  )
}

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
    <ShellColumn>
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
    </ShellColumn>
  )
}

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

function BillingPageDemo() {
  return (
    <ShellColumn>
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
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <CreditCardIcon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-medium">Visa ending 4242</span>
              <span className="text-xs text-muted-foreground">
                Expires 04 / 2029
              </span>
            </span>
          </div>
        }
      />
    </ShellColumn>
  )
}

function ResetPasswordPageDemo() {
  return <ResetPasswordPage className="h-full min-h-0" onSubmit={noop} />
}

function TwoFactorPageDemo() {
  return (
    <TwoFactorPage
      className="h-full min-h-0"
      onBack={noop}
      onResend={noop}
      onSubmit={noop}
    />
  )
}

function StatusPageDemo() {
  return (
    <StatusPage
      className="h-full min-h-0"
      code="403"
      title="You do not have access"
      description="Ask a workspace admin to invite you."
      actionLabel="Back to dashboard"
      onAction={noop}
    />
  )
}

function NotFoundPageDemo() {
  return (
    <NotFoundPage
      className="h-full min-h-0"
      onAction={noop}
      secondaryLabel="Contact support"
      onSecondaryAction={noop}
    />
  )
}

function ErrorPageDemo() {
  return (
    <ErrorPage
      className="h-full min-h-0"
      detail="digest_8f3a91c2"
      onAction={noop}
      secondaryLabel="Contact support"
      onSecondaryAction={noop}
    />
  )
}

// ─── Marketing & content demos ──────────────────────────────────────────────

const MARKETING_LINKS = ["Product", "Pricing", "Docs", "Blog"]

function MarketingNavLinks() {
  return (
    <>
      {MARKETING_LINKS.map((item) => (
        <button
          key={item}
          type="button"
          className="rounded-md px-2.5 py-1.5 transition-colors hover:text-foreground"
        >
          {item}
        </button>
      ))}
    </>
  )
}

function MarketingBrand() {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <MoonStarsIcon className="size-3.5" weight="fill" />
      </span>
      Celestia
    </span>
  )
}

const LANDING_FEATURES: LandingFeature[] = [
  {
    id: "layouts",
    icon: <SquaresFourIcon />,
    title: "36 page layouts",
    description:
      "Shells, auth, screens, marketing and system states — every frame pre-wired to the same tokens.",
  },
  {
    id: "tokens",
    icon: <SparkleIcon />,
    title: "Measured tokens",
    description:
      "Colour ramps scored against WCAG pairings rather than eyeballed. Contrast is asserted in CI.",
  },
  {
    id: "install",
    icon: <RocketLaunchIcon />,
    title: "Install, don't copy",
    description:
      "Features land as packages, so upgrading the system never means diffing a hundred files.",
  },
]

const LANDING_METRICS: LandingMetric[] = [
  { id: "layouts", value: "36", label: "Page layouts" },
  { id: "components", value: "180+", label: "Components" },
  { id: "contrast", value: "AA", label: "Contrast floor" },
  { id: "packages", value: "6", label: "Installable features" },
]

function MarketingShellDemo() {
  return (
    <MarketingShell
      stickyNav
      announcement="Celestia 0.4 is out — 36 layouts, one design system."
      logo={<MarketingBrand />}
      nav={<MarketingNavLinks />}
      actions={
        <>
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button size="sm">Start free</Button>
        </>
      }
      footer={
        <div className="grid gap-8 sm:grid-cols-4">
          {["Product", "Developers", "Company", "Legal"].map((group) => (
            <div key={group} className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground">
                {group}
              </span>
              {["Overview", "Pricing", "Changelog"].map((link) => (
                <span key={link} className="text-3xs text-muted-foreground">
                  {link}
                </span>
              ))}
            </div>
          ))}
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-3xs font-medium text-muted-foreground">
          <MegaphoneIcon className="size-3" />
          v0.4.0
        </span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance text-foreground">
          Ship the interface, not the scaffolding
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every page frame your product needs, wired to one set of tokens.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button>
            Get started
            <ArrowRightIcon />
          </Button>
          <Button variant="outline">Read the docs</Button>
        </div>
      </div>
    </MarketingShell>
  )
}

function LandingPageDemo() {
  return (
    <MarketingShell
      stickyNav
      logo={<MarketingBrand />}
      nav={<MarketingNavLinks />}
      actions={<Button size="sm">Start free</Button>}
      footer={
        <span className="text-3xs text-muted-foreground">
          © 2026 Celestia Labs — the design system that ships itself.
        </span>
      }
    >
      <LandingPage
        eyebrow={
          <>
            <SparkleIcon className="size-3" />
            New in 0.4
          </>
        }
        heading="The design system that ships itself"
        subheading="Layouts, pages and primitives for teams that would rather build the product than the scaffolding around it."
        primaryAction={
          <Button>
            Get started
            <ArrowRightIcon />
          </Button>
        }
        secondaryAction={<Button variant="outline">Book a demo</Button>}
        features={LANDING_FEATURES}
        metrics={LANDING_METRICS}
        cta={{
          title: "Start building today",
          description:
            "Clone the starter, install a feature, and have a real screen by the end of the afternoon.",
          action: (
            <Button>
              Create an account
              <ArrowRightIcon />
            </Button>
          ),
        }}
      />
    </MarketingShell>
  )
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    interval: "Free forever",
    description: "For side projects and evaluation.",
    features: ["3 projects", "Community support", "1 GB storage"],
    action: (
      <Button variant="outline" className="w-full">
        Start free
      </Button>
    ),
  },
  {
    id: "team",
    name: "Team",
    price: "$12",
    annualPrice: "$9",
    interval: "per seat, per month, billed annually",
    description: "For product teams shipping weekly.",
    features: [
      "Unlimited projects and environments",
      "SSO and SCIM provisioning",
      "90-day history",
      "Priority support, 4-hour response",
    ],
    highlighted: true,
    badge: "Most popular",
    action: <Button className="w-full">Start 14-day trial</Button>,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    interval: "Billed annually",
    description: "For regulated and multi-region teams.",
    features: ["Audit log export", "Dedicated region", "99.99% uptime SLA"],
    action: (
      <Button variant="outline" className="w-full">
        Contact sales
      </Button>
    ),
  },
]

function PricingPageDemo() {
  return (
    <MarketingShell
      logo={<MarketingBrand />}
      nav={<MarketingNavLinks />}
      actions={<Button size="sm">Start free</Button>}
    >
      <PricingPage
        eyebrow="Pricing"
        heading="Simple, per-seat pricing"
        description="Every plan includes the full component library. Upgrade for seats, history and support."
        plans={PRICING_PLANS}
        note="Prices in USD. Cancel any time — no exit fees."
      />
    </MarketingShell>
  )
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "tokens",
    title: "Scoring a colour ramp instead of eyeballing it",
    excerpt:
      "A status hue is a fill under white ink and ink on near-white. Both reduce to the same inequality.",
    category: "Design",
    author: "Ada Lin",
    date: "12 Sep",
    readingTime: "8 min",
  },
  {
    id: "layouts",
    title: "Thirty-six page frames, one set of tokens",
    excerpt:
      "How the layout family grew from three shells to a full catalogue without forking the palette.",
    category: "Engineering",
    author: "Ravi Shah",
    date: "4 Sep",
    readingTime: "6 min",
  },
  {
    id: "gates",
    title: "The contrast gate that fails when it should",
    excerpt:
      "A check that can emit a uniform verdict is not decisive. Here is how we proved ours is not.",
    category: "Engineering",
    author: "Sam Iversen",
    date: "28 Aug",
    readingTime: "11 min",
  },
  {
    id: "mobile",
    title: "A 44pt floor that survives a density change",
    excerpt:
      "Why the mobile ramp pins both status hues to the same lightness, and what that buys.",
    category: "Design",
    author: "Mira Chen",
    date: "21 Aug",
    readingTime: "7 min",
  },
]

function BlogIndexPageDemo() {
  const [category, setCategory] = React.useState("All")
  const categories = ["All", "Engineering", "Design", "Product"]

  const posts =
    category === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.category === category)

  return (
    <MarketingShell
      logo={<MarketingBrand />}
      nav={<MarketingNavLinks />}
      actions={<Button size="sm">Subscribe</Button>}
    >
      <BlogIndexPage
        eyebrow="Journal"
        heading="Notes from the design system"
        description="Deep dives on tokens, layout, and the machinery that keeps them honest."
        categories={categories}
        activeCategory={category}
        onCategoryChange={setCategory}
        featured={{
          id: "featured",
          title: "Why the destructive token is darker than you think",
          excerpt:
            "Measured in OKLCH, primary and destructive sat a tenth of a degree apart in hue — same hue, different lightness. The fix was in the relationship, not the values.",
          category: "Design",
          author: "Ada Lin",
          date: "18 Sep",
          readingTime: "9 min",
        }}
        posts={posts}
      />
    </MarketingShell>
  )
}

function ArticlePageDemo() {
  return (
    <MarketingShell
      stickyNav
      logo={<MarketingBrand />}
      nav={<MarketingNavLinks />}
      actions={<Button size="sm">Subscribe</Button>}
    >
      <ArticlePage
        category="Engineering"
        title="Thirty-six page frames, one set of tokens"
        description="How the layout family grew from three shells to a full catalogue without forking the palette."
        author={{
          name: "Ravi Shah",
          role: "Design systems",
          avatarFallback: "RS",
        }}
        publishedAt="4 Sep 2026"
        readingTime="6 min read"
        toc={[
          { id: "start", label: "Where we started" },
          { id: "slots", label: "Slot-based frames" },
          { id: "collapse", label: "Collapse order", level: 2 },
          { id: "tokens", label: "One set of tokens" },
        ]}
        related={[
          {
            id: "r1",
            title: "Scoring a colour ramp",
            category: "Design",
            readingTime: "8 min",
          },
          {
            id: "r2",
            title: "The contrast gate",
            category: "Engineering",
            readingTime: "11 min",
          },
          {
            id: "r3",
            title: "Installing a feature",
            category: "Product",
            readingTime: "4 min",
          },
        ]}
      >
        <p className="text-sm leading-relaxed text-foreground">
          The layout family started as three shells: an authentication frame, a
          page frame, and a dashboard frame. Each was written for one screen and
          copied for the next, which worked right up until the fourth screen
          needed a variant the copy did not have.
        </p>
        <h2
          id="slots"
          className="pt-2 font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          Slot-based frames
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The fix was to stop describing screens and start describing slots. A
          shell takes the navigation the consumer already has, rather than
          inventing a navigation model and asking the consumer to adopt it.
        </p>
        <blockquote className="border-s-2 border-primary/40 ps-4 text-sm leading-relaxed text-foreground italic">
          “A layout you can adopt beats a layout you can only copy.”
        </blockquote>
        <h2
          id="collapse"
          className="pt-2 font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          Collapse order
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Every multi-pane frame collapses its panes in order of how little they
          are needed. The folder rail goes first, then the reading pane. The
          order is not cosmetic: a rail that survives past the point where the
          content needs the width is a rail that starves the thing people came
          for.
        </p>
        <h2
          id="tokens"
          className="pt-2 font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          One set of tokens
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That distinction is what let the catalogue grow without the palette
          growing with it. Every frame still draws from the same ramp.
        </p>
      </ArticlePage>
    </MarketingShell>
  )
}

// ─── Collaboration demos ────────────────────────────────────────────────────

const INBOX_FOLDERS: InboxFolder[] = [
  { id: "inbox", label: "Inbox", icon: <TrayIcon />, count: 4 },
  { id: "starred", label: "Starred", icon: <StarIcon /> },
  { id: "sent", label: "Sent", icon: <PaperPlaneTiltIcon /> },
  { id: "archive", label: "Archive", icon: <FolderIcon /> },
]

const INBOX_MESSAGES: InboxMessage[] = [
  {
    id: "m1",
    from: "Nadia Okonkwo",
    subject: "Atlas API rollout plan",
    preview: "Staging is green. Can we cut the release candidate on Thursday?",
    time: "09:12",
    unread: true,
  },
  {
    id: "m2",
    from: "Sam Iversen",
    subject: "Contrast gate is failing on the new ramp",
    preview: "Two pairings dropped below 3:1 once the warning hue moved.",
    time: "08:40",
    unread: true,
  },
  {
    id: "m3",
    from: "Ravi Shah",
    subject: "Layout catalogue — first pass",
    preview:
      "Twenty frames, all drawing from the same tokens. Screenshots attached.",
    time: "Yesterday",
  },
  {
    id: "m4",
    from: "Ada Lin",
    subject: "Billing plan change",
    preview: "Moved the workspace to Team ahead of the seat increase.",
    time: "Yesterday",
  },
  {
    id: "m5",
    from: "Mira Chen",
    subject: "Mobile token ceiling",
    preview:
      "The 0.18333 lightness ceiling still holds after the density change.",
    time: "2 days ago",
  },
]

function InboxPageDemo() {
  const [folder, setFolder] = React.useState("inbox")
  const [message, setMessage] = React.useState("m2")

  return (
    <ShellColumn>
      <InboxPage
        className="h-full"
        folders={INBOX_FOLDERS}
        activeFolderId={folder}
        onFolderChange={setFolder}
        messages={INBOX_MESSAGES}
        activeMessageId={message}
        onSelectMessage={setMessage}
        toolbar={
          <>
            <Input
              type="search"
              placeholder="Search mail…"
              className="h-8 w-full"
              aria-label="Search mail"
            />
          </>
        }
        readingHeader={
          <>
            <span className="text-sm font-medium text-foreground">
              Contrast gate is failing on the new ramp
            </span>
            <div className="ms-auto flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" title="Archive">
                <TrayIcon />
              </Button>
              <Button variant="ghost" size="icon-sm" title="Star">
                <StarIcon />
              </Button>
            </div>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>SI</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-medium text-foreground">
                Sam Iversen
              </span>
              <span className="text-3xs text-muted-foreground">
                to design-systems@northwind.dev
              </span>
            </div>
            <span className="ms-auto text-3xs text-muted-foreground">
              Today, 08:40
            </span>
          </div>
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              Two pairings dropped below 3:1 once the warning hue moved. Both
              are on the destructive ramp, and both pass on their own — it is
              the relationship against the neighbouring step that broke.
            </p>
            <p>
              I re-ran the census and the only failing rows are the two you
              would expect. Everything else is unchanged, so this is a one-value
              fix rather than a ramp rewrite.
            </p>
            <p>
              Proposed value is in the branch. If it holds I will fold it into
              the token file and re-run the gate before the release cut.
            </p>
          </div>
        </div>
      </InboxPage>
    </ShellColumn>
  )
}

const CHAT_CHANNELS: ChatChannel[] = [
  { id: "general", label: "general" },
  { id: "design", label: "design", unread: 3 },
  { id: "eng", label: "engineering" },
  { id: "releases", label: "releases" },
  { id: "random", label: "random" },
]

const CHAT_MESSAGES: ChatThreadMessage[] = [
  {
    id: "c1",
    author: "Nadia",
    time: "09:04",
    avatarFallback: "NO",
    body: "Pushed the twenty new frames to the layout page. All green.",
  },
  {
    id: "c2",
    author: "Sam",
    time: "09:06",
    avatarFallback: "SI",
    body: "Nice. Did the collapse order survive the tablet breakpoint?",
  },
  {
    id: "c3",
    author: "Ada",
    time: "09:08",
    avatarFallback: "AL",
    body: "It does — rail goes first, then the reading pane. Screenshots are in the PR.",
    own: true,
  },
  {
    id: "c4",
    author: "Ravi",
    time: "09:11",
    avatarFallback: "RS",
    body: "The kanban column width is the one I would double-check at 1280.",
  },
  {
    id: "c5",
    author: "Ada",
    time: "09:12",
    avatarFallback: "AL",
    body: "Checked — 288px fixed, track scrolls. No wrap.",
    own: true,
  },
]

const CHAT_MEMBERS: ChatMember[] = [
  {
    id: "1",
    name: "Ada Lin",
    role: "Product",
    avatarFallback: "AL",
    online: true,
  },
  {
    id: "2",
    name: "Nadia Okonkwo",
    role: "Platform",
    avatarFallback: "NO",
    online: true,
  },
  {
    id: "3",
    name: "Sam Iversen",
    role: "Design systems",
    avatarFallback: "SI",
  },
  {
    id: "4",
    name: "Ravi Shah",
    role: "Engineering",
    avatarFallback: "RS",
    online: true,
  },
  { id: "5", name: "Mira Chen", role: "Mobile", avatarFallback: "MC" },
]

function ChatPageDemo() {
  const [channel, setChannel] = React.useState("design")
  const [draft, setDraft] = React.useState("")

  return (
    <ShellColumn>
      <ChatPage
        className="h-full"
        channels={CHAT_CHANNELS}
        activeChannelId={channel}
        onChannelChange={setChannel}
        messages={CHAT_MESSAGES}
        members={CHAT_MEMBERS}
        header={
          <>
            <HashIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">design</span>
            <span className="text-3xs text-muted-foreground">
              5 members · 3 unread
            </span>
          </>
        }
        composer={
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Message #design"
              className="flex-1"
              aria-label="Message"
            />
            <Button title="Send">
              <PaperPlaneTiltIcon />
              Send
            </Button>
          </div>
        }
      />
    </ShellColumn>
  )
}

const BOARD_COLUMNS: KanbanColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      {
        id: "b1",
        title: "Audit the mobile token ramp",
        meta: "DS-441 · due 12 Oct",
        tags: ["tokens"],
        assignee: "Mira",
      },
      {
        id: "b2",
        title: "Document the Skia runtime",
        meta: "DS-455",
        tags: ["docs"],
        assignee: "Ravi",
      },
      {
        id: "b3",
        title: "Split the AI barrel export",
        meta: "DS-462",
        tags: ["build"],
        assignee: "Sam",
      },
    ],
  },
  {
    id: "progress",
    title: "In progress",
    tone: "info",
    cards: [
      {
        id: "p1",
        title: "Twenty new layout frames",
        meta: "DS-460 · 8 of 20 reviewed",
        tags: ["layouts"],
        assignee: "Nadia",
        tone: "info",
      },
      {
        id: "p2",
        title: "Contrast gate: warning pairing",
        meta: "DS-458 · blocking release",
        tags: ["a11y"],
        assignee: "Sam",
        tone: "warning",
      },
      {
        id: "p3",
        title: "Marketing shell slots",
        meta: "DS-459",
        tags: ["marketing"],
        assignee: "Ada",
      },
    ],
  },
  {
    id: "review",
    title: "In review",
    tone: "warning",
    cards: [
      {
        id: "r1",
        title: "Pricing page billing toggle",
        meta: "DS-449 · waiting on copy",
        tags: ["marketing"],
        assignee: "Ravi",
      },
      {
        id: "r2",
        title: "Inbox collapse order",
        meta: "DS-452",
        tags: ["collab"],
        assignee: "Nadia",
        tone: "info",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tone: "success",
    cards: [
      {
        id: "d1",
        title: "Derive the destructive edge",
        meta: "DS-431 · shipped in 0.3.2",
        tags: ["tokens"],
        assignee: "Ada",
        tone: "success",
      },
      {
        id: "d2",
        title: "Ship the docs sidebar",
        meta: "DS-427",
        tags: ["docs"],
        assignee: "Sam",
        tone: "success",
      },
      {
        id: "d3",
        title: "Mobile 44pt floor",
        meta: "DS-418",
        tags: ["mobile"],
        assignee: "Mira",
      },
    ],
  },
]

function KanbanPageDemo() {
  return (
    <ShellColumn>
      <KanbanPage
        className="h-full"
        title="Design system board"
        description="Everything in flight this sprint, across four stages."
        columns={BOARD_COLUMNS}
        actions={
          <>
            <Button variant="outline" size="sm">
              <FunnelSimpleIcon />
              Filter
            </Button>
            <Button size="sm">
              <PlusIcon />
              New task
            </Button>
          </>
        }
      />
    </ShellColumn>
  )
}

const CALENDAR_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const CALENDAR_DAYS: CalendarDay[] = [
  { id: "d1", date: 28, outside: true },
  { id: "d2", date: 29, outside: true },
  { id: "d3", date: 30, outside: true },
  {
    id: "d4",
    date: 1,
    events: [{ id: "e1", title: "Design review", tone: "info" }],
  },
  { id: "d5", date: 2 },
  { id: "d6", date: 3 },
  { id: "d7", date: 4 },
  {
    id: "d8",
    date: 5,
    events: [{ id: "e2", title: "Sprint planning", tone: "success" }],
  },
  {
    id: "d9",
    date: 6,
    today: true,
    events: [
      { id: "e3", title: "Contrast gate", tone: "warning" },
      { id: "e4", title: "Standup", tone: "info" },
      { id: "e5", title: "Release cut", tone: "destructive" },
    ],
  },
  { id: "d10", date: 7 },
  {
    id: "d11",
    date: 8,
    events: [{ id: "e6", title: "Office hours", tone: "info" }],
  },
  { id: "d12", date: 9 },
  { id: "d13", date: 10 },
  {
    id: "d14",
    date: 11,
    events: [{ id: "e7", title: "Retro", tone: "success" }],
  },
  { id: "d15", date: 12 },
  { id: "d16", date: 13 },
  {
    id: "d17",
    date: 14,
    events: [{ id: "e8", title: "Docs freeze", tone: "warning" }],
  },
  { id: "d18", date: 15 },
  { id: "d19", date: 16 },
  {
    id: "d20",
    date: 17,
    events: [{ id: "e9", title: "Token audit", tone: "info" }],
  },
  { id: "d21", date: 18 },
  { id: "d22", date: 19 },
  { id: "d23", date: 20 },
  {
    id: "d24",
    date: 21,
    events: [{ id: "e10", title: "Design review", tone: "info" }],
  },
  { id: "d25", date: 22 },
  { id: "d26", date: 23 },
  { id: "d27", date: 24 },
  { id: "d28", date: 25 },
  { id: "d29", date: 26 },
  { id: "d30", date: 27 },
  {
    id: "d31",
    date: 28,
    events: [{ id: "e11", title: "Sprint review", tone: "success" }],
  },
  { id: "d32", date: 29 },
  { id: "d33", date: 30 },
  { id: "d34", date: 31 },
  { id: "d35", date: 1, outside: true },
]

const CALENDAR_AGENDA: CalendarAgendaItem[] = [
  {
    id: "a1",
    time: "09:00",
    title: "Standup",
    meta: "Design system",
    tone: "info",
  },
  {
    id: "a2",
    time: "11:30",
    title: "Contrast gate review",
    meta: "Sam · 30 min",
    tone: "warning",
  },
  {
    id: "a3",
    time: "15:00",
    title: "Release cut 0.4.0",
    meta: "Nadia · 45 min",
    tone: "destructive",
  },
  {
    id: "a4",
    time: "16:30",
    title: "Office hours",
    meta: "Open to the team",
    tone: "info",
  },
]

function CalendarPageDemo() {
  const [day, setDay] = React.useState("d9")

  return (
    <ShellColumn>
      <CalendarPage
        className="h-full"
        title="Schedule"
        description="Sprint 24 — design system."
        actions={<Button size="sm">New event</Button>}
        monthLabel="October 2026"
        weekdays={CALENDAR_WEEKDAYS}
        days={CALENDAR_DAYS}
        agenda={CALENDAR_AGENDA}
        selectedDayId={day}
        onSelectDay={setDay}
      />
    </ShellColumn>
  )
}

const FILE_FOLDERS = [
  { id: "designs", name: "Designs", count: 48 },
  { id: "exports", name: "Exports", count: 112 },
  { id: "docs", name: "Docs", count: 26 },
  { id: "archive", name: "Archive", count: 340 },
]

const FILE_ENTRIES: FileEntry[] = [
  {
    id: "f1",
    name: "token-ramp.fig",
    kind: "Figma",
    size: "4.2 MB",
    modified: "2 hours ago",
    owner: "Ada Lin",
  },
  {
    id: "f2",
    name: "contrast-report.csv",
    kind: "CSV",
    size: "88 KB",
    modified: "Yesterday",
    owner: "Sam Iversen",
  },
  {
    id: "f3",
    name: "layout-catalogue.pdf",
    kind: "PDF",
    size: "12.4 MB",
    modified: "3 days ago",
    owner: "Ravi Shah",
  },
  {
    id: "f4",
    name: "brand-marks",
    kind: "Folder",
    size: "—",
    modified: "Last week",
    owner: "Nadia Okonkwo",
  },
  {
    id: "f5",
    name: "release-0.4.0.zip",
    kind: "Archive",
    size: "64.1 MB",
    modified: "Last week",
    owner: "Nadia Okonkwo",
  },
  {
    id: "f6",
    name: "mobile-tokens.json",
    kind: "JSON",
    size: "41 KB",
    modified: "2 weeks ago",
    owner: "Mira Chen",
  },
]

function FilesPageDemo() {
  const [folder, setFolder] = React.useState("designs")

  return (
    <ShellColumn>
      <FilesPage
        className="h-full"
        title="Files"
        description="Shared assets for the design system workspace."
        breadcrumb={["Workspace", "Northwind", "Designs"]}
        folders={FILE_FOLDERS}
        activeFolderId={folder}
        onFolderChange={setFolder}
        files={FILE_ENTRIES}
        actions={<Button size="sm">Upload</Button>}
        toolbar={
          <>
            <Input
              type="search"
              placeholder="Search files…"
              className="h-8 w-56"
              aria-label="Search files"
            />
            <Button variant="outline" size="sm" className="ms-auto">
              <FunnelSimpleIcon />
              Type
            </Button>
          </>
        }
      />
    </ShellColumn>
  )
}

// ─── Data & insights demos ──────────────────────────────────────────────────

const ANALYTICS_SERIES = [
  { month: "Apr", revenue: 4200, expenses: 2400 },
  { month: "May", revenue: 5100, expenses: 2900 },
  { month: "Jun", revenue: 4800, expenses: 2700 },
  { month: "Jul", revenue: 6200, expenses: 3100 },
  { month: "Aug", revenue: 5900, expenses: 3300 },
  { month: "Sep", revenue: 7400, expenses: 3600 },
]

const ANALYTICS_METRICS: DashboardStat[] = [
  {
    id: "visitors",
    label: "Visitors",
    value: "128,470",
    delta: "+12.4%",
    trend: "up",
    hint: "vs. last month",
    icon: <UsersThreeIcon />,
  },
  {
    id: "conversion",
    label: "Conversion",
    value: "4.18%",
    delta: "+0.6%",
    trend: "up",
    hint: "vs. last month",
    icon: <ChartLineUpIcon />,
  },
  {
    id: "revenue",
    label: "Revenue",
    value: "$48,290",
    delta: "+9.1%",
    trend: "up",
    hint: "vs. last month",
    icon: <CurrencyDollarIcon />,
  },
  {
    id: "bounce",
    label: "Bounce rate",
    value: "31.2%",
    delta: "-2.4%",
    trend: "down",
    hint: "vs. last month",
    icon: <TrendDownIcon />,
  },
]

const ANALYTICS_BREAKDOWN: AnalyticsBreakdownRow[] = [
  { id: "organic", label: "Organic search", value: "52,110", share: 41 },
  { id: "direct", label: "Direct", value: "38,940", share: 30 },
  { id: "referral", label: "Referral", value: "21,320", share: 17 },
  { id: "social", label: "Social", value: "16,100", share: 12 },
]

function AnalyticsPageDemo() {
  return (
    <ShellColumn>
      <AnalyticsPage
        className="h-full"
        title="Analytics"
        description="Traffic, conversion and revenue for the last 30 days."
        actions={
          <Button variant="outline" size="sm">
            <DownloadSimpleIcon />
            Export
          </Button>
        }
        metrics={ANALYTICS_METRICS}
        chart={
          <ChartArea
            data={ANALYTICS_SERIES}
            xKey="month"
            showLegend
            className="h-64"
          />
        }
        chartTitle="Revenue against expenses"
        chartDescription="Monthly totals for the last six months."
        breakdown={ANALYTICS_BREAKDOWN}
        breakdownTitle="Top sources"
        breakdownDescription="Share of sessions in the period."
      />
    </ShellColumn>
  )
}

const REPORT_ENTRIES: ReportEntry[] = [
  {
    id: "r1",
    name: "Weekly revenue",
    description: "MRR, expansion and churn",
    schedule: "Every Monday, 09:00",
    status: "ready",
    lastRun: "3 days ago",
    owner: "Finance",
  },
  {
    id: "r2",
    name: "Contrast census",
    description: "All WCAG pairings per theme",
    schedule: "On every commit",
    status: "running",
    owner: "Design systems",
  },
  {
    id: "r3",
    name: "Seat utilisation",
    description: "Active seats against plan",
    schedule: "Every Friday, 17:00",
    status: "ready",
    lastRun: "6 days ago",
    owner: "Operations",
  },
  {
    id: "r4",
    name: "Audit export",
    description: "Signed activity log",
    schedule: "Monthly",
    status: "failed",
    lastRun: "12 days ago",
    owner: "Security",
  },
  {
    id: "r5",
    name: "Cohort retention",
    description: "Week-over-week by signup cohort",
    status: "draft",
    owner: "Growth",
  },
]

function ReportsPageDemo() {
  return (
    <ShellColumn>
      <ReportsPage
        className="h-full"
        title="Reports"
        description="Saved reports, their cadence and their last result."
        reports={REPORT_ENTRIES}
        actions={
          <Button size="sm">
            <PlusIcon />
            New report
          </Button>
        }
      />
    </ShellColumn>
  )
}

function RecordDetailPageDemo() {
  return (
    <ShellColumn>
      <RecordDetailPage
        className="h-full"
        name="Ada Lin"
        subtitle="ada@northwind.dev · Lisbon, Portugal"
        status={<Badge variant="success">Active</Badge>}
        avatarFallback="AL"
        actions={
          <>
            <Button variant="outline" size="sm">
              <LinkSimpleIcon />
              Copy link
            </Button>
            <Button size="sm">
              <PencilSimpleIcon />
              Edit
            </Button>
          </>
        }
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "activity", label: "Activity", count: 24 },
          { id: "billing", label: "Billing" },
        ]}
        defaultTab="overview"
        metadata={[
          { id: "role", label: "Role", value: "Head of Product" },
          { id: "team", label: "Team", value: "Design systems" },
          { id: "joined", label: "Joined", value: "March 2023" },
          { id: "seats", label: "Seats", value: "9 of 12" },
          {
            id: "plan",
            label: "Plan",
            value: <Badge variant="secondary">Team</Badge>,
          },
        ]}
      >
        <Card size="sm">
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Building the design system that ships itself.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Previously platform at Northwind — now making sure the next team
              does not have to rewrite the button.
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { id: "posts", value: "128", label: "Posts" },
            { id: "reviews", value: "412", label: "Reviews" },
            { id: "projects", value: "17", label: "Projects" },
          ].map((stat) => (
            <Card key={stat.id} size="sm">
              <CardContent className="flex flex-col gap-0.5">
                <span className="font-heading text-xl font-semibold text-foreground tabular-nums">
                  {stat.value}
                </span>
                <span className="text-3xs text-muted-foreground">
                  {stat.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </RecordDetailPage>
    </ShellColumn>
  )
}

const SEARCH_FACETS: SearchFacet[] = [
  {
    id: "type",
    label: "Type",
    options: [
      { id: "layout", label: "Layout", count: 36, checked: true },
      { id: "primitive", label: "Primitive", count: 48 },
      { id: "composite", label: "Composite", count: 33 },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { id: "stable", label: "Stable", count: 102, checked: true },
      { id: "beta", label: "Beta", count: 12 },
      { id: "deprecated", label: "Deprecated", count: 3 },
    ],
  },
  {
    id: "owner",
    label: "Owner",
    options: [
      { id: "design", label: "Design systems", count: 64 },
      { id: "platform", label: "Platform", count: 22 },
    ],
  },
]

const SEARCH_RESULTS: SearchResult[] = [
  {
    id: "s1",
    title: "Dashboard Shell",
    excerpt:
      "Signed-in app frame: navigation rail with brand and footer slots, sticky header, scrolling content column and an optional right rail.",
    meta: "apps/web/components/layout-templates/dashboard-shell.tsx",
    badge: <Badge variant="success">Stable</Badge>,
  },
  {
    id: "s2",
    title: "Page Shell",
    excerpt:
      "App page frame with blurred sticky header, title, description, trailing actions and width presets.",
    meta: "apps/web/components/layout-templates/page-shell.tsx",
    badge: <Badge variant="success">Stable</Badge>,
  },
  {
    id: "s3",
    title: "Auth Shell",
    excerpt:
      "Authentication page frame with logo, heading, provider aside, footer, and centered or split-screen variants.",
    meta: "apps/web/components/layout-templates/auth-shell.tsx",
    badge: <Badge variant="success">Stable</Badge>,
  },
  {
    id: "s4",
    title: "Marketing Shell",
    excerpt:
      "Public-page frame: announcement strip, navigation bar, body and footer band.",
    meta: "apps/web/components/layout-templates/marketing-shell.tsx",
    badge: <Badge variant="info">Beta</Badge>,
  },
]

function SearchPageDemo() {
  const [query, setQuery] = React.useState("shell")

  const results = SEARCH_RESULTS.filter((result) =>
    result.title.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <ShellColumn>
      <SearchPage
        className="h-full"
        title="Search"
        description="Across components, layouts and documentation."
        query={query}
        onQueryChange={setQuery}
        placeholder="Search the design system…"
        facets={SEARCH_FACETS}
        results={results}
        totalLabel={`${results.length} of ${SEARCH_RESULTS.length} results in 0.04s`}
      />
    </ShellColumn>
  )
}

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "a1",
    actor: "Ada Lin",
    action: "changed the billing plan to",
    target: "Team",
    time: "Today, 09:41",
    ip: "203.0.113.24",
    tone: "info",
  },
  {
    id: "a2",
    actor: "Nadia Okonkwo",
    action: "deployed",
    target: "atlas-api@2.4.1",
    time: "Today, 08:12",
    ip: "198.51.100.7",
    tone: "success",
  },
  {
    id: "a3",
    actor: "Sam Iversen",
    action: "rotated the signing key for",
    target: "web",
    time: "Yesterday, 17:03",
    ip: "198.51.100.19",
    tone: "warning",
  },
  {
    id: "a4",
    actor: "System",
    action: "blocked a sign-in attempt from",
    target: "unknown device",
    time: "Yesterday, 03:27",
    ip: "192.0.2.88",
    tone: "destructive",
  },
  {
    id: "a5",
    actor: "Ravi Shah",
    action: "invited 3 teammates to",
    target: "Northwind",
    time: "2 days ago",
    ip: "203.0.113.51",
  },
  {
    id: "a6",
    actor: "Mira Chen",
    action: "archived the project",
    target: "comet-cli",
    time: "3 days ago",
    ip: "203.0.113.77",
  },
]

function AuditLogPageDemo() {
  return (
    <ShellColumn>
      <AuditLogPage
        className="h-full"
        title="Audit log"
        description="Every privileged action in the workspace, newest first."
        events={AUDIT_EVENTS}
        actions={
          <Button variant="outline" size="sm">
            <DownloadSimpleIcon />
            Export
          </Button>
        }
        filters={
          <>
            <Input
              type="search"
              placeholder="Filter by actor…"
              className="h-8 w-56"
              aria-label="Filter by actor"
            />
            <Button variant="outline" size="sm">
              <FunnelSimpleIcon />
              Action
            </Button>
            <Button variant="outline" size="sm">
              <ClockCounterClockwiseIcon />
              Last 7 days
            </Button>
          </>
        }
      />
    </ShellColumn>
  )
}

// ─── Commerce & flows demos ─────────────────────────────────────────────────

const CHECKOUT_SUMMARY: CheckoutSummaryRow[] = [
  { id: "seats", label: "Team plan × 12", value: "$1,080.00" },
  { id: "annual", label: "Annual discount", value: "−$216.00" },
  { id: "tax", label: "Estimated tax", value: "$69.12" },
  {
    id: "trial",
    label: "14-day trial credit",
    value: "Applied",
    muted: true,
  },
]

const CHECKOUT_STEPS = [
  { id: "account", label: "Account" },
  { id: "payment", label: "Payment" },
  { id: "confirm", label: "Confirm" },
]

function CheckoutPageDemo() {
  const [step, setStep] = React.useState("payment")
  const index = CHECKOUT_STEPS.findIndex((item) => item.id === step)

  return (
    <ShellColumn>
      <CheckoutPage
        className="h-full"
        title="Checkout"
        description="Twelve seats on the Team plan, billed annually."
        steps={CHECKOUT_STEPS}
        activeStep={step}
        summary={CHECKOUT_SUMMARY}
        total={{ label: "Due today", value: "$933.12" }}
        summaryNote="Charged on the first day after your trial. Cancel any time before then."
        submitLabel={
          index === CHECKOUT_STEPS.length - 1 ? "Place order" : "Continue"
        }
        backLabel="Back"
        onBack={() => setStep(CHECKOUT_STEPS[Math.max(index - 1, 0)]!.id)}
        onSubmit={() =>
          setStep(
            CHECKOUT_STEPS[Math.min(index + 1, CHECKOUT_STEPS.length - 1)]!.id
          )
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
            <CardDescription>
              Cards are tokenised — we never store the number.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <CreditCardIcon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-xs font-medium text-foreground">
                  Visa ending 4242
                </span>
                <span className="text-3xs text-muted-foreground">
                  Expires 04 / 2029
                </span>
              </span>
              <Button variant="ghost" size="sm" className="ms-auto">
                Change
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-name">Name on card</Label>
                <Input id="checkout-name" defaultValue="Ada Lin" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-postcode">Postal code</Label>
                <Input id="checkout-postcode" defaultValue="1100-052" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing address</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Northwind Labs
              <br />
              Rua da Prata 80, 1100-052
              <br />
              Lisbon, Portugal
            </p>
          </CardContent>
        </Card>
      </CheckoutPage>
    </ShellColumn>
  )
}

const INVOICE_ITEMS: InvoiceLineItem[] = [
  {
    id: "l1",
    description: "Team plan",
    detail: "12 seats, September 2026",
    quantity: "12",
    rate: "$9.00",
    amount: "$108.00",
  },
  {
    id: "l2",
    description: "Build minutes overage",
    detail: "1,840 of 2,000 used",
    quantity: "1",
    rate: "$18.00",
    amount: "$18.00",
  },
  {
    id: "l3",
    description: "Artifact storage",
    detail: "78 GB of 100 GB included",
    quantity: "1",
    rate: "$0.00",
    amount: "$0.00",
  },
  {
    id: "l4",
    description: "Priority support",
    detail: "4-hour response window",
    quantity: "1",
    rate: "$45.00",
    amount: "$45.00",
  },
]

const INVOICE_TOTALS: InvoiceTotal[] = [
  { label: "Subtotal", value: "$171.00" },
  { label: "VAT 23%", value: "$39.33", muted: true },
  { label: "Trial credit", value: "−$18.00", muted: true },
  { label: "Total due", value: "$192.33", strong: true },
]

function InvoicePageDemo() {
  return (
    <ShellColumn>
      <InvoicePage
        className="h-full"
        title="Invoice"
        description="Northwind Labs — September 2026."
        number="INV-0091"
        status={<Badge variant="success">Paid</Badge>}
        issuedAt="1 Sep 2026"
        dueAt="15 Sep 2026"
        actions={
          <Button size="sm">
            <DownloadSimpleIcon />
            Download PDF
          </Button>
        }
        from={{
          name: "Celestia Labs",
          lines: [
            "Rua da Prata 80",
            "1100-052 Lisbon",
            "Portugal",
            "VAT PT123456789",
          ],
        }}
        to={{
          name: "Northwind Labs",
          lines: [
            "12 Harbour Street",
            "Dublin D02 XY45",
            "Ireland",
            "VAT IE9876543A",
          ],
        }}
        lineItems={INVOICE_ITEMS}
        totals={INVOICE_TOTALS}
        notes="Payable within 14 days. Questions? billing@celestia.dev."
      />
    </ShellColumn>
  )
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "profile", label: "Your profile", description: "Name and avatar" },
  { id: "workspace", label: "Workspace", description: "Name and data region" },
  {
    id: "invite",
    label: "Invite teammates",
    description: "Optional — you can skip",
  },
  { id: "finish", label: "Finish", description: "Pick a starting point" },
]

function OnboardingPageDemo() {
  const [step, setStep] = React.useState("workspace")

  return (
    <ShellColumn>
      <OnboardingPage
        className="h-full"
        title="Set up your workspace"
        description="Four short steps — every one of them can be changed later."
        steps={ONBOARDING_STEPS}
        activeStep={step}
        onStepChange={setStep}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              Name your workspace
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              This is what your team sees in the sidebar and on every
              invitation.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="onboarding-name">Workspace name</Label>
            <Input
              id="onboarding-name"
              defaultValue="Northwind"
              className="max-w-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">
              Data region
            </span>
            <div className="flex flex-wrap gap-2">
              {["EU West", "US East", "Asia Pacific"].map((region) => (
                <span
                  key={region}
                  className={cn(
                    "inline-flex h-8 items-center rounded-lg border px-3 text-xs",
                    region === "EU West"
                      ? "border-primary/60 bg-primary/5 font-medium text-foreground"
                      : "border-border/70 text-muted-foreground"
                  )}
                >
                  {region}
                </span>
              ))}
            </div>
            <span className="text-3xs text-muted-foreground">
              Data never leaves the region you choose.
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button variant="outline">Back</Button>
            <Button>
              Continue
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </OnboardingPage>
    </ShellColumn>
  )
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "t1",
    name: "Ada Lin",
    email: "ada@northwind.dev",
    role: "Owner",
    status: "active",
    avatarFallback: "AL",
  },
  {
    id: "t2",
    name: "Nadia Okonkwo",
    email: "nadia@northwind.dev",
    role: "Admin",
    status: "active",
    avatarFallback: "NO",
  },
  {
    id: "t3",
    name: "Sam Iversen",
    email: "sam@northwind.dev",
    role: "Member",
    status: "active",
    avatarFallback: "SI",
  },
  {
    id: "t4",
    name: "Ravi Shah",
    email: "ravi@northwind.dev",
    role: "Member",
    status: "invited",
    avatarFallback: "RS",
  },
  {
    id: "t5",
    name: "Mira Chen",
    email: "mira@northwind.dev",
    role: "Viewer",
    status: "suspended",
    avatarFallback: "MC",
  },
]

function TeamPageDemo() {
  return (
    <ShellColumn>
      <TeamPage
        className="h-full"
        title="Team"
        description="9 of 12 seats used on the Team plan."
        members={TEAM_MEMBERS}
        actions={<Button size="sm">Invite</Button>}
        invite={
          <>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                Invite teammates
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                They join as members. You can change a role afterwards.
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="team-email">Email address</Label>
              <Input
                id="team-email"
                type="email"
                placeholder="name@company.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="team-role">Role</Label>
              <Input id="team-role" defaultValue="Member" />
            </div>
            <Button className="w-full">
              <PaperPlaneTiltIcon />
              Send invitation
            </Button>
            <p className="text-3xs leading-relaxed text-muted-foreground">
              Invitations expire after 7 days. You can revoke one at any time.
            </p>
          </>
        }
      />
    </ShellColumn>
  )
}

const INTEGRATION_CATEGORIES = [
  "All",
  "Communication",
  "Code",
  "Design",
  "Finance",
]

const INTEGRATIONS: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Post build and release events to a channel.",
    category: "Communication",
    connected: true,
    icon: <SlackLogoIcon />,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Link pull requests to issues and deployment previews.",
    category: "Code",
    connected: true,
    icon: <GithubLogoIcon />,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Pull tokens and frames into the catalogue.",
    category: "Design",
    connected: false,
    icon: <FigmaLogoIcon />,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Sync plans, seats and invoice history.",
    category: "Finance",
    connected: true,
    icon: <StripeLogoIcon />,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Publish component docs to a shared wiki.",
    category: "Design",
    connected: false,
    icon: <NotionLogoIcon />,
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Send signed events to any HTTPS endpoint.",
    category: "Code",
    connected: false,
    icon: <GlobeIcon />,
  },
]

function IntegrationsPageDemo() {
  const [category, setCategory] = React.useState("All")

  const integrations =
    category === "All"
      ? INTEGRATIONS
      : INTEGRATIONS.filter((item) => item.category === category)

  return (
    <ShellColumn>
      <IntegrationsPage
        className="h-full"
        title="Integrations"
        description="Connect the tools your team already uses."
        actions={<Button size="sm">Request an app</Button>}
        categories={INTEGRATION_CATEGORIES}
        activeCategory={category}
        onCategoryChange={setCategory}
        integrations={integrations}
      />
    </ShellColumn>
  )
}

const DEMOS: Record<string, React.ComponentType> = {
  "auth-shell": AuthShellDemo,
  "page-shell": PageShellDemo,
  "dashboard-shell": DashboardShellDemo,
  "sign-in-page": SignInPageDemo,
  "sign-up-page": SignUpPageDemo,
  "forgot-password-page": ForgotPasswordPageDemo,
  "reset-password-page": ResetPasswordPageDemo,
  "two-factor-page": TwoFactorPageDemo,
  "dashboard-page": DashboardPageDemo,
  "profile-page": ProfilePageDemo,
  "settings-page": SettingsPageDemo,
  "list-page": ListPageDemo,
  "billing-page": BillingPageDemo,
  "status-page": StatusPageDemo,
  "not-found-page": NotFoundPageDemo,
  "error-page": ErrorPageDemo,
  "marketing-shell": MarketingShellDemo,
  "landing-page": LandingPageDemo,
  "pricing-page": PricingPageDemo,
  "blog-index-page": BlogIndexPageDemo,
  "article-page": ArticlePageDemo,
  "inbox-page": InboxPageDemo,
  "chat-page": ChatPageDemo,
  "kanban-page": KanbanPageDemo,
  "calendar-page": CalendarPageDemo,
  "files-page": FilesPageDemo,
  "analytics-page": AnalyticsPageDemo,
  "reports-page": ReportsPageDemo,
  "record-detail-page": RecordDetailPageDemo,
  "search-page": SearchPageDemo,
  "audit-log-page": AuditLogPageDemo,
  "checkout-page": CheckoutPageDemo,
  "invoice-page": InvoicePageDemo,
  "onboarding-page": OnboardingPageDemo,
  "team-page": TeamPageDemo,
  "integrations-page": IntegrationsPageDemo,
}

export function LayoutDemoStage({
  slug,
  source,
}: {
  slug: string
  source?: string
}) {
  const meta = getLayoutDemoMeta(slug)
  const Demo = DEMOS[slug]
  const isTemplate = !PACKAGE_COMPOSITE_SLUGS.has(slug)
  const [tab, setTab] = React.useState("view")

  return (
    <div className="flex h-svh flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-3 sm:px-4">
        <Link
          href={`/web-components?tab=templates#${slug}`}
          className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-border/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {meta?.title}
          </span>
          <Tabs value={tab} onValueChange={setTab}>
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
          </Tabs>
          {isTemplate ? (
            source ? (
              <CopyTemplateButton
                text={source}
                title={meta?.title ?? "Template"}
              />
            ) : null
          ) : (
            <span
              title="Package composite — import from @celestia-project/ui"
              className="inline-flex h-[26px] items-center rounded-md border border-dashed border-border/70 px-3 text-xs font-medium text-muted-foreground"
            >
              Composite
            </span>
          )}
          <Link
            href={`/docs/components/${slug}`}
            title="Open documentation"
            className="inline-flex size-[26px] items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowSquareOutIcon className="size-3.5" />
            <span className="sr-only">Open documentation</span>
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "code" ? (
          <CodeBlock
            code={source}
            language="tsx"
            title={`${slug}.tsx`}
            badge={isTemplate ? "Copy template" : "Package composite"}
            showCopy={false}
            height="100%"
            className="my-0 h-full rounded-none border-0 bg-transparent shadow-none"
            preClassName="bg-background/70"
          />
        ) : Demo ? (
          <Demo />
        ) : null}
      </div>
    </div>
  )
}
