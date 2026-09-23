import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { AuthShell } from "./auth-shell"
import { Button } from "../primitive/button"
import { Input } from "../primitive/input"
import { Label } from "../primitive/label"

export interface ResetPasswordPageProps extends Omit<React.ComponentProps<typeof AuthShell>, "heading" | "children" | "onSubmit"> {
  heading?: string
  subheading?: string
  passwordLabel?: string
  passwordPlaceholder?: string
  confirmPasswordLabel?: string
  confirmPasswordPlaceholder?: string
  submitLabel?: string
  onSubmit?: (data: { password: string; confirmPassword: string }) => void
  loading?: boolean
  error?: string
}

function ResetPasswordPage({
  heading = "Set a new password",
  subheading = "Your new password must be different from previous ones",
  passwordLabel = "New password",
  passwordPlaceholder = "Enter new password",
  confirmPasswordLabel = "Confirm password",
  confirmPasswordPlaceholder = "Re-enter new password",
  submitLabel = "Reset password",
  onSubmit,
  loading = false,
  error,
  className,
  ...shellProps
}: ResetPasswordPageProps) {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mismatch) return
    onSubmit?.({ password, confirmPassword })
  }

  return (
    <AuthShell
      heading={heading}
      subheading={subheading}
      className={cn(className)}
      {...shellProps}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-password">{passwordLabel}</Label>
          <Input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-confirm">{confirmPasswordLabel}</Label>
          <Input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            placeholder={confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {mismatch && (
            <p className="text-destructive text-xs">Passwords do not match</p>
          )}
        </div>
        <Button type="submit" disabled={loading || mismatch} className="w-full">
          {loading ? "Resetting..." : submitLabel}
        </Button>
      </form>
    </AuthShell>
  )
}

export { ResetPasswordPage }