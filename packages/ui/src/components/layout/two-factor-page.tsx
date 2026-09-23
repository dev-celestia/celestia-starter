import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { AuthShell } from "./auth-shell"
import { Button } from "../primitive/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../primitive/input-otp"

export interface TwoFactorPageProps extends Omit<React.ComponentProps<typeof AuthShell>, "heading" | "children" | "onSubmit"> {
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
            className="text-primary font-medium hover:underline"
          >
            {backLabel}
          </button>
        ) : undefined
      }
      {...shellProps}
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        {error && (
          <div className="bg-destructive/10 text-destructive w-full rounded-md px-3 py-2 text-sm">
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
        <p className="text-muted-foreground text-sm">
          {resendHint ?? (
            onResend ? (
              <button
                type="button"
                onClick={onResend}
                className="text-primary font-medium hover:underline"
              >
                {resendLabel}
              </button>
            ) : null
          )}
        </p>
      </form>
    </AuthShell>
  )
}

export { TwoFactorPage }