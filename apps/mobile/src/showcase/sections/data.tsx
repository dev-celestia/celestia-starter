import * as React from "react"
import { View } from "react-native"
import {
  MobileAttachmentChip,
  MobileAvatar,
  MobileAvatarGroup,
  MobileBadge,
  MobileBalanceCard,
  MobileButton,
  MobileCard,
  MobileCardContent,
  MobileCardDescription,
  MobileCardFooter,
  MobileCardHeader,
  MobileCardTitle,
  MobileChatInput,
  MobileCommentCard,
  MobileDataTable,
  MobileEmptyState,
  MobileEventCard,
  MobileFileRow,
  MobileKeyValueRow,
  MobileKpiRow,
  MobileListItem,
  MobileList,
  MobileMediaCard,
  MobileMessageBubble,
  MobileNotificationCard,
  MobileProfileHeader,
  MobileProgressCard,
  MobileRatingSummary,
  MobileReviewCard,
  MobileSettingRow,
  MobileSeparator,
  MobileSlider,
  MobileStatCard,
  MobileTaskRow,
  MobileText,
  MobileTimeline,
  MobileTransactionRow,
  MobileUploadProgressRow,
  MobileUserRow,
  useMobileTheme,
  type MobileAvatarGroupItem,
  type MobileDataColumn,
  type MobileTimelineItem,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon } from "../icons"
import { Readout, Row, SPACE, Spacer, Specimen, Stack } from "../ui"
import {
  ADA,
  BARBARA,
  CHAT_TIMES,
  GRACE,
  INITIAL_CHAT,
  KATHERINE,
  MARGARET,
  METRICS,
  NOTIFICATIONS,
  ORDER_TIMELINE,
  PEOPLE,
  PLAN_NAMES,
  PLAN_ROWS,
  TRANSACTIONS,
  amountTone,
} from "../sample-data"

// `noUncheckedIndexedAccess` types indexed fixture access as possibly
// undefined; the cast and the ledger are fixed, so narrow them once here.
const [ada, grace, katherine, margaret, barbara] = [
  ADA!,
  GRACE!,
  KATHERINE!,
  MARGARET!,
  BARBARA!,
]
const [payroll, coffee, gym] = [
  TRANSACTIONS[0]!,
  TRANSACTIONS[1]!,
  TRANSACTIONS[2]!,
]

/**
 * Data display — the modules that present a collection or a record.
 *
 * `list`, `card`, `avatar-group`, `setting-row`, `empty-state`, plus the
 * newer composites grouped by the job they do: stats & money, records &
 * progress, people, reviews, files & tasks, messaging and media & events.
 *
 * The dividing line between these two categories is worth knowing: `MobileList`
 * is the **native** grouped table from `@expo/ui` (a real SwiftUI `List`), while
 * `MobileSettingRow` is a plain composed row. The native list gives you platform
 * section chrome and native scrolling; the composed row gives you full control
 * and works anywhere. Reach for the native one first, and drop to the composed
 * one when you need a layout the native list will not express.
 *
 * The grouped blocks below follow the same contract as everything else: the
 * components render props and emit callbacks, while dismissal, toggling and
 * message sending all live in local state *here*, in the host app.
 */

const COLLABORATORS: MobileAvatarGroupItem[] = PEOPLE.map((person) => ({
  initials: person.initials,
  accessibilityLabel: person.name,
}))

const KPI_ITEMS = [
  { label: "Revenue", value: METRICS.revenue },
  { label: "Users", value: METRICS.activeUsers },
  { label: "Churn", value: METRICS.churn },
]

const TIMELINE_ITEMS: MobileTimelineItem[] = ORDER_TIMELINE

const TABLE_COLUMNS: MobileDataColumn[] = [
  { key: "plan", label: "Plan", width: 96 },
  { key: "seats", label: "Seats", align: "right", width: 72 },
  { key: "renewal", label: "Renewal", width: 120 },
]

const TABLE_ROWS: Record<string, React.ReactNode>[] = PLAN_ROWS.map((row) => ({
  ...row,
}))

interface ChatMessage {
  id: number
  text: string
  mine?: boolean
  time?: string
  status?: "sending" | "sent" | "failed"
}

// The shared chat fixture supplies id/text/mine; times and the delivery
// statuses are decorations this specimen needs to show every bubble glyph
// up front (sending one from the input below adds the "sending" state).
const INITIAL_MESSAGES: ChatMessage[] = INITIAL_CHAT.map((message, index) => ({
  ...message,
  time: CHAT_TIMES[index],
  status: message.mine ? "failed" : undefined,
}))

interface Task {
  id: number
  title: string
  subtitle?: string
  done: boolean
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Review the Q3 report", subtitle: "Due today", done: true },
  {
    id: 2,
    title: "Ship the release notes",
    subtitle: "Due tomorrow",
    done: false,
  },
  { id: 3, title: "Rotate the API keys", subtitle: "Overdue", done: false },
]

export function DataSection({ ctx }: { ctx: ShowcaseContext }) {
  const { colors } = useMobileTheme()
  const [lastRow, setLastRow] = React.useState("—")
  const [lastTableRow, setLastTableRow] = React.useState("—")
  // Two of the four shared notifications — enough to demo the unread accent
  // and per-card dismiss without turning the "People" block into a long feed.
  const [notifications, setNotifications] = React.useState(
    NOTIFICATIONS.slice(0, 2)
  )
  const [files, setFiles] = React.useState([
    { id: "report", name: "q3-report.pdf", size: "2.4 MB", removable: false },
    { id: "banner", name: "hero-banner.png", size: "860 KB", removable: true },
  ])
  const [attachments, setAttachments] = React.useState([
    "contract-v2.pdf",
    "invoice-0912.pdf",
    "logo.svg",
  ])
  const [upload, setUpload] = React.useState(0.42)
  const [tasks, setTasks] = React.useState(INITIAL_TASKS)
  const [messages, setMessages] = React.useState(INITIAL_MESSAGES)
  const [draft, setDraft] = React.useState("")
  const nextMessageId = React.useRef(INITIAL_MESSAGES.length + 1)

  // The input holds no state of its own — send commits the draft here, as a
  // new outgoing bubble still marked "sending". Delivery is the host's job.
  const handleSend = React.useCallback(() => {
    const text = draft.trim()
    if (text === "") return
    setMessages((prev) => [
      ...prev,
      {
        id: nextMessageId.current++,
        text,
        mine: true,
        time: "now",
        status: "sending",
      },
    ])
    setDraft("")
  }, [draft])

  return (
    <View>
      <Specimen
        title="Native grouped list"
        description="This is a real SwiftUI List on iOS and a Compose list on Android, bridged through @expo/ui — not a styled ScrollView. Rows carry a light haptic tick on press by default."
        modulePath="primitive/list"
      >
        <MobileList>
          <MobileListItem
            supportingText="English (United States)"
            onPress={() => setLastRow("System language")}
          >
            System language
          </MobileListItem>
          <MobileListItem
            supportingText={
              ctx.scheme === "dark" ? "Dark theme active" : "Light theme active"
            }
            onPress={() => setLastRow("Colour theme")}
          >
            Colour theme
          </MobileListItem>
          <MobileListItem
            supportingText="Connected"
            onPress={() => setLastRow("Network status")}
          >
            Network status
          </MobileListItem>
          <MobileListItem
            supportingText="Press is wired but silent"
            hapticFeedback={false}
            onPress={() => setLastRow("No-haptic row")}
          >
            Haptics disabled
          </MobileListItem>
        </MobileList>
        <Readout label="Last row" value={lastRow} />
      </Specimen>

      <Specimen
        title="Card, in full"
        description="Header, title, description, content and footer as separate slots. A string child is rendered as type; anything else is passed through untouched, which is why the footer can hold buttons."
        modulePath="primitive/card"
      >
        <MobileCard>
          <MobileCardHeader>
            <MobileCardTitle>Workspace usage</MobileCardTitle>
            <MobileCardDescription>
              Resets on the first of the month
            </MobileCardDescription>
          </MobileCardHeader>
          <MobileCardContent>
            <Row wrap={false}>
              <MobileBadge variant="info" tabular>
                68%
              </MobileBadge>
              <MobileText variant="callout" color="muted">
                of 50 GB storage
              </MobileText>
            </Row>
          </MobileCardContent>
          <MobileCardFooter>
            <MobileButton size="sm" variant="ghost">
              Manage plan
            </MobileButton>
          </MobileCardFooter>
        </MobileCard>
      </Specimen>

      <Specimen
        title="Avatar stacks"
        description="Overflow collapses into a +N chip once the list exceeds max, so a long list of collaborators cannot push a row off screen."
        modulePath="composite/avatar-group"
      >
        <MobileAvatarGroup avatars={COLLABORATORS.slice(0, 3)} />
        <Spacer size={SPACE.row} />
        <MobileAvatarGroup avatars={COLLABORATORS} max={4} />
        <Spacer size={SPACE.row} />
        <MobileAvatarGroup avatars={COLLABORATORS} max={6} size="lg" />
      </Specimen>

      <Specimen
        title="Settings rows"
        description="The composed alternative to the native list. A row with an onPress shows a chevron; a row with a value and no onPress is a read-out and does not."
        modulePath="composite/setting-row"
      >
        <Stack gap={0}>
          <MobileSettingRow
            label="Profile"
            description="Name, photo, pronouns"
            leading={<MobileAvatar initials={ada.initials} size="sm" />}
            onPress={() => setLastRow("Profile")}
          />
          <MobileSeparator />
          <MobileSettingRow
            label="Plan"
            value="Pro"
            onPress={() => setLastRow("Plan")}
          />
          <MobileSeparator />
          <MobileSettingRow label="Member since" value={METRICS.memberSince} />
          <MobileSeparator />
          <MobileSettingRow
            label="Two-factor authentication"
            description="Recommended"
            trailing={<ShowcaseIcon name="check" size="sm" />}
            onPress={() => setLastRow("2FA")}
          />
          <MobileSeparator />
          <MobileSettingRow
            label="Delete workspace"
            leading={
              <ShowcaseIcon name="trash" size="sm" color={colors.destructive} />
            }
            disabled
            onPress={() => setLastRow("should never fire")}
          />
        </Stack>
      </Specimen>

      <Specimen
        title="Empty states"
        description="Title is required — an illustration with no explanation is not an empty state. The action slot takes any node, so it can hold a button or a link."
        modulePath="composite/empty-state"
      >
        <MobileEmptyState
          icon={<ShowcaseIcon name="note" size="xl" />}
          title="No projects yet"
          description="Projects group your documents, deployments and environments."
          action={
            <MobileButton
              size="sm"
              onPress={() => setLastRow("Create project")}
            >
              Create a project
            </MobileButton>
          }
        />
        <Spacer size={SPACE.row} />
        <MobileEmptyState
          title="No results"
          description="Nothing matched that filter."
        />
      </Specimen>

      <Specimen
        title="Stats & money"
        description="Stat cards, a KPI strip, the balance hero and transaction rows. Delta tone drives both colour and arrow direction, so a bad number can never point up by accident; amounts are tabular and right-aligned so decimals line up down the list."
        modulePath="composite/stat-card · kpi-row · balance-card · transaction-row"
      >
        <Stack gap={SPACE.row}>
          <Row wrap={false}>
            <MobileStatCard
              label="Revenue"
              value={METRICS.revenue}
              delta={METRICS.revenueDelta}
              deltaTone="success"
              icon={<ShowcaseIcon name="star" size="sm" />}
              style={{ flex: 1 }}
            />
            <MobileStatCard
              label="Refunds"
              value={METRICS.refunds}
              delta={METRICS.refundsDelta}
              deltaTone="destructive"
              style={{ flex: 1 }}
            />
            <MobileStatCard
              label="Signups"
              value={METRICS.signups}
              delta={METRICS.signupsDelta}
              deltaTone="success"
              style={{ flex: 1 }}
              onPress={() => setLastRow("Signups")}
            />
          </Row>
          <MobileKpiRow items={KPI_ITEMS} />
          <MobileBalanceCard
            label="Total balance"
            amount={METRICS.totalBalance}
            delta="+2.4% this month"
            deltaTone="success"
          >
            <Row wrap={false} gap={8}>
              <MobileButton size="sm" onPress={() => setLastRow("Top up")}>
                Top up
              </MobileButton>
              <MobileButton
                size="sm"
                variant="outline"
                onPress={() => setLastRow("Send money")}
              >
                Send
              </MobileButton>
            </Row>
          </MobileBalanceCard>
          <Stack gap={0}>
            <MobileTransactionRow
              title={payroll.title}
              subtitle={payroll.subtitle}
              amount={payroll.amount}
              amountTone={amountTone(payroll.tone)}
              onPress={() => setLastRow(payroll.title)}
            />
            <MobileTransactionRow
              title={coffee.title}
              subtitle={coffee.subtitle}
              amount={coffee.amount}
              amountTone={amountTone(coffee.tone)}
              icon={<ShowcaseIcon name="archive" size="sm" />}
            />
            <MobileTransactionRow
              title={gym.title}
              subtitle={gym.subtitle}
              amount={gym.amount}
              amountTone={amountTone(gym.tone)}
              onPress={() => setLastRow(gym.title)}
            />
          </Stack>
        </Stack>
      </Specimen>

      <Specimen
        title="Records & progress"
        description="A fixed-width table that scrolls horizontally rather than squeezing columns, a progress hero with a caption that says what is left, and a timeline whose dot tones carry status. Row press emits an index — the label lookup stays here."
        modulePath="composite/data-table · progress-card · timeline"
      >
        <Stack gap={SPACE.row}>
          <MobileDataTable
            columns={TABLE_COLUMNS}
            rows={TABLE_ROWS}
            onRowPress={(index) =>
              setLastTableRow(`${PLAN_NAMES[index] ?? "Unknown"} plan`)
            }
          />
          <Readout label="Last row pressed" value={lastTableRow} />
          <MobileProgressCard
            title="Profile strength"
            value={0.7}
            caption="2 steps left — add a photo and a bio"
          />
          <MobileTimeline items={TIMELINE_ITEMS} />
        </Stack>
      </Specimen>

      <Specimen
        title="People"
        description="User rows, the profile hero and notifications. Trailing slots stay honest: a badge reports status, a chevron promises navigation, and a card with no onPress gets neither. Dismiss removes the card from local state — the component only emits the callback."
        modulePath="composite/user-row · profile-header · notification-card"
      >
        <Stack gap={SPACE.row}>
          <MobileUserRow
            name={grace.name}
            subtitle={`${grace.handle} · ${grace.role}`}
            trailing={<MobileBadge variant="success">Admin</MobileBadge>}
            onPress={() => setLastRow(grace.name)}
          />
          <MobileUserRow
            name={katherine.name}
            subtitle={katherine.email}
            trailing={
              <MobileText variant="title" color="muted">
                ›
              </MobileText>
            }
            onPress={() => setLastRow(katherine.name)}
          />
          <MobileProfileHeader
            name={ada.name}
            handle={ada.handle}
            initials={ada.initials}
            stats={[
              { label: "Posts", value: "284" },
              { label: "Followers", value: "12.4k" },
              { label: "Following", value: "318" },
            ]}
          >
            <Row wrap={false} gap={8}>
              <MobileButton
                size="sm"
                onPress={() => setLastRow(`Follow ${ada.name}`)}
              >
                Follow
              </MobileButton>
              <MobileButton
                size="sm"
                variant="outline"
                onPress={() => setLastRow(`Message ${ada.name}`)}
              >
                Message
              </MobileButton>
            </Row>
          </MobileProfileHeader>
          {notifications.length === 0 ? (
            <MobileText variant="caption" color="muted">
              All caught up — both notifications dismissed.
            </MobileText>
          ) : (
            notifications.map((n) => (
              <MobileNotificationCard
                key={n.id}
                title={n.title}
                body={n.body}
                time={n.time}
                unread={n.unread}
                icon={<ShowcaseIcon name="info" size="sm" />}
                onPress={() => setLastRow(n.title)}
                onDismiss={() =>
                  setNotifications((prev) => prev.filter((x) => x.id !== n.id))
                }
              />
            ))
          )}
        </Stack>
      </Specimen>

      <Specimen
        title="Reviews & comments"
        description="The verdict trio: a comment, a starred review and the histogram that summarises them. The review card is read-only on purpose — it reports a rating, it never collects one; the breakdown is ordered 5★ first and averages out to the 4.3 on display."
        modulePath="composite/comment-card · review-card · rating-summary"
      >
        <Stack gap={SPACE.row}>
          <MobileCommentCard
            author={margaret.name}
            time="2h ago"
            text="The onboarding flow reads much better after the rewrite. One nit: the second step still says 'Continue' twice."
          />
          <MobileReviewCard
            author={barbara.name}
            rating={4}
            time="Mar 3"
            text="Fast, predictable, and the dark theme is genuinely dark. Docked one star only because I want more chart types."
          />
          <MobileRatingSummary
            average={4.3}
            total={128}
            breakdown={[74, 32, 13, 6, 3]}
          />
        </Stack>
      </Specimen>

      <Specimen
        title="Files & tasks"
        description="Record details, files at rest and in flight, and the task row. A key/value row earns its chevron only with an onPress; the upload row is driven by a plain slider here because the component reports progress and owns none."
        modulePath="composite/key-value-row · file-row · upload-progress-row · attachment-chip · task-row"
      >
        <Stack gap={SPACE.row}>
          <Stack gap={0}>
            <MobileKeyValueRow label="Workspace" value="Celestia HQ" />
            <MobileSeparator />
            <MobileKeyValueRow
              label="Billing email"
              value={
                <MobileText variant="callout" color="muted">
                  billing@celestia.dev
                </MobileText>
              }
              onPress={() => setLastRow("Billing email")}
            />
            <MobileSeparator />
            <MobileKeyValueRow label="Storage used" value="12.4 GB of 50 GB" />
          </Stack>
          <Stack gap={0}>
            {files.map((f, i) => (
              <React.Fragment key={f.id}>
                {i > 0 ? <MobileSeparator /> : null}
                <MobileFileRow
                  name={f.name}
                  size={f.size}
                  icon={<ShowcaseIcon name="note" size="sm" />}
                  onPress={() => setLastRow(f.name)}
                  onDismiss={
                    f.removable
                      ? () =>
                          setFiles((prev) => prev.filter((x) => x.id !== f.id))
                      : undefined
                  }
                />
              </React.Fragment>
            ))}
          </Stack>
          <Stack gap={SPACE.label}>
            <MobileUploadProgressRow
              name="keynote-final-v3.key"
              progress={upload}
              state="uploading"
            />
            <MobileSlider
              value={upload}
              onValueChange={setUpload}
              step={0.01}
              accessibilityLabel="Simulated upload progress"
            />
            <MobileUploadProgressRow
              name="budget-numbers.xlsx"
              progress={1}
              state="done"
            />
            <MobileUploadProgressRow
              name="venue-contract.pdf"
              progress={0.62}
              state="error"
            />
          </Stack>
          <Row>
            {attachments.map((a) => (
              <MobileAttachmentChip
                key={a}
                label={a}
                onDismiss={() =>
                  setAttachments((prev) => prev.filter((x) => x !== a))
                }
              />
            ))}
          </Row>
          <Stack gap={0}>
            {tasks.map((t) => (
              <MobileTaskRow
                key={t.id}
                title={t.title}
                subtitle={t.subtitle}
                done={t.done}
                onToggle={(done) =>
                  setTasks((prev) =>
                    prev.map((x) => (x.id === t.id ? { ...x, done } : x))
                  )
                }
              />
            ))}
          </Stack>
        </Stack>
      </Specimen>

      <Specimen
        title="Messaging"
        description="Bubbles own alignment, fill and the delivery glyph; the input owns nothing — it is fully controlled and only emits onSend. Sending appends a bubble marked 'sending' right here, because delivery state is the host's business, not the component's."
        modulePath="composite/message-bubble · chat-input"
      >
        <Stack gap={SPACE.row}>
          {messages.map((m) => (
            <MobileMessageBubble
              key={m.id}
              text={m.text}
              mine={m.mine}
              time={m.time}
              status={m.status}
            />
          ))}
          <MobileChatInput
            value={draft}
            onChangeText={setDraft}
            onSend={handleSend}
            placeholder="Message…"
          />
        </Stack>
      </Specimen>

      <Specimen
        title="Media & events"
        description="The media card takes any image source at a fixed ratio; the event card parses an ISO date into a day/month block and passes pre-formatted copy through verbatim, so server-rendered strings never get re-formatted wrong."
        modulePath="composite/media-card · event-card"
      >
        <Stack gap={SPACE.row}>
          <MobileMediaCard
            source={{ uri: "https://picsum.photos/seed/celestia1/640/360" }}
            title="Designing calm interfaces"
            subtitle="Talk · 24 min"
            onPress={() => setLastRow("Media card")}
          />
          <MobileEventCard
            title="Celestia launch party"
            date="2026-10-03"
            time="18:30 – late"
            location="Pier 27, San Francisco"
            onPress={() => setLastRow("Launch party")}
          />
        </Stack>
      </Specimen>
    </View>
  )
}
