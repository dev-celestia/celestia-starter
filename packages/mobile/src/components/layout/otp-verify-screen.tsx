import * as React from "react"
import { StyleSheet, View } from "react-native"
import { MobileButton } from "../primitive/button"
import { MobileLink } from "../primitive/link"
import { MobileOtpInput } from "../primitive/otp-input"
import { MobileText } from "../primitive/text"
import { MobileAuthShell, type MobileAuthShellProps } from "./auth-shell"

export interface MobileOtpVerifyLabels {
  heading: string
  submit: string
  resend: string
  resendIn: string
}

const DEFAULT_LABELS: MobileOtpVerifyLabels = {
  heading: "Verify your identity",
  submit: "Verify",
  resend: "Resend code",
  resendIn: "Resend in",
}

export interface MobileOtpVerifyScreenProps
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
   * Overrides the generated heading.
   */
  heading?: string
  /**
   * Overrides the generated subheading. By default the subheading is built from
   * `length` and `destination`, so the copy cannot disagree with the number of
   * cells actually rendered.
   */
  subheading?: string
  /**
   * Where the code was sent — an email address or a masked phone number. Used in
   * the generated subheading.
   */
  destination?: string
  /**
   * Copy overrides, merged over the English defaults.
   */
  labels?: Partial<MobileOtpVerifyLabels>
  /**
   * Number of digits expected.
   * @default 6
   */
  length?: number
  /**
   * Called with the code when the submit button is pressed and the code is
   * complete.
   */
  onSubmit?: (code: string) => void
  /**
   * Called as soon as the code reaches full length, for callers that want to
   * submit without waiting for a button press.
   */
  onComplete?: (code: string) => void
  /**
   * Requests a new code. Renders the resend affordance.
   */
  onResend?: () => void
  /**
   * Seconds to wait before resending is allowed. The countdown starts on mount,
   * because the screen is only reached after a code has already been sent.
   * @default 30
   */
  resendSeconds?: number
  /**
   * Disables every control and puts the submit button in a pending state.
   * @default false
   */
  loading?: boolean
  /**
   * Form-level error from the caller — an expired or incorrect code.
   */
  error?: string
  /**
   * Renders a dismiss affordance on the form-level error.
   */
  onDismissError?: () => void
  /**
   * Renders a back-to-sign-in affordance beneath the resend row.
   */
  onBackToSignIn?: () => void
}

/**
 * MobileOtpVerifyScreen
 *
 * One-time-code entry for email verification, SMS verification and 2FA.
 *
 * The resend cooldown is a single `setTimeout` rescheduled by its own state
 * change rather than an interval, so there is no drift and no leaked timer. The
 * countdown renders with `tabular` numerals — proportional digits make a
 * per-second counter visibly jitter as the glyph widths change.
 *
 * The code field is not wrapped in a `MobileFormField`: `MobileOtpInput` already
 * renders its own error message and carries its own accessible name, so a field
 * wrapper would duplicate both.
 */
export function MobileOtpVerifyScreen({
  heading,
  subheading,
  destination,
  labels,
  length = 6,
  onSubmit,
  onComplete,
  onResend,
  resendSeconds = 30,
  loading = false,
  error,
  onDismissError,
  onBackToSignIn,
  ...shellProps
}: MobileOtpVerifyScreenProps) {
  const copy = { ...DEFAULT_LABELS, ...labels }

  const [code, setCode] = React.useState("")
  const [fieldError, setFieldError] = React.useState<string | undefined>()
  const [secondsLeft, setSecondsLeft] = React.useState(resendSeconds)

  // One timeout per tick, rescheduled by the state change it causes. An interval
  // would keep firing after the count reaches zero.
  React.useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const resolvedHeading = heading ?? copy.heading
  const resolvedSubheading =
    subheading ??
    (destination
      ? `Enter the ${length}-digit code we sent to ${destination}.`
      : `Enter the ${length}-digit code we sent you.`)

  const handleCodeChange = (next: string) => {
    setCode(next)
    if (fieldError) setFieldError(undefined)
  }

  const handleResend = () => {
    if (secondsLeft > 0 || !onResend) return
    setCode("")
    setFieldError(undefined)
    setSecondsLeft(resendSeconds)
    onResend()
  }

  const handleSubmit = () => {
    if (code.length < length) {
      setFieldError(`Enter all ${length} digits.`)
      return
    }
    onSubmit?.(code)
  }

  const canResend = secondsLeft <= 0

  return (
    <MobileAuthShell
      {...shellProps}
      heading={resolvedHeading}
      subheading={resolvedSubheading}
      error={error}
      onDismissError={onDismissError}
      footer={
        onBackToSignIn ? (
          <MobileLink onPress={onBackToSignIn}>Back to sign in</MobileLink>
        ) : undefined
      }
    >
      <MobileOtpInput
        length={length}
        value={code}
        onValueChange={handleCodeChange}
        onComplete={onComplete}
        autoFocus
        disabled={loading}
        error={fieldError}
      />

      <View style={styles.resendRow}>
        {canResend ? (
          <MobileLink onPress={handleResend} disabled={!onResend}>
            {copy.resend}
          </MobileLink>
        ) : (
          <MobileText variant="callout" color="muted" tabular>
            {`${copy.resendIn} ${secondsLeft}s`}
          </MobileText>
        )}
      </View>

      <MobileButton
        onPress={handleSubmit}
        disabled={loading}
        accessibilityHint="Submits the verification code"
      >
        {loading ? `${copy.submit}…` : copy.submit}
      </MobileButton>
    </MobileAuthShell>
  )
}

const styles = StyleSheet.create({
  resendRow: {
    alignItems: "center",
    justifyContent: "center",
  },
})
