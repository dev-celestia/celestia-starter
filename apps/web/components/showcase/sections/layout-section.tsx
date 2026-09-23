"use client"

import * as React from "react"
import {
  MoonStarsIcon,
  GoogleLogoIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react"
import {
  AuthShell,
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  TwoFactorPage,
  PageShell,
  NotFoundPage,
  Badge,
  Button,
} from "@celestia-project/ui"
import { ShowcaseCard } from "../showcase-card"

const noop = () => undefined

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", icon: <GoogleLogoIcon className="size-4" /> },
  { id: "github", label: "GitHub", icon: <GithubLogoIcon className="size-4" /> },
]

const PROJECT_ROWS = [
  { name: "Atlas API", meta: "Deployed 12 minutes ago", status: "Live" },
  { name: "Nebula Web", meta: "Build queued", status: "Building" },
  { name: "Comet CLI", meta: "Last release v2.4.1", status: "Stable" },
  { name: "Orbit Mobile", meta: "Review pending", status: "Draft" },
]

function BrandMark() {
  return (
    <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
      <MoonStarsIcon className="size-5" weight="fill" />
    </div>
  )
}

const AUTH_SHELL_CODE = `import * as React from "react"
import { AuthShell, Button } from "@celestia-project/ui"

export function AuthShellDemo() {
  return (
    <AuthShell
      variant="split"
      maxWidth="md"
      logo={<BrandMark />}
      heading="Welcome back"
      subheading="Sign in to your account to continue"
      aside={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">Google</Button>
          <Button variant="outline" className="w-full">GitHub</Button>
        </div>
      }
      sidePanel={
        <div className="flex h-full flex-col justify-end p-10">
          <blockquote className="text-lg font-medium leading-snug">
            Ship faster with a system that already agrees.
          </blockquote>
        </div>
      }
      footer={
        <>
          Don't have an account?{" "}
          <a href="/sign-up" className="text-primary font-medium hover:underline">
            Sign up
          </a>
        </>
      }
    >
      <form>{/* email + password fields */}</form>
    </AuthShell>
  )
}`

const SIGN_IN_CODE = `import * as React from "react"
import { SignInPage } from "@celestia-project/ui"

export function SignInDemo() {
  return (
    <SignInPage
      socialProviders={[
        { id: "google", label: "Google" },
        { id: "github", label: "GitHub" },
      ]}
      onSocialProviderClick={(provider) => {
        // route to your Better Auth social sign-in
        console.log(provider.id)
      }}
      onForgotPassword={() => {
        // router.push("/forgot-password")
      }}
      onSignUp={() => {
        // router.push("/sign-up")
      }}
      onSubmit={({ email, password, remember }) => {
        // auth.signIn.email({ email, password, rememberMe: remember })
      }}
      loading={false}
      error={undefined}
    />
  )
}`

const SIGN_UP_CODE = `import * as React from "react"
import { SignUpPage } from "@celestia-project/ui"

export function SignUpDemo() {
  return (
    <SignUpPage
      termsLabel="I agree to the terms and privacy policy"
      onSignIn={() => {
        // router.push("/sign-in")
      }}
      onSubmit={({ name, email, password }) => {
        // auth.signUp.email({ name, email, password })
      }}
    />
  )
}`

const FORGOT_CODE = `import * as React from "react"
import { ForgotPasswordPage } from "@celestia-project/ui"

export function ForgotPasswordDemo() {
  const [sent, setSent] = React.useState(false)

  return (
    <ForgotPasswordPage
      sent={sent}
      onSubmit={({ email }) => {
        // auth.forgetPassword({ email })
        setSent(true)
      }}
      onBack={() => setSent(false)}
    />
  )
}`

const RESET_CODE = `import * as React from "react"
import { ResetPasswordPage } from "@celestia-project/ui"

export function ResetPasswordDemo() {
  return (
    <ResetPasswordPage
      onSubmit={({ password }) => {
        // auth.resetPassword({ password, token })
      }}
      loading={false}
    />
  )
}`

const TWO_FACTOR_CODE = `import * as React from "react"
import { TwoFactorPage } from "@celestia-project/ui"

export function TwoFactorDemo() {
  return (
    <TwoFactorPage
      length={6}
      onBack={() => {
        // router.push("/sign-in")
      }}
      onResend={() => {
        // auth.sendTwoFactorCode()
      }}
      onSubmit={({ code }) => {
        // auth.verifyTwoFactor({ code })
      }}
    />
  )
}`

const PAGE_SHELL_CODE = `import * as React from "react"
import { PageShell, Button } from "@celestia-project/ui"

export function PageShellDemo() {
  return (
    <PageShell
      title="Projects"
      description="Everything your team is building this quarter."
      width="lg"
      stickyHeader
      actions={
        <>
          <Button variant="outline">Import</Button>
          <Button>New project</Button>
        </>
      }
    >
      {/* scrollable page content */}
    </PageShell>
  )
}`

const NOT_FOUND_CODE = `import * as React from "react"
import { NotFoundPage } from "@celestia-project/ui"

export function NotFoundDemo() {
  return (
    <NotFoundPage
      code="404"
      title="Page not found"
      actionLabel="Go home"
      onAction={() => {
        // router.push("/")
      }}
      secondaryLabel="Contact support"
      onSecondaryAction={() => {
        // router.push("/support")
      }}
    />
  )
}`

export function LayoutSection() {
  const [authVariant, setAuthVariant] = React.useState<"centered" | "split">("centered")
  const [signInLoading, setSignInLoading] = React.useState(false)
  const [resetSent, setResetSent] = React.useState(false)

  const handleSignIn = () => {
    setSignInLoading(true)
    window.setTimeout(() => setSignInLoading(false), 1200)
  }

  return (
    <div id="layout" className="flex flex-col gap-6 pt-6 pb-16">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Layout & Pages
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          8 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Auth Shell */}
        <ShowcaseCard
          id="auth-shell"
          title="Auth Shell"
          category="Layout"
          description="Authentication page frame with logo, heading, provider aside, footer, and centered or split-screen variants."
          importSnippet={`import { AuthShell } from "@celestia-project/ui"`}
          codeExample={AUTH_SHELL_CODE}
          className="md:col-span-2"
        >
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center gap-1 self-center">
              <Button
                variant={authVariant === "centered" ? "secondary" : "ghost"}
                size="xs"
                className="h-6 text-[11px]"
                onClick={() => setAuthVariant("centered")}
              >
                Centered
              </Button>
              <Button
                variant={authVariant === "split" ? "secondary" : "ghost"}
                size="xs"
                className="h-6 text-[11px]"
                onClick={() => setAuthVariant("split")}
              >
                Split
              </Button>
            </div>
            <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
              <AuthShell
                className="h-full min-h-0"
                variant={authVariant}
                maxWidth="sm"
                logo={<BrandMark />}
                heading="Celestia"
                subheading="The design system that ships itself."
                aside={
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                      <GoogleLogoIcon className="size-4" />
                      Google
                    </Button>
                    <Button variant="outline" className="w-full">
                      <GithubLogoIcon className="size-4" />
                      GitHub
                    </Button>
                  </div>
                }
                sidePanel={
                  <div className="flex h-full flex-col justify-end gap-3 p-10">
                    <blockquote className="text-foreground text-lg font-medium leading-snug tracking-tight">
                      “Celestia cut our design-to-ship time in half.”
                    </blockquote>
                    <p className="text-muted-foreground text-sm">
                      Ada Lin — Head of Product, Northwind
                    </p>
                  </div>
                }
                footer={
                  <>
                    By continuing you agree to our{" "}
                    <span className="text-foreground font-medium">Terms of Service</span>
                  </>
                }
              >
                <Button className="w-full">Continue with email</Button>
              </AuthShell>
            </div>
          </div>
        </ShowcaseCard>

        {/* 2. Sign In Page */}
        <ShowcaseCard
          id="sign-in-page"
          title="Sign In Page"
          category="Layout"
          description="Ready-made credential sign-in with social providers, remember-me, error and loading states."
          importSnippet={`import { SignInPage } from "@celestia-project/ui"`}
          codeExample={SIGN_IN_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <SignInPage
              className="h-full min-h-0"
              socialProviders={SOCIAL_PROVIDERS}
              onSocialProviderClick={noop}
              onForgotPassword={noop}
              onSignUp={noop}
              onSubmit={handleSignIn}
              loading={signInLoading}
            />
          </div>
        </ShowcaseCard>

        {/* 3. Sign Up Page */}
        <ShowcaseCard
          id="sign-up-page"
          title="Sign Up Page"
          category="Layout"
          description="Registration screen with name, email, password confirmation, terms gate and mismatch validation."
          importSnippet={`import { SignUpPage } from "@celestia-project/ui"`}
          codeExample={SIGN_UP_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <SignUpPage
              className="h-full min-h-0"
              termsLabel="I agree to the terms and privacy policy"
              onSignIn={noop}
              onSubmit={noop}
            />
          </div>
        </ShowcaseCard>

        {/* 4. Forgot Password Page */}
        <ShowcaseCard
          id="forgot-password-page"
          title="Forgot Password Page"
          category="Layout"
          description="Email recovery request that swaps to a confirmation state once the reset link has been sent."
          importSnippet={`import { ForgotPasswordPage } from "@celestia-project/ui"`}
          codeExample={FORGOT_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <ForgotPasswordPage
              className="h-full min-h-0"
              sent={resetSent}
              onSubmit={() => setResetSent(true)}
              onBack={() => setResetSent(false)}
            />
          </div>
        </ShowcaseCard>

        {/* 5. Reset Password Page */}
        <ShowcaseCard
          id="reset-password-page"
          title="Reset Password Page"
          category="Layout"
          description="New-password form with live confirmation matching and a disabled submit until the pair agrees."
          importSnippet={`import { ResetPasswordPage } from "@celestia-project/ui"`}
          codeExample={RESET_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <ResetPasswordPage className="h-full min-h-0" onSubmit={noop} />
          </div>
        </ShowcaseCard>

        {/* 6. Two-Factor Page */}
        <ShowcaseCard
          id="two-factor-page"
          title="Two-Factor Page"
          category="Layout"
          description="OTP challenge built on InputOTP with configurable length, resend link and back navigation."
          importSnippet={`import { TwoFactorPage } from "@celestia-project/ui"`}
          codeExample={TWO_FACTOR_CODE}
        >
          <div className="h-[30rem] w-full overflow-hidden rounded-lg border border-border">
            <TwoFactorPage
              className="h-full min-h-0"
              onBack={noop}
              onResend={noop}
              onSubmit={noop}
            />
          </div>
        </ShowcaseCard>

        {/* 7. Page Shell */}
        <ShowcaseCard
          id="page-shell"
          title="Page Shell"
          category="Layout"
          description="App page frame with blurred sticky header, title, description, trailing actions and width presets."
          importSnippet={`import { PageShell } from "@celestia-project/ui"`}
          codeExample={PAGE_SHELL_CODE}
          className="md:col-span-2"
        >
          <div className="h-80 w-full overflow-hidden rounded-lg border border-border bg-background">
            <PageShell
              className="h-full"
              title="Projects"
              description="Everything your team is building this quarter."
              width="lg"
              actions={
                <>
                  <Button variant="outline" size="sm">
                    Import
                  </Button>
                  <Button size="sm">New project</Button>
                </>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {PROJECT_ROWS.map((row) => (
                  <div
                    key={row.name}
                    className="rounded-lg border border-border/70 bg-card p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {row.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                        {row.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{row.meta}</p>
                  </div>
                ))}
              </div>
            </PageShell>
          </div>
        </ShowcaseCard>

        {/* 8. Not Found Page */}
        <ShowcaseCard
          id="not-found-page"
          title="Not Found Page"
          category="Layout"
          description="404 state with oversized status code, optional icon slot, and primary and secondary calls to action."
          importSnippet={`import { NotFoundPage } from "@celestia-project/ui"`}
          codeExample={NOT_FOUND_CODE}
        >
          <div className="h-72 w-full overflow-hidden rounded-lg border border-border">
            <NotFoundPage
              className="h-full min-h-0"
              onAction={noop}
              onSecondaryAction={noop}
              secondaryLabel="Contact support"
            />
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}