import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import { Separator } from "../primitive/separator"

export interface AuthShellProps extends React.ComponentProps<"div"> {
  /** Brand mark rendered above the form (logo, icon, wordmark). */
  logo?: React.ReactNode
  heading: string
  subheading?: string
  /** Slot for social / SSO providers, rendered above the divider. */
  aside?: React.ReactNode
  /** Footer text, typically a "Don't have an account? Sign up" link. */
  footer?: React.ReactNode
  /** Optional side panel for split-screen variant. */
  sidePanel?: React.ReactNode
  /** Layout variant: centered card or split screen. */
  variant?: "centered" | "split"
  /** Max width of the form column. */
  maxWidth?: "sm" | "md" | "lg"
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const

function AuthShell({
  logo,
  heading,
  subheading,
  aside,
  footer,
  sidePanel,
  variant = "centered",
  maxWidth = "sm",
  className,
  children,
  ...props
}: AuthShellProps) {
  if (variant === "split") {
    return (
      <div
        data-slot="auth-shell"
        data-variant="split"
        className={cn("bg-background flex min-h-svh w-full", className)}
        {...props}
      >
        {/* Side panel — hidden on mobile */}
        {sidePanel && (
          <aside className="bg-muted/30 border-border relative hidden w-1/2 border-r lg:block">
            {sidePanel}
          </aside>
        )}
        {/* Form column */}
        <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className={cn("w-full", maxWidthMap[maxWidth])}>
            <AuthShellContent
              logo={logo}
              heading={heading}
              subheading={subheading}
              aside={aside}
              footer={footer}
            >
              {children}
            </AuthShellContent>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      data-slot="auth-shell"
      data-variant="centered"
      className={cn(
        "bg-background flex min-h-svh flex-col items-center justify-center p-6 sm:p-10",
        className
      )}
      {...props}
    >
      <div className={cn("w-full", maxWidthMap[maxWidth])}>
        <AuthShellContent
          logo={logo}
          heading={heading}
          subheading={subheading}
          aside={aside}
          footer={footer}
        >
          {children}
        </AuthShellContent>
      </div>
    </div>
  )
}

function AuthShellContent({
  logo,
  heading,
  subheading,
  aside,
  footer,
  children,
}: Pick<AuthShellProps, "logo" | "heading" | "subheading" | "aside" | "footer"> & {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      {logo && <div className="flex justify-center">{logo}</div>}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          {heading}
        </h1>
        {subheading && (
          <p className="text-muted-foreground text-sm">{subheading}</p>
        )}
      </div>
      {aside && <div className="flex flex-col gap-3">{aside}</div>}
      {aside && <Separator />}
      {children}
      {footer && (
        <p className="text-muted-foreground text-center text-sm">
          {footer}
        </p>
      )}
    </div>
  )
}

export { AuthShell }