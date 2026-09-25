import * as React from "react"
import { StyleSheet, View } from "react-native"
import {
  MobileSocialAuthButtons,
  type MobileSocialProvider,
} from "../composite/social-auth-buttons"
import { MobileFormField } from "../composite/form-field"
import { MobileButton } from "../primitive/button"
import { MobileCheckbox } from "../primitive/checkbox"
import { MobileTextInput } from "../primitive/input"
import { MobileLink } from "../primitive/link"
import { MobileText } from "../primitive/text"
import { MobileAuthShell, type MobileAuthShellProps } from "./auth-shell"

export interface MobileSignInData {
  email: string
  password: string
  remember: boolean
}

/**
 * User-visible copy. Grouped rather than spread across a dozen flat props so the
 * component's real API — data in, callbacks out — stays readable.
 */
export interface MobileSignInLabels {
  email: string
  emailPlaceholder: string
  password: string
  passwordPlaceholder: string
  submit: string
  remember: string
  forgotPassword: string
  signUpPrompt: string
  signUp: string
}

const DEFAULT_LABELS: MobileSignInLabels = {
  email: "Email",
  emailPlaceholder: "you@example.com",
  password: "Password",
  passwordPlaceholder: "Your password",
  submit: "Sign in",
  remember: "Remember me",
  forgotPassword: "Forgot password?",
  signUpPrompt: "Don't have an account?",
  signUp: "Sign up",
}

export interface MobileSignInScreenProps
  extends Omit<
    MobileAuthShellProps,
    | "children"
    | "heading"
    | "subheading"
    | "aside"
    | "asideLabel"
    | "footer"
    | "error"
    | "onDismissError"
    | "errorDismissAccessibilityLabel"
  > {
  /**
   * @default 'Welcome back'
   */
  heading?: string
  /**
   * @default 'Sign in to continue.'
   */
  subheading?: string
  /**
   * Copy overrides, merged over the English defaults.
   */
  labels?: Partial<MobileSignInLabels>
  /**
   * Initial email value.
   * @default ''
   */
  defaultEmail?: string
  /**
   * Initial state of the remember-me box.
   * @default false
   */
  defaultRemember?: boolean
  /**
   * Federated providers. The whole section is omitted when empty.
   */
  socialProviders?: MobileSocialProvider[]
  /**
   * Called with the pressed provider.
   */
  onSocialProviderPress?: (provider: MobileSocialProvider) => void
  /**
   * Called with the submitted credentials once the built-in required-field check
   * passes.
   */
  onSubmit?: (data: MobileSignInData) => void
  /**
   * Renders the forgot-password affordance.
   */
  onForgotPassword?: () => void
  /**
   * Renders the sign-up affordance.
   */
  onSignUp?: () => void
  /**
   * Disables every control and puts the submit button in a pending state.
   * @default false
   */
  loading?: boolean
  /**
   * Form-level error from the caller — a rejected credential, a network
   * failure. Field-level errors are the screen's own business.
   */
  error?: string
  /**
   * Renders a dismiss affordance on the form-level error.
   */
  onDismissError?: () => void
}

/**
 * MobileSignInScreen
 *
 * Email + password sign-in, with optional remember-me, forgot-password,
 * sign-up and federated providers.
 *
 * Presentational by contract: it holds only field state, and reports the result
 * through `onSubmit`. It does not authenticate, store a session or navigate.
 *
 * **The submit button is never disabled for empty fields.** A dead button with
 * no explanation is the single most common form defect — the user cannot tell
 * whether the form is broken or their input is wrong. Instead the button is
 * always pressable, and pressing it with an empty field names the field that
 * needs attention. The button is disabled only while `loading`, which is the one
 * case where the reason is self-evident.
 */
export function MobileSignInScreen({
  heading = "Welcome back",
  subheading = "Sign in to continue.",
  labels,
  defaultEmail = "",
  defaultRemember = false,
  socialProviders,
  onSocialProviderPress,
  onSubmit,
  onForgotPassword,
  onSignUp,
  loading = false,
  error,
  onDismissError,
  ...shellProps
}: MobileSignInScreenProps) {
  const copy = { ...DEFAULT_LABELS, ...labels }

  const [email, setEmail] = React.useState(defaultEmail)
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(defaultRemember)
  const [fieldErrors, setFieldErrors] = React.useState<{
    email?: string
    password?: string
  }>({})

  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (fieldErrors.email) {
      setFieldErrors((previous) => ({ ...previous, email: undefined }))
    }
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (fieldErrors.password) {
      setFieldErrors((previous) => ({ ...previous, password: undefined }))
    }
  }

  const handleSubmit = () => {
    const nextErrors: { email?: string; password?: string } = {}
    if (email.trim().length === 0) {
      nextErrors.email = `${copy.email} is required.`
    }
    if (password.length === 0) {
      nextErrors.password = `${copy.password} is required.`
    }

    setFieldErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    onSubmit?.({ email: email.trim(), password, remember })
  }

  const hasSocial = Boolean(socialProviders && socialProviders.length > 0)

  return (
    <MobileAuthShell
      {...shellProps}
      heading={heading}
      subheading={subheading}
      error={error}
      onDismissError={onDismissError}
      aside={
        hasSocial ? (
          <MobileSocialAuthButtons
            providers={socialProviders ?? []}
            onProviderPress={onSocialProviderPress}
            disabled={loading}
          />
        ) : undefined
      }
      footer={
        <View style={styles.footerRow}>
          <MobileText variant="callout" color="muted">
            {copy.signUpPrompt}
          </MobileText>
          <MobileLink onPress={onSignUp} disabled={!onSignUp}>
            {copy.signUp}
          </MobileLink>
        </View>
      }
    >
      <MobileFormField label={copy.email} error={fieldErrors.email} required>
        <MobileTextInput
          value={email}
          onChangeText={handleEmailChange}
          placeholder={copy.emailPlaceholder}
          error={Boolean(fieldErrors.email)}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
        />
      </MobileFormField>

      <MobileFormField label={copy.password} error={fieldErrors.password} required>
        <MobileTextInput
          value={password}
          onChangeText={handlePasswordChange}
          placeholder={copy.passwordPlaceholder}
          error={Boolean(fieldErrors.password)}
          editable={!loading}
          secure
          textContentType="password"
          autoComplete="current-password"
        />
      </MobileFormField>

      <View style={styles.actionsRow}>
        <MobileCheckbox
          checked={remember}
          onCheckedChange={setRemember}
          label={copy.remember}
          disabled={loading}
          style={styles.remember}
        />
        <MobileLink onPress={onForgotPassword} disabled={!onForgotPassword}>
          {copy.forgotPassword}
        </MobileLink>
      </View>

      <MobileButton
        onPress={handleSubmit}
        disabled={loading}
        accessibilityHint="Submits the sign-in form"
      >
        {loading ? `${copy.submit}…` : copy.submit}
      </MobileButton>
    </MobileAuthShell>
  )
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  remember: {
    flex: 1,
  },
})
