"use client"

import { useSession } from "@/lib/auth-client"
import { ProfileForm } from "@/components/dashboard/profile-form"

export default function SettingsPage() {
  const { data: session, isPending } = useSession()

  if (isPending || !session) return null

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings.
        </p>
      </div>
      <ProfileForm user={session.user} />
    </div>
  )
}
