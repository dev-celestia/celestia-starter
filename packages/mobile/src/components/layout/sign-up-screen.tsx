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

export interface MobileSignUpData {
  name: string
  email: string
  password: string
  acceptedTerms: boolean
}

export interface MobileSignUpLabels {
  name: string
  namePlaceholder: string
  email: string
  emailPlaceholder: string
  password: string
  passwordPlaceholder: string
  passwordDescription: string
  terms: string
  submit: string
  signInPrompt: string
  signIn: string
}

const DEFAULT_LABELS: MobileSignUpLabels = {
  name: "Name",
  namePlaceholder: "Ada Lovelace",
  email: "Email",
  emailPlaceholder: "you@example.com",
  password: "Password",
  passwordPlaceholder: "Create a password",
  passwordDescription: "At least 8 characters.",
  terms: "I agree to the Terms of Service and Privacy Policy",
  submit: "Create account",
  signInPrompt: "Already have an account?",
  signIn: "Sign in",
}

export interface MobileSignUpScreenProps
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
   * @default 'Create your account'
   */
  heading?: string
  /**
   * @default 'It only takes a minute.'
   */
  subheading?: string
  /**
   * Copy overrides, merged over the English defaults.
   */
  labels?: Partial<MobileSignUpLabels>
  /**
   * Initial name value.
   * @default ''
   */
  defaultName?: string
  /**
   * Initial email value.
   * @default ''
   */
  defaultEmail?: string
  /**
   * Minimum password length enforced by the built-in check. Kept in sync with
   * the password description so the hint and the rule cannot disagree.
   * @default 8
   */
  minPasswordLength?: number
  /**
   * Federated providers. The whole section is omitted when empty.
   */
  socialProviders?: MobileSocialProvider[]
  /**
   * Called with the pressed provider.
   */
  onSocialProviderPress?: (provider: MobileSocialProvider) => void
  /**
   * Called with the new account details once the built-in checks pass.
   */
  onSubmit?: (data: MobileSignUpData) => void
  /**
   * Renders the sign-in affordance.
   */
  onSignIn?: () => void
  /**
   * Renders the terms-of-service affordance.
   */
  onTermsPress?: () => void
  /**
   * Renders the privacy-policy affordance.
   */
  onPrivacyPress?: () => void
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

interface SignUpFieldErrors {
  name?: string
  email?: string
  password?: string
  terms?: string
}

/**
 * MobileSignUpScreen
 *
 * Account creation: name, email, password and terms acceptance, with the same
 * optional federated providers as sign-in.
 *
 * Follows `MobileSignInScreen`'s rule that the submit button is never disabled
 * for an incomplete form — it stays pressable and names what is missing. The
 * password length rule comes from `minPasswordLength` and is rendered from the
 * same number, so the hint cannot drift from the check.
 */
export function MobileSignUpScreen({
  heading = "Create your account",
  subheading = "It only takes a minute.",
  labels,
  defaultName = "",
  defaultEmail = "",
  minPasswordLength = 8,
  socialProviders,
  onSocialProviderPress,
  onSubmit,
  onSignIn,
  onTermsPress,
  onPrivacyPress,
  loading = false,
  error,
  onDismissError,
  ...shellProps
}: MobileSignUpScreenProps) {
  const copy = { ...DEFAULT_LABELS, ...labels }

  const [name, setName] = React.useState(defaultName)
  const [email, setEmail] = React.useState(defaultEmail)
  const [password, setPassword] = React.useState("")
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<SignUpFieldErrors>({})

  const clearFieldError = (field: keyof SignUpFieldErrors) => {
    setFieldErrors((previous) =>
      previous[field] === undefined
        ? previous
        : { ...previous, [field]: undefined }
    )
  }

  const handleSubmit = () => {
    const nextErrors: SignUpFieldErrors = {}

    if (name.trim().length === 0) {
      nextErrors.name = `${copy.name} is required.`
    }
    if (email.trim().length === 0) {
      nextErrors.email = `${copy.email} is required.`
    }
    if (password.length < minPasswordLength) {
      nextErrors.password = `${copy.password} must be at least ${minPasswordLength} characters.`
    }
    if (!acceptedTerms) {
      nextErrors.terms = "Please accept the terms to continue."
    }

    setFieldErrors(nextErrors)
    if (
      nextErrors.name ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.terms
    ) {
      return
    }

    onSubmit?.({
      name: name.trim(),
      email: email.trim(),
      password,
      acceptedTerms,
    })
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
            {copy.signInPrompt}
          </MobileText>
          <MobileLink onPress={onSignIn} disabled={!onSignIn}>
            {copy.signIn}
          </MobileLink>
        </View>
      }
    >
      <MobileFormField label={copy.name} error={fieldErrors.name} required>
        <MobileTextInput
          value={name}
          onChangeText={(text) => {
            setName(text)
            clearFieldError("name")
          }}
          placeholder={copy.namePlaceholder}
          error={Boolean(fieldErrors.name)}
          editable={!loading}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
      </MobileFormField>

      <MobileFormField label={copy.email} error={fieldErrors.email} required>
        <MobileTextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text)
            clearFieldError("email")
          }}
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

      <MobileFormField
        label={copy.password}
        description={copy.passwordDescription}
        error={fieldErrors.password}
        required
      >
        <MobileTextInput
          value={password}
          onChangeText={(text) => {
            setPassword(text)
            clearFieldError("password")
          }}
          placeholder={copy.passwordPlaceholder}
          error={Boolean(fieldErrors.password)}
          editable={!loading}
          secure
          textContentType="newPassword"
          autoComplete="new-password"
        />
      </MobileFormField>

      <MobileFormField error={fieldErrors.terms}>
        <MobileCheckbox
          checked={acceptedTerms}
          onCheckedChange={(next) => {
            setAcceptedTerms(next)
            if (next) clearFieldError("terms")
          }}
          label={copy.terms}
          error={Boolean(fieldErrors.terms)}
          disabled={loading}
        />
      </MobileFormField>

      {/* Two separate affordances, because a single link that silently opens one
          of two documents is a dead end for anyone who wants the other. */}
      <View style={styles.legalRow}>
        <MobileLink onPress={onTermsPress} disabled={!onTermsPress}>
          Terms of Service
        </MobileLink>
        <MobileLink onPress={onPrivacyPress} disabled={!onPrivacyPress}>
          Privacy Policy
        </MobileLink>
      </View>

      <MobileButton
        onPress={handleSubmit}
        disabled={loading}
        accessibilityHint="Creates the account"
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
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
})
