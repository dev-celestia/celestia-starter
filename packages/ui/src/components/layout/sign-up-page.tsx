import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { AuthShell } from "./auth-shell"
import { Button } from "../primitive/button"
import { Input } from "../primitive/input"
import { Label } from "../primitive/label"

export interface SignUpPageProps extends Omit<React.ComponentProps<typeof AuthShell>, "heading" | "children" | "onSubmit"> {
  heading?: string
  subheading?: string
  nameLabel?: string
  namePlaceholder?: string
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  passwordPlaceholder?: string
  confirmPasswordLabel?: string
  confirmPasswordPlaceholder?: string
  submitLabel?: string
  termsLabel?: React.ReactNode
  onTermsChange?: (accepted: boolean) => void
  signInLabel?: string
  onSignIn?: () => void
  onSubmit?: (data: { name: string; email: string; password: string; confirmPassword: string; termsAccepted: boolean }) => void
  loading?: boolean
  error?: string
}

function SignUpPage({
  heading = "Create an account",
  subheading = "Start your journey with us today",
  nameLabel = "Full name",
  namePlaceholder = "Jane Doe",
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  passwordLabel = "Password",
  passwordPlaceholder = "Create a password",
  confirmPasswordLabel = "Confirm password",
  confirmPasswordPlaceholder = "Re-enter your password",
  submitLabel = "Sign up",
  termsLabel,
  onTermsChange,
  signInLabel = "Already have an account?",
  onSignIn,
  onSubmit,
  loading = false,
  error,
  className,
  ...shellProps
}: SignUpPageProps) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [termsAccepted, setTermsAccepted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return
    onSubmit?.({ name, email, password, confirmPassword, termsAccepted })
  }

  return (
    <AuthShell
      heading={heading}
      subheading={subheading}
      className={cn(className)}
      footer={
        onSignIn ? (
          <>
            {signInLabel}{" "}
            <button
              type="button"
              onClick={onSignIn}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </>
        ) : undefined
      }
      {...shellProps}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-name">{nameLabel}</Label>
          <Input
            id="signup-name"
            autoComplete="name"
            placeholder={namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-email">{emailLabel}</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-password">{passwordLabel}</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-confirm">{confirmPasswordLabel}</Label>
          <Input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            placeholder={confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-destructive text-xs">Passwords do not match</p>
          )}
        </div>
        {termsLabel && (
          <label className="text-muted-foreground flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked)
                onTermsChange?.(e.target.checked)
              }}
              className="accent-primary mt-0.5 h-4 w-4 rounded"
              required
            />
            <span>{termsLabel}</span>
          </label>
        )}
        <Button
          type="submit"
          disabled={loading || (termsLabel != null && !termsAccepted) || password !== confirmPassword}
          className="w-full"
        >
          {loading ? "Creating account..." : submitLabel}
        </Button>
      </form>
    </AuthShell>
  )
}

export { SignUpPage }