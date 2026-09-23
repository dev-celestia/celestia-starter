"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui"

import { useSession } from "@/lib/auth-client"

/**
 * Label/value pair used across the overview cards. `shrink-0` on the label plus
 * `truncate` on the value keeps long emails and UUIDs from breaking the row —
 * previously the value had no `min-w-0`, so a long string pushed the label out
 * of the card instead of ellipsising.
 */
function StatRow({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{children}</span>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()

  if (!session) return null

  const { user } = session

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <StatRow label="Name">{user.name}</StatRow>
            <StatRow label="Email">{user.email}</StatRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Account security status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <StatRow label="Email verified">
              <span className={user.emailVerified ? "text-success" : "text-warning"}>
                {user.emailVerified ? "Verified" : "Pending"}
              </span>
            </StatRow>
            <StatRow label="Two-factor">
              <span className="font-normal text-muted-foreground">Configurable</span>
            </StatRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Membership information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <StatRow label="Member since">
              {new Date(user.createdAt).toLocaleDateString()}
            </StatRow>
            {/* Inherits the card's `text-xs/relaxed` size — the previous
                `text-[0.625rem]` (10px) was below the system's smallest step
                and unreadable for a 36-character UUID. */}
            <StatRow label="User ID">
              <span className="font-mono">{user.id}</span>
            </StatRow>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
