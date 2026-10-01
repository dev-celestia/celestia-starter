/**
 * Shared sample data for the showcase.
 *
 * One coherent fictional world, so every section of the gallery talks about the
 * same people, the same product and the same week — a component judged against
 * realistic content next to one showing "Item 1" reads as two different apps.
 *
 * The world: **Celestia Analytics**, a small team workspace product. The cast is
 * the computing-pioneers roster the gallery already used (Ada, Grace,
 * Katherine, Margaret, Barbara, Evelyn). Amounts, dates and metrics are shaped
 * like a real SaaS dashboard, not like placeholder noise.
 *
 * Rule for sections: import from here instead of inventing new names or numbers
 * inline. Add to this file when a specimen genuinely needs a new fixture shape.
 */

import type {
  MobileAgentTask,
  MobileAiAttachment,
  MobileAiModel,
  MobileAiPrompt,
  MobileAiSource,
} from "@celestia-project/mobile"

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

/**
 * The four status tones, in severity order.
 *
 * `MobileAlertVariant`, `MobileToastVariant`, `MobileBannerTone` and
 * `MobileCalloutTone` are four separately-declared unions with byte-identical
 * members — the library names the same taxonomy once per component, which is
 * reasonable for its own API but means the gallery has no type it can import to
 * describe "the status tones" as one thing.
 *
 * It was therefore transcribed once per section: `CALLOUT_TONES` and
 * `BANNER_TONES` in Foundations, `ALERT_VARIANTS` and `TOAST_VARIANTS` in
 * Overlays — four copies of one list, free to drift four ways. One list here,
 * and the call sites map over it directly.
 */
export const STATUS_TONES = [
  "info",
  "success",
  "warning",
  "destructive",
] as const

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface SamplePerson {
  name: string
  handle: string
  email: string
  initials: string
  role: string
  team: string
}

export const PEOPLE: SamplePerson[] = [
  {
    name: "Ada Lovelace",
    handle: "@ada",
    email: "ada@celestia.dev",
    initials: "AL",
    role: "Staff Engineer",
    team: "Platform",
  },
  {
    name: "Grace Hopper",
    handle: "@grace",
    email: "grace@celestia.dev",
    initials: "GH",
    role: "Engineering Manager",
    team: "Compilers",
  },
  {
    name: "Katherine Johnson",
    handle: "@katherine",
    email: "katherine@celestia.dev",
    initials: "KJ",
    role: "Data Scientist",
    team: "Analytics",
  },
  {
    name: "Margaret Hamilton",
    handle: "@margaret",
    email: "margaret@celestia.dev",
    initials: "MH",
    role: "Director of Engineering",
    team: "Flight Software",
  },
  {
    name: "Barbara Liskov",
    handle: "@barbara",
    email: "barbara@celestia.dev",
    initials: "BL",
    role: "Principal Engineer",
    team: "Platform",
  },
  {
    name: "Evelyn Boyd Granville",
    handle: "@evelyn",
    email: "evelyn@celestia.dev",
    initials: "EB",
    role: "Senior Engineer",
    team: "Orbital",
  },
]

/**
 * The cast members individually, for compact specimens.
 *
 * Written as indexed constants with an explicit type rather than an array
 * destructure: the app runs `noUncheckedIndexedAccess`, so destructuring from
 * a literal array would type every one of them `SamplePerson | undefined` and
 * force non-null assertions at each call site.
 */
export const ADA: SamplePerson = PEOPLE[0]!
export const GRACE: SamplePerson = PEOPLE[1]!
export const KATHERINE: SamplePerson = PEOPLE[2]!
export const MARGARET: SamplePerson = PEOPLE[3]!
export const BARBARA: SamplePerson = PEOPLE[4]!
export const EVELYN: SamplePerson = PEOPLE[5]!

// ---------------------------------------------------------------------------
// Product metrics — one consistent week of a SaaS dashboard
// ---------------------------------------------------------------------------

export const METRICS = {
  revenue: "$48.2k",
  revenueDelta: "+12.4%",
  refunds: "$1,204",
  refundsDelta: "-3.1%",
  signups: "1,284",
  signupsDelta: "+8.7%",
  totalBalance: "$12,480.55",
  churn: "1.9%",
  activeUsers: "12,480",
  memberSince: "March 2024",
}

/** Weekly signups, organic vs paid — bar chart shape ({ x, y, series }). */
export const SIGNUPS_BY_CHANNEL = [
  { x: 1, y: 42, series: "organic" },
  { x: 2, y: 58, series: "organic" },
  { x: 3, y: 35, series: "organic" },
  { x: 4, y: 74, series: "organic" },
  { x: 1, y: 18, series: "paid" },
  { x: 2, y: 26, series: "paid" },
  { x: 3, y: 41, series: "paid" },
  { x: 4, y: 30, series: "paid" },
]

/** Mon–Sun revenue vs costs, in $k — line chart shape ({ x, y, series }). */
export const REVENUE_VS_COSTS = [
  { x: 0, y: 20, series: "revenue" },
  { x: 1, y: 28, series: "revenue" },
  { x: 2, y: 25, series: "revenue" },
  { x: 3, y: 39, series: "revenue" },
  { x: 4, y: 44, series: "revenue" },
  { x: 5, y: 41, series: "revenue" },
  { x: 6, y: 56, series: "revenue" },
  { x: 0, y: 14, series: "costs" },
  { x: 1, y: 17, series: "costs" },
  { x: 2, y: 19, series: "costs" },
  { x: 3, y: 22, series: "costs" },
  { x: 4, y: 21, series: "costs" },
  { x: 5, y: 26, series: "costs" },
  { x: 6, y: 28, series: "costs" },
]

/** Sessions by device — pie chart shape ({ label, value }). */
export const SESSIONS_BY_DEVICE = [
  { label: "Mobile", value: 52 },
  { label: "Desktop", value: 31 },
  { label: "Tablet", value: 17 },
]

/** A shape, not a scale — sparklines normalise to their own min/max. */
export const WEEKLY_ACTIVE_USERS = [12, 18, 15, 24, 21, 30, 27, 34, 31, 42]

// ---------------------------------------------------------------------------
// Money — ledger entries for balance / transaction specimens
// ---------------------------------------------------------------------------

export interface SampleTransaction {
  id: string
  title: string
  subtitle: string
  amount: string
  tone?: "success" | "destructive" | "muted"
}

/**
 * The fixture's "muted" tone is the row's default, not an `amountTone` value —
 * `MobileTransactionRow` spells "no colour" as `"default"`. Both the Data
 * section and the Dashboard screen need that translation, so it lives here
 * rather than being re-derived at each call site.
 */
export function amountTone(
  tone: SampleTransaction["tone"]
): "default" | "success" | "destructive" {
  return tone === "muted" || tone === undefined ? "default" : tone
}

export const TRANSACTIONS: SampleTransaction[] = [
  {
    id: "payroll",
    title: "Celestia payroll",
    subtitle: "Income · Sep 25",
    amount: "+$4,200.00",
    tone: "success",
  },
  {
    id: "coffee",
    title: "Blue Bottle Coffee",
    subtitle: "Food & drink · Sep 26",
    amount: "-$6.40",
    tone: "muted",
  },
  {
    id: "gym",
    title: "Gym membership",
    subtitle: "Declined by issuer · Sep 27",
    amount: "-$39.00",
    tone: "destructive",
  },
  {
    id: "rail",
    title: "Rail — airport express",
    subtitle: "Travel · Sep 28",
    amount: "-$18.20",
    tone: "muted",
  },
]

// ---------------------------------------------------------------------------
// Plans — the pricing table rows used by data-table / picker specimens
// ---------------------------------------------------------------------------

export const PLAN_NAMES = ["Starter", "Pro", "Team", "Enterprise"] as const

export interface SamplePlanRow {
  plan: string
  seats: string
  renewal: string
}

export const PLAN_ROWS: SamplePlanRow[] = [
  { plan: "Starter", seats: "3", renewal: "Oct 1, 2026" },
  { plan: "Pro", seats: "12", renewal: "Nov 14, 2026" },
  { plan: "Team", seats: "48", renewal: "Dec 3, 2026" },
  { plan: "Enterprise", seats: "310", renewal: "Jan 20, 2027" },
]

// ---------------------------------------------------------------------------
// Messaging & notifications
// ---------------------------------------------------------------------------

export interface SampleMessage {
  id: number
  text: string
  mine: boolean
}

/**
 * Timestamps for `INITIAL_CHAT`, one per message.
 *
 * The thread itself is shared, but each consumer decorates it differently — the
 * messaging specimen shows the failed-delivery glyph, the chat screen shows a
 * sent one — so only the times are shared. They were previously written out
 * twice (`MESSAGE_TIMES` in the Data section, `CHAT_TIMES` in the chat screen
 * preview) as the same three literals.
 */
export const CHAT_TIMES = ["08:41", "08:44", "08:46"]

export const INITIAL_CHAT: SampleMessage[] = [
  {
    id: 1,
    text: "Morning! Did the migration land before standup?",
    mine: false,
  },
  {
    id: 2,
    text: "It did — 04:12, zero downtime. Dashboard looks clean.",
    mine: true,
  },
  { id: 3, text: "Beautiful. I'll demo it to Margaret at 11.", mine: false },
]

export interface SampleNotification {
  id: string
  title: string
  body: string
  time: string
  unread?: boolean
}

export const NOTIFICATIONS: SampleNotification[] = [
  {
    id: "deploy",
    title: "Deploy succeeded",
    body: "celestia-api v2.14.0 is live in production.",
    time: "9m ago",
    unread: true,
  },
  {
    id: "mention",
    title: "Grace mentioned you",
    body: "“Can you review the pin-lock copy before Thursday?”",
    time: "42m ago",
    unread: true,
  },
  {
    id: "invite",
    title: "Katherine accepted your invite",
    body: "She joined the Analytics workspace.",
    time: "3h ago",
  },
  {
    id: "alert",
    title: "Error rate spike",
    body: "checkout-api crossed 2% errors for 5 minutes.",
    time: "Yesterday",
  },
]

// ---------------------------------------------------------------------------
// Order lifecycle — timeline specimen
// ---------------------------------------------------------------------------

export interface SampleTimelineStep {
  title: string
  subtitle: string
  time: string
  tone: "muted" | "success" | "primary" | "destructive"
}

export const ORDER_TIMELINE: SampleTimelineStep[] = [
  {
    title: "Order placed",
    subtitle: "#CE-2291 · 3 items",
    time: "09:14",
    tone: "muted",
  },
  {
    title: "Payment captured",
    subtitle: "Visa •••• 4242",
    time: "09:15",
    tone: "success",
  },
  {
    title: "Out for delivery",
    subtitle: "Courier on the way",
    time: "13:40",
    tone: "primary",
  },
  {
    title: "Address unreachable",
    subtitle: "Courier could not find door",
    time: "15:02",
    tone: "destructive",
  },
]

// ---------------------------------------------------------------------------
// The assistant — the AI section's half of the same world
// ---------------------------------------------------------------------------

/**
 * The AI fixtures stay inside Celestia Analytics rather than inventing a second
 * product. The assistant answers questions about *this* workspace, cites the
 * *same* dashboard the Charts specimens draw, and reports the *same* week of
 * signups — so the AI section reads as one more surface of the app, not as a
 * detached component dump with `Lorem ipsum` in it.
 */

/** The question the transcript specimen opens with. */
export const AI_QUESTION = "Why did refunds move this week?"

/**
 * A real-shaped answer: a claim, a number that supports it, and a caveat. The
 * caveat is the point — an answer with no uncertainty reads as a stub.
 */
export const AI_ANSWER =
  "Refunds are down 3.1% net, but that flatters the week. Gross refunds were actually flat — the improvement comes from seven reversals that landed after the Sep 27 cut-off and will show up next week. Excluding them, the trend is unchanged."

/** The follow-up the streaming specimen is still producing. */
export const AI_STREAMING_ANSWER =
  "The seven reversals all came from the Team plan, which points at the Sep 24"

/** Reasoning trace for `MobileThinkingBlock`. */
export const AI_THINKING =
  "The headline figure is net of reversals, so I should check the gross count before reporting a trend. The dashboard's refunds card nets them automatically — the ledger table does not. If the two disagree, the discrepancy is the story, not the number. I will report both and flag the cut-off rather than picking one."

export const AI_SOURCES: MobileAiSource[] = [
  {
    id: "refunds",
    title: "Refunds — week 39",
    domain: "celestia.dev/analytics/refunds",
    snippet: "Gross $1,204 · Reversals $612 · Net $592",
  },
  {
    id: "cutoff",
    title: "Ledger cut-off times",
    domain: "celestia.dev/docs/ledger#cut-off",
    snippet: "Reversals settle on the next business day.",
  },
  {
    id: "team",
    title: "Team plan — Sep 24 change",
    domain: "celestia.dev/changelog/sep-24",
    snippet: "Paid acquisition spend reduced 30% for the rest of Q3.",
  },
]

export const AI_MODELS: MobileAiModel[] = [
  {
    id: "celestia-pro",
    name: "Celestia Pro",
    description: "Best reasoning · 200k context",
    badge: "Pro",
  },
  {
    id: "celestia-fast",
    name: "Celestia Fast",
    description: "Lowest latency · 128k context",
  },
  {
    id: "celestia-mini",
    name: "Celestia Mini",
    description: "Runs on device · 32k context",
  },
  {
    id: "celestia-max",
    name: "Celestia Max",
    description: "Invite only — not on your plan",
    badge: "Beta",
    disabled: true,
  },
]

export const AI_SUGGESTIONS = [
  "Why did refunds drop?",
  "Compare this week to last",
  "Which plan churns most?",
  "Draft the standup summary",
]

export const AI_PROMPTS: MobileAiPrompt[] = [
  {
    id: "summarise",
    title: "Summarise this week",
    description: "Reads the dashboard and writes a three-bullet recap.",
  },
  {
    id: "anomaly",
    title: "Find the anomaly",
    description: "Compares this week against the trailing four.",
  },
  {
    id: "sql",
    title: "Write a query",
    description: "Turns a plain-English question into SQL.",
    badge: "Popular",
  },
  {
    id: "brief",
    title: "Draft a customer brief",
    description: "Pulls account history into a one-pager.",
  },
]

export interface SampleAgent {
  id: string
  name: string
  description: string
  capabilities: string[]
  badge?: string
}

export const AI_AGENTS: SampleAgent[] = [
  {
    id: "analyst",
    name: "Analytics analyst",
    description: "Answers questions about this workspace's metrics.",
    capabilities: ["SQL", "Charts", "Web search"],
    badge: "Default",
  },
  {
    id: "researcher",
    name: "Research assistant",
    description: "Reads papers and the web, then cites everything it used.",
    capabilities: ["Web search", "Citations", "Summaries"],
  },
  {
    id: "captain",
    name: "Release captain",
    description: "Runs the deploy checklist end to end and reports back.",
    capabilities: ["Deploys", "Rollbacks"],
    badge: "Beta",
  },
]

export const AI_TASKS: MobileAgentTask[] = [
  {
    id: "plan",
    title: "Break the question into steps",
    status: "success",
    detail: "3 steps",
  },
  {
    id: "query",
    title: "Query the refunds ledger",
    status: "success",
    detail: "1,204 rows · 120ms",
  },
  {
    id: "compare",
    title: "Compare against the trailing four weeks",
    status: "running",
  },
  {
    id: "write",
    title: "Write the summary",
    status: "pending",
  },
]

export const AI_ATTACHMENTS: MobileAiAttachment[] = [
  {
    id: "review",
    name: "q3-growth-review.pdf",
    kind: "file",
    size: "1.2 MB",
  },
  {
    id: "chart",
    name: "signups-by-channel.png",
    kind: "image",
    size: "284 KB",
  },
  {
    id: "standup",
    name: "standup-2026-09-29.m4a",
    kind: "audio",
    size: "3.8 MB",
  },
]

/** Serialised tool call, shown by `MobileToolCallCard`. */
export const AI_TOOL_ARGS = `{
  "metric": "refunds",
  "group_by": "plan",
  "range": "2026-09-23..2026-09-30"
}`

export const AI_TOOL_RESULT = `[
  { "plan": "Starter", "gross": 318, "reversals": 2 },
  { "plan": "Pro",     "gross": 402, "reversals": 0 },
  { "plan": "Team",    "gross": 484, "reversals": 7 }
]`

/** Query shown by `MobileCodeBlock`. */
export const AI_CODE_SAMPLE = `SELECT plan, count(*) AS refunds
FROM ledger.refund
WHERE occurred_at >= now() - interval '7 days'
  AND status <> 'reversed'
GROUP BY plan
ORDER BY refunds DESC;`

/** Waveform levels for the voice specimen — a shape, not a recording. */
export const AI_VOICE_LEVELS = [
  0.22, 0.41, 0.68, 0.9, 0.55, 0.34, 0.72, 0.96, 0.61, 0.28, 0.45, 0.78, 0.52,
  0.3, 0.63, 0.88, 0.47, 0.24, 0.58, 0.81, 0.39, 0.26, 0.5, 0.7,
]
