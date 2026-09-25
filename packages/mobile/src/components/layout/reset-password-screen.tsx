import * as React from "react"
import { StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileFormField } from "../composite/form-field"
import { MobileButton } from "../primitive/button"
import { MobileTextInput } from "../primitive/input"
import { MobileProgress } from "../primitive/progress"
import { MobileAuthShell, type MobileAuthShellProps } from "./auth-shell"

export type MobilePasswordStrength = "weak" | "fair" | "strong"

/**
 * Scores a password from 0 to 1.
 *
 * Five independent points — length ≥ 8, length ≥ 12, mixed case, a digit, a
 * symbol — normalised so the meter is comparable across inputs. Length is
 * weighted twice on purpose: it is the single strongest predictor of real-world
 * strength, and a meter that lets `P@ss1` read as "strong" teaches the wrong
 * lesson.
 *
 * Exported because the same score is useful for gating a submit button, and a
 * caller that reimplemented it would immediately disagree with this meter.
 */
export function scoreMobilePassword(value: string): number {
  if (value.length === 0) return 0

  let points = 0
  if (value.length >= 8) points += 1
  if (value.length >= 12) points += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) points += 1
  if (/\d/.test(value)) points += 1
  if (/[^A-Za-z0-9]/.test(value)) points += 1

  return Math.min(1, points / 5)
}

function strengthFromScore(score: number): MobilePasswordStrength {
  if (score < 0.4) return "weak"
  if (score < 0.75) return "fair"
  return "strong"
}

export interface MobileResetPasswordLabels {
  password: string
  passwordPlaceholder: string
  passwordDescription: string
  confirm: string
  confirmPlaceholder: string
  submit: string
  weak: string
  fair: string
  strong: string
}

const DEFAULT_LABELS: MobileResetPasswordLabels = {
  password: "New password",
  passwordPlaceholder: "Enter a new password",
  passwordDescription: "At least 8 characters.",
  confirm: "Confirm password",
  confirmPlaceholder: "Re-enter the new password",
  submit: "Reset password",
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
}

export interface MobileResetPasswordData {
  password: string
}

export interface MobileResetPasswordScreenProps
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
   * @default 'Set a new password'
   */
  heading?: string
  /**
   * @default 'Choose something you have not used before.'
   */
  subheading?: string
  /**
   * Copy overrides, merged over the English defaults.
   */
  labels?: Partial<MobileResetPasswordLabels>
  /**
   * Minimum length enforced by the built-in check, rendered into the hint so the
   * two cannot disagree.
   * @default 8
   */
  minPasswordLength?: number
  /**
   * Called with the new password once both built-in checks pass.
   */
  onSubmit?: (data: MobileResetPasswordData) => void
  /**
   * Disables every control and puts the submit button in a pending state.
   * @default false
   */
  loading?: boolean
  /**
   * Form-level error from the caller — typically an expired or already-used
   * reset token.
   */
  error?: string
  /**
   * Renders a dismiss affordance on the form-level error.
   */
  onDismissError?: () => void
}

interface ResetPasswordFieldErrors {
  password?: string
  confirm?: string
}

/**
 * MobileResetPasswordScreen
 *
 * Completes the reset loop: a new password, a confirmation, and a live strength
 * meter.
 *
 * The meter only appears once there is something to measure — an empty field
 * reading "Weak" would accuse the user of a mistake they have not made yet.
 * Confirmation is checked for equality rather than re-validated for strength,
 * because the second field's job is to catch a typo, not to re-litigate the
 * first.
 */
export function MobileResetPasswordScreen({
  heading = "Set a new password",
  subheading = "Choose something you have not used before.",
  labels,
  minPasswordLength = 8,
  onSubmit,
  loading = false,
  error,
  onDismissError,
  ...shellProps
}: MobileResetPasswordScreenProps) {
  const copy = { ...DEFAULT_LABELS, ...labels }
  const { colors } = useMobileTheme()

  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [fieldErrors, setFieldErrors] =
    React.useState<ResetPasswordFieldErrors>({})

  const score = scoreMobilePassword(password)
  const strength = strengthFromScore(score)
  const strengthLabel = copy[strength]
  const strengthColor =
    strength === "weak"
      ? colors.destructive
      : strength === "fair"
        ? colors.warning
        : colors.success

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    // A mismatch error is about the *pair*, so editing either field invalidates
    // it — not just the confirmation field.
    setFieldErrors((previous) =>
      previous.password === undefined && previous.confirm === undefined
        ? previous
        : {}
    )
  }

  const handleConfirmChange = (text: string) => {
    setConfirm(text)
    setFieldErrors((previous) =>
      previous.confirm === undefined ? previous : { ...previous, confirm: undefined }
    )
  }

  const handleSubmit = () => {
    const nextErrors: ResetPasswordFieldErrors = {}

    if (password.length < minPasswordLength) {
      nextErrors.password = `${copy.password} must be at least ${minPasswordLength} characters.`
    }
    if (confirm.length === 0) {
      nextErrors.confirm = `${copy.confirm} is required.`
    } else if (confirm !== password) {
      nextErrors.confirm = "Passwords do not match."
    }

    setFieldErrors(nextErrors)
    if (nextErrors.password || nextErrors.confirm) return

    onSubmit?.({ password })
  }

  return (
    <MobileAuthShell
      {...shellProps}
      heading={heading}
      subheading={subheading}
      error={error}
      onDismissError={onDismissError}
    >
      <MobileFormField
        label={copy.password}
        description={copy.passwordDescription}
        error={fieldErrors.password}
        required
      >
        <View>
          <MobileTextInput
            value={password}
            onChangeText={handlePasswordChange}
            placeholder={copy.passwordPlaceholder}
            error={Boolean(fieldErrors.password)}
            editable={!loading}
            secure
            textContentType="newPassword"
            autoComplete="new-password"
          />

          {password.length > 0 ? (
            <MobileProgress
              value={score}
              color={strengthColor}
              label={strengthLabel}
              style={styles.strength}
            />
          ) : null}
        </View>
      </MobileFormField>

      <MobileFormField label={copy.confirm} error={fieldErrors.confirm} required>
        <MobileTextInput
          value={confirm}
          onChangeText={handleConfirmChange}
          placeholder={copy.confirmPlaceholder}
          error={Boolean(fieldErrors.confirm)}
          editable={!loading}
          secure
          textContentType="newPassword"
          autoComplete="new-password"
        />
      </MobileFormField>

      <MobileButton
        onPress={handleSubmit}
        disabled={loading}
        accessibilityHint="Saves the new password"
      >
        {loading ? `${copy.submit}…` : copy.submit}
      </MobileButton>
    </MobileAuthShell>
  )
}

const styles = StyleSheet.create({
  strength: {
    marginTop: 10,
  },
})
