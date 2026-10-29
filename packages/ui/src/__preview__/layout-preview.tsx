/**
 * Throwaway preview harness for the `layout` family.
 *
 * Next/Turbopack refuses `packages/ui/node_modules` because it is a symlink into
 * a sibling project, so the design-system showcase cannot render in this sandbox.
 * esbuild follows symlinks without complaint, so this mounts the real components
 * in a plain HTML page that headless Chrome can screenshot.
 *
 * Scene is read from `?scene=` at module scope, before the first render.
 */
import * as React from "react"
import { createRoot } from "react-dom/client"

import { BillingPage } from "../components/layout/billing-page"
import type {
  BillingInvoice,
  BillingPlan,
  BillingUsage,
} from "../components/layout/billing-page"
import { DashboardShell } from "../components/layout/dashboard-shell"
import { DashboardPage, type DashboardStat } from "../components/layout/dashboard-page"
import { ErrorPage } from "../components/layout/error-page"
import { ListPage } from "../components/layout/list-page"
import type { ListColumn } from "../components/layout/list-page"
import {
  ProfilePage,
  type ProfileMetaItem,
  type ProfileStat,
  type ProfileTab,
} from "../components/layout/profile-page"
import { SettingsPage, type SettingsSection } from "../components/layout/settings-page"
import { StatusPage } from "../components/layout/status-page"
import { Avatar, AvatarFallback } from "../components/primitive/avatar"
import { Badge } from "../components/primitive/badge"
import { Button } from "../components/primitive/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/primitive/card"
import { Input } from "../components/primitive/input"
import { Switch } from "../components/primitive/switch"

const SCENE = new URLSearchParams(window.location.search).get("scene") ?? "all"

/** Inline glyph so the harness pulls in no icon package. */
function Glyph() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 8.5l2 2 4-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const NAV = ["Overview", "Analytics", "Projects", "Team", "Settings"]

const STATS: DashboardStat[] = [
  { id: "mrr", label: "Monthly revenue", value: "$48,290", delta: "+12.4%", trend: "up", hint: "vs. last month", icon: <Glyph /> },
  { id: "users", label: "Active users", value: "12,847", delta: "+3.1%", trend: "up", hint: "vs. last month", icon: <Glyph /> },
  { id: "churn", label: "Churn", value: "1.8%", delta: "-0.4%", trend: "down", hint: "vs. last month", icon: <Glyph /> },
  { id: "uptime", label: "Uptime", value: "99.98%", delta: "0.0%", trend: "flat", hint: "last 30 days", icon: <Glyph /> },
]

const PROJECTS = [
  { name: "Atlas API", meta: "Deployed 12 minutes ago", status: "Live" },
  { name: "Nebula Web", meta: "Build queued", status: "Building" },
  { name: "Comet CLI", meta: "Last release v2.4.1", status: "Stable" },
  { name: "Orbit Mobile", meta: "Review pending", status: "Draft" },
]

const ACTIVITY = [
  { id: "1", who: "Nadia", what: "deployed Atlas API", when: "12m" },
  { id: "2", who: "Sam", what: "opened a pull request", when: "48m" },
  { id: "3", who: "Ravi", what: "invited 3 teammates", when: "2h" },
  { id: "4", who: "Ada", what: "changed the billing plan", when: "5h" },
]

const PROFILE_META: ProfileMetaItem[] = [
  { id: "email", icon: <Glyph />, label: "ada@northwind.dev" },
  { id: "location", icon: <Glyph />, label: "Lisbon, Portugal" },
  { id: "site", icon: <Glyph />, label: "ada.northwind.dev" },
  { id: "joined", icon: <Glyph />, label: "Joined March 2023" },
]

const PROFILE_STATS: ProfileStat[] = [
  { id: "posts", value: "128", label: "posts" },
  { id: "followers", value: "4.2k", label: "followers" },
  { id: "projects", value: "17", label: "projects" },
]

const PROFILE_TABS: ProfileTab[] = [
  { id: "overview", label: "Overview", icon: <Glyph /> },
  { id: "activity", label: "Activity", icon: <Glyph />, count: 24 },
  { id: "preferences", label: "Preferences", icon: <Glyph /> },
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
        {description && <span className="text-muted-foreground text-xs">{description}</span>}
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
    icon: <Glyph />,
    content: (
      <div className="flex flex-col gap-3">
        <SettingRow label="Workspace name" description="Shown to every member.">
          <Input defaultValue="Northwind" className="w-44" />
        </SettingRow>
        <SettingRow label="Product updates" description="A monthly digest of what shipped.">
          <Switch defaultChecked />
        </SettingRow>
        <SettingRow label="Public profile" description="Let anyone see your project list.">
          <Switch />
        </SettingRow>
      </div>
    ),
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plan, seats and invoices.",
    icon: <Glyph />,
    content: (
      <div className="flex flex-col gap-3">
        <SettingRow label="Plan" description="Renews on 1 October.">
          <Badge variant="secondary">Team · 12 seats</Badge>
        </SettingRow>
        <SettingRow label="Payment method" description="Visa ending 4242.">
          <Button variant="outline" size="sm">Update</Button>
        </SettingRow>
      </div>
    ),
  },
  {
    id: "security",
    label: "Security",
    description: "Sign-in and session policy.",
    icon: <Glyph />,
    content: (
      <div className="flex flex-col gap-3">
        <SettingRow label="Two-factor authentication" description="Require a code at every sign-in.">
          <Switch defaultChecked />
        </SettingRow>
        <SettingRow label="Active sessions" description="3 devices signed in.">
          <Button variant="outline" size="sm">Sign out all</Button>
        </SettingRow>
      </div>
    ),
  },
  {
    id: "danger",
    label: "Danger zone",
    description: "Irreversible actions.",
    icon: <Glyph />,
    danger: true,
    content: (
      <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-destructive text-xs font-medium">Delete this workspace</span>
          <span className="text-muted-foreground text-xs">
            Every project, post and member will be removed. This cannot be undone.
          </span>
        </div>
        <Button variant="destructive" size="sm" className="self-start">Delete workspace</Button>
      </div>
    ),
  },
]

function ProjectGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROJECTS.map((row) => (
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
  )
}

function ActivityCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ACTIVITY.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2">
            <span className="bg-muted size-1.5 shrink-0 rounded-full" />
            <span className="min-w-0 flex-1 truncate text-xs">
              <span className="font-medium">{entry.who}</span>{" "}
              <span className="text-muted-foreground">{entry.what}</span>
            </span>
            <span className="text-muted-foreground shrink-0 text-3xs tabular-nums">
              {entry.when}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------- list scene
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
  { id: "owner", header: "Owner", cell: (row) => <span className="text-muted-foreground">{row.owner}</span> },
  { id: "status", header: "Status", cell: (row) => <Badge variant="secondary">{row.status}</Badge> },
  {
    id: "updated",
    header: "Updated",
    align: "end",
    cell: (row) => <span className="text-muted-foreground tabular-nums">{row.updated}</span>,
  },
]

function ListScene() {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<string[]>(["prj_02"])
  const [page, setPage] = React.useState(1)

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return LIST_ROWS
    return LIST_ROWS.filter((row) =>
      [row.name, row.owner, row.status].some((field) => field.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="bg-background border-border h-full overflow-y-auto border">
      <ListPage
        title="Projects"
        description="Every project in the Northwind workspace."
        width="xl"
        columns={LIST_COLUMNS}
        rows={rows}
        rowKey={(row) => row.id}
        search={{ value: query, onValueChange: setQuery, placeholder: "Search projects…" }}
        filters={
          <Button variant="outline" size="sm">
            <Glyph />
            Status
          </Button>
        }
        toolbar={
          <Button size="sm">
            <Glyph />
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
    </div>
  )
}

/** Same page with no rows, to prove the empty state renders. */
function ListEmptyScene() {
  return (
    <div className="bg-background border-border h-full overflow-y-auto border">
      <ListPage
        title="Projects"
        description="Empty state."
        width="xl"
        columns={LIST_COLUMNS}
        rows={[]}
        rowKey={(row: ListRow) => row.id}
        selectable
        selectedIds={[]}
        onSelectedIdsChange={() => undefined}
        totalLabel="0 of 6 projects"
        empty="No projects match that search."
      />
    </div>
  )
}

// -------------------------------------------------------------- billing scene
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
    format: (used, limit) => `${used.toLocaleString()} / ${limit.toLocaleString()}`,
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

function BillingScene() {
  return (
    <div className="bg-background border-border h-full overflow-y-auto border">
      <BillingPage
        title="Billing"
        description="Plan, usage and invoices for the Northwind workspace."
        width="xl"
        plan={BILLING_PLAN}
        usage={BILLING_USAGE}
        invoices={BILLING_INVOICES}
        onManagePlan={() => undefined}
        onUpdatePayment={() => undefined}
        actions={
          <Button variant="outline" size="sm">
            <Glyph />
            Export
          </Button>
        }
        paymentMethod={
          <div className="flex items-center gap-3">
            <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
              <Glyph />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-medium">Visa ending 4242</span>
              <span className="text-muted-foreground text-xs">Expires 04 / 2029</span>
            </span>
          </div>
        }
      />
    </div>
  )
}

// --------------------------------------------------------------- status scene
function StatusScene() {
  // Definite height: `StatusPage` centres with `justify-center`, which needs a
  // parent with a resolved height. The showcase wrapper supplies one (`h-72`);
  // this mirrors it.
  return (
    <div className="grid h-[900px] grid-cols-2">
      <div className="border-border h-full overflow-hidden border-r">
        <ErrorPage
          className="h-full min-h-0"
          detail="digest_8f3a91c2"
          onAction={() => undefined}
          onSecondaryAction={() => undefined}
          secondaryLabel="Contact support"
        />
      </div>
      <div className="h-full overflow-hidden">
        <StatusPage
          className="h-full min-h-0"
          code="403"
          title="You do not have access"
          description="Ask a workspace admin to invite you."
          actionLabel="Back to dashboard"
          onAction={() => undefined}
        />
      </div>
    </div>
  )
}

function ShellScene() {
  return (
    <div style={{ height: "100vh" }} className="border-border border">
      <DashboardShell
        className="h-full min-h-0"
        contentWidth="xl"
        brand={
          <span className="flex items-center gap-2 font-semibold">
            <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
              <Glyph />
            </span>
            <span className="hidden text-sm md:inline">Celestia</span>
          </span>
        }
        nav={
          <nav className="flex flex-col gap-1">
            {NAV.map((item, index) => (
              <button
                key={item}
                type="button"
                className={
                  "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors md:justify-start " +
                  (index === 0
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground")
                }
              >
                <Glyph />
                <span className="hidden md:inline">{item}</span>
              </button>
            ))}
          </nav>
        }
        navFooter={
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Avatar>
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 flex-col md:flex">
              <span className="truncate text-xs font-medium">Ada Lin</span>
              <span className="text-muted-foreground truncate text-3xs">ada@northwind.dev</span>
            </span>
          </div>
        }
        header={
          <>
            <span className="text-sm font-medium">Overview</span>
            <div className="ms-auto flex items-center gap-1">
              <Button variant="ghost" size="icon-sm">S</Button>
              <Button variant="ghost" size="icon-sm">N</Button>
            </div>
          </>
        }
        aside={
          <>
            <span className="text-xs font-medium">Activity</span>
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
          </>
        }
      >
        <ProjectGrid />
      </DashboardShell>
    </div>
  )
}

function DashboardScene() {
  return (
    <div style={{ height: "100vh" }} className="bg-background border-border border">
      <DashboardPage
        className="h-full"
        title="Overview"
        description="Everything happening across your workspace."
        width="xl"
        statColumns={4}
        stats={STATS}
        actions={
          <>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">New project</Button>
          </>
        }
        aside={<ActivityCard />}
      >
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Everything your team is building this quarter.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectGrid />
          </CardContent>
        </Card>
      </DashboardPage>
    </div>
  )
}

function ProfileScene() {
  return (
    <div className="bg-background border-border border">
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
            <Button variant="outline" size="sm">Copy link</Button>
            <Button size="sm">Edit profile</Button>
          </>
        }
        tabs={PROFILE_TABS}
        defaultValue="overview"
      >
        <ProjectGrid />
      </ProfilePage>
    </div>
  )
}

function SettingsScene() {
  return (
    <div style={{ height: "100vh" }} className="bg-background border-border overflow-y-auto border">
      <SettingsPage
        title="Settings"
        description="Manage your workspace, plan and security policy."
        sections={SETTINGS_SECTIONS}
        actions={<Button size="sm">Save changes</Button>}
      />
    </div>
  )
}

const SCENES: Record<string, () => React.ReactElement> = {
  shell: ShellScene,
  dashboard: DashboardScene,
  profile: ProfileScene,
  settings: SettingsScene,
  list: ListScene,
  listempty: ListEmptyScene,
  billing: BillingScene,
  status: StatusScene,
}

/** Writes real geometry into a hidden <pre> so the capture can be asserted on. */
function Report() {
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const box = (selector: string) => {
        const el = document.querySelector(selector)
        if (!el) return null
        const rect = el.getBoundingClientRect()
        return { w: Math.round(rect.width), h: Math.round(rect.height) }
      }
      /** Padding, so a gutters/alignment claim can be checked numerically. */
      const pad = (selector: string) => {
        const el = document.querySelector(selector)
        if (!el) return null
        const cs = window.getComputedStyle(el)
        return {
          left: cs.paddingLeft,
          right: cs.paddingRight,
          top: cs.paddingTop,
          bottom: cs.paddingBottom,
        }
      }
      const panels = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="settings-page-panel"]')
      )
      const rows = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="table-row"]')
      )
      const report = {
        scene: SCENE,
        shellNav: box('[data-slot="dashboard-shell-nav"]'),
        shellHeader: box('[data-slot="dashboard-shell-header"]'),
        shellAside: box('[data-slot="dashboard-shell-aside"]'),
        shellContent: box('[data-slot="dashboard-shell-content"]'),
        pageShellHeader: box('[data-slot="page-shell-header"]'),
        statsGrid: box('[data-slot="dashboard-page-stats"]'),
        statTile: box('[data-slot="dashboard-stat"]'),
        profileCover: box('[data-slot="profile-page-cover"]'),
        profileAvatar: box('[data-slot="profile-page"] [data-slot="avatar"]'),
        profileTabs: box('[data-slot="profile-page-tabs"]'),
        profileTabsList: box('[data-slot="profile-page-tabs"] [data-slot="tabs-list"]'),
        profileTabTrigger: box('[data-slot="profile-page-tabs"] [data-slot="tabs-trigger"]'),
        profileContent: box('[data-slot="profile-page-content"]'),
        settingsNav: box('[data-slot="settings-page-nav"]'),
        settingsPanels: panels.length,
        settingsVisiblePanels: panels.filter((el) => el.offsetParent !== null).length,
        settingsActivePanels: panels.filter((el) => el.dataset.state === "active").length,
        listToolbar: box('[data-slot="list-page-toolbar"]'),
        listTable: box('[data-slot="list-page-table"]'),
        listEmpty: box('[data-slot="list-page-empty"]'),
        listPagination: box('[data-slot="list-page-pagination"]'),
        listRowCount: rows.length,
        billingPlan: box('[data-slot="billing-page-plan"]'),
        billingUsage: box('[data-slot="billing-page-usage"]'),
        billingMeter: box('[data-slot="billing-page-meter"]'),
        billingPayment: box('[data-slot="billing-page-payment"]'),
        billingInvoices: box('[data-slot="billing-page-invoices"]'),
        billingTable: box('[data-slot="billing-page-invoice-table"]'),
        // Gutters: the invoice table's first cell must line up with the card
        // title above it, i.e. both at the card's `--card-spacing` (16px).
        invoiceHeadPad: pad('[data-slot="billing-page-invoice-table"] th:first-child'),
        cardTitlePad: pad('[data-slot="billing-page-invoices"] [data-slot="card-title"]'),
        statusError: box('[data-slot="error-page"]'),
        statusDetail: box('[data-slot="status-page-detail"]'),
        statusForbidden: box('[data-slot="status-page"]'),
        docHeight: document.documentElement.scrollHeight,
      }
      const pre = document.getElementById("report")
      if (pre) pre.textContent = JSON.stringify(report, null, 2)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [])
  return null
}

class Boundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <pre style={{ color: "#ff6467", padding: 16, whiteSpace: "pre-wrap" }}>
          {`PREVIEW RENDER FAILED\n${this.state.error.stack ?? this.state.error.message}`}
        </pre>
      )
    }
    return this.props.children
  }
}

function App() {
  const Scene = SCENES[SCENE]
  if (SCENE === "all") {
    return (
      <>
        {Object.entries(SCENES).map(([name, Component]) => (
          <div key={name} style={{ height: "100vh" }}>
            <Component />
          </div>
        ))}
      </>
    )
  }
  if (!Scene) {
    return <pre style={{ padding: 16 }}>{`unknown scene: ${SCENE}`}</pre>
  }
  return <Scene />
}

const container = document.getElementById("root")
if (container) {
  createRoot(container).render(
    <Boundary>
      <App />
      <Report />
    </Boundary>
  )
}
