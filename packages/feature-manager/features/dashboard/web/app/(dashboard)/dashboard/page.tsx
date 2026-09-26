"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui"

import { useSession } from "@/lib/auth-client"

export default function DashboardPage() {
  const { data: session } = useSession()

  if (!session) return null

  const { user } = session

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
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
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Account security status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email verified</span>
              <span
                className={
                  user.emailVerified
                    ? "font-medium text-green-600"
                    : "font-medium text-amber-600"
                }
              >
                {user.emailVerified ? "Verified" : "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Two-factor</span>
              <span className="text-muted-foreground">Configurable</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Membership information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-[0.625rem]">{user.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
