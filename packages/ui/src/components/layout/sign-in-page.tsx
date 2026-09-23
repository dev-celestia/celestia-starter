import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { AuthShell } from "./auth-shell"
import { Button } from "../primitive/button"
import { Input } from "../primitive/input"
import { Label } from "../primitive/label"
import { Separator } from "../primitive/separator"

export interface SocialProvider {
  id: string
  label: string
  icon?: React.ReactNode
}

export interface SignInPageProps extends Omit<React.ComponentProps<typeof AuthShell>, "heading" | "children" | "onSubmit"> {
  heading?: string
  subheading?: string
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  passwordPlaceholder?: string
  submitLabel?: string
  rememberMeLabel?: string
  forgotPasswordLabel?: string
  onForgotPassword?: () => void
  signUpLabel?: string
  onSignUp?: () => void
  socialProviders?: SocialProvider[]
  onSocialProviderClick?: (provider: SocialProvider) => void
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void
  loading?: boolean
  error?: string
}

function SignInPage({
  heading = "Welcome back",
  subheading = "Sign in to your account to continue",
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  passwordLabel = "Password",
  passwordPlaceholder = "Enter your password",
  submitLabel = "Sign in",
  rememberMeLabel = "Remember me",
  forgotPasswordLabel = "Forgot password?",
  onForgotPassword,
  signUpLabel = "Don't have an account?",
  onSignUp,
  socialProviders,
  onSocialProviderClick,
  onSubmit,
  loading = false,
  error,
  className,
  ...shellProps
}: SignInPageProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({ email, password, remember })
  }

  return (
    <AuthShell
      heading={heading}
      subheading={subheading}
      className={cn(className)}
      aside={
        socialProviders && socialProviders.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {socialProviders.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                type="button"
                onClick={() => onSocialProviderClick?.(p)}
                className="w-full"
              >
                {p.icon}
                {p.label}
              </Button>
            ))}
          </div>
        ) : undefined
      }
      footer={
        onSignUp ? (
          <>
            {signUpLabel}{" "}
            <button
              type="button"
              onClick={onSignUp}
              className="text-primary font-medium hover:underline"
            >
              Sign up
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
          <Label htmlFor="signin-email">{emailLabel}</Label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder={emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password">{passwordLabel}</Label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-muted-foreground hover:text-primary text-xs transition-colors"
              >
                {forgotPasswordLabel}
              </button>
            )}
          </div>
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="accent-primary h-4 w-4 rounded"
          />
          {rememberMeLabel}
        </label>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : submitLabel}
        </Button>
      </form>
    </AuthShell>
  )
}

export { SignInPage }