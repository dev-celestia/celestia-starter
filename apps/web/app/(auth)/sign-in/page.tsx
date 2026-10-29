"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GoogleLogo } from "@phosphor-icons/react"
import { Button, Input, Label } from "@celestia-project/ui"

import {
  AuthDivider,
  AuthError,
  AuthFooterLink,
  AuthHeading,
} from "@/components/auth/auth-chrome"
import { signIn } from "@/lib/auth-client"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get("callbackURL") ?? "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn.email({
      email,
      password,
      callbackURL,
    })

    if (error) {
      setError(error.message ?? "Something went wrong")
      setLoading(false)
    } else {
      router.push(callbackURL)
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthHeading
        title="Sign in"
        description="Enter your credentials to access your account"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <AuthError message={error} />

        {/* Sizing comes from the design system's `lg` step — the previous
            `h-8 w-full text-xs` re-declared the *default* size and clobbered
            its `text-xs/relaxed` line-height. */}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <AuthDivider />

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogleSignIn}
      >
        <GoogleLogo className="size-4" />
        Google
      </Button>

      <AuthFooterLink
        prompt="Don't have an account?"
        linkLabel="Sign up"
        href="/sign-up"
      />
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
