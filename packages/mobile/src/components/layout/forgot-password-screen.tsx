import * as React from "react"
import { MobileFormField } from "../composite/form-field"
import { MobileButton } from "../primitive/button"
import { MobileTextInput } from "../primitive/input"
import { MobileLink } from "../primitive/link"
import { MobileAuthShell, type MobileAuthShellProps } from "./auth-shell"

export interface MobileForgotPasswordData {
  email: string
}

export interface MobileForgotPasswordLabels {
  email: string
  emailPlaceholder: string
  submit: string
  backToSignIn: string
}

const DEFAULT_LABELS: MobileForgotPasswordLabels = {
  email: "Email",
  emailPlaceholder: "you@example.com",
  submit: "Send reset link",
  backToSignIn: "Back to sign in",
}

export interface MobileForgotPasswordScreenProps
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
   * @default 'Forgot your password?'
   */
  heading?: string
  /**
   * @default "Enter the email on your account and we'll send you a reset link."
   */
  subheading?: string
  /**
   * Copy overrides, merged over the English defaults.
   */
  labels?: Partial<MobileForgotPasswordLabels>
  /**
   * Initial email value.
   * @default ''
   */
  defaultEmail?: string
  /**
   * Called with the email once the built-in required-field check passes.
   */
  onSubmit?: (data: MobileForgotPasswordData) => void
  /**
   * Renders the back-to-sign-in affordance. Also used as the header back
   * affordance when `onBack` is not set, since on this screen both lead to the
   * same place.
   */
  onBackToSignIn?: () => void
  /**
   * Disables every control and puts the submit button in a pending state.
   * @default false
   */
  loading?: boolean
  /**
   * Form-level error from the caller.
   */
  error?: string
  /**
   * Renders a dismiss affordance on the form-level error.
   */
  onDismissError?: () => void
}

/**
 * MobileForgotPasswordScreen
 *
 * Requests a password reset link.
 *
 * This screen deliberately does **not** render a "we sent it" confirmation
 * state. That is a different screen with a different job, and the package
 * already has one — `MobileStatusScreen`. Having the caller navigate there keeps
 * each screen to a single responsibility and avoids a second, divergent success
 * treatment.
 */
export function MobileForgotPasswordScreen({
  heading = "Forgot your password?",
  subheading = "Enter the email on your account and we'll send you a reset link.",
  labels,
  defaultEmail = "",
  onSubmit,
  onBackToSignIn,
  loading = false,
  error,
  onDismissError,
  ...shellProps
}: MobileForgotPasswordScreenProps) {
  const copy = { ...DEFAULT_LABELS, ...labels }

  const [email, setEmail] = React.useState(defaultEmail)
  const [fieldError, setFieldError] = React.useState<string | undefined>()

  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (fieldError) setFieldError(undefined)
  }

  const handleSubmit = () => {
    if (email.trim().length === 0) {
      setFieldError(`${copy.email} is required.`)
      return
    }
    onSubmit?.({ email: email.trim() })
  }

  return (
    <MobileAuthShell
      {...shellProps}
      onBack={shellProps.onBack ?? onBackToSignIn}
      heading={heading}
      subheading={subheading}
      error={error}
      onDismissError={onDismissError}
      footer={
        <MobileLink onPress={onBackToSignIn} disabled={!onBackToSignIn}>
          {copy.backToSignIn}
        </MobileLink>
      }
    >
      <MobileFormField label={copy.email} error={fieldError} required>
        <MobileTextInput
          value={email}
          onChangeText={handleEmailChange}
          placeholder={copy.emailPlaceholder}
          error={Boolean(fieldError)}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
        />
      </MobileFormField>

      <MobileButton
        onPress={handleSubmit}
        disabled={loading}
        accessibilityHint="Sends a password reset link to this email"
      >
        {loading ? `${copy.submit}…` : copy.submit}
      </MobileButton>
    </MobileAuthShell>
  )
}
