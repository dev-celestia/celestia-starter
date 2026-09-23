import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { AuthShell } from "./auth-shell"
import { Button } from "../primitive/button"
import { Input } from "../primitive/input"
import { Label } from "../primitive/label"

export interface ForgotPasswordPageProps extends Omit<React.ComponentProps<typeof AuthShell>, "heading" | "children" | "onSubmit"> {
  heading?: string
  subheading?: string
  emailLabel?: string
  emailPlaceholder?: string
  submitLabel?: string
  backLabel?: string
  onBack?: () => void
  onSubmit?: (data: { email: string }) => void
  /** Rendered instead of the form once the request has been sent. */
  sentMessage?: string
  sent?: boolean
  loading?: boolean
  error?: string
}

function ForgotPasswordPage({
  heading = "Forgot your password?",
  subheading = "Enter your email and we'll send you a reset link",
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  submitLabel = "Send reset link",
  backLabel = "Back to sign in",
  onBack,
  onSubmit,
  sentMessage = "Check your inbox — we've sent a reset link to your email.",
  sent = false,
  loading = false,
  error,
  className,
  ...shellProps
}: ForgotPasswordPageProps) {
  const [email, setEmail] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({ email })
  }

  return (
    <AuthShell
      heading={heading}
      subheading={sent ? undefined : subheading}
      className={cn(className)}
      footer={
        onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-primary font-medium hover:underline"
          >
            {backLabel}
          </button>
        ) : undefined
      }
      {...shellProps}
    >
      {sent ? (
        <div className="bg-muted/50 text-muted-foreground rounded-md px-4 py-3 text-center text-sm">
          {sentMessage}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email">{emailLabel}</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : submitLabel}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

export { ForgotPasswordPage }