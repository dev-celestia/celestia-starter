"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui"

import { useSession } from "@/lib/auth-client"
import { UsersManager } from "@/components/access/users-manager"

export default function UsersPage() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Client-side gate. The real enforcement happens on the backend
  // (requirePermission + ABAC policies) — this only shapes the UI.
  if (session?.user.role !== "admin") {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Admins only</CardTitle>
            <CardDescription>
              User management requires the admin role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              If you believe this is a mistake, ask an administrator to grant
              you the admin role.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <UsersManager currentUserId={session.user.id} />
}
