import * as React from "react"
import {
  MobileAuthShell,
  MobileAvatar,
  MobileButton,
  MobileChatScreen,
  MobileCheckbox,
  MobileDashboardScreen,
  MobileDetailScreen,
  MobileForgotPasswordScreen,
  MobileFormField,
  MobileLink,
  MobileListScreen,
  MobileMediaGridScreen,
  MobileNotificationsScreen,
  MobileOnboardingScreen,
  MobileOtpVerifyScreen,
  MobilePinLockScreen,
  MobileProfileScreen,
  MobileResetPasswordScreen,
  MobileScreen,
  MobileSettingRow,
  MobileSettingsScreen,
  MobileSettingsSection,
  MobileSignInScreen,
  MobileSignUpScreen,
  MobileSparkline,
  MobileStatusScreen,
  MobileSwitch,
  MobileTabsScreen,
  MobileTag,
  MobileText,
  MobileTextInput,
  MobileWizardScreen,
  useMobileTheme,
  type ColorRamp,
  type MobileChatScreenMessage,
  type MobileNotificationsScreenItem,
  type MobileOnboardingSlide,
  type MobileSocialProvider,
  type MobileStatusVariant,
  type MobileTabsScreenTab,
} from "@celestia-project/mobile"
import { ShowcaseIcon, type ShowcaseIconName } from "./icons"
import {
  ADA,
  CHAT_TIMES,
  GRACE,
  INITIAL_CHAT,
  METRICS,
  NOTIFICATIONS,
  TRANSACTIONS,
  WEEKLY_ACTIVE_USERS,
  amountTone,
} from "./sample-data"
import { Row, Spacer, Stack } from "./ui"

// `noUncheckedIndexedAccess` types the fixture shortcuts as possibly
// undefined; the cast is fixed at six members, so narrow the two used here once.
const ada = ADA!
const grace = GRACE!

/**
 * Full-screen previews of the twenty `layout/` modules.
 *
 * This registry is the reason the showcase can demonstrate the screens at all.
 * The screens own the entire frame — safe area, scrolling, keyboard avoidance,
 * headers, footers — so rendering one *inside* a section page's own
 * `SafeAreaView` would double-pad it and make every screen look subtly wrong.
 * Instead each preview opens as its own stack layer on top of the section,
 * which leaves the section — and its scroll position — mounted underneath.
 *
 * Every preview closes through the same `onClose` callback. That is the whole
 * contract: the screens emit `onBack`, `onSubmit`, `onSignIn` and so on, and
 * *this* file decides what those mean. The library never navigates.
 */

export interface ScreenPreviewContext {
  /** Return to the gallery. Wired to every screen's back affordance. */
  onClose: () => void
}

export interface ScreenPreview {
  /** Stable key used by `ctx.openPreview()`. */
  key: string
  /** Button caption in the gallery. */
  label: string
  /** One line explaining what the screen is for. */
  summary: string
  /** The module path, printed under the button. */
  modulePath: string
  render: (ctx: ScreenPreviewContext) => React.ReactNode
}

/**
 * Label-only on purpose: Heroicons ships no brand logos, so there is no Apple or
 * Google mark to draw. `MobileSocialProvider.icon` is optional, which is why the
 * sign-in and sign-up screens render these as plain outline buttons.
 */
const OAUTH_PROVIDERS: MobileSocialProvider[] = [
  { id: "apple", label: "Apple" },
  { id: "google", label: "Google" },
]

/* -------------------------------------------------------------------------- */
/* Individual previews                                                        */
/* -------------------------------------------------------------------------- */

function BaseScreenPreview({ onClose }: ScreenPreviewContext) {
  const [large, setLarge] = React.useState(true)
  const [bordered, setBordered] = React.useState(true)
  const [pinned, setPinned] = React.useState(true)

  return (
    <MobileScreen
      title="Base screen"
      subtitle="MobileScreen owns the frame"
      onBack={onClose}
      largeTitle={large}
      headerBordered={bordered}
      footer={
        pinned ? (
          <MobileButton onPress={onClose}>Save and go back</MobileButton>
        ) : null
      }
    >
      <MobileText variant="body">
        Every other layout module composes this one. The safe-area padding lives
        on the frame rather than on the scroll content, so the background fills
        the notch and the home indicator while the text stays inset.
      </MobileText>
      <Spacer size={16} />
      <MobileText variant="callout" color="muted">
        The footer is rendered outside the scroll view, which is why it stays
        put while you scroll. Toggle it off below to see the content reclaim the
        space.
      </MobileText>
      <Spacer size={20} />
      <Stack gap={16}>
        <MobileSwitch
          value={large}
          onValueChange={setLarge}
          label="Large title"
          description="Collapses into the bar on scroll"
        />
        <MobileSwitch
          value={bordered}
          onValueChange={setBordered}
          label="Header border"
        />
        <MobileSwitch
          value={pinned}
          onValueChange={setPinned}
          label="Pinned footer"
          description="A footer outside the scroll view"
        />
      </Stack>
      <Spacer size={20} />
      <MobileText variant="callout" color="muted">
        Scroll content follows. It is long on purpose — the point of the
        demonstration is the header and footer behaviour, which is only visible
        once there is something to scroll.
      </MobileText>
      <Spacer size={16} />
      {Array.from({ length: 12 }, (_, index) => (
        <MobileText key={index} variant="body" style={{ marginBottom: 10 }}>
          Row {index + 1}. The frame keeps its padding on every one of these.
        </MobileText>
      ))}
    </MobileScreen>
  )
}

function AuthShellPreview({ onClose }: ScreenPreviewContext) {
  const [email, setEmail] = React.useState("")
  const [accepted, setAccepted] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>(undefined)

  const handleContinue = () => {
    if (email.trim().length === 0) {
      setError("Enter your email address to continue.")
      return
    }
    setError(undefined)
    onClose()
  }

  return (
    <MobileAuthShell
      logo={<ShowcaseIcon name="logo" size="xl" />}
      heading="The auth shell"
      subheading="Logo, heading, form, aside and footer — the frame every authentication screen shares."
      onBack={onClose}
      error={error}
      onDismissError={() => setError(undefined)}
      footer={<MobileButton onPress={handleContinue}>Continue</MobileButton>}
    >
      <Stack gap={16}>
        <MobileFormField label="Work email" required>
          <MobileTextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </MobileFormField>
        <MobileCheckbox
          checked={accepted}
          onCheckedChange={setAccepted}
          label="Keep me signed in"
        />
      </Stack>
    </MobileAuthShell>
  )
}

function OnboardingPreview({ onClose }: ScreenPreviewContext) {
  const [index, setIndex] = React.useState(0)

  // Built during render rather than at module scope: the media slots are icons,
  // and `ShowcaseIcon` reads the theme — which only exists inside a component.
  const slides: MobileOnboardingSlide[] = [
    {
      id: "capture",
      title: "Capture anything",
      description:
        "Notes, links and files land in one inbox. No folders to file them into before you can move on.",
      media: <ShowcaseIcon name="capture" size="lg" />,
    },
    {
      id: "organise",
      title: "Organise later",
      description:
        "Triage in batches when you have time. Every capture keeps its original context and source.",
      media: <ShowcaseIcon name="organise" size="lg" />,
    },
    {
      id: "share",
      title: "Share the result",
      description:
        "Publish a read-only view, or invite collaborators into the workspace with role-based access.",
      media: <ShowcaseIcon name="share" size="lg" />,
    },
  ]

  return (
    <MobileOnboardingScreen
      slides={slides}
      activeIndex={index}
      onIndexChange={setIndex}
      onDone={onClose}
      onSkip={onClose}
      skipLabel="Skip"
      nextLabel="Next"
      doneLabel="Get started"
    />
  )
}

function SignInPreview({ onClose }: ScreenPreviewContext) {
  const [error, setError] = React.useState<string | undefined>(undefined)

  return (
    <MobileSignInScreen
      heading="Welcome back"
      subheading="Sign in to continue to your workspace."
      onBack={onClose}
      error={error}
      onDismissError={() => setError(undefined)}
      socialProviders={OAUTH_PROVIDERS}
      onSocialProviderPress={() =>
        setError("OAuth is not wired up in the showcase.")
      }
      onForgotPassword={() =>
        setError("This demo has no router — use the Forgot password preview.")
      }
      onSignUp={() =>
        setError("This demo has no router — use the Sign up preview.")
      }
      onSubmit={(data) => {
        // A real host would call its auth client here. The screen deliberately
        // has no idea that a network exists.
        if (data.password.length < 8) {
          setError("That password is too short.")
          return
        }
        setError(undefined)
        onClose()
      }}
    />
  )
}

function SignUpPreview({ onClose }: ScreenPreviewContext) {
  const [error, setError] = React.useState<string | undefined>(undefined)

  return (
    <MobileSignUpScreen
      heading="Create your account"
      subheading="Two minutes, no credit card."
      onBack={onClose}
      error={error}
      onDismissError={() => setError(undefined)}
      socialProviders={OAUTH_PROVIDERS}
      onSocialProviderPress={() =>
        setError("OAuth is not wired up in the showcase.")
      }
      onSignIn={() =>
        setError("This demo has no router — use the Sign in preview.")
      }
      onTermsPress={() => setError("Terms document would open here.")}
      onPrivacyPress={() => setError("Privacy document would open here.")}
      onSubmit={(data) => {
        if (!data.acceptedTerms) {
          setError("Accept the terms to create an account.")
          return
        }
        setError(undefined)
        onClose()
      }}
    />
  )
}

function ForgotPasswordPreview({ onClose }: ScreenPreviewContext) {
  const [error, setError] = React.useState<string | undefined>(undefined)

  return (
    <MobileForgotPasswordScreen
      heading="Reset your password"
      subheading="We will email you a link that expires in 30 minutes."
      onBack={onClose}
      onBackToSignIn={onClose}
      error={error}
      onDismissError={() => setError(undefined)}
      onSubmit={(data) => {
        if (!data.email.includes("@")) {
          setError("That does not look like an email address.")
          return
        }
        setError(undefined)
        onClose()
      }}
    />
  )
}

function ResetPasswordPreview({ onClose }: ScreenPreviewContext) {
  const [error, setError] = React.useState<string | undefined>(undefined)

  return (
    <MobileResetPasswordScreen
      heading="Choose a new password"
      subheading="The strength meter is scored by the same function that gates submit."
      onBack={onClose}
      error={error}
      onDismissError={() => setError(undefined)}
      onSubmit={() => {
        setError(undefined)
        onClose()
      }}
    />
  )
}

function OtpVerifyPreview({ onClose }: ScreenPreviewContext) {
  const [error, setError] = React.useState<string | undefined>(undefined)
  const [resends, setResends] = React.useState(0)

  return (
    <MobileOtpVerifyScreen
      heading="Enter the code"
      destination={ada.email}
      length={6}
      resendSeconds={30}
      onBack={onClose}
      onBackToSignIn={onClose}
      error={error}
      onDismissError={() => setError(undefined)}
      onResend={() => setResends((count) => count + 1)}
      onSubmit={(code) => {
        if (code !== "123456") {
          setError(`Incorrect code — try 123456. (${resends} resends so far.)`)
          return
        }
        setError(undefined)
        onClose()
      }}
    />
  )
}

function SettingsPreview({ onClose }: ScreenPreviewContext) {
  const [wifiOnly, setWifiOnly] = React.useState(true)
  const [haptics, setHaptics] = React.useState(true)

  return (
    <MobileSettingsScreen
      title="Settings"
      onBack={onClose}
      profile={
        <Stack gap={8}>
          <Row wrap={false} gap={12}>
            <MobileAvatar initials={ada.initials} />
            <MobileText variant="title" style={{ flex: 1 }}>
              {ada.name}
            </MobileText>
          </Row>
          <MobileText variant="callout" color="muted">
            {ada.email}
          </MobileText>
        </Stack>
      }
      footer={
        <MobileButton variant="outline" onPress={onClose}>
          Sign out
        </MobileButton>
      }
    >
      <MobileSettingsSection
        title="Account"
        footer="Changing your email requires re-verification."
      >
        <MobileSettingRow label="Name" value={ada.name} showChevron />
        <MobileSettingRow label="Email" value={ada.email} showChevron />
        <MobileSettingRow label="Plan" value="Pro" showChevron />
      </MobileSettingsSection>

      <MobileSettingsSection
        title="Preferences"
        footer="Downloads over cellular may incur charges."
      >
        <MobileSettingRow
          label="Download over Wi-Fi only"
          trailing={
            <MobileSwitch value={wifiOnly} onValueChange={setWifiOnly} />
          }
        />
        <MobileSettingRow
          label="Haptic feedback"
          description="Uses the device taptic engine"
          trailing={<MobileSwitch value={haptics} onValueChange={setHaptics} />}
        />
        <MobileSettingRow label="Appearance" value="Match system" showChevron />
      </MobileSettingsSection>

      <MobileSettingsSection title="Danger zone">
        <MobileSettingRow
          label="Delete account"
          description="Permanent and irreversible"
          onPress={onClose}
        />
      </MobileSettingsSection>
    </MobileSettingsScreen>
  )
}

const STATUS_VARIANTS: MobileStatusVariant[] = [
  "success",
  "info",
  "warning",
  "error",
  "notFound",
  "maintenance",
]

/**
 * Copy, icon and accent for each outcome.
 *
 * The accent mapping deliberately mirrors `MobileStatusScreen`'s own internal
 * `ACCENT_TOKEN` table. The screen colours its built-in glyph from that table but
 * renders a supplied `icon` untouched, so the caller has to tint it — and the
 * tint should be the one the screen would have chosen itself.
 */
const STATUS_COPY: Record<
  MobileStatusVariant,
  {
    title: string
    message: string
    icon: ShowcaseIconName
    accent: keyof ColorRamp
  }
> = {
  success: {
    title: "Payment received",
    message: `Your receipt is on its way to ${ada.email}.`,
    icon: "check",
    accent: "success",
  },
  info: {
    title: "Export ready",
    message: `The archive holds ${METRICS.signups} records and expires in 24 hours.`,
    icon: "info",
    accent: "info",
  },
  warning: {
    title: "Storage nearly full",
    message: "You have used 47 of 50 GB. New uploads will fail soon.",
    icon: "warning",
    accent: "warning",
  },
  error: {
    title: "Something went wrong",
    message: "The request timed out. Nothing was charged.",
    icon: "error",
    accent: "destructive",
  },
  notFound: {
    title: "Page not found",
    message: "That link may have expired, or the item was deleted.",
    icon: "help",
    accent: "muted",
  },
  maintenance: {
    title: "Back shortly",
    message: "We are deploying. This usually takes under five minutes.",
    icon: "time",
    accent: "warning",
  },
}

function StatusPreview({ onClose }: ScreenPreviewContext) {
  const { colors } = useMobileTheme()
  const [index, setIndex] = React.useState(0)
  const variant = STATUS_VARIANTS[index] ?? "success"
  const copy = STATUS_COPY[variant]

  const next = () =>
    setIndex((current) => (current + 1) % STATUS_VARIANTS.length)

  return (
    <MobileStatusScreen
      variant={variant}
      icon={
        <ShowcaseIcon name={copy.icon} size="xl" color={colors[copy.accent]} />
      }
      title={copy.title}
      message={copy.message}
      onBack={onClose}
      primaryAction={
        <MobileButton onPress={next}>
          {`Next variant (${((index + 1) % STATUS_VARIANTS.length) + 1}/${
            STATUS_VARIANTS.length
          })`}
        </MobileButton>
      }
      secondaryAction={
        <MobileLink onPress={onClose}>Back to the gallery</MobileLink>
      }
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Second wave — the content screens                                          */
/* -------------------------------------------------------------------------- */

function ProfilePreview({ onClose }: ScreenPreviewContext) {
  const [note, setNote] = React.useState(
    "Tap Edit or a chevron row to see its callback fire."
  )

  return (
    <MobileProfileScreen
      title="Profile"
      onBack={onClose}
      name={ada.name}
      handle={ada.handle}
      imageSource={{ uri: "https://picsum.photos/seed/ada/160/160" }}
      stats={[
        { label: "Posts", value: "284" },
        { label: "Followers", value: "12.4k" },
        { label: "Following", value: "318" },
      ]}
      sections={[
        {
          title: "Contact",
          rows: [
            { label: "Email", value: ada.email },
            { label: "Phone", value: "+44 20 7946 0102" },
          ],
        },
        {
          title: "Work",
          rows: [
            {
              label: "Role",
              value: ada.role,
              onPress: () =>
                setNote("Role row tapped — a real app opens the role editor."),
            },
            {
              label: "Team",
              value: ada.team,
              onPress: () => setNote("Team row tapped."),
            },
          ],
        },
      ]}
      onEdit={() => setNote("Edit pressed — a real app pushes the edit form.")}
    >
      <MobileText variant="callout" color="muted">
        {note}
      </MobileText>
    </MobileProfileScreen>
  )
}

// The full shared notification feed — the screen demos dismiss and
// "Mark all read", so it wants a list long enough to lose items from.
const NOTIFICATION_SEED: MobileNotificationsScreenItem[] = NOTIFICATIONS.map(
  (notification) => ({ ...notification })
)

function NotificationsPreview({ onClose }: ScreenPreviewContext) {
  const [items, setItems] =
    React.useState<MobileNotificationsScreenItem[]>(NOTIFICATION_SEED)
  const [opened, setOpened] = React.useState<string | null>(null)

  return (
    <MobileNotificationsScreen
      title="Notifications"
      subtitle={opened ? `Last opened: ${opened}` : undefined}
      onBack={onClose}
      notifications={items}
      onPressNotification={(id) => {
        setOpened(id)
        setItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, unread: false } : item
          )
        )
      }}
      onDismissNotification={(id) =>
        setItems((current) => current.filter((item) => item.id !== id))
      }
      onMarkAllRead={() =>
        setItems((current) =>
          current.map((item) => ({ ...item, unread: false }))
        )
      }
    />
  )
}

// Same shared thread the messaging specimen seeds from, mapped into the
// screen's string-id shape with timestamps added.
const CHAT_SEED: MobileChatScreenMessage[] = INITIAL_CHAT.map(
  (message, index) => ({
    id: String(message.id),
    text: message.text,
    mine: message.mine,
    time: CHAT_TIMES[index],
    status: message.mine ? "sent" : undefined,
  })
)

function ChatPreview({ onClose }: ScreenPreviewContext) {
  const [messages, setMessages] =
    React.useState<MobileChatScreenMessage[]>(CHAT_SEED)
  const [input, setInput] = React.useState("")

  const send = () => {
    const text = input.trim()
    if (text === "") return
    setMessages((current) => [
      ...current,
      {
        id: String(current.length + 1),
        text,
        mine: true,
        time: "now",
        status: "sent",
      },
    ])
    setInput("")
  }

  return (
    <MobileChatScreen
      title={grace.name}
      subtitle="Online"
      onBack={onClose}
      messages={messages}
      inputValue={input}
      onChangeText={setInput}
      onSend={send}
      placeholder="Write a message"
    />
  )
}

interface DocumentItem {
  id: string
  name: string
  meta: string
}

const DOCUMENTS: DocumentItem[] = [
  { id: "d1", name: "Q3 launch plan", meta: "Edited 2h ago" },
  { id: "d2", name: "Design tokens RFC", meta: "Edited yesterday" },
  { id: "d3", name: "Onboarding copy", meta: "Edited Monday" },
  { id: "d4", name: "Pin-lock spec", meta: "Edited last week" },
  { id: "d5", name: "Release checklist", meta: "Edited last week" },
]

function ListPreview({ onClose }: ScreenPreviewContext) {
  const [query, setQuery] = React.useState("")
  const [refreshing, setRefreshing] = React.useState(false)

  const items = DOCUMENTS.filter((doc) =>
    doc.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 900)
  }

  return (
    <MobileListScreen<DocumentItem>
      title="Documents"
      onBack={onClose}
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search documents"
      items={items}
      keyExtractor={(doc) => doc.id}
      renderItem={(doc) => (
        <MobileSettingRow label={doc.name} value={doc.meta} showChevron />
      )}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      emptyTitle="No matches"
      emptyMessage={`Nothing named like “${query}”. Try a different search.`}
    />
  )
}

function DetailPreview({ onClose }: ScreenPreviewContext) {
  return (
    <MobileDetailScreen
      title="Ridge Trail"
      onBack={onClose}
      hero={{ uri: "https://picsum.photos/seed/celestia-trail/800/450" }}
      heroAccessibilityLabel="Photo of a ridge trail at sunset"
      summary="A 14 km ridge walk above the reservoir. Dry underfoot in summer, muddy after rain — the last kilometre has loose gravel and no shade."
      sections={[
        {
          title: "Logistics",
          rows: [
            { label: "Distance", value: "14.2 km" },
            { label: "Ascent", value: "640 m" },
            { label: "Difficulty", value: "Moderate" },
          ],
        },
        {
          title: "Conditions",
          rows: [
            { label: "Weather", value: "Clear, 18°C" },
            { label: "Trail report", value: "Dry — updated 2h ago" },
          ],
        },
      ]}
      footer={
        <Row gap={8} wrap={false}>
          <MobileButton
            variant="outline"
            containerStyle={{ flex: 1 }}
            onPress={onClose}
          >
            Share
          </MobileButton>
          <MobileButton containerStyle={{ flex: 1 }} onPress={onClose}>
            Save route
          </MobileButton>
        </Row>
      }
    >
      <Row gap={6}>
        <MobileTag label="hiking" tone="success" />
        <MobileTag label="half day" tone="muted" />
        <MobileTag label="dogs ok" tone="info" />
      </Row>
    </MobileDetailScreen>
  )
}

const WIZARD_FLOW_STEPS = ["Account", "Profile", "Review"]

function WizardPreview({ onClose }: ScreenPreviewContext) {
  const [current, setCurrent] = React.useState(0)
  const isLast = current === WIZARD_FLOW_STEPS.length - 1

  return (
    <MobileWizardScreen
      title="Setup wizard"
      steps={WIZARD_FLOW_STEPS}
      current={current}
      isLastStep={isLast}
      onBack={() => setCurrent((step) => Math.max(0, step - 1))}
      onNext={() => {
        if (isLast) onClose()
        else setCurrent((step) => step + 1)
      }}
      headerRight={
        <MobileButton size="sm" variant="ghost" onPress={onClose}>
          Close
        </MobileButton>
      }
    >
      <MobileText variant="body">
        {current === 0
          ? "Choose the email you will sign in with and set a password. We will send a verification link before the workspace goes live."
          : current === 1
            ? "Add your name, role and a photo so teammates recognise you in mentions, reviews and handovers."
            : "Check your workspace name, plan and notification preferences. Finish creates the workspace and takes you straight to the dashboard."}
      </MobileText>
    </MobileWizardScreen>
  )
}

function TabsPreview({ onClose }: ScreenPreviewContext) {
  const [active, setActive] = React.useState("feed")

  const tabs: MobileTabsScreenTab[] = [
    {
      key: "feed",
      label: "Feed",
      icon: <ShowcaseIcon name="home" size="sm" />,
    },
    {
      key: "mentions",
      label: "Mentions",
      icon: <ShowcaseIcon name="at" size="sm" />,
    },
    {
      key: "saved",
      label: "Saved",
      icon: <ShowcaseIcon name="star" size="sm" />,
    },
  ]

  return (
    <MobileTabsScreen
      title="Tabs screen"
      onBack={onClose}
      tabs={tabs}
      active={active}
      onChange={setActive}
    >
      <MobileText variant="body">
        {active === "feed"
          ? "Feed — the timeline a home tab usually carries. The tab bar sits under the header and survives the switch."
          : active === "mentions"
            ? "Mentions — three unread, apparently. The screen keeps one scroll view for whatever tab is active."
            : "Saved — bookmarked items would render here."}
      </MobileText>
    </MobileTabsScreen>
  )
}

function DashboardPreview({ onClose }: ScreenPreviewContext) {
  const [selected, setSelected] = React.useState<string | null>(null)

  return (
    <MobileDashboardScreen
      title="Dashboard"
      subtitle={selected ? `Last tapped: ${selected}` : undefined}
      onBack={onClose}
      greeting="Good morning"
      name={ada.name.split(" ")[0] ?? ada.name}
      balance={{
        label: "Total balance",
        amount: METRICS.totalBalance,
        delta: "+2.4% this month",
      }}
      stats={[
        {
          label: "Revenue",
          value: METRICS.revenue,
          delta: METRICS.revenueDelta,
          deltaTone: "success",
        },
        {
          label: "Refunds",
          value: METRICS.refunds,
          delta: METRICS.refundsDelta,
          deltaTone: "destructive",
        },
        {
          label: "Signups",
          value: METRICS.signups,
          delta: METRICS.signupsDelta,
          deltaTone: "success",
        },
        {
          label: "Active users",
          value: METRICS.activeUsers,
          deltaTone: "muted",
        },
      ]}
      transactions={TRANSACTIONS.slice(0, 3).map((transaction) => ({
        id: transaction.id,
        title: transaction.title,
        subtitle: transaction.subtitle,
        amount: transaction.amount,
        amountTone: amountTone(transaction.tone),
      }))}
      onTransactionPress={(id) => setSelected(id)}
    >
      <MobileSparkline data={WEEKLY_ACTIVE_USERS} height={56} showEndPoint />
    </MobileDashboardScreen>
  )
}

function PinLockPreview({ onClose }: ScreenPreviewContext) {
  const [error, setError] = React.useState(false)
  const [attempts, setAttempts] = React.useState(0)
  const [lastLength, setLastLength] = React.useState<number | null>(null)

  return (
    <MobilePinLockScreen
      title="Unlock the vault"
      message="Demo PIN: 2468"
      subtitle={`Attempts: ${attempts}${lastLength ? ` · last entry ${lastLength} digits` : ""}`}
      onBack={onClose}
      pinLength={4}
      error={error}
      errorMessage="Wrong PIN — try again."
      onComplete={(pin) => {
        setAttempts((count) => count + 1)
        setLastLength(pin.length)
        if (pin === "2468") {
          setError(false)
          onClose()
        } else {
          setError(true)
        }
      }}
      onBiometric={onClose}
      biometricLabel="Use Face ID"
    />
  )
}

const MEDIA_IMAGES = Array.from({ length: 9 }, (_, index) => ({
  uri: `https://picsum.photos/seed/celestia-${index + 1}/300/300`,
}))

function MediaGridPreview({ onClose }: ScreenPreviewContext) {
  const [selected, setSelected] = React.useState<number | null>(null)

  return (
    <MobileMediaGridScreen
      title="Photos"
      subtitle={selected == null ? undefined : `Selected: #${selected + 1}`}
      onBack={onClose}
      images={MEDIA_IMAGES}
      columns={3}
      gap={4}
      onSelectImage={(index) => setSelected(index)}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Order matters — it is the order the gallery renders them in, and it follows
 * the dependency chain: the base frame first, then the shell built on it, then
 * the screens built on the shell, then the two standalone screens. The content
 * screens close out the list: identity, feeds, flows and media.
 */
export const SCREEN_PREVIEWS: ScreenPreview[] = [
  {
    key: "screen",
    label: "Base screen",
    summary: "The frame every other layout module composes.",
    modulePath: "layout/screen",
    render: (ctx) => <BaseScreenPreview {...ctx} />,
  },
  {
    key: "auth-shell",
    label: "Auth shell",
    summary:
      "Logo, heading, form, aside, footer — with a hand-rolled form inside.",
    modulePath: "layout/auth-shell",
    render: (ctx) => <AuthShellPreview {...ctx} />,
  },
  {
    key: "onboarding-screen",
    label: "Onboarding",
    summary: "Swipeable pager with a dot indicator and skip/next/done.",
    modulePath: "layout/onboarding-screen",
    render: (ctx) => <OnboardingPreview {...ctx} />,
  },
  {
    key: "sign-in-screen",
    label: "Sign in",
    summary: "Email, password, remember-me, OAuth and both cross-links.",
    modulePath: "layout/sign-in-screen",
    render: (ctx) => <SignInPreview {...ctx} />,
  },
  {
    key: "sign-up-screen",
    label: "Sign up",
    summary: "Name, email, password with hints, and a terms checkbox.",
    modulePath: "layout/sign-up-screen",
    render: (ctx) => <SignUpPreview {...ctx} />,
  },
  {
    key: "forgot-password-screen",
    label: "Forgot password",
    summary: "One field. Hands its success state to the status screen.",
    modulePath: "layout/forgot-password-screen",
    render: (ctx) => <ForgotPasswordPreview {...ctx} />,
  },
  {
    key: "reset-password-screen",
    label: "Reset password",
    summary: "Strength meter and a confirmation field that must match.",
    modulePath: "layout/reset-password-screen",
    render: (ctx) => <ResetPasswordPreview {...ctx} />,
  },
  {
    key: "otp-verify-screen",
    label: "OTP verify",
    summary: "Code entry with a resend cooldown. Try 123456.",
    modulePath: "layout/otp-verify-screen",
    render: (ctx) => <OtpVerifyPreview {...ctx} />,
  },
  {
    key: "settings-screen",
    label: "Settings",
    summary:
      "Profile header, grouped sections with footers, and a danger zone.",
    modulePath: "layout/settings-screen",
    render: (ctx) => <SettingsPreview {...ctx} />,
  },
  {
    key: "status-screen",
    label: "Status screen",
    summary:
      "Six variants — success, info, warning, error, 404 and maintenance.",
    modulePath: "layout/status-screen",
    render: (ctx) => <StatusPreview {...ctx} />,
  },
  {
    key: "profile-screen",
    label: "Profile",
    summary:
      "Identity header, stat pills and grouped key/value rows with an Edit action.",
    modulePath: "layout/profile-screen",
    render: (ctx) => <ProfilePreview {...ctx} />,
  },
  {
    key: "notifications-screen",
    label: "Notifications",
    summary:
      "Unread accents, per-item dismiss and Mark all read — try them, the list is live.",
    modulePath: "layout/notifications-screen",
    render: (ctx) => <NotificationsPreview {...ctx} />,
  },
  {
    key: "chat-screen",
    label: "Chat",
    summary:
      "Bubbles, delivery states and a controlled composer — sent messages append locally.",
    modulePath: "layout/chat-screen",
    render: (ctx) => <ChatPreview {...ctx} />,
  },
  {
    key: "list-screen",
    label: "List",
    summary:
      "Searchable, pull-to-refresh list with a caller-owned row renderer and empty state.",
    modulePath: "layout/list-screen",
    render: (ctx) => <ListPreview {...ctx} />,
  },
  {
    key: "detail-screen",
    label: "Detail",
    summary: "Hero image, lede, key/value sections and a pinned action bar.",
    modulePath: "layout/detail-screen",
    render: (ctx) => <DetailPreview {...ctx} />,
  },
  {
    key: "wizard-screen",
    label: "Wizard",
    summary:
      "Stepper plus a Back/Next shelf — Finish on the last step closes the preview.",
    modulePath: "layout/wizard-screen",
    render: (ctx) => <WizardPreview {...ctx} />,
  },
  {
    key: "tabs-screen",
    label: "Tabs screen",
    summary:
      "Icon tab bar under the header with one scroll view for the active tab.",
    modulePath: "layout/tabs-screen",
    render: (ctx) => <TabsPreview {...ctx} />,
  },
  {
    key: "dashboard-screen",
    label: "Dashboard",
    summary:
      "Greeting, balance hero, stat tiles, a sparkline slot and recent activity.",
    modulePath: "layout/dashboard-screen",
    render: (ctx) => <DashboardPreview {...ctx} />,
  },
  {
    key: "pin-lock-screen",
    label: "PIN lock",
    summary:
      "Dot feedback, shake on a wrong PIN, biometric escape hatch. Try 2468.",
    modulePath: "layout/pin-lock-screen",
    render: (ctx) => <PinLockPreview {...ctx} />,
  },
  {
    key: "media-grid-screen",
    label: "Media grid",
    summary:
      "Nine remote placeholders in a three-column grid — taps report their index.",
    modulePath: "layout/media-grid-screen",
    render: (ctx) => <MediaGridPreview {...ctx} />,
  },
]

/** Look up a preview by key. Returns `undefined` for an unknown key. */
export function findScreenPreview(key: string): ScreenPreview | undefined {
  return SCREEN_PREVIEWS.find((preview) => preview.key === key)
}
