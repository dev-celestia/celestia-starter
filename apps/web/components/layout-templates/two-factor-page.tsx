"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { AuthShell } from "@celestia-project/ui/composite/auth-shell"
import { Button } from "@celestia-project/ui/primitive/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@celestia-project/ui/primitive/input-otp"

export interface TwoFactorPageProps extends Omit<
  React.ComponentProps<typeof AuthShell>,
  "heading" | "children" | "onSubmit"
> {
  heading?: string
  subheading?: string
  /** Number of code digits. */
  length?: number
  submitLabel?: string
  resendLabel?: string
  onResend?: () => void
  /** Rendered instead of the resend link when set. */
  resendHint?: React.ReactNode
  backLabel?: string
  onBack?: () => void
  onSubmit?: (data: { code: string }) => void
  loading?: boolean
  error?: string
}

function TwoFactorPage({
  heading = "Two-factor authentication",
  subheading = "Enter the 6-digit code from your authenticator app",
  length = 6,
  submitLabel = "Verify",
  resendLabel = "Resend code",
  onResend,
  resendHint,
  backLabel = "Back to sign in",
  onBack,
  onSubmit,
  loading = false,
  error,
  className,
  ...shellProps
}: TwoFactorPageProps) {
  const [code, setCode] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({ code })
  }

  return (
    <AuthShell
      heading={heading}
      subheading={subheading}
      className={cn(className)}
      footer={
        onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-primary hover:underline"
          >
            {backLabel}
          </button>
        ) : undefined
      }
      {...shellProps}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4"
      >
        {error && (
          <div className="w-full rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <InputOTP
          maxLength={length}
          value={code}
          onChange={setCode}
          containerClassName="justify-center"
        >
          <InputOTPGroup>
            {Array.from({ length }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button
          type="submit"
          disabled={loading || code.length < length}
          className="w-full"
        >
          {loading ? "Verifying..." : submitLabel}
        </Button>
        <p className="text-sm text-muted-foreground">
          {resendHint ??
            (onResend ? (
              <button
                type="button"
                onClick={onResend}
                className="font-medium text-primary hover:underline"
              >
                {resendLabel}
              </button>
            ) : null)}
        </p>
      </form>
    </AuthShell>
  )
}

export { TwoFactorPage }
