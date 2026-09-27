"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  BellIcon,
  CalendarBlankIcon,
  ChartLineUpIcon,
  CreditCardIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  FunnelSimpleIcon,
  GearSixIcon,
  GithubLogoIcon,
  GoogleLogoIcon,
  HouseIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MoonStarsIcon,
  PencilSimpleIcon,
  PlusIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SquaresFourIcon,
  TrendDownIcon,
  TrashIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import {
  AuthShell,
  Avatar,
  AvatarFallback,
  Badge,
  BillingPage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DashboardPage,
  DashboardShell,
  ErrorPage,
  ForgotPasswordPage,
  Input,
  Label,
  ListPage,
  NotFoundPage,
  PageShell,
  ProfilePage,
  ResetPasswordPage,
  SettingsPage,
  SignInPage,
  SignUpPage,
  StatusPage,
  Switch,
  TwoFactorPage,
} from "@celestia-project/ui"
import type {
  BillingInvoice,
  BillingPlan,
  BillingUsage,
  DashboardStat,
  ListColumn,
  ProfileMetaItem,
  ProfileStat,
  ProfileTab,
  SettingsSection,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { getLayoutDemoMeta } from "@/lib/layout-demos"

const noop = () => undefined

// Full-page demos: every component renders at true viewport size under the
// stage bar. Components built on PageShell (min-h-0 flex-1) sit inside a
// flex column wrapper; shells that own min-h-svh get h-full min-h-0 instead.

function BrandMark() {
  return (
    <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
      <MoonStarsIcon className="size-5" weight="fill" />
    </div>
  )
}

function ShellColumn({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full min-h-0 flex-col">{children}</div>
}

const PROJECT_ROWS = [
  { id: "prj_01", name: "Atlas API", meta: "Deployed 12 minutes ago", status: "Live" },
  { id: "prj_02", name: "Nebula Web", meta: "Build queued", status: "Building" },
  { id: "prj_03", name: "Comet CLI", meta: "Last release v2.4.1", status: "Stable" },
  { id: "prj_04", name: "Orbit Mobile", meta: "Review pending", status: "Draft" },
]

function ProjectCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROJECT_ROWS.map((row) => (
        <div key={row.id} className="border-border/70 rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">{row.name}</span>
            <Badge variant="secondary">{row.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{row.meta}</p>
        </div>
      ))}
    </div>
  )
}

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", icon: <GoogleLogoIcon className="size-4" /> },
  { id: "github", label: "GitHub", icon: <GithubLogoIcon className="size-4" /> },
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
          <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-3xs font-medium">
            {entry.who.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 text-xs">
            <span className="font-medium">{entry.who}</span>{" "}
            <span className="text-muted-foreground">{entry.what}</span>
          </span>
          <span className="text-muted-foreground shrink-0 text-3xs tabular-nums">
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
      <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-destructive text-xs font-medium">
            Delete this workspace
          </span>
          <span className="text-muted-foreground text-xs">
            Every project, post and member will be removed. This cannot be undone.
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
  { id: "prj_01", name: "Atlas API", owner: "Nadia Okonkwo", status: "Live", updated: "12 minutes ago" },
  { id: "prj_02", name: "Nebula Web", owner: "Sam Iversen", status: "Building", updated: "48 minutes ago" },
  { id: "prj_03", name: "Comet CLI", owner: "Ravi Shah", status: "Stable", updated: "2 hours ago" },
  { id: "prj_04", name: "Orbit Mobile", owner: "Ada Lin", status: "Draft", updated: "5 hours ago" },
  { id: "prj_05", name: "Pulsar Worker", owner: "Mira Chen", status: "Live", updated: "Yesterday" },
  { id: "prj_06", name: "Vega Docs", owner: "Tom Ríos", status: "Stable", updated: "3 days ago" },
]

type ListRow = (typeof LIST_ROWS)[number]

const LIST_COLUMNS: ListColumn<ListRow>[] = [
  {
    id: "name",
    header: "Project",
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.name}</span>
        <span className="text-muted-foreground font-mono text-3xs">{row.id}</span>
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
          <span className="text-foreground font-medium">Terms of Service</span>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-shell-demo-email">Email</Label>
          <Input id="auth-shell-demo-email" type="email" placeholder="you@example.com" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-shell-demo-password">Password</Label>
          <Input id="auth-shell-demo-password" type="password" placeholder="Enter your password" />
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
  { id: "INV-0091", date: "1 Sep 2026", amount: "$96.00", status: <Badge variant="success">Paid</Badge> },
  { id: "INV-0084", date: "1 Aug 2026", amount: "$96.00", status: <Badge variant="success">Paid</Badge> },
  { id: "INV-0077", date: "1 Jul 2026", amount: "$72.00", status: <Badge variant="secondary">Refunded</Badge> },
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
            <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
              <CreditCardIcon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-medium">Visa ending 4242</span>
              <span className="text-muted-foreground text-xs">Expires 04 / 2029</span>
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
}

export function LayoutDemoStage({ slug }: { slug: string }) {
  const meta = getLayoutDemoMeta(slug)
  const Demo = DEMOS[slug]

  return (
    <div className="bg-background text-foreground flex h-svh flex-col">
      <header className="border-border flex h-12 shrink-0 items-center justify-between gap-3 border-b px-3 sm:px-4">
        <Link
          href="/layout"
          className="border-border/70 text-muted-foreground hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          All layouts
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden text-xs sm:inline">
            {meta?.title}
          </span>
          <Link
            href={`/docs/components/${slug}`}
            title="Open documentation"
            className="border-border/70 text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-full border transition-colors"
          >
            <ArrowSquareOutIcon className="size-3.5" />
            <span className="sr-only">Open documentation</span>
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{Demo ? <Demo /> : null}</div>
    </div>
  )
}
