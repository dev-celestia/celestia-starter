import * as React from "react"
import {
  MobileAuthShell,
  MobileAvatar,
  MobileButton,
  MobileCheckbox,
  MobileForgotPasswordScreen,
  MobileFormField,
  MobileLink,
  MobileOnboardingScreen,
  MobileOtpVerifyScreen,
  MobileResetPasswordScreen,
  MobileScreen,
  MobileSettingRow,
  MobileSettingsScreen,
  MobileSettingsSection,
  MobileSignInScreen,
  MobileSignUpScreen,
  MobileStatusScreen,
  MobileSwitch,
  MobileText,
  MobileTextInput,
  type MobileOnboardingSlide,
  type MobileSocialProvider,
  type MobileStatusVariant,
} from "@celestia-project/mobile"
import { Glyph, Row, Spacer, Stack } from "./ui"

/**
 * Full-screen previews of the ten `layout/` modules.
 *
 * This registry is the reason the showcase can demonstrate the screens at all.
 * The screens own the entire frame — safe area, scrolling, keyboard avoidance,
 * headers, footers — so rendering one *inside* the gallery's own `SafeAreaView`
 * would double-pad it and make every screen look subtly wrong. Instead the
 * gallery swaps itself out for a preview.
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

const OAUTH_PROVIDERS: MobileSocialProvider[] = [
  { id: "apple", label: "Apple", icon: <Glyph glyph="◉" size="callout" /> },
  { id: "google", label: "Google", icon: <Glyph glyph="G" size="callout" /> },
]

const ONBOARDING_SLIDES: MobileOnboardingSlide[] = [
  {
    id: "capture",
    title: "Capture anything",
    description:
      "Notes, links and files land in one inbox. No folders to file them into before you can move on.",
    media: <Glyph glyph="◇" size="display" />,
  },
  {
    id: "organise",
    title: "Organise later",
    description:
      "Triage in batches when you have time. Every capture keeps its original context and source.",
    media: <Glyph glyph="▤" size="display" />,
  },
  {
    id: "share",
    title: "Share the result",
    description:
      "Publish a read-only view, or invite collaborators into the workspace with role-based access.",
    media: <Glyph glyph="◎" size="display" />,
  },
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
        The footer is rendered outside the scroll view, which is why it stays put
        while you scroll. Toggle it off below to see the content reclaim the
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
      logo={<Glyph glyph="◎" size="display" />}
      heading="The auth shell"
      subheading="Logo, heading, form, aside and footer — the frame every authentication screen shares."
      onBack={onClose}
      error={error}
      onDismissError={() => setError(undefined)}
      footer={
        <MobileButton onPress={handleContinue}>Continue</MobileButton>
      }
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

  return (
    <MobileOnboardingScreen
      slides={ONBOARDING_SLIDES}
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
      onSocialProviderPress={() => setError("OAuth is not wired up in the showcase.")}
      onForgotPassword={() => setError("This demo has no router — use the Forgot password preview.")}
      onSignUp={() => setError("This demo has no router — use the Sign up preview.")}
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
      onSocialProviderPress={() => setError("OAuth is not wired up in the showcase.")}
      onSignIn={() => setError("This demo has no router — use the Sign in preview.")}
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
      destination="ada@example.com"
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
            <MobileAvatar initials="AL" />
            <MobileText variant="title" style={{ flex: 1 }}>
              Ada Lovelace
            </MobileText>
          </Row>
          <MobileText variant="callout" color="muted">
            ada@example.com
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
        <MobileSettingRow label="Name" value="Ada Lovelace" showChevron />
        <MobileSettingRow label="Email" value="ada@example.com" showChevron />
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

const STATUS_COPY: Record<
  MobileStatusVariant,
  { title: string; message: string; glyph: string }
> = {
  success: {
    title: "Payment received",
    message: "Your receipt is on its way to ada@example.com.",
    glyph: "✓",
  },
  info: {
    title: "Export ready",
    message: "The archive holds 1,284 records and expires in 24 hours.",
    glyph: "i",
  },
  warning: {
    title: "Storage nearly full",
    message: "You have used 47 of 50 GB. New uploads will fail soon.",
    glyph: "!",
  },
  error: {
    title: "Something went wrong",
    message: "The request timed out. Nothing was charged.",
    glyph: "✕",
  },
  notFound: {
    title: "Page not found",
    message: "That link may have expired, or the item was deleted.",
    glyph: "?",
  },
  maintenance: {
    title: "Back shortly",
    message: "We are deploying. This usually takes under five minutes.",
    glyph: "⌛",
  },
}

function StatusPreview({ onClose }: ScreenPreviewContext) {
  const [index, setIndex] = React.useState(0)
  const variant = STATUS_VARIANTS[index] ?? "success"
  const copy = STATUS_COPY[variant]

  const next = () => setIndex((current) => (current + 1) % STATUS_VARIANTS.length)

  return (
    <MobileStatusScreen
      variant={variant}
      icon={<Glyph glyph={copy.glyph} size="display" />}
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
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Order matters — it is the order the gallery renders them in, and it follows
 * the dependency chain: the base frame first, then the shell built on it, then
 * the screens built on the shell, then the two standalone screens.
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
    summary: "Logo, heading, form, aside, footer — with a hand-rolled form inside.",
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
    summary: "Profile header, grouped sections with footers, and a danger zone.",
    modulePath: "layout/settings-screen",
    render: (ctx) => <SettingsPreview {...ctx} />,
  },
  {
    key: "status-screen",
    label: "Status screen",
    summary: "Six variants — success, info, warning, error, 404 and maintenance.",
    modulePath: "layout/status-screen",
    render: (ctx) => <StatusPreview {...ctx} />,
  },
]

/** Look up a preview by key. Returns `undefined` for an unknown key. */
export function findScreenPreview(key: string): ScreenPreview | undefined {
  return SCREEN_PREVIEWS.find((preview) => preview.key === key)
}
